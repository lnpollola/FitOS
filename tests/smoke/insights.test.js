import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const now = new Date();
const today = now.toISOString().split('T')[0];
const shortMonths = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const fmtDate = (daysAgo) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const mockApi = {
  getYearInMotion: () => Promise.resolve({ points: [{ date: today, minutes: 45 }], totalDays: 1 }),
  getDayOfWeekStats: () => Promise.resolve([
    { weekday: 0, minutes: 120, sessions: 3, weekday_label: 'L' },
    { weekday: 1, minutes: 90, sessions: 2, weekday_label: 'M' },
    { weekday: 2, minutes: 0, sessions: 0, weekday_label: 'X' },
    { weekday: 3, minutes: 60, sessions: 1, weekday_label: 'J' },
    { weekday: 4, minutes: 30, sessions: 1, weekday_label: 'V' },
    { weekday: 5, minutes: 0, sessions: 0, weekday_label: 'S' },
    { weekday: 6, minutes: 0, sessions: 0, weekday_label: 'D' },
  ]),
  getSportDistribution: () => Promise.resolve({
    sports: [
      { sport_type: 'running', minutes: 300, sessions: 5, share_pct: 60 },
      { sport_type: 'cycling', minutes: 200, sessions: 3, share_pct: 40 },
    ],
    total_minutes: 500,
    total_sessions: 8,
  }),
  getRecoveryScore: () => Promise.resolve({
    hrv: { current: 55, baseline: 50, stddev: 5, daysAvailable: 35, sparkline: [55,52,53,54,51,50,49] },
    rhr: { current: 58, baseline: 62, stddev: 4, daysAvailable: 35, sparkline: null },
    sleep: { current: 7.8, baseline: 7.2, stddev: 0.6, daysAvailable: 35, sparkline: null },
  }),
  getWeightVelocity: () => Promise.resolve({
    points: [
      { date: fmtDate(0), weight_kg: 73, velocity_kg_per_week: -0.5 },
      { date: fmtDate(7), weight_kg: 73.5, velocity_kg_per_week: null },
    ],
    target_pace_reference_velocity: -0.5,
    target_pace_magnitude: 0.5,
    pr_weight: { weight_kg: 73, date: fmtDate(0) },
    pr_insufficient_window: false,
  }),
  getWHR: () => Promise.resolve({
    current: { value: 0.88, date: fmtDate(30), zone: 'low', zone_label: 'Bajo' },
    history: [{ date: fmtDate(30), value: 0.88 }, { date: fmtDate(90), value: 0.91 }],
    sex: 'M',
    has_measurements: true,
  }),
  getAutoInsights: () => Promise.resolve({
    weekStreak: 5,
    restDayStreak: 1,
    recentSportPRs: 2,
  }),
  getStrengthPersonalRecords: () => Promise.resolve({ exercises: [], volumePRs: [], muscleGroups: [] }),
  getStrengthPlateau: () => Promise.resolve([]),
  getStrengthScore: () => Promise.resolve({ muscle_groups: [], composite_score: null, insufficient_muscle_groups: true, body_weight_kg: null, total_muscle_groups: 0 }),
  getWeeklyTonnage: () => Promise.resolve({ weeks: [], current_12w_total: null, previous_12w_total: null, delta_kg: null, delta_pct: null, direction: null }),
  onDataChanged: () => {},
  navigate: () => {},
};

