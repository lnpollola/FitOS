function register(ipcMain, getDb, getHS) {
  ipcMain.handle('db:getExerciseLibrary', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM exercise_library ORDER BY name').all();
  });

  ipcMain.handle('db:saveExercise', (_event, exercise) => {
    const db = getDb();
    db.prepare('INSERT INTO exercise_library (name, muscle_group, equipment, movement_pattern) VALUES (@name, @muscle_group, @equipment, @movement_pattern)').run(exercise);
    return true;
  });

  ipcMain.handle('db:deleteExercise', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM exercise_library WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('db:getTrainingSessions', () => {
    const db = getDb();
    return db.prepare(`
      SELECT ts.*, tr.name as routine_name
      FROM training_sessions ts LEFT JOIN training_routines tr ON ts.routine_id = tr.id
      ORDER BY ts.date DESC
    `).all();
  });

  ipcMain.handle('db:saveTrainingSession', (_event, session) => {
    const db = getDb();
    if (session.id) {
      db.prepare('UPDATE training_sessions SET date = @date, routine_id = @routine_id, notes = @notes WHERE id = @id').run(session);
      return { ok: true, id: session.id };
    }
    const result = db.prepare('INSERT INTO training_sessions (date, routine_id, notes) VALUES (@date, @routine_id, @notes)').run(session);
    return { ok: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('db:deleteTrainingSession', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM training_sets WHERE session_id = ?').run(id);
    db.prepare('DELETE FROM training_sessions WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('db:getTrainingSets', (_event, sessionId) => {
    const db = getDb();
    return db.prepare('SELECT * FROM training_sets WHERE session_id = ? ORDER BY set_number').all(sessionId);
  });

  ipcMain.handle('db:saveTrainingSet', (_event, set) => {
    const db = getDb();
    if (set.id) {
      db.prepare('UPDATE training_sets SET session_id = @session_id, exercise_id = @exercise_id, set_number = @set_number, load_kg = @load_kg, reps = @reps, rpe = @rpe WHERE id = @id').run(set);
      return { ok: true, id: set.id };
    }
    const result = db.prepare('INSERT INTO training_sets (session_id, exercise_id, set_number, load_kg, reps, rpe) VALUES (@session_id, @exercise_id, @set_number, @load_kg, @reps, @rpe)').run(set);
    return { ok: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('db:deleteTrainingSet', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM training_sets WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('db:getTrainingRoutines', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM training_routines ORDER BY name').all();
  });

  ipcMain.handle('db:saveTrainingRoutine', (_event, routine) => {
    const db = getDb();
    if (routine.id) {
      db.prepare('UPDATE training_routines SET name = @name WHERE id = @id').run(routine);
      return { ok: true, id: routine.id };
    }
    const result = db.prepare('INSERT INTO training_routines (name) VALUES (@name)').run(routine);
    return { ok: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('db:deleteTrainingRoutine', (_event, id) => {
    const db = getDb();
    db.prepare('UPDATE training_sessions SET routine_id = NULL WHERE routine_id = ?').run(id);
    db.prepare('DELETE FROM training_routines WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('db:getWorkoutPlans', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM workout_plans ORDER BY min_sessions, name').all();
  });

  ipcMain.handle('db:getPlanDays', (_event, planId) => {
    const db = getDb();
    return db.prepare('SELECT * FROM workout_plan_days WHERE plan_id = ? ORDER BY day_number').all(planId);
  });

  ipcMain.handle('db:getExercisesByIds', (_event, ids) => {
    const db = getDb();
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    return db.prepare(`SELECT * FROM exercise_library WHERE id IN (${placeholders})`).all(...ids);
  });
}

module.exports = { register };
