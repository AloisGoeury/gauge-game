import type { CustomThemeInput } from "./types.js";

export const MIN_CUSTOM_THEMES = 2;

export function cleanText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function validatePlayerName(name: string): string {
  const clean = cleanText(name);
  if (clean.length < 2) throw new Error("Le nom doit contenir au moins 2 caractères.");
  if (clean.length > 24) throw new Error("Le nom doit faire 24 caractères maximum.");
  return clean;
}

export function validateClue(clue: string): string {
  const clean = cleanText(clue);
  if (clean.length < 1) throw new Error("L'indice est obligatoire.");
  if (clean.length > 80) throw new Error("L'indice doit faire 80 caractères maximum.");
  return clean;
}

export function validateTheme(input: CustomThemeInput): CustomThemeInput {
  const theme = {
    title: cleanText(input.title),
    leftLabel: cleanText(input.leftLabel),
    rightLabel: cleanText(input.rightLabel),
    allowPublic: Boolean(input.allowPublic)
  };
  if (theme.title.length < 2 || theme.title.length > 60) {
    throw new Error("Le thème doit faire entre 2 et 60 caractères.");
  }
  if (theme.leftLabel.length < 1 || theme.leftLabel.length > 32) {
    throw new Error("Le label gauche doit faire entre 1 et 32 caractères.");
  }
  if (theme.rightLabel.length < 1 || theme.rightLabel.length > 32) {
    throw new Error("Le label droit doit faire entre 1 et 32 caractères.");
  }
  if (theme.leftLabel.toLowerCase() === theme.rightLabel.toLowerCase()) {
    throw new Error("Les deux extrémités doivent être différentes.");
  }
  return theme;
}

export function validateThemeList(inputs: CustomThemeInput[], minThemes = MIN_CUSTOM_THEMES): CustomThemeInput[] {
  const themes = inputs.map(validateTheme);
  if (themes.length < minThemes) {
    throw new Error(`${minThemes} thèmes personnalisés sont obligatoires.`);
  }
  return themes;
}
