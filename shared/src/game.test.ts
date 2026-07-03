import { describe, expect, it } from "vitest";
import { selectRoleIds } from "./game.js";

describe("role selection", () => {
  const players = [{ id: "a" }, { id: "b" }];

  it("keeps the same clue giver for 3 rounds, then swaps", () => {
    expect(selectRoleIds(players, 0, 3, "a").clueGiverPlayerId).toBe("a");
    expect(selectRoleIds(players, 2, 3, "a").clueGiverPlayerId).toBe("a");
    expect(selectRoleIds(players, 3, 3, "a").clueGiverPlayerId).toBe("b");
    expect(selectRoleIds(players, 5, 3, "a").clueGiverPlayerId).toBe("b");
    expect(selectRoleIds(players, 6, 3, "a").clueGiverPlayerId).toBe("a");
  });
});
