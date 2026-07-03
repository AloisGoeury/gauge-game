import { useState } from "react";
import type { CustomThemeInput } from "@gauge-game/shared";
import { validateTheme } from "@gauge-game/shared";

export function CreateThemeForm({ onAdd }: { onAdd: (theme: CustomThemeInput) => void }) {
  const [theme, setTheme] = useState<CustomThemeInput>({
    title: "",
    leftLabel: "",
    rightLabel: "",
    allowPublic: false
  });
  const [error, setError] = useState("");

  function addTheme() {
    try {
      const validTheme = validateTheme(theme);
      onAdd(validTheme);
      setTheme({ title: "", leftLabel: "", rightLabel: "", allowPublic: false });
      setError("");
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Thème invalide.");
    }
  }

  return (
    <div className="theme-form">
      <label>
        Thème
        <input
          aria-label="Titre du thème"
          placeholder="Un film"
          value={theme.title}
          onChange={(event) => setTheme({ ...theme, title: event.target.value })}
        />
      </label>
      <div className="field-row">
        <label>
          Gauche
          <input
            aria-label="Label gauche"
            placeholder="nul"
            value={theme.leftLabel}
            onChange={(event) => setTheme({ ...theme, leftLabel: event.target.value })}
          />
        </label>
        <label>
          Droite
          <input
            aria-label="Label droit"
            placeholder="excellent"
            value={theme.rightLabel}
            onChange={(event) => setTheme({ ...theme, rightLabel: event.target.value })}
          />
        </label>
      </div>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={theme.allowPublic}
          onChange={(event) => setTheme({ ...theme, allowPublic: event.target.checked })}
        />
        Proposer en public
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="button" className="secondary" onClick={addTheme}>
        Ajouter le thème
      </button>
    </div>
  );
}
