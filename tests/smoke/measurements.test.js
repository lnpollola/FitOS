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

  it('renders body-part fieldsets', async () => {
    const { init } = await import('../../src/renderer/views/measurements.js');
    await init();
    const html = document.getElementById('view-measurements').innerHTML;
    expect(html).toContain('Cuello y Hombros');
    expect(html).toContain('Torso');
    expect(html).toContain('Brazos');
    expect(html).toContain('Piernas');
    expect(html).toContain('fieldset');
  });

  it('renders comparison result table section', async () => {
    const { init } = await import('../../src/renderer/views/measurements.js');
    await init();
    expect(document.getElementById('comparison-result')).toBeTruthy();
    expect(document.getElementById('before-date')).toBeTruthy();
    expect(document.getElementById('after-date')).toBeTruthy();
  });

  it('renders evolution chart canvas', async () => {
    const { init } = await import('../../src/renderer/views/measurements.js');
    await init();
    expect(document.getElementById('evolution-chart')).toBeTruthy();
  });
});
