import Chart from 'chart.js/auto';

const registry = new Map();

export function createChart(id, ctx, config) {
  destroyChart(id);
  const chart = new Chart(ctx, config);
  registry.set(id, chart);
  return chart;
}

export function getChart(id) {
  return registry.get(id) || null;
}

export function destroyChart(id) {
  const existing = registry.get(id);
  if (existing) {
    existing.destroy();
    registry.delete(id);
  }
}

export function destroyAllCharts() {
  for (const [id, chart] of registry) {
    try { chart.destroy(); } catch {}
  }
  registry.clear();
}
