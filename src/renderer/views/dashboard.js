import { strings, getSportDisplayName } from '../locales/es.js';
import { SPORT_ICONS } from '../utils/sport-icons.js';
import { getRangeDates } from '../utils/date-range.js';
import Chart from 'chart.js/auto';
import { safeCall } from '../utils/safe-call.js';

export async function init() {
  if (window._loadingDashboard) return;
  window._loadingDashboard = true;
  const container = document.getElementById('view-dashboard');
  const api = window.electronAPI;

  let _range = '7d';

  container.innerHTML = `
    <h2 class="view-title">${strings.dashboard.title}</h2>
    <div class="analytics-filters" id="dashboard-filters">
      <button class="filter-btn active" data-range="7d">${strings.dashboard.dateRange7d}</button>
      <button class="filter-btn" data-range="15d">${strings.dashboard.dateRange15d}</button>
      <button class="filter-btn" data-range="1m">${strings.dashboard.dateRange1m}</button>
    </div>
    <div id="last-update" style="font-size:12px;color:var(--text-secondary);margin-bottom:12px"></div>
    <div class="dashboard-grid" id="row-metrics"></div>
    <div class="dashboard-grid" id="row-steps-extras"></div>
    <div class="dashboard-chart-row" id="row-trend" style="margin-top:16px;display:none">
      <div class="card"><h3 style="font-size:14px;margin-bottom:8px">${strings.dashboard.kcalDaily}</h3><div class="chart-container" style="height:200px"><canvas id="trend-chart"></canvas></div></div>
    </div>
    <div class="dashboard-grid" id="row-activity" style="margin-top:16px"></div>
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

    const [appData, healthMetrics, activityKcal, lastImport, sleepData] = await Promise.all([
      safeCall(api.getDashboardData(), null),
      api.getHealthDashboardMetrics(from, to).catch(() => ({ ok: false })),
      api.getActivityKcalByType(from, to).catch(() => []),
      api.getLastImportTimestamp().catch(() => null),
      api.getSleepData ? api.getSleepData(from, to).catch(() => ({ ok: false, data: [], avg7d: null })) : { ok: false, data: [], avg7d: null },
    ]);

    const [weightStats, healthSummary] = await Promise.all([
      api.getWeightStats(from, to).catch(() => ({ first: null, last: null, min: null, max: null, avg: null, trend: null, count: 0 })),
      api.getHealthDailySummary ? api.getHealthDailySummary(from, to).catch(() => null) : null,
    ]);

    const dailyData = healthSummary?.ok ? healthSummary.data : [];

    // Last update display
    const updateEl = document.getElementById('last-update');
    if (lastImport) {
      const d = new Date(lastImport);
      updateEl.textContent = `${strings.dashboard.lastUpdate}: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      updateEl.textContent = strings.dashboard.noImportData;
    }

    const metrics = healthMetrics?.ok ? healthMetrics.data : null;

    // --- Row 1: 6 core metric cards ---

    // Sessions count
    const totalSessions = activityKcal.reduce((s, a) => s + a.count, 0);
    const totalKcal = activityKcal.reduce((s, a) => s + a.total_kcal, 0);

    // Weekly balance as avg/day
    const avgBalance = appData?.weekBalance != null && daysInPeriod > 0
      ? Math.round(appData.weekBalance / daysInPeriod)
      : null;

    // Weight variation
    let weightDisplay = '--';
    let weightTrendSpan = '';
    if (weightStats.last != null) {
      weightDisplay = `${weightStats.last} ${strings.dashboard.unitKg}`;
      if (weightStats.count >= 2 && weightStats.first != null) {
        const variation = (weightStats.last - weightStats.first);
        const sign = variation > 0 ? '+' : '';
        const arrow = weightStats.trend > 0.01 ? strings.dashboard.trendUp : weightStats.trend < -0.01 ? strings.dashboard.trendDown : strings.dashboard.trendFlat;
        const arrowColor = weightStats.trend > 0.01 ? 'var(--danger)' : weightStats.trend < -0.01 ? 'var(--success)' : 'var(--text-secondary)';
        weightTrendSpan = `<span style="font-size:12px;color:${arrowColor};margin-left:4px">${sign}${variation.toFixed(1)} ${strings.dashboard.unitKg} ${arrow}</span>`;
      }
    }

    // HRV + resting HR composite
    let hrvDisplay = '--', rhrDisplay = '--', hrvTrend = '';
    if (metrics) {
      const hrvData = metrics.hrv || [];
      const rhrData = metrics.resting_hr || [];
      if (hrvData.length > 0) {
        const latestHrv = hrvData[hrvData.length - 1].hrv_ms;
        const avgHrv = (hrvData.reduce((s, d) => s + d.hrv_ms, 0) / hrvData.length).toFixed(1);
        hrvDisplay = `${latestHrv} ${strings.dashboard.unitMs}`;
        hrvTrend = `<span style="font-size:11px;color:var(--text-secondary)">${strings.dashboard.avg7d}: ${avgHrv} ${strings.dashboard.unitMs}</span>`;
      }
      if (rhrData.length > 0) {
        const latestRhr = rhrData[rhrData.length - 1].rhr_bpm;
        const avgRhr = (rhrData.reduce((s, d) => s + d.rhr_bpm, 0) / rhrData.length).toFixed(1);
        rhrDisplay = `${Math.round(latestRhr)} ${strings.dashboard.unitBpm}`;
      }
    }

    // Standing hours
    let standDisplay = '--', standCompliance = '';
    if (metrics?.standing_hours?.length) {
      const avgStand = metrics.standing_hours.reduce((s, d) => s + d.hours, 0) / metrics.standing_hours.length;
      standDisplay = `${avgStand.toFixed(1)} ${strings.dashboard.unitH}`;
      standCompliance = avgStand >= 8 ? `<span style="font-size:11px;color:var(--success)">✓ ${strings.dashboard.standingCompliant}</span>` : `<span style="font-size:11px;color:var(--warning)">${strings.dashboard.standingBelow}</span>`;
    }

    // Walking distance
    let walkDisplay = '--';
    if (metrics?.walking_distance?.length) {
      const avgWalk = metrics.walking_distance.reduce((s, d) => s + d.km, 0) / metrics.walking_distance.length;
      walkDisplay = `${avgWalk.toFixed(2)} ${strings.dashboard.unitKm}`;
    }

    // Sleep
    let sleepDisplay = '--', sleepCompliance = '';
    if (sleepData?.ok && sleepData.data?.length) {
      const avgSleep = sleepData.data.reduce((s, d) => s + d.sleep_hours, 0) / sleepData.data.length;
      sleepDisplay = `${avgSleep.toFixed(1)} ${strings.dashboard.unitH}`;
      if (sleepData.avg7d) {
        sleepDisplay += ` <span style="font-size:11px;color:var(--text-secondary)">(${strings.dashboard.sleepAvg7d}: ${sleepData.avg7d.toFixed(1)}${strings.dashboard.unitH})</span>`;
      }
      sleepCompliance = (avgSleep >= 7 && avgSleep <= 9)
        ? `<span style="font-size:11px;color:var(--success)">✓ ${strings.dashboard.sleepOptimal}</span>`
        : `<span style="font-size:11px;color:var(--warning)">${strings.dashboard.sleepAdjust}</span>`;
    }

    // Balance split: basal vs activity + diet target
    let balanceDetail = '';
    if (appData?.weekBalance != null) {
      balanceDetail = `<span style="font-size:11px;color:var(--text-secondary)">${strings.dashboard.avgDay}</span>`;
    }

    const coreCards = [
      { title: strings.dashboard.sessionCount, value: `${totalSessions}`, subtitle: `${totalKcal.toLocaleString()} ${strings.dashboard.kcalTotal}` },
      { title: strings.dashboard.weekBalance, value: avgBalance != null ? `${avgBalance > 0 ? '+' : ''}${avgBalance} kcal` : '--', subtitle: balanceDetail },
      { title: strings.dashboard.latestWeight, valueHtml: `${weightDisplay} ${weightTrendSpan}` },
      { title: strings.dashboard.hrvComposite, valueHtml: `<span>${strings.dashboard.hrvLabel}: ${hrvDisplay}</span><br><span style="font-size:12px">${strings.dashboard.restingHr}: ${rhrDisplay}</span>${hrvTrend ? `<br>${hrvTrend}` : ''}` },
      { title: strings.dashboard.standingHours, value: standDisplay, subtitle: standCompliance },
      { title: strings.dashboard.walkingDistance, value: walkDisplay, subtitle: strings.dashboard.avgDay },
      { title: strings.dashboard.sleepTitle, valueHtml: sleepDisplay, subtitle: sleepCompliance },
    ];

    metricsRow.innerHTML = coreCards.map(c => `
      <div class="dashboard-card">
        <h3>${c.title}</h3>
        <div class="value">${c.valueHtml || c.value || '--'}</div>
        ${c.subtitle ? `<div class="subtitle">${c.subtitle}</div>` : ''}
      </div>
    `).join('');

    // --- Row 2: Steps period cards + extra health metrics ---

    // Steps averages over correct sub-ranges
    const steps7dData = dailyData.slice(-7);
    const steps15dData = dailyData.slice(-15);
    const steps7d = steps7dData.length ? Math.round(steps7dData.reduce((a, d) => a + d.steps, 0) / steps7dData.length) : null;
    const steps15d = steps15dData.length ? Math.round(steps15dData.reduce((a, d) => a + d.steps, 0) / steps15dData.length) : null;
    const steps1m = dailyData.length ? Math.round(dailyData.reduce((a, d) => a + d.steps, 0) / dailyData.length) : null;

    // Exercise time
    let exerciseDisplay = '--', exerciseCompliance = '';
    if (metrics?.exercise_time?.length) {
      const avgEx = metrics.exercise_time.reduce((s, d) => s + d.minutes, 0) / metrics.exercise_time.length;
      exerciseDisplay = `${avgEx.toFixed(0)} ${strings.dashboard.unitMin}`;
      exerciseCompliance = avgEx >= 30 ? `<span style="font-size:11px;color:var(--success)">✓ ${strings.dashboard.exerciseCompliant}</span>` : `<span style="font-size:11px;color:var(--warning)">${strings.dashboard.exerciseBelow}</span>`;
    }

    // SpO2
    let spo2Display = '--', spo2Compliance = '';
    if (metrics?.spo2?.length) {
      const latestSpO2 = metrics.spo2[0].spo2_percent;
      spo2Display = `${latestSpO2}${strings.dashboard.unitPercent}`;
      spo2Compliance = latestSpO2 >= 95 ? `<span style="font-size:11px;color:var(--success)">✓ ${strings.dashboard.spo2Normal}</span>` : `<span style="font-size:11px;color:var(--warning)">${strings.dashboard.spo2Low}</span>`;
    }

    // Blood pressure (always empty)
    const bpHasData = metrics?.blood_pressure?.length > 0;
    const bpDisplay = bpHasData ? `${metrics.blood_pressure[0].systolic}/${metrics.blood_pressure[0].diastolic}` : strings.dashboard.bpEmpty;
    const bpNote = bpHasData ? '' : `<span style="font-size:11px;color:var(--text-secondary)">${strings.dashboard.bpExternalNote}</span>`;

    stepsExtrasRow.innerHTML = `
      <div class="dashboard-card" style="background:var(--bg-secondary)">
        <h3>${strings.dashboard.dailySteps} 7d</h3>
        <div class="value">${steps7d?.toLocaleString() || '--'}</div>
        <div class="subtitle">${strings.dashboard.lastUpdate}</div>
      </div>
      <div class="dashboard-card" style="background:var(--bg-secondary)">
        <h3>${strings.dashboard.dailySteps} 15d</h3>
        <div class="value">${steps15d?.toLocaleString() || '--'}</div>
        <div class="subtitle">${strings.dashboard.lastUpdate}</div>
      </div>
      <div class="dashboard-card" style="background:var(--bg-secondary)">
        <h3>${strings.dashboard.dailySteps} 1m</h3>
        <div class="value">${steps1m?.toLocaleString() || '--'}</div>
        <div class="subtitle">${strings.dashboard.lastUpdate}</div>
      </div>
      <div class="dashboard-card">
        <h3>${strings.dashboard.exerciseTime}</h3>
        <div class="value">${exerciseDisplay}</div>
        <div class="subtitle">${exerciseCompliance || strings.dashboard.avgDay}</div>
      </div>
      <div class="dashboard-card">
        <h3>${strings.dashboard.spo2}</h3>
        <div class="value">${spo2Display}</div>
        <div class="subtitle">${spo2Compliance || strings.dashboard.lastUpdate}</div>
      </div>
      <div class="dashboard-card" style="opacity:0.7">
        <h3>${strings.dashboard.bloodPressure}</h3>
        <div class="value">${bpDisplay}</div>
        <div class="subtitle">${bpNote}</div>
      </div>
    `;

    // --- Row 3: Trend chart ---
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
              { label: strings.dashboard.kcalDaily, data: kcalData, borderColor: '#0D9488', backgroundColor: 'rgba(13,148,136,0.1)', fill: true, tension: 0.3, pointRadius: 3 },
              { label: strings.dashboard.ma7, data: ma7, borderColor: '#F59E0B', borderDash: [5, 5], pointRadius: 0, tension: 0.3 },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#64748B', boxWidth: 12, padding: 8 } } },
            scales: {
              y: { beginAtZero: true, ticks: { color: '#64748B' }, grid: { color: '#E2E8F0' } },
              x: { ticks: { color: '#64748B', maxTicksLimit: 10 } },
            },
          },
        });
      }
    } else {
      trendRow.style.display = 'none';
    }

    // --- Row 4: Activity per-sport (session-first) ---
    if (activityKcal && activityKcal.length > 0) {
      const sorted = [...activityKcal].sort((a, b) => b.count - a.count);
      const totalHours = activityKcal.reduce((s, a) => s + (a.total_kcal ? a.total_kcal / 250 : 0), 0);
      const avgKcalSession = totalSessions > 0 ? Math.round(totalKcal / totalSessions) : 0;
      const uniqueTypes = activityKcal.length;

      activityRow.innerHTML = `
        <div class="dashboard-card" style="background:var(--accent);color:#fff;grid-column:1/-1">
          <h3 style="color:rgba(255,255,255,0.8)">${strings.dashboard.activitySummary}</h3>
          <div style="display:flex;gap:24px;margin-top:6px">
            <div><span class="value" style="color:#fff;font-size:20px">${totalSessions}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.sessionCount}</div></div>
            <div><span class="value" style="color:#fff;font-size:20px">${totalKcal.toLocaleString()}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.kcalTotal}</div></div>
            <div><span class="value" style="color:#fff;font-size:20px">${uniqueTypes}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.uniqueTypes}</div></div>
            <div><span class="value" style="color:#fff;font-size:20px">${avgKcalSession}</span><div class="subtitle" style="color:rgba(255,255,255,0.7)">${strings.dashboard.kcalPerSession}</div></div>
          </div>
        </div>` +
        sorted.map(a => {
          const icon = SPORT_ICONS[a.sport_type] || '🏅';
          return `
          <div class="dashboard-card">
            <h3>${icon} ${getSportDisplayName(a.sport_type)}</h3>
            <div class="value">${a.total_kcal.toLocaleString()} kcal</div>
            <div class="subtitle">${a.count} ${strings.dashboard.sessions} · ${a.avg_kcal} ${strings.dashboard.avgKcal}</div>
          </div>`;
        }).join('');
    } else {
      activityRow.innerHTML = `<div class="dashboard-card" style="grid-column:1/-1;text-align:center;color:var(--text-secondary)"><p>${strings.dashboard.noActivityData}</p></div>`;
    }
  }

  await render();
  window._loadingDashboard = false;
}
