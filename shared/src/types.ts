export type ThemeMode = "random" | "custom";
export type GameStatus = "lobby" | "playing" | "finished";
export type RoundStatus = "waiting_for_clue" | "waiting_for_guess" | "revealed" | "complete";

export interface Theme {
  id: string;
  title: string;
  leftLabel: string;
  rightLabel: string;
  createdByPlayerName?: string | null;
  isPublic: boolean;
  isApproved: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  connected: boolean;
}

export interface ScoreZoneConfig {
  four: number;
  two: number;
  one: number;
}

export interface ScoreZones {
  four: [number, number];
  two: [number, number];
  one: [number, number];
}

export interface Round {
  id: string;
  index: number;
  theme: Theme;
  clueGiverPlayerId: string;
  guesserPlayerId: string;
  targetValue?: number;
  clue?: string | null;
  guessValue?: number | null;
  points?: number | null;
  nextReadyPlayerIds?: string[];
  status: RoundStatus;
}

export interface RoundSummary {
  index: number;
  themeTitle: string;
  clue?: string | null;
  targetValue?: number;
  guessValue?: number | null;
  points?: number | null;
  clueGiverName: string;
  guesserName: string;
}

export interface Game {
  id: string;
  roomCode: string;
  status: GameStatus;
  totalRounds: number;
  roundsPerClueGiver: number;
  currentRoundIndex: number;
  players: Player[];
  rounds: Round[];
  themeMode: ThemeMode;
  creatorPlayerId: string;
  firstClueGiverPlayerId?: string;
  score: number;
}

export interface CustomThemeInput {
  title: string;
  leftLabel: string;
  rightLabel: string;
  allowPublic: boolean;
}

export interface CreateRoomPayload {
  playerName: string;
  totalRounds: number;
  roundsPerClueGiver?: number;
  firstClueGiver: "creator" | "second";
  themeMode: ThemeMode;
  customThemes: CustomThemeInput[];
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
  playerId?: string;
}

export interface StartGamePayload {
  roomCode: string;
  firstClueGiverPlayerId?: string;
}

export interface SubmitCluePayload {
  roomCode: string;
  clue: string;
}

export interface SubmitGuessPayload {
  roomCode: string;
  guessValue: number;
}

export interface NextRoundPayload {
  roomCode: string;
}

export interface RoomStatePayload {
  game: Game;
  playerId: string;
  role: "clueGiver" | "guesser" | "waiting" | "spectator";
  scoreZones?: ScoreZones;
}

export interface ServerToClientEvents {
  "room:state": (payload: RoomStatePayload) => void;
  "round:reveal": (payload: RoomStatePayload) => void;
  "player:disconnect": (payload: { playerId: string }) => void;
  error: (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
  "room:create": (payload: CreateRoomPayload) => void;
  "room:join": (payload: JoinRoomPayload) => void;
  "game:start": (payload: StartGamePayload) => void;
  "round:submit-clue": (payload: SubmitCluePayload) => void;
  "round:submit-guess": (payload: SubmitGuessPayload) => void;
  "round:next": (payload: NextRoundPayload) => void;
}
