import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const baseMockApi = () => ({
  getPersonalRecords: () => Promise.resolve({ records: [], total: 0 }),
  getRelativeEffort: () => Promise.resolve({ current_week: { value: 0, start_date: '2026-06-22', end_date: '2026-06-28' }, previous_week: { value: 0, start_date: '2026-06-15', end_date: '2026-06-21' }, delta: 0, trend: 'flat' }),
  getTrainingLogWeek: () => Promise.resolve({ week_start: '2026-06-22', week_end: '2026-06-28', total_minutes: 0, days: [] }),
  getMonthlyCalendar: () => Promise.resolve({ month: '2026-06', days: [], weeks: [] }),
  getStreak: () => Promise.resolve({ weeks: 0, total_activities: 0, is_active: false, last_broken_date: null }),
  getDashboardData: () => Promise.resolve({}),
  getHealthDashboardMetrics: () => Promise.resolve({ ok: true, data: {} }),
  getActivityKcalByType: () => Promise.resolve([]),
  getSportSummaryByRange: () => Promise.resolve([]),
  getActivityComparison: () => Promise.resolve({ current: [], previous: [], currentActiveDays: 0, previousActiveDays: 0, currentDurationMin: 0, previousDurationMin: 0, currentDistanceKm: 0, previousDistanceKm: 0, currentActiveDates: [], previousActiveDates: [], periodLengthDays: 15 }),
  getSportLifetimeStats: () => Promise.resolve({ totalWeeks: 0, currentStreak: 0, totalSessions: 0 }),
  getSleepAnalysis: () => Promise.resolve({ ok: true, dailySeries: [], trendArrow: null, consistency: null, totalAvg: null, deepAvg: null, remAvg: null, lightAvg: null }),
  getLastImportTimestamp: () => Promise.resolve(null),
  getWeightStats: () => Promise.resolve({ first: null, last: null, min: null, max: null, avg: null, trend: null, count: 0 }),
  getHealthDailySummary: () => Promise.resolve({ ok: true, data: [] }),
  getCyclingDistance: () => Promise.resolve({ ok: false, data: [] }),
  getHealthWorkouts: () => Promise.resolve({ ok: false, data: [] }),
  getEnergyBalance: () => Promise.resolve(null),
  onDataChanged: () => {},
  navigate: () => {},
});

function mountContainer() {
  document.body.innerHTML = '<div id="view-dashboard"></div>';
}

