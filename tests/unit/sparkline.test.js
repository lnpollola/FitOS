import { describe, it, expect } from 'vitest';

describe('sparkline', () => {
  it('returns empty string for empty input', async () => {
    const { sparkline } = await import('../../src/renderer/utils/sparkline.js');
    expect(sparkline([])).toBe('');
  });

  it('returns empty string for single value', async () => {
    const { sparkline } = await import('../../src/renderer/utils/sparkline.js');
    expect(sparkline([42])).toBe('');
  });

  it('3 values produce a line path with C command', async () => {
    const { sparkline } = await import('../../src/renderer/utils/sparkline.js');
    const result = sparkline([1, 2, 3]);
    expect(result).toContain('<path class="line"');
    expect(result).toMatch(/C\s+[\d.]+\s+[\d.]+/);
  });

  it('area, line, and dot are all present', async () => {
    const { sparkline } = await import('../../src/renderer/utils/sparkline.js');
    const result = sparkline([1, 2, 3]);
    expect(result).toContain('class="area"');
    expect(result).toContain('class="line"');
    expect(result).toContain('class="dot"');
  });

  it('custom stroke override applied to inline style', async () => {
    const { sparkline } = await import('../../src/renderer/utils/sparkline.js');
    const result = sparkline([1, 2, 3], { stroke: 'var(--ember)' });
    expect(result).toContain('stroke:var(--ember)');
    expect(result).toContain('fill:var(--ember)');
  });

  it('custom dimensions reflected in viewBox', async () => {
    const { sparkline } = await import('../../src/renderer/utils/sparkline.js');
    const result = sparkline([1, 2, 3], { width: 200, height: 50 });
    expect(result).toContain('viewBox="0 0 200 50"');
  });

  it('null values are tolerated', async () => {
    const { sparkline } = await import('../../src/renderer/utils/sparkline.js');
    const result = sparkline([1, null, 3, undefined, 5]);
    expect(result).toBeTruthy();
    expect(result).toContain('<path class="line"');
  });
});
