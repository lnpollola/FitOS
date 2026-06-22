import { strings } from '../locales/es.js';

export function skeletonCard() {
  return `<div class="dashboard-card skeleton" aria-hidden="true" style="min-height:120px"></div>`;
}

export function skeletonRow(count = 3) {
  const items = Array.from({ length: count }, () =>
    `<div class="skeleton" style="height:20px;margin-bottom:8px;border-radius:4px"></div>`
  ).join('');
  return `<div class="card">${items}<span class="sr-only" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">${strings.states.loading}</span></div>`;
}

export function skeletonChart() {
  return `<div class="chart-card skeleton" aria-hidden="true" style="height:240px"><span class="sr-only" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">${strings.states.loading}</span></div>`;
}
