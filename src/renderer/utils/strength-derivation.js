export function epley1RM(load, reps) {
  if (load == null || reps == null || reps < 1) return null;
  if (reps === 1) return Math.round(load * 10) / 10;
  const rm = load * (1 + reps / 30);
  return Math.round(rm * 10) / 10;
}

export function computePersonalRecords(allSets, allSessions, exerciseLibrary) {
  if (!Array.isArray(allSets)) return { exercises: [], volumePRs: [] };
  const exMap = {};
  if (exerciseLibrary) for (const ex of exerciseLibrary) exMap[ex.id] = ex;
  const sessionMap = {};
  if (allSessions) for (const s of allSessions) sessionMap[s.id] = s;

  const byExercise = new Map();
  const sessionVolumes = new Map();

  for (const set of allSets) {
    const load = Number(set.load_kg);
    const reps = Number(set.reps);
    if (!Number.isFinite(load) || !Number.isFinite(reps) || reps < 1) continue;
    const rm = epley1RM(load, reps);
    if (rm == null) continue;
    const eid = set.exercise_id;
    if (!byExercise.has(eid)) byExercise.set(eid, []);
    byExercise.get(eid).push({ ...set, estimated_1rm: rm });

    const sid = set.session_id;
    const volume = load * reps;
    if (!sessionVolumes.has(sid)) sessionVolumes.set(sid, { session_id: sid, volume: 0, setCount: 0, exerciseIds: new Set() });
    const sv = sessionVolumes.get(sid);
    sv.volume += volume;
    sv.setCount += 1;
    sv.exerciseIds.add(eid);
  }

  const exercises = [];
  for (const [eid, sets] of byExercise) {
    const ex = exMap[eid];
    sets.sort((a, b) => b.estimated_1rm - a.estimated_1rm);
    const prs = sets.slice(0, 3).map((s, i) => {
      const sess = sessionMap[s.session_id];
      return {
        estimated_1rm: s.estimated_1rm,
        date: sess ? sess.date : null,
        session_id: s.session_id,
        rank: i + 1,
      };
    });
    exercises.push({
      exercise_id: eid,
      exercise_name: ex ? ex.name : 'Desconocido',
      muscle_group: ex ? ex.muscle_group : null,
      best_1rm: prs.length > 0 ? prs[0].estimated_1rm : null,
      best_1rm_date: prs.length > 0 ? prs[0].date : null,
      prs,
      total_sets: sets.length,
    });
  }

  exercises.sort((a, b) => (b.best_1rm || 0) - (a.best_1rm || 0));

  const volumePRs = Array.from(sessionVolumes.values())
    .map(sv => {
      const sess = sessionMap[sv.session_id];
      return {
        session_id: sv.session_id,
        date: sess ? sess.date : null,
        volume_kg: Math.round(sv.volume * 10) / 10,
        set_count: sv.setCount,
        exercise_count: sv.exerciseIds.size,
      };
    })
    .sort((a, b) => b.volume_kg - a.volume_kg)
    .slice(0, 3)
    .map((v, i) => ({ ...v, rank: i + 1 }));

  return { exercises, volumePRs };
}

export function detectPlateaus(personalRecords, currentDate) {
  if (!personalRecords || !Array.isArray(personalRecords.exercises)) return [];

  const now = currentDate instanceof Date ? currentDate : new Date();
  const plateaus = [];

  for (const ex of personalRecords.exercises) {
    if (!ex.best_1rm_date) continue;
    const prDate = new Date(ex.best_1rm_date + 'T00:00:00');
    const weeksSince = Math.floor((now - prDate) / (7 * 86400000));
    if (weeksSince < 4) continue;
    let severity;
    if (weeksSince >= 12) severity = 'critical';
    else if (weeksSince >= 8) severity = 'alert';
    else severity = 'warning';
    plateaus.push({
      exercise_id: ex.exercise_id,
      exercise_name: ex.exercise_name,
      muscle_group: ex.muscle_group,
      current_pr_1rm: ex.best_1rm,
      current_pr_date: ex.best_1rm_date,
      weeks_since_pr: weeksSince,
      severity,
      total_sets_since_pr: ex.total_sets,
    });
  }

  plateaus.sort((a, b) => b.weeks_since_pr - a.weeks_since_pr);
  return plateaus;
}

