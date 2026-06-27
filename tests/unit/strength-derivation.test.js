// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  epley1RM,
  computePersonalRecords,
  detectPlateaus,
  strengthScore,
  weeklyTonnage,
} from '../../src/renderer/utils/strength-derivation.js';

describe('epley1RM', () => {
  it('computes Epley formula correctly', () => {
    expect(epley1RM(60, 8)).toBe(76.0);
  });

  it('single rep equals load', () => {
    expect(epley1RM(80, 1)).toBe(80.0);
  });

  it('returns null for null load', () => {
    expect(epley1RM(null, 5)).toBeNull();
  });

  it('returns null for null reps', () => {
    expect(epley1RM(60, null)).toBeNull();
  });

  it('returns null for zero reps', () => {
    expect(epley1RM(60, 0)).toBeNull();
  });

  it('rounds to one decimal', () => {
    expect(epley1RM(60, 3)).toBe(66.0);
    expect(epley1RM(67.5, 5)).toBe(78.8);
  });
});

describe('computePersonalRecords', () => {
  const exercises = [
    { id: 1, name: 'Press Banca', muscle_group: 'Pecho' },
    { id: 2, name: 'Sentadilla', muscle_group: 'Pierna' },
  ];

  const sessions = [
    { id: 1, date: '2026-01-10' },
    { id: 2, date: '2026-02-15' },
    { id: 3, date: '2026-03-20' },
  ];

  const sets = [
    { id: 1, session_id: 1, exercise_id: 1, load_kg: 70, reps: 5 },
    { id: 2, session_id: 2, exercise_id: 1, load_kg: 75, reps: 5 },
    { id: 3, session_id: 3, exercise_id: 1, load_kg: 80, reps: 3 },
    { id: 4, session_id: 1, exercise_id: 2, load_kg: 100, reps: 8 },
  ];

  const result = computePersonalRecords(sets, sessions, exercises);

  it('returns exercise PRs sorted by best 1RM descending', () => {
    expect(result.exercises).toHaveLength(2);
    expect(result.exercises[0].exercise_id).toBe(2);
    expect(result.exercises[1].exercise_id).toBe(1);
  });

  it('computes best 1RM for bench press', () => {
    const bp = result.exercises.find(e => e.exercise_id === 1);
    expect(bp.best_1rm).toBe(88.0);
  });

  it('assigns ranks correctly for bench press PRs', () => {
    const bp = result.exercises.find(e => e.exercise_id === 1);
    expect(bp.prs).toHaveLength(3);
    expect(bp.prs[0].rank).toBe(1);
    expect(bp.prs[0].estimated_1rm).toBe(88.0);
    expect(bp.prs[1].rank).toBe(2);
    expect(bp.prs[1].estimated_1rm).toBe(87.5);
    expect(bp.prs[2].rank).toBe(3);
    expect(bp.prs[2].estimated_1rm).toBe(81.7);
  });

  it('computes volume PRs correctly', () => {
    expect(result.volumePRs).toHaveLength(3);
    expect(result.volumePRs[0].rank).toBe(1);
    expect(result.volumePRs[0].volume_kg).toBe(1150);
  });

  it('handles empty sets', () => {
    const empty = computePersonalRecords([], [], []);
    expect(empty.exercises).toEqual([]);
    expect(empty.volumePRs).toEqual([]);
  });

  it('handles null input', () => {
    const empty = computePersonalRecords(null, null, null);
    expect(empty.exercises).toEqual([]);
    expect(empty.volumePRs).toEqual([]);
  });
});

describe('detectPlateaus', () => {
  it('flags exercises with PR older than 4 weeks', () => {
    const prs = {
      exercises: [
        { exercise_id: 1, exercise_name: 'Press Banca', muscle_group: 'Pecho', best_1rm: 80, best_1rm_date: '2026-01-01', total_sets: 12 },
      ],
    };
    const result = detectPlateaus(prs, new Date('2026-03-01'));
    expect(result).toHaveLength(1);
    expect(result[0].weeks_since_pr).toBeGreaterThanOrEqual(8);
  });

  it('does not flag recent PRs', () => {
    const prs = {
      exercises: [
        { exercise_id: 1, exercise_name: 'Press Banca', muscle_group: 'Pecho', best_1rm: 80, best_1rm_date: '2026-02-20', total_sets: 5 },
      ],
    };
    const result = detectPlateaus(prs, new Date('2026-03-01'));
    expect(result).toHaveLength(0);
  });

  it('assigns severity correctly', () => {
    const critical = detectPlateaus({
      exercises: [
        { exercise_id: 1, exercise_name: 'Test', muscle_group: 'A', best_1rm: 80, best_1rm_date: '2025-06-01', total_sets: 20 },
      ],
    }, new Date('2026-03-01'));
    expect(critical[0].severity).toBe('critical');

    const alert = detectPlateaus({
      exercises: [
        { exercise_id: 1, exercise_name: 'Test', muscle_group: 'A', best_1rm: 80, best_1rm_date: '2025-12-28', total_sets: 20 },
      ],
    }, new Date('2026-03-01'));
    expect(alert[0].severity).toBe('alert');

    const warning = detectPlateaus({
      exercises: [
        { exercise_id: 1, exercise_name: 'Test', muscle_group: 'A', best_1rm: 80, best_1rm_date: '2026-01-26', total_sets: 20 },
      ],
    }, new Date('2026-03-01'));
    expect(warning[0].severity).toBe('warning');
  });

  it('returns empty array for null input', () => {
    expect(detectPlateaus(null)).toEqual([]);
  });
});

