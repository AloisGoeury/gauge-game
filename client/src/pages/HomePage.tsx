import { FormEvent, useState } from "react";

export function HomePage({
  initialRoomCode = "",
  onCreate,
  onJoin
}: {
  initialRoomCode?: string;
  onCreate: () => void;
  onJoin: (roomCode: string, playerName: string) => void;
}) {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [playerName, setPlayerName] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    onJoin(roomCode, playerName);
  }

  return (
    <section className="screen home-screen">
      <div className="brand-block">
        <span className="logo-mark">GG</span>
        <h1>Gauge Game</h1>
      </div>
      <button className="primary tall" onClick={onCreate}>
        Créer une partie
      </button>
      <form className="panel stack" onSubmit={submit}>
        {initialRoomCode ? <p className="form-note">Code de partie prérempli.</p> : null}
        <label>
          Ton nom
          <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Alex" />
        </label>
        <label>
          Code de partie
          <input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
          />
        </label>
        <button className="secondary" type="submit">
          Rejoindre
        </button>
      </form>
    </section>
  );
}
