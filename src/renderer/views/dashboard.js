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

export async function init() {
  if (window._loadingDashboard) return;
  window._loadingDashboard = true;
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
    </div>
  `;

  if (!api) {
    document.getElementById('row-metrics').innerHTML = `<div class="dashboard-card"><h3>${strings.dashboard.status}</h3><div class="value">${strings.dashboard.offline}</div><div class="subtitle">${strings.dashboard.offlineSub}</div></div>`;
    window._loadingDashboard = false;
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

    metricsRow.innerHTML = skeletonCard().repeat(7);
    stepsExtrasRow.innerHTML = skeletonCard().repeat(6);
    activityRow.innerHTML = skeletonCard();

    function trendSkeleton() {
      trendRow.style.display = 'block';
      trendRow.innerHTML = skeletonChart();
    }
    trendSkeleton();

    const lastImportPromise = safeCall(api.getLastImportTimestamp(), null).then(data => {
      const updateEl = document.getElementById('last-update');
      if (data) {
        const d = new Date(data);
        updateEl.textContent = `${strings.dashboard.lastUpdate}: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        updateEl.textContent = strings.dashboard.noImportData;
      }
    });

    const appDataPromise = safeCall(api.getDashboardData(), null);
    const healthMetricsPromise = api.getHealthDashboardMetrics(from, to).catch(() => ({ ok: false }));
    const activityKcalPromise = api.getActivityKcalByType(from, to).catch(() => []);
    const sleepDataPromise = api.getSleepData ? api.getSleepData(from, to).catch(() => ({ ok: false, data: [], avg7d: null })) : Promise.resolve({ ok: false, data: [], avg7d: null });
    const weightStatsPromise = api.getWeightStats(from, to).catch(() => ({ first: null, last: null, min: null, max: null, avg: null, trend: null, count: 0 }));
    const healthSummaryPromise = api.getHealthDailySummary ? api.getHealthDailySummary(from, to).catch(() => null) : Promise.resolve(null);

    const steps30Promise = api.getHealthDailySummary ? (() => {
      const now = new Date();
      const d = new Date(now); d.setDate(d.getDate() - 30);
      const stepsFrom = d.toISOString().split('T')[0];
      const stepsTo = now.toISOString().split('T')[0];
      return safeCall(api.getHealthDailySummary(stepsFrom, stepsTo), null);
    })() : Promise.resolve(null);

    const results = await Promise.allSettled([
      appDataPromise,
      healthMetricsPromise,
      weightStatsPromise,
      sleepDataPromise,
      activityKcalPromise,
      healthSummaryPromise,
      steps30Promise,
    ]);

    const appData = results[0].status === 'fulfilled' ? results[0].value : null;
    const healthMetrics = results[1].status === 'fulfilled' && results[1].value?.ok ? results[1].value : { ok: false, data: null };
    const weightStats = results[2].status === 'fulfilled' ? results[2].value : { first: null, last: null, min: null, max: null, avg: null, trend: null, count: 0 };
    const sleepData = results[3].status === 'fulfilled' ? results[3].value : { ok: false, data: [], avg7d: null };
    const activityKcal = results[4].status === 'fulfilled' ? results[4].value : [];
    const healthSummary = results[5].status === 'fulfilled' ? results[5].value : null;
    const steps30Result = results[6].status === 'fulfilled' ? results[6].value : null;

    await lastImportPromise;

    const dailyData = healthSummary?.ok ? healthSummary.data : [];
    const steps30Data = steps30Result?.ok ? steps30Result.data : [];

    const metrics = healthMetrics?.ok ? healthMetrics.data : null;

    // --- Row 1: Core metric cards ---
    const totalSessions = activityKcal.reduce((s, a) => s + a.count, 0);
    const totalKcal = activityKcal.reduce((s, a) => s + a.total_kcal, 0);

    const avgBalance = appData?.weekBalance != null && daysInPeriod > 0
      ? Math.round(appData.weekBalance / daysInPeriod)
      : null;

    // Series para sparklines (filtramos a daysInPeriod más recientes)
    const tail = arr => arr ? arr.slice(-daysInPeriod) : [];
    const sleepSeries = sleepData?.ok && sleepData.data ? tail(sleepData.data).map(d => d.sleep_hours) : [];
    const hrvSeries = metrics?.hrv ? tail(metrics.hrv).map(d => d.hrv_ms) : [];
    const rhrSeries = metrics?.resting_hr ? tail(metrics.resting_hr).map(d => d.rhr_bpm) : [];
    const standSeries = metrics?.standing_hours ? tail(metrics.standing_hours).map(d => d.hours) : [];
    const walkSeries = metrics?.walking_distance ? tail(metrics.walking_distance).map(d => d.km) : [];
    const exerSeries = metrics?.exercise_time ? tail(metrics.exercise_time).map(d => d.minutes) : [];
    const spo2Series = metrics?.spo2 ? tail(metrics.spo2).map(d => d.spo2_percent) : [];
    const stepsSeries = dailyData && dailyData.length ? tail(dailyData).map(d => d.steps) : [];

    // Peso serie (getWeightEntries retorna todos los registros, filtramos al rango)
    let weightSeries = [];
    if (api.getWeightEntries) {
      const allWeight = await safeCall(api.getWeightEntries(), []);
      if (Array.isArray(allWeight)) {
        const fromStr = from, toStr = to;
        weightSeries = allWeight
          .filter(w => w.date >= fromStr && w.date <= toStr)
          .sort((a, b) => a.date < b.date ? -1 : 1)
          .map(w => w.weight_kg);
      }
    }

    // Hero card (firma): anillo de crecimiento + balance semanal grande
    const kcalSeries = dailyData && dailyData.length ? dailyData.map(d => (d.kcal_activas || 0) + (d.kcal_basales || 0)) : [];
    const ringValues = kcalSeries.length ? kcalSeries : [];
    const heroValue = avgBalance != null ? `${avgBalance > 0 ? '+' : ''}${avgBalance}` : '--';
    const heroSub = avgBalance != null
      ? `${strings.dashboard.avgDay} · ${ringValues.length} ${strings.dashboard.days}`
      : strings.dashboard.noBalanceData;

    let weightDisplay = '--';
    let weightTrendSpan = '';
    if (weightStats.last != null) {
      weightDisplay = `${weightStats.last} ${strings.dashboard.unitKg}`;
      if (weightStats.count >= 2 && weightStats.first != null) {
        const variation = (weightStats.last - weightStats.first);
        const sign = variation > 0 ? '+' : '';
        const trendClass = weightStats.trend > 0.01 ? 'trend-up' : weightStats.trend < -0.01 ? 'trend-down' : 'trend-flat';
        const trendIcon = weightStats.trend > 0.01 ? icon('trending-up', 12) : weightStats.trend < -0.01 ? icon('trending-down', 12) : icon('minus', 12);
        weightTrendSpan = `<span class="metric-trend ${trendClass}">${sign}${variation.toFixed(1)} ${strings.dashboard.unitKg} ${trendIcon}</span>`;
      }
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

    let standDisplay = '--', standCompliance = '';
    if (metrics?.standing_hours?.length) {
      const avgStand = metrics.standing_hours.reduce((s, d) => s + d.hours, 0) / metrics.standing_hours.length;
      standDisplay = `${avgStand.toFixed(1)} ${strings.dashboard.unitH}`;
      standCompliance = avgStand >= 8
        ? `<span class="compliance-ok">${icon('check', 11)} ${strings.dashboard.standingCompliant}</span>`
        : `<span class="compliance-warn">${strings.dashboard.standingBelow}</span>`;
    }

    let walkDisplay = '--';
    if (metrics?.walking_distance?.length) {
      const avgWalk = metrics.walking_distance.reduce((s, d) => s + d.km, 0) / metrics.walking_distance.length;
      walkDisplay = `${avgWalk.toFixed(2)} ${strings.dashboard.unitKm}`;
    }

    let sleepDisplay = '--', sleepCompliance = '';
    if (sleepData?.ok && sleepData.data?.length) {
      const avgSleep = sleepData.data.reduce((s, d) => s + d.sleep_hours, 0) / sleepData.data.length;
      sleepDisplay = `${avgSleep.toFixed(1)} ${strings.dashboard.unitH}`;
      if (sleepData.avg7d) {
        sleepDisplay += ` <span class="text-xs text-muted">(${strings.dashboard.sleepAvg7d}: ${sleepData.avg7d.toFixed(1)}${strings.dashboard.unitH})</span>`;
      }
      sleepCompliance = (avgSleep >= 7 && avgSleep <= 9)
        ? `<span class="compliance-ok">${icon('check', 11)} ${strings.dashboard.sleepOptimal}</span>`
        : `<span class="compliance-warn">${strings.dashboard.sleepAdjust}</span>`;
    }

    let balanceDetail = '';
    if (appData?.weekBalance != null) {
      balanceDetail = `<span class="text-xs text-muted">${strings.dashboard.avgDay}</span>`;
    }

    const coreCards = [
      { title: strings.dashboard.sessionCount, value: `${totalSessions}`, subtitle: `${totalKcal.toLocaleString()} ${strings.dashboard.kcalTotal}` },
      { title: strings.dashboard.weekBalance, value: avgBalance != null ? `${avgBalance > 0 ? '+' : ''}${avgBalance} kcal` : '--', subtitle: balanceDetail },
      { title: strings.dashboard.latestWeight, valueHtml: `${weightDisplay} ${weightTrendSpan}`, spark: weightSeries, sparkColor: 'var(--moss)' },
      { title: strings.dashboard.hrvComposite, valueHtml: `<span>${strings.dashboard.hrvLabel}: ${hrvDisplay}</span><br><span class="metric-value-sm">${strings.dashboard.restingHr}: ${rhrDisplay}</span>${hrvTrend ? `<br>${hrvTrend}` : ''}`, spark: hrvSeries, sparkColor: 'var(--moss)' },
      { title: strings.dashboard.standingHours, value: standDisplay, subtitle: standCompliance, spark: standSeries, sparkColor: 'var(--moss)' },
      { title: strings.dashboard.walkingDistance, value: walkDisplay, subtitle: strings.dashboard.avgDay, spark: walkSeries, sparkColor: 'var(--moss)' },
      { title: strings.dashboard.sleepTitle, valueHtml: sleepDisplay, subtitle: sleepCompliance, spark: sleepSeries, sparkColor: 'var(--moss)' },
    ];

    const compact = ringValues.length === 0;
    const heroHtml = `
      <div class="card-hero${compact ? ' card-hero--compact' : ''}">
        ${compact ? '' : `<div class="hero-ring-wrap">
          ${growthRing(ringValues)}
        </div>`}
        <div class="hero-text">
          <div class="hero-eyebrow">${strings.dashboard.weekBalance}</div>
          <div><span class="hero-value">${heroValue}</span><span class="hero-unit">kcal</span></div>
          <div class="hero-sub">${heroSub}</div>
          ${compact ? '' : `<div class="hero-legend">
            <span><span class="legend-dot moss"></span>${strings.dashboard.surplus}</span>
            <span><span class="legend-dot ember"></span>${strings.dashboard.deficit}</span>
          </div>`}
        </div>
      </div>`;

    metricsRow.innerHTML = heroHtml + coreCards.map(c => `
      <div class="dashboard-card">
        <h3>${c.title}</h3>
        <div class="value">${c.valueHtml || c.value || '--'}</div>
        ${c.spark && c.spark.length >= 2 ? sparkline(c.spark, { stroke: c.sparkColor }) : ''}
        ${c.subtitle ? `<div class="subtitle">${c.subtitle}</div>` : ''}
      </div>
    `).join('');

    // --- Row 2: Activity per-sport ---
    if (activityKcal && activityKcal.length > 0) {
      const sorted = [...activityKcal].sort((a, b) => b.count - a.count);
      const avgKcalSession = totalSessions > 0 ? Math.round(totalKcal / totalSessions) : 0;
      const uniqueTypes = activityKcal.length;

      activityRow.innerHTML = `
        <div class="dashboard-card card-accent">
          <h3>${strings.dashboard.activitySummary}</h3>
          <div class="flex-gap-md" style="margin-top:var(--space-1)">
            <div><span class="value" style="color:#fff;font-size:20px">${totalSessions}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.sessionCount}</div></div>
            <div><span class="value" style="color:#fff;font-size:20px">${totalKcal.toLocaleString()}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.kcalTotal}</div></div>
            <div><span class="value" style="color:#fff;font-size:20px">${uniqueTypes}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.uniqueTypes}</div></div>
            <div><span class="value" style="color:#fff;font-size:20px">${avgKcalSession}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.kcalPerSession}</div></div>
          </div>
        </div>` +
        sorted.map(a => `<div class="dashboard-card">
            <h3>${sportIcon(a.sport_type, 14)} ${getSportDisplayName(a.sport_type)}</h3>
            <div class="value">${a.total_kcal.toLocaleString()} kcal</div>
            <div class="subtitle">${a.count} ${strings.dashboard.sessions} · ${a.avg_kcal} ${strings.dashboard.avgKcal}</div>
          </div>`).join('');
    } else {
      activityRow.innerHTML = `<div class="dashboard-card" style="grid-column:1/-1;text-align:center;color:var(--text-secondary)"><p>${strings.dashboard.noActivityData}</p></div>`;
    }

    // --- Row 3: Steps + extra health metrics ---
    const steps7d = steps30Data.length >= 7 ? Math.round(steps30Data.slice(-7).reduce((a, d) => a + d.steps, 0) / 7) : null;
    const steps15d = steps30Data.length >= 15 ? Math.round(steps30Data.slice(-15).reduce((a, d) => a + d.steps, 0) / 15) : null;
    const steps1m = steps30Data.length ? Math.round(steps30Data.reduce((a, d) => a + d.steps, 0) / steps30Data.length) : null;

    let exerciseDisplay = '--', exerciseCompliance = '';
    if (metrics?.exercise_time?.length) {
      const avgEx = metrics.exercise_time.reduce((s, d) => s + d.minutes, 0) / metrics.exercise_time.length;
      exerciseDisplay = `${avgEx.toFixed(0)} ${strings.dashboard.unitMin}`;
      exerciseCompliance = avgEx >= 30
        ? `<span class="compliance-ok">${icon('check', 11)} ${strings.dashboard.exerciseCompliant}</span>`
        : `<span class="compliance-warn">${strings.dashboard.exerciseBelow}</span>`;
    }

    let spo2Display = '--', spo2Compliance = '';
    if (metrics?.spo2?.length) {
      const latestSpO2 = metrics.spo2[0].spo2_percent;
      spo2Display = `${latestSpO2}${strings.dashboard.unitPercent}`;
      spo2Compliance = latestSpO2 >= 95
        ? `<span class="compliance-ok">${icon('check', 11)} ${strings.dashboard.spo2Normal}</span>`
        : `<span class="compliance-warn">${strings.dashboard.spo2Low}</span>`;
    }

    const bpHasData = metrics?.blood_pressure?.length > 0;
    const bpDisplay = bpHasData ? `${metrics.blood_pressure[0].systolic}/${metrics.blood_pressure[0].diastolic}` : strings.dashboard.bpEmpty;
    const bpNote = bpHasData ? '' : `<span class="text-xs text-muted">${strings.dashboard.bpExternalNote}</span>`;

    stepsExtrasRow.innerHTML = `
      <div class="dashboard-card">
        <h3>${strings.dashboard.dailySteps}</h3>
        <div class="value">${stepsSeries.length ? stepsSeries[stepsSeries.length - 1].toLocaleString() : '--'}</div>
        ${sparkline(stepsSeries, { stroke: 'var(--moss)' })}
        <div class="subtitle">${strings.dashboard.avgDay}: ${steps7d?.toLocaleString() || '--'} · 15d ${steps15d?.toLocaleString() || '--'} · 1m ${steps1m?.toLocaleString() || '--'}</div>
      </div>
      <div class="dashboard-card">
        <h3>${strings.dashboard.exerciseTime}</h3>
        <div class="value">${exerciseDisplay}</div>
        ${sparkline(exerSeries, { stroke: 'var(--moss)' })}
        <div class="subtitle">${exerciseCompliance || strings.dashboard.avgDay}</div>
      </div>
      <div class="dashboard-card">
        <h3>${strings.dashboard.restingHr}</h3>
        <div class="value">${rhrSeries.length ? rhrSeries[rhrSeries.length - 1].toLocaleString() + ' ' + strings.dashboard.unitBpm : '--'}</div>
        ${sparkline(rhrSeries, { stroke: 'var(--moss)' })}
        <div class="subtitle">${strings.dashboard.avgDay}</div>
      </div>
      <div class="dashboard-card">
        <h3>${strings.dashboard.spo2}</h3>
        <div class="value">${spo2Display}</div>
        ${sparkline(spo2Series, { stroke: 'var(--moss)' })}
        <div class="subtitle">${spo2Compliance || strings.dashboard.lastUpdate}</div>
      </div>
      <div class="dashboard-card" style="opacity:0.75">
        <h3>${strings.dashboard.bloodPressure}</h3>
        <div class="value">${bpDisplay}</div>
        <div class="subtitle">${bpNote || strings.dashboard.lastUpdate}</div>
      </div>
    `;

    // --- Row 4: Trend chart ---
    if (dailyData.length > 1) {
      trendRow.style.display = 'block';
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
    } else {
      trendRow.style.display = 'none';
    }
  }

  await render();
  window._loadingDashboard = false;
}
