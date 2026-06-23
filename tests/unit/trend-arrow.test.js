import { describe, it, expect } from 'vitest';

describe('trend-arrow.js', () => {
  it('getTrendArrow returns up arrow when current > previous', async () => {
    const { getTrendArrow } = await import('../../src/renderer/utils/trend-arrow.js');
    const result = getTrendArrow(100, 90);
    expect(result.arrow).toBe('▲');
    expect(result.cls).toBe('trend-up');
    expect(result.label).toBe('+10.0');
  });

  it('getTrendArrow returns down arrow when current < previous', async () => {
    const { getTrendArrow } = await import('../../src/renderer/utils/trend-arrow.js');
    const result = getTrendArrow(80, 100);
    expect(result.arrow).toBe('▼');
    expect(result.cls).toBe('trend-down');
  });

  it('getTrendArrow returns flat when within threshold', async () => {
    const { getTrendArrow } = await import('../../src/renderer/utils/trend-arrow.js');
    const result = getTrendArrow(101, 100, { threshold: 2 });
    expect(result.arrow).toBe('―');
    expect(result.cls).toBe('trend-flat');
  });

  it('getTrendArrow returns flat when equal', async () => {
    const { getTrendArrow } = await import('../../src/renderer/utils/trend-arrow.js');
    const result = getTrendArrow(100, 100);
    expect(result.arrow).toBe('―');
    expect(result.cls).toBe('trend-flat');
  });

  it('getTrendArrow returns null for null inputs', async () => {
    const { getTrendArrow } = await import('../../src/renderer/utils/trend-arrow.js');
    expect(getTrendArrow(null, 100).arrow).toBe('―');
    expect(getTrendArrow(100, null).arrow).toBe('―');
    expect(getTrendArrow(null, null).arrow).toBe('―');
  });

  it('getTrendArrow respects goodIsUp=false for resting metrics', async () => {
    const { getTrendArrow } = await import('../../src/renderer/utils/trend-arrow.js');
    const resultUp = getTrendArrow(65, 70, { goodIsUp: false });
    expect(resultUp.arrow).toBe('▼');
    expect(resultUp.cls).toBe('trend-up');
    const resultDown = getTrendArrow(75, 70, { goodIsUp: false });
    expect(resultDown.arrow).toBe('▲');
    expect(resultDown.cls).toBe('trend-down');
  });

  it('trendBadge returns empty string for short series', async () => {
    const { trendBadge } = await import('../../src/renderer/utils/trend-arrow.js');
    expect(trendBadge([1, 2])).toBe('');
    expect(trendBadge(null)).toBe('');
    expect(trendBadge([])).toBe('');
  });

  it('trendBadge returns trend-up for increasing series', async () => {
    const { trendBadge } = await import('../../src/renderer/utils/trend-arrow.js');
    const result = trendBadge([10, 20, 30, 40, 50, 60, 70, 80]);
    expect(result).toContain('trend-up');
    expect(result).toContain('metric-trend');
  });

  it('trendBadge returns trend-down for decreasing series', async () => {
    const { trendBadge } = await import('../../src/renderer/utils/trend-arrow.js');
    const result = trendBadge([80, 70, 60, 50, 40, 30, 20, 10]);
    expect(result).toContain('trend-down');
  });

  it('trendBadge returns flat for stable series', async () => {
    const { trendBadge } = await import('../../src/renderer/utils/trend-arrow.js');
    const result = trendBadge([50, 51, 49, 50, 51, 49, 50, 51]);
    expect(result).toContain('trend-flat');
  });
});
