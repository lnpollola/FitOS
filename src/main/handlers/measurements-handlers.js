const { refreshCaches } = require('../../db/database');

function register(ipcMain, getDb, getHS) {
  ipcMain.handle('db:getMeasurementSets', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM measurement_sets ORDER BY date DESC').all();
  });

  ipcMain.handle('db:getLatestMeasurementSet', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM measurement_sets ORDER BY date DESC LIMIT 1').get() || null;
  });

  ipcMain.handle('db:saveMeasurementSet', (_event, set) => {
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

  ipcMain.handle('db:deleteMeasurementSet', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM measurement_sets WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('db:getWeightEntries', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM weight_entries ORDER BY date DESC').all();
  });

  ipcMain.handle('db:saveWeightEntry', (_event, entry) => {
    const db = getDb();
    db.prepare('INSERT INTO weight_entries (date, weight_kg) VALUES (@date, @weight_kg)').run(entry);
    refreshCaches(); if (notifyDomain) notifyDomain("measurements");
    return true;
  });

  ipcMain.handle('db:deleteWeightEntry', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM weight_entries WHERE id = ?').run(id);
    return true;
  });
}

module.exports = { register };
