function isoWeekFromDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) return null;
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return { year: target.getUTCFullYear(), week: weekNum };
}

function isoWeekKey(dateStr) {
  const w = isoWeekFromDate(dateStr);
  if (!w) return null;
  return `${w.year}-W${String(w.week).padStart(2, '0')}`;
}

function toIsoDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return toIsoDate(d);
}

function dayDiff(from, to) {
  const d1 = new Date(from + 'T00:00:00Z');
  const d2 = new Date(to + 'T00:00:00Z');
  return Math.round((d2 - d1) / 86400000);
}

const RIEGEL_EXPONENT = 1.06;
const STANDARD_DISTANCES = [
  { km: 1, key: '1', label: '1 km' },
  { km: 1.609, key: '1mi', label: '1 mi' },
  { km: 5, key: '5', label: '5 km' },
  { km: 10, key: '10', label: '10 km' },
  { km: 21.1, key: '21.1', label: 'Media maratón' },
  { km: 42.2, key: '42.2', label: 'Maratón' },
];

function paceProjection(d1Km, t1Min, d2Km) {
  if (!Number.isFinite(d1Km) || !Number.isFinite(t1Min) || !Number.isFinite(d2Km)) return null;
  if (d1Km <= 0 || d2Km <= 0 || t1Min <= 0) return null;
  return t1Min * Math.pow(d2Km / d1Km, RIEGEL_EXPONENT);
}

function isWithinProjectionWindow(d1Km, targetKm) {
  if (!Number.isFinite(d1Km) || !Number.isFinite(targetKm)) return false;
  return d1Km >= 0.8 * targetKm && d1Km <= 1.5 * targetKm;
}

function projectStandardDistances(activities, sportType) {
  const eligible = activities.filter(a =>
    a.sport_type === sportType &&
    Number.isFinite(a.distance_km) && a.distance_km >= 1.0 &&
    Number.isFinite(a.duration_minutes) && a.duration_minutes > 0
  );
  return STANDARD_DISTANCES.map(target => {
    let best = null;
    for (const a of eligible) {
      if (!isWithinProjectionWindow(a.distance_km, target.km)) continue;
      const projected = paceProjection(a.distance_km, a.duration_minutes, target.km);
      if (projected == null) continue;
      if (best == null || projected < best.time_min) {
        best = {
          sport_type: sportType,
          distance_km: target.km,
          distance_key: target.key,
          distance_label: target.label,
          time_min: projected,
          achieved_at: a.date,
        };
      }
    }
    return best;
  }).filter(Boolean);
}

function classifyWHRZone(whr, sex) {
  if (sex === 'female') {
    if (whr < 0.80) return { zone: 'low', zone_label: 'Bajo' };
    if (whr < 0.85) return { zone: 'moderate', zone_label: 'Moderado' };
    return { zone: 'high', zone_label: 'Alto' };
  }
  if (whr < 0.90) return { zone: 'low', zone_label: 'Bajo' };
  if (whr < 1.00) return { zone: 'moderate', zone_label: 'Moderado' };
  return { zone: 'high', zone_label: 'Alto' };
}

function computeWeekStreak(dates) {
  if (dates.length === 0) return 0;
  const allKeys = new Set(dates.map(isoWeekKey));
  const cap = new Date();
  cap.setFullYear(cap.getFullYear() - 10);
  let cursor = new Date();
  for (let i = 0; i < 2; i++) {
    const key = isoWeekKey(toIsoDate(cursor));
    if (allKeys.has(key)) break;
    cursor.setDate(cursor.getDate() - 7);
  }
  const foundKey = isoWeekKey(toIsoDate(cursor));
  if (!allKeys.has(foundKey)) return 0;
  let streak = 1;
  cursor.setDate(cursor.getDate() - 7);
  while (cursor >= cap) {
    const key = isoWeekKey(toIsoDate(cursor));
    if (allKeys.has(key)) { streak += 1; cursor.setDate(cursor.getDate() - 7); }
    else { break; }
  }
  return streak;
}

function computeSignal(rows) {
  if (!rows || rows.length === 0) {
    return { current: null, baseline: null, stddev: null, sparkline: [], daysAvailable: 0 };
  }
  const current = rows.slice(0, 7);
  const baseline = rows.slice(7, 37);
  const currentVals = current.map(r => Number(r.value)).filter(v => Number.isFinite(v));
  const currentMean = currentVals.length > 0
    ? currentVals.reduce((s, v) => s + v, 0) / currentVals.length
    : null;
  const baselineValues = baseline.map(r => Number(r.value)).filter(v => Number.isFinite(v));
  const daysAvailable = baselineValues.length;
  let baselineMean = null;
  if (daysAvailable > 0) {
    baselineMean = baselineValues.reduce((s, v) => s + v, 0) / daysAvailable;
  }
  let stddev = null;
  if (daysAvailable > 1 && baselineMean != null) {
    const sumSq = baselineValues.reduce((s, v) => s + (v - baselineMean) ** 2, 0);
    stddev = Math.round(Math.sqrt(sumSq / daysAvailable) * 10) / 10;
  }
  const sparkline = currentVals;
  return {
    current: currentMean != null ? Math.round(currentMean * 10) / 10 : null,
    baseline: baselineMean != null ? Math.round(baselineMean * 10) / 10 : null,
    stddev,
    sparkline,
    daysAvailable,
  };
}

