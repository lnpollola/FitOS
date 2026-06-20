import { describe, it, expect } from 'vitest';
import { calculateBMR } from '../../src/renderer/utils/bmr.js';

describe('calculateBMR', () => {
  it('calculates correct BMR for male (Mifflin-St Jeor)', () => {
    const bmr = calculateBMR(75, 180, 30, 'male');
    expect(bmr).toBeCloseTo(1730, 1);
  });

  it('calculates correct BMR for female (Mifflin-St Jeor)', () => {
    const bmr = calculateBMR(60, 165, 30, 'female');
    expect(bmr).toBeCloseTo(1320.25, 1);
  });

  it('returns different values for male vs female with same stats', () => {
    const maleBmr = calculateBMR(70, 175, 25, 'male');
    const femaleBmr = calculateBMR(70, 175, 25, 'female');
    expect(maleBmr).toBeGreaterThan(femaleBmr);
    expect(maleBmr - femaleBmr).toBe(166); // +5 vs -161 = 166 difference
  });
});
