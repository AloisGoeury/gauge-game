import { describe, expect, it } from "vitest";
import { createRoom, joinRoom, nextRound, startGame, submitClue, submitGuess } from "./gameStore.js";

describe("game store", () => {
  it("creates a playable two-player round and scores on the server", async () => {
    const creator = await createRoom({
      playerName: "Alice",
      totalRounds: 1,
      roundsPerClueGiver: 3,
      firstClueGiver: "creator",
      themeMode: "custom",
      customThemes: [
        { title: "Un plat", leftLabel: "nul", rightLabel: "excellent", allowPublic: false },
        { title: "Un objet", leftLabel: "court", rightLabel: "long", allowPublic: false }
      ]
    });
    const joined = joinRoom({ roomCode: creator.game.roomCode, playerName: "Bob" });
    const states = await startGame({ roomCode: creator.game.roomCode, firstClueGiverPlayerId: creator.playerId }, creator.playerId);
    const bobState = states.find((state) => state.playerId === joined.playerId);
    const aliceState = states.find((state) => state.playerId === creator.playerId);
    expect(bobState?.game.rounds[0].targetValue).toBeUndefined();
    expect(aliceState?.game.rounds[0].targetValue).toBeTypeOf("number");

    submitClue({ roomCode: creator.game.roomCode, clue: "Pizza froide" }, creator.playerId);
    const target = aliceState?.game.rounds[0].targetValue ?? 0;
    const scored = submitGuess({ roomCode: creator.game.roomCode, guessValue: target }, joined.playerId);
    expect(scored[0].game.score).toBe(4);
  });

  it("requires both players to accept before advancing", async () => {
    const creator = await createRoom({
      playerName: "Camille",
      totalRounds: 2,
      roundsPerClueGiver: 3,
      firstClueGiver: "creator",
      themeMode: "custom",
      customThemes: [
        { title: "Un objet", leftLabel: "court", rightLabel: "long", allowPublic: false },
        { title: "Un film", leftLabel: "lent", rightLabel: "rapide", allowPublic: false }
      ]
    });
    const joined = joinRoom({ roomCode: creator.game.roomCode, playerName: "Noa" });
    const states = await startGame({ roomCode: creator.game.roomCode, firstClueGiverPlayerId: creator.playerId }, creator.playerId);
    const target = states.find((state) => state.playerId === creator.playerId)?.game.rounds[0].targetValue ?? 500;

    submitClue({ roomCode: creator.game.roomCode, clue: "stylo" }, creator.playerId);
    submitGuess({ roomCode: creator.game.roomCode, guessValue: target }, joined.playerId);

    const afterOneReady = nextRound({ roomCode: creator.game.roomCode }, creator.playerId);
    expect(afterOneReady[0].game.currentRoundIndex).toBe(0);
    expect(afterOneReady[0].game.rounds[0].nextReadyPlayerIds).toContain(creator.playerId);

    const afterBothReady = nextRound({ roomCode: creator.game.roomCode }, joined.playerId);
    expect(afterBothReady[0].game.currentRoundIndex).toBe(1);
  });
});
