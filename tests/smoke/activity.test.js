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
    expect(document.getElementById('session-comparison')).toBeTruthy();
  });

  it('preserves weekly-chart canvas after init', async () => {
    const { init } = await import('../../src/renderer/views/activity.js');
    await init();
    const canvas = document.getElementById('weekly-chart');
    expect(canvas).toBeTruthy();
    expect(canvas.tagName).toBe('CANVAS');
  });

  it('renders ranking table card', async () => {
    const { init } = await import('../../src/renderer/views/activity.js');
    await init();
    expect(document.getElementById('recognition-table-card')).toBeTruthy();
    expect(document.getElementById('recognition-table')).toBeTruthy();
  });

  it('renders no emoji in icon positions', async () => {
    const { init } = await import('../../src/renderer/views/activity.js');
    await init();
    const html = document.getElementById('view-activity').innerHTML;
    const emojiRegex = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{2700}-\u{27BF}]/u;
    expect(html).not.toMatch(emojiRegex);
  });
});
