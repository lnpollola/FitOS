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

    const [appData, healthStats, hrDaily] = await Promise.all([
      api.getDashboardData(),
      api.getHealthStats().catch(() => null),
      api.getHealthHeartRateDaily(1).catch(() => null),
    ]);

    const today = new Date().toISOString().split('T')[0];
    const healthSummary = api.getHealthDailySummary ? await api.getHealthDailySummary(today, today).catch(() => null) : null;
    const todaySteps = healthSummary?.ok && healthSummary.data?.length > 0 ? healthSummary.data[0].steps : null;
    const todayKcal = healthSummary?.ok && healthSummary.data?.length > 0 ? healthSummary.data[0].kcal_activas : null;

    const lastHR = hrDaily?.ok && hrDaily.data?.length > 0 ? hrDaily.data[0] : null;
    const rhr = lastHR?.avg_bpm || healthStats?.data?.tables?.resting_heart_rate;

    const cards = [
      { title: strings.dashboard.todayCalories, value: appData?.todayCalories != null ? `${Math.round(appData.todayCalories)} kcal` : '--', subtitle: strings.dashboard.plannedIntake },
      { title: strings.dashboard.weekBalance, value: appData?.weekBalance != null ? `${appData.weekBalance > 0 ? '+' : ''}${Math.round(appData.weekBalance)} kcal` : '--', subtitle: strings.dashboard.thisWeek },
      { title: strings.dashboard.latestWeight, value: appData?.latestWeight != null ? `${appData.latestWeight} kg` : '--', subtitle: strings.dashboard.mostRecentEntry },
      { title: strings.dashboard.dailySteps, value: todaySteps != null ? `${Math.round(todaySteps).toLocaleString()}` : '--', subtitle: strings.dashboard.healthLastUpdate },
      { title: strings.dashboard.hrResting, value: rhr ? `${typeof rhr === 'number' ? rhr : '--'} bpm` : '--', subtitle: 'FC media hoy' },
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
