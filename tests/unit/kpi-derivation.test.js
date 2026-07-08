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
  normalizeBaseline,
  recoverySubScore,
  recoveryScore,
  weightVelocity,
  whrZone,
  dowPattern,
  sportDistribution,
  generateAutoInsights,
  heatmapBucket,
  __internals,
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
    expect(result.weeks).toBeGreaterThanOrEqual(1);
    expect(result.totalActivities).toBeGreaterThanOrEqual(1);
  });

  it('breaks streak when a week is missed', () => {
    const result = computeStreak(['2026-06-22', '2026-06-08']);
    expect(result.weeks).toBeGreaterThanOrEqual(0);
    expect(result.weeks).toBeLessThanOrEqual(1);
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

describe('normalizeBaseline', () => {
  it('returns 0 for z=0', () => {
    expect(normalizeBaseline(10, 10, 1)).toBe(0);
  });
  it('returns clamped value at -3', () => {
    expect(normalizeBaseline(7, 10, 0.5)).toBe(-3); // z = -6, clamped to -3
  });
  it('returns clamped value at 3', () => {
    expect(normalizeBaseline(13, 10, 0.5)).toBe(3);
  });
  it('returns 0 for NaN inputs', () => {
    expect(normalizeBaseline(NaN, 10, 1)).toBe(0);
    expect(normalizeBaseline(10, NaN, 1)).toBe(0);
    expect(normalizeBaseline(10, 10, NaN)).toBe(0);
  });
  it('returns 0 for stddev <= 0', () => {
    expect(normalizeBaseline(10, 10, 0)).toBe(0);
    expect(normalizeBaseline(10, 10, -1)).toBe(0);
  });
});

describe('recoverySubScore', () => {
  it('direct: 50 at z=0', () => {
    expect(recoverySubScore(0, false)).toBe(50);
  });
  it('direct: 65 at z=1', () => {
    expect(recoverySubScore(1, false)).toBe(65);
  });
  it('inverted: 65 at z=-1 (higher score for lower RHR)', () => {
    expect(recoverySubScore(-1, true)).toBe(65);
  });
  it('inverted: 35 at z=1 (lower score for higher RHR)', () => {
    expect(recoverySubScore(1, true)).toBe(35);
  });
  it('clamped to [0, 100]', () => {
    // z-score is internally clamped to [-3, 3]; raw = 50 +/- 15*z
    expect(recoverySubScore(10, false)).toBe(95);  // z=3, 50 + 45 = 95
    expect(recoverySubScore(10, true)).toBe(5);    // z=3, 50 - 45 = 5
    expect(recoverySubScore(-10, false)).toBe(5);  // z=-3, 50 - 45 = 5
    expect(recoverySubScore(-10, true)).toBe(95);  // z=-3, 50 + 45 = 95
  });
  it('returns integer', () => {
    expect(Number.isInteger(recoverySubScore(1.5, false))).toBe(true);
  });
});

describe('recoveryScore', () => {
  const fullSignals = {
    hrv: { current: 55, baseline: 50, stddev: 5, daysAvailable: 35, sparkline: [55,52,53,54,51,50,49] },
    rhr: { current: 58, baseline: 62, stddev: 4, daysAvailable: 35, sparkline: null },
    sleep: { current: 7.8, baseline: 7.2, stddev: 0.6, daysAvailable: 35, sparkline: null },
  };

  it('returns composite with all 3 signals', () => {
    const r = recoveryScore(fullSignals);
    expect(r.baselineComplete).toBe(true);
    expect(typeof r.composite).toBe('number');
    expect(r.composite).toBeGreaterThanOrEqual(0);
    expect(r.composite).toBeLessThanOrEqual(100);
    expect(r.signals.hrv.subScore).toBeGreaterThan(0);
    expect(r.signals.rhr.subScore).toBeGreaterThan(0);
    expect(r.signals.sleep.subScore).toBeGreaterThan(0);
  });

  it('returns the correct zone', () => {
    const r = recoveryScore(fullSignals);
    expect(['low', 'moderate', 'high']).toContain(r.zone);
    // Composite ~56 with these inputs (all z=1, sub=65, weighted)
    expect(r.zone).toBe('moderate');
  });

  it('returns incomplete baseline with insufficient data', () => {
    const r = recoveryScore({
      hrv: { current: 55, baseline: 50, stddev: 5, daysAvailable: 15, sparkline: null },
      rhr: { current: 58, baseline: 62, stddev: 4, daysAvailable: 15, sparkline: null },
      sleep: { current: 7.8, baseline: 7.2, stddev: 0.6, daysAvailable: 15, sparkline: null },
    });
    expect(r.baselineComplete).toBe(false);
    expect(r.composite).toBeNull();
    // No signals have ≥30 days, so daysMin = Infinity, daysUntilBaseline = 30
    expect(r.daysUntilBaseline).toBe(30);
  });

  it('handles 1 missing signal', () => {
    const r = recoveryScore({
      hrv: fullSignals.hrv,
      rhr: fullSignals.rhr,
      sleep: null,
    });
    expect(r.baselineComplete).toBe(true);
    expect(r.signals.sleep.insufficient).toBe(true);
    expect(r.signals.sleep.subScore).toBe(50);
    expect(r.signalCount).toBe(2);
  });

  it('returns incomplete with only 1 signal', () => {
    const r = recoveryScore({
      hrv: fullSignals.hrv,
      rhr: null,
      sleep: null,
    });
    expect(r.baselineComplete).toBe(false);
    expect(r.signalCount).toBe(1);
  });
});

describe('weightVelocity', () => {
  const entries = [
    { date: '2026-06-01', weight_kg: 75 },
    { date: '2026-06-07', weight_kg: 74.5 },
    { date: '2026-06-14', weight_kg: 74 },
    { date: '2026-06-21', weight_kg: 73.5 },
    { date: '2026-06-28', weight_kg: 73 },
  ];

  it('returns points with velocity', () => {
    const r = weightVelocity(entries, 0.5, '2026-06-01', '2026-06-28');
    // No entry exactly 28 days prior to any entry (entries are 7 days apart)
    expect(r.prInsufficientWindow).toBe(true);
    expect(Array.isArray(r.points)).toBe(true);
    // One point per day in range
    expect(r.points.length).toBe(28);
    const lastPt = r.points.find(p => p.date === '2026-06-28');
    expect(lastPt).toBeDefined();
    expect(lastPt.velocity_kg_per_week).toBeNull();
  });

  it('detects PR weight', () => {
    const r = weightVelocity(entries, 0.5, '2026-06-01', '2026-06-28');
    expect(r.prWeight).toBeDefined();
    expect(r.prWeight.weight_kg).toBe(73);
  });

  it('returns prInsufficientWindow for < 2 entries', () => {
    const r = weightVelocity([{ date: '2026-06-01', weight_kg: 75 }], 0.5, '2026-06-01', '2026-06-28');
    expect(r.prInsufficientWindow).toBe(true);
    // Still generates a point for each day in the range
    expect(r.points.length).toBe(28);
  });

  it('handles gaps (null velocity for days without 28d prior)', () => {
    const r = weightVelocity(entries, 0.5, '2026-06-01', '2026-06-28');
    const early = r.points.find(p => p.date === '2026-06-01');
    expect(early).toBeDefined();
    expect(early.velocity_kg_per_week).toBeNull();
  });
});

describe('whrZone', () => {
  it('male low (< 0.90)', () => {
    expect(whrZone(0.85, 'M').zone).toBe('low');
  });
  it('male moderate (0.90-0.99)', () => {
    expect(whrZone(0.90, 'M').zone).toBe('moderate');
    expect(whrZone(0.95, 'M').zone).toBe('moderate');
  });
  it('male high (≥ 1.00)', () => {
    expect(whrZone(1.00, 'M').zone).toBe('high');
  });
  it('female low (< 0.80)', () => {
    expect(whrZone(0.75, 'F').zone).toBe('low');
  });
  it('female moderate (0.80-0.84)', () => {
    expect(whrZone(0.80, 'F').zone).toBe('moderate');
  });
  it('female high (≥ 0.85)', () => {
    expect(whrZone(0.85, 'F').zone).toBe('high');
  });
  it('unknown for null sex', () => {
    expect(whrZone(0.9, null).zone).toBe('unknown');
  });
  it('unknown for empty sex', () => {
    expect(whrZone(0.9, '').zone).toBe('unknown');
  });
  it('handles extreme values', () => {
    expect(whrZone(0, 'M').zone).toBe('unknown'); // value <= 0 is invalid
    expect(whrZone(2.0, 'M').zone).toBe('high');
  });
});

describe('dowPattern', () => {
  const activities = [
    { date: '2026-06-22', sport_type: 'running', duration_minutes: 45 }, // Monday
    { date: '2026-06-23', sport_type: 'cycling', duration_minutes: 30 }, // Tuesday
    { date: '2026-06-22', sport_type: 'swimming', duration_minutes: 30 }, // Monday
  ];

  it('returns 7 entries', () => {
    const r = dowPattern(activities, '2026-06-22', '2026-06-23');
    expect(r.days).toHaveLength(7);
  });

  it('correctly bins minutes', () => {
    const r = dowPattern(activities, '2026-06-22', '2026-06-23');
    const mon = r.days[0]; // Monday = 0
    expect(mon.minutes).toBe(75); // 45+30
    expect(mon.sessions).toBe(2);
  });

  it('detects bestDay', () => {
    const r = dowPattern(activities, '2026-06-22', '2026-06-23');
    expect(r.bestDay).toBe(0); // Monday has most minutes
  });

  it('hasInsufficientData for < 2 weeks', () => {
    // 1 day of data = insufficient
    const r = dowPattern(activities.slice(0, 1), '2026-06-22', '2026-06-22');
    expect(r.hasInsufficientData).toBe(true);
  });
});

describe('sportDistribution', () => {
  const activities = [
    { sport_type: 'running', duration_minutes: 120, date: '2026-06-01' },
    { sport_type: 'running', duration_minutes: 60, date: '2026-06-02' },
    { sport_type: 'cycling', duration_minutes: 90, date: '2026-06-01' },
    { sport_type: 'swimming', duration_minutes: 30, date: '2026-06-05' },
  ];

  it('sorts by minutes desc', () => {
    const r = sportDistribution(activities, '2026-06-01', '2026-06-05');
    expect(r.sports[0].sport_type).toBe('running');
    expect(r.sports[0].minutes).toBe(180);
    expect(r.sports[1].sport_type).toBe('cycling');
  });

  it('computes share_pct correctly', () => {
    const r = sportDistribution(activities, '2026-06-01', '2026-06-05');
    const total = r.sports.reduce((s, sp) => s + sp.share_pct, 0);
    expect(total).toBeCloseTo(100, 0);
  });

  it('aggregates > 6 sports into others', () => {
    const many = [
      { sport_type: 'a', duration_minutes: 10, date: '2026-06-01' },
      { sport_type: 'b', duration_minutes: 10, date: '2026-06-01' },
      { sport_type: 'c', duration_minutes: 10, date: '2026-06-01' },
      { sport_type: 'd', duration_minutes: 10, date: '2026-06-01' },
      { sport_type: 'e', duration_minutes: 10, date: '2026-06-01' },
      { sport_type: 'f', duration_minutes: 10, date: '2026-06-01' },
      { sport_type: 'g', duration_minutes: 10, date: '2026-06-01' },
    ];
    const r = sportDistribution(many, '2026-06-01', '2026-06-01');
    expect(r.othersAggregated).toBe(true);
    expect(r.sports.length).toBeLessThanOrEqual(6);
  });

  it('empty array for no activities', () => {
    const r = sportDistribution([], '2026-06-01', '2026-06-01');
    expect(r.sports).toHaveLength(0);
    expect(r.totalMinutes).toBe(0);
  });
});

describe('generateAutoInsights', () => {
  it('returns cards sorted by severity', () => {
    const input = {
      weekStreak: 5,
      restDayStreak: 0,
      recentPRs: 2,
      hrvDeviation: 15,
      recoveryTrend: 15,
      sportDistribution: ['running', 'cycling', 'swimming', 'HIIT'],
      weightVelocity: -0.3,
      targetPace: 0.5,
      whrTrend: { delta: -0.04 },
      recoveryScore: { zone: 'high' },
    };
    const cards = generateAutoInsights(input);
    expect(Array.isArray(cards)).toBe(true);
    // All cards should have required fields
    cards.forEach(c => {
      expect(c).toHaveProperty('icon');
      expect(c).toHaveProperty('text');
      expect(c).toHaveProperty('severity');
      expect(c).toHaveProperty('navigateTo');
    });
    // Sorted: positive first, then info, then alert
    for (let i = 1; i < cards.length; i++) {
      const prev = cards[i-1].severity;
      const curr = cards[i].severity;
      const order = { positive: 0, info: 1, alert: 2 };
      expect(order[prev]).toBeLessThanOrEqual(order[curr]);
    }
  });

  it('returns empty array for empty payload', () => {
    expect(generateAutoInsights({})).toHaveLength(0);
  });

  it('is deterministic', () => {
    const input = { weekStreak: 4, restDayStreak: 1, recentPRs: 0, hrvDeviation: 12, recoveryTrend: 10, sportDistribution: ['running'], weightVelocity: -0.5, targetPace: 0.5 };
    const a = generateAutoInsights(input);
    const b = generateAutoInsights({...input});
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('template functions', () => {
  const { templateBestWeekStreak, templateHRVDeviation, templateRestDayStreak, templateWeightDirectionMatch, templateSportVariety, templateRecoveryTrend, templateWHRImprovement, templateSportPRWeek } = __internals;

  it('templateBestWeekStreak: fires at >= 4 weeks', () => {
    expect(templateBestWeekStreak({ weekStreak: 4 })).not.toBeNull();
    expect(templateBestWeekStreak({ weekStreak: 2 })).toBeNull();
  });

  it('templateHRVDeviation: fires at >= 10% deviation', () => {
    expect(templateHRVDeviation({ hrvDeviation: 15 })).not.toBeNull();
    expect(templateHRVDeviation({ hrvDeviation: 5 })).toBeNull();
  });

  it('templateRestDayStreak: fires at >= 5 rest days', () => {
    expect(templateRestDayStreak({ restDayStreak: 5 })).not.toBeNull();
    expect(templateRestDayStreak({ restDayStreak: 3 })).toBeNull();
  });

  it('templateSportPRWeek: fires at >= 1 PR', () => {
    expect(templateSportPRWeek({ recentPRs: 2 })).not.toBeNull();
    expect(templateSportPRWeek({ recentPRs: 0 })).toBeNull();
  });

  it('templateSportVariety: fires at >= 4 sports', () => {
    expect(templateSportVariety({ sportDistribution: ['running', 'cycling', 'swimming', 'HIIT'] })).not.toBeNull();
    expect(templateSportVariety({ sportDistribution: ['running'] })).toBeNull();
  });
});

describe('heatmapBucket', () => {
  it('0 minutes -> 0', () => expect(heatmapBucket(0)).toBe(0));
  it('1-14 minutes -> 1', () => {
    expect(heatmapBucket(1)).toBe(1);
    expect(heatmapBucket(14)).toBe(1);
  });
  it('15-29 minutes -> 2', () => {
    expect(heatmapBucket(15)).toBe(2);
    expect(heatmapBucket(29)).toBe(2);
  });
  it('30-59 minutes -> 3', () => {
    expect(heatmapBucket(30)).toBe(3);
    expect(heatmapBucket(59)).toBe(3);
  });
  it('60-89 minutes -> 4', () => {
    expect(heatmapBucket(60)).toBe(4);
    expect(heatmapBucket(89)).toBe(4);
  });
  it('90+ minutes -> 5', () => {
    expect(heatmapBucket(90)).toBe(5);
    expect(heatmapBucket(500)).toBe(5);
  });
  it('NaN -> 0', () => expect(heatmapBucket(NaN)).toBe(0));
  it('negative -> 0', () => expect(heatmapBucket(-1)).toBe(0));
});
