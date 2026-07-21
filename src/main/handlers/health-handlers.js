const { initHealthsyncDb, getHealthsyncDb, refreshCaches } = require('../../db/database');
const { safeHandle } = require('../utils/safe-handler');
const { migrateHealthData } = require('../apple-health-import');

const resolveSportType = (type) => ({
  'HKWorkoutActivityTypeRunning': 'running',
  'HKWorkoutActivityTypeCycling': 'cycling',
  'HKWorkoutActivityTypeWalking': 'walking',
  'HKWorkoutActivityTypeSwimming': 'swimming',
  'HKWorkoutActivityTypeYoga': 'yoga',
  'HKWorkoutActivityTypeHighIntensityIntervalTraining': 'HIIT',
  'HKWorkoutActivityTypeTraditionalStrengthTraining': 'strength',
  'HKWorkoutActivityTypeFunctionalStrengthTraining': 'strength',
  'HKWorkoutActivityTypeSoccer': 'football',
  'HKWorkoutActivityTypePaddleSports': 'paddle',
  'HKWorkoutActivityTypeBoxing': 'boxing',
  'HKWorkoutActivityTypeMixedCardio': 'other',
  'HKWorkoutActivityTypeCoreTraining': 'other',
  'HKWorkoutActivityTypeFlexibility': 'other',
})[type] || 'other';

