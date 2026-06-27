const STANDARD_DISTANCES_KM = [
  { km: 1, key: '1', label: '1 km' },
  { km: 1.609, key: '1mi', label: '1 mi' },
  { km: 5, key: '5', label: '5 km' },
  { km: 10, key: '10', label: '10 km' },
  { km: 21.1, key: '21.1', label: 'Media maratón' },
  { km: 42.2, key: '42.2', label: 'Maratón' },
];

const RIEGEL_EXPONENT = 1.06;

const SPORT_EFFORT_MULTIPLIERS = {
  running: 1.4,
  cycling: 1.2,
  swimming: 1.5,
  HIIT: 1.6,
  strength: 1.3,
  walking: 1.0,
  other: 1.1,
  football: 1.3,
  paddle: 1.2,
  boxing: 1.5,
  yoga: 1.0,
};

const NEAT_KCAL_PER_STEP = 0.04;

const SPANISH_MONTHS_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const SPANISH_MONTHS_SHORT = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

export function paceProjection(d1Km, t1Min, d2Km) {
  if (!Number.isFinite(d1Km) || !Number.isFinite(t1Min) || !Number.isFinite(d2Km)) return null;
  if (d1Km <= 0 || d2Km <= 0 || t1Min <= 0) return null;
  return t1Min * Math.pow(d2Km / d1Km, RIEGEL_EXPONENT);
}

export function isWithinProjectionWindow(d1Km, targetKm) {
  if (!Number.isFinite(d1Km) || !Number.isFinite(targetKm)) return false;
  return d1Km >= 0.8 * targetKm && d1Km <= 1.5 * targetKm;
}

export function projectStandardDistances(activities, sportType, distances = STANDARD_DISTANCES_KM) {
  if (!Array.isArray(activities)) return [];
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
          source_activity: {
            date: a.date,
            distance_km: a.distance_km,
            duration_minutes: a.duration_minutes,
          },
        };
      }
    }
    return best;
  }).filter(Boolean);
}

export function rankRecords(records) {
  if (!Array.isArray(records)) return [];
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
    list.forEach((r, i) => {
      ranked.push({ ...r, rank: i < 3 ? i + 1 : null });
    });
  }
  return ranked.sort((a, b) => (b.achieved_at || '').localeCompare(a.achieved_at || ''));
}

export function effortMultiplier(sportType) {
  if (sportType && Object.prototype.hasOwnProperty.call(SPORT_EFFORT_MULTIPLIERS, sportType)) {
    return SPORT_EFFORT_MULTIPLIERS[sportType];
  }
  return SPORT_EFFORT_MULTIPLIERS.other;
}

export function computeWeeklyEffort(sportActivities, activityDays) {
  let effort = 0;
  for (const a of (sportActivities || [])) {
    const kcal = Number(a.calories) || 0;
    effort += kcal * effortMultiplier(a.sport_type);
  }
  for (const d of (activityDays || [])) {
    const steps = Number(d.steps) || 0;
    effort += steps * NEAT_KCAL_PER_STEP;
  }
  return Math.floor(effort);
}

export function isoWeek(date) {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  if (isNaN(d.getTime())) return null;
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return { year: target.getUTCFullYear(), week: weekNum };
}

export function isoWeekKey(date) {
  const w = isoWeek(date);
  if (!w) return null;
  return `${w.year}-W${String(w.week).padStart(2, '0')}`;
}

export function currentIsoWeekRange(now = new Date()) {
  const d = new Date(now);
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    start: monday,
    end: sunday,
    start_date: toIsoDate(monday),
    end_date: toIsoDate(sunday),
  };
}

export function previousIsoWeekRange(now = new Date()) {
  const current = currentIsoWeekRange(now);
  const monday = new Date(current.start);
  monday.setDate(monday.getDate() - 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    start: monday,
    end: sunday,
    start_date: toIsoDate(monday),
    end_date: toIsoDate(sunday),
  };
}

