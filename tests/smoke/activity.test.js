import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockApi = {
  getActivityDays: () => Promise.resolve([]),
  getSportActivities: () => Promise.resolve([]),
  getActivityComparison: () => Promise.resolve(null),
  getSportSummaryByRange: () => Promise.resolve([]),
  getLastImportTimestamp: () => Promise.resolve(null),
  checkHealthsync: () => Promise.resolve(false),
  installHealthsync: () => Promise.resolve(false),
  importAppleHealthXML: () => Promise.resolve({ created: 0, skipped: 0 }),
  setLastImportTimestamp: () => Promise.resolve(true),
  onHealthImportProgress: () => {},
  removeHealthImportProgressListener: () => {},
};

describe('Activity view smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-activity"></div><ul class="nav-list"><li data-view="activity"></li></ul>';
    window.electronAPI = mockApi;
    window._loadingActivity = false;
  });

  afterEach(() => {
    delete window.electronAPI;
    delete window._loadingActivity;
    document.body.innerHTML = '';
  });

  it('init does not throw', async () => {
    const { init } = await import('../../src/renderer/views/activity.js');
    await expect(init()).resolves.not.toThrow();
  });

  it('renders session-comparison element', async () => {
    const { init } = await import('../../src/renderer/views/activity.js');
    await init();
    const compEl = document.getElementById('session-comparison');
    expect(compEl).toBeTruthy();
  });

  it('preserves weekly-chart canvas after init', async () => {
    const { init } = await import('../../src/renderer/views/activity.js');
    await init();
    const canvas = document.getElementById('weekly-chart');
    expect(canvas).toBeTruthy();
    expect(canvas.tagName).toBe('CANVAS');
  });
});
