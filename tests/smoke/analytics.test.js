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
  getHealthDistanceSummary: () => Promise.resolve([]),
  getHealthWalkingSpeedRange: () => Promise.resolve([]),
  getHealthFlightsClimbedRange: () => Promise.resolve([]),
};

describe('Analytics view smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-analytics"></div><ul class="nav-list"><li data-view="analytics"></li></ul>';
    window.electronAPI = mockApi;
  });

  afterEach(() => {
    delete window.electronAPI;
    document.body.innerHTML = '';
  });

  it('init does not throw', async () => {
    const { init } = await import('../../src/renderer/views/analytics.js');
    await expect(init()).resolves.not.toThrow();
  });
});
