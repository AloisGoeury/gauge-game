import type { Round } from "@gauge-game/shared";

export function RoundResult({ round }: { round: Round }) {
  if (round.status !== "revealed" && round.status !== "complete") return null;
  return (
    <section className="round-result" aria-live="polite">
      <span className="eyebrow">Résultat</span>
      <strong>{round.points ?? 0} point{(round.points ?? 0) > 1 ? "s" : ""}</strong>
      <p>
        Cible {round.targetValue}, estimation {round.guessValue}
      </p>
    </section>
  );
}
