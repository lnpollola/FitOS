import { describe, it, expect } from 'vitest';

describe('growthRing', () => {
  it('returns empty string for empty input', async () => {
    const { growthRing } = await import('../../src/renderer/utils/growth-ring.js');
    expect(growthRing([])).toBe('');
  });

  it('N = 1 yields a complete circle (one arc with sweep 360°)', async () => {
    const { growthRing } = await import('../../src/renderer/utils/growth-ring.js');
    const result = growthRing([5000]);
    expect(result).toBeTruthy();
    const sweeps = result.match(/A [\d.]+ [\d.]+ 0 [01] [01] /g);
    expect(sweeps).toHaveLength(1);
  });

  it('N = 7 produces arcs whose sweeps sum to 360° (no gap)', async () => {
    const { growthRing } = await import('../../src/renderer/utils/growth-ring.js');
    const result = growthRing([5000, 7000, 4500, 8000, 6000, 9000, 5200]);
    expect(result).toBeTruthy();
    const arcs = result.match(/<path d=/g);
    expect(arcs).toHaveLength(7);
  });

  it('N = 30 produces 30 arcs', async () => {
    const { growthRing } = await import('../../src/renderer/utils/growth-ring.js');
    const vals = Array.from({ length: 30 }, (_, i) => 4000 + i * 200);
    const result = growthRing(vals);
    expect(result).toBeTruthy();
    const arcs = result.match(/<path d=/g);
    expect(arcs).toHaveLength(30);
  });

  it('uniform values render all arcs with moss-mist (not ember)', async () => {
    const { growthRing } = await import('../../src/renderer/utils/growth-ring.js');
    const result = growthRing([100, 100, 100, 100, 100]);
    expect(result).toBeTruthy();
    expect(result).toContain('var(--moss-mist)');
    expect(result).not.toContain('var(--ember)');
  });

  it('mixed values show both moss and ember arcs', async () => {
    const { growthRing } = await import('../../src/renderer/utils/growth-ring.js');
    const result = growthRing([100, 1000, 500, 2000, 50]);
    expect(result).toContain('var(--moss)');
    expect(result).toContain('var(--ember)');
  });
});
