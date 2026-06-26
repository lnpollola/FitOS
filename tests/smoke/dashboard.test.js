import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockApi = {
  getDashboardData: () => Promise.resolve({ weekBalance: -3500, todayCalories: 1850, nextWorkout: 'Push A' }),
  getHealthDashboardMetrics: () => Promise.resolve({ ok: true, data: {} }),
  getActivityKcalByType: () => Promise.resolve([]),
  getSportSummaryByRange: () => Promise.resolve([]),
  getActivityComparison: () => Promise.resolve({ current: [], previous: [], currentActiveDays: 0, previousActiveDays: 0, currentDurationMin: 0, previousDurationMin: 0, currentDistanceKm: 0, previousDistanceKm: 0, currentActiveDates: [], previousActiveDates: [], periodLengthDays: 15 }),
  getSportLifetimeStats: () => Promise.resolve({ totalWeeks: 0, currentStreak: 0, totalSessions: 0 }),
  getSleepAnalysis: () => Promise.resolve({ ok: true, dailySeries: [], trendArrow: null, consistency: null, totalAvg: null, deepAvg: null, remAvg: null, lightAvg: null }),
  getLastImportTimestamp: () => Promise.resolve(null),
  getWeightStats: () => Promise.resolve({ first: null, last: null, min: null, max: null, avg: null, trend: null, count: 0 }),
  getHealthDailySummary: () => Promise.resolve({ ok: true, data: [] }),
  getCyclingDistance: () => Promise.resolve({ ok: false, data: [] }),
  getHealthWorkouts: () => Promise.resolve({ ok: false, data: [] }),
  getEnergyBalance: () => Promise.resolve(null),
};

