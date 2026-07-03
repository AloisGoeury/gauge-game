import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { RoomStatePayload, Round } from "@gauge-game/shared";
import { GamePage } from "./GamePage.js";

const baseRound: Round = {
  id: "round-1",
  index: 0,
  theme: {
    id: "theme-1",
    title: "Un objet",
    leftLabel: "court",
    rightLabel: "long",
    isPublic: false,
    isApproved: false
  },
  clueGiverPlayerId: "alice",
  guesserPlayerId: "bob",
  targetValue: 650,
  clue: null,
  guessValue: null,
  points: null,
  status: "waiting_for_clue"
};

function makeState(playerId: string, role: RoomStatePayload["role"]): RoomStatePayload {
  return {
    playerId,
    role,
    scoreZones: role === "clueGiver" ? { four: [645, 655], two: [625, 675], one: [600, 700] } : undefined,
    game: {
      id: "game",
      roomCode: "ABC123",
      status: "playing",
      totalRounds: 2,
      roundsPerClueGiver: 3,
      currentRoundIndex: 0,
      players: [
        { id: "alice", name: "Alice", score: 0, connected: true },
        { id: "bob", name: "Bob", score: 0, connected: true }
      ],
      rounds: [baseRound],
      themeMode: "custom",
      creatorPlayerId: "alice",
      firstClueGiverPlayerId: "alice",
      score: 0
    }
  };
}

describe("GamePage", () => {
  it("resets the clue input when the round changes", async () => {
    const state = makeState("alice", "clueGiver");
    const { rerender } = render(
      <GamePage
        state={state}
        round={baseRound}
        onSubmitClue={vi.fn()}
        onSubmitGuess={vi.fn()}
        onNextRound={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText("Indice"), "Ancien indice");
    expect(screen.getByLabelText("Indice")).toHaveValue("Ancien indice");

    rerender(
      <GamePage
        state={{ ...state, game: { ...state.game, currentRoundIndex: 1 } }}
        round={{ ...baseRound, id: "round-2", index: 1 }}
        onSubmitClue={vi.fn()}
        onSubmitGuess={vi.fn()}
        onNextRound={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Indice")).toHaveValue("");
  });

  it("resets the guess slider to the middle when the round changes", () => {
    const round: Round = { ...baseRound, status: "waiting_for_guess", clue: "stylo" };
    const state = makeState("bob", "guesser");
    const { rerender } = render(
      <GamePage
        state={state}
        round={round}
        onSubmitClue={vi.fn()}
        onSubmitGuess={vi.fn()}
        onNextRound={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("Position sur la jauge"), { target: { value: "740" } });
    expect(screen.getByLabelText("Position sur la jauge")).toHaveValue("740");

    rerender(
      <GamePage
        state={{ ...state, game: { ...state.game, currentRoundIndex: 1 } }}
        round={{ ...round, id: "round-2", index: 1 }}
        onSubmitClue={vi.fn()}
        onSubmitGuess={vi.fn()}
        onNextRound={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Position sur la jauge")).toHaveValue("500");
  });
});
