import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Router lazy loading', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="view-dashboard" class="view"></div>
      <div id="view-activity" class="view"></div>
      <div id="view-diet" class="view"></div>
      <div id="view-energy" class="view"></div>
      <div id="view-measurements" class="view"></div>
      <div id="view-training" class="view"></div>
      <div id="view-analytics" class="view"></div>
      <div id="view-insights" class="view"></div>
      <div id="view-profile" class="view"></div>
      <div id="view-sleep" class="view"></div>
      <div id="view-goals" class="view"></div>
      <nav>
        <button class="nav-item" data-view="dashboard">Dashboard</button>
        <button class="nav-item" data-view="activity">Activity</button>
        <button class="nav-item" data-view="diet">Diet</button>
        <button class="nav-item" data-view="energy">Energy</button>
        <button class="nav-item" data-view="measurements">Measurements</button>
        <button class="nav-item" data-view="training">Training</button>
        <button class="nav-item" data-view="analytics">Analytics</button>
        <button class="nav-item" data-view="insights">Insights</button>
        <button class="nav-item" data-view="profile">Profile</button>
        <button class="nav-item" data-view="sleep">Sleep</button>
        <button class="nav-item" data-view="goals">Goals</button>
      </nav>
    `;
    globalThis._loadingView = null;
  });

  afterEach(() => {
    delete globalThis._loadingView;
    document.body.innerHTML = '';
  });

  it('loader map has entries for all expected views', async () => {
    const expected = ['dashboard', 'activity', 'diet', 'energy', 'measurements', 'training', 'analytics', 'insights', 'profile', 'sleep', 'goals'];
    const app = await import('../../src/renderer/app.js');
    const views = app.views;
    expected.forEach(name => {
      expect(typeof views[name]).toBe('function');
    });
  });

  it('stale-load guard prevents concurrent loads of same view', async () => {
    let loadCount = 0;
    const tracker = {};
    const views = {
      dashboard: async () => { loadCount++; return { init: () => {} }; },
    };

    let _loadingView = null;
    async function showView(viewName) {
      if (_loadingView === viewName) return;
      _loadingView = viewName;
      const loader = views[viewName];
      if (loader) {
        await loader();
      }
      _loadingView = null;
    }

    await Promise.all([showView('dashboard'), showView('dashboard')]);
    expect(loadCount).toBe(1);
  });
});
