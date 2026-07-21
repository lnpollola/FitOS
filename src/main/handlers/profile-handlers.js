const { refreshCaches } = require('../../db/database');
const { safeHandle } = require('../utils/safe-handler');

function register(ipcMain, getDb, getHS, notifyDomain) {
  safeHandle(ipcMain, 'db:getProfile', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM user_profile WHERE id = 1').get() || null;
  });

  safeHandle(ipcMain, 'db:saveProfile', (profile) => {
    const db = getDb();
    db.prepare(`
      INSERT INTO user_profile (id, age, sex, height_cm, weight_kg, activity_baseline, updated_at)
      VALUES (1, @age, @sex, @height_cm, @weight_kg, @activity_baseline, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        age = @age, sex = @sex, height_cm = @height_cm, weight_kg = @weight_kg,
        activity_baseline = @activity_baseline, updated_at = datetime('now')
    `).run(profile);
    return true;
  });
}

module.exports = { register };
