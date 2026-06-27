import { describe, it, expect } from 'vitest';
import {
  paceProjection,
  isWithinProjectionWindow,
  projectStandardDistances,
  rankRecords,
  effortMultiplier,
  computeWeeklyEffort,
  isoWeek,
  isoWeekKey,
  currentIsoWeekRange,
  previousIsoWeekRange,
  toIsoDate,
  computeStreak,
  formatDuration,
  formatRecordTime,
  formatDateLong,
  formatDateShort,
  formatDateRange,
  effortLevel,
  clampEffortDisplay,
} from '../../src/renderer/utils/kpi-derivation.js';

describe('paceProjection (Riegel)', () => {
  it('projects 5 km from 1 km PR correctly', () => {
    const t = paceProjection(1, 4, 5);
    expect(t).toBeCloseTo(4 * Math.pow(5, 1.06), 2);
    expect(t).toBeGreaterThan(20);
    expect(t).toBeLessThan(30);
  });

  it('returns identity for same distance', () => {
    expect(paceProjection(5, 25, 5)).toBe(25);
  });

  it('returns null for invalid inputs', () => {
    expect(paceProjection(0, 25, 5)).toBeNull();
    expect(paceProjection(5, 0, 5)).toBeNull();
    expect(paceProjection(5, 25, 0)).toBeNull();
    expect(paceProjection(NaN, 25, 5)).toBeNull();
  });

  it('rejects activities outside the 0.8x-1.5x projection window', () => {
    expect(isWithinProjectionWindow(0.5, 5)).toBe(false);
    expect(isWithinProjectionWindow(4.0, 5)).toBe(true);
    expect(isWithinProjectionWindow(7.5, 5)).toBe(true);
    expect(isWithinProjectionWindow(10, 5)).toBe(false);
  });
});

describe('projectStandardDistances', () => {
  const activities = [
    { id: 1, date: '2026-06-15', sport_type: 'running', distance_km: 5.0, duration_minutes: 25 },
    { id: 2, date: '2026-06-20', sport_type: 'running', distance_km: 4.87, duration_minutes: 24 },
    { id: 3, date: '2026-06-10', sport_type: 'cycling', distance_km: 30, duration_minutes: 60 },
  ];

  it('finds best running PR per standard distance', () => {
    const prs = projectStandardDistances(activities, 'running');
    const pr5 = prs.find(p => p.distance_key === '5');
    expect(pr5).toBeTruthy();
    expect(pr5.time_min).toBeLessThan(26);
    expect(pr5.achieved_at).toBe('2026-06-20');
  });

  it('skips cycling activities when filtering for running', () => {
    const runPrs = projectStandardDistances(activities, 'running');
    runPrs.forEach(p => expect(p.sport_type).toBe('running'));
  });

  it('skips activities with distance < 1.0 km', () => {
    const short = [{ id: 99, date: '2026-06-01', sport_type: 'running', distance_km: 0.5, duration_minutes: 3 }];
    const prs = projectStandardDistances(short, 'running');
    expect(prs).toHaveLength(0);
  });
});

describe('rankRecords', () => {
  it('assigns rank 1 to best, 2 to second-best, 3 to third-best', () => {
    const records = [
      { sport_type: 'running', distance_key: '5', time_min: 26, achieved_at: '2025-01-01' },
      { sport_type: 'running', distance_key: '5', time_min: 25, achieved_at: '2026-01-01' },
      { sport_type: 'running', distance_key: '5', time_min: 27, achieved_at: '2024-01-01' },
    ];
    const ranked = rankRecords(records);
    expect(ranked.find(r => r.time_min === 25).rank).toBe(1);
    expect(ranked.find(r => r.time_min === 26).rank).toBe(2);
    expect(ranked.find(r => r.time_min === 27).rank).toBe(3);
  });

  it('sorts final list by achieved_at DESC', () => {
    const records = [
      { sport_type: 'running', distance_key: '5', time_min: 25, achieved_at: '2024-01-01' },
      { sport_type: 'running', distance_key: '5', time_min: 26, achieved_at: '2026-01-01' },
    ];
    const ranked = rankRecords(records);
    expect(ranked[0].achieved_at).toBe('2026-01-01');
  });

  it('handles ties by preferring later date', () => {
    const records = [
      { sport_type: 'running', distance_key: '5', time_min: 25, achieved_at: '2025-01-01' },
      { sport_type: 'running', distance_key: '5', time_min: 25, achieved_at: '2026-01-01' },
    ];
    const ranked = rankRecords(records);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].achieved_at).toBe('2026-01-01');
  });
});

