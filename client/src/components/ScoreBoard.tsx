import type { Game } from "@gauge-game/shared";

export function ScoreBoard({ game }: { game: Game }) {
  return (
    <section className="score-board" aria-label="Score">
      <div>
        <span className="eyebrow">Score équipe</span>
        <strong>{game.score}</strong>
      </div>
      <div>
        <span className="eyebrow">Manche</span>
        <strong>
          {Math.min(game.currentRoundIndex + 1, game.totalRounds)}/{game.totalRounds}
        </strong>
      </div>
    </section>
  );
}
