import { strings } from '../locales/es.js';

export function init() {
  const container = document.getElementById('view-dashboard');
  const api = window.electronAPI;

  container.innerHTML = `<h2 class="view-title">${strings.dashboard.title}</h2><div class="dashboard-grid" id="dashboard-grid"></div>`;

  async function render() {
    const grid = document.getElementById('dashboard-grid');
    if (!api) {
      grid.innerHTML = `<div class="dashboard-card"><h3>${strings.dashboard.status}</h3><div class="value">${strings.dashboard.offline}</div><div class="subtitle">${strings.dashboard.offlineSub}</div></div>`;
      return;
    }

    const data = await api.getDashboardData();
    const cards = [
      { title: strings.dashboard.todayCalories, value: data?.todayCalories != null ? `${data.todayCalories} kcal` : '--', subtitle: strings.dashboard.plannedIntake },
      { title: strings.dashboard.weekBalance, value: data?.weekBalance != null ? `${data.weekBalance > 0 ? '+' : ''}${data.weekBalance} kcal` : '--', subtitle: strings.dashboard.thisWeek },
      { title: strings.dashboard.latestWeight, value: data?.latestWeight != null ? `${data.latestWeight} kg` : '--', subtitle: strings.dashboard.mostRecentEntry },
      { title: strings.dashboard.measurementDelta, value: data?.measurementDelta != null ? `${data.measurementDelta > 0 ? '+' : ''}${data.measurementDelta} cm` : '--', subtitle: strings.dashboard.sinceLastMeasurement },
      { title: strings.dashboard.nextWorkout, value: data?.nextWorkout || '--', subtitle: strings.dashboard.plannedTraining },
    ];

    grid.innerHTML = cards.map(c => `
      <div class="dashboard-card">
        <h3>${c.title}</h3>
        <div class="value">${c.value}</div>
        <div class="subtitle">${c.subtitle}</div>
      </div>
    `).join('');
  }

  render();
}
