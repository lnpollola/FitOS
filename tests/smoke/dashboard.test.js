import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockApi = {
  getDashboardData: () => Promise.resolve({ weekBalance: 0 }),
  getHealthDashboardMetrics: () => Promise.resolve({ ok: true, data: {} }),
  getActivityKcalByType: () => Promise.resolve([]),
  getLastImportTimestamp: () => Promise.resolve(null),
  getWeightStats: () => Promise.resolve({ first: null, last: null, min: null, max: null, avg: null, trend: null, count: 0 }),
  getHealthDailySummary: () => Promise.resolve({ ok: true, data: [] }),
  getSleepData: () => Promise.resolve({ ok: false, data: [], avg7d: null }),
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
      <div class="dashboard-grid" id="row-metrics"></div>
      <div class="dashboard-grid" id="row-steps-extras"></div>
      <div class="dashboard-chart-row" id="row-trend" style="display:none"></div>
      <div class="dashboard-grid" id="row-activity"></div>
      <div id="last-update"></div>
    `;
    await init();
    const metricsEl = document.getElementById('row-metrics');
    if (metricsEl) {
      expect(metricsEl.innerHTML).toBeTruthy();
    }
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

  it('rows in correct order: metrics → activity → steps-extras → trend', async () => {
    const { init } = await import('../../src/renderer/views/dashboard.js');
    await init();
    const html = document.getElementById('view-dashboard').innerHTML;
    const metricsIdx = html.indexOf('id="row-metrics"');
    const activityIdx = html.indexOf('id="row-activity"');
    const stepsIdx = html.indexOf('id="row-steps-extras"');
    const trendIdx = html.indexOf('id="row-trend"');
    expect(metricsIdx).toBeGreaterThan(-1);
    expect(activityIdx).toBeGreaterThan(metricsIdx);
    expect(stepsIdx).toBeGreaterThan(activityIdx);
    expect(trendIdx).toBeGreaterThan(stepsIdx);
  });
});
