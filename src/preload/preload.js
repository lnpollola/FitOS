const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (view) => ipcRenderer.send('navigate', view),
  onNavigate: (callback) => ipcRenderer.on('navigate', (_event, view) => callback(view)),
  onDataChanged: (callback) => ipcRenderer.on('data-changed', () => callback()),
  onDomainChanged: (callback) => ipcRenderer.on('domain-changed', (_event, domain) => callback(domain)),
  onHealthImportProgress: (callback) => ipcRenderer.on('health-import-progress', (_event, msg) => callback(msg)),
  removeHealthImportProgressListener: () => ipcRenderer.removeAllListeners('health-import-progress'),

  // Profile
  getProfile: () => ipcRenderer.invoke('db:getProfile'),
  saveProfile: (profile) => ipcRenderer.invoke('db:saveProfile', profile),

  // Activity days
  getActivityDays: () => ipcRenderer.invoke('db:getActivityDays'),
  saveActivityDay: (day) => ipcRenderer.invoke('db:saveActivityDay', day),
  getSportActivities: (date) => ipcRenderer.invoke('db:getSportActivities', date),
  saveSportActivity: (activity) => ipcRenderer.invoke('db:saveSportActivity', activity),
  importActivityCSV: (csvPath) => ipcRenderer.invoke('db:importActivityCSV', csvPath),
  getWeeklySportSummary: () => ipcRenderer.invoke('db:getWeeklySportSummary'),
  getActivityKcalByType: (from, to) => ipcRenderer.invoke('db:getActivityKcalByType', from, to),
  getSportSummaryByRange: (from, to) => ipcRenderer.invoke('db:getSportSummaryByRange', from, to),
  getActivityComparison: (from, to) => ipcRenderer.invoke('db:getActivityComparison', from, to),
  getSportLifetimeStats: () => ipcRenderer.invoke('db:getSportLifetimeStats'),
  getWeightStats: (from, to) => ipcRenderer.invoke('db:getWeightStats', from, to),
  searchFoodItems: (query) => ipcRenderer.invoke('db:searchFoodItems', query),

  // Diet
  getFoodItems: (includeHidden) => ipcRenderer.invoke('db:getFoodItems', includeHidden),
  saveFoodItem: (item) => ipcRenderer.invoke('db:saveFoodItem', item),
  hideFoodItem: (id) => ipcRenderer.invoke('db:hideFoodItem', id),
  unhideFoodItem: (id) => ipcRenderer.invoke('db:unhideFoodItem', id),
  getMealTemplates: () => ipcRenderer.invoke('db:getMealTemplates'),
  getDailyPlan: (date) => ipcRenderer.invoke('db:getDailyPlan', date),
  saveDailyPlanEntry: (entry) => ipcRenderer.invoke('db:saveDailyPlanEntry', entry),
  deleteDailyPlanEntry: (id) => ipcRenderer.invoke('db:deleteDailyPlanEntry', id),
  deleteDailyPlanEntries: (date) => ipcRenderer.invoke('db:deleteDailyPlanEntries', date),
  updateDailyPlanEntry: (id, grams) => ipcRenderer.invoke('db:updateDailyPlanEntry', id, grams),

  // Body measurements
  getMeasurementSets: () => ipcRenderer.invoke('db:getMeasurementSets'),
  getLatestMeasurementSet: () => ipcRenderer.invoke('db:getLatestMeasurementSet'),
  saveMeasurementSet: (set) => ipcRenderer.invoke('db:saveMeasurementSet', set),
  deleteMeasurementSet: (id) => ipcRenderer.invoke('db:deleteMeasurementSet', id),
  getWeightEntries: () => ipcRenderer.invoke('db:getWeightEntries'),
  saveWeightEntry: (entry) => ipcRenderer.invoke('db:saveWeightEntry', entry),
  deleteWeightEntry: (id) => ipcRenderer.invoke('db:deleteWeightEntry', id),

  // Training
  getExerciseLibrary: () => ipcRenderer.invoke('db:getExerciseLibrary'),
  saveExercise: (exercise) => ipcRenderer.invoke('db:saveExercise', exercise),
  getTrainingSessions: () => ipcRenderer.invoke('db:getTrainingSessions'),
  saveTrainingSession: (session) => ipcRenderer.invoke('db:saveTrainingSession', session),
  deleteTrainingSession: (id) => ipcRenderer.invoke('db:deleteTrainingSession', id),
  getTrainingSets: (sessionId) => ipcRenderer.invoke('db:getTrainingSets', sessionId),
  saveTrainingSet: (set) => ipcRenderer.invoke('db:saveTrainingSet', set),
  deleteTrainingSet: (id) => ipcRenderer.invoke('db:deleteTrainingSet', id),
  deleteExercise: (id) => ipcRenderer.invoke('db:deleteExercise', id),
  getTrainingRoutines: () => ipcRenderer.invoke('db:getTrainingRoutines'),
  saveTrainingRoutine: (routine) => ipcRenderer.invoke('db:saveTrainingRoutine', routine),
  deleteTrainingRoutine: (id) => ipcRenderer.invoke('db:deleteTrainingRoutine', id),

  // Energy balance
  getEnergyBalance: (date) => ipcRenderer.invoke('db:getEnergyBalance', date),
  getWeeklyBalance: () => ipcRenderer.invoke('db:getWeeklyBalance'),
  adjustMealGrams: (deltas) => ipcRenderer.invoke('db:adjustMealGrams', deltas),

  // Settings
  getSetting: (key) => ipcRenderer.invoke('db:getSetting', key),
  setSetting: (key, value) => ipcRenderer.invoke('db:setSetting', key, value),
  getTrendWeight: () => ipcRenderer.invoke('db:getTrendWeight'),
  getLastImportTimestamp: () => ipcRenderer.invoke('db:getLastImportTimestamp'),
  setLastImportTimestamp: (timestamp) => ipcRenderer.invoke('db:setLastImportTimestamp', timestamp),
  getHealthsyncDbInfo: () => ipcRenderer.invoke('db:getHealthsyncDbInfo'),

  // Dashboard
  getDashboardData: () => ipcRenderer.invoke('db:getDashboardData'),
  getSleepData: (from, to) => ipcRenderer.invoke('db:getSleepData', from, to),
  getSleepAnalysis: (from, to) => ipcRenderer.invoke('db:getSleepAnalysis', from, to),
  getCyclingDistance: (from, to) => ipcRenderer.invoke('db:getCyclingDistance', from, to),

  // Elaborated dishes
  saveDish: (dish) => ipcRenderer.invoke('db:saveDish', dish),
  getDishes: () => ipcRenderer.invoke('db:getDishes'),
  getDishIngredients: (dishId) => ipcRenderer.invoke('db:getDishIngredients', dishId),
  deleteDish: (dishId) => ipcRenderer.invoke('db:deleteDish', dishId),
  saveDishIngredient: (ingredient) => ipcRenderer.invoke('db:saveDishIngredient', ingredient),

  // Meal dish options
  linkDishToMeal: (link) => ipcRenderer.invoke('db:linkDishToMeal', link),
  getDishesForMeal: (mealTemplateId) => ipcRenderer.invoke('db:getDishesForMeal', mealTemplateId),
  unlinkDish: (id) => ipcRenderer.invoke('db:unlinkDish', id),

  // Workout plans
  getWorkoutPlans: () => ipcRenderer.invoke('db:getWorkoutPlans'),
  getPlanDays: (planId) => ipcRenderer.invoke('db:getPlanDays', planId),
  getExercisesByIds: (ids) => ipcRenderer.invoke('db:getExercisesByIds', ids),

  // Apple Health
  checkHealthsync: () => ipcRenderer.invoke('db:checkHealthsync'),
  installHealthsync: () => ipcRenderer.invoke('db:installHealthsync'),
  syncAppleHealth: (options) => ipcRenderer.invoke('db:syncAppleHealth', options),
  resetAndSyncHealthsync: () => ipcRenderer.invoke('db:resetAndSyncHealthsync'),
  getHealthDailySummary: (from, to) => ipcRenderer.invoke('health:getDailySummary', from, to),
  getHealthWorkouts: (limit) => ipcRenderer.invoke('health:getWorkouts', limit),
  getHealthSleep: (limit) => ipcRenderer.invoke('health:getSleep', limit),
  getHealthHRV: (limit) => ipcRenderer.invoke('health:getHRV', limit),
  getHealthBodyMass: (limit) => ipcRenderer.invoke('health:getBodyMass', limit),
  getHealthHRVWeekly: (limit) => ipcRenderer.invoke('health:getHRVWeekly', limit),
  getHealthHeartRateDaily: (limit) => ipcRenderer.invoke('health:getHeartRateDaily', limit),
  getHealthStats: () => ipcRenderer.invoke('health:getStats'),
  syncHealthToApp: () => ipcRenderer.invoke('health:syncToApp'),

  // Health Analytics (date-range queries)
  getHealthHeartRateRange: (from, to) => ipcRenderer.invoke('health:getHeartRateRange', from, to),
  getHealthHRVRange: (from, to) => ipcRenderer.invoke('health:getHRVRange', from, to),
  getHealthSleepRange: (from, to) => ipcRenderer.invoke('health:getSleepRange', from, to),
  getHealthWorkoutRange: (from, to) => ipcRenderer.invoke('health:getWorkoutRange', from, to),
  getHealthWorkoutRanking: (from, to) => ipcRenderer.invoke('health:getWorkoutRanking', from, to),
  getHealthRestingHeartRateRange: (from, to) => ipcRenderer.invoke('health:getRestingHeartRateRange', from, to),
  getHealthVO2MaxRange: (from, to) => ipcRenderer.invoke('health:getVO2MaxRange', from, to),
  getHealthExerciseTimeRange: (from, to) => ipcRenderer.invoke('health:getExerciseTimeRange', from, to),
  getHealthDistanceSummary: (from, to) => ipcRenderer.invoke('health:getDistanceSummary', from, to),
  getHealthWalkingSpeedRange: (from, to) => ipcRenderer.invoke('health:getWalkingSpeedRange', from, to),
  getHealthFlightsClimbedRange: (from, to) => ipcRenderer.invoke('health:getFlightsClimbedRange', from, to),

  // HealthSync dashboard metrics (v3)
  getHealthBloodPressure: (from, to) => ipcRenderer.invoke('health:getBloodPressure', from, to),
  getHealthStandingHours: (from, to) => ipcRenderer.invoke('health:getStandingHours', from, to),
  getHealthExerciseTime: (from, to) => ipcRenderer.invoke('health:getExerciseTime', from, to),
  getHealthWalkingDistance: (from, to) => ipcRenderer.invoke('health:getWalkingDistance', from, to),
  getHealthSpO2Range: (from, to) => ipcRenderer.invoke('health:getSpO2Range', from, to),
  getHealthDashboardMetrics: (from, to) => ipcRenderer.invoke('health:getDashboardMetrics', from, to),

  // Export / Import
  exportData: () => ipcRenderer.invoke('export:data'),
  importData: () => ipcRenderer.invoke('import:data'),
});
