const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (view) => ipcRenderer.send('navigate', view),
  onNavigate: (callback) => ipcRenderer.on('navigate', (_event, view) => callback(view)),
  onDataChanged: (callback) => ipcRenderer.on('data-changed', () => callback()),

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

  // Diet
  getFoodItems: (includeHidden) => ipcRenderer.invoke('db:getFoodItems', includeHidden),
  saveFoodItem: (item) => ipcRenderer.invoke('db:saveFoodItem', item),
  hideFoodItem: (id) => ipcRenderer.invoke('db:hideFoodItem', id),
  unhideFoodItem: (id) => ipcRenderer.invoke('db:unhideFoodItem', id),
  getMealTemplates: () => ipcRenderer.invoke('db:getMealTemplates'),
  getDailyPlan: (date) => ipcRenderer.invoke('db:getDailyPlan', date),
  saveDailyPlanEntry: (entry) => ipcRenderer.invoke('db:saveDailyPlanEntry', entry),

  // Body measurements
  getMeasurementSets: () => ipcRenderer.invoke('db:getMeasurementSets'),
  saveMeasurementSet: (set) => ipcRenderer.invoke('db:saveMeasurementSet', set),
  getWeightEntries: () => ipcRenderer.invoke('db:getWeightEntries'),
  saveWeightEntry: (entry) => ipcRenderer.invoke('db:saveWeightEntry', entry),

  // Training
  getExerciseLibrary: () => ipcRenderer.invoke('db:getExerciseLibrary'),
  saveExercise: (exercise) => ipcRenderer.invoke('db:saveExercise', exercise),
  getTrainingSessions: () => ipcRenderer.invoke('db:getTrainingSessions'),
  saveTrainingSession: (session) => ipcRenderer.invoke('db:saveTrainingSession', session),
  getTrainingSets: (sessionId) => ipcRenderer.invoke('db:getTrainingSets', sessionId),
  saveTrainingSet: (set) => ipcRenderer.invoke('db:saveTrainingSet', set),
  getTrainingRoutines: () => ipcRenderer.invoke('db:getTrainingRoutines'),
  saveTrainingRoutine: (routine) => ipcRenderer.invoke('db:saveTrainingRoutine', routine),

  // Energy balance
  getEnergyBalance: (date) => ipcRenderer.invoke('db:getEnergyBalance', date),
  getWeeklyBalance: () => ipcRenderer.invoke('db:getWeeklyBalance'),

  // Settings
  getSetting: (key) => ipcRenderer.invoke('db:getSetting', key),
  setSetting: (key, value) => ipcRenderer.invoke('db:setSetting', key, value),
  getTrendWeight: () => ipcRenderer.invoke('db:getTrendWeight'),
  getRecompData: () => ipcRenderer.invoke('db:getRecompData'),

  // Dashboard
  getDashboardData: () => ipcRenderer.invoke('db:getDashboardData'),

  // Export / Import
  exportData: () => ipcRenderer.invoke('export:data'),
  importData: () => ipcRenderer.invoke('import:data'),
});
