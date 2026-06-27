import { describe, it, expect } from 'vitest';

describe('goals utils', () => {
  it('computeProgress returns percentage', async () => {
    const { computeProgress } = await import('../../src/renderer/utils/goals.js');
    expect(computeProgress(50, 100)).toBe(50);
    expect(computeProgress(0, 100)).toBe(0);
    expect(computeProgress(100, 100)).toBe(100);
    expect(computeProgress(150, 100)).toBe(100);
  });

  it('computeProgress handles zero target', async () => {
    const { computeProgress } = await import('../../src/renderer/utils/goals.js');
    expect(computeProgress(50, 0)).toBe(0);
  });

  it('computeDaysRemaining returns positive integer', async () => {
    const { computeDaysRemaining } = await import('../../src/renderer/utils/goals.js');
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const days = computeDaysRemaining(future.toISOString().split('T')[0]);
    expect(days).toBeGreaterThanOrEqual(29);
    expect(days).toBeLessThanOrEqual(31);
  });

  it('computeDaysRemaining returns 0 for past date', async () => {
    const { computeDaysRemaining } = await import('../../src/renderer/utils/goals.js');
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const days = computeDaysRemaining(past.toISOString().split('T')[0]);
    expect(days).toBe(0);
  });

  it('computeDaysRemaining returns 0 for null input', async () => {
    const { computeDaysRemaining } = await import('../../src/renderer/utils/goals.js');
    expect(computeDaysRemaining(null)).toBe(0);
  });

  it('sortGoalsByDeadline sorts by targetDate ascending', async () => {
    const { sortGoalsByDeadline } = await import('../../src/renderer/utils/goals.js');
    const goals = [
      { id: '1', targetDate: '2026-09-15' },
      { id: '2', targetDate: '2026-07-01' },
      { id: '3', targetDate: '2026-12-31' },
    ];
    const sorted = sortGoalsByDeadline(goals);
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
    expect(sorted[2].id).toBe('3');
  });

  it('sortGoalsByDeadline puts goals without targetDate last', async () => {
    const { sortGoalsByDeadline } = await import('../../src/renderer/utils/goals.js');
    const goals = [
      { id: '1', targetDate: '2026-09-15' },
      { id: '2' },
    ];
    const sorted = sortGoalsByDeadline(goals);
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
  });

  it('getActiveGoals filters out archived', async () => {
    const { getActiveGoals } = await import('../../src/renderer/utils/goals.js');
    const goals = [
      { id: '1', archived: false },
      { id: '2', archived: true },
      { id: '3', archived: false },
    ];
    const active = getActiveGoals(goals);
    expect(active).toHaveLength(2);
  });

  it('getActiveGoals handles empty array', async () => {
    const { getActiveGoals } = await import('../../src/renderer/utils/goals.js');
    expect(getActiveGoals([])).toHaveLength(0);
    expect(getActiveGoals(null)).toHaveLength(0);
  });

  it('formatGoalValue formats weight and distance to 1 decimal', async () => {
    const { formatGoalValue } = await import('../../src/renderer/utils/goals.js');
    expect(formatGoalValue(78.5, 'weight')).toBe('78.5');
    expect(formatGoalValue(67.33, 'distance')).toBe('67.3');
  });

  it('formatGoalValue rounds other types', async () => {
    const { formatGoalValue } = await import('../../src/renderer/utils/goals.js');
    expect(formatGoalValue(3, 'frequency')).toBe('3');
  });
});
