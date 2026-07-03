import type { RoomStatePayload } from "@gauge-game/shared";

export function EndPage({ state, onReplay }: { state: RoomStatePayload; onReplay: () => void }) {
  return (
    <section className="screen">
      <p className="eyebrow">Partie terminée</p>
      <h1>{state.game.score} points</h1>
      <section className="panel stack">
        {state.game.rounds.map((round) => {
          const clueGiver = state.game.players.find((player) => player.id === round.clueGiverPlayerId)?.name ?? "?";
          const guesser = state.game.players.find((player) => player.id === round.guesserPlayerId)?.name ?? "?";
          return (
            <div className="summary-row" key={round.id}>
              <strong>
                {round.index + 1}. {round.theme.title}
              </strong>
              <span>
                {clueGiver} → {guesser}: {round.points ?? 0} pt
              </span>
            </div>
          );
        })}
      </section>
      <button className="primary tall" onClick={onReplay}>
        Rejouer
      </button>
    </section>
  );
}
