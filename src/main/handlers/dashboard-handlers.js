const { safeHandle } = require('../utils/safe-handler');

function register(ipcMain, getDb, getHS, notifyDomain) {
  safeHandle(ipcMain, 'db:getDashboardData', () => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    const planEntries = db.prepare(`
      SELECT dpe.grams, fi.kcal_per_100g
      FROM daily_plan_entries dpe JOIN daily_plans dp ON dpe.daily_plan_id = dp.id JOIN food_items fi ON dpe.food_item_id = fi.id
      WHERE dp.date = ?
    `).all(today);
    const todayCalories = planEntries.reduce((sum, e) => sum + (e.grams / 100) * e.kcal_per_100g, 0);

    const latestWeight = db.prepare('SELECT weight_kg FROM weight_entries ORDER BY date DESC LIMIT 1').get() ||
      db.prepare('SELECT weight_kg FROM measurement_sets ORDER BY date DESC LIMIT 1').get();

    const measurements = db.prepare('SELECT date, waist_cm FROM measurement_sets ORDER BY date DESC LIMIT 2').all();
    let measurementDelta = null;
    if (measurements.length >= 2 && measurements[0].waist_cm && measurements[1].waist_cm) {
      measurementDelta = measurements[0].waist_cm - measurements[1].waist_cm;
    }

    const nextWorkout = db.prepare("SELECT date FROM training_sessions WHERE date >= ? ORDER BY date ASC LIMIT 1").get(today);

    const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
    let weekBalance = null;
    if (profile) {
      let bmr;
      if (profile.sex === 'male') bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5;
      else bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const startDate = weekAgo.toISOString().split('T')[0];
      const days = db.prepare(`
        SELECT a.date, a.steps, COALESCE(SUM(s.calories), 0) as sport_cal
        FROM activity_days a LEFT JOIN sport_activities s ON a.date = s.date
        WHERE a.date >= ? GROUP BY a.date
      `).all(startDate);

      let netBalance = 0;
      for (const d of days) {
        const neat = (d.steps || 0) * 0.04;
        const tdee = bmr + (d.sport_cal || 0) + neat;
        const entries = db.prepare('SELECT dpe.grams, fi.kcal_per_100g FROM daily_plan_entries dpe JOIN daily_plans dp ON dpe.daily_plan_id = dp.id JOIN food_items fi ON dpe.food_item_id = fi.id WHERE dp.date = ?').all(d.date);
        netBalance += tdee - entries.reduce((sum, e) => sum + (e.grams / 100) * e.kcal_per_100g, 0);
      }
      weekBalance = netBalance;
    }

    return { todayCalories: todayCalories > 0 ? todayCalories : null, weekBalance, latestWeight: latestWeight?.weight_kg || null, measurementDelta, nextWorkout: nextWorkout?.date || null };
  });

  safeHandle(ipcMain, 'db:getSleepAnalysis', (from, to) => {
    const db = getDb();
    const data = db.prepare('SELECT date, sleep_hours, sleep_deep, sleep_rem, sleep_light FROM activity_days WHERE date >= ? AND date <= ? AND sleep_hours IS NOT NULL ORDER BY date ASC').all(from, to);
    if (data.length === 0) return { ok: true, totalAvg: null, deepAvg: null, remAvg: null, lightAvg: null, consistency: null, dailySeries: [], trendArrow: null };
    const totalAvg = data.reduce((s, d) => s + d.sleep_hours, 0) / data.length;
    const deepValues = data.filter(d => d.sleep_deep != null);
    const remValues = data.filter(d => d.sleep_rem != null);
    const lightValues = data.filter(d => d.sleep_light != null);
    const deepAvg = deepValues.length > 0 ? deepValues.reduce((s, d) => s + d.sleep_deep, 0) / deepValues.length : null;
    const remAvg = remValues.length > 0 ? remValues.reduce((s, d) => s + d.sleep_rem, 0) / remValues.length : null;
    const lightAvg = lightValues.length > 0 ? lightValues.reduce((s, d) => s + d.sleep_light, 0) / lightValues.length : null;
    const mean = totalAvg;
    const variance = data.reduce((s, d) => s + Math.pow(d.sleep_hours - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, Math.min(100, 100 - stdDev * 20));
    const midPoint = Math.floor(data.length / 2);
    const firstHalfAvg = data.slice(0, midPoint).reduce((s, d) => s + d.sleep_hours, 0) / Math.max(1, midPoint);
    const secondHalfAvg = data.slice(midPoint).reduce((s, d) => s + d.sleep_hours, 0) / Math.max(1, data.length - midPoint);
    const pctChange = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    const trendArrow = pctChange > 5 ? 'up' : pctChange < -5 ? 'down' : 'flat';
    return { ok: true, totalAvg, deepAvg, remAvg, lightAvg, consistency, dailySeries: data, trendArrow };
  });

  safeHandle(ipcMain, 'db:getCyclingDistance', (from, to) => {
    const hs = getHS();
    if (!hs) return { ok: false, error: 'HealthSync not available' };
    const data = hs.prepare('SELECT date(start_date) as date, ROUND(SUM(value), 3) as km FROM distance_cycling WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to);
    return { ok: true, data };
  });
}

module.exports = { register };
