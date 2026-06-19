import { strings, getSportDisplayName } from '../locales/es.js';

const SPORT_ICONS = {
  running: '🏃', cycling: '🚴', walking: '🚶', swimming: '🏊',
  yoga: '🧘', HIIT: '💪', strength: '🏋️', football: '⚽',
  paddle: '🏓', boxing: '🥊', other: '🏅',
};

export async function init() {
  if (window._loadingDashboard) return;
  window._loadingDashboard = true;
  const container = document.getElementById('view-dashboard');
  const api = window.electronAPI;

  let _range = '7d';

  function getRangeDates(range) {
    const now = new Date();
    const to = now.toISOString().split('T')[0];
    let from;
    if (range === '7d') {
      const d = new Date(now); d.setDate(d.getDate() - 7); from = d.toISOString().split('T')[0];
    } else if (range === '15d') {
      const d = new Date(now); d.setDate(d.getDate() - 15); from = d.toISOString().split('T')[0];
    } else {
      const d = new Date(now); d.setDate(d.getDate() - 30); from = d.toISOString().split('T')[0];
    }
    return { from, to };
  }

  container.innerHTML = `
    <h2 class="view-title">${strings.dashboard.title}</h2>
    <div class="analytics-filters" id="dashboard-filters">
      <button class="filter-btn active" data-range="7d">${strings.dashboard.dateRange7d}</button>
      <button class="filter-btn" data-range="15d">${strings.dashboard.dateRange15d}</button>
      <button class="filter-btn" data-range="1m">${strings.dashboard.dateRange1m}</button>
    </div>
    <div id="last-update" style="font-size:12px;color:var(--text-secondary);margin-bottom:16px"></div>
    <div class="dashboard-grid" id="dashboard-grid"></div>
    <div class="dashboard-grid" id="activity-kcal-grid" style="margin-top:16px"></div>
  `;

  if (!api) {
    document.getElementById('dashboard-grid').innerHTML = `<div class="dashboard-card"><h3>${strings.dashboard.status}</h3><div class="value">${strings.dashboard.offline}</div><div class="subtitle">${strings.dashboard.offlineSub}</div></div>`;
    window._loadingDashboard = false;
    return;
  }

  document.querySelectorAll('#dashboard-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _range = btn.dataset.range;
      document.querySelectorAll('#dashboard-filters .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.range === _range));
      render();
    });
  });

  async function render() {
    const grid = document.getElementById('dashboard-grid');
    const activityGrid = document.getElementById('activity-kcal-grid');
    const { from, to } = getRangeDates(_range);

    const daysInPeriod = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;

    const [appData, healthStats, hrDaily, activityKcal, lastImport] = await Promise.all([
      api.getDashboardData(),
      api.getHealthStats().catch(() => null),
      api.getHealthHeartRateDaily(1).catch(() => null),
      api.getActivityKcalByType(from, to).catch(() => []),
      api.getLastImportTimestamp().catch(() => null),
    ]);

    const healthSummary = api.getHealthDailySummary ? await api.getHealthDailySummary(from, to).catch(() => null) : null;
    const dailyData = healthSummary?.ok ? healthSummary.data : [];
    const avgSteps = dailyData.length ? Math.round(dailyData.reduce((a, d) => a + d.steps, 0) / dailyData.length) : null;

    const lastHR = hrDaily?.ok && hrDaily.data?.length > 0 ? hrDaily.data[0] : null;
    const rhr = lastHR?.avg_bpm || healthStats?.data?.tables?.resting_heart_rate;

    // Last update display
    const updateEl = document.getElementById('last-update');
    if (lastImport) {
      const d = new Date(lastImport);
      updateEl.textContent = `${strings.dashboard.lastUpdate}: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      updateEl.textContent = strings.dashboard.noImportData;
    }

    // Weekly balance as avg/day
    const avgBalance = appData?.weekBalance != null && daysInPeriod > 0
      ? Math.round(appData.weekBalance / daysInPeriod)
      : null;

    const cards = [
      { title: strings.dashboard.weekBalance, value: avgBalance != null ? `${avgBalance > 0 ? '+' : ''}${avgBalance} kcal` : '--', subtitle: strings.dashboard.avgDay },
      { title: strings.dashboard.latestWeight, value: appData?.latestWeight != null ? `${appData.latestWeight} kg` : '--', subtitle: strings.dashboard.mostRecentEntry },
      { title: strings.dashboard.dailySteps, value: avgSteps != null ? `${avgSteps.toLocaleString()}` : '--', subtitle: strings.dashboard.healthLastUpdate },
      { title: strings.dashboard.hrResting, value: rhr ? `${Math.round(rhr)} bpm` : '--', subtitle: 'FC media' },
    ];

    grid.innerHTML = cards.map(c => `
      <div class="dashboard-card">
        <h3>${c.title}</h3>
        <div class="value">${c.value}</div>
        <div class="subtitle">${c.subtitle}</div>
      </div>
    `).join('');

    // Activity kcal cards
    if (activityKcal && activityKcal.length > 0) {
      const totalCount = activityKcal.reduce((s, a) => s + a.count, 0);
      const totalKcal = activityKcal.reduce((s, a) => s + a.total_kcal, 0);
      activityGrid.innerHTML = `
        <div class="dashboard-card" style="background:var(--accent);color:#fff">
          <h3 style="color:rgba(255,255,255,0.8)">${strings.dashboard.sessions}</h3>
          <div class="value" style="color:#fff">${totalCount}</div>
          <div class="subtitle" style="color:rgba(255,255,255,0.7)">${totalKcal.toLocaleString()} ${strings.dashboard.kcalTotal}</div>
        </div>
        <div style="grid-column:1/-1;font-size:13px;font-weight:600;color:var(--text-secondary);margin:4px 0">${strings.dashboard.activityKcalTitle}</div>` +
        activityKcal.map(a => {
          const icon = SPORT_ICONS[a.sport_type] || '🏅';
          return `
          <div class="dashboard-card">
            <h3>${icon} ${getSportDisplayName(a.sport_type)}</h3>
            <div class="value">${a.total_kcal.toLocaleString()} kcal</div>
            <div class="subtitle">${a.count} ${strings.dashboard.sessions} · ${a.avg_kcal} ${strings.dashboard.avgKcal}</div>
          </div>`;
        }).join('');
    } else {
      activityGrid.innerHTML = '';
    }
  }

  await render();
  window._loadingDashboard = false;
}
