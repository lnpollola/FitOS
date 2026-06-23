import { describe, it, expect } from 'vitest';

describe('body-fat.js', () => {
  it('calculateBodyFat returns null when required fields missing', async () => {
    const { calculateBodyFat } = await import('../../src/renderer/utils/body-fat.js');
    expect(calculateBodyFat(null, null, null, null, null)).toBeNull();
    expect(calculateBodyFat(38, null, null, 'male', 175)).toBeNull();
    expect(calculateBodyFat(null, 90, null, 'male', 175)).toBeNull();
  });

  it('calculateBodyFat returns value for male without hips', async () => {
    const { calculateBodyFat } = await import('../../src/renderer/utils/body-fat.js');
    const result = calculateBodyFat(38, 90, null, 'male', 175);
    expect(result).toBeGreaterThanOrEqual(3);
    expect(result).toBeLessThan(50);
  });

  it('calculateBodyFat returns null for female without hips', async () => {
    const { calculateBodyFat } = await import('../../src/renderer/utils/body-fat.js');
    const result = calculateBodyFat(35, 80, null, 'female', 165);
    expect(result).toBeNull();
  });

  it('calculateBodyFat returns value for female with hips', async () => {
    const { calculateBodyFat } = await import('../../src/renderer/utils/body-fat.js');
    const result = calculateBodyFat(35, 80, 95, 'female', 165);
    expect(result).toBeGreaterThanOrEqual(10);
    expect(result).toBeLessThan(60);
  });

  it('calculateBodyFat male formula produces reasonable result', async () => {
    const { calculateBodyFat } = await import('../../src/renderer/utils/body-fat.js');
    const result = calculateBodyFat(40, 85, null, 'male', 180);
    expect(result).toBeGreaterThan(0);
    const leaner = calculateBodyFat(42, 78, null, 'male', 185);
    expect(leaner).toBeLessThan(result);
  });
});
