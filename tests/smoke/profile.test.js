import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockApi = {
  getProfile: () => Promise.resolve(null),
  saveProfile: () => Promise.resolve(true),
  exportData: () => Promise.resolve(true),
  importData: () => Promise.resolve(true),
};

describe('Profile view smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-profile"></div><ul class="nav-list"><li data-view="profile"></li></ul>';
    window.electronAPI = mockApi;
  });

  afterEach(() => {
    delete window.electronAPI;
    document.body.innerHTML = '';
  });

  it('init does not throw', async () => {
    const { init } = await import('../../src/renderer/views/profile.js');
    await expect(init()).resolves.not.toThrow();
  });
});
