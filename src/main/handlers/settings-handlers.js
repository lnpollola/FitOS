const { dialog } = require('electron');
const { exportAllData, importAllData } = require('../../db/import-export');

function register(ipcMain, getDb, getHS) {
  ipcMain.handle('db:getSetting', (_event, key) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row?.value || null;
  });

  ipcMain.handle('db:setSetting', (_event, key, value) => {
    const db = getDb();
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, value, value);
    return true;
  });

  ipcMain.handle('db:getLastImportTimestamp', () => {
    const db = getDb();
    const row = db.prepare("SELECT value FROM settings WHERE key = 'health_last_import'").get();
    return row?.value || null;
  });

  ipcMain.handle('db:setLastImportTimestamp', (_event, timestamp) => {
    const db = getDb();
    db.prepare("INSERT INTO settings (key, value) VALUES ('health_last_import', ?) ON CONFLICT(key) DO UPDATE SET value = ?").run(timestamp, timestamp);
    return true;
  });

  ipcMain.handle('db:getTrendWeight', () => {
    const db = getDb();
    const weights = db.prepare('SELECT date, weight_kg FROM weight_entries ORDER BY date DESC LIMIT 14').all();
    if (weights.length === 0) return null;
    const avg = weights.reduce((sum, w) => sum + w.weight_kg, 0) / weights.length;
    return { trendWeight: avg, daysLogged: weights.length, firstDate: weights[0].date, lastDate: weights[weights.length - 1].date };
  });

  ipcMain.handle('db:getWeightStats', (_event, from, to) => {
    const db = getDb();
    const entries = db.prepare('SELECT date, weight_kg FROM weight_entries WHERE date >= ? AND date <= ? ORDER BY date ASC').all(from, to);
    if (entries.length < 2) return { first: null, last: null, min: null, max: null, avg: null, trend: null, count: entries.length };
    const weights = entries.map(e => e.weight_kg);
    const first = weights[0];
    const last = weights[weights.length - 1];
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const avg = weights.reduce((s, w) => s + w, 0) / weights.length;
    const n = weights.length;
    const indices = weights.map((_, i) => i);
    const sumX = indices.reduce((s, x) => s + x, 0);
    const sumY = weights.reduce((s, y) => s + y, 0);
    const sumXY = indices.reduce((s, x, i) => s + x * weights[i], 0);
    const sumXX = indices.reduce((s, x) => s + x * x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return { first, last, min, max, avg, trend: slope, count: entries.length };
  });

  ipcMain.handle('export:data', async () => {
    const result = await dialog.showSaveDialog({ defaultPath: `health-data-${new Date().toISOString().split('T')[0]}.json`, filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (!result.canceled && result.filePath) { try { exportAllData(result.filePath); return true; } catch (e) { return false; } }
    return false;
  });

  ipcMain.handle('import:data', async () => {
    const result = await dialog.showOpenDialog({ filters: [{ name: 'JSON', extensions: ['json'] }], properties: ['openFile'] });
    if (!result.canceled && result.filePaths[0]) {
      const { response } = await dialog.showMessageBox({ type: 'warning', buttons: ['Cancel', 'Import'], defaultId: 0, message: 'This will replace all existing data. Are you sure?' });
      if (response === 1) { try { importAllData(result.filePaths[0]); return true; } catch (e) { return false; } }
    }
    return false;
  });
}

module.exports = { register };
