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
    window._loadingEnergy = false;
  });

  afterEach(() => {
    delete window.electronAPI;
    delete window._loadingEnergy;
    document.body.innerHTML = '';
  });

  it('init does not throw', async () => {
    const { init } = await import('../../src/renderer/views/adaptive.js');
    await expect(init()).resolves.not.toThrow();
  });

  it('renders target pace slider', async () => {
    const { init } = await import('../../src/renderer/views/adaptive.js');
    await init();
    expect(document.getElementById('target-pace')).toBeTruthy();
    expect(document.getElementById('btn-calc-deficit')).toBeTruthy();
  });

  it('renders current status and TDEE breakdown side-by-side', async () => {
    const { init } = await import('../../src/renderer/views/adaptive.js');
    await init();
    expect(document.getElementById('current-status')).toBeTruthy();
    expect(document.getElementById('tdee-breakdown')).toBeTruthy();
  });

  it('renders recomp detection section', async () => {
    const { init } = await import('../../src/renderer/views/adaptive.js');
    await init();
    expect(document.getElementById('recomp-detection')).toBeTruthy();
  });
});
