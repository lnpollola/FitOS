function register(ipcMain, getDb, getHS) {
  function bmr(profile) {
    if (profile.sex === 'male') return 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5;
    return 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161;
  }

  ipcMain.handle('db:getEnergyBalance', (_event, date) => {
    const db = getDb();
    const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
    if (!profile) return null;
    const b = bmr(profile);
    const sportCal = db.prepare('SELECT COALESCE(SUM(calories), 0) as total FROM sport_activities WHERE date = ?').get(date);
    const day = db.prepare('SELECT steps FROM activity_days WHERE date = ?').get(date);
    const steps = day?.steps || 0;
    const neat = steps * 0.04;
    const planEntries = db.prepare(`
      SELECT dpe.grams, fi.kcal_per_100g
      FROM daily_plan_entries dpe JOIN daily_plans dp ON dpe.daily_plan_id = dp.id JOIN food_items fi ON dpe.food_item_id = fi.id
      WHERE dp.date = ?
    `).all(date);
    const plannedIntake = planEntries.reduce((sum, e) => sum + (e.grams / 100) * e.kcal_per_100g, 0);
    return { bmr: b, sport_calories: sportCal?.total || 0, neat, tdee: b + (sportCal?.total || 0) + neat, planned_intake: plannedIntake };
  });

  ipcMain.handle('db:getWeeklyBalance', () => {
    const db = getDb();
    const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
    if (!profile) return null;
    const b = bmr(profile);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const startDate = weekAgo.toISOString().split('T')[0];
    const cached = db.prepare('SELECT date, steps, sport_kcal FROM activity_summary_cache WHERE period_days = 7 AND date >= ? ORDER BY date').all(startDate);
    const days = cached.length > 0 ? cached : db.prepare(`
      SELECT a.date, a.steps, COALESCE(SUM(s.calories), 0) as sport_cal
      FROM activity_days a LEFT JOIN sport_activities s ON a.date = s.date
      WHERE a.date >= ? GROUP BY a.date
    `).all(startDate);
    let netBalance = 0;
    for (const d of days) {
      const neat = (d.steps || 0) * 0.04;
      const sportCal = d.sport_kcal || d.sport_cal || 0;
      const tdee = b + sportCal + neat;
      const entries = db.prepare('SELECT dpe.grams, fi.kcal_per_100g FROM daily_plan_entries dpe JOIN daily_plans dp ON dpe.daily_plan_id = dp.id JOIN food_items fi ON dpe.food_item_id = fi.id WHERE dp.date = ?').all(d.date);
      netBalance += tdee - entries.reduce((sum, e) => sum + (e.grams / 100) * e.kcal_per_100g, 0);
    }
    return { net_balance: netBalance, days_logged: days.length };
  });

  ipcMain.handle('db:adjustMealGrams', (_event, { carbDelta, fatDelta }) => {
    try {
      const db = getDb();
      const changes = [];
      const carbComponents = db.prepare(`
        SELECT mc.id, mc.default_grams, fi.name as food_name
        FROM meal_components mc JOIN food_items fi ON mc.food_item_id = fi.id
        WHERE fi.carbs_per_100g > fi.protein_per_100g AND fi.carbs_per_100g > fi.fat_per_100g
      `).all();
      for (const c of carbComponents) {
        const newGrams = Math.max(0, c.default_grams + carbDelta);
        db.prepare('UPDATE meal_components SET default_grams = ? WHERE id = ?').run(newGrams, c.id);
        changes.push({ name: c.food_name, oldGrams: c.default_grams, newGrams });
      }
      const fatComponents = db.prepare(`
        SELECT mc.id, mc.default_grams, fi.name as food_name
        FROM meal_components mc JOIN food_items fi ON mc.food_item_id = fi.id
        WHERE fi.fat_per_100g > fi.protein_per_100g AND fi.fat_per_100g > fi.carbs_per_100g
      `).all();
      for (const f of fatComponents) {
        const newGrams = Math.max(0, f.default_grams + fatDelta);
        db.prepare('UPDATE meal_components SET default_grams = ? WHERE id = ?').run(newGrams, f.id);
        changes.push({ name: f.food_name, oldGrams: f.default_grams, newGrams });
      }
      return { ok: true, changes };
    } catch (e) { return { ok: false, error: e.message }; }
  });
}

module.exports = { register };
