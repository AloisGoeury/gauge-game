import type { Game, Player, Round } from "./types.js";

export function selectRoleIds(
  players: Pick<Player, "id">[],
  roundIndex: number,
  roundsPerClueGiver: number,
  firstClueGiverPlayerId?: string
): { clueGiverPlayerId: string; guesserPlayerId: string } {
  if (players.length < 2) throw new Error("Deux joueurs sont nécessaires.");
  const firstIndex = Math.max(0, players.findIndex((player) => player.id === firstClueGiverPlayerId));
  const block = Math.floor(roundIndex / roundsPerClueGiver);
  const clueGiverIndex = (firstIndex + block) % 2;
  const guesserIndex = (clueGiverIndex + 1) % 2;
  return {
    clueGiverPlayerId: players[clueGiverIndex].id,
    guesserPlayerId: players[guesserIndex].id
  };
}

export function getCurrentRound(game: Game): Round | undefined {
  return game.rounds.find((round) => round.index === game.currentRoundIndex);
}

export function getPlayerRole(
  game: Game,
  playerId: string
): "clueGiver" | "guesser" | "waiting" | "spectator" {
  const currentRound = getCurrentRound(game);
  if (game.status === "lobby") return "waiting";
  if (!game.players.some((player) => player.id === playerId)) return "spectator";
  if (!currentRound) return "waiting";
  if (currentRound.clueGiverPlayerId === playerId) return "clueGiver";
  if (currentRound.guesserPlayerId === playerId) return "guesser";
  return "spectator";
}
