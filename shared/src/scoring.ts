import type { ScoreZoneConfig, ScoreZones } from "./types.js";

export const GAUGE_MIN = 0;
export const GAUGE_MAX = 1000;

export const DEFAULT_SCORE_ZONE_CONFIG: ScoreZoneConfig = {
  four: 5,
  two: 25,
  one: 50
};

export function clampGaugeValue(value: number): number {
  return Math.max(GAUGE_MIN, Math.min(GAUGE_MAX, Math.round(value)));
}

export function generateTargetValue(random = Math.random): number {
  return clampGaugeValue(random() * GAUGE_MAX);
}

export function calculatePoints(
  targetValue: number,
  guessValue: number,
  zones: ScoreZoneConfig = DEFAULT_SCORE_ZONE_CONFIG
): number {
  const distance = Math.abs(clampGaugeValue(targetValue) - clampGaugeValue(guessValue));
  if (distance <= zones.four) return 4;
  if (distance <= zones.two) return 2;
  if (distance <= zones.one) return 1;
  return 0;
}

export function buildScoreZones(targetValue: number, zones: ScoreZoneConfig = DEFAULT_SCORE_ZONE_CONFIG): ScoreZones {
  const target = clampGaugeValue(targetValue);
  return {
    four: [clampGaugeValue(target - zones.four), clampGaugeValue(target + zones.four)],
    two: [clampGaugeValue(target - zones.two), clampGaugeValue(target + zones.two)],
    one: [clampGaugeValue(target - zones.one), clampGaugeValue(target + zones.one)]
  };
}
