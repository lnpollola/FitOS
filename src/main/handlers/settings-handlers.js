const { dialog } = require('electron');
const { safeHandle } = require('../utils/safe-handler');
const { exportAllData, importAllData } = require('../../db/import-export');

function register(ipcMain, getDb, getHS, notifyDomain) {
  safeHandle(ipcMain, 'db:getSetting', (key) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row?.value || null;
  });

  safeHandle(ipcMain, 'db:setSetting', (key, value) => {
    const db = getDb();
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, value, value);
    return true;
  });

  safeHandle(ipcMain, 'db:getLastImportTimestamp', () => {
    const db = getDb();
    const row = db.prepare("SELECT value FROM settings WHERE key = 'health_last_import'").get();
    return row?.value || null;
  });

  safeHandle(ipcMain, 'db:getWeightStats', (from, to) => {
    const db = getDb();
    const entries = db.prepare('SELECT date, weight_kg FROM weight_entries WHERE date >= ? AND date <= ? ORDER BY date ASC').all(from, to);
    if (entries.length === 0) return { first: null, last: null, min: null, max: null, avg: null, trend: null, count: 0, series: [] };
    const weights = entries.map(e => e.weight_kg);
    const first = weights[0];
    const last = weights[weights.length - 1];
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const avg = weights.reduce((s, w) => s + w, 0) / weights.length;
    if (entries.length < 2) return { first, last, min, max, avg, trend: null, count: entries.length, series: weights };
    const n = weights.length;
    const indices = weights.map((_, i) => i);
    const sumX = indices.reduce((s, x) => s + x, 0);
    const sumY = weights.reduce((s, y) => s + y, 0);
    const sumXY = indices.reduce((s, x, i) => s + x * weights[i], 0);
    const sumXX = indices.reduce((s, x) => s + x * x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return { first, last, min, max, avg, trend: slope, count: entries.length, series: weights };
  });

  safeHandle(ipcMain, 'export:data', async () => {
    const result = await dialog.showSaveDialog({ defaultPath: `health-data-${new Date().toISOString().split('T')[0]}.json`, filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (!result.canceled && result.filePath) { try { exportAllData(result.filePath); return true; } catch (e) { return false; } }
    return false;
  });

  safeHandle(ipcMain, 'import:data', async () => {
    const result = await dialog.showOpenDialog({ filters: [{ name: 'JSON', extensions: ['json'] }], properties: ['openFile'] });
    if (!result.canceled && result.filePaths[0]) {
      const { response } = await dialog.showMessageBox({ type: 'warning', buttons: ['Cancel', 'Import'], defaultId: 0, message: 'This will replace all existing data. Are you sure?' });
      if (response === 1) { try { importAllData(result.filePaths[0]); if (notifyDomain) notifyDomain("settings"); return true; } catch (e) { return false; } }
    }
    return false;
  });
}

module.exports = { register };
