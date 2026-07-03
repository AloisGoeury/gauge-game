import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlayerRoleBadge } from "./PlayerRoleBadge.js";

describe("PlayerRoleBadge", () => {
  it("shows the player role", () => {
    render(<PlayerRoleBadge role="clueGiver" />);
    expect(screen.getByText("Tu fais deviner")).toBeInTheDocument();
  });
});
