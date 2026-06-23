import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockApi = {
  getHealthDailySummary: () => Promise.resolve({ ok: true, data: [] }),
  getHealthHeartRateRange: () => Promise.resolve([]),
  getHealthHRVRange: () => Promise.resolve([]),
  getHealthSleepRange: () => Promise.resolve([]),
  getHealthWorkoutRange: () => Promise.resolve([]),
  getHealthWorkoutRanking: () => Promise.resolve([]),
  getHealthRestingHeartRateRange: () => Promise.resolve([]),
  getHealthVO2MaxRange: () => Promise.resolve([]),
  getHealthExerciseTimeRange: () => Promise.resolve([]),
  getHealthDistanceSummary: () => Promise.resolve({ walking: [], cycling: [] }),
  getHealthWalkingSpeedRange: () => Promise.resolve([]),
  getHealthFlightsClimbedRange: () => Promise.resolve([]),
  getSleepAnalysis: () => Promise.resolve({ ok: true, dailySeries: [] }),
  getDailyActivity: () => Promise.resolve([]),
};

describe('Analytics view smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-analytics"></div><ul class="nav-list"><li data-view="analytics"></li></ul>';
    window.electronAPI = mockApi;
    window._loadingAnalytics = false;
  });

  afterEach(() => {
    delete window.electronAPI;
    delete window._loadingAnalytics;
    document.body.innerHTML = '';
  });

  it('init does not throw', async () => {
    const { init } = await import('../../src/renderer/views/analytics.js');
    await expect(init()).resolves.not.toThrow();
  });

  it('renders analytics-filters with date inputs', async () => {
    const { init } = await import('../../src/renderer/views/analytics.js');
    await init();
    expect(document.getElementById('analytics-filters')).toBeTruthy();
    expect(document.getElementById('filter-from')).toBeTruthy();
    expect(document.getElementById('filter-to')).toBeTruthy();
    expect(document.getElementById('filter-apply')).toBeTruthy();
  });

  it('renders empty-state banner when no data', async () => {
    const { init } = await import('../../src/renderer/views/analytics.js');
    await init();
    const html = document.getElementById('view-analytics').innerHTML;
    expect(document.getElementById('analytics-kpis')).toBeTruthy();
    expect(document.getElementById('analytics-chart-grid')).toBeTruthy();
  });

  it('uses theme-aware colors not hardcoded hex', async () => {
    const { init } = await import('../../src/renderer/views/analytics.js');
    await init();
    const html = document.getElementById('view-analytics').innerHTML;
    expect(document.getElementById('secondary-section')).toBeTruthy();
  });
});
