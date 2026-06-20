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
});
