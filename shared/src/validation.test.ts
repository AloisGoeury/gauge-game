import { describe, expect, it } from "vitest";
import { validateTheme, validateThemeList } from "./validation.js";

describe("theme validation", () => {
  it("cleans and validates custom themes", () => {
    expect(
      validateTheme({ title: "  Un plat  ", leftLabel: " nul ", rightLabel: " excellent ", allowPublic: true })
    ).toEqual({ title: "Un plat", leftLabel: "nul", rightLabel: "excellent", allowPublic: true });
  });

  it("rejects identical labels", () => {
    expect(() =>
      validateTheme({ title: "Objet", leftLabel: "long", rightLabel: "long", allowPublic: false })
    ).toThrow(/différentes/);
  });

  it("requires at least two custom themes", () => {
    expect(() =>
      validateThemeList([{ title: "Objet", leftLabel: "court", rightLabel: "long", allowPublic: false }])
    ).toThrow(/2 thèmes/);
  });
});
