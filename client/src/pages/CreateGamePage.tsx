import { FormEvent, useState } from "react";
import type { CreateRoomPayload, CustomThemeInput, ThemeMode } from "@gauge-game/shared";
import { MIN_CUSTOM_THEMES, validateThemeList } from "@gauge-game/shared";
import { CreateThemeForm } from "../components/CreateThemeForm.js";
import { SelectField } from "../components/SelectField.js";

export function CreateGamePage({ onBack, onCreate }: { onBack: () => void; onCreate: (payload: CreateRoomPayload) => void }) {
  const [playerName, setPlayerName] = useState("");
  const [totalRounds, setTotalRounds] = useState(6);
  const [firstClueGiver, setFirstClueGiver] = useState<"creator" | "second">("creator");
  const [themeMode, setThemeMode] = useState<ThemeMode>("random");
  const [themes, setThemes] = useState<CustomThemeInput[]>([
    { title: "Un plat", leftLabel: "nul", rightLabel: "excellent", allowPublic: false }
  ]);
  const [formError, setFormError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (themeMode === "custom") {
      try {
        validateThemeList(themes);
      } catch (validationError) {
        setFormError(validationError instanceof Error ? validationError.message : "Thèmes invalides.");
        return;
      }
    }
    setFormError("");
    onCreate({ playerName, totalRounds, roundsPerClueGiver: 3, firstClueGiver, themeMode, customThemes: themes });
  }

  const customThemeMissingCount = Math.max(0, MIN_CUSTOM_THEMES - themes.length);

  return (
    <section className="screen">
      <button className="ghost" onClick={onBack}>
        Retour
      </button>
      <h1>Nouvelle partie</h1>
      <form className="panel stack" onSubmit={submit}>
        <label>
          Ton nom
          <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Alex" />
        </label>
        <label>
          Nombre de manches
          <input
            type="number"
            min={1}
            max={24}
            value={totalRounds}
            onChange={(event) => setTotalRounds(Number(event.target.value))}
          />
        </label>
        <SelectField
          label="Premier joueur qui fait deviner"
          value={firstClueGiver}
          options={[
            { value: "creator", label: "Moi d'abord" },
            { value: "second", label: "L'autre joueur" }
          ]}
          onChange={setFirstClueGiver}
        />
        <div className="segmented" role="group" aria-label="Mode de thème">
          <button type="button" className={themeMode === "random" ? "active" : ""} onClick={() => setThemeMode("random")}>
            Aléatoire
          </button>
          <button type="button" className={themeMode === "custom" ? "active" : ""} onClick={() => setThemeMode("custom")}>
            Personnalisé
          </button>
        </div>
        {themeMode === "custom" ? (
          <section className="stack">
            <div className={customThemeMissingCount > 0 ? "form-note warning" : "form-note"}>
              {customThemeMissingCount > 0
                ? `${MIN_CUSTOM_THEMES} thèmes sont obligatoires. Ajoute encore ${customThemeMissingCount}.`
                : `${themes.length} thèmes prêts.`}
            </div>
            <CreateThemeForm onAdd={(theme) => setThemes([...themes, theme])} />
            <div className="theme-list">
              {themes.map((theme, index) => (
                <div className="theme-chip" key={`${theme.title}-${index}`}>
                  <span>
                    {theme.title}: {theme.leftLabel} / {theme.rightLabel}
                  </span>
                  <button
                    aria-label={`Supprimer ${theme.title}`}
                    className="chip-remove"
                    type="button"
                    onClick={() => setThemes(themes.filter((_, themeIndex) => themeIndex !== index))}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {formError ? <p className="form-error">{formError}</p> : null}
        <button className="primary tall" type="submit">
          Créer
        </button>
      </form>
    </section>
  );
}
