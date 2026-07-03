import type { Theme } from "@gauge-game/shared";

export function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <section className="theme-card">
      <p className="eyebrow">Thème</p>
      <h1>{theme.title}</h1>
      <div className="theme-scale">
        <span>{theme.leftLabel}</span>
        <span>{theme.rightLabel}</span>
      </div>
    </section>
  );
}
