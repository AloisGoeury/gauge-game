import type { ScoreZones } from "@gauge-game/shared";
import { GAUGE_MAX, GAUGE_MIN } from "@gauge-game/shared";

interface GaugeProps {
  leftLabel: string;
  rightLabel: string;
  value: number;
  target?: number;
  scoreZones?: ScoreZones;
  interactive?: boolean;
  showGuessMarker?: boolean;
  onChange?: (value: number) => void;
}

export function Gauge({
  leftLabel,
  rightLabel,
  value,
  target,
  scoreZones,
  interactive = false,
  showGuessMarker = true,
  onChange
}: GaugeProps) {
  const percent = toPercent(value);
  const targetPercent = target === undefined ? undefined : toPercent(target);

  return (
    <section className="gauge" aria-label="Jauge">
      <div className="gauge-labels">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="gauge-track" data-testid="gauge-track">
        {scoreZones ? <Zone range={scoreZones.one} className="zone zone-one" /> : null}
        {scoreZones ? <Zone range={scoreZones.two} className="zone zone-two" /> : null}
        {scoreZones ? <Zone range={scoreZones.four} className="zone zone-four" /> : null}
        {targetPercent !== undefined ? <span className="target-marker" style={{ left: `${targetPercent}%` }} /> : null}
        {showGuessMarker ? <span className="guess-marker" style={{ left: `${percent}%` }} /> : null}
      </div>
      {interactive ? (
        <input
          aria-label="Position sur la jauge"
          className="gauge-input"
          type="range"
          min={GAUGE_MIN}
          max={GAUGE_MAX}
          value={value}
          onChange={(event) => onChange?.(Number(event.target.value))}
        />
      ) : null}
      {scoreZones ? (
        <div className="gauge-legend" aria-label="Légende de la jauge">
          <span><i className="legend-zone legend-zone-four" />4 pts</span>
          <span><i className="legend-zone legend-zone-two" />2 pts</span>
          <span><i className="legend-zone legend-zone-one" />1 pt</span>
          <span><i className="legend-target" />cible</span>
          {showGuessMarker ? <span><i className="legend-guess" />curseur</span> : null}
        </div>
      ) : null}
    </section>
  );
}

function Zone({ range, className }: { range: [number, number]; className: string }) {
  return (
    <span
      className={className}
      style={{
        left: `${toPercent(range[0])}%`,
        width: `${toPercent(range[1] - range[0])}%`
      }}
    />
  );
}

function toPercent(value: number): number {
  return Math.max(0, Math.min(100, (value / GAUGE_MAX) * 100));
}
