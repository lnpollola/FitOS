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

function epley1RM(load, reps) {
  if (load == null || reps == null || reps < 1) return null;
  return Math.round(load * (1 + reps / 30) * 10) / 10;
}

function register(ipcMain, getDb, _getHS, _notifyDomain) {
  ipcMain.handle('db:getStrengthPersonalRecords', () => {
    const db = getDb();
    const exercises = db.prepare('SELECT id, name, muscle_group FROM exercise_library').all();
    const sessions = db.prepare('SELECT id, date FROM training_sessions ORDER BY date ASC').all();
    const sets = db.prepare(`
      SELECT ts.id, ts.session_id, ts.exercise_id, ts.load_kg, ts.reps, ts.rpe
      FROM training_sets ts
      WHERE ts.load_kg IS NOT NULL AND ts.reps IS NOT NULL
    `).all();

    const exMap = {};
    for (const ex of exercises) exMap[ex.id] = ex;
    const sessionMap = {};
    for (const s of sessions) sessionMap[s.id] = s;

    const byExercise = new Map();
    const sessionVolumes = new Map();

    for (const set of sets) {
      const load = Number(set.load_kg);
      const reps = Number(set.reps);
      if (!Number.isFinite(load) || !Number.isFinite(reps) || reps < 1) continue;
      const rm = epley1RM(load, reps);
      if (rm == null) continue;
      const eid = set.exercise_id;
      if (!byExercise.has(eid)) byExercise.set(eid, []);
      byExercise.get(eid).push({
        estimated_1rm: rm,
        session_id: set.session_id,
        date: sessionMap[set.session_id] ? sessionMap[set.session_id].date : null,
      });
      const sid = set.session_id;
      const volume = load * reps;
      if (!sessionVolumes.has(sid)) sessionVolumes.set(sid, { session_id: sid, volume: 0, setCount: 0, exerciseIds: new Set() });
      const sv = sessionVolumes.get(sid);
      sv.volume += volume;
      sv.setCount += 1;
      sv.exerciseIds.add(eid);
    }

    const prs = [];
    for (const [eid, setList] of byExercise) {
      const ex = exMap[eid];
      setList.sort((a, b) => b.estimated_1rm - a.estimated_1rm);
      const top3 = setList.slice(0, 3).map((s, i) => ({
        estimated_1rm: s.estimated_1rm,
        date: s.date,
        session_id: s.session_id,
        rank: i + 1,
      }));
      prs.push({
        exercise_id: eid,
        exercise_name: ex ? ex.name : 'Desconocido',
        muscle_group: ex ? ex.muscle_group : null,
        best_1rm: top3.length > 0 ? top3[0].estimated_1rm : null,
        best_1rm_date: top3.length > 0 ? top3[0].date : null,
        prs: top3,
        total_sets: setList.length,
      });
    }

    prs.sort((a, b) => (b.best_1rm || 0) - (a.best_1rm || 0));

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

    const muscleGroups = [...new Set(exercises.map(e => e.muscle_group).filter(Boolean))].sort();

    return { exercises: prs, volumePRs, muscleGroups };
  });

  ipcMain.handle('db:getStrengthPlateau', () => {
    const db = getDb();
    const exercises = db.prepare('SELECT id, name, muscle_group FROM exercise_library').all();
    const sessions = db.prepare('SELECT id, date FROM training_sessions ORDER BY date ASC').all();
    const sets = db.prepare(`
      SELECT ts.id, ts.session_id, ts.exercise_id, ts.load_kg, ts.reps
      FROM training_sets ts
      WHERE ts.load_kg IS NOT NULL AND ts.reps IS NOT NULL
    `).all();

    const sessionMap = {};
    for (const s of sessions) sessionMap[s.id] = s;
    const exMap = {};
    for (const ex of exercises) exMap[ex.id] = ex;

    const byExercise = new Map();
    const activeExercises = new Set();

    const eightWeeksAgo = addDays(toIsoDate(new Date()), -56);

    for (const set of sets) {
      const load = Number(set.load_kg);
      const reps = Number(set.reps);
      if (!Number.isFinite(load) || !Number.isFinite(reps) || reps < 1) continue;
      const rm = epley1RM(load, reps);
      if (rm == null) continue;
      const eid = set.exercise_id;
      const sessDate = sessionMap[set.session_id] ? sessionMap[set.session_id].date : null;
      if (!byExercise.has(eid)) byExercise.set(eid, []);
      byExercise.get(eid).push({ estimated_1rm: rm, date: sessDate });
      if (sessDate && sessDate >= eightWeeksAgo) activeExercises.add(eid);
    }

    const now = new Date();
    const plateaus = [];

    for (const [eid, setList] of byExercise) {
      if (!activeExercises.has(eid)) continue;
      const ex = exMap[eid];
      setList.sort((a, b) => b.estimated_1rm - a.estimated_1rm);
      const best = setList[0];
      if (!best || !best.date) continue;
      const prDate = new Date(best.date + 'T00:00:00');
      const weeksSince = Math.floor((now - prDate) / (7 * 86400000));
      if (weeksSince < 4) continue;
      let severity;
      if (weeksSince >= 12) severity = 'critical';
      else if (weeksSince >= 8) severity = 'alert';
      else severity = 'warning';
      plateaus.push({
        exercise_id: eid,
        exercise_name: ex ? ex.name : 'Desconocido',
        muscle_group: ex ? ex.muscle_group : null,
        current_pr_1rm: best.estimated_1rm,
        current_pr_date: best.date,
        weeks_since_pr: weeksSince,
        severity,
        total_sets_since_pr: setList.length,
      });
    }

    plateaus.sort((a, b) => b.weeks_since_pr - a.weeks_since_pr);
    return plateaus;
  });

  ipcMain.handle('db:getStrengthScore', () => {
    const db = getDb();
    const profile = db.prepare('SELECT weight_kg FROM user_profile LIMIT 1').get();
    const bodyWeight = profile && Number.isFinite(Number(profile.weight_kg)) ? Number(profile.weight_kg) : null;

    const exercises = db.prepare('SELECT id, name, muscle_group, bilateral, unilateral FROM exercise_library').all();
    const sets = db.prepare(`
      SELECT ts.exercise_id, ts.load_kg, ts.reps
      FROM training_sets ts
      WHERE ts.load_kg IS NOT NULL AND ts.reps IS NOT NULL
    `).all();

    const exMap = {};
    for (const ex of exercises) exMap[ex.id] = ex;

    const byExercise = new Map();
    for (const set of sets) {
      const load = Number(set.load_kg);
      const reps = Number(set.reps);
      if (!Number.isFinite(load) || !Number.isFinite(reps) || reps < 1) continue;
      const rm = epley1RM(load, reps);
      if (rm == null) continue;
      const eid = set.exercise_id;
      if (!byExercise.has(eid)) byExercise.set(eid, 0);
      if (rm > byExercise.get(eid)) byExercise.set(eid, rm);
    }

    const byMuscle = new Map();
    for (const [eid, bestRM] of byExercise) {
      const lib = exMap[eid];
      if (!lib) continue;
      const mg = lib.muscle_group || 'Otro';
      let score = bestRM;
      if (lib.unilateral) {
        score = score * 2;
      } else if (!lib.bilateral && !lib.unilateral) {
        score = bodyWeight;
      }
      if (score == null) continue;
      if (!byMuscle.has(mg)) byMuscle.set(mg, { muscle_group: mg, score: 0, exercise_count: 0, top_exercise: null, top_score: 0 });
      const entry = byMuscle.get(mg);
      entry.score += score;
      entry.exercise_count += 1;
      if (score > entry.top_score) {
        entry.top_score = score;
        entry.top_exercise = lib.name;
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
  });

  ipcMain.handle('db:getWeeklyTonnage', () => {
    const db = getDb();
    const sessions = db.prepare('SELECT id, date FROM training_sessions ORDER BY date ASC').all();
    const sets = db.prepare(`
      SELECT ts.id, ts.session_id, ts.load_kg, ts.reps
      FROM training_sets ts
      WHERE ts.load_kg IS NOT NULL AND ts.reps IS NOT NULL
    `).all();

    const sessionMap = {};
    for (const s of sessions) sessionMap[s.id] = s;

    const weekMap = new Map();
    for (const set of sets) {
      const load = Number(set.load_kg);
      const reps = Number(set.reps);
      if (!Number.isFinite(load) || !Number.isFinite(reps)) continue;
      const sess = sessionMap[set.session_id];
      if (!sess || !sess.date) continue;
      const wk = isoWeekKey(sess.date);
      if (!wk) continue;
      const volume = load * reps;
      if (!weekMap.has(wk)) weekMap.set(wk, { week: wk, tonnage_kg: 0, session_count: 0 });
      const w = weekMap.get(wk);
      w.tonnage_kg += volume;
      w.session_count += 1;
    }

    const weeks = Array.from(weekMap.values())
      .map(w => ({ ...w, tonnage_kg: Math.round(w.tonnage_kg * 10) / 10 }))
      .sort((a, b) => a.week.localeCompare(b.week));

    const now = new Date();
    const currentWeekKey = isoWeekKey(toIsoDate(now));
    if (!currentWeekKey) {
      return { weeks: [], current_12w_total: null, previous_12w_total: null, delta_kg: null, delta_pct: null, direction: null };
    }

    const wkBoundary = parseWeekKey(currentWeekKey);
    if (!wkBoundary) {
      return { weeks: [], current_12w_total: null, previous_12w_total: null, delta_kg: null, delta_pct: null, direction: null };
    }

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
  });
}

module.exports = { register };
