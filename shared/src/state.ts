import { buildScoreZones } from "./scoring.js";
import { getCurrentRound, getPlayerRole } from "./game.js";
import type { Game, RoomStatePayload } from "./types.js";

export function filterGameForPlayer(game: Game, playerId: string): RoomStatePayload {
  const role = getPlayerRole(game, playerId);
  const currentRound = getCurrentRound(game);
  const filteredRounds = game.rounds.map((round) => {
    const canSeeTarget = round.status === "revealed" || round.status === "complete" || round.clueGiverPlayerId === playerId;
    return {
      ...round,
      targetValue: canSeeTarget ? round.targetValue : undefined
    };
  });

  return {
    game: {
      ...game,
      rounds: filteredRounds
    },
    playerId,
    role,
    scoreZones:
      currentRound && currentRound.clueGiverPlayerId === playerId && currentRound.targetValue !== undefined
        ? buildScoreZones(currentRound.targetValue)
        : undefined
  };
}
