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
  mountTrainingLog,
  mountStreak,
  mountMonthlyCalendar,
} from './panels/strava-panels.js';

export async function init() {
  if (window._loadingDashboard) return;
  window._loadingDashboard = true;
  try {
    const container = document.getElementById('view-dashboard');
    const api = window.electronAPI;

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
      <div class="dashboard-chart-row" id="row-trend" style="margin-top:var(--space-4);display:none">
        <div class="card"><h3 class="text-sm" style="margin-bottom:var(--space-2)">${strings.dashboard.kcalDaily}</h3><div class="chart-container" style="height:200px"><canvas id="trend-chart"></canvas></div></div>
        <div class="card"><h3 class="text-sm" style="margin-bottom:var(--space-2)">${strings.dashboard.weeklyBalanceTrend}</h3><div class="chart-container" style="height:200px"><canvas id="weekly-balance-chart"></canvas></div></div>
      </div>
      <div class="dashboard-grid" id="row-sports" aria-live="polite"></div>
      <section class="strava-block" id="strava-block" aria-label="${strings.stravaPanels.blockTitle}">
        <div class="strava-block-header">
          <h2>${strings.stravaPanels.blockTitle}</h2>
        </div>
        <div class="strava-resumen-row">
          <div id="strava-pr"></div>
          <div id="strava-relative-effort"></div>
        </div>
        <div id="strava-training-log"></div>
        <div id="strava-streak"></div>
        <div id="strava-calendar"></div>
      </section>
    `;

    if (!api) {
      document.getElementById('row-hero').innerHTML = `<div class="dashboard-card"><h3>${strings.dashboard.status}</h3><div class="value">${strings.dashboard.offline}</div><div class="subtitle">${strings.dashboard.offlineSub}</div></div>`;
      return;
    }

    const stravaMounts = [
      mountPersonalRecord(document.getElementById('strava-pr')),
      mountRelativeEffort(document.getElementById('strava-relative-effort')),
      mountTrainingLog(document.getElementById('strava-training-log')),
      mountStreak(document.getElementById('strava-streak')),
      mountMonthlyCalendar(document.getElementById('strava-calendar')),
    ];

    if (api.onDataChanged) {
      api.onDataChanged(() => {
        stravaMounts.forEach((unmount, i) => {
          if (typeof unmount === 'function') {
            try { unmount(); } catch {}
          }
        });
        const remounts = [
          mountPersonalRecord(document.getElementById('strava-pr')),
          mountRelativeEffort(document.getElementById('strava-relative-effort')),
          mountTrainingLog(document.getElementById('strava-training-log')),
          mountStreak(document.getElementById('strava-streak')),
          mountMonthlyCalendar(document.getElementById('strava-calendar')),
        ];
        remounts.forEach((u, i) => { stravaMounts[i] = u; });
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
      const trendRow = document.getElementById('row-trend');
      const { from, to } = getRangeDates(_range);
      const daysInPeriod = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;

      consistencyRow.innerHTML = skeletonCard();
      goalsRow.innerHTML = skeletonCard();
      heroRow.innerHTML = skeletonCard();
      kpis1Row.innerHTML = skeletonCard().repeat(5);
      kpis2Row.innerHTML = skeletonCard().repeat(4);
      sportsRow.innerHTML = skeletonCard();

      trendRow.style.display = 'none';
      trendRow.innerHTML = '';

      const lastImportPromise = safeCall(api.getLastImportTimestamp(), null).then(data => {
        const updateEl = document.getElementById('last-update');
        if (data) {
          const d = new Date(data);
          updateEl.textContent = `${strings.dashboard.lastUpdate}: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          updateEl.textContent = strings.dashboard.noImportData;
        }
      });

      const appDataPromise = api.getDashboardData();
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

      const now = new Date();
      const weeklyBalancePromises = [];
      if (api.getEnergyBalance) {
        for (let w = 11; w >= 0; w--) {
          const d = new Date(now);
          d.setDate(d.getDate() - (w * 7));
          weeklyBalancePromises.push(safeCall(api.getEnergyBalance(d.toISOString().split('T')[0]), null));
        }
      }

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
        ...weeklyBalancePromises,
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
      const dashboardGoals = results[11].status === 'fulfilled' ? results[11].value : [];
      const weeklyBalances = results.slice(12).map(r => r.status === 'fulfilled' ? r.value : null);

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
        const goalRings = activeDashboardGoals.map(g => {
          const ring = goalProgressRing(g.progress_pct, { size: 56, strokeWidth: 6 });
          const label = (g.label || '').length > 20 ? (g.label || '').slice(0, 19) + '…' : (g.label || '');
          return `<div class="goal-ring-mini" data-goal-id="${g.id}" tabindex="0" role="button" aria-label="${strings.goals.goalProgress} ${label}: ${g.progress_pct}%">
            ${ring}
            <span class="goal-ring-mini-label">${label}</span>
          </div>`;
        }).join('');
        const overflow = dashboardGoals.filter(g => !g.archived && g.progress_pct < 100).length;
        if (overflow > 3) {
          goalRings += `<div class="goal-ring-mini goal-ring-more" tabindex="0" role="button" aria-label="${strings.goals.moreGoals.replace('{n}', overflow - 3)}">
            <div class="goal-ring-more-text">+${overflow - 3}</div>
            <span class="goal-ring-mini-label">${strings.goals.more}</span>
          </div>`;
        }
        goalsRow.innerHTML = `
          <div class="dashboard-card" style="grid-column:1/-1">
            <div class="goals-summary">
              ${goalRings}
            </div>
          </div>
        `;
        goalsRow.querySelectorAll('.goal-ring-mini').forEach(el => {
          el.addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.navigate('goals');
          });
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (window.electronAPI) window.electronAPI.navigate('goals');
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
          if (window.electronAPI) window.electronAPI.navigate('goals');
        });
      }

      // Build hero
      const compact = ringValues.length === 0;
      let heroSubline = heroSub;
      if (infoItems.length) {
        heroSubline += `<div class="flex-gap-md" style="margin-top:var(--space-1)">${infoItems.join('')}</div>`;
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
            ${compact ? '' : `<div class="hero-legend">
              <span><span class="legend-dot moss"></span>${strings.dashboard.highExpenditure}</span>
              <span><span class="legend-dot ember"></span>${strings.dashboard.lowExpenditure}</span>
            </div>`}
          </div>
        </div>`;

      // Row 1 KPIs: Sueño, HRV, RHR, Peso, Pasos
      kpis1Row.innerHTML = `
        <div class="dashboard-card">
          <h3>${strings.dashboard.sleepTitle}</h3>
          <div class="value">${sleepDisplay}</div>
          ${sleepSeries.length >= 2 ? sparkline(sleepSeries, { stroke: `var(--${sleepColor})`, showMean: true }) : ''}
          <div class="subtitle">${sleepPhasesBar}${sleepConsistencyBadge}${sleepCompliance}</div>
        </div>
        <div class="dashboard-card">
          <h3>${strings.dashboard.hrvLabel}</h3>
          <div class="value">${hrvDisplay}</div>
          ${hrvSeries.length >= 2 ? sparkline(hrvSeries, { stroke: `var(--${hrvColor})`, showMean: true }) : ''}
          <div class="subtitle">${hrvTrend || ''}</div>
        </div>
        <div class="dashboard-card">
          <h3>${strings.dashboard.restingHr}</h3>
          <div class="value">${rhrDisplay}</div>
          ${rhrSeries.length >= 2 ? sparkline(rhrSeries, { stroke: `var(--${rhrColor})`, showMean: true }) : ''}
          <div class="subtitle">${strings.dashboard.avg7d}</div>
        </div>
        <div class="dashboard-card">
          <h3>${strings.dashboard.latestWeight}</h3>
          <div class="value">${weightDisplay}</div>
          ${weightSparklineHtml}
          <div class="subtitle">${weightDeltaHtml}</div>
        </div>
        <div class="dashboard-card">
          <h3>${strings.dashboard.dailySteps}</h3>
          <div class="value">${stepsSeries.length ? `<strong>${stepsSeries[stepsSeries.length - 1].toLocaleString()}</strong>` : strings.dashboard.noData}</div>
          ${stepsSeries.length >= 2 ? sparkline(stepsSeries, { stroke: `var(--${stepsColor})`, showMean: true }) : ''}
          <div class="subtitle">${strings.dashboard.avgDay}: ${steps7d?.toLocaleString() || strings.dashboard.noData} · ${strings.dashboard.steps15d} ${steps15d?.toLocaleString() || strings.dashboard.noData} · ${strings.dashboard.steps1m} ${steps1m?.toLocaleString() || strings.dashboard.noData}</div>
        </div>`;

      // Row 2 KPIs: Ejercicio, Caminata, Ciclismo, Calorías Hoy
      kpis2Row.innerHTML = `
        <div class="dashboard-card">
          <h3>${strings.dashboard.exerciseTime}</h3>
          <div class="value">${exerciseDisplay}</div>
          ${exerSeries.length >= 2 ? sparkline(exerSeries, { stroke: `var(--${exerColor})`, showMean: true }) : ''}
          <div class="subtitle">${exerciseCompliance || strings.dashboard.avgDay}</div>
        </div>
        <div class="dashboard-card">
          <h3>${strings.activity.sportNames.walking}</h3>
          <div class="value">${walkDisplay}</div>
          ${walkSeries.length >= 2 ? sparkline(walkSeries, { stroke: `var(--${walkColor})`, showMean: true }) : ''}
          <div class="subtitle">${walkSub}</div>
        </div>
        <div class="dashboard-card">
          <h3>${strings.activity.sportNames.cycling}</h3>
          <div class="value">${cycleDisplay}</div>
          ${cyclingSeries.length >= 2 ? sparkline(cyclingSeries, { stroke: `var(--${cycleColor})`, showMean: true }) : ''}
          <div class="subtitle">${cycleSub}</div>
        </div>
        <div class="dashboard-card">
          <h3>${strings.dashboard.todayCalories}</h3>
          <div class="value">${todayCaloriesHtml}</div>
          <div class="subtitle">${strings.dashboard.plannedIntakeLabel}</div>
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

      if (dailyData.length > 1) {
        trendRow.style.display = 'grid';
        const ctx = document.getElementById('trend-chart')?.getContext('2d');
        if (ctx) {
          if (window._dashTrendChart) window._dashTrendChart.destroy();
          const labels = dailyData.map(d => d.dia).reverse();
          const kcalData = dailyData.map(d => d.kcal_activas + d.kcal_basales).reverse();
          const ma7 = kcalData.map((_, i, arr) => {
            const slice = arr.slice(Math.max(0, i - 6), i + 1);
            return slice.reduce((s, v) => s + v, 0) / slice.length;
          });
          window._dashTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [
                { label: strings.dashboard.kcalDaily, data: kcalData, borderColor: chartColors.accent, backgroundColor: chartColors.accent + '1a', fill: true, tension: 0.3, pointRadius: 0, pointHoverRadius: 5 },
                { label: strings.dashboard.ma7, data: ma7, borderColor: chartColors.warning, borderDash: [5, 5], pointRadius: 0, pointHoverRadius: 5, tension: 0.3 },
              ],
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { labels: { color: chartColors.textSecondary, boxWidth: 12, padding: 8 } },
                tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
              },
              scales: {
                y: { beginAtZero: true, ticks: { color: chartColors.textSecondary }, grid: { color: chartColors.grid } },
                x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 10 }, grid: { display: false } },
              },
            },
          });
        }
        const wbCtx = document.getElementById('weekly-balance-chart')?.getContext('2d');
        if (wbCtx) {
          if (window._dashWeeklyChart) window._dashWeeklyChart.destroy();
          const wbLabels = [];
          const wbValues = [];
          weeklyBalances.forEach((b, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - ((11 - i) * 7));
            wbLabels.push(d.toLocaleDateString());
            wbValues.push(b && b.tdee != null ? Math.round(b.tdee - (b.planned_intake || 0)) : null);
          });
          window._dashWeeklyChart = new Chart(wbCtx, {
            type: 'bar',
            data: {
              labels: wbLabels,
              datasets: [{ label: strings.dashboard.avgDay, data: wbValues, backgroundColor: wbValues.map(v => v == null ? chartColors.grid : v >= 0 ? chartColors.accent : chartColors.danger), borderRadius: 4 }],
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { labels: { color: chartColors.textSecondary, boxWidth: 12, padding: 8 } },
                tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
              },
              scales: {
                y: { ticks: { color: chartColors.textSecondary }, grid: { color: chartColors.grid } },
                x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 12 }, grid: { display: false } },
              },
            },
          });
        }
      } else {
        trendRow.style.display = 'none';
      }
    }

    await render();
  } finally {
    window._loadingDashboard = false;
  }
}
