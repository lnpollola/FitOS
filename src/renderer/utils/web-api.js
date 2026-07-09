const API_BASE = window.location.origin;

async function apiCall(channel, ...args) {
  const response = await fetch(`${API_BASE}/api/${channel}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
}

export const webAPI = {
  navigate: () => {},
  onNavigate: () => {},
  onDataChanged: () => {},
  onDomainChanged: () => {},
  onHealthImportProgress: () => {},
  removeHealthImportProgressListener: () => {},

  getProfile: () => apiCall('db:getProfile'),
  saveProfile: (profile) => apiCall('db:saveProfile', profile),

  getActivityDays: () => apiCall('db:getActivityDays'),
  getActivityKcalByType: (from, to) => apiCall('db:getActivityKcalByType', from, to),
  getSportSummaryByRange: (from, to) => apiCall('db:getSportSummaryByRange', from, to),
  getActivityComparison: (from, to) => apiCall('db:getActivityComparison', from, to),
  getSportLifetimeStats: () => apiCall('db:getSportLifetimeStats'),
  getWeightStats: (from, to) => apiCall('db:getWeightStats', from, to),
  searchFoodItems: (query) => apiCall('db:searchFoodItems', query),

  getFoodItems: (includeHidden) => apiCall('db:getFoodItems', includeHidden),
  saveFoodItem: (item) => apiCall('db:saveFoodItem', item),
  hideFoodItem: (id) => apiCall('db:hideFoodItem', id),
  unhideFoodItem: (id) => apiCall('db:unhideFoodItem', id),
  getMealTemplates: () => apiCall('db:getMealTemplates'),
  getDailyPlan: (date) => apiCall('db:getDailyPlan', date),
  saveDailyPlanEntry: (entry) => apiCall('db:saveDailyPlanEntry', entry),
  deleteDailyPlanEntry: (id) => apiCall('db:deleteDailyPlanEntry', id),
  deleteDailyPlanEntries: (date) => apiCall('db:deleteDailyPlanEntries', date),
  updateDailyPlanEntry: (id, grams) => apiCall('db:updateDailyPlanEntry', id, grams),

  getMeasurementSets: () => apiCall('db:getMeasurementSets'),
  getLatestMeasurementSet: () => apiCall('db:getLatestMeasurementSet'),
  saveMeasurementSet: (set) => apiCall('db:saveMeasurementSet', set),
  deleteMeasurementSet: (id) => apiCall('db:deleteMeasurementSet', id),
  getWeightEntries: () => apiCall('db:getWeightEntries'),
  saveWeightEntry: (entry) => apiCall('db:saveWeightEntry', entry),
  deleteWeightEntry: (id) => apiCall('db:deleteWeightEntry', id),

  getExerciseLibrary: () => apiCall('db:getExerciseLibrary'),
  saveExercise: (exercise) => apiCall('db:saveExercise', exercise),
  getTrainingSessions: () => apiCall('db:getTrainingSessions'),
  saveTrainingSession: (session) => apiCall('db:saveTrainingSession', session),
  deleteTrainingSession: (id) => apiCall('db:deleteTrainingSession', id),
  getTrainingSets: (sessionId) => apiCall('db:getTrainingSets', sessionId),
  saveTrainingSet: (set) => apiCall('db:saveTrainingSet', set),
  deleteTrainingSet: (id) => apiCall('db:deleteTrainingSet', id),
  deleteExercise: (id) => apiCall('db:deleteExercise', id),
  getTrainingRoutines: () => apiCall('db:getTrainingRoutines'),
  saveTrainingRoutine: (routine) => apiCall('db:saveTrainingRoutine', routine),
  deleteTrainingRoutine: (id) => apiCall('db:deleteTrainingRoutine', id),

  getEnergyBalance: (date) => apiCall('db:getEnergyBalance', date),
  getWeeklyBalance: () => apiCall('db:getWeeklyBalance'),
  adjustMealGrams: (deltas) => apiCall('db:adjustMealGrams', deltas),

  getSetting: (key) => apiCall('db:getSetting', key),
  setSetting: (key, value) => apiCall('db:setSetting', key, value),
  getLastImportTimestamp: () => apiCall('db:getLastImportTimestamp'),
  getHealthsyncDbInfo: () => apiCall('db:getHealthsyncDbInfo'),

  getDashboardData: () => apiCall('db:getDashboardData'),
  getSleepAnalysis: (from, to) => apiCall('db:getSleepAnalysis', from, to),
  getCyclingDistance: (from, to) => apiCall('db:getCyclingDistance', from, to),

  saveDish: (dish) => apiCall('db:saveDish', dish),
  getDishes: () => apiCall('db:getDishes'),
  getDishIngredients: (dishId) => apiCall('db:getDishIngredients', dishId),
  deleteDish: (dishId) => apiCall('db:deleteDish', dishId),
  saveDishIngredient: (ingredient) => apiCall('db:saveDishIngredient', ingredient),

  linkDishToMeal: (link) => apiCall('db:linkDishToMeal', link),

  getWorkoutPlans: () => apiCall('db:getWorkoutPlans'),
  getPlanDays: (planId) => apiCall('db:getPlanDays', planId),

  checkHealthsync: () => apiCall('db:checkHealthsync'),
  installHealthsync: () => apiCall('db:installHealthsync'),
  syncAppleHealth: (options) => apiCall('db:syncAppleHealth', options),
  resetAndSyncHealthsync: () => apiCall('db:resetAndSyncHealthsync'),
  getHealthDailySummary: (from, to) => apiCall('health:getDailySummary', from, to),
  getHealthWorkouts: (limit) => apiCall('health:getWorkouts', limit),

  getHealthHeartRateRange: (from, to) => apiCall('health:getHeartRateRange', from, to),
  getHealthHRVRange: (from, to) => apiCall('health:getHRVRange', from, to),
  getHealthSleepRange: (from, to) => apiCall('health:getSleepRange', from, to),
  getHealthWorkoutRange: (from, to) => apiCall('health:getWorkoutRange', from, to),
  getHealthWorkoutRanking: (from, to) => apiCall('health:getWorkoutRanking', from, to),
  getHealthRestingHeartRateRange: (from, to) => apiCall('health:getRestingHeartRateRange', from, to),
  getHealthVO2MaxRange: (from, to) => apiCall('health:getVO2MaxRange', from, to),
  getHealthExerciseTimeRange: (from, to) => apiCall('health:getExerciseTimeRange', from, to),
  getHealthDistanceSummary: (from, to) => apiCall('health:getDistanceSummary', from, to),
  getHealthWalkingSpeedRange: (from, to) => apiCall('health:getWalkingSpeedRange', from, to),
  getHealthFlightsClimbedRange: (from, to) => apiCall('health:getFlightsClimbedRange', from, to),

  getHealthDashboardMetrics: (from, to) => apiCall('health:getDashboardMetrics', from, to),

  getPersonalRecords: () => apiCall('db:getPersonalRecords'),
  getRelativeEffort: () => apiCall('db:getRelativeEffort'),
  getTrainingLogWeek: (weekStart) => apiCall('db:getTrainingLogWeek', weekStart),
  getMonthlyCalendar: (yearMonth) => apiCall('db:getMonthlyCalendar', yearMonth),
  getStreak: () => apiCall('db:getStreak'),

  getYearInMotion: (from, to) => apiCall('db:getYearInMotion', from, to),
  getDayOfWeekStats: (from, to) => apiCall('db:getDayOfWeekStats', from, to),
  getSportDistribution: () => apiCall('db:getSportDistribution'),
  getRecoveryScore: () => apiCall('db:getRecoveryScore'),
  getWeightVelocity: (from, to) => apiCall('db:getWeightVelocity', from, to),
  getWHR: () => apiCall('db:getWHR'),
  getAutoInsights: () => apiCall('db:getAutoInsights'),

  getStrengthPersonalRecords: () => apiCall('db:getStrengthPersonalRecords'),
  getStrengthPlateau: () => apiCall('db:getStrengthPlateau'),
  getStrengthScore: () => apiCall('db:getStrengthScore'),
  getWeeklyTonnage: () => apiCall('db:getWeeklyTonnage'),

  getGoals: () => apiCall('db:getGoals'),
  saveGoal: (goal) => apiCall('db:saveGoal', goal),
  deleteGoal: (id) => apiCall('db:deleteGoal', id),
  archiveGoal: (id) => apiCall('db:archiveGoal', id),
  getGoalProgress: (goalId) => apiCall('db:getGoalProgress', goalId),

  exportData: async () => {
    const response = await fetch(`${API_BASE}/api/export`);
    return response.json();
  },
  importData: async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    return new Promise((resolve, reject) => {
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return resolve(null);
        const text = await file.text();
        const data = JSON.parse(text);
        const response = await fetch(`${API_BASE}/api/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        resolve(response.json());
      };
      input.click();
    });
  },
};