export function toIsoDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeStreak(activityDates) {
  if (!Array.isArray(activityDates) || activityDates.length === 0) {
    return { weeks: 0, totalActivities: 0, isActive: false, lastBrokenDate: null };
  }
  const dateSet = new Set();
  for (const d of activityDates) {
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) dateSet.add(d);
  }
  if (dateSet.size === 0) {
    return { weeks: 0, totalActivities: 0, isActive: false, lastBrokenDate: null };
  }
  const allKeys = new Set();
  for (const d of dateSet) allKeys.add(isoWeekKey(d));

  const current = currentIsoWeekRange();
  const previous = previousIsoWeekRange();
  const currentKey = isoWeekKey(current.start);
  const previousKey = isoWeekKey(previous.start);

  const isActive = allKeys.has(currentKey) || allKeys.has(previousKey);

  let cursor = new Date(current.start);
  if (!allKeys.has(currentKey)) {
    cursor.setDate(cursor.getDate() - 7);
  }
  let weeks = 0;
  let totalActivities = 0;
  const cap = new Date(cursor);
  cap.setFullYear(cap.getFullYear() - 10);
  const countedDates = new Set();
  while (cursor >= cap) {
    const key = isoWeekKey(cursor);
    if (allKeys.has(key)) {
      weeks += 1;
      const weekStart = new Date(cursor);
      const weekEnd = new Date(cursor);
      weekEnd.setDate(weekStart.getDate() + 6);
      for (const d of dateSet) {
        if (countedDates.has(d)) continue;
        const dd = new Date(d + 'T00:00:00');
        if (dd >= weekStart && dd <= weekEnd) {
          totalActivities += 1;
          countedDates.add(d);
        }
      }
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 7);
  }

  let lastBrokenDate = null;
  if (weeks === 0 && dateSet.size > 0) {
    const sorted = Array.from(dateSet).sort();
    lastBrokenDate = sorted[sorted.length - 1];
  }

  return {
    weeks,
    totalActivities,
    isActive,
    lastBrokenDate,
  };
}

export function formatDuration(minutes) {
  const m = Math.max(0, Math.round(Number(minutes) || 0));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

export function formatRecordTime(secondsOrMinutes) {
  const total = Math.round(Number(secondsOrMinutes) || 0);
  if (total < 60) return `${total}s`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    const mm = String(minutes).padStart(2, '0');
    return `${hours}:${mm}:${ss}`;
  }
  const mm = String(minutes).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function formatDateLong(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = SPANISH_MONTHS_LONG[d.getMonth()];
  const year = d.getFullYear();
  return `${day} de ${month} de ${year}`;
}

export function formatDateShort(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = SPANISH_MONTHS_SHORT[d.getMonth()];
  return `${day} ${month}`;
}

export function formatDateRange(startDate, endDate) {
  const s = startDate instanceof Date ? startDate : new Date(startDate);
  const e = endDate instanceof Date ? endDate : new Date(endDate);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return '';
  const sMonth = SPANISH_MONTHS_SHORT[s.getMonth()];
  const eMonth = SPANISH_MONTHS_SHORT[e.getMonth()];
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.getDate()} ${sMonth} ${s.getFullYear()} – ${e.getDate()} ${eMonth} ${e.getFullYear()}`;
  }
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()} – ${e.getDate()} ${eMonth} ${e.getFullYear()}`;
  }
  return `${s.getDate()} ${sMonth} – ${e.getDate()} ${eMonth} ${e.getFullYear()}`;
}

export function effortLevel(value) {
  const v = Number(value) || 0;
  if (v > 70) return 'very-high';
  if (v >= 40) return 'high';
  if (v >= 20) return 'moderate';
  return 'low';
}

export function clampEffortDisplay(value, max = 999) {
  const v = Math.max(0, Number(value) || 0);
  if (v > max) return { value: max, clamped: true };
  return { value: Math.floor(v), clamped: false };
}

export const __internals = {
  STANDARD_DISTANCES_KM,
  RIEGEL_EXPONENT,
  SPORT_EFFORT_MULTIPLIERS,
  NEAT_KCAL_PER_STEP,
  SPANISH_MONTHS_LONG,
  SPANISH_MONTHS_SHORT,
};
