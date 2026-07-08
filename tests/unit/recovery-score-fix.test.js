import { describe, it, expect } from 'vitest';
import { recoveryScore } from '../../src/renderer/utils/kpi-derivation.js';

describe('Recovery Score Fix - No Double Inversion', () => {
  it('correctly calculates composite without double-inverting RHR', () => {
    const signals = {
      hrv: { current: 55, baseline: 50, stddev: 5, daysAvailable: 35, sparkline: [55,52,53,54,51,50,49] },
      rhr: { current: 58, baseline: 62, stddev: 4, daysAvailable: 35, sparkline: null },
      sleep: { current: 7.8, baseline: 7.2, stddev: 0.6, daysAvailable: 35, sparkline: null },
    };

    const result = recoveryScore(signals);

    expect(result.baselineComplete).toBe(true);
    expect(result.composite).toBeGreaterThan(0);
    expect(result.composite).toBeLessThanOrEqual(100);

    const hrvZ = (55 - 50) / 5;
    const rhrZ = (58 - 62) / 4;
    const sleepZ = (7.8 - 7.2) / 0.6;

    const hrvSub = 50 + 15 * hrvZ;
    const rhrSub = 50 - 15 * rhrZ;
    const sleepSub = 50 + 15 * sleepZ;

    const expectedComposite = Math.round(0.4 * hrvSub + 0.3 * rhrSub + 0.3 * sleepSub);
    const clampedExpected = Math.max(0, Math.min(100, expectedComposite));

    expect(result.composite).toBe(clampedExpected);
  });

  it('RHR sub-score is correctly inverted (lower RHR = higher score)', () => {
    const signalsLowRHR = {
      hrv: { current: 50, baseline: 50, stddev: 5, daysAvailable: 35, sparkline: null },
      rhr: { current: 55, baseline: 60, stddev: 4, daysAvailable: 35, sparkline: null },
      sleep: { current: 7.5, baseline: 7.5, stddev: 0.5, daysAvailable: 35, sparkline: null },
    };

    const signalsHighRHR = {
      hrv: { current: 50, baseline: 50, stddev: 5, daysAvailable: 35, sparkline: null },
      rhr: { current: 65, baseline: 60, stddev: 4, daysAvailable: 35, sparkline: null },
      sleep: { current: 7.5, baseline: 7.5, stddev: 0.5, daysAvailable: 35, sparkline: null },
    };

    const resultLow = recoveryScore(signalsLowRHR);
    const resultHigh = recoveryScore(signalsHighRHR);

    expect(resultLow.composite).toBeGreaterThan(resultHigh.composite);
  });

  it('handles edge case: all z-scores at 0', () => {
    const signals = {
      hrv: { current: 50, baseline: 50, stddev: 5, daysAvailable: 35, sparkline: null },
      rhr: { current: 60, baseline: 60, stddev: 4, daysAvailable: 35, sparkline: null },
      sleep: { current: 7.5, baseline: 7.5, stddev: 0.5, daysAvailable: 35, sparkline: null },
    };

    const result = recoveryScore(signals);

    expect(result.composite).toBe(50);
    expect(result.zone).toBe('moderate');
  });

  it('clamps composite to [0, 100]', () => {
    const signalsExtreme = {
      hrv: { current: 80, baseline: 50, stddev: 5, daysAvailable: 35, sparkline: null },
      rhr: { current: 40, baseline: 60, stddev: 4, daysAvailable: 35, sparkline: null },
      sleep: { current: 10, baseline: 7.5, stddev: 0.5, daysAvailable: 35, sparkline: null },
    };

    const result = recoveryScore(signalsExtreme);

    expect(result.composite).toBeGreaterThanOrEqual(0);
    expect(result.composite).toBeLessThanOrEqual(100);
  });
});
