import { nanoid } from "nanoid";
import {
  calculatePoints,
  clampGaugeValue,
  filterGameForPlayer,
  generateTargetValue,
  selectRoleIds,
  validateClue,
  validatePlayerName,
  validateThemeList,
  type CreateRoomPayload,
  type CustomThemeInput,
  type Game,
  type JoinRoomPayload,
  type NextRoundPayload,
  type Player,
  type RoomStatePayload,
  type Round,
  type StartGamePayload,
  type SubmitCluePayload,
  type SubmitGuessPayload,
  type Theme
} from "@gauge-game/shared";
import { getApprovedPublicThemes, persistGameSnapshot, saveCustomThemes } from "./db.js";

interface Session {
  game: Game;
  customThemes: Theme[];
}

const sessions = new Map<string, Session>();
const socketToPlayer = new Map<string, { roomCode: string; playerId: string }>();

export function getSession(roomCode: string): Session | undefined {
  return sessions.get(roomCode.toUpperCase());
}

export function registerSocket(socketId: string, roomCode: string, playerId: string): void {
  socketToPlayer.set(socketId, { roomCode, playerId });
  const session = getSession(roomCode);
  const player = session?.game.players.find((candidate) => candidate.id === playerId);
  if (player) player.connected = true;
}

export function getSocketLink(socketId: string): { roomCode: string; playerId: string } | undefined {
  return socketToPlayer.get(socketId);
}

export function disconnectSocket(socketId: string): { roomCode: string; playerId: string } | undefined {
  const link = socketToPlayer.get(socketId);
  if (!link) return undefined;
  socketToPlayer.delete(socketId);
  const session = getSession(link.roomCode);
  const player = session?.game.players.find((candidate) => candidate.id === link.playerId);
  if (player) player.connected = false;
  return link;
}

export async function createRoom(payload: CreateRoomPayload): Promise<RoomStatePayload> {
  const playerName = validatePlayerName(payload.playerName);
  const totalRounds = Math.max(1, Math.min(24, Math.round(payload.totalRounds || 6)));
  const roundsPerClueGiver = Math.max(1, Math.min(12, Math.round(payload.roundsPerClueGiver || 3)));
  const customInputs = payload.themeMode === "custom" ? normalizeCustomThemes(payload.customThemes) : [];
  const customThemes = await saveCustomThemes(customInputs, playerName);
  const roomCode = createRoomCode();
  const player: Player = { id: crypto.randomUUID(), name: playerName, score: 0, connected: true };
  const game: Game = {
    id: crypto.randomUUID(),
    roomCode,
    status: "lobby",
    totalRounds,
    roundsPerClueGiver,
    currentRoundIndex: 0,
    themeMode: payload.themeMode,
    creatorPlayerId: player.id,
    firstClueGiverPlayerId: payload.firstClueGiver === "creator" ? player.id : undefined,
    score: 0,
    players: [player],
    rounds: []
  };
  sessions.set(roomCode, { game, customThemes });
  await persistGameSnapshot(game);
  return filterGameForPlayer(game, player.id);
}

export function joinRoom(payload: JoinRoomPayload): RoomStatePayload {
  const roomCode = payload.roomCode.toUpperCase().trim();
  const session = getSession(roomCode);
  if (!session) throw new Error("Partie introuvable.");
  const playerName = validatePlayerName(payload.playerName);
  let player = payload.playerId ? session.game.players.find((candidate) => candidate.id === payload.playerId) : undefined;
  if (!player) {
    if (session.game.players.length >= 2) throw new Error("Le MVP accepte 2 joueurs.");
    player = { id: crypto.randomUUID(), name: playerName, score: 0, connected: true };
    session.game.players.push(player);
    if (!session.game.firstClueGiverPlayerId) {
      session.game.firstClueGiverPlayerId = player.id;
    }
  }
  player.name = playerName;
  player.connected = true;
  void persistGameSnapshot(session.game);
  return filterGameForPlayer(session.game, player.id);
}

export async function startGame(payload: StartGamePayload, playerId: string): Promise<RoomStatePayload[]> {
  const session = requireSession(payload.roomCode);
  if (session.game.creatorPlayerId !== playerId) throw new Error("Seul le créateur peut lancer la partie.");
  if (session.game.players.length < 2) throw new Error("Il faut deux joueurs pour commencer.");
  const firstClueGiverPlayerId = payload.firstClueGiverPlayerId || session.game.firstClueGiverPlayerId || session.game.players[0].id;
  session.game.firstClueGiverPlayerId = firstClueGiverPlayerId;
  const themes = await resolveThemes(session);
  session.game.rounds = Array.from({ length: session.game.totalRounds }, (_, index) =>
    createRound(session.game, themes, index, firstClueGiverPlayerId)
  );
  session.game.status = "playing";
  session.game.currentRoundIndex = 0;
  await persistGameSnapshot(session.game);
  return statesForPlayers(session.game);
}

