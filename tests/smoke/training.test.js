import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockApi = {
  getExerciseLibrary: () => Promise.resolve([]),
  getTrainingRoutines: () => Promise.resolve([]),
  getTrainingSessions: () => Promise.resolve([]),
  getTrainingSets: () => Promise.resolve([]),
  getWorkoutPlans: () => Promise.resolve([]),
  getPlanDays: () => Promise.resolve([]),
  getSetting: () => Promise.resolve(null),
  setSetting: () => Promise.resolve(true),
  saveExercise: () => Promise.resolve(true),
  saveTrainingRoutine: () => Promise.resolve(true),
  saveTrainingSession: () => Promise.resolve(true),
  saveTrainingSet: () => Promise.resolve(true),
  deleteExercise: () => Promise.resolve(true),
  deleteTrainingSession: () => Promise.resolve(true),
};

describe('Training view smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-training"></div><ul class="nav-list"><li data-view="training"></li></ul>';
    window.electronAPI = mockApi;
    window._loadingTraining = false;
  });

  afterEach(() => {
    delete window.electronAPI;
    delete window._loadingTraining;
    document.body.innerHTML = '';
  });

  it('init does not throw', async () => {
    const { init } = await import('../../src/renderer/views/training.js');
    await expect(init()).resolves.not.toThrow();
  });

  it('renders frequency selector and generate button', async () => {
    const { init } = await import('../../src/renderer/views/training.js');
    await init();
    expect(document.getElementById('frequency-select')).toBeTruthy();
    expect(document.getElementById('btn-generate-plan')).toBeTruthy();
  });

  it('renders routine form and list', async () => {
    const { init } = await import('../../src/renderer/views/training.js');
    await init();
    expect(document.getElementById('routine-form')).toBeTruthy();
    expect(document.getElementById('routine-list')).toBeTruthy();
  });

  it('renders session form and set editor', async () => {
    const { init } = await import('../../src/renderer/views/training.js');
    await init();
    expect(document.getElementById('session-form')).toBeTruthy();
    expect(document.getElementById('session-list')).toBeTruthy();
  });

  it('renders exercise library section', async () => {
    const { init } = await import('../../src/renderer/views/training.js');
    await init();
    expect(document.getElementById('exercise-list')).toBeTruthy();
  });

  it('uses Lucide icons not emoji', async () => {
    const { init } = await import('../../src/renderer/views/training.js');
    await init();
    const html = document.getElementById('view-training').innerHTML;
    const emojiRegex = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{2700}-\u{27BF}]/u;
    expect(html).not.toMatch(emojiRegex);
  });
});