function register(ipcMain, getDb, getHS, notifyDomain) {
  function getHSOrInit() {
    let hs = getHS();
    if (!hs) {
      const { initHealthsyncDb } = require('../../db/database');
      try { initHealthsyncDb(); hs = getHS(); } catch { return null; }
    }
    return hs;
  }

  ipcMain.handle('db:getYearInMotion', (_event, fromIso, toIso) => {
    const db = getDb();
    if (!fromIso || !toIso) {
      toIso = toIsoDate(new Date());
      fromIso = addDays(toIso, -365);
    }
    const maxFrom = addDays(toIso, -365);
    if (fromIso < maxFrom) fromIso = maxFrom;
    const rows = db.prepare(`
      SELECT date, SUM(duration_minutes) as minutes
      FROM sport_activities WHERE date >= ? AND date <= ?
      GROUP BY date
    `).all(fromIso, toIso);
    const minutesMap = new Map();
    for (const r of rows) minutesMap.set(r.date, Math.round(Number(r.minutes) || 0));
    const totalDays = dayDiff(fromIso, toIso) + 1;
    const points = [];
    for (let i = 0; i < totalDays; i++) {
      const date = addDays(fromIso, i);
      points.push({ date, minutes: minutesMap.get(date) || 0 });
    }
    return { points, totalDays };
  });

  ipcMain.handle('db:getDayOfWeekStats', (_event, fromIso, toIso) => {
    const db = getDb();
    if (!fromIso || !toIso) {
      toIso = toIsoDate(new Date());
      fromIso = addDays(toIso, -90);
    }
    const rows = db.prepare(`
      SELECT date, sport_type, duration_minutes
      FROM sport_activities WHERE date >= ? AND date <= ?
    `).all(fromIso, toIso);
    const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const buckets = Array.from({ length: 7 }, (_, i) => ({
      weekday: i,
      weekday_label: labels[i],
      minutes: 0,
      sessions: 0,
    }));
    for (const r of rows) {
      const dow = ((new Date(r.date + 'T00:00:00').getUTCDay() || 7) - 1);
      if (dow < 0 || dow > 6) continue;
      buckets[dow].minutes += Number(r.duration_minutes) || 0;
      buckets[dow].sessions += 1;
    }
    return buckets;
  });

  ipcMain.handle('db:getSportDistribution', () => {
    const db = getDb();
    const toIso = toIsoDate(new Date());
    const fromIso = addDays(toIso, -90);
    const rows = db.prepare(`
      SELECT sport_type, SUM(duration_minutes) as minutes, COUNT(*) as sessions
      FROM sport_activities WHERE date >= ?
      GROUP BY sport_type ORDER BY minutes DESC
    `).all(fromIso);
    const totalMinutes = rows.reduce((s, r) => s + (Number(r.minutes) || 0), 0);
    const totalSessions = rows.reduce((s, r) => s + (Number(r.sessions) || 0), 0);
    const sports = rows.map(r => ({
      sport_type: r.sport_type,
      minutes: Math.round(Number(r.minutes) || 0),
      sessions: Number(r.sessions) || 0,
      share_pct: totalMinutes > 0 ? Math.round((Number(r.minutes) / totalMinutes) * 1000) / 10 : 0,
    }));
    return { sports, total_minutes: totalMinutes, total_sessions: totalSessions };
  });

  ipcMain.handle('db:getRecoveryScore', () => {
    const db = getDb();
    const hs = getHSOrInit();
    let hrv = null;
    if (hs) {
      try {
        const hrvRows = hs.prepare(`
          SELECT date(start_date) as date, ROUND(AVG(value), 1) as value
          FROM hrv GROUP BY date ORDER BY date DESC LIMIT 37
        `).all().map(r => ({ date: r.date, value: Number(r.value) }));
        hrv = computeSignal(hrvRows);
      } catch { hrv = null; }
    }
    let restingHR = null;
    if (hs) {
      try {
        const rhrRows = hs.prepare(`
          SELECT date(start_date) as date, ROUND(AVG(value), 1) as value
          FROM resting_heart_rate GROUP BY date ORDER BY date DESC LIMIT 37
        `).all().map(r => ({ date: r.date, value: Number(r.value) }));
        restingHR = computeSignal(rhrRows);
      } catch { restingHR = null; }
    }
    let sleep = null;
    try {
      const sleepRows = db.prepare(`
        SELECT date, sleep_hours as value
        FROM activity_days
        WHERE sleep_hours IS NOT NULL
        ORDER BY date DESC LIMIT 37
      `).all().map(r => ({ date: r.date, value: Number(r.value) }));
      sleep = computeSignal(sleepRows);
    } catch { sleep = null; }
    return { hrv, resting_hr: restingHR, sleep, has_healthsync: !!hs };
  });

  ipcMain.handle('db:getWeightVelocity', (_event, fromIso, toIso) => {
    const db = getDb();
    if (!fromIso || !toIso) {
      toIso = toIsoDate(new Date());
      fromIso = addDays(toIso, -90);
    }
    const settingRow = db.prepare("SELECT value FROM settings WHERE key = 'target_pace'").get();
    const targetPace = settingRow ? parseFloat(settingRow.value) || 0.5 : 0.5;
    const entries = db.prepare(`
      SELECT date, weight_kg FROM weight_entries
      WHERE date >= ? AND date <= ? ORDER BY date
    `).all(fromIso, toIso);
    const weightMap = new Map();
    for (const e of entries) {
      const w = Number(e.weight_kg);
      if (Number.isFinite(w) && w > 0) weightMap.set(e.date, w);
    }
    const dates = [...weightMap.keys()].sort();
    let prEntry = null;
    for (const d of dates) {
      const w = weightMap.get(d);
      if (prEntry == null || w < prEntry.weight_kg) {
        prEntry = { weight_kg: w, date: d };
      }
    }
    let prInsufficientWindow = true;
    if (dates.length >= 2) {
      const d1 = new Date(dates[0] + 'T00:00:00Z');
      const d2 = new Date(dates[dates.length - 1] + 'T00:00:00Z');
      if ((d2 - d1) / 86400000 >= 28) prInsufficientWindow = false;
    }
    const points = [];
    for (const date of dates) {
      const w = weightMap.get(date);
      const date28 = addDays(date, -28);
      const w28 = weightMap.get(date28);
      const velocity = w28 != null ? Math.round(((w - w28) / 4) * 100) / 100 : null;
      points.push({ date, weight_kg: w, velocity_kg_per_week: velocity });
    }
    return {
      points,
      target_pace_reference_velocity: -targetPace,
      target_pace_magnitude: targetPace,
      pr_weight: prEntry,
      pr_insufficient_window: prInsufficientWindow,
    };
  });

  ipcMain.handle('db:getWHR', () => {
    const db = getDb();
    const profile = db.prepare('SELECT sex FROM user_profile LIMIT 1').get();
    const sex = profile ? profile.sex : null;
    const latest = db.prepare(`
      SELECT date, waist, hips FROM measurement_sets
      WHERE waist IS NOT NULL AND hips IS NOT NULL AND waist > 0 AND hips > 0
      ORDER BY date DESC LIMIT 1
    `).get();
    const ninetyAgo = addDays(toIsoDate(new Date()), -90);
    const history = db.prepare(`
      SELECT date, waist, hips FROM measurement_sets
      WHERE date >= ? AND waist IS NOT NULL AND hips IS NOT NULL AND waist > 0 AND hips > 0
      ORDER BY date DESC
    `).all(ninetyAgo);
    let current = null;
    if (latest) {
      const whr = Math.round((latest.waist / latest.hips) * 100) / 100;
      const zone = classifyWHRZone(whr, sex);
      current = { value: whr, date: latest.date, zone: zone.zone, zone_label: zone.zone_label };
    }
    const historyPoints = history.map(h => ({
      date: h.date,
      value: Math.round((h.waist / h.hips) * 100) / 100,
    }));
    return {
      current,
      history: historyPoints,
      sex: sex || 'unknown',
      has_measurements: historyPoints.length > 0,
    };
  });

  ipcMain.handle('db:getAutoInsights', () => {
    const db = getDb();
    const dates = db.prepare('SELECT DISTINCT date FROM sport_activities ORDER BY date ASC').all().map(r => r.date);
    const weekStreak = computeWeekStreak(dates);
    const activeDates = new Set(dates);
    let restDayStreak = 0;
    const today = toIsoDate(new Date());
    let cursor = addDays(today, -1);
    const earliestDate = dates.length > 0 ? dates[0] : addDays(today, -365);
    while (cursor >= earliestDate && !activeDates.has(cursor)) {
      restDayStreak += 1;
      cursor = addDays(cursor, -1);
    }
    let recentSportPRs = 0;
    const sevenAgo = addDays(toIsoDate(new Date()), -7);
    try {
      const all = db.prepare(`
        SELECT id, date, sport_type, duration_minutes, distance_km
        FROM sport_activities
        WHERE distance_km IS NOT NULL AND distance_km >= 1.0
          AND duration_minutes IS NOT NULL AND duration_minutes > 0
          AND sport_type IN ('running', 'cycling')
        ORDER BY date ASC
      `).all();
      const runningPRs = projectStandardDistances(all, 'running');
      const cyclingPRs = projectStandardDistances(all, 'cycling');
      recentSportPRs = [...runningPRs, ...cyclingPRs].filter(p => p.achieved_at >= sevenAgo).length;
    } catch { recentSportPRs = 0; }
    return { weekStreak, restDayStreak, recentSportPRs };
  });
}

module.exports = { register, addDays, toIsoDate, computeWeekStreak, computeSignal, classifyWHRZone, projectStandardDistances };