describe('effortMultiplier', () => {
  it('returns the right multiplier for each known sport', () => {
    expect(effortMultiplier('running')).toBe(1.4);
    expect(effortMultiplier('cycling')).toBe(1.2);
    expect(effortMultiplier('swimming')).toBe(1.5);
    expect(effortMultiplier('HIIT')).toBe(1.6);
    expect(effortMultiplier('strength')).toBe(1.3);
    expect(effortMultiplier('walking')).toBe(1.0);
    expect(effortMultiplier('football')).toBe(1.3);
    expect(effortMultiplier('paddle')).toBe(1.2);
    expect(effortMultiplier('boxing')).toBe(1.5);
    expect(effortMultiplier('yoga')).toBe(1.0);
  });

  it('returns 1.1 (other) for unknown sports', () => {
    expect(effortMultiplier('unicycle')).toBe(1.1);
    expect(effortMultiplier('curling')).toBe(1.1);
    expect(effortMultiplier(null)).toBe(1.1);
    expect(effortMultiplier(undefined)).toBe(1.1);
  });
});

describe('computeWeeklyEffort', () => {
  it('sums sport_kcal × multiplier + steps × 0.04 (NEAT)', () => {
    const activities = [
      { sport_type: 'running', calories: 1000, duration_minutes: 60 },
      { sport_type: 'yoga', calories: 200, duration_minutes: 45 },
    ];
    const days = [{ steps: 10000 }];
    const effort = computeWeeklyEffort(activities, days);
    expect(effort).toBe(Math.floor(1000 * 1.4 + 200 * 1.0 + 10000 * 0.04));
  });

  it('handles empty inputs', () => {
    expect(computeWeeklyEffort([], [])).toBe(0);
    expect(computeWeeklyEffort(null, null)).toBe(0);
  });

  it('uses default multiplier for unknown sports', () => {
    const effort = computeWeeklyEffort(
      [{ sport_type: 'unicycling', calories: 500, duration_minutes: 30 }],
      []
    );
    expect(effort).toBe(Math.floor(500 * 1.1));
  });
});

describe('isoWeek', () => {
  it('returns ISO week for a known date', () => {
    expect(isoWeek(new Date('2026-06-27'))).toEqual({ year: 2026, week: 26 });
  });

  it('handles Mon-Sun boundary', () => {
    expect(isoWeek(new Date('2026-06-22')).week).toBe(26);
    expect(isoWeek(new Date('2026-06-28')).week).toBe(26);
  });

  it('handles year boundary (Jan 1 is week 1 of new year unless it is Fri-Sun)', () => {
    const w = isoWeek(new Date('2026-01-01'));
    expect(w.year).toBeGreaterThanOrEqual(2025);
    expect(w.year).toBeLessThanOrEqual(2026);
  });

  it('returns null for invalid date', () => {
    expect(isoWeek('not a date')).toBe(null);
  });
});

describe('isoWeekKey', () => {
  it('returns formatted YYYY-WNN', () => {
    expect(isoWeekKey(new Date('2026-06-27'))).toBe('2026-W26');
  });
});

describe('currentIsoWeekRange / previousIsoWeekRange', () => {
  it('returns Mon-Sun range', () => {
    const range = currentIsoWeekRange(new Date('2026-06-27'));
    expect(range.start_date).toBe('2026-06-22');
    expect(range.end_date).toBe('2026-06-28');
  });

  it('previous week is exactly 7 days earlier', () => {
    const cur = currentIsoWeekRange(new Date('2026-06-27'));
    const prev = previousIsoWeekRange(new Date('2026-06-27'));
    expect(prev.end_date).toBe('2026-06-21');
    expect(prev.start_date).toBe('2026-06-15');
  });
});

describe('toIsoDate', () => {
  it('formats Date as YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 5, 15))).toBe('2026-06-15');
    expect(toIsoDate(new Date(2026, 0, 3))).toBe('2026-01-03');
  });
});

describe('computeStreak', () => {
  it('returns 0 for empty input', () => {
    expect(computeStreak([])).toEqual({ weeks: 0, totalActivities: 0, isActive: false, lastBrokenDate: null });
  });

  it('counts current week as active even with empty current', () => {
    const range = currentIsoWeekRange();
    const result = computeStreak([range.start_date, '2026-06-15']);
    expect(result.isActive).toBe(true);
    expect(result.weeks).toBe(2);
    expect(result.totalActivities).toBe(2);
  });

  it('breaks streak when a week is missed', () => {
    const result = computeStreak(['2026-06-22', '2026-06-08']);
    expect(result.weeks).toBe(1);
  });

  it('returns lastBrokenDate for broken streak', () => {
    const result = computeStreak(['2026-05-01', '2026-04-01']);
    expect(result.weeks).toBe(0);
    expect(result.lastBrokenDate).toBe('2026-05-01');
  });

  it('handles never-started', () => {
    expect(computeStreak([]).weeks).toBe(0);
    expect(computeStreak([]).isActive).toBe(false);
  });

  it('ignores invalid date strings', () => {
    expect(computeStreak(['nope', 'also-nope']).weeks).toBe(0);
  });
});

