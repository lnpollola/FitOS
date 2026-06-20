import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockApi = {
  getProfile: () => Promise.resolve(null),
  getEnergyBalance: () => Promise.resolve(null),
  getWeightEntries: () => Promise.resolve([]),
  getMeasurementSets: () => Promise.resolve([]),
  getMealTemplates: () => Promise.resolve([]),
  getDailyPlan: () => Promise.resolve([]),
  getSetting: () => Promise.resolve(null),
  setSetting: () => Promise.resolve(true),
};

describe('Adaptive view smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-energy"></div><ul class="nav-list"><li data-view="energy"></li></ul>';
    window.electronAPI = mockApi;
  });

  afterEach(() => {
    delete window.electronAPI;
    document.body.innerHTML = '';
  });

  it('init does not throw', async () => {
    const { init } = await import('../../src/renderer/views/adaptive.js');
    await expect(init()).resolves.not.toThrow();
  });
});
