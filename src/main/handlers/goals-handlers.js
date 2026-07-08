const GOALS_KEY = 'goals';

function register(ipcMain, getDb) {
  ipcMain.handle('db:getGoals', () => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(GOALS_KEY);
    if (!row) return [];
    try { return JSON.parse(row.value); } catch { return []; }
  });

  ipcMain.handle('db:saveGoal', (_event, goal) => {
    const db = getDb();
    const validation = validateGoal(goal);
    if (!validation.valid) return { ok: false, error: validation.error };
    const tx = db.transaction(() => {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(GOALS_KEY);
      let goals = [];
      if (row) { try { goals = JSON.parse(row.value); } catch {} }
      const idx = goals.findIndex(g => g.id === goal.id);
      const now = new Date().toISOString();
      if (idx >= 0) {
        const created = goals[idx].createdAt;
        goals[idx] = { ...goal, createdAt: created, updatedAt: now };
      } else {
        goals.push({ ...goal, createdAt: now, updatedAt: now });
      }
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(GOALS_KEY, JSON.stringify(goals));
      return goals.find(g => g.id === goal.id);
    });
    const saved = tx();
    return { ok: true, goal: saved };
  });

  ipcMain.handle('db:deleteGoal', (_event, id) => {
    const db = getDb();
    const tx = db.transaction(() => {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(GOALS_KEY);
      if (!row) return false;
      let goals = [];
      try { goals = JSON.parse(row.value); } catch { return false; }
      const before = goals.length;
      goals = goals.filter(g => g.id !== id);
      if (goals.length === before) return false;
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(GOALS_KEY, JSON.stringify(goals));
      return true;
    });
    const found = tx();
    return found ? { ok: true } : { ok: false, error: 'Goal not found' };
  });

  ipcMain.handle('db:archiveGoal', (_event, id) => {
    const db = getDb();
    const tx = db.transaction(() => {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(GOALS_KEY);
      if (!row) return false;
      let goals = [];
      try { goals = JSON.parse(row.value); } catch { return false; }
      const idx = goals.findIndex(g => g.id === id);
      if (idx < 0) return false;
      goals[idx].archived = true;
      goals[idx].archivedAt = new Date().toISOString();
      goals[idx].updatedAt = new Date().toISOString();
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(GOALS_KEY, JSON.stringify(goals));
      return true;
    });
    const found = tx();
    return found ? { ok: true } : { ok: false, error: 'Goal not found' };
  });

  ipcMain.handle('db:getGoalProgress', (_event, goalId) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(GOALS_KEY);
    if (!row) return { ok: false, error: 'No goals' };
    let goals = [];
    try { goals = JSON.parse(row.value); } catch { return { ok: false, error: 'Parse error' }; }
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { ok: false, error: 'Goal not found' };

    let current = goal.current || 0;
    const target = goal.target;
    const startDate = goal.startDate;

    if (goal.type === 'weight') {
      const startEntry = db.prepare('SELECT weight_kg FROM weight_entries WHERE date <= ? ORDER BY date DESC LIMIT 1').get(startDate);
      const startWeight = startEntry ? startEntry.weight_kg : null;
      const currentEntry = db.prepare('SELECT weight_kg FROM weight_entries WHERE date >= ? ORDER BY date DESC LIMIT 1').get(startDate);
      if (currentEntry) current = currentEntry.weight_kg;
      
      if (startWeight !== null && target > 0) {
        if (target < startWeight) {
          // Weight loss: progress = (start - current) / (start - target)
          const progress = startWeight > target ? (startWeight - current) / (startWeight - target) : 0;
          const progress_pct = Math.max(0, Math.min(100, Math.round(progress * 1000) / 10));
          return { ok: true, current, target, progress_pct };
        } else if (target > startWeight) {
          // Weight gain: progress = (current - start) / (target - start)
          const progress = target > startWeight ? (current - startWeight) / (target - startWeight) : 0;
          const progress_pct = Math.max(0, Math.min(100, Math.round(progress * 1000) / 10));
          return { ok: true, current, target, progress_pct };
        }
      }
      // No starting weight or target equals start
      return { ok: true, current, target, progress_pct: 0, note: 'Sin datos de peso iniciales' };
    } else if (goal.type === 'distance') {
      const result = db.prepare("SELECT COALESCE(SUM(distance_km), 0) as total FROM sport_activities WHERE date >= ? AND (sport_type = 'running' OR sport_type = 'cycling')").get(startDate);
      current = result ? result.total : 0;
    } else if (goal.type === 'frequency') {
      const now = new Date();
      const day = now.getDay() || 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day - 1));
      monday.setHours(0, 0, 0, 0);
      const mondayStr = monday.toISOString().split('T')[0];
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const sundayStr = sunday.toISOString().split('T')[0];
      const result = db.prepare('SELECT COUNT(*) as cnt FROM sport_activities WHERE date >= ? AND date <= ?').get(mondayStr, sundayStr);
      current = result ? result.cnt : 0;
    }

    const progress_pct = target > 0 ? Math.min(100, Math.round((current / target) * 1000) / 10) : 0;
    return { ok: true, current, target, progress_pct };
  });
}

function validateGoal(goal) {
  if (!goal) return { valid: false, error: 'Goal object is required' };
  const validTypes = ['weight', 'distance', 'frequency', 'custom'];
  if (!validTypes.includes(goal.type)) return { valid: false, error: 'Invalid goal type' };
  if (!goal.label || typeof goal.label !== 'string' || goal.label.trim().length === 0) return { valid: false, error: 'Label is required' };
  if (goal.label.length > 100) return { valid: false, error: 'Label must be at most 100 characters' };
  if (typeof goal.target !== 'number' || goal.target <= 0) return { valid: false, error: 'Target must be a positive number' };
  if (typeof goal.current !== 'number' || goal.current < 0) return { valid: false, error: 'Current must be a non-negative number' };
  if (!goal.unit || typeof goal.unit !== 'string' || goal.unit.trim().length === 0) return { valid: false, error: 'Unit is required' };
  if (goal.unit.length > 30) return { valid: false, error: 'Unit must be at most 30 characters' };
  if (!goal.startDate || typeof goal.startDate !== 'string') return { valid: false, error: 'Start date is required' };
  if (!goal.targetDate || typeof goal.targetDate !== 'string') return { valid: false, error: 'Target date is required' };
  return { valid: true };
}

module.exports = { register };