describe('strengthScore', () => {
  const exercises = [
    { id: 1, name: 'Press Banca', muscle_group: 'Pecho', bilateral: 1, unilateral: 0 },
    { id: 2, name: 'Remo', muscle_group: 'Espalda', bilateral: 1, unilateral: 0 },
    { id: 3, name: 'Sentadilla', muscle_group: 'Pierna', bilateral: 1, unilateral: 0 },
    { id: 4, name: 'Curl Bíceps', muscle_group: 'Brazo', bilateral: 0, unilateral: 1 },
    { id: 5, name: 'Plancha', muscle_group: 'Core', bilateral: 0, unilateral: 0 },
  ];

  const prs = [
    { exercise_id: 1, exercise_name: 'Press Banca', best_1rm: 80 },
    { exercise_id: 2, exercise_name: 'Remo', best_1rm: 90 },
    { exercise_id: 3, exercise_name: 'Sentadilla', best_1rm: 140 },
    { exercise_id: 4, exercise_name: 'Curl Bíceps', best_1rm: 30 },
  ];

  it('computes per-muscle-group scores with bilateral weighting', () => {
    const result = strengthScore(prs, exercises, 75);
    expect(result.muscle_groups).toHaveLength(4);
    expect(result.muscle_groups.find(m => m.muscle_group === 'Pecho').score).toBe(80);
    expect(result.muscle_groups.find(m => m.muscle_group === 'Brazo').score).toBe(60);
  });

  it('computes composite score with 3+ groups', () => {
    const result = strengthScore(prs, exercises, 75);
    expect(result.composite_score).toBeTypeOf('number');
    expect(result.insufficient_muscle_groups).toBe(false);
  });

  it('returns null composite when < 3 muscle groups', () => {
    const few = [
      { exercise_id: 1, exercise_name: 'Press Banca', best_1rm: 80 },
      { exercise_id: 2, exercise_name: 'Remo', best_1rm: 90 },
    ];
    const result = strengthScore(few, exercises, 75);
    expect(result.composite_score).toBeNull();
    expect(result.insufficient_muscle_groups).toBe(true);
  });

  it('handles bodyweight exercises', () => {
    const corePrs = [{ exercise_id: 5, exercise_name: 'Plancha', best_1rm: null }];
    const result = strengthScore(corePrs, exercises, 75);
    expect(result.muscle_groups.find(m => m.muscle_group === 'Core').score).toBe(75);
  });

  it('returns empty for null input', () => {
    const result = strengthScore(null, null, null);
    expect(result.muscle_groups).toEqual([]);
    expect(result.insufficient_muscle_groups).toBe(true);
  });
});

describe('weeklyTonnage', () => {
  const sessions = [
    { id: 1, date: '2026-01-06' },
    { id: 2, date: '2026-01-13' },
    { id: 3, date: '2026-01-20' },
  ];

  const sets = [
    { id: 1, session_id: 1, load_kg: 60, reps: 10 },
    { id: 2, session_id: 2, load_kg: 70, reps: 8 },
    { id: 3, session_id: 3, load_kg: 80, reps: 5 },
  ];

  it('aggregates tonnage by ISO week', () => {
    const result = weeklyTonnage(sets, sessions);
    expect(result.weeks).toHaveLength(3);
    expect(result.weeks[0].tonnage_kg).toBe(600);
  });

  it('handles empty sets', () => {
    const result = weeklyTonnage([], []);
    expect(result.weeks).toEqual([]);
  });

  it('handles null input', () => {
    const result = weeklyTonnage(null, null);
    expect(result.weeks).toEqual([]);
    expect(result.delta_kg).toBeNull();
  });
});
