const { ipcMain } = require('electron');
const { getDb, initHealthsyncDb, getHealthsyncDb } = require('../db/database');
const { getHealthsyncPath } = require('./apple-health-import');

const { register: registerProfile } = require('./handlers/profile-handlers');
const { register: registerActivity } = require('./handlers/activity-handlers');
const { register: registerDiet } = require('./handlers/diet-handlers');
const { register: registerTraining } = require('./handlers/training-handlers');
const { register: registerMeasurements } = require('./handlers/measurements-handlers');
const { register: registerEnergy } = require('./handlers/energy-handlers');
const { register: registerSettings } = require('./handlers/settings-handlers');
const { register: registerHealth } = require('./handlers/health-handlers');
const { register: registerDashboard } = require('./handlers/dashboard-handlers');

function getHS() {
  let hs = getHealthsyncDb();
  if (!hs) {
    initHealthsyncDb();
    hs = getHealthsyncDb();
  }
  return hs;
}

function registerIpcHandlers(mainWindow) {
  global._mainWindow = mainWindow;
  const _getDb = () => getDb();
  const _getHS = () => getHS();
  const _notifyDomain = (domain) => {
    try { mainWindow.webContents.send('domain-changed', domain); } catch {}
  };

  registerProfile(ipcMain, _getDb, _getHS, _notifyDomain);
  registerActivity(ipcMain, _getDb, _getHS, _notifyDomain);
  registerDiet(ipcMain, _getDb, _getHS, _notifyDomain);
  registerTraining(ipcMain, _getDb, _getHS, _notifyDomain);
  registerMeasurements(ipcMain, _getDb, _getHS, _notifyDomain);
  registerEnergy(ipcMain, _getDb, _getHS, _notifyDomain);
  registerSettings(ipcMain, _getDb, _getHS, _notifyDomain);
  registerHealth(ipcMain, _getDb, _getHS, _notifyDomain);
  registerDashboard(ipcMain, _getDb, _getHS, _notifyDomain);
}

module.exports = { registerIpcHandlers };
