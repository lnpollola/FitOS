import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Loading flags are released on error', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-training"></div><ul class="nav-list"><li data-view="training"></li></ul>';
  });

  afterEach(() => {
    delete window.electronAPI;
    delete window._loadingTraining;
    document.body.innerHTML = '';
  });

  it('training.js releases _loadingTraining even when API fails', async () => {
    window.electronAPI = {
      getExerciseLibrary: () => Promise.reject(new Error('DB error')),
      getTrainingRoutines: () => Promise.reject(new Error('DB error')),
      getTrainingSessions: () => Promise.reject(new Error('DB error')),
      getTrainingSets: () => Promise.resolve([]),
      getWorkoutPlans: () => Promise.reject(new Error('DB error')),
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
    window._loadingTraining = false;

    const { init } = await import('../../src/renderer/views/training.js');
    await init();

    expect(window._loadingTraining).toBe(false);
  });
});
