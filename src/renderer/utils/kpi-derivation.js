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

const SPANISH_WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const WHO_MALE_ZONES = [
  { max: 0.90, zone: 'low', label: 'Bajo' },
  { max: 1.00, zone: 'moderate', label: 'Moderado' },
  { max: Infinity, zone: 'high', label: 'Alto' },
];

const WHO_FEMALE_ZONES = [
  { max: 0.80, zone: 'low', label: 'Bajo' },
  { max: 0.85, zone: 'moderate', label: 'Moderado' },
  { max: Infinity, zone: 'high', label: 'Alto' },
];

const SPANISH_WEEKDAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const SEVERITY_ORDER = { positive: 0, info: 1, alert: 2 };

// --- 3.1 normalizeBaseline ---

export function normalizeBaseline(current, baseline, stddev) {
  if (!Number.isFinite(current) || !Number.isFinite(baseline) || !Number.isFinite(stddev) || stddev <= 0) return 0;
  const z = (current - baseline) / stddev;
  return Math.max(-3, Math.min(3, z));
}

// --- 3.2 recoverySubScore ---

export function recoverySubScore(zScore, inverted = false) {
  const z = Math.max(-3, Math.min(3, Number.isFinite(zScore) ? zScore : 0));
  const raw = inverted ? 50 - 15 * z : 50 + 15 * z;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

// --- 3.3 recoveryScore ---

export function recoveryScore({ hrv, rhr, sleep }) {
  const hasHRV = !!(hrv && hrv.baseline && hrv.baseline > 0 && hrv.stddev && hrv.stddev > 0 && hrv.daysAvailable >= 30);
  const hasRHR = !!(rhr && rhr.baseline && rhr.baseline > 0 && rhr.stddev && rhr.stddev > 0 && rhr.daysAvailable >= 30);
  const hasSleep = !!(sleep && sleep.baseline && sleep.baseline > 0 && sleep.stddev && sleep.stddev > 0 && sleep.daysAvailable >= 30);

  const signalCount = (hasHRV ? 1 : 0) + (hasRHR ? 1 : 0) + (hasSleep ? 1 : 0);

  const daysMin = Math.min(
    hasHRV ? hrv.daysAvailable : Infinity,
    hasRHR ? rhr.daysAvailable : Infinity,
    hasSleep ? sleep.daysAvailable : Infinity
  );
  const baselineComplete = signalCount >= 2 && daysMin >= 30;
  const daysUntilBaseline = baselineComplete ? 0 : Math.max(0, 30 - (daysMin === Infinity ? 0 : daysMin));

  if (!baselineComplete) {
    return { composite: null, zone: null, signals: null, sparkline: [], baselineComplete: false, daysUntilBaseline, signalCount };
  }

  const hrvZ = hasHRV ? normalizeBaseline(hrv.current, hrv.baseline, hrv.stddev) : 0;
  const rhrZ = hasRHR ? normalizeBaseline(rhr.current, rhr.baseline, rhr.stddev) : 0;
  const sleepZ = hasSleep ? normalizeBaseline(sleep.current, sleep.baseline, sleep.stddev) : 0;

  const hrvSub = hasHRV ? recoverySubScore(hrvZ, false) : 50;
  const rhrSub = hasRHR ? recoverySubScore(rhrZ, true) : 50;
  const sleepSub = hasSleep ? recoverySubScore(sleepZ, false) : 50;

  const composite = Math.round(0.4 * hrvSub + 0.3 * rhrSub + 0.3 * sleepSub);
  const clamped = Math.max(0, Math.min(100, composite));

  const zone = clamped < 40 ? 'low' : clamped < 70 ? 'moderate' : 'high';

  const zoneForSub = (sub) => sub < 40 ? 'low' : sub < 70 ? 'moderate' : 'high';

  const signals = {
    hrv: hasHRV ? { current: hrv.current, baseline: hrv.baseline, stddev: hrv.stddev, subScore: hrvSub, zone: zoneForSub(hrvSub) } : { subScore: 50, zone: 'moderate', insufficient: true },
    rhr: hasRHR ? { current: rhr.current, baseline: rhr.baseline, stddev: rhr.stddev, subScore: rhrSub, zone: zoneForSub(rhrSub) } : { subScore: 50, zone: 'moderate', insufficient: true },
    sleep: hasSleep ? { current: sleep.current, baseline: sleep.baseline, stddev: sleep.stddev, subScore: sleepSub, zone: zoneForSub(sleepSub) } : { subScore: 50, zone: 'moderate', insufficient: true },
  };

  const sparkline = (hrv && hrv.sparkline) ? hrv.sparkline : ((rhr && rhr.sparkline) ? rhr.sparkline : ((sleep && sleep.sparkline) ? sleep.sparkline : []));

  return { composite: clamped, zone, signals, sparkline, baselineComplete: true, daysUntilBaseline: 0, signalCount };
}

// --- 3.4 weightVelocity ---

export function weightVelocity(weightEntries, targetPace, fromDate, toDate) {
  if (!Array.isArray(weightEntries)) return { points: [], prWeight: null, prInsufficientWindow: true };

  const entries = weightEntries
    .map(e => ({ date: String(e.date), weight_kg: Number(e.weight_kg) }))
    .filter(e => Number.isFinite(e.weight_kg) && e.date >= fromDate && e.date <= toDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (entries.length < 1) return { points: [], prWeight: null, prInsufficientWindow: true };

  const byDate = new Map();
  for (const e of entries) byDate.set(e.date, e.weight_kg);

  let has28dPair = false;
  let prWeight = null;

  const points = [];
  const from = new Date(fromDate + 'T00:00:00');
  const to = new Date(toDate + 'T00:00:00');

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dateStr = toIsoDate(d);
    const weight = byDate.get(dateStr) ?? null;

    if (weight !== null && (prWeight === null || weight < prWeight.weight_kg)) {
      prWeight = { weight_kg: weight, date: dateStr };
    }

    const priorDate = new Date(d);
    priorDate.setDate(priorDate.getDate() - 28);
    const priorDateStr = toIsoDate(priorDate);
    const priorWeight = byDate.get(priorDateStr) ?? null;

    let velocity_kg_per_week = null;
    if (weight !== null && priorWeight !== null) {
      velocity_kg_per_week = (weight - priorWeight) / 4;
      has28dPair = true;
    }

    points.push({ date: dateStr, weight_kg: weight, velocity_kg_per_week });
  }

  return { points, prWeight, prInsufficientWindow: entries.length >= 2 ? !has28dPair : true };
}

// --- 3.5 whrZone ---

export function whrZone(value, sex) {
  if (!Number.isFinite(value) || value <= 0) return { zone: 'unknown', label: 'Sin clasificar' };
  const zones = sex === 'M' ? WHO_MALE_ZONES : sex === 'F' ? WHO_FEMALE_ZONES : null;
  if (!zones) return { zone: 'unknown', label: 'Sin clasificar' };
  for (const z of zones) {
    if (value < z.max) return { zone: z.zone, label: z.label };
  }
  return { zone: 'high', label: 'Alto' };
}

// --- 3.6 dowPattern ---

export function dowPattern(activities, fromDate, toDate) {
  const days = Array.from({ length: 7 }, (_, i) => ({ weekday: i, weekday_label: SPANISH_WEEKDAY_LABELS[i], minutes: 0, sessions: 0 }));

  if (!Array.isArray(activities)) return { days, bestDay: null, hasInsufficientData: true };

  for (const a of activities) {
    const date = String(a.date);
    if (date < fromDate || date > toDate) continue;
    const mins = Number(a.duration_minutes) || 0;
    if (mins <= 0) continue;
    const d = new Date(date + 'T00:00:00');
    if (isNaN(d.getTime())) continue;
    const weekday = (d.getDay() + 6) % 7;
    days[weekday].minutes += mins;
    days[weekday].sessions += 1;
  }

  let bestDay = null;
  let bestMins = 0;
  for (const day of days) {
    if (day.minutes > bestMins) {
      bestMins = day.minutes;
      bestDay = day.weekday;
    }
  }

  const totalDaySpan = (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24);
  const hasInsufficientData = totalDaySpan < 14;

  return { days, bestDay, hasInsufficientData };
}

// --- 3.7 sportDistribution ---

export function sportDistribution(activities, fromDate, toDate, getLabel) {
  if (!Array.isArray(activities)) return { sports: [], totalMinutes: 0, totalSessions: 0, othersAggregated: false };

  const groups = new Map();

  for (const a of activities) {
    const date = String(a.date);
    if (date < fromDate || date > toDate) continue;
    const mins = Number(a.duration_minutes) || 0;
    if (mins <= 0) continue;
    const type = String(a.sport_type || 'other');
    if (!groups.has(type)) {
      groups.set(type, {
        sport_type: type,
        sport_label: getLabel ? getLabel(type) : type.charAt(0).toUpperCase() + type.slice(1),
        minutes: 0,
        sessions: 0,
      });
    }
    const entry = groups.get(type);
    entry.minutes += mins;
    entry.sessions += 1;
  }

  let sports = Array.from(groups.values());
  const totalMinutes = sports.reduce((sum, s) => sum + s.minutes, 0);
  const totalSessions = sports.reduce((sum, s) => sum + s.sessions, 0);

  if (totalMinutes === 0) return { sports: [], totalMinutes: 0, totalSessions: 0, othersAggregated: false };

  sports = sports
    .map(s => ({ ...s, share_pct: Math.round((s.minutes / totalMinutes) * 1000) / 10 }))
    .sort((a, b) => b.minutes - a.minutes);

  let othersAggregated = false;
  if (sports.length > 6) {
    const top = sports.slice(0, 3);
    const others = sports.slice(3);
    const otherMinutes = others.reduce((sum, s) => sum + s.minutes, 0);
    const otherSessions = others.reduce((sum, s) => sum + s.sessions, 0);
    const otherSharePct = Math.round((otherMinutes / totalMinutes) * 1000) / 10;

    top.push({
      sport_type: 'others',
      sport_label: 'Otros',
      minutes: otherMinutes,
      sessions: otherSessions,
      share_pct: otherSharePct,
      _aggregated: others.map(s => s.sport_label),
    });
    sports = top;
    othersAggregated = true;
  }

  return { sports, totalMinutes, totalSessions, othersAggregated };
}

// --- 3.8 Auto-Insight Template Functions ---

export function templateBestWeekStreak(input) {
  const { weekStreak, monthName } = input || {};
  if (!Number.isFinite(weekStreak) || weekStreak < 4) return null;
  return {
    icon: 'flame',
    text: `Llevas ${weekStreak} semanas consecutivas con actividad — tu mejor racha desde ${monthName || 'hace meses'}.`,
    severity: 'positive',
    navigateTo: 'dashboard',
  };
}

export function templateHRVDeviation(input) {
  const { hrvCurrent, hrvBaseline, hrvDeviation } = input || {};
  let pct;
  if (Number.isFinite(hrvDeviation)) {
    pct = hrvDeviation;
  } else if (Number.isFinite(hrvCurrent) && Number.isFinite(hrvBaseline) && hrvBaseline > 0) {
    pct = ((hrvCurrent - hrvBaseline) / hrvBaseline) * 100;
  } else {
    return null;
  }
  if (Math.abs(pct) < 10) return null;
  const direction = pct >= 0 ? 'por encima de' : 'por debajo de';
  const severity = pct >= 0 ? 'info' : 'alert';
  return {
    icon: 'heart-pulse',
    text: `HRV ${Math.abs(pct).toFixed(0)}% ${direction} tu promedio de 30 días.`,
    severity,
    navigateTo: 'dashboard',
  };
}

export function templateRestDayStreak(input) {
  const { restDayStreak } = input || {};
  if (!Number.isFinite(restDayStreak) || restDayStreak < 5) return null;
  return {
    icon: 'bed',
    text: `Llevas ${restDayStreak} días sin actividad — ¿descanso planificado o rutina perdida?`,
    severity: 'info',
    navigateTo: 'activity',
  };
}

export function templateWeightDirectionMatch(input) {
  const { velocity, targetPace } = input || {};
  if (!Number.isFinite(velocity) || !Number.isFinite(targetPace)) return null;
  const diff = Math.abs(velocity - (-targetPace));
  if (diff < 0.1) return null;
  const relation = velocity < -targetPace ? 'por debajo de' : 'por encima de';
  return {
    icon: 'scale',
    text: `Tu ritmo actual (${velocity.toFixed(2)} kg/sem) está ${relation} tu objetivo (${(-targetPace).toFixed(2)} kg/sem).`,
    severity: 'info',
    navigateTo: 'energy',
  };
}

export function templateSportVariety(input) {
  const { sportCount, sportDistribution } = input || {};
  const count = Array.isArray(sportDistribution) ? sportDistribution.length : sportCount;
  if (!Number.isFinite(count) || count < 4) return null;
  return {
    icon: 'layers',
    text: `Has entrenado ${count} deportes distintos esta semana. Diversidad alta.`,
    severity: 'positive',
    navigateTo: 'activity',
  };
}

export function templateRecoveryTrend(input) {
  const { recoveryScores } = input || {};
  if (!Array.isArray(recoveryScores) || recoveryScores.length < 7) return null;
  const recent = recoveryScores.slice(0, 7).filter(s => Number.isFinite(s));
  if (recent.length < 7) return null;
  const first = recent[6];
  const last = recent[0];
  const delta = last - first;
  if (Math.abs(delta) < 10) return null;
  const direction = delta >= 0 ? 'mejorado' : 'empeorado';
  const severity = delta >= 0 ? 'info' : 'alert';
  return {
    icon: 'activity',
    text: `Tu recuperación ha ${direction} un ${Math.abs(delta).toFixed(0)}% en los últimos 7 días.`,
    severity,
    navigateTo: 'insights',
  };
}

export function templateWHRImprovement(input) {
  const { currentWHR, priorWHR } = input || {};
  if (!Number.isFinite(currentWHR) || !Number.isFinite(priorWHR) || priorWHR <= 0) return null;
  const delta = priorWHR - currentWHR;
  if (Math.abs(delta) < 0.02) return null;
  const direction = delta > 0 ? 'mejorado' : 'empeorado';
  return {
    icon: 'ruler',
    text: `Tu ratio cintura-cadera ha ${direction} de ${priorWHR.toFixed(2)} a ${currentWHR.toFixed(2)} en 12 semanas.`,
    severity: 'info',
    navigateTo: 'measurements',
  };
}

export function templatePRWeek(input) {
  const { prCount } = input || {};
  if (!Number.isFinite(prCount) || prCount < 1) return null;
  return {
    icon: 'medal',
    text: `Has establecido ${prCount} récord${prCount !== 1 ? 's' : ''} personal${prCount !== 1 ? 'es' : ''} en deporte esta semana.`,
    severity: 'positive',
    navigateTo: 'dashboard',
  };
}

export function templateSportPRWeek(input) {
  const { recentPRs } = input || {};
  if (!Number.isFinite(recentPRs) || recentPRs < 1) return null;
  return {
    icon: 'medal',
    text: `Has establecido ${recentPRs} récord${recentPRs !== 1 ? 's' : ''} personal${recentPRs !== 1 ? 'es' : ''} en deporte esta semana.`,
    severity: 'positive',
    navigateTo: 'dashboard',
  };
}

// --- 3.9 generateAutoInsights ---

export function generateAutoInsights(input) {
  if (!input) return [];

  const allTemplates = [
    templateBestWeekStreak,
    templateHRVDeviation,
    templateRestDayStreak,
    templateWeightDirectionMatch,
    templateSportVariety,
    templateRecoveryTrend,
    templateWHRImprovement,
    templatePRWeek,
    templateSportPRWeek,
  ];

  const cards = [];
  for (const fn of allTemplates) {
    const result = fn(input);
    if (result) cards.push(result);
  }

  cards.sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99));

  return cards.slice(0, 8);
}

// --- 3.10 heatmapBucket ---

export function heatmapBucket(minutes) {
  if (!Number.isFinite(minutes)) return 0;
  const m = Math.max(0, minutes);
  if (m === 0) return 0;
  if (m <= 14) return 1;
  if (m <= 29) return 2;
  if (m <= 59) return 3;
  if (m <= 89) return 4;
  return 5;
}

export const __internals = {
  STANDARD_DISTANCES_KM,
  RIEGEL_EXPONENT,
  SPORT_EFFORT_MULTIPLIERS,
  NEAT_KCAL_PER_STEP,
  SPANISH_MONTHS_LONG,
  SPANISH_MONTHS_SHORT,
  SPANISH_WEEKDAY_LABELS,
  WHO_MALE_ZONES,
  WHO_FEMALE_ZONES,
  SPANISH_WEEKDAY_NAMES,
  SEVERITY_ORDER,
  templateBestWeekStreak,
  templateHRVDeviation,
  templateRestDayStreak,
  templateWeightDirectionMatch,
  templateSportVariety,
  templateRecoveryTrend,
  templateWHRImprovement,
  templatePRWeek,
  templateSportPRWeek,
};