describe('Dashboard view smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-dashboard"></div><ul class="nav-list"><li><button class="nav-item" data-view="dashboard"></button></li></ul>';
    window.electronAPI = mockApi;
    window._loadingDashboard = false;
  });

  afterEach(() => {
    delete window.electronAPI;
    delete window._loadingDashboard;
    document.body.innerHTML = '';
  });

  it('init does not throw', async () => {
    const { init } = await import('../../src/renderer/views/dashboard.js');
    await expect(init()).resolves.not.toThrow();
  });

  it('render injects skeletons before data resolves', async () => {
    const { init } = await import('../../src/renderer/views/dashboard.js');
    document.getElementById('view-dashboard').innerHTML = `
      <div class="dashboard-grid" id="row-hero"></div>
      <div class="dashboard-grid" id="row-kpis-1"></div>
      <div class="dashboard-grid" id="row-kpis-2"></div>
      <div class="dashboard-chart-row" id="row-trend" style="display:none"></div>
      <div class="dashboard-grid" id="row-sports"></div>
      <div id="last-update"></div>
    `;
    await init();
    expect(document.getElementById('row-hero').innerHTML).toBeTruthy();
  });

  it('rendered HTML contains no emoji characters in icon positions', async () => {
    const { init } = await import('../../src/renderer/views/dashboard.js');
    await init();
    const html = document.getElementById('view-dashboard').innerHTML;
    const emojiRegex = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{2700}-\u{27BF}]/u;
    expect(html).not.toMatch(emojiRegex);
  });

  it('hero renders compact (no .hero-ring-wrap) when ring data absent', async () => {
    const { init } = await import('../../src/renderer/views/dashboard.js');
    await init();
    const html = document.getElementById('view-dashboard').innerHTML;
    expect(html).not.toContain('hero-ring-wrap');
  });

  it('date selector shows 15d 1m 3m buttons', async () => {
    const { init } = await import('../../src/renderer/views/dashboard.js');
    await init();
    const html = document.getElementById('view-dashboard').innerHTML;
    expect(html).toContain('data-range="15d"');
    expect(html).toContain('data-range="1m"');
    expect(html).toContain('data-range="3m"');
    expect(html).not.toContain('data-range="7d"');
  });

  it('rows in correct order: hero → kpis-1 → kpis-2 → trend → sports', async () => {
    const { init } = await import('../../src/renderer/views/dashboard.js');
    await init();
    const html = document.getElementById('view-dashboard').innerHTML;
    const heroIdx = html.indexOf('id="row-hero"');
    const kpis1Idx = html.indexOf('id="row-kpis-1"');
    const kpis2Idx = html.indexOf('id="row-kpis-2"');
    const trendIdx = html.indexOf('id="row-trend"');
    const sportsIdx = html.indexOf('id="row-sports"');
    expect(heroIdx).toBeGreaterThan(-1);
    expect(kpis1Idx).toBeGreaterThan(heroIdx);
    expect(kpis2Idx).toBeGreaterThan(kpis1Idx);
    expect(trendIdx).toBeGreaterThan(kpis2Idx);
    expect(sportsIdx).toBeGreaterThan(trendIdx);
  });

  it('uses locale strings not hardcoded text', async () => {
    const { init } = await import('../../src/renderer/views/dashboard.js');
    await init();
    const html = document.getElementById('view-dashboard').innerHTML;
    expect(html).not.toContain('▲');
  });

  it('sports accent card shows active days and distance with PoP', async () => {
    window.electronAPI = {
      ...mockApi,
      getSportSummaryByRange: () => Promise.resolve([
        { sport_type: 'cycling', count: 5, avg_kcal: 300, total_kcal: 1500, total_duration: 180, total_distance_km: 42.5 },
        { sport_type: 'HIIT', count: 3, avg_kcal: 200, total_kcal: 600, total_duration: 60, total_distance_km: 0 },
      ]),
      getActivityComparison: () => Promise.resolve({
        current: [],
        previous: [],
        currentActiveDays: 5,
        previousActiveDays: 3,
        currentDurationMin: 240,
        previousDurationMin: 180,
        currentDistanceKm: 42.5,
        previousDistanceKm: 30.0,
        currentActiveDates: ['2026-06-15', '2026-06-16', '2026-06-17', '2026-06-19', '2026-06-22'],
        previousActiveDates: ['2026-06-01', '2026-06-02', '2026-06-03'],
        periodLengthDays: 15,
      }),
    };
    const { init } = await import('../../src/renderer/views/dashboard.js');
    await init();
    await new Promise((r) => setTimeout(r, 200));
    const html = document.getElementById('view-dashboard').innerHTML;
    expect(html).toMatch(/Días activos/);
    expect(html).toMatch(/42\.5/);
    expect(html).toMatch(/Distancia/);
    expect(html).toMatch(/Minutos totales/);
    expect(html).toMatch(/Mejor racha/);
    expect(html).toMatch(/3 días seguidos/);
    expect(html).toMatch(/240/);
  });

  it('per-sport card shows distance km for distance-bearing sports', async () => {
    window.electronAPI = {
      ...mockApi,
      getSportSummaryByRange: () => Promise.resolve([
        { sport_type: 'cycling', count: 5, avg_kcal: 300, total_kcal: 1500, total_duration: 180, total_distance_km: 42.5 },
        { sport_type: 'HIIT', count: 3, avg_kcal: 200, total_kcal: 600, total_duration: 60, total_distance_km: 0 },
      ]),
    };
    const { init } = await import('../../src/renderer/views/dashboard.js');
    await init();
    await new Promise((r) => setTimeout(r, 200));
    const html = document.getElementById('view-dashboard').innerHTML;
    expect(html).toMatch(/Ciclismo/);
    expect(html).toMatch(/42\.5 km/);
    expect(html).toMatch(/HIIT/);
  });

  it('consistency badge shows total weeks and current streak', async () => {
    window.electronAPI = {
      ...mockApi,
      getSportSummaryByRange: () => Promise.resolve([
        { sport_type: 'cycling', count: 5, avg_kcal: 300, total_kcal: 1500, total_duration: 180, total_distance_km: 42.5 },
      ]),
      getSportLifetimeStats: () => Promise.resolve({ totalWeeks: 47, currentStreak: 5, totalSessions: 312 }),
    };
    const { init } = await import('../../src/renderer/views/dashboard.js');
    await init();
    await new Promise((r) => setTimeout(r, 200));
    const html = document.getElementById('view-dashboard').innerHTML;
    expect(html).toMatch(/Consistencia/);
    expect(html).toMatch(/47/);
    expect(html).toMatch(/Racha actual/);
    expect(html).toMatch(/Racha activa/);
  });
});
