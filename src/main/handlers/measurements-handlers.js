const { refreshCaches } = require('../../db/database');
const { safeHandle } = require('../utils/safe-handler');

function register(ipcMain, getDb, getHS, notifyDomain) {
  safeHandle(ipcMain, 'db:getMeasurementSets', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM measurement_sets ORDER BY date DESC LIMIT 365').all();
  });

  safeHandle(ipcMain, 'db:getLatestMeasurementSet', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM measurement_sets ORDER BY date DESC LIMIT 1').get() || null;
  });

  safeHandle(ipcMain, 'db:saveMeasurementSet', (set) => {
    const db = getDb();
    const columns = Object.keys(set).filter(k => k !== 'date' && k !== 'id');
    const placeholders = columns.map(c => `@${c}`).join(', ');
    const colNames = columns.join(', ');
    const updateSet = columns.map(c => `${c} = @${c}`).join(', ');
    const existing = db.prepare('SELECT id FROM measurement_sets WHERE date = ?').get(set.date);
    if (existing) {
      db.prepare(`UPDATE measurement_sets SET ${updateSet} WHERE date = @date`).run(set);
    } else {
      db.prepare(`INSERT INTO measurement_sets (date, ${colNames}) VALUES (@date, ${placeholders})`).run(set);
    }
    refreshCaches(); if (notifyDomain) notifyDomain("measurements");
    return true;
  });

  safeHandle(ipcMain, 'db:deleteMeasurementSet', (id) => {
    const db = getDb();
    db.prepare('DELETE FROM measurement_sets WHERE id = ?').run(id);
    return true;
  });

  safeHandle(ipcMain, 'db:getWeightEntries', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM weight_entries ORDER BY date DESC LIMIT 365').all();
  });

  safeHandle(ipcMain, 'db:saveWeightEntry', (entry) => {
    const db = getDb();
    db.prepare('INSERT INTO weight_entries (date, weight_kg) VALUES (@date, @weight_kg)').run(entry);
    refreshCaches(); if (notifyDomain) notifyDomain("measurements");
    return true;
  });

  safeHandle(ipcMain, 'db:deleteWeightEntry', (id) => {
    const db = getDb();
    db.prepare('DELETE FROM weight_entries WHERE id = ?').run(id);
    return true;
  });
}

module.exports = { register };
