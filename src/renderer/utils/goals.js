export function computeProgress(current, target) {
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return 0;
  return Math.min(100, Math.round((Math.max(0, current) / target) * 1000) / 10);
}

export function computeDaysRemaining(targetDate) {
  if (!targetDate) return 0;
  const target = new Date(targetDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - today) / 86400000);
  return Math.max(0, diff);
}

export function sortGoalsByDeadline(goals) {
  if (!Array.isArray(goals)) return [];
  return [...goals].sort((a, b) => {
    const aDate = a.targetDate || '9999-12-31';
    const bDate = b.targetDate || '9999-12-31';
    return aDate.localeCompare(bDate);
  });
}

export function getActiveGoals(goals) {
  if (!Array.isArray(goals)) return [];
  return goals.filter(g => !g.archived);
}

export function getCompletedGoals(goals) {
  if (!Array.isArray(goals)) return [];
  return goals.filter(g => !g.archived).filter(g => {
    const pct = g.progress_pct || computeProgress(g.current, g.target);
    return pct >= 100;
  });
}

export function formatGoalValue(value, type) {
  const v = Number(value) || 0;
  if (type === 'weight' || type === 'distance') return v.toFixed(1);
  return String(Math.round(v));
}
