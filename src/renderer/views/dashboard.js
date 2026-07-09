import { getAPI } from "../utils/api-detector.js";
import { strings, getSportDisplayName } from '../locales/es.js';
import { sportIcon } from '../utils/sport-icons.js';
import { icon } from '../utils/icons.js';
import { goalProgressRing } from '../utils/goal-progress-ring.js';
import { chartColors } from '../utils/chart-theme.js';
import { skeletonCard, skeletonChart } from '../utils/skeleton.js';
import { getRangeDates } from '../utils/date-range.js';
import Chart from 'chart.js/auto';
import { safeCall } from '../utils/safe-call.js';
import { sparkline, computeTrendDirection } from '../utils/sparkline.js';
import { growthRing } from '../utils/growth-ring.js';
import { renderStateCard } from '../utils/state-card.js';
import { getTrendArrow, trendBadge } from '../utils/trend-arrow.js';
import {
  mountPersonalRecord,
  mountRelativeEffort,
  mountStreakCalendar,
} from './panels/strava-panels.js';

export async function init() {
  if (window._loadingDashboard) return;
  window._loadingDashboard = true;
  try {
    const container = document.getElementById('view-dashboard');
    const api = getAPI();

    let _range = '15d';

    container.innerHTML = `
      <h2 class="view-title">${strings.dashboard.title}</h2>
      <div class="analytics-filters" id="dashboard-filters">
        <button class="filter-btn active" data-range="15d">${strings.dashboard.dateRange15d}</button>
        <button class="filter-btn" data-range="1m">${strings.dashboard.dateRange1m}</button>
        <button class="filter-btn" data-range="3m">${strings.dashboard.dateRange3m}</button>
      </div>
      <div id="last-update" class="text-xs text-muted" style="margin-bottom:var(--space-3)" aria-live="polite"></div>
      <div class="dashboard-grid" id="row-consistency" aria-live="polite"></div>
      <div class="dashboard-grid" id="row-goals" aria-live="polite"></div>
      <div class="dashboard-grid" id="row-hero" aria-live="polite"></div>
      <div class="dashboard-grid" id="row-kpis-1" aria-live="polite"></div>
      <div class="dashboard-grid" id="row-kpis-2" aria-live="polite"></div>
      <div class="dashboard-grid" id="row-sports" aria-live="polite"></div>
      <section class="strava-block" id="strava-block" aria-label="${strings.stravaPanels.blockTitle}">
        <div class="strava-block-header">
          <h2>${strings.stravaPanels.blockTitle}</h2>
        </div>
        <div class="strava-resumen-row">
          <div id="strava-pr"></div>
          <div id="strava-relative-effort"></div>
        </div>
        <div id="strava-streak-calendar"></div>
      </section>
      <div class="dashboard-grid" id="row-auto-insights" aria-live="polite"></div>
    `;

    if (!api) {
      document.getElementById('row-hero').innerHTML = `<div class="dashboard-card"><h3>${strings.dashboard.status}</h3><div class="value">${strings.dashboard.offline}</div><div class="subtitle">${strings.dashboard.offlineSub}</div></div>`;
      return;
    }

    const stravaMounts = [
      mountPersonalRecord(document.getElementById('strava-pr')),
      mountRelativeEffort(document.getElementById('strava-relative-effort')),
      mountStreakCalendar(document.getElementById('strava-streak-calendar')),
    ];

    if (api.onDataChanged) {
      api.onDataChanged(() => {
        render();
      });
    }

    document.querySelectorAll('#dashboard-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _range = btn.dataset.range;
        document.querySelectorAll('#dashboard-filters .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.range === _range));
        render();
      });
    });

    async function render() {
      const consistencyRow = document.getElementById('row-consistency');
      const goalsRow = document.getElementById('row-goals');
      const heroRow = document.getElementById('row-hero');
      const kpis1Row = document.getElementById('row-kpis-1');
      const kpis2Row = document.getElementById('row-kpis-2');
      const sportsRow = document.getElementById('row-sports');
      const { from, to } = getRangeDates(_range);
      const daysInPeriod = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;

      consistencyRow.innerHTML = skeletonCard();
      goalsRow.innerHTML = skeletonCard();
      heroRow.innerHTML = skeletonCard();
      kpis1Row.innerHTML = skeletonCard().repeat(5);
      kpis2Row.innerHTML = skeletonCard().repeat(3);
      sportsRow.innerHTML = skeletonCard();

      const lastImportPromise = safeCall(api.getLastImportTimestamp(), null).then(data => {
        const updateEl = document.getElementById('last-update');
        if (data) {
          const d = new Date(data);
          updateEl.textContent = `${strings.dashboard.lastUpdate}: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          updateEl.textContent = strings.dashboard.noImportData;
        }
      });

      const appDataPromise = api.getDashboardData().catch(() => null);
      const healthMetricsPromise = api.getHealthDashboardMetrics(from, to).catch(() => ({ ok: false }));
      const sportSummaryPromise = api.getSportSummaryByRange ? api.getSportSummaryByRange(from, to).catch(() => []) : (api.getActivityKcalByType(from, to).catch(() => []));
      const sleepDataPromise = api.getSleepAnalysis ? api.getSleepAnalysis(from, to).catch(() => ({ ok: false, dailySeries: [], trendArrow: null, consistency: null, totalAvg: null, deepAvg: null, remAvg: null, lightAvg: null })) : Promise.resolve({ ok: false, dailySeries: [], trendArrow: null, consistency: null, totalAvg: null, deepAvg: null, remAvg: null, lightAvg: null });
      const weightStatsPromise = api.getWeightStats(from, to).catch(() => ({ first: null, last: null, min: null, max: null, avg: null, trend: null, count: 0 }));
      const healthSummaryPromise = api.getHealthDailySummary ? api.getHealthDailySummary(from, to).catch(() => null) : Promise.resolve(null);
      const cyclingPromise = api.getCyclingDistance ? api.getCyclingDistance(from, to).catch(() => ({ ok: false, data: [] })) : Promise.resolve({ ok: false, data: [] });
      const workoutsPromise = api.getHealthWorkouts ? api.getHealthWorkouts(2000).catch(() => ({ ok: false, data: [] })) : Promise.resolve({ ok: false, data: [] });

      // Fetch previous period for PoP
      const daysOffset = daysInPeriod + 1;
      const prevFrom = new Date(from);
      prevFrom.setDate(prevFrom.getDate() - daysOffset);
      const prevTo = new Date(to);
      prevTo.setDate(prevTo.getDate() - daysOffset);
      const prevFromStr = prevFrom.toISOString().split('T')[0];
      const prevToStr = prevTo.toISOString().split('T')[0];
      const prevSportPromise = api.getSportSummaryByRange ? api.getSportSummaryByRange(prevFromStr, prevToStr).catch(() => []) : Promise.resolve([]);
      const activityComparisonPromise = api.getActivityComparison ? api.getActivityComparison(from, to).catch(() => null) : Promise.resolve(null);
      const lifetimeStatsPromise = api.getSportLifetimeStats ? api.getSportLifetimeStats().catch(() => ({ totalWeeks: 0, currentStreak: 0, totalSessions: 0 })) : Promise.resolve({ totalWeeks: 0, currentStreak: 0, totalSessions: 0 });
      const goalsPromise = api.getGoals ? api.getGoals().catch(() => []) : Promise.resolve([]);
      const autoInsightsPromise = api.getAutoInsights ? api.getAutoInsights().catch(() => null) : Promise.resolve(null);

      let rawGoals = [];
      const results = await Promise.allSettled([
        appDataPromise,
        healthMetricsPromise,
        sportSummaryPromise,
        sleepDataPromise,
        weightStatsPromise,
        healthSummaryPromise,
        cyclingPromise,
        workoutsPromise,
        prevSportPromise,
        activityComparisonPromise,
        lifetimeStatsPromise,
        goalsPromise,
        autoInsightsPromise,
      ]);

      const appData = results[0].status === 'fulfilled' ? results[0].value : null;
      const healthMetrics = results[1].status === 'fulfilled' && results[1].value?.ok ? results[1].value : { ok: false, data: null };
      const sportSummary = results[2].status === 'fulfilled' ? results[2].value : [];
      const sleepData = results[3].status === 'fulfilled' ? results[3].value : { ok: false, dailySeries: [], trendArrow: null, consistency: null, totalAvg: null, deepAvg: null, remAvg: null, lightAvg: null };
      const weightStats = results[4].status === 'fulfilled' ? results[4].value : { first: null, last: null, min: null, max: null, trend: null, count: 0 };
      const healthSummary = results[5].status === 'fulfilled' ? results[5].value : null;
      const cyclingResult = results[6].status === 'fulfilled' ? results[6].value : { ok: false, data: [] };
      const workoutsResult = results[7].status === 'fulfilled' ? results[7].value : { ok: false, data: [] };
      const prevSportSummary = results[8].status === 'fulfilled' ? results[8].value : [];
      const activityComparison = results[9].status === 'fulfilled' ? results[9].value : null;
      const lifetimeStats = results[10].status === 'fulfilled' ? results[10].value : { totalWeeks: 0, currentStreak: 0, totalSessions: 0 };
      rawGoals = results[11].status === 'fulfilled' ? results[11].value : [];
      const autoInsights = results[12].status === 'fulfilled' ? results[12].value : null;

      const dashboardGoals = [];
      if (Array.isArray(rawGoals)) {
        for (const g of rawGoals) {
          if (g.archived) continue;
          const progress = api.getGoalProgress ? await safeCall(api.getGoalProgress(g.id), null) : null;
          if (progress && progress.ok) {
            g.progress_pct = progress.progress_pct;
          } else {
            g.progress_pct = g.target > 0 ? Math.min(100, Math.round(((g.current || 0) / g.target) * 1000) / 10) : 0;
          }
          dashboardGoals.push(g);
        }
      }

      await lastImportPromise;

      const dailyData = healthSummary?.ok ? healthSummary.data : [];
      const metrics = healthMetrics?.ok ? healthMetrics.data : null;

      const cyclingData = cyclingResult?.ok && Array.isArray(cyclingResult.data) ? cyclingResult.data : [];
      const cyclingSeries = cyclingData.map(d => d.km);
      const cyclingTotal = cyclingSeries.reduce((s, v) => s + (v || 0), 0);
      const cyclingAvg = cyclingSeries.length ? cyclingTotal / cyclingSeries.length : null;

      const workouts = workoutsResult?.ok && Array.isArray(workoutsResult.data) ? workoutsResult.data : [];
      const sportExtra = {};
      for (const w of workouts) {
        const t = w.activity_type;
        if (!sportExtra[t]) sportExtra[t] = { km: 0, minutes: 0, kcal: 0 };
        sportExtra[t].km += (w.km || 0);
        sportExtra[t].minutes += (w.minutes || 0);
        sportExtra[t].kcal += (w.kcal || 0);
      }

      const totalSessions = sportSummary.reduce((s, a) => s + a.count, 0);
      const totalKcal = sportSummary.reduce((s, a) => s + a.total_kcal, 0);
      const totalDuration = sportSummary.reduce((s, a) => s + (a.total_duration || 0), 0);
      const totalDistance = sportSummary.reduce((s, a) => s + (a.total_distance_km || 0), 0);
      const currentActiveDays = activityComparison?.currentActiveDays || 0;
      const previousActiveDays = activityComparison?.previousActiveDays || 0;
      const previousDistance = activityComparison?.previousDistanceKm || 0;
      const previousDuration = activityComparison?.previousDurationMin || 0;
      const periodLengthDays = activityComparison?.periodLengthDays || daysInPeriod;

      function bestStreak(dates) {
        if (!dates || dates.length === 0) return 0;
        let best = 1, run = 1;
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1]);
          const curr = new Date(dates[i]);
          const diffDays = Math.round((curr - prev) / 86400000);
          if (diffDays === 1) {
            run += 1;
            if (run > best) best = run;
          } else if (diffDays > 1) {
            run = 1;
          }
        }
        return best;
      }
      const currentBestStreak = bestStreak(activityComparison?.currentActiveDates);
      const previousBestStreak = bestStreak(activityComparison?.previousActiveDates);

      const avgBalance = appData?.weekBalance != null && daysInPeriod > 0
        ? Math.round(appData.weekBalance / daysInPeriod)
        : null;

      const tail = arr => arr ? arr.slice(-daysInPeriod) : [];
      const sleepSeries = sleepData?.ok && sleepData.dailySeries ? tail(sleepData.dailySeries).map(d => d.sleep_hours) : [];
      const hrvSeries = metrics?.hrv ? tail(metrics.hrv).map(d => d.hrv_ms) : [];
      const rhrSeries = metrics?.resting_hr ? tail(metrics.resting_hr).map(d => d.rhr_bpm) : [];
      const walkSeries = metrics?.walking_distance ? tail(metrics.walking_distance).map(d => d.km) : [];
      const exerSeries = metrics?.exercise_time ? tail(metrics.exercise_time).map(d => d.minutes) : [];
      const stepsSeries = dailyData && dailyData.length ? tail(dailyData).map(d => d.steps) : [];
      const weightSeries = weightStats?.count > 0 ? (appData?.weightEntries || []) : [];

      const kcalSeries = dailyData && dailyData.length ? dailyData.map(d => (d.kcal_activas || 0) + (d.kcal_basales || 0)) : [];
      const ringValues = kcalSeries.length ? kcalSeries : [];
      const heroValue = avgBalance != null ? `${avgBalance > 0 ? '+' : ''}${avgBalance}` : '--';
      const heroSub = avgBalance != null
        ? `${strings.dashboard.avgDay} · ${ringValues.length} ${strings.dashboard.days}`
        : strings.dashboard.noBalanceData;

      const infoItems = [];
      if (appData?.todayCalories != null) {
        infoItems.push(`<span class="text-xs text-muted">${strings.dashboard.plannedIntakeLabel}: <strong>${Math.round(appData.todayCalories).toLocaleString()} kcal</strong></span>`);
      }
      if (appData?.nextWorkout) {
        const d = new Date(appData.nextWorkout);
        infoItems.push(`<span class="text-xs text-muted">${strings.dashboard.nextWorkoutLabel}: <strong>${d.toLocaleDateString()}</strong></span>`);
      }

      let hrvDisplay = '--', rhrDisplay = '--', hrvTrend = '';
      if (metrics) {
        const hrvData = metrics.hrv || [];
        const rhrData = metrics.resting_hr || [];
        if (hrvData.length > 0) {
          const latestHrv = hrvData[hrvData.length - 1].hrv_ms;
          const avgHrv = (hrvData.reduce((s, d) => s + d.hrv_ms, 0) / hrvData.length).toFixed(1);
          hrvDisplay = `<strong>${latestHrv} ${strings.dashboard.unitMs}</strong>`;
          hrvTrend = ` · ${strings.dashboard.avg7d}: <strong>${avgHrv} ${strings.dashboard.unitMs}</strong>`;
        }
        if (rhrData.length > 0) {
          const latestRhr = rhrData[rhrData.length - 1].rhr_bpm;
          rhrDisplay = `<strong>${Math.round(latestRhr)} ${strings.dashboard.unitBpm}</strong>`;
        }
      }

      let sleepDisplay = '--', sleepCompliance = '', sleepPhasesBar = '', sleepConsistencyBadge = '';
      if (sleepData?.ok && sleepData.dailySeries?.length) {
        const avgSleep = sleepData.dailySeries.reduce((s, d) => s + d.sleep_hours, 0) / sleepData.dailySeries.length;
        sleepDisplay = `<strong>${avgSleep.toFixed(1)} ${strings.dashboard.unitH}</strong>`;
        sleepCompliance = (avgSleep >= 7 && avgSleep <= 9)
          ? `<span class="compliance-ok">${icon('check', 11)} ${strings.dashboard.sleepOptimal}</span>`
          : `<span class="compliance-warn">${strings.dashboard.sleepAdjust}</span>`;
        if (sleepData.deepAvg != null && sleepData.remAvg != null && sleepData.lightAvg != null) {
          const phaseTotal = sleepData.deepAvg + sleepData.remAvg + sleepData.lightAvg || 1;
          const dp = (sleepData.deepAvg / phaseTotal * 100).toFixed(1);
          const rp = (sleepData.remAvg / phaseTotal * 100).toFixed(1);
          const lp = (sleepData.lightAvg / phaseTotal * 100).toFixed(1);
          sleepPhasesBar = `<div class="flex-gap-md" style="margin-top:var(--space-1)">
            <div><span class="legend-dot moss"></span><span class="text-xs">${strings.sleep.deep}: <strong>${sleepData.deepAvg.toFixed(1)}${strings.dashboard.unitH}</strong> (${dp}%)</span></div>
            <div><span class="legend-dot ember"></span><span class="text-xs">${strings.sleep.rem}: <strong>${sleepData.remAvg.toFixed(1)}${strings.dashboard.unitH}</strong> (${rp}%)</span></div>
            <div><span class="legend-dot moss-mist"></span><span class="text-xs">${strings.sleep.light}: <strong>${sleepData.lightAvg.toFixed(1)}${strings.dashboard.unitH}</strong> (${lp}%)</span></div>
          </div>`;
        }
        if (sleepData.consistency != null) {
          const label = sleepData.consistency >= 75 ? strings.sleep.consistent : sleepData.consistency >= 50 ? strings.sleep.irregular : strings.sleep.veryIrregular;
          sleepConsistencyBadge = `<span class="text-xs text-muted">${strings.sleep.consistency}: <strong>${Math.round(sleepData.consistency)}%</strong> · ${label}</span>`;
        }
      }

      // Weight card
      let weightDisplay = strings.dashboard.noData;
      let weightDeltaHtml = '';
      let weightSparklineHtml = '';
      if (weightStats?.count > 0 && weightStats.last != null) {
        weightDisplay = `<strong>${weightStats.last.toFixed(1)} ${strings.dashboard.unitKg}</strong>`;
        if (weightStats.first != null) {
          const delta = weightStats.last - weightStats.first;
          const deltaSign = delta >= 0 ? '+' : '';
          weightDeltaHtml = `<span class="text-xs text-muted">${strings.dashboard.weightDelta}: ${deltaSign}${delta.toFixed(1)} ${strings.dashboard.unitKg}</span>`;
        }
        const wSeries = weightStats.series || [];
        if (wSeries.length >= 2) {
          const wColor = computeTrendDirection(wSeries, 'weight');
          weightSparklineHtml = sparkline(wSeries, { stroke: `var(--${wColor})`, showMean: true });
        }
      }

      // Walking + Cycling cards (use sport_activities data to match the bottom section)
      const walkingSport = sportSummary.find(s => s.sport_type === 'walking');
      const cyclingSport = sportSummary.find(s => s.sport_type === 'cycling');
      const walkTotalKm = walkingSport?.total_distance_km || 0;
      const cycleTotalKm = cyclingSport?.total_distance_km || 0;
      let walkDisplay = strings.dashboard.noData;
      let walkSub = '';
      if (walkTotalKm > 0) {
        const avgPerDay = daysInPeriod > 0 ? walkTotalKm / daysInPeriod : 0;
        walkDisplay = `<strong>${avgPerDay.toFixed(2)} ${strings.dashboard.unitKm}</strong>`;
        walkSub = `${strings.dashboard.totalKm}: <strong>${walkTotalKm.toFixed(1)} ${strings.dashboard.unitKm}</strong>`;
      }
      let cycleDisplay = strings.dashboard.noData;
      let cycleSub = '';
      if (cycleTotalKm > 0) {
        const avgPerDay = daysInPeriod > 0 ? cycleTotalKm / daysInPeriod : 0;
        cycleDisplay = `<strong>${avgPerDay.toFixed(2)} ${strings.dashboard.unitKm}</strong>`;
        cycleSub = `${strings.dashboard.totalKm}: <strong>${cycleTotalKm.toFixed(1)} ${strings.dashboard.unitKm}</strong>`;
      }

      const walkColor = walkSeries.length >= 2 ? computeTrendDirection(walkSeries, 'distance') : 'moss';
      const cycleColor = cyclingSeries.length >= 2 ? computeTrendDirection(cyclingSeries, 'distance') : 'moss';

      const hrvColor = hrvSeries.length >= 2 ? computeTrendDirection(hrvSeries, 'hrv') : 'moss';
      const rhrColor = rhrSeries.length >= 2 ? computeTrendDirection(rhrSeries, 'rhr') : 'moss';
      const sleepColor = sleepSeries.length >= 2 ? computeTrendDirection(sleepSeries, 'sleep') : 'moss';
      const stepsColor = stepsSeries.length >= 2 ? computeTrendDirection(stepsSeries, 'steps') : 'moss';
      const exerColor = exerSeries.length >= 2 ? computeTrendDirection(exerSeries, 'exercise') : 'moss';

      const steps7d = stepsSeries.length >= 7 ? Math.round(stepsSeries.slice(-7).reduce((a, v) => a + v, 0) / 7) : null;
      const steps15d = stepsSeries.length >= 15 ? Math.round(stepsSeries.slice(-15).reduce((a, v) => a + v, 0) / 15) : null;
      const steps1m = stepsSeries.length ? Math.round(stepsSeries.reduce((a, v) => a + v, 0) / stepsSeries.length) : null;

      function trafficLight(level) {
        const colors = { green: 'var(--success, #10b981)', yellow: 'var(--warning, #f59e0b)', red: 'var(--danger, #ef4444)' };
        const labels = { green: 'Óptimo', yellow: 'Ajustar', red: 'Bajo' };
        const c = colors[level] || colors.yellow;
        return `<div class="kpi-traffic-light"><span class="kpi-traffic-light-dot" style="background:${c}"></span><span class="kpi-traffic-light-label">${labels[level]}</span></div>`;
      }

      const sleepAvgVal = sleepData?.ok && sleepData.dailySeries?.length
        ? sleepData.dailySeries.reduce((s, d) => s + d.sleep_hours, 0) / sleepData.dailySeries.length
        : null;
      const sleepLight = sleepAvgVal != null ? (sleepAvgVal >= 7 ? 'green' : sleepAvgVal >= 6 ? 'yellow' : 'red') : null;

      const stepsAvg = steps1m;
      const stepsLight = stepsAvg != null ? (stepsAvg >= 10000 ? 'green' : stepsAvg >= 7000 ? 'yellow' : 'red') : null;

      const exerAvgVal = metrics?.exercise_time?.length
        ? metrics.exercise_time.reduce((s, d) => s + d.minutes, 0) / metrics.exercise_time.length
        : null;
      const exerLight = exerAvgVal != null ? (exerAvgVal >= 30 ? 'green' : exerAvgVal >= 15 ? 'yellow' : 'red') : null;

      const walkAvgPerDay = walkTotalKm > 0 && daysInPeriod > 0 ? walkTotalKm / daysInPeriod : null;
      const walkLight = walkAvgPerDay != null ? (walkAvgPerDay >= 5 ? 'green' : walkAvgPerDay >= 3 ? 'yellow' : 'red') : null;

      const cycleAvgPerDay = cycleTotalKm > 0 && daysInPeriod > 0 ? cycleTotalKm / daysInPeriod : null;
      const cycleLight = cycleAvgPerDay != null ? (cycleAvgPerDay >= 15 ? 'green' : cycleAvgPerDay >= 5 ? 'yellow' : 'red') : null;

      const rhrVal = metrics?.resting_hr?.length ? metrics.resting_hr[metrics.resting_hr.length - 1].rhr_bpm : null;
      const rhrLight = rhrVal != null ? (rhrVal < 65 ? 'green' : rhrVal < 80 ? 'yellow' : 'red') : null;

      const hrvVal = metrics?.hrv?.length ? metrics.hrv[metrics.hrv.length - 1].hrv_ms : null;
      const hrvLight = hrvVal != null ? (hrvVal >= 50 ? 'green' : hrvVal >= 30 ? 'yellow' : 'red') : null;

      let exerciseDisplay = '--', exerciseCompliance = '';
      if (metrics?.exercise_time?.length) {
        const avgEx = metrics.exercise_time.reduce((s, d) => s + d.minutes, 0) / metrics.exercise_time.length;
        exerciseDisplay = `<strong>${avgEx.toFixed(0)} ${strings.dashboard.unitMin}</strong>`;
        exerciseCompliance = avgEx >= 30
          ? `<span class="compliance-ok">${icon('check', 11)} ${strings.dashboard.exerciseCompliant}</span>`
          : `<span class="compliance-warn">${strings.dashboard.exerciseBelow}</span>`;
      }

      const todayCaloriesHtml = appData?.todayCalories != null
        ? `<strong>${Math.round(appData.todayCalories).toLocaleString()} kcal</strong>`
        : strings.dashboard.noData;

      let balanceDetail = '';
      if (appData?.weekBalance != null) {
        balanceDetail = `<span class="text-xs text-muted">${strings.dashboard.avgDay}</span>`;
      }

      // Goals summary card
      const activeDashboardGoals = Array.isArray(dashboardGoals)
        ? dashboardGoals.filter(g => !g.archived && g.progress_pct < 100).slice(0, 3)
        : [];
      if (activeDashboardGoals.length > 0) {
        const goalCards = activeDashboardGoals.map(g => {
          const ring = goalProgressRing(g.progress_pct, { size: 64, strokeWidth: 7 });
          const label = (g.label || '').length > 25 ? (g.label || '').slice(0, 24) + '…' : (g.label || '');
          const targetDate = g.targetDate ? new Date(g.targetDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
          return `<div class="goal-card-mini" data-goal-id="${g.id}" tabindex="0" role="button" aria-label="${strings.goals.goalProgress} ${label}: ${g.progress_pct}%">
            <div class="goal-card-mini-ring">${ring}</div>
            <div class="goal-card-mini-info">
              <div class="goal-card-mini-label">${label}</div>
              <div class="goal-card-mini-progress">${g.progress_pct}%</div>
              ${targetDate ? `<div class="goal-card-mini-date">${targetDate}</div>` : ''}
            </div>
          </div>`;
        }).join('');
        const overflow = dashboardGoals.filter(g => !g.archived && g.progress_pct < 100).length;
        const overflowHtml = overflow > 3 ? `<div class="goal-card-mini goal-card-more" tabindex="0" role="button" aria-label="${strings.goals.moreGoals.replace('{n}', overflow - 3)}">
          <div class="goal-card-more-text">+${overflow - 3}</div>
          <div class="goal-card-mini-label">${strings.goals.more}</div>
        </div>` : '';
        goalsRow.innerHTML = `
          <div class="dashboard-card" style="grid-column:1/-1">
            <h3>${strings.goals.title}</h3>
            <div class="goals-summary-cards">
              ${goalCards}
              ${overflowHtml}
            </div>
          </div>
        `;
        goalsRow.querySelectorAll('.goal-card-mini').forEach(el => {
          el.addEventListener('click', () => {
            if (api) api.navigate('goals');
          });
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (api) api.navigate('goals');
            }
          });
        });
      } else {
        goalsRow.innerHTML = `
          <div class="dashboard-card" style="grid-column:1/-1;cursor:pointer" tabindex="0" role="button" aria-label="${strings.goals.emptyDashboard}">
            <div class="goals-summary-empty" id="goals-dash-empty">
              ${icon('target', 24)}
              <span>${strings.goals.emptyDashboard}</span>
            </div>
          </div>
        `;
        goalsRow.querySelector('.dashboard-card').addEventListener('click', () => {
          if (api) api.navigate('goals');
        });
      }

      // Build hero
      const compact = ringValues.length === 0;
      let heroSubline = heroSub;
      if (infoItems.length) {
        heroSubline += `<div class="flex-gap-md" style="margin-top:var(--space-1)">${infoItems.join('')}</div>`;
      }
      // Last weight for hero card
      let lastWeightHtml = '';
      if (weightStats?.count > 0 && weightStats.last != null) {
        const lastWeightEntry = appData?.weightEntries?.[appData.weightEntries.length - 1];
        const lastWeightDate = lastWeightEntry?.date ? new Date(lastWeightEntry.date).toLocaleDateString() : '';
        const lastWeightSource = lastWeightEntry?.source === 'manual' ? strings.dashboard.manualEntry : strings.dashboard.appleWatch;
        lastWeightHtml = `<div class="hero-last-weight">
          <span class="hero-last-weight-label">${strings.dashboard.latestWeight}:</span>
          <span class="hero-last-weight-value">${weightStats.last.toFixed(1)} ${strings.dashboard.unitKg}</span>
          ${lastWeightDate ? `<span class="hero-last-weight-date">${lastWeightDate}</span>` : ''}
          <span class="hero-last-weight-source">${lastWeightSource}</span>
        </div>`;
      } else {
        lastWeightHtml = `<div class="hero-last-weight">
          <span class="hero-last-weight-label">${strings.dashboard.latestWeight}:</span>
          <span class="hero-last-weight-value">${strings.dashboard.noData}</span>
        </div>`;
      }

      // Energy breakdown for hero card
      const totalSportKcal = sportSummary.reduce((s, a) => s + (a.total_kcal || 0), 0);
      const avgDailyBasalKcal = dailyData && dailyData.length > 0
        ? Math.round(dailyData.reduce((s, d) => s + (d.kcal_basales || 0), 0) / dailyData.length)
        : 0;
      const totalKcalForBar = totalSportKcal + avgDailyBasalKcal;
      const sportKcalPercent = totalKcalForBar > 0 ? (totalSportKcal / totalKcalForBar) * 100 : 0;
      const basalKcalPercent = totalKcalForBar > 0 ? (avgDailyBasalKcal / totalKcalForBar) * 100 : 0;

      let energyBreakdownHtml = '';
      if (totalKcalForBar > 0) {
        energyBreakdownHtml = `<div class="hero-energy-breakdown">
          <div class="hero-energy-breakdown-label">${strings.dashboard.energyBreakdown}</div>
          <div class="hero-energy-breakdown-bar">
            <div class="hero-energy-breakdown-sport" style="width: ${sportKcalPercent}%" title="${strings.dashboard.sportCalories}: ${Math.round(totalSportKcal)} kcal"></div>
            <div class="hero-energy-breakdown-basal" style="width: ${basalKcalPercent}%" title="${strings.dashboard.basalCalories}: ${Math.round(avgDailyBasalKcal)} kcal"></div>
          </div>
          <div class="hero-energy-breakdown-legend">
            <span><span class="legend-dot moss"></span>${strings.dashboard.sportCalories}: <strong>${Math.round(totalSportKcal)}</strong> kcal</span>
            <span><span class="legend-dot ember"></span>${strings.dashboard.basalCalories}: <strong>${Math.round(avgDailyBasalKcal)}</strong> kcal</span>
          </div>
        </div>`;
      }

      heroRow.innerHTML = `
        <div class="card-hero${compact ? ' card-hero--compact' : ''}">
          ${compact ? '' : `<div class="hero-ring-wrap">
            ${growthRing(ringValues)}
          </div>`}
          <div class="hero-text">
            <div class="hero-eyebrow">${strings.dashboard.weekBalance}</div>
            <div><span class="hero-value">${heroValue}</span><span class="hero-unit">kcal</span></div>
            <div class="hero-sub">${heroSubline}</div>
            ${lastWeightHtml}
            ${energyBreakdownHtml}
            ${compact ? '' : `<div class="hero-legend">
              <span><span class="legend-dot moss"></span>${strings.dashboard.highExpenditure}</span>
              <span><span class="legend-dot ember"></span>${strings.dashboard.lowExpenditure}</span>
            </div>`}
          </div>
        </div>`;

      // Auto-insights section
      const autoInsightsRow = document.getElementById('row-auto-insights');
      if (autoInsightsRow && autoInsights && autoInsights.cards && autoInsights.cards.length > 0) {
        const severityLabels = strings.dashboard.autoInsights.severityLabels;
        autoInsightsRow.innerHTML = `
          <div class="dashboard-card dashboard-auto-insights">
            <h3>${strings.dashboard.autoInsights.title}</h3>
            <div class="auto-insights-grid">
              ${autoInsights.cards.slice(0, 4).map(card => `
                <div class="auto-insight-card auto-insight-card--${card.severity}">
                  <div class="auto-insight-icon">${icon(card.icon, 16)}</div>
                  <div class="auto-insight-text">${card.text}</div>
                  <div class="auto-insight-severity">${severityLabels[card.severity] || card.severity}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (autoInsightsRow) {
        autoInsightsRow.innerHTML = '';
      }

      // Row 1 KPIs: Sueño, HRV, RHR, Peso, Pasos
      kpis1Row.innerHTML = `
        <div class="dashboard-card">
          <div class="kpi-header">
            <h3>${strings.dashboard.sleepTitle}</h3>
            ${sleepSeries.length >= 2 ? sparkline(sleepSeries, { width: 60, height: 20, stroke: `var(--${sleepColor})`, showMean: false }) : ''}
          </div>
          <div class="value">${sleepDisplay}</div>
          <div class="kpi-comparison">${sleepPhasesBar}${sleepConsistencyBadge}${sleepCompliance}</div>
          ${sleepLight ? trafficLight(sleepLight) : ''}
        </div>
        <div class="dashboard-card">
          <div class="kpi-header">
            <h3>${strings.dashboard.hrvLabel} <span class="info-icon" title="${strings.dashboard.hrvTooltip}">${icon('info', 14)}</span></h3>
            ${hrvSeries.length >= 2 ? sparkline(hrvSeries, { width: 60, height: 20, stroke: `var(--${hrvColor})`, showMean: false }) : ''}
          </div>
          <div class="value">${hrvDisplay}</div>
          <div class="kpi-comparison">${hrvTrend || ''}</div>
          ${hrvLight ? trafficLight(hrvLight) : ''}
        </div>
        <div class="dashboard-card">
          <div class="kpi-header">
            <h3>${strings.dashboard.restingHr} <span class="info-icon" title="${strings.dashboard.rhrTooltip}">${icon('info', 14)}</span></h3>
            ${rhrSeries.length >= 2 ? sparkline(rhrSeries, { width: 60, height: 20, stroke: `var(--${rhrColor})`, showMean: false }) : ''}
          </div>
          <div class="value">${rhrDisplay}</div>
          <div class="kpi-comparison">${strings.dashboard.avg7d}</div>
          ${rhrLight ? trafficLight(rhrLight) : ''}
        </div>
        <div class="dashboard-card">
          <div class="kpi-header">
            <h3>${strings.dashboard.latestWeight}</h3>
            ${weightSparklineHtml ? weightSparklineHtml.replace(/width="[^"]*"/, 'width="60"').replace(/height="[^"]*"/, 'height="20"') : ''}
          </div>
          <div class="value">${weightDisplay}</div>
          <div class="kpi-comparison">${weightDeltaHtml}</div>
        </div>
        <div class="dashboard-card">
          <div class="kpi-header">
            <h3>${strings.dashboard.dailySteps}</h3>
            ${stepsSeries.length >= 2 ? sparkline(stepsSeries, { width: 60, height: 20, stroke: `var(--${stepsColor})`, showMean: false }) : ''}
          </div>
          <div class="value">${stepsSeries.length ? `<strong>${stepsSeries[stepsSeries.length - 1].toLocaleString()}</strong>` : strings.dashboard.noData}</div>
          <div class="kpi-comparison">${strings.dashboard.avgDay}: ${steps7d?.toLocaleString() || strings.dashboard.noData} · ${strings.dashboard.steps15d} ${steps15d?.toLocaleString() || strings.dashboard.noData} · ${strings.dashboard.steps1m} ${steps1m?.toLocaleString() || strings.dashboard.noData}</div>
          ${stepsLight ? trafficLight(stepsLight) : ''}
        </div>`;

      kpis2Row.innerHTML = `
        <div class="dashboard-card">
          <div class="kpi-header">
            <h3>${strings.dashboard.exerciseTime}</h3>
            ${exerSeries.length >= 2 ? sparkline(exerSeries, { width: 60, height: 20, stroke: `var(--${exerColor})`, showMean: false }) : ''}
          </div>
          <div class="value">${exerciseDisplay}</div>
          <div class="kpi-comparison">${exerciseCompliance || strings.dashboard.avgDay}</div>
          ${exerLight ? trafficLight(exerLight) : ''}
        </div>
        <div class="dashboard-card">
          <div class="kpi-header">
            <h3>${strings.activity.sportNames.walking}</h3>
            ${walkSeries.length >= 2 ? sparkline(walkSeries, { width: 60, height: 20, stroke: `var(--${walkColor})`, showMean: false }) : ''}
          </div>
          <div class="value">${walkDisplay}</div>
          <div class="kpi-comparison">${walkSub}</div>
          ${walkLight ? trafficLight(walkLight) : ''}
        </div>
        <div class="dashboard-card">
          <div class="kpi-header">
            <h3>${strings.activity.sportNames.cycling}</h3>
            ${cyclingSeries.length >= 2 ? sparkline(cyclingSeries, { width: 60, height: 20, stroke: `var(--${cycleColor})`, showMean: false }) : ''}
          </div>
          <div class="value">${cycleDisplay}</div>
          <div class="kpi-comparison">${cycleSub}</div>
          ${cycleLight ? trafficLight(cycleLight) : ''}
        </div>`;

      if (results[0].status === 'rejected') {
        const heroCard = heroRow.querySelector('.card-hero');
        if (heroCard) {
          const wrapper = document.createElement('div');
          heroCard.replaceWith(wrapper);
          renderStateCard(wrapper, { title: strings.dashboard.weekBalance, state: 'error', subtitle: strings.states.errorLoading, onRetry: render });
        }
      }

      // Build PoP map from previous period
      const prevByType = {};
      for (const a of prevSportSummary) {
        prevByType[a.sport_type] = a.count;
      }

      const activeDaysTrend = getTrendArrow(currentActiveDays, previousActiveDays);
      const distanceTrend = getTrendArrow(totalDistance, previousDistance);
      const durationTrend = getTrendArrow(totalDuration, previousDuration);
      const streakTrend = getTrendArrow(currentBestStreak, previousBestStreak);
      const comparisonTip = strings.activity.periodComparisonTooltip;

      // Consistency card at the TOP (was inside sports section, now promoted)
      const streakBadge = lifetimeStats.currentStreak > 0
        ? `<span style="display:inline-block;background:var(--success, #10b981);color:#fff;font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;margin-left:8px;vertical-align:middle">${icon('flame', 11)} ${strings.activity.streakActive}</span>`
        : '';
      consistencyRow.innerHTML = `
        <div class="dashboard-card consistency-hero" role="region" aria-label="${strings.activity.consistency}">
          <div class="consistency-hero-side">
            <div class="consistency-hero-eyebrow">${icon('trophy', 14)} ${strings.activity.consistency}</div>
            <div class="consistency-hero-value">${lifetimeStats.totalWeeks}</div>
            <div class="consistency-hero-sub">${strings.activity.totalWeeksWithGoalSub}</div>
          </div>
          <div class="consistency-hero-divider" aria-hidden="true"></div>
          <div class="consistency-hero-side">
            <div class="consistency-hero-eyebrow">${strings.activity.currentStreakWeeks}${streakBadge}</div>
            <div class="consistency-hero-value-with-icon">${lifetimeStats.currentStreak}<span class="consistency-hero-icon">${icon('flame', 24)}</span></div>
            <div class="consistency-hero-sub">${strings.activity.currentStreakWeeksSub}</div>
          </div>
        </div>`;

      // Sports section at the bottom (no consistency card anymore — moved to top)
      if (sportSummary && sportSummary.length > 0) {
        const sorted = [...sportSummary].sort((a, b) => b.count - a.count);
        const sportCardsHtml = sorted.map(a => {
          const prevCount = prevByType[a.sport_type];
          let popHtml = '';
          if (prevCount != null) {
            const delta = a.count - prevCount;
            const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '―';
            const sign = delta >= 0 ? '+' : '';
            popHtml = ` · ${strings.dashboard.vsPrevious}: <strong>${sign}${delta}</strong> ${arrow}`;
          }
          const distanceKm = a.total_distance_km || 0;
          const extras = [];
          if (distanceKm > 0) {
            extras.push(`<strong>${distanceKm.toFixed(1)} ${strings.dashboard.unitKm}</strong>`);
          }
          const sub = `<strong>${a.count}</strong> ${strings.dashboard.sessions}${extras.length ? ' · ' + extras.join(' · ') : ''}${popHtml}`;
          return `<div class="dashboard-card">
            <h3>${sportIcon(a.sport_type, 14)} ${getSportDisplayName(a.sport_type)}</h3>
            <div class="value">${a.total_kcal.toLocaleString()} kcal</div>
            <div class="subtitle">${sub}</div>
          </div>`;
        }).join('');
        const accentHtml = `
          <div class="dashboard-card card-accent" style="grid-column:1/-1">
            <h3>${strings.dashboard.activitySummary}</h3>
            <div class="flex-gap-md" style="margin-top:var(--space-1);flex-wrap:wrap;gap:var(--space-3)">
              <div><span class="value" style="color:#fff;font-size:20px">${totalSessions}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.sessionCount}</div></div>
              <div><span class="value" style="color:#fff;font-size:20px">${totalKcal.toLocaleString()}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.kcalTotal}</div></div>
              <div title="${comparisonTip}"><span class="value" style="color:#fff;font-size:20px">${currentActiveDays} <span style="font-size:14px">${activeDaysTrend.arrow}</span></span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.activity.activeDays} ${strings.activity.activeDaysOf.replace('{total}', periodLengthDays)}</div></div>
              <div title="${comparisonTip}"><span class="value" style="color:#fff;font-size:20px">${totalDistance.toFixed(1)} ${strings.dashboard.unitKm} <span style="font-size:14px">${distanceTrend.arrow}</span></span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.activity.distanceKm}</div></div>
              <div title="${comparisonTip}"><span class="value" style="color:#fff;font-size:20px">${Math.round(totalDuration)} <span style="font-size:13px;opacity:0.7">${strings.activity.minutesUnit}</span> <span style="font-size:14px">${durationTrend.arrow}</span></span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.activity.totalMinutes}</div></div>
              <div title="${comparisonTip}"><span class="value" style="color:#fff;font-size:20px">${currentBestStreak} <span style="font-size:14px">${streakTrend.arrow}</span></span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.activity.bestStreak} ${currentBestStreak > 0 ? strings.activity.bestStreakDays.replace('{n}', currentBestStreak) : ''}</div></div>
            </div>
          </div>`;
        sportsRow.innerHTML = `<div style="grid-column:1/-1;margin:var(--space-2) 0 var(--space-1)"><hr style="border:none;border-top:2px solid var(--border);opacity:0.5"><p class="text-xs text-muted" style="margin-top:var(--space-2)">${strings.dashboard.sportsSection}</p></div>${accentHtml}${sportCardsHtml}`;
      } else {
        sportsRow.innerHTML = `<div class="dashboard-card" style="grid-column:1/-1;text-align:center;color:var(--text-secondary)"><p>${strings.dashboard.noActivityData}</p></div>`;
      }
    }

    await render();
  } finally {
    window._loadingDashboard = false;
  }
}
