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
    document.body.innerHTML = '<div id="view-dashboard"></div><ul class="nav-list"><li data-view="dashboard"></li></ul>';
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
});