describe('Strava-style summary panels', () => {
  beforeEach(() => {
    mountContainer();
    window.electronAPI = baseMockApi();
  });

  afterEach(() => {
    delete window.electronAPI;
    document.body.innerHTML = '';
  });

  it('PR banner renders empty state when no records', async () => {
    const { mountPersonalRecord } = await import('../../src/renderer/views/panels/strava-panels.js');
    const container = document.createElement('div');
    document.body.appendChild(container);
    mountPersonalRecord(container);
    await new Promise(r => setTimeout(r, 20));
    const html = container.innerHTML;
    expect(html).toMatch(/Récord personal|Registra tu primera|Ir a Actividad/);
  });

  it('PR banner renders medal badge when record exists', async () => {
    window.electronAPI.getPersonalRecords = () => Promise.resolve({
      records: [
        { sport_type: 'walking', distance_key: '5', distance_label: '5 km', distance_km: 5, time_min: 25, achieved_at: '2026-06-15', rank: 1 }
      ],
      by_sport: {
        walking: [
          { sport_type: 'walking', distance_key: '5', distance_label: '5 km', distance_km: 5, time_min: 25, achieved_at: '2026-06-15', rank: 1 }
        ],
        cycling: [],
        strength: []
      },
      primary_sport: 'walking',
      total: 1,
    });
    const { mountPersonalRecord } = await import('../../src/renderer/views/panels/strava-panels.js');
    const container = document.createElement('div');
    document.body.appendChild(container);
    mountPersonalRecord(container);
    await new Promise(r => setTimeout(r, 20));
    const html = container.innerHTML;
    expect(html).toMatch(/strava-pr-badge--gold/);
    expect(html).toMatch(/5 km/);
    expect(html).toMatch(/25:00/);
  });

  it('Relative effort card shows current and previous week', async () => {
    window.electronAPI.getRelativeEffort = () => Promise.resolve({
      current_week: { value: 79, start_date: '2026-06-22', end_date: '2026-06-28', sessions: 4, sport_kcal: 800, neat_kcal: 200 },
      previous_week: { value: 12, start_date: '2026-06-15', end_date: '2026-06-21', sessions: 1, sport_kcal: 200, neat_kcal: 50 },
      delta: 67,
      trend: 'up',
    });
    const { mountRelativeEffort } = await import('../../src/renderer/views/panels/strava-panels.js');
    const container = document.createElement('div');
    document.body.appendChild(container);
    mountRelativeEffort(container);
    await new Promise(r => setTimeout(r, 20));
    const html = container.innerHTML;
    expect(html).toMatch(/effort-level--very-high/);
    expect(html).toMatch(/>79</);
    expect(html).toMatch(/Esfuerzo relativo/);
  });

  it('Training log renders 7 day columns with proportional bubble sizes', async () => {
    window.electronAPI.getTrainingLogWeek = () => Promise.resolve({
      week_start: '2026-06-22', week_end: '2026-06-28', total_minutes: 249, is_current: true,
      days: [
        { date: '2026-06-22', dow: 0, duration_minutes: 0, has_activity: false, sessions: 0 },
        { date: '2026-06-23', dow: 1, duration_minutes: 25, has_activity: true, sessions: 1 },
        { date: '2026-06-24', dow: 2, duration_minutes: 0, has_activity: false, sessions: 0 },
        { date: '2026-06-25', dow: 3, duration_minutes: 249, has_activity: true, sessions: 1 },
        { date: '2026-06-26', dow: 4, duration_minutes: 0, has_activity: false, sessions: 0 },
        { date: '2026-06-27', dow: 5, duration_minutes: 0, has_activity: false, sessions: 0 },
        { date: '2026-06-28', dow: 6, duration_minutes: 0, has_activity: false, sessions: 0 },
      ],
    });
    const { mountTrainingLog } = await import('../../src/renderer/views/panels/strava-panels.js');
    const container = document.createElement('div');
    document.body.appendChild(container);
    mountTrainingLog(container);
    await new Promise(r => setTimeout(r, 20));
    const html = container.innerHTML;
    expect(html).toMatch(/strava-bubbles/);
    const bubbles = container.querySelectorAll('.strava-bubble');
    expect(bubbles.length).toBe(2);
    const sizes = Array.from(bubbles).map(b => parseInt(b.style.width));
    expect(Math.max(...sizes)).toBeGreaterThan(Math.min(...sizes));
    expect(html).toMatch(/4h 9m/);
    expect(html).toMatch(/data-week-nav="prev"/);
    expect(html).toMatch(/data-week-nav="next"/);
  });

  it('Training log week navigation calls IPC with offset date', async () => {
    let lastCalledWith = null;
    window.electronAPI.getTrainingLogWeek = (weekStart) => {
      lastCalledWith = weekStart;
      return Promise.resolve({
        week_start: '2026-06-15', week_end: '2026-06-21', total_minutes: 0, is_current: false,
        days: [],
      });
    };
    const { mountTrainingLog } = await import('../../src/renderer/views/panels/strava-panels.js');
    const container = document.createElement('div');
    document.body.appendChild(container);
    mountTrainingLog(container);
    await new Promise(r => setTimeout(r, 20));
    const prevBtn = container.querySelector('[data-week-nav="prev"]');
    expect(prevBtn).toBeTruthy();
    prevBtn.click();
    await new Promise(r => setTimeout(r, 20));
    expect(lastCalledWith).toBeTruthy();
    expect(lastCalledWith).not.toBe(new Date().toISOString().split('T')[0]);
  });

  it('Monthly calendar renders day cells with sport icons for active days', async () => {
    window.electronAPI.getMonthlyCalendar = () => Promise.resolve({
      month: '2026-06',
      days: [
        { date: '2026-06-15', day: 15, day_of_week: 0, has_activity: true, sport_type: 'running', activity_count: 1 },
        { date: '2026-06-16', day: 16, day_of_week: 1, has_activity: false, sport_type: null, activity_count: 0 },
      ],
      weeks: [
        { week_number: 1, start_date: '2026-06-15', end_date: '2026-06-21', completed: false, is_current: true, in_month: true },
      ],
    });
    const { mountMonthlyCalendar } = await import('../../src/renderer/views/panels/strava-panels.js');
    const container = document.createElement('div');
    document.body.appendChild(container);
    mountMonthlyCalendar(container);
    await new Promise(r => setTimeout(r, 20));
    const html = container.innerHTML;
    expect(html).toMatch(/strava-calendar-grid/);
    expect(html).toMatch(/junio|2026/);
    const activeCells = container.querySelectorAll('.strava-calendar-day--active');
    expect(activeCells.length).toBe(1);
  });

  it('Streak shows "0 semanas" with empty state when no activities', async () => {
    window.electronAPI.getStreak = () => Promise.resolve({ weeks: 0, total_activities: 0, is_active: false, last_broken_date: null });
    const { mountStreak } = await import('../../src/renderer/views/panels/strava-panels.js');
    const container = document.createElement('div');
    document.body.appendChild(container);
    mountStreak(container);
    await new Promise(r => setTimeout(r, 20));
    const html = container.innerHTML;
    expect(html).toMatch(/Sin racha activa/);
    expect(html).toMatch(/Inicia tu primera semana/);
    const shareBtn = container.querySelector('.strava-streak-share');
    expect(shareBtn?.disabled || shareBtn?.getAttribute('aria-disabled')).toBeTruthy();
  });

  it('Dashboard renders all panels plus the existing health-metrics grid (no regressions)', async () => {
    document.body.innerHTML = '<div id="view-dashboard"></div>';
    const { init } = await import('../../src/renderer/views/dashboard.js');
    await init();
    await new Promise(r => setTimeout(r, 30));
    const html = document.getElementById('view-dashboard').innerHTML;
    expect(html).toMatch(/strava-block/);
    expect(html).toMatch(/row-hero/);
    expect(html).toMatch(/row-kpis-1/);
    expect(html).toMatch(/row-kpis-2/);
    expect(html).toMatch(/row-sports/);
    expect(html).toMatch(/row-consistency/);
    expect(html).toMatch(/strava-pr/);
    expect(html).toMatch(/strava-relative-effort/);
    expect(html).toMatch(/strava-training-log/);
    expect(html).toMatch(/strava-streak/);
    expect(html).toMatch(/strava-calendar/);
    expect(html).toMatch(/strava-resumen-row/);
  });
});
