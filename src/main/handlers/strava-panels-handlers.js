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

function currentIsoWeekRange(now = new Date()) {
  const d = new Date(now);
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function previousIsoWeekRange(now = new Date()) {
  const current = currentIsoWeekRange(now);
  const monday = new Date(current.start);
  monday.setDate(monday.getDate() - 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function toIsoDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const SPORT_EFFORT_MULTIPLIERS = {
  running: 1.4, cycling: 1.2, swimming: 1.5, HIIT: 1.6,
  strength: 1.3, walking: 1.0, other: 1.1,
  football: 1.3, paddle: 1.2, boxing: 1.5, yoga: 1.0,
};
const NEAT_KCAL_PER_STEP = 0.04;

const RIEGEL_EXPONENT = 1.06;
const RUNNING_STANDARD_DISTANCES = [
  { km: 1, key: '1', label: '1 km' },
  { km: 5, key: '5', label: '5 km' },
  { km: 10, key: '10', label: '10 km' },
  { km: 21.1, key: '21.1', label: 'Media maratón' },
  { km: 42.2, key: '42.2', label: 'Maratón' },
];
const CYCLING_STANDARD_DISTANCES = [
  { km: 10, key: '10', label: '10 km' },
  { km: 50, key: '50', label: '50 km' },
  { km: 100, key: '100', label: '100 km' },
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

function projectStandardDistances(activities, sportType, distances) {
  const eligible = activities.filter(a =>
    a.sport_type === sportType &&
    Number.isFinite(a.distance_km) && a.distance_km >= 1.0 &&
    Number.isFinite(a.duration_minutes) && a.duration_minutes > 0
  );
  return distances.map(target => {
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

function rankRecords(records) {
  const groups = new Map();
  for (const r of records) {
    const key = `${r.sport_type}|${r.distance_key}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const ranked = [];
  for (const [, list] of groups) {
    list.sort((a, b) => {
      if (a.time_min !== b.time_min) return a.time_min - b.time_min;
      return (b.achieved_at || '').localeCompare(a.achieved_at || '');
    });
    list.forEach((r, i) => { ranked.push({ ...r, rank: i < 3 ? i + 1 : null }); });
  }
  return ranked.sort((a, b) => (b.achieved_at || '').localeCompare(a.achieved_at || ''));
}

function getWeekSportData(db, from, to) {
  const rows = db.prepare(`
    SELECT date, sport_type, calories, duration_minutes, distance_km
    FROM sport_activities WHERE date >= ? AND date <= ?
    ORDER BY date ASC
  `).all(from, to);
  const totals = rows.reduce((acc, r) => {
    const kcal = Number(r.calories) || 0;
    const dur = Number(r.duration_minutes) || 0;
    const mult = SPORT_EFFORT_MULTIPLIERS[r.sport_type] ?? SPORT_EFFORT_MULTIPLIERS.other;
    acc.sport_kcal += kcal;
    acc.effort += dur * mult;
    acc.duration_min += dur;
    acc.sessions += 1;
    const byType = acc.byType[r.sport_type] || (acc.byType[r.sport_type] = { count: 0, total_kcal: 0, total_duration: 0, total_distance_km: 0 });
    byType.count += 1;
    byType.total_kcal += kcal;
    byType.total_duration += dur;
    byType.total_distance_km += Number(r.distance_km) || 0;
    return acc;
  }, { sport_kcal: 0, effort: 0, duration_min: 0, sessions: 0, byType: {} });
  const activityDays = db.prepare('SELECT date, steps FROM activity_days WHERE date >= ? AND date <= ?').all(from, to);
  let neatEffort = 0;
  for (const d of activityDays) {
    const steps = Number(d.steps) || 0;
    neatEffort += Math.min(200, steps * NEAT_KCAL_PER_STEP);
  }
  totals.effort += neatEffort;
  return { rows, totals, neatEffort: Math.floor(neatEffort) };
}

function register(ipcMain, getDb, getHS, notifyDomain) {
  ipcMain.handle('db:getPersonalRecords', () => {
    const db = getDb();
    const all = db.prepare(`
      SELECT id, date, sport_type, calories, duration_minutes, distance_km
      FROM sport_activities
      WHERE distance_km IS NOT NULL AND distance_km >= 1.0
        AND duration_minutes IS NOT NULL AND duration_minutes > 0
        AND sport_type IN ('running', 'cycling')
      ORDER BY date ASC
    `).all();
    const records = [];
    records.push(...projectStandardDistances(all, 'running', RUNNING_STANDARD_DISTANCES));
    records.push(...projectStandardDistances(all, 'cycling', CYCLING_STANDARD_DISTANCES));
    const cyclingDistanceRows = db.prepare(`
      SELECT date, distance_km
      FROM sport_activities
      WHERE sport_type = 'cycling' AND distance_km IS NOT NULL AND distance_km >= 1.0
      ORDER BY distance_km DESC LIMIT 3
    `).all();
    cyclingDistanceRows.forEach((r, i) => {
      records.push({
        sport_type: 'cycling',
        distance_km: r.distance_km,
        distance_key: 'longest',
        distance_label: 'Bici más larga',
        time_min: r.distance_km,
        achieved_at: r.date,
        rank: i === 0 ? 1 : null,
        is_distance: true,
      });
    });
    const runningDistanceRows = db.prepare(`
      SELECT date, distance_km
      FROM sport_activities
      WHERE sport_type = 'running' AND distance_km IS NOT NULL AND distance_km >= 1.0
      ORDER BY distance_km DESC LIMIT 3
    `).all();
    runningDistanceRows.forEach((r, i) => {
      if (i === 0) {
        records.push({
          sport_type: 'running',
          distance_km: r.distance_km,
          distance_key: 'longest',
          distance_label: 'Carrera más larga',
          time_min: r.distance_km,
          achieved_at: r.date,
          rank: null,
          is_distance: true,
        });
      }
    });
    const strengthRows = db.prepare(`
      SELECT tsess.date as date,
             COALESCE(SUM(ts.load_kg * ts.reps), 0) as volume_kg,
             COUNT(*) as sets
      FROM training_sets ts
      JOIN training_sessions tsess ON ts.session_id = tsess.id
      WHERE ts.load_kg IS NOT NULL AND ts.reps IS NOT NULL
      GROUP BY tsess.date
      HAVING volume_kg > 0
      ORDER BY volume_kg DESC LIMIT 3
    `).all();
    strengthRows.forEach((r, i) => {
      records.push({
        sport_type: 'strength',
        distance_km: 0,
        distance_key: 'volume',
        distance_label: 'Sesión de pesas',
        time_min: r.volume_kg,
        achieved_at: r.date,
        rank: i === 0 ? 1 : null,
        is_volume: true,
        volume_kg: r.volume_kg,
        sets: r.sets,
      });
    });
    const ranked = rankRecords(records)
      .filter(r => r.rank != null || r.is_distance || r.is_volume);
    const bySport = { running: [], cycling: [], strength: [] };
    for (const r of ranked) {
      const sport = r.sport_type;
      if (bySport[sport]) bySport[sport].push(r);
    }
    const mostRecent = ranked.length > 0 ? ranked[0] : null;
    return {
      records: ranked,
      by_sport: bySport,
      primary_sport: mostRecent ? mostRecent.sport_type : null,
      total: ranked.length,
    };
  });

  ipcMain.handle('db:getRelativeEffort', () => {
    const db = getDb();
    const cur = currentIsoWeekRange();
    const prev = previousIsoWeekRange();
    const curFrom = toIsoDate(cur.start);
    const curTo = toIsoDate(cur.end);
    const prevFrom = toIsoDate(prev.start);
    const prevTo = toIsoDate(prev.end);
    const current = getWeekSportData(db, curFrom, curTo);
    const previous = getWeekSportData(db, prevFrom, prevTo);
    const currentValue = Math.floor(current.totals.effort / 7);
    const previousValue = Math.floor(previous.totals.effort / 7);
    const delta = currentValue - previousValue;
    let trend = 'flat';
    if (delta > 0) trend = 'up';
    else if (delta < 0) trend = 'down';
    return {
      current_week: {
        value: currentValue,
        start_date: curFrom,
        end_date: curTo,
        sessions: current.totals.sessions,
        sport_kcal: Math.floor(current.totals.sport_kcal),
        neat_effort: current.neatEffort,
        by_type: current.totals.byType,
      },
      previous_week: {
        value: previousValue,
        start_date: prevFrom,
        end_date: prevTo,
        sessions: previous.totals.sessions,
        sport_kcal: Math.floor(previous.totals.sport_kcal),
        neat_effort: previous.neatEffort,
        by_type: previous.totals.byType,
      },
      delta,
      trend,
    };
  });

  ipcMain.handle('db:getTrainingLogWeek', (_event, weekStartIso) => {
    const db = getDb();
    let range;
    if (typeof weekStartIso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(weekStartIso)) {
      const start = new Date(weekStartIso + 'T00:00:00');
      const dow = start.getDay() || 7;
      const monday = new Date(start);
      monday.setDate(start.getDate() - (dow - 1));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      range = { start: monday, end: sunday };
    } else {
      range = currentIsoWeekRange();
    }
    const from = toIsoDate(range.start);
    const to = toIsoDate(range.end);
    const rows = db.prepare(`
      SELECT date, SUM(duration_minutes) as minutes, COUNT(*) as sessions
      FROM sport_activities
      WHERE date >= ? AND date <= ?
      GROUP BY date
    `).all(from, to);
    const byDate = new Map();
    for (const r of rows) byDate.set(r.date, r);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(range.start);
      d.setDate(range.start.getDate() + i);
      const dateStr = toIsoDate(d);
      const row = byDate.get(dateStr);
      days.push({
        date: dateStr,
        dow: i,
        duration_minutes: row ? Math.round(Number(row.minutes) || 0) : 0,
        sessions: row ? Number(row.sessions) || 0 : 0,
        has_activity: !!row,
      });
    }
    const total = days.reduce((s, d) => s + d.duration_minutes, 0);
    return {
      week_start: from,
      week_end: to,
      total_minutes: total,
      days,
      is_current: from === toIsoDate(currentIsoWeekRange().start),
    };
  });

  ipcMain.handle('db:getMonthlyCalendar', (_event, yearMonth) => {
    const db = getDb();
    let year, month;
    if (typeof yearMonth === 'string' && /^\d{4}-\d{2}$/.test(yearMonth)) {
      [year, month] = yearMonth.split('-').map(Number);
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }
    const firstOfMonth = new Date(year, month - 1, 1);
    const lastOfMonth = new Date(year, month, 0);
    const monthStart = toIsoDate(firstOfMonth);
    const monthEnd = toIsoDate(lastOfMonth);
    const rows = db.prepare(`
      SELECT date, sport_type, COUNT(*) as count
      FROM sport_activities
      WHERE date >= ? AND date <= ?
      GROUP BY date
      ORDER BY date ASC
    `).all(monthStart, monthEnd);
    const dayMap = new Map();
    for (const r of rows) {
      const existing = dayMap.get(r.date);
      if (!existing) {
        dayMap.set(r.date, { date: r.date, count: r.count, primary_sport: r.sport_type });
      } else {
        existing.count += r.count;
      }
    }
    const allSportsForMonth = db.prepare(`
      SELECT date, sport_type, COUNT(*) as count
      FROM sport_activities WHERE date >= ? AND date <= ?
      ORDER BY date ASC
    `).all(monthStart, monthEnd);
    const sportCountByDate = new Map();
    for (const r of allSportsForMonth) {
      const map = sportCountByDate.get(r.date) || new Map();
      map.set(r.sport_type, (map.get(r.sport_type) || 0) + r.count);
      sportCountByDate.set(r.date, map);
    }
    for (const [date, info] of dayMap) {
      const map = sportCountByDate.get(date);
      if (map) {
        let best = null, bestCount = -1;
        for (const [sport, c] of map) {
          if (c > bestCount) { best = sport; bestCount = c; }
        }
        info.primary_sport = best;
      }
    }
    const days = [];
    for (let day = 1; day <= lastOfMonth.getDate(); day++) {
      const d = new Date(year, month - 1, day);
      const dateStr = toIsoDate(d);
      const info = dayMap.get(dateStr);
      days.push({
        date: dateStr,
        day,
        day_of_week: d.getDay() === 0 ? 6 : d.getDay() - 1,
        has_activity: !!info,
        sport_type: info ? info.primary_sport : null,
        activity_count: info ? info.count : 0,
      });
    }
    const weeks = [];
    const monday = new Date(firstOfMonth);
    const offset = monday.getDay() === 0 ? 6 : monday.getDay() - 1;
    monday.setDate(monday.getDate() - offset);
    let weekStart = new Date(monday);
    while (weekStart <= lastOfMonth) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const datesInWeek = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const ds = toIsoDate(d);
        if (d.getMonth() + 1 === month && ds >= monthStart && ds <= monthEnd) {
          datesInWeek.push(ds);
        }
      }
      const hasActivity = datesInWeek.some(ds => dayMap.has(ds));
      const now = new Date();
      const isCurrent = datesInWeek.some(ds => ds === toIsoDate(now));
      const weekNumber = weeks.length + 1;
      weeks.push({
        week_number: weekNumber,
        start_date: toIsoDate(weekStart),
        end_date: toIsoDate(weekEnd),
        completed: hasActivity && !isCurrent,
        is_current: isCurrent,
        in_month: datesInWeek.length > 0,
      });
      weekStart.setDate(weekStart.getDate() + 7);
    }
    return { month: `${year}-${String(month).padStart(2, '0')}`, days, weeks };
  });

  ipcMain.handle('db:getStreak', () => {
    const db = getDb();
    const dates = db.prepare('SELECT DISTINCT date FROM sport_activities ORDER BY date ASC').all().map(r => r.date);
    if (dates.length === 0) {
      return { weeks: 0, total_activities: 0, is_active: false, last_broken_date: null };
    }
    const allKeys = new Set(dates.map(isoWeekKey));
    const cur = currentIsoWeekRange();
    const prev = previousIsoWeekRange();
    const currentKey = isoWeekKey(toIsoDate(cur.start));
    const previousKey = isoWeekKey(toIsoDate(prev.start));
    const isActive = allKeys.has(currentKey) || allKeys.has(previousKey);
    let cursor = new Date(cur.start);
    if (!allKeys.has(currentKey)) cursor.setDate(cursor.getDate() - 7);
    let weeks = 0;
    const countedDates = new Set();
    const cap = new Date(cursor);
    cap.setFullYear(cap.getFullYear() - 10);
    while (cursor >= cap) {
      const key = isoWeekKey(toIsoDate(cursor));
      if (allKeys.has(key)) {
        weeks += 1;
        const weekStart = new Date(cursor);
        const weekEnd = new Date(cursor);
        weekEnd.setDate(weekStart.getDate() + 6);
        for (const d of dates) {
          if (countedDates.has(d)) continue;
          const dd = new Date(d + 'T00:00:00');
          if (dd >= weekStart && dd <= weekEnd) {
            countedDates.add(d);
          }
        }
      } else {
        break;
      }
      cursor.setDate(cursor.getDate() - 7);
    }
    let lastBrokenDate = null;
    if (weeks === 0) {
      lastBrokenDate = dates[dates.length - 1];
    }
    return {
      weeks,
      total_activities: countedDates.size,
      is_active: isActive,
      last_broken_date: lastBrokenDate,
    };
  });
}

module.exports = { register };