function register(ipcMain, getDb, getHS, notifyDomain) {
  function getHSOrInit() {
    let hs = getHS();
    if (!hs) { initHealthsyncDb(); hs = getHS(); }
    return hs;
  }

  // HealthSync queries
  safeHandle(ipcMain, 'health:getDailySummary', (from, to) => {
    const hs = getHSOrInit();
    const rows = hs.prepare(`
      SELECT dates.dia,
             COALESCE(s.steps, 0) as steps,
             h.hr_media,
             COALESCE(a.kcal, 0) as kcal_activas,
             COALESCE(b.kcal, 0) as kcal_basales
      FROM (
        SELECT DISTINCT date(start_date) as dia FROM steps WHERE date(start_date) BETWEEN ? AND ?
        UNION SELECT DISTINCT date(start_date) FROM heart_rate WHERE date(start_date) BETWEEN ? AND ?
        UNION SELECT DISTINCT date(start_date) FROM active_energy WHERE date(start_date) BETWEEN ? AND ?
      ) dates
      LEFT JOIN (SELECT date(start_date) as d, SUM(value) as steps FROM steps GROUP BY d) s ON dates.dia = s.d
      LEFT JOIN (SELECT date(start_date) as d, ROUND(AVG(value),1) as hr_media FROM heart_rate GROUP BY d) h ON dates.dia = h.d
      LEFT JOIN (SELECT date(start_date) as d, SUM(value) as kcal FROM active_energy GROUP BY d) a ON dates.dia = a.d
      LEFT JOIN (SELECT date(start_date) as d, SUM(value) as kcal FROM basal_energy GROUP BY d) b ON dates.dia = b.d
      ORDER BY dates.dia DESC
    `).all(from, to, from, to, from, to);
    return { ok: true, data: rows };
  });

  safeHandle(ipcMain, 'health:getWorkouts', (limit = 20) => {
    const hs = getHSOrInit();
    const rows = hs.prepare('SELECT date(start_date) as date, activity_type, ROUND(duration, 1) as minutes, ROUND(total_energy_burned, 0) as kcal, ROUND(total_distance, 2) as km FROM workouts ORDER BY start_date DESC LIMIT ?').all(limit);
    return { ok: true, data: rows.map(r => ({ ...r, activity_type: resolveSportType(r.activity_type) })) };
  });

  safeHandle(ipcMain, 'health:getSleep', (limit = 30) => {
    const hs = getHSOrInit();
    return { ok: true, data: hs.prepare("SELECT date(start_date, '-6 hours') as night, ROUND(SUM((julianday(end_date) - julianday(start_date)) * 24), 2) as hours FROM sleep WHERE value LIKE '%Asleep%' GROUP BY night ORDER BY night DESC LIMIT ?").all(limit) };
  });

  safeHandle(ipcMain, 'health:getHRV', (limit = 30) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(AVG(value), 1) as hrv_ms FROM hrv GROUP BY date ORDER BY date DESC LIMIT ?').all(limit) };
  });

  safeHandle(ipcMain, 'health:getBodyMass', (limit = 30) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, value, unit FROM body_mass ORDER BY start_date DESC LIMIT ?').all(limit) };
  });

  safeHandle(ipcMain, 'health:getHRVWeekly', (limit = 12) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare("SELECT strftime('%Y-W%W', start_date) as week, ROUND(AVG(value), 1) as hrv_ms FROM hrv GROUP BY week ORDER BY week DESC LIMIT ?").all(limit) };
  });

  safeHandle(ipcMain, 'health:getHeartRateDaily', (limit = 30) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(AVG(value), 1) as avg_bpm, ROUND(MIN(value), 0) as min_bpm, ROUND(MAX(value), 0) as max_bpm FROM heart_rate GROUP BY date ORDER BY date DESC LIMIT ?').all(limit) };
  });

  safeHandle(ipcMain, 'health:getStats', () => {
    const hs = getHSOrInit();
    const stats = {};
    const tables = ['steps', 'heart_rate', 'sleep', 'workouts', 'hrv', 'body_mass', 'active_energy'];
    for (const t of tables) { try { stats[t] = hs.prepare(`SELECT COUNT(*) as count FROM ${t.replace('-', '_')}`).get().count; } catch { stats[t] = 0; } }
    const lastRecord = hs.prepare("SELECT date(start_date) as last FROM heart_rate ORDER BY start_date DESC LIMIT 1").get();
    return { ok: true, data: { tables: stats, lastUpdate: lastRecord?.last || null } };
  });

  safeHandle(ipcMain, 'health:syncToApp', () => {
    const result = migrateHealthData(global._mainWindow);
    refreshCaches();
    return result;
  });

  // Analytics range queries
  safeHandle(ipcMain, 'health:getHeartRateRange', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(AVG(value), 1) as avg_bpm, ROUND(MIN(value), 0) as min_bpm, ROUND(MAX(value), 0) as max_bpm FROM heart_rate WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getHRVRange', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(AVG(value), 1) as hrv_ms FROM hrv WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getSleepRange', (from, to) => {
    const hs = getHSOrInit(); 
    const sleepData = hs.prepare("SELECT date(start_date, '-6 hours') as night, ROUND(SUM((julianday(end_date) - julianday(start_date)) * 24), 2) as hours FROM sleep WHERE value LIKE '%Asleep%' AND date(start_date, '-6 hours') BETWEEN ? AND ? GROUP BY night ORDER BY night ASC").all(from, to);
    
    const db = getDb();
    const phasesData = db.prepare('SELECT date, sleep_deep, sleep_rem, sleep_light FROM activity_days WHERE date >= ? AND date <= ? AND sleep_hours IS NOT NULL ORDER BY date ASC').all(from, to);
    
    const mergedData = sleepData.map(s => {
      const phase = phasesData.find(p => p.date === s.night);
      return {
        night: s.night,
        hours: s.hours,
        deep: phase?.sleep_deep || null,
        rem: phase?.sleep_rem || null,
        light: phase?.sleep_light || null
      };
    });
    
    return { ok: true, data: mergedData }; 
  });

  safeHandle(ipcMain, 'health:getWorkoutRange', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, activity_type, ROUND(duration, 1) as minutes, ROUND(total_energy_burned, 0) as kcal, ROUND(total_distance, 2) as km FROM workouts WHERE date(start_date) BETWEEN ? AND ? ORDER BY start_date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getWorkoutRanking', (from, to) => {
    const hs = getHSOrInit(); const rows = hs.prepare('SELECT activity_type, COUNT(*) as count, ROUND(SUM(duration), 1) as total_hours, ROUND(SUM(total_energy_burned), 0) as total_kcal, ROUND(SUM(total_distance), 2) as total_km FROM workouts WHERE date(start_date) BETWEEN ? AND ? GROUP BY activity_type ORDER BY total_kcal DESC').all(from, to); return { ok: true, data: rows.map(r => ({ ...r, activity_type: resolveSportType(r.activity_type) })) };
  });

  safeHandle(ipcMain, 'health:getRestingHeartRateRange', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(AVG(value), 1) as rhr_bpm FROM resting_heart_rate WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getVO2MaxRange', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(AVG(value), 1) as vo2_max FROM vo2_max WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getExerciseTimeRange', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(SUM(value), 1) as minutes FROM exercise_time WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getDistanceSummary', (from, to) => {
    const hs = getHSOrInit(); const walking = hs.prepare('SELECT date(start_date) as date, ROUND(SUM(value), 3) as km FROM distance_walking_running WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to); const cycling = hs.prepare('SELECT date(start_date) as date, ROUND(SUM(value), 3) as km FROM distance_cycling WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to); return { ok: true, data: { walking, cycling } };
  });

  safeHandle(ipcMain, 'health:getWalkingSpeedRange', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(AVG(value), 2) as speed_kmh FROM walking_speed WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getFlightsClimbedRange', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(SUM(value), 0) as count FROM flights_climbed WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getBloodPressure', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, systolic, diastolic FROM blood_pressure WHERE date(start_date) BETWEEN ? AND ? ORDER BY start_date DESC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getStandingHours', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(SUM(value), 1) as hours FROM stand_hours WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getExerciseTime', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(SUM(value), 1) as minutes FROM exercise_time WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getWalkingDistance', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(SUM(value), 3) as km FROM distance_walking_running WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getSpO2Range', (from, to) => {
    const hs = getHSOrInit(); return { ok: true, data: hs.prepare('SELECT date(start_date) as date, ROUND(AVG(value), 1) as spo2_percent FROM spo2 WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to) };
  });

  safeHandle(ipcMain, 'health:getDashboardMetrics', (from, to) => {
    const hs = getHSOrInit();
    const bp = hs.prepare('SELECT date(start_date) as date, systolic, diastolic FROM blood_pressure WHERE date(start_date) BETWEEN ? AND ? ORDER BY start_date ASC').all(from, to);
    const stand = hs.prepare('SELECT date(start_date) as date, ROUND(SUM(value), 1) as hours FROM stand_hours WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to);
    const exercise = hs.prepare('SELECT date(start_date) as date, ROUND(SUM(value), 1) as minutes FROM exercise_time WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to);
    const walk = hs.prepare('SELECT date(start_date) as date, ROUND(SUM(value), 3) as km FROM distance_walking_running WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to);
    const spo2 = hs.prepare('SELECT date(start_date) as date, ROUND(AVG(value), 1) as spo2_percent FROM spo2 WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to);
    const hrv = hs.prepare('SELECT date(start_date) as date, ROUND(AVG(value), 1) as hrv_ms FROM hrv WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to);
    const rhr = hs.prepare('SELECT date(start_date) as date, ROUND(AVG(value), 1) as rhr_bpm FROM resting_heart_rate WHERE date(start_date) BETWEEN ? AND ? GROUP BY date ORDER BY date ASC').all(from, to);
    return { ok: true, data: { blood_pressure: bp, standing_hours: stand, exercise_time: exercise, walking_distance: walk, spo2, hrv, resting_hr: rhr } };
  });
}

module.exports = { register };
