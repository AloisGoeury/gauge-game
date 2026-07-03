import { useState } from "react";
import type { RoomStatePayload } from "@gauge-game/shared";
import { SelectField } from "../components/SelectField.js";

export function LobbyPage({ state, onStart }: { state: RoomStatePayload; onStart: (firstClueGiverPlayerId: string) => void }) {
  const [first, setFirst] = useState(state.game.firstClueGiverPlayerId || state.playerId);
  const [shareStatus, setShareStatus] = useState("");
  const isCreator = state.game.creatorPlayerId === state.playerId;
  const shareUrl = buildShareUrl(state.game.roomCode);

  async function copyShareLink() {
    try {
      await copyText(shareUrl);
      setShareStatus("Lien copié.");
    } catch {
      setShareStatus("Copie impossible, sélectionne le lien.");
    }
  }

  async function shareGame() {
    const shareData = {
      title: "Gauge Game",
      text: `Rejoins ma partie Gauge Game avec le code ${state.game.roomCode}.`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await copyShareLink();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("Partage impossible, lien prêt à copier.");
    }
  }

  return (
    <section className="screen">
      <p className="eyebrow">Code à partager</p>
      <h1 className="room-code">{state.game.roomCode}</h1>
      <section className="panel stack">
        <label>
          Lien d'invitation
          <input readOnly value={shareUrl} onFocus={(event) => event.target.select()} />
        </label>
        <div className="share-actions">
          <button className="primary" type="button" onClick={shareGame}>
            Partager
          </button>
          <button className="secondary" type="button" onClick={copyShareLink}>
            Copier le lien
          </button>
        </div>
        {shareStatus ? <p className="form-note">{shareStatus}</p> : null}
      </section>
      <section className="panel stack">
        <h2>Joueurs</h2>
        {state.game.players.map((player) => (
          <div className="player-row" key={player.id}>
            <span>{player.name}</span>
            <span>{player.connected ? "connecté" : "hors ligne"}</span>
          </div>
        ))}
      </section>
      <section className="panel stack">
        <SelectField
          label="Premier à faire deviner"
          value={first}
          options={state.game.players.map((player) => ({ value: player.id, label: player.name }))}
          onChange={setFirst}
        />
        <button className="primary tall" disabled={!isCreator || state.game.players.length < 2} onClick={() => onStart(first)}>
          Lancer
        </button>
      </section>
    </section>
  );
}

function buildShareUrl(roomCode: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set("room", roomCode);
  url.hash = "";
  return url.toString();
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