export function strengthScore(exercisePRs, exerciseLibrary, bodyWeight) {
  if (!Array.isArray(exercisePRs)) return { muscle_groups: [], composite_score: null, insufficient_muscle_groups: true, body_weight_kg: bodyWeight, total_muscle_groups: 0 };

  const exMap = {};
  if (exerciseLibrary) for (const ex of exerciseLibrary) exMap[ex.id] = ex;

  const byMuscle = new Map();
  for (const ex of exercisePRs) {
    const lib = exMap[ex.exercise_id];
    if (!lib) continue;
    const mg = lib.muscle_group || 'Otro';
    let score = ex.best_1rm || 0;

    if (lib.unilateral) {
      score = (score || 0) * 2;
    } else if (!lib.bilateral && !lib.unilateral) {
      score = (bodyWeight && Number.isFinite(bodyWeight)) ? bodyWeight : null;
    }

    if (score == null) continue;

    if (!byMuscle.has(mg)) byMuscle.set(mg, { muscle_group: mg, score: 0, exercise_count: 0, top_exercise: null, top_score: 0 });
    const entry = byMuscle.get(mg);
    entry.score += score;
    entry.exercise_count += 1;
    if (score > entry.top_score) {
      entry.top_score = score;
      entry.top_exercise = ex.exercise_name;
    }
  }

  const muscleGroups = Array.from(byMuscle.values())
    .map(mg => ({ ...mg, score: Math.round(mg.score) }))
    .sort((a, b) => b.score - a.score);

  const totalMuscleGroups = muscleGroups.length;
  const insufficient = totalMuscleGroups < 3;
  let composite = null;
  if (!insufficient) {
    const sum = muscleGroups.reduce((s, mg) => s + mg.score, 0);
    composite = Math.round(sum / totalMuscleGroups);
  }

  return {
    muscle_groups: muscleGroups,
    composite_score: composite,
    insufficient_muscle_groups: insufficient,
    body_weight_kg: bodyWeight,
    total_muscle_groups: totalMuscleGroups,
  };
}

function calcIsoWeekKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) return null;
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function weeklyTonnage(allSets, allSessions) {
  if (!Array.isArray(allSets) || !Array.isArray(allSessions)) {
    return { weeks: [], current_12w_total: null, previous_12w_total: null, delta_kg: null, delta_pct: null, direction: null };
  }

  const sessionMap = {};
  for (const s of allSessions) sessionMap[s.id] = s;

  const weekMap = new Map();
  for (const set of allSets) {
    const load = Number(set.load_kg);
    const reps = Number(set.reps);
    if (!Number.isFinite(load) || !Number.isFinite(reps)) continue;
    const sess = sessionMap[set.session_id];
    if (!sess || !sess.date) continue;
    const weekKey = calcIsoWeekKey(sess.date);
    if (!weekKey) continue;
    const volume = load * reps;
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, { week: weekKey, tonnage_kg: 0, session_count: 0 });
    const w = weekMap.get(weekKey);
    w.tonnage_kg += volume;
    w.session_count += 1;
  }

  const weeks = Array.from(weekMap.values())
    .map(w => ({ ...w, tonnage_kg: Math.round(w.tonnage_kg * 10) / 10 }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const now = new Date();
  const nowIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentWeekKey = calcIsoWeekKey(nowIso);
  if (!currentWeekKey) return { weeks, current_12w_total: null, previous_12w_total: null, delta_kg: null, delta_pct: null, direction: null };

  const wkBoundary = parseWeekKey(currentWeekKey);
  if (!wkBoundary) return { weeks, current_12w_total: null, previous_12w_total: null, delta_kg: null, delta_pct: null, direction: null };

  const currentStart = weekKeyFromOffset(wkBoundary, -11);
  const prevStart = weekKeyFromOffset(wkBoundary, -23);
  const prevEnd = weekKeyFromOffset(wkBoundary, -12);

  let currentTotal = 0, previousTotal = 0;
  for (const w of weeks) {
    if (w.week >= currentStart && w.week <= currentWeekKey) currentTotal += w.tonnage_kg;
    if (w.week >= prevStart && w.week <= prevEnd) previousTotal += w.tonnage_kg;
  }

  let deltaPct = null, direction = null, deltaKg = null;
  if (previousTotal > 0) {
    deltaKg = Math.round((currentTotal - previousTotal) * 10) / 10;
    deltaPct = Math.round(((currentTotal - previousTotal) / previousTotal) * 1000) / 10;
    direction = deltaKg > 0 ? 'up' : deltaKg < 0 ? 'down' : 'flat';
  }

  return {
    weeks,
    current_12w_total: Math.round(currentTotal * 10) / 10,
    previous_12w_total: Math.round(previousTotal * 10) / 10,
    delta_kg: deltaKg,
    delta_pct: deltaPct,
    direction,
  };
}

function isoWeekKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) return null;
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function parseWeekKey(key) {
  const m = key.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return null;
  return { year: parseInt(m[1]), week: parseInt(m[2]) };
}

function weekKeyFromOffset(boundary, offset) {
  let totalWeeks = boundary.year * 52 + boundary.week + offset;
  let year = Math.floor(totalWeeks / 52);
  let week = totalWeeks % 52;
  if (week <= 0) { week += 52; year -= 1; }
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export const __internals = { isoWeekKey, parseWeekKey, weekKeyFromOffset };