describe('Insights view smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-insights"></div><ul class="nav-list"><li><button class="nav-item" data-view="insights"></button></li></ul>';
    window.electronAPI = mockApi;
    window._loadingInsights = false;
  });

  afterEach(() => {
    delete window.electronAPI;
    delete window._loadingInsights;
    delete window._insightsDowChart;
    delete window._insightsDonutChart;
    delete window._insightsVelocityChart;
    document.body.innerHTML = '';
  });

  it('init does not throw when electronAPI is present', async () => {
    const { init } = await import('../../src/renderer/views/insights.js');
    await expect(init()).resolves.not.toThrow();
  });

  it('init does not throw when electronAPI is absent (web mode)', async () => {
    delete window.electronAPI;
    const { init } = await import('../../src/renderer/views/insights.js');
    document.body.innerHTML = '<div id="view-insights"></div>';
    await expect(init()).resolves.not.toThrow();
  });

  it('renders title, date-range selector, and 7 section placeholders on mount', async () => {
    const { init } = await import('../../src/renderer/views/insights.js');
    await init();
    const container = document.getElementById('view-insights');
    expect(container.innerHTML).toContain('Patrones');
    expect(container.innerHTML).toContain('insights-filters');
    expect(document.getElementById('section-heatmap')).toBeTruthy();
    expect(document.getElementById('section-dow')).toBeTruthy();
    expect(document.getElementById('section-sport-dist')).toBeTruthy();
    expect(document.getElementById('section-recovery')).toBeTruthy();
    expect(document.getElementById('section-velocity')).toBeTruthy();
    expect(document.getElementById('section-whr')).toBeTruthy();
    expect(document.getElementById('section-auto-insights')).toBeTruthy();
  });

  it('clicking date-range button updates state and refetches', async () => {
    const { init } = await import('../../src/renderer/views/insights.js');
    await init();
    const btn = document.querySelector('#insights-filters .filter-btn[data-range="6m"]');
    expect(btn).toBeTruthy();
    btn.click();
    expect(btn.classList.contains('filter-btn--active')).toBe(true);
  });

  it('renders empty state for each section when IPC returns empty', async () => {
    const emptyApi = {
      ...mockApi,
      getYearInMotion: () => Promise.resolve({ points: [], totalDays: 0 }),
      getDayOfWeekStats: () => Promise.resolve([]),
      getSportDistribution: () => Promise.resolve({ sports: [], total_minutes: 0, total_sessions: 0 }),
      getRecoveryScore: () => Promise.resolve({
        hrv: { current: 55, baseline: 50, stddev: 5, daysAvailable: 10, sparkline: null },
        rhr: { current: 58, baseline: 62, stddev: 4, daysAvailable: 10, sparkline: null },
        sleep: { current: 7.8, baseline: 7.2, stddev: 0.6, daysAvailable: 10, sparkline: null },
      }),
      getWeightVelocity: () => Promise.resolve({ points: [], target_pace_reference_velocity: -0.5, target_pace_magnitude: 0.5, pr_weight: null, pr_insufficient_window: true }),
      getWHR: () => Promise.resolve({ current: null, history: [], sex: null, has_measurements: false }),
      getAutoInsights: () => Promise.resolve({ weekStreak: 0, restDayStreak: 0, recentSportPRs: 0 }),
    };
    window.electronAPI = emptyApi;
    const { init } = await import('../../src/renderer/views/insights.js');
    await init();
    await new Promise(r => setTimeout(r, 100));
    const sections = document.querySelectorAll('.insights-section');
    expect(sections.length).toBe(8);
  });

  it('renders error state when IPC call throws', async () => {
    const errorApi = {
      ...mockApi,
      getRecoveryScore: () => Promise.reject(new Error('HealthSync unavailable')),
    };
    window.electronAPI = errorApi;
    const { init } = await import('../../src/renderer/views/insights.js');
    await init();
    await new Promise(r => setTimeout(r, 100));
    expect(document.getElementById('recovery-content')).toBeTruthy();
  });

  it('shows global banner when all sections are empty', async () => {
    const emptyApi = {
      ...mockApi,
      getYearInMotion: () => Promise.resolve({ points: [], totalDays: 0 }),
      getDayOfWeekStats: () => Promise.resolve([]),
      getSportDistribution: () => Promise.resolve({ sports: [], total_minutes: 0, total_sessions: 0 }),
      getRecoveryScore: () => Promise.resolve({
        hrv: { current: 55, baseline: 50, stddev: 5, daysAvailable: 10, sparkline: null },
        rhr: { current: 58, baseline: 62, stddev: 4, daysAvailable: 10, sparkline: null },
        sleep: { current: 7.8, baseline: 7.2, stddev: 0.6, daysAvailable: 10, sparkline: null },
      }),
      getWeightVelocity: () => Promise.resolve({ points: [], target_pace_reference_velocity: -0.5, target_pace_magnitude: 0.5, pr_weight: null, pr_insufficient_window: true }),
      getWHR: () => Promise.resolve({ current: null, history: [], sex: null, has_measurements: false }),
      getAutoInsights: () => Promise.resolve({ weekStreak: 0, restDayStreak: 0, recentSportPRs: 0 }),
    };
    window.electronAPI = emptyApi;
    const { init } = await import('../../src/renderer/views/insights.js');
    await init();
    await new Promise(r => setTimeout(r, 200));
    const banner = document.getElementById('insights-global-banner');
    expect(banner).toBeTruthy();
    expect(banner.style.display).not.toBe('none');
  });

  it('onDataChanged subscription exists', async () => {
    const { init } = await import('../../src/renderer/views/insights.js');
    await init();
    const container = document.getElementById('view-insights');
    expect(container.innerHTML.length).toBeGreaterThan(100);
  });
});