export function submitClue(payload: SubmitCluePayload, playerId: string): RoomStatePayload[] {
  const session = requireSession(payload.roomCode);
  const round = currentRound(session.game);
  if (round.clueGiverPlayerId !== playerId) throw new Error("Seul le joueur qui fait deviner peut envoyer l'indice.");
  if (round.status !== "waiting_for_clue") throw new Error("L'indice a déjà été envoyé.");
  round.clue = validateClue(payload.clue);
  round.status = "waiting_for_guess";
  void persistGameSnapshot(session.game);
  return statesForPlayers(session.game);
}

export function submitGuess(payload: SubmitGuessPayload, playerId: string): RoomStatePayload[] {
  const session = requireSession(payload.roomCode);
  const round = currentRound(session.game);
  if (round.guesserPlayerId !== playerId) throw new Error("Seul le joueur qui devine peut valider.");
  if (round.status !== "waiting_for_guess") throw new Error("Un indice est nécessaire avant de deviner.");
  round.guessValue = clampGaugeValue(payload.guessValue);
  round.points = calculatePoints(round.targetValue ?? 0, round.guessValue);
  round.status = "revealed";
  round.nextReadyPlayerIds = [];
  session.game.score += round.points;
  session.game.players.forEach((player) => {
    player.score = session.game.score;
  });
  void persistGameSnapshot(session.game);
  return statesForPlayers(session.game);
}

export function nextRound(payload: NextRoundPayload, playerId: string): RoomStatePayload[] {
  const session = requireSession(payload.roomCode);
  const round = currentRound(session.game);
  const canAdvance = round.clueGiverPlayerId === playerId || round.guesserPlayerId === playerId;
  if (!canAdvance) throw new Error("Vous ne pouvez pas avancer cette manche.");
  if (round.status !== "revealed") throw new Error("Il faut révéler le score avant de continuer.");
  round.nextReadyPlayerIds = [...new Set([...(round.nextReadyPlayerIds ?? []), playerId])];
  const requiredPlayerIds = [round.clueGiverPlayerId, round.guesserPlayerId];
  const everyoneReady = requiredPlayerIds.every((requiredPlayerId) => round.nextReadyPlayerIds?.includes(requiredPlayerId));
  if (!everyoneReady) {
    void persistGameSnapshot(session.game);
    return statesForPlayers(session.game);
  }
  round.status = "complete";
  if (session.game.currentRoundIndex >= session.game.totalRounds - 1) {
    session.game.status = "finished";
  } else {
    session.game.currentRoundIndex += 1;
  }
  void persistGameSnapshot(session.game);
  return statesForPlayers(session.game);
}

export function statesForRoom(roomCode: string): RoomStatePayload[] {
  const session = requireSession(roomCode);
  return statesForPlayers(session.game);
}

function statesForPlayers(game: Game): RoomStatePayload[] {
  return game.players.map((player) => filterGameForPlayer(game, player.id));
}

function currentRound(game: Game): Round {
  const round = game.rounds.find((candidate) => candidate.index === game.currentRoundIndex);
  if (!round) throw new Error("Manche introuvable.");
  return round;
}

function requireSession(roomCode: string): Session {
  const session = getSession(roomCode);
  if (!session) throw new Error("Partie introuvable.");
  return session;
}

function createRound(game: Game, themes: Theme[], index: number, firstClueGiverPlayerId: string): Round {
  const roles = selectRoleIds(game.players, index, game.roundsPerClueGiver, firstClueGiverPlayerId);
  const themeIndex = Math.floor(index / game.roundsPerClueGiver) % themes.length;
  return {
    id: crypto.randomUUID(),
    index,
    theme: themes[themeIndex],
    clueGiverPlayerId: roles.clueGiverPlayerId,
    guesserPlayerId: roles.guesserPlayerId,
    targetValue: generateTargetValue(),
    clue: null,
    guessValue: null,
    points: null,
    nextReadyPlayerIds: [],
    status: "waiting_for_clue"
  };
}

async function resolveThemes(session: Session): Promise<Theme[]> {
  if (session.game.themeMode === "custom") {
    if (session.customThemes.length === 0) throw new Error("Ajoutez au moins un thème personnalisé.");
    return session.customThemes;
  }
  const themes = await getApprovedPublicThemes();
  if (themes.length === 0) throw new Error("Aucun thème public approuvé disponible.");
  return themes;
}

function normalizeCustomThemes(inputs: CustomThemeInput[]): CustomThemeInput[] {
  return validateThemeList(inputs);
}

function createRoomCode(): string {
  let roomCode = nanoid(6).replace(/[-_]/g, "X").toUpperCase();
  while (sessions.has(roomCode)) {
    roomCode = nanoid(6).replace(/[-_]/g, "X").toUpperCase();
  }
  return roomCode;
}