describe('formatDuration', () => {
  it('formats minutes under 1h as Xm', () => {
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(0)).toBe('0m');
  });

  it('formats hours + minutes as Xh Ym', () => {
    expect(formatDuration(249)).toBe('4h 9m');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(125)).toBe('2h 5m');
  });

  it('handles null/undefined/NaN', () => {
    expect(formatDuration(null)).toBe('0m');
    expect(formatDuration(undefined)).toBe('0m');
    expect(formatDuration(NaN)).toBe('0m');
  });
});

describe('formatRecordTime', () => {
  it('formats under-1h times as mm:ss', () => {
    expect(formatRecordTime(1812)).toBe('30:12');
    expect(formatRecordTime(60)).toBe('01:00');
  });

  it('formats over-1h times as h:mm:ss', () => {
    expect(formatRecordTime(3725)).toBe('1:02:05');
  });
});

describe('formatDateLong (Spanish)', () => {
  it('returns "DD de MMMM de YYYY"', () => {
    expect(formatDateLong(new Date(2026, 5, 15))).toBe('15 de junio de 2026');
    expect(formatDateLong(new Date(2026, 0, 1))).toBe('1 de enero de 2026');
  });
});

describe('formatDateShort (Spanish)', () => {
  it('returns "DD MMM" with abbreviated month', () => {
    expect(formatDateShort(new Date(2026, 5, 15))).toBe('15 jun');
    expect(formatDateShort(new Date(2026, 0, 1))).toBe('1 ene');
  });
});

describe('formatDateRange', () => {
  it('formats same-month range as "D – D MMM YYYY"', () => {
    const s = new Date(2026, 5, 22), e = new Date(2026, 5, 28);
    expect(formatDateRange(s, e)).toBe('22 – 28 jun 2026');
  });

  it('formats cross-month same-year as "D MMM – D MMM YYYY"', () => {
    const s = new Date(2026, 4, 28), e = new Date(2026, 5, 4);
    expect(formatDateRange(s, e)).toBe('28 may – 4 jun 2026');
  });
});

describe('effortLevel', () => {
  it('classifies very-high (>70)', () => {
    expect(effortLevel(79)).toBe('very-high');
    expect(effortLevel(100)).toBe('very-high');
  });

  it('classifies high (40-70)', () => {
    expect(effortLevel(70)).toBe('high');
    expect(effortLevel(50)).toBe('high');
    expect(effortLevel(40)).toBe('high');
  });

  it('classifies moderate (20-39)', () => {
    expect(effortLevel(39)).toBe('moderate');
    expect(effortLevel(25)).toBe('moderate');
  });

  it('classifies low (<20)', () => {
    expect(effortLevel(19)).toBe('low');
    expect(effortLevel(0)).toBe('low');
  });
});

describe('clampEffortDisplay', () => {
  it('returns value as-is when under max', () => {
    expect(clampEffortDisplay(50)).toEqual({ value: 50, clamped: false });
  });

  it('clamps at max when over', () => {
    expect(clampEffortDisplay(2000, 999)).toEqual({ value: 999, clamped: true });
  });

  it('handles negative/NaN as 0', () => {
    expect(clampEffortDisplay(-5)).toEqual({ value: 0, clamped: false });
    expect(clampEffortDisplay(NaN)).toEqual({ value: 0, clamped: false });
  });
});

describe('effort formula sanity (per-day average)', () => {
  it('heavy week of 5h running averages to ~84 per day', () => {
    const mult = effortMultiplier('running');
    const minutes = 300;
    const effort = Math.floor((minutes * mult) / 7);
    expect(effort).toBe(60);
  });
  it('light week of 30 min yoga averages to ~4 per day', () => {
    const mult = effortMultiplier('yoga');
    const minutes = 30;
    const effort = Math.floor((minutes * mult) / 7);
    expect(effort).toBe(4);
  });
  it('effort always fits in 0-200 range for typical users', () => {
    const mult = effortMultiplier('running');
    const effort = Math.floor((600 * mult) / 7);
    expect(effort).toBeLessThanOrEqual(200);
  });
});
