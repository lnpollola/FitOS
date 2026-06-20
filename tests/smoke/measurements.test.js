import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockApi = {
  getMeasurementSets: () => Promise.resolve([]),
  getLatestMeasurementSet: () => Promise.resolve(null),
  getWeightEntries: () => Promise.resolve([]),
  getProfile: () => Promise.resolve(null),
  saveMeasurementSet: () => Promise.resolve(true),
  saveWeightEntry: () => Promise.resolve(true),
  deleteMeasurementSet: () => Promise.resolve(true),
};

describe('Measurements view smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-measurements"></div><ul class="nav-list"><li data-view="measurements"></li></ul>';
    window.electronAPI = mockApi;
    window._loadingMeasurements = false;
  });

  afterEach(() => {
    delete window.electronAPI;
    delete window._loadingMeasurements;
    document.body.innerHTML = '';
  });

  it('init does not throw', async () => {
    const { init } = await import('../../src/renderer/views/measurements.js');
    await expect(init()).resolves.not.toThrow();
  });
});
