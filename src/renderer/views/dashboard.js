import { strings, getSportDisplayName } from '../locales/es.js';
import { sportIcon } from '../utils/sport-icons.js';
import { icon } from '../utils/icons.js';
import { chartColors } from '../utils/chart-theme.js';
import { skeletonCard, skeletonChart } from '../utils/skeleton.js';
import { getRangeDates } from '../utils/date-range.js';
import Chart from 'chart.js/auto';
import { safeCall } from '../utils/safe-call.js';
import { sparkline } from '../utils/sparkline.js';
import { growthRing } from '../utils/growth-ring.js';
import { renderStateCard } from '../utils/state-card.js';
import { getTrendArrow, trendBadge } from '../utils/trend-arrow.js';

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
      <div class="dashboard-grid" id="row-metrics" aria-live="polite"></div>
      <div class="dashboard-grid" id="row-activity" aria-live="polite" style="margin-top:var(--space-4)"></div>
      <div class="dashboard-grid" id="row-steps-extras" aria-live="polite"></div>
      <div class="dashboard-chart-row" id="row-trend" style="margin-top:var(--space-4);display:none">
        <div class="card"><h3 class="text-sm" style="margin-bottom:var(--space-2)">${strings.dashboard.kcalDaily}</h3><div class="chart-container" style="height:200px"><canvas id="trend-chart"></canvas></div></div>
        <div class="card"><h3 class="text-sm" style="margin-bottom:var(--space-2)">${strings.dashboard.weeklyBalanceTrend}</h3><div class="chart-container" style="height:200px"><canvas id="weekly-balance-chart"></canvas></div></div>
      </div>
    `;

    if (!api) {
      document.getElementById('row-metrics').innerHTML = `<div class="dashboard-card"><h3>${strings.dashboard.status}</h3><div class="value">${strings.dashboard.offline}</div><div class="subtitle">${strings.dashboard.offlineSub}</div></div>`;
      return;
    }

    document.querySelectorAll('#dashboard-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _range = btn.dataset.range;
        document.querySelectorAll('#dashboard-filters .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.range === _range));
        render();
      });
    });

    async function render() {
      const metricsRow = document.getElementById('row-metrics');
      const stepsExtrasRow = document.getElementById('row-steps-extras');
      const activityRow = document.getElementById('row-activity');
      const trendRow = document.getElementById('row-trend');
      const { from, to } = getRangeDates(_range);
      const daysInPeriod = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;

      metricsRow.innerHTML = skeletonCard().repeat(8);
      stepsExtrasRow.innerHTML = skeletonCard().repeat(5);
      activityRow.innerHTML = skeletonCard();

      trendRow.style.display = 'block';
      trendRow.innerHTML = skeletonChart();

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
        ...weeklyBalancePromises,
      ]);

      const appData = results[0].status === 'fulfilled' ? results[0].value : null;
      const healthMetrics = results[1].status === 'fulfilled' && results[1].value?.ok ? results[1].value : { ok: false, data: null };
      const sportSummary = results[2].status === 'fulfilled' ? results[2].value : [];
      const sleepData = results[3].status === 'fulfilled' ? results[3].value : { ok: false, dailySeries: [], trendArrow: null, consistency: null, totalAvg: null, deepAvg: null, remAvg: null, lightAvg: null };
      const weightStats = results[4].status === 'fulfilled' ? results[4].value : { first: null, last: null, min: null, max: null, avg: null, trend: null, count: 0 };
      const healthSummary = results[5].status === 'fulfilled' ? results[5].value : null;
      const cyclingResult = results[6].status === 'fulfilled' ? results[6].value : { ok: false, data: [] };
      const workoutsResult = results[7].status === 'fulfilled' ? results[7].value : { ok: false, data: [] };
      const weeklyBalances = results.slice(8).map(r => r.status === 'fulfilled' ? r.value : null);

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
      if (appData?.measurementDelta != null) {
        const md = appData.measurementDelta;
        const sign = md > 0 ? '+' : '';
        infoItems.push(`<span class="text-xs text-muted">${strings.dashboard.measurementDeltaLabel}: <strong>${sign}${md.toFixed(1)} ${strings.dashboard.unitKg}</strong></span>`);
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
          hrvDisplay = `${latestHrv} ${strings.dashboard.unitMs}`;
          hrvTrend = `<span class="text-xs text-muted">${strings.dashboard.avg7d}: ${avgHrv} ${strings.dashboard.unitMs}</span>`;
        }
        if (rhrData.length > 0) {
          const latestRhr = rhrData[rhrData.length - 1].rhr_bpm;
          rhrDisplay = `${Math.round(latestRhr)} ${strings.dashboard.unitBpm}`;
        }
      }

      let walkDisplay = '--', walkTotal = 0;
      if (metrics?.walking_distance?.length) {
        const avgWalk = metrics.walking_distance.reduce((s, d) => s + d.km, 0) / metrics.walking_distance.length;
        walkTotal = metrics.walking_distance.reduce((s, d) => s + d.km, 0);
        walkDisplay = `${avgWalk.toFixed(2)} ${strings.dashboard.unitKm}`;
      }

      let sleepDisplay = '--', sleepCompliance = '', sleepPhasesBar = '', sleepConsistencyBadge = '';
      if (sleepData?.ok && sleepData.dailySeries?.length) {
        const avgSleep = sleepData.dailySeries.reduce((s, d) => s + d.sleep_hours, 0) / sleepData.dailySeries.length;
        sleepDisplay = `${avgSleep.toFixed(1)} ${strings.dashboard.unitH}`;
        sleepCompliance = (avgSleep >= 7 && avgSleep <= 9)
          ? `<span class="compliance-ok">${icon('check', 11)} ${strings.dashboard.sleepOptimal}</span>`
          : `<span class="compliance-warn">${strings.dashboard.sleepAdjust}</span>`;
        if (sleepData.deepAvg != null && sleepData.remAvg != null && sleepData.lightAvg != null) {
          const phaseTotal = sleepData.deepAvg + sleepData.remAvg + sleepData.lightAvg || 1;
          const dp = (sleepData.deepAvg / phaseTotal * 100).toFixed(1);
          const rp = (sleepData.remAvg / phaseTotal * 100).toFixed(1);
          const lp = (sleepData.lightAvg / phaseTotal * 100).toFixed(1);
          sleepPhasesBar = `<div class="flex-gap-md" style="margin-top:var(--space-1)">
            <div><span class="legend-dot moss"></span><span class="text-xs">${strings.sleep.deep} ${sleepData.deepAvg.toFixed(1)}${strings.dashboard.unitH} (${dp}%)</span></div>
            <div><span class="legend-dot ember"></span><span class="text-xs">${strings.sleep.rem} ${sleepData.remAvg.toFixed(1)}${strings.dashboard.unitH} (${rp}%)</span></div>
            <div><span class="legend-dot moss-mist"></span><span class="text-xs">${strings.sleep.light} ${sleepData.lightAvg.toFixed(1)}${strings.dashboard.unitH} (${lp}%)</span></div>
          </div>`;
        }
        if (sleepData.consistency != null) {
          const label = sleepData.consistency >= 75 ? strings.sleep.consistent : sleepData.consistency >= 50 ? strings.sleep.irregular : strings.sleep.veryIrregular;
          sleepConsistencyBadge = `<span class="text-xs text-muted">${strings.sleep.consistency}: <strong>${Math.round(sleepData.consistency)}%</strong> · ${label}${trendBadge(sleepSeries)}</span>`;
        }
      }

      const cyclingDisplay = cyclingSeries.length ? `${cyclingAvg.toFixed(2)} ${strings.dashboard.unitKm}` : strings.dashboard.noData;
      const cyclingSubtitle = cyclingSeries.length
        ? `${strings.dashboard.kmPerDay} · ${strings.dashboard.totalKm}: ${cyclingTotal.toFixed(1)} ${strings.dashboard.unitKm}`
        : strings.dashboard.noCyclingData;

      let balanceDetail = '';
      if (appData?.weekBalance != null) {
        balanceDetail = `<span class="text-xs text-muted">${strings.dashboard.avgDay}</span>`;
      }

      const coreCards = [
        { title: strings.dashboard.sessionCount, value: `${totalSessions}`, subtitle: `${totalKcal.toLocaleString()} ${strings.dashboard.kcalTotal} · ${totalDuration ? (totalDuration / 60).toFixed(1) + ' ' + strings.dashboard.trainingHours : ''}`, spark: null },
        { title: strings.dashboard.weekBalance, value: avgBalance != null ? `${avgBalance > 0 ? '+' : ''}${avgBalance} kcal` : strings.dashboard.noData, subtitle: balanceDetail },
        { title: strings.dashboard.hrvComposite, valueHtml: `<span>${strings.dashboard.hrvLabel}: ${hrvDisplay}</span><br><span class="metric-value-sm">${strings.dashboard.restingHr}: ${rhrDisplay}</span>${hrvTrend ? `<br>${hrvTrend}` : ''}`, spark: hrvSeries, sparkColor: 'var(--moss)' },
        { title: strings.dashboard.walkingDistance, value: walkDisplay, subtitle: `${strings.dashboard.avgDay}${walkTotal ? ' · ' + strings.dashboard.totalKm + ': ' + walkTotal.toFixed(1) + ' ' + strings.dashboard.unitKm : ''}`, spark: walkSeries, sparkColor: 'var(--moss)' },
        { title: strings.dashboard.sleepTitle, valueHtml: sleepDisplay, subtitle: `${sleepPhasesBar}${sleepConsistencyBadge}${sleepCompliance}`, spark: sleepSeries, sparkColor: 'var(--moss)' },
        { title: strings.dashboard.cyclingDistance, value: cyclingDisplay, subtitle: cyclingSubtitle, spark: cyclingSeries, sparkColor: 'var(--moss)' },
      ];

      const compact = ringValues.length === 0;
      let heroSubline = heroSub;
      if (infoItems.length) {
        heroSubline += `<div class="flex-gap-md" style="margin-top:var(--space-1)">${infoItems.join('')}</div>`;
      }
      const heroHtml = `
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

      const accentHtml = `
        <div class="dashboard-card card-accent">
          <h3>${strings.dashboard.activitySummary}</h3>
          <div class="flex-gap-md" style="margin-top:var(--space-1)">
            <div><span class="value" style="color:#fff;font-size:20px">${totalSessions}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.sessionCount}</div></div>
            <div><span class="value" style="color:#fff;font-size:20px">${totalKcal.toLocaleString()}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.kcalTotal}</div></div>
            <div><span class="value" style="color:#fff;font-size:20px">${sportSummary.length}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.uniqueTypes}</div></div>
            <div><span class="value" style="color:#fff;font-size:20px">${totalSessions > 0 ? Math.round(totalKcal / totalSessions) : 0}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.kcalPerSession}</div></div>
          </div>
        </div>`;

      metricsRow.innerHTML = heroHtml + accentHtml + coreCards.map(c => `
        <div class="dashboard-card">
          <h3>${c.title}${trendBadge(c.spark)}</h3>
          <div class="value">${c.valueHtml || c.value || strings.dashboard.noData}</div>
          ${c.spark && c.spark.length >= 2 ? sparkline(c.spark, { stroke: c.sparkColor }) : ''}
          ${c.subtitle ? `<div class="subtitle">${c.subtitle}</div>` : ''}
        </div>
      `).join('');

      if (results[0].status === 'rejected') {
        const heroCard = metricsRow.querySelector('.card-hero');
        if (heroCard) {
          const wrapper = document.createElement('div');
          heroCard.replaceWith(wrapper);
          renderStateCard(wrapper, { title: strings.dashboard.weekBalance, state: 'error', subtitle: strings.states.errorLoading, onRetry: render });
        }
      }

      if (sportSummary && sportSummary.length > 0) {
        const sorted = [...sportSummary].sort((a, b) => b.count - a.count);
        activityRow.innerHTML = sorted.map(a => {
          const extra = sportExtra[a.sport_type] || { km: 0, minutes: 0, kcal: 0 };
          const extras = [];
          if (a.sport_type === 'walking' && extra.km) {
            extras.push(`${strings.dashboard.totalKm}: ${extra.km.toFixed(1)} ${strings.dashboard.unitKm}`);
          }
          if (a.sport_type === 'cycling' && extra.km) {
            extras.push(`${strings.dashboard.totalKm}: ${extra.km.toFixed(1)} ${strings.dashboard.unitKm}`);
          }
          if (a.sport_type === 'football' && extra.km) {
            extras.push(`${strings.dashboard.kmCovered}: ${extra.km.toFixed(1)} ${strings.dashboard.unitKm}`);
          }
          if ((a.sport_type === 'HIIT' || a.sport_type === 'boxing') && extra.minutes > 0) {
            const perMin = (extra.kcal / extra.minutes).toFixed(1);
            extras.push(`${strings.dashboard.kcalPerMin}: ${perMin}`);
          }
          const sub = `${a.count} ${strings.dashboard.sessions} · ${a.avg_kcal} ${strings.dashboard.avgKcal}${extras.length ? ' · ' + extras.join(' · ') : ''}`;
          return `<div class="dashboard-card">
            <h3>${sportIcon(a.sport_type, 14)} ${getSportDisplayName(a.sport_type)}</h3>
            <div class="value">${a.total_kcal.toLocaleString()} kcal</div>
            <div class="subtitle">${sub}</div>
          </div>`;
        }).join('');
      } else {
        activityRow.innerHTML = `<div class="dashboard-card" style="grid-column:1/-1;text-align:center;color:var(--text-secondary)"><p>${strings.dashboard.noActivityData}</p></div>`;
      }

      const steps7d = stepsSeries.length >= 7 ? Math.round(stepsSeries.slice(-7).reduce((a, v) => a + v, 0) / 7) : null;
      const steps15d = stepsSeries.length >= 15 ? Math.round(stepsSeries.slice(-15).reduce((a, v) => a + v, 0) / 15) : null;
      const steps1m = stepsSeries.length ? Math.round(stepsSeries.reduce((a, v) => a + v, 0) / stepsSeries.length) : null;

      let exerciseDisplay = '--', exerciseCompliance = '';
      if (metrics?.exercise_time?.length) {
        const avgEx = metrics.exercise_time.reduce((s, d) => s + d.minutes, 0) / metrics.exercise_time.length;
        exerciseDisplay = `${avgEx.toFixed(0)} ${strings.dashboard.unitMin}`;
        exerciseCompliance = avgEx >= 30
          ? `<span class="compliance-ok">${icon('check', 11)} ${strings.dashboard.exerciseCompliant}</span>`
          : `<span class="compliance-warn">${strings.dashboard.exerciseBelow}</span>`;
      }

      const todayCaloriesHtml = appData?.todayCalories != null
        ? `${Math.round(appData.todayCalories).toLocaleString()} kcal`
        : strings.dashboard.noData;
      const measurementDeltaHtml = appData?.measurementDelta != null
        ? `${appData.measurementDelta > 0 ? '+' : ''}${appData.measurementDelta.toFixed(1)} ${strings.dashboard.unitKg}`
        : strings.dashboard.noData;
      const nextWorkoutHtml = appData?.nextWorkout
        ? new Date(appData.nextWorkout).toLocaleDateString()
        : strings.dashboard.noData;

      stepsExtrasRow.innerHTML = `
        <div class="dashboard-card">
          <h3>${strings.dashboard.dailySteps}${trendBadge(stepsSeries)}</h3>
          <div class="value">${stepsSeries.length ? stepsSeries[stepsSeries.length - 1].toLocaleString() : strings.dashboard.noData}</div>
          ${sparkline(stepsSeries, { stroke: 'var(--moss)' })}
          <div class="subtitle">${strings.dashboard.avgDay}: ${steps7d?.toLocaleString() || strings.dashboard.noData} · ${strings.dashboard.steps15d} ${steps15d?.toLocaleString() || strings.dashboard.noData} · ${strings.dashboard.steps1m} ${steps1m?.toLocaleString() || strings.dashboard.noData}</div>
        </div>
        <div class="dashboard-card">
          <h3>${strings.dashboard.exerciseTime}${trendBadge(exerSeries)}</h3>
          <div class="value">${exerciseDisplay}</div>
          ${sparkline(exerSeries, { stroke: 'var(--moss)' })}
          <div class="subtitle">${exerciseCompliance || strings.dashboard.avgDay}</div>
        </div>
        <div class="dashboard-card">
          <h3>${strings.dashboard.todayCalories}</h3>
          <div class="value">${todayCaloriesHtml}</div>
          <div class="subtitle">${strings.dashboard.plannedIntakeLabel}</div>
        </div>
        <div class="dashboard-card">
          <h3>${strings.dashboard.measurementDeltaLabel}</h3>
          <div class="value">${measurementDeltaHtml}</div>
          <div class="subtitle">${strings.dashboard.sinceLastMeasurement}</div>
        </div>
        <div class="dashboard-card">
          <h3>${strings.dashboard.nextWorkoutLabel}</h3>
          <div class="value">${nextWorkoutHtml}</div>
          <div class="subtitle">${strings.dashboard.plannedTraining}</div>
        </div>
      `;

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