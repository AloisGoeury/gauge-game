import { describe, expect, it } from "vitest";
import { calculatePoints, generateTargetValue } from "./scoring.js";

describe("scoring", () => {
  it("calculates points from configured distance bands", () => {
    expect(calculatePoints(500, 505)).toBe(4);
    expect(calculatePoints(500, 512)).toBe(2);
    expect(calculatePoints(500, 525)).toBe(2);
    expect(calculatePoints(500, 550)).toBe(1);
    expect(calculatePoints(500, 551)).toBe(0);
  });

  it("generates a target inside the gauge", () => {
    expect(generateTargetValue(() => 0)).toBe(0);
    expect(generateTargetValue(() => 1)).toBe(1000);
    expect(generateTargetValue(() => 0.423)).toBe(423);
  });
});
