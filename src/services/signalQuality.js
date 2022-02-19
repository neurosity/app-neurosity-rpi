import { pipe } from "rxjs";
import { map, distinctUntilChanged, bufferCount } from "rxjs/operators";

export const SIGNAL_QUALITY_THRESHOLDS = {
  BAD: 15,
  OK: 10,
  GREAT: 1.5 // Below 1.5 usually indicates not connected to anything
};

export const poorSignalQualityScoreThreshold = 0.75;

export const signalQualityScore = (
  updateEveryCount = 1,
  windowCountAverage = 3
) =>
  pipe(
    map(
      (signal) =>
        Object.values(signal).reduce(
          (acc, channel) => stdToScore(acc, channel.standardDeviation),
          0
        ) / Object.keys(signal).length
    ),
    bufferCount(windowCountAverage, updateEveryCount),
    map(
      (scores) =>
        scores.reduce((acc, score) => acc + score, 1) / scores.length
    ),
    map((score) => Math.min(Number(score.toFixed(2)), 1)),
    distinctUntilChanged()
  );

export function stdToScore(acc, standardDeviation) {
  if (standardDeviation >= SIGNAL_QUALITY_THRESHOLDS.BAD) {
    return acc + 0.5;
  }
  if (standardDeviation >= SIGNAL_QUALITY_THRESHOLDS.OK) {
    return acc + 0.85;
  }
  if (standardDeviation >= SIGNAL_QUALITY_THRESHOLDS.GREAT) {
    return acc + 0.95;
  }

  return 0.1;
}

export const colorsByQuality = {
  great: "rgba(50, 205, 50, 1)",
  good: "rgba(50, 205, 50, 0.7)",
  poor: "gold",
  degraded: "red",
  noContact: "gray"
};

export function stdToColor(standardDeviation) {
  if (standardDeviation >= SIGNAL_QUALITY_THRESHOLDS.BAD * 2) {
    return colorsByQuality.degraded;
  }
  if (standardDeviation >= SIGNAL_QUALITY_THRESHOLDS.BAD) {
    return colorsByQuality.poor;
  }
  if (standardDeviation >= SIGNAL_QUALITY_THRESHOLDS.OK) {
    return colorsByQuality.good;
  }
  if (standardDeviation >= SIGNAL_QUALITY_THRESHOLDS.GREAT) {
    return colorsByQuality.great;
  }

  return colorsByQuality.noContact;
}
