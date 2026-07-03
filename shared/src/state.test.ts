import { describe, expect, it } from "vitest";
import { filterGameForPlayer } from "./state.js";
import type { Game } from "./types.js";

const game: Game = {
  id: "game",
  roomCode: "ABC123",
  status: "playing",
  totalRounds: 1,
  roundsPerClueGiver: 3,
  currentRoundIndex: 0,
  themeMode: "custom",
  creatorPlayerId: "a",
  firstClueGiverPlayerId: "a",
  score: 0,
  players: [
    { id: "a", name: "Alice", score: 0, connected: true },
    { id: "b", name: "Bob", score: 0, connected: true }
  ],
  rounds: [
    {
      id: "round",
      index: 0,
      theme: { id: "theme", title: "Un plat", leftLabel: "nul", rightLabel: "excellent", isPublic: false, isApproved: false },
      clueGiverPlayerId: "a",
      guesserPlayerId: "b",
      targetValue: 455,
      status: "waiting_for_clue"
    }
  ]
};

describe("state filtering", () => {
  it("hides target from guesser before reveal", () => {
    expect(filterGameForPlayer(game, "b").game.rounds[0].targetValue).toBeUndefined();
  });

  it("shows target and score zones to clue giver", () => {
    const state = filterGameForPlayer(game, "a");
    expect(state.game.rounds[0].targetValue).toBe(455);
    expect(state.scoreZones?.four).toEqual([450, 460]);
  });
});
