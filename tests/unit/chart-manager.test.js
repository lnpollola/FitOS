import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('chart.js/auto', () => {
  return {
    default: vi.fn().mockImplementation(function() {
      return {
        destroy: vi.fn(),
        data: { datasets: [{ data: [] }] },
      };
    }),
  };
});

describe('ChartManager', () => {
  let manager;

  beforeEach(async () => {
    vi.resetModules();
    manager = await import('../../src/renderer/charts/chart-manager.js');
  });

  afterEach(() => {
    manager.destroyAllCharts();
  });

  it('createChart creates and stores a chart', () => {
    const ctx = document.createElement('canvas').getContext('2d');
    const chart = manager.createChart('test', ctx, { type: 'line', data: { labels: [], datasets: [] } });
    expect(chart).toBeTruthy();
    expect(manager.getChart('test')).toBe(chart);
  });

  it('createChart destroys previous chart with same id', () => {
    const ctx = document.createElement('canvas').getContext('2d');
    const first = manager.createChart('dup', ctx, { type: 'line', data: { labels: [], datasets: [] } });
    const destroySpy = vi.spyOn(first, 'destroy');
    const second = manager.createChart('dup', ctx, { type: 'bar', data: { labels: [], datasets: [] } });
    expect(destroySpy).toHaveBeenCalledOnce();
    expect(manager.getChart('dup')).toBe(second);
    expect(manager.getChart('dup')).not.toBe(first);
  });

  it('getChart returns null for unknown id', () => {
    expect(manager.getChart('nonexistent')).toBeNull();
  });

  it('destroyChart removes chart', () => {
    const ctx = document.createElement('canvas').getContext('2d');
    manager.createChart('remove-me', ctx, { type: 'line', data: { labels: [], datasets: [] } });
    expect(manager.getChart('remove-me')).toBeTruthy();
    manager.destroyChart('remove-me');
    expect(manager.getChart('remove-me')).toBeNull();
  });

  it('destroyAllCharts clears registry', () => {
    const ctx = document.createElement('canvas').getContext('2d');
    manager.createChart('a', ctx, { type: 'line', data: { labels: [], datasets: [] } });
    manager.createChart('b', ctx, { type: 'line', data: { labels: [], datasets: [] } });
    manager.destroyAllCharts();
    expect(manager.getChart('a')).toBeNull();
    expect(manager.getChart('b')).toBeNull();
  });
});
