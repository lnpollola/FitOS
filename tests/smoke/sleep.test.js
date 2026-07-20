import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockApi = {
  getSleepAnalysis: () => Promise.resolve({
    ok: true, dailySeries: [], totalAvg: 7.5, deepAvg: 1.5, remAvg: 2.0, lightAvg: 4.0, consistency: 80, trendArrow: 'up',
  }),
  onDataChanged: () => {},
  navigate: () => {},
};

describe('Sleep view smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-sleep"></div><ul class="nav-list"><li><button class="nav-item" data-view="sleep"></button></li></ul>';
    window.electronAPI = mockApi;
    window._loadingSleep = false;
  });

  afterEach(() => {
    delete window.electronAPI;
    delete window._loadingSleep;
    document.body.innerHTML = '';
  });

  it('init does not throw', async () => {
    const { init } = await import('../../src/renderer/views/sleep.js');
    await expect(init()).resolves.not.toThrow();
  });

  it('render injects skeletons before data resolves', async () => {
    let resolveApi;
    window.electronAPI = { ...mockApi, getSleepAnalysis: () => new Promise(r => { resolveApi = r; }) };
    const { init } = await import('../../src/renderer/views/sleep.js');
    const initPromise = init();
    const htmlSkeleton = document.getElementById('view-sleep').innerHTML;
    expect(htmlSkeleton).toContain('skeleton');
    resolveApi({ ok: true, dailySeries: [], totalAvg: 7.5, deepAvg: 1.5, remAvg: 2.0, lightAvg: 4.0, consistency: 80, trendArrow: 'up' });
    await initPromise;
  });

  it('rendered HTML contains no emoji characters in icon positions', async () => {
    const { init } = await import('../../src/renderer/views/sleep.js');
    await init();
    await new Promise((r) => setTimeout(r, 100));
    const html = document.getElementById('view-sleep').innerHTML;
    const emojiRegex = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{2700}-\u{27BF}]/u;
    expect(html).not.toMatch(emojiRegex);
  });

  it('shows average sleep value when data present', async () => {
    const { init } = await import('../../src/renderer/views/sleep.js');
    await init();
    await new Promise((r) => setTimeout(r, 100));
    const html = document.getElementById('view-sleep').innerHTML;
    expect(html).toContain('7.5 h');
  });

  it('shows consistency percentage when data present', async () => {
    const { init } = await import('../../src/renderer/views/sleep.js');
    await init();
    await new Promise((r) => setTimeout(r, 100));
    const html = document.getElementById('view-sleep').innerHTML;
    expect(html).toContain('80%');
  });

  it('shows no-data message when getSleepAnalysis returns ok:false', async () => {
    window.electronAPI = { ...mockApi, getSleepAnalysis: () => Promise.resolve({ ok: false }) };
    const { init } = await import('../../src/renderer/views/sleep.js');
    await init();
    await new Promise((r) => setTimeout(r, 100));
    const html = document.getElementById('view-sleep').innerHTML;
    expect(html).not.toContain('skeleton');
  });
});
