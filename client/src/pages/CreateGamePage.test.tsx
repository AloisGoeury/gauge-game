import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateGamePage } from "./CreateGamePage.js";

describe("CreateGamePage", () => {
  it("submits a create game payload", async () => {
    const onCreate = vi.fn();
    render(<CreateGamePage onBack={vi.fn()} onCreate={onCreate} />);
    await userEvent.type(screen.getByLabelText("Ton nom"), "Alice");
    await userEvent.click(screen.getByRole("button", { name: "Créer" }));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        playerName: "Alice",
        totalRounds: 6,
        firstClueGiver: "creator"
      })
    );
  });

  it("requires two custom themes and allows removing the default theme", async () => {
    const onCreate = vi.fn();
    render(<CreateGamePage onBack={vi.fn()} onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText("Ton nom"), "Alice");
    await userEvent.click(screen.getByRole("button", { name: "Personnalisé" }));
    await userEvent.click(screen.getByRole("button", { name: "Supprimer Un plat" }));
    await userEvent.click(screen.getByRole("button", { name: "Créer" }));
    expect(screen.getByText("2 thèmes personnalisés sont obligatoires.")).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText("Titre du thème"), "Un film");
    await userEvent.type(screen.getByLabelText("Label gauche"), "nul");
    await userEvent.type(screen.getByLabelText("Label droit"), "excellent");
    await userEvent.click(screen.getByRole("button", { name: "Ajouter le thème" }));
    await userEvent.type(screen.getByLabelText("Titre du thème"), "Un objet");
    await userEvent.type(screen.getByLabelText("Label gauche"), "court");
    await userEvent.type(screen.getByLabelText("Label droit"), "long");
    await userEvent.click(screen.getByRole("button", { name: "Ajouter le thème" }));
    await userEvent.click(screen.getByRole("button", { name: "Créer" }));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        themeMode: "custom",
        customThemes: [
          { title: "Un film", leftLabel: "nul", rightLabel: "excellent", allowPublic: false },
          { title: "Un objet", leftLabel: "court", rightLabel: "long", allowPublic: false }
        ]
      })
    );
  });
});
