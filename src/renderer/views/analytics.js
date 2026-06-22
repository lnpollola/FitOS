import Chart from 'chart.js/auto';
import { strings, getSportDisplayName } from '../locales/es.js';
import { sportIcon } from '../utils/sport-icons.js';
import { getRangeDates } from '../utils/date-range.js';
import { chartColors } from '../utils/chart-theme.js';
import { skeletonCard, skeletonChart, skeletonRow } from '../utils/skeleton.js';

const RANGES = {
  '7d': { label: 'last7d', days: 7 },
  '1m': { label: 'last1m', days: 30 },
  '3m': { label: 'last3m', days: 90 },
  'year': { label: 'thisYear', days: null },
};

const ACTIVITY_COLORS = [
  '#0D9488', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
];

let _state = {
  range: '7d',
  from: null,
  to: null,
};

function getPrevRangeDates(from, to) {
  const rangeDays = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24));
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - rangeDays + 1);
  return {
    from: prevFrom.toISOString().split('T')[0],
    to: prevTo.toISOString().split('T')[0],
  };
}

function movingAverage(data, window) {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

export async function init() {
  if (window._loadingAnalytics) return;
  window._loadingAnalytics = true;
  const container = document.getElementById('view-analytics');
  const api = window.electronAPI;
  const s = strings.analytics;

  container.innerHTML = `
    <h2 class="view-title">${s.title}</h2>
    <div class="analytics-filters" id="analytics-filters">
      <button class="filter-btn active" data-range="7d">${s.last7d}</button>
      <button class="filter-btn" data-range="1m">${s.last1m}</button>
      <button class="filter-btn" data-range="3m">${s.last3m}</button>
      <button class="filter-btn" data-range="year">${s.thisYear}</button>
      <div class="filter-divider"></div>
      <label class="text-sm text-muted">${s.from}</label>
      <input type="date" class="filter-date-input" id="filter-from" />
      <label class="text-sm text-muted">${s.to}</label>
      <input type="date" class="filter-date-input" id="filter-to" />
      <button class="filter-btn" id="filter-apply" style="display:none">${s.custom}</button>
    </div>
    <div class="analytics-kpis" id="analytics-kpis" aria-live="polite"></div>
    <div class="analytics-grid" id="analytics-chart-grid" aria-live="polite"></div>
    <div class="card" id="analytics-ranking">
      <h2>${s.activityRanking}</h2>
      <div id="ranking-content" aria-live="polite"></div>
    </div>
    <div class="secondary-section" id="secondary-section">
      <button class="secondary-toggle" id="secondary-toggle">
        <span class="arrow">▶</span> ${s.secondaryMetrics}
      </button>
      <div class="secondary-content" id="secondary-content">
        <div class="secondary-metrics-grid" id="secondary-metrics-grid" aria-live="polite"></div>
      </div>
    </div>
  `;

  if (!api) { window._loadingAnalytics = false; return; }

  function applyRange(range) {
    _state.range = range;
    const { from, to } = getRangeDates(range);
    _state.from = from;
    _state.to = to;
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.range === range);
    });
    document.getElementById('filter-from').value = '';
    document.getElementById('filter-to').value = '';
    loadAll();
  }

  document.querySelectorAll('.filter-btn[data-range]').forEach(btn => {
    btn.addEventListener('click', () => applyRange(btn.dataset.range));
  });

  const fromInput = document.getElementById('filter-from');
  const toInput = document.getElementById('filter-to');
  const applyBtn = document.getElementById('filter-apply');

  function onCustomChange() {
    if (fromInput.value && toInput.value) {
      applyBtn.style.display = 'inline-block';
    } else {
      applyBtn.style.display = 'none';
    }
  }

  fromInput.addEventListener('change', onCustomChange);
  toInput.addEventListener('change', onCustomChange);

  applyBtn.addEventListener('click', () => {
    if (fromInput.value && toInput.value) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      _state.range = 'custom';
      _state.from = fromInput.value;
      _state.to = toInput.value;
      loadAll();
    }
  });

  document.getElementById('secondary-toggle').addEventListener('click', () => {
    const content = document.getElementById('secondary-content');
    const arrow = document.querySelector('#secondary-toggle .arrow');
    content.classList.toggle('open');
    arrow.classList.toggle('open');
  });

  function getTrend(currentData, prevData) {
    if (!prevData || !prevData.length) return { arrow: '―', cls: 'text-muted' };
    const curTotal = currentData.reduce((a, d) => a + (d.total_kcal || 0), 0);
    const prevTotal = prevData.reduce((a, d) => a + (d.total_kcal || 0), 0);
    if (curTotal > prevTotal) return { arrow: '▲', cls: 'text-success' };
    if (curTotal < prevTotal) return { arrow: '▼', cls: 'text-danger' };
    return { arrow: '―', cls: 'text-muted' };
  }

  async function loadAll() {
    const { from, to } = _state;
    if (!api) return;

    const prevRange = getPrevRangeDates(from, to);

    document.getElementById('analytics-kpis').innerHTML = skeletonCard().repeat(5);
    document.getElementById('analytics-chart-grid').innerHTML = skeletonChart().repeat(6);
    document.getElementById('ranking-content').innerHTML = skeletonCard();
    document.getElementById('secondary-metrics-grid').innerHTML = skeletonCard().repeat(6);

    const results = await Promise.allSettled([
      api.getHealthDailySummary?.(from, to),
      api.getHealthHeartRateRange?.(from, to),
      api.getHealthHRVRange?.(from, to),
      api.getHealthSleepRange?.(from, to),
      api.getHealthWorkoutRange?.(from, to),
      api.getHealthWorkoutRanking?.(from, to),
      api.getHealthWorkoutRanking?.(prevRange.from, prevRange.to),
      api.getHealthRestingHeartRateRange?.(from, to),
      api.getHealthVO2MaxRange?.(from, to),
      api.getHealthExerciseTimeRange?.(from, to),
      api.getHealthDistanceSummary?.(from, to),
      api.getHealthWalkingSpeedRange?.(from, to),
      api.getHealthFlightsClimbedRange?.(from, to),
    ]);
    const values = results.map(r => r.status === 'fulfilled' ? r.value : null);
    const [
      dailyRes, hrRes, hrvRes, sleepRes,
      workoutRes, rankingRes, prevRankingRes,
      rhrRes, vo2Res, exerciseRes, distanceRes, speedRes, flightsRes,
    ] = values;

    const prevRankingData = prevRankingRes?.ok ? prevRankingRes.data : [];

    renderKPIs(dailyRes, hrvRes, sleepRes);
    renderChartGrid(dailyRes, hrRes, hrvRes, sleepRes, rankingRes);
    renderRanking(rankingRes, workoutRes, prevRankingData);
    renderSecondaryMetrics(rhrRes, vo2Res, exerciseRes, distanceRes, speedRes, flightsRes);
  }

  function renderKPIs(dailyRes, hrvRes, sleepRes) {
    const el = document.getElementById('analytics-kpis');
    const s = strings.analytics;
    const daily = dailyRes?.ok ? dailyRes.data : [];
    const hrv = hrvRes?.ok ? hrvRes.data : [];
    const sleep = sleepRes?.ok ? sleepRes.data : [];

    const avgSteps = daily.length ? Math.round(daily.reduce((a, d) => a + d.steps, 0) / daily.length) : null;
    const totalEnergy = daily.length ? Math.round(daily.reduce((a, d) => a + d.kcal_activas + d.kcal_basales, 0)) : null;
    const avgHr = daily.length ? Math.round(daily.reduce((a, d) => a + (d.hr_media || 0), 0) / daily.filter(d => d.hr_media).length) : null;
    const avgSleep = sleep.length ? Math.round(sleep.reduce((a, d) => a + d.hours, 0) / sleep.length * 10) / 10 : null;
    const avgHrv = hrv.length ? Math.round(hrv.reduce((a, d) => a + d.hrv_ms, 0) / hrv.length * 10) / 10 : null;

    const cards = [
      { label: s.stepsAvg, value: avgSteps != null ? avgSteps.toLocaleString() : '--', sub: s.dailyAvg },
      { label: s.totalEnergy, value: totalEnergy != null ? `${totalEnergy.toLocaleString()} ${s.kcal}` : '--', sub: s.kcal },
      { label: s.hrAvg, value: avgHr != null ? `${avgHr} ${s.bpm}` : '--', sub: s.bpm },
      { label: s.sleepAvg, value: avgSleep != null ? `${avgSleep} ${s.hours}` : '--', sub: s.hours },
      { label: s.hrvAvg, value: avgHrv != null ? `${avgHrv} ${s.ms}` : '--', sub: s.ms },
    ];

    el.innerHTML = cards.map(c => `
      <div class="analytics-kpi-card">
        <div class="kpi-label">${c.label}</div>
        <div class="kpi-value">${c.value}</div>
        <div class="kpi-sub">${c.sub}</div>
      </div>
    `).join('');
  }

  function renderChartGrid(dailyRes, hrRes, hrvRes, sleepRes, rankingRes) {
    const grid = document.getElementById('analytics-chart-grid');
    const s = strings.analytics;

    grid.innerHTML = `
      <div class="chart-card"><h3>${s.stepsChart}</h3><div class="chart-container"><canvas id="chart-steps"></canvas></div></div>
      <div class="chart-card"><h3>${s.hrChart}</h3><div class="chart-container"><canvas id="chart-hr"></canvas></div></div>
      <div class="chart-card"><h3>${s.energyChart}</h3><div class="chart-container"><canvas id="chart-energy"></canvas></div></div>
      <div class="chart-card"><h3>${s.hrvChart}</h3><div class="chart-container"><canvas id="chart-hrv"></canvas></div></div>
      <div class="chart-card"><h3>${s.sleepChart}</h3><div class="chart-container"><canvas id="chart-sleep"></canvas></div></div>
      <div class="chart-card"><h3>${s.activitiesChart}</h3><div class="chart-container"><canvas id="chart-activities"></canvas></div></div>
    `;

    renderStepsChart(dailyRes);
    renderHRChart(hrRes);
    renderEnergyChart(dailyRes);
    renderHRVChart(hrvRes);
    renderSleepChart(sleepRes);
    renderActivityRankingChart(rankingRes);
  }

  function renderStepsChart(dailyRes) {
    const canvas = document.getElementById('chart-steps');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = dailyRes?.ok ? dailyRes.data : [];
    const days = data.map(d => d.dia);
    const steps = data.map(d => d.steps);

    if (!steps.length) {
      canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noSteps}</div>`;
      return;
    }

    const ma7 = movingAverage(steps, 7);

    if (window._stepsChart) window._stepsChart.destroy();
    window._stepsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: strings.analytics.steps,
            data: steps,
            borderColor: chartColors.accent,
            backgroundColor: 'rgba(13, 148, 136, 0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5,
          },
          {
            label: strings.analytics.ma7,
            data: ma7,
            borderColor: chartColors.textSecondary,
            borderDash: [5, 3],
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
          tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
        },
        scales: {
          x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: chartColors.textSecondary, font: { size: 10 } }, grid: { color: chartColors.grid } },
        },
      },
    });
  }

  function renderHRChart(hrRes) {
    const canvas = document.getElementById('chart-hr');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = hrRes?.ok ? hrRes.data : [];
    const days = data.map(d => d.date);
    const avg = data.map(d => d.avg_bpm);
    const minV = data.map(d => d.min_bpm);
    const maxV = data.map(d => d.max_bpm);

    if (!data.length) {
      canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noHr}</div>`;
      return;
    }

    if (window._hrChart) window._hrChart.destroy();
    window._hrChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: strings.analytics.max,
            data: maxV,
            borderColor: 'rgba(239, 68, 68, 0.3)',
            backgroundColor: 'transparent',
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: '+1',
          },
          {
            label: strings.analytics.min,
            data: minV,
            borderColor: 'rgba(239, 68, 68, 0.3)',
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: false,
          },
          {
            label: strings.analytics.avg,
            data: avg,
            borderColor: chartColors.accent,
            backgroundColor: 'transparent',
            pointRadius: 2,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
          tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
        },
        scales: {
          x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
          y: { beginAtZero: false, ticks: { color: chartColors.textSecondary, font: { size: 10 } }, grid: { color: chartColors.grid } },
        },
      },
    });
  }

  function renderEnergyChart(dailyRes) {
    const canvas = document.getElementById('chart-energy');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = dailyRes?.ok ? dailyRes.data : [];
    const days = data.map(d => d.dia);
    const active = data.map(d => d.kcal_activas);
    const basal = data.map(d => d.kcal_basales);

    if (!days.length) {
      canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noEnergy}</div>`;
      return;
    }

    if (window._energyChart) window._energyChart.destroy();
    window._energyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: strings.analytics.active,
            data: active,
            backgroundColor: chartColors.accent,
            borderRadius: 3,
          },
          {
            label: strings.analytics.basal,
            data: basal,
            backgroundColor: chartColors.textSecondary,
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
          tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
        },
        scales: {
          x: { stacked: true, ticks: { color: chartColors.textSecondary, maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, ticks: { color: chartColors.textSecondary, font: { size: 10 } }, grid: { color: chartColors.grid } },
        },
      },
    });
  }

  function renderHRVChart(hrvRes) {
    const canvas = document.getElementById('chart-hrv');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = hrvRes?.ok ? hrvRes.data : [];
    const days = data.map(d => d.date);
    const values = data.map(d => d.hrv_ms);

    if (!days.length) {
      canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noHrv}</div>`;
      return;
    }

    if (window._hrvChart) window._hrvChart.destroy();
    window._hrvChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          label: strings.analytics.hrv,
          data: values,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
        },
        scales: {
          x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: chartColors.textSecondary, font: { size: 10 } }, grid: { color: chartColors.grid } },
        },
      },
    });
  }

  function renderSleepChart(sleepRes) {
    const canvas = document.getElementById('chart-sleep');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = sleepRes?.ok ? sleepRes.data : [];
    const days = data.map(d => d.night);
    const hours = data.map(d => d.hours);

    if (!days.length) {
      canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noSleep}</div>`;
      return;
    }

    const ma7 = movingAverage(hours, 7);

    if (window._sleepChart) window._sleepChart.destroy();
    window._sleepChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: strings.analytics.sleep,
            data: hours,
            backgroundColor: '#6366F1',
            borderRadius: 3,
            order: 2,
          },
          {
            label: strings.analytics.ma7,
            data: ma7,
            type: 'line',
            borderColor: chartColors.warning,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: false,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
          tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
        },
        scales: {
          x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: chartColors.textSecondary, font: { size: 10 } }, grid: { color: chartColors.grid } },
        },
      },
    });
  }

  function renderActivityRankingChart(rankingRes) {
    const canvas = document.getElementById('chart-activities');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = rankingRes?.ok ? rankingRes.data : [];

    if (!data.length) {
      canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noActivities}</div>`;
      return;
    }

    const labels = data.map(d => `${getSportDisplayName(d.activity_type)}`);
    const kcal = data.map(d => d.total_kcal);
    const colors = labels.map((_, i) => ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]);

    if (window._activityChart) window._activityChart.destroy();
    window._activityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: strings.analytics.kcal,
          data: kcal,
          backgroundColor: colors,
          borderRadius: 3,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
        },
        scales: {
          x: { beginAtZero: true, ticks: { color: chartColors.textSecondary, font: { size: 10 } }, grid: { color: chartColors.grid } },
          y: { ticks: { color: chartColors.textSecondary, font: { size: 10 } }, grid: { display: false } },
        },
      },
    });
  }

  function renderRanking(rankingRes, workoutRes, prevRankingData) {
    const el = document.getElementById('ranking-content');
    const s = strings.analytics;
    const ranking = rankingRes?.ok ? rankingRes.data : [];

    if (!ranking.length) {
      el.innerHTML = `<div class="empty-state"><p>${s.noActivities}</p></div>`;
      return;
    }

    function getTypeTrend(type) {
      const prev = prevRankingData.find(r => r.activity_type === type);
      if (!prev) return { arrow: '―', cls: 'text-muted' };
      const cur = ranking.find(r => r.activity_type === type);
      if (!cur) return { arrow: '―', cls: 'text-muted' };
      if (cur.total_kcal > prev.total_kcal) return { arrow: '▲', cls: 'text-success' };
      if (cur.total_kcal < prev.total_kcal) return { arrow: '▼', cls: 'text-danger' };
      return { arrow: '―', cls: 'text-muted' };
    }

    el.innerHTML = `
      <div class="ranking-table-wrap">
        <table>
          <thead><tr>
            <th>${s.type}</th>
            <th>${s.count}</th>
            <th>${s.hoursLabel}</th>
            <th>${s.kcal}</th>
            <th>${s.kcalPerSession}</th>
            <th>${s.trend}</th>
          </tr></thead>
          <tbody>
            ${ranking.map(r => {
              const trend = getTypeTrend(r.activity_type);
              return `
                <tr>
                  <td><strong>${sportIcon(r.activity_type, 14)} ${getSportDisplayName(r.activity_type)}</strong></td>
                  <td>${r.count}</td>
                  <td>${r.total_hours}</td>
                  <td>${r.total_kcal.toLocaleString()}</td>
                  <td>${r.count ? Math.round(r.total_kcal / r.count) : 0}</td>
                  <td class="${trend.cls}">${trend.arrow}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderSecondaryMetrics(rhrRes, vo2Res, exerciseRes, distanceRes, speedRes, flightsRes) {
    const grid = document.getElementById('secondary-metrics-grid');
    const s = strings.analytics;

    function computeKPI(data, valueKey) {
      if (!data || !data.length) return null;
      const values = data.map(d => d[valueKey]).filter(v => v != null);
      if (!values.length) return null;
      return {
        current: values[values.length - 1],
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    }

    const metrics = [
      { key: 'rhr', title: s.rhr, data: rhrRes?.ok ? rhrRes.data : [], valueKey: 'rhr_bpm', emptyMsg: s.noRhr, color: '#EF4444', unit: ' bpm' },
      { key: 'vo2', title: s.vo2max, data: vo2Res?.ok ? vo2Res.data : [], valueKey: 'vo2_max', emptyMsg: s.noVo2max, color: '#10B981', unit: '' },
      { key: 'exercise', title: s.exerciseTime, data: exerciseRes?.ok ? exerciseRes.data : [], valueKey: 'minutes', emptyMsg: s.noExerciseTime, color: '#F59E0B', unit: ' min' },
      { key: 'speed', title: s.walkingSpeed, data: speedRes?.ok ? speedRes.data : [], valueKey: 'speed_kmh', emptyMsg: s.noWalkingSpeed, color: '#06B6D4', unit: ' km/h' },
      { key: 'flights', title: s.flightsClimbed, data: flightsRes?.ok ? flightsRes.data : [], valueKey: 'count', emptyMsg: s.noFlights, color: '#8B5CF6', unit: '' },
    ];

    const dist = distanceRes?.ok ? distanceRes.data : null;

    grid.innerHTML = metrics.map(m => {
      const kpi = computeKPI(m.data, m.valueKey);
      return `
        <div class="mini-chart-card">
          <h4>${m.title}</h4>
          ${kpi ? `
            <div class="flex-gap-sm text-xs" style="margin-bottom:8px">
              <span><strong>${s.current}:</strong> ${kpi.current != null ? kpi.current.toFixed(1) + m.unit : '--'}</span>
              <span><strong>${s.avg}:</strong> ${kpi.avg.toFixed(1) + m.unit}</span>
              <span><strong>${s.min}:</strong> ${kpi.min.toFixed(1) + m.unit}</span>
              <span><strong>${s.max}:</strong> ${kpi.max.toFixed(1) + m.unit}</span>
            </div>
          ` : ''}
          <div class="chart-container"><canvas id="mini-${m.key}"></canvas></div>
        </div>
      `;
    }).join('') + `
      <div class="mini-chart-card">
        <h4>${s.walkingDistance}</h4>
        <div class="chart-container"><canvas id="mini-walk-dist"></canvas></div>
      </div>
      <div class="mini-chart-card">
        <h4>${s.cyclingDistance}</h4>
        <div class="chart-container"><canvas id="mini-cycle-dist"></canvas></div>
      </div>
    `;

    metrics.forEach(m => renderMiniChart(m.key, m.data, m.valueKey, m.emptyMsg, m.color, m.unit));
    renderMiniDistanceChart('walk-dist', dist?.walking || [], 'km', s.noDistance, '#0D9488', ' km');
    renderMiniDistanceChart('cycle-dist', dist?.cycling || [], 'km', s.noDistance, '#6366F1', ' km');
  }

  function renderMiniChart(id, data, valueKey, emptyMsg, color, unit) {
    const canvas = document.getElementById(`mini-${id}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!data.length) {
      canvas.parentElement.innerHTML = `<div class="chart-empty">${emptyMsg}</div>`;
      return;
    }

    const labels = data.map(d => d.date);
    const values = data.map(d => d[valueKey]);

    const chartKey = `_${id}Chart`;
    if (window[chartKey]) window[chartKey].destroy();
    window[chartKey] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: color,
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 1,
          pointHoverRadius: 4,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary } },
        scales: {
          x: { display: true, ticks: { color: chartColors.textSecondary, font: { size: 9 }, maxTicksLimit: 6 }, grid: { display: false } },
          y: { display: true, ticks: { color: chartColors.textSecondary, font: { size: 9 }, maxTicksLimit: 4 }, grid: { color: chartColors.grid } },
        },
      },
    });
  }

  function renderMiniDistanceChart(id, data, valueKey, emptyMsg, color, unit) {
    const canvas = document.getElementById(`mini-${id}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!data.length) {
      canvas.parentElement.innerHTML = `<div class="chart-empty">${emptyMsg}</div>`;
      return;
    }

    const labels = data.map(d => d.date);
    const values = data.map(d => d.km);

    const chartKey2 = `_${id.replace('-', '')}Chart`;
    if (window[chartKey2]) window[chartKey2].destroy();
    window[chartKey2] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: color,
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 1,
          pointHoverRadius: 4,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary } },
        scales: {
          x: { display: true, ticks: { color: chartColors.textSecondary, font: { size: 9 }, maxTicksLimit: 6 }, grid: { display: false } },
          y: { display: true, ticks: { color: chartColors.textSecondary, font: { size: 9 }, maxTicksLimit: 4 }, grid: { color: chartColors.grid } },
        },
      },
    });
  }

  applyRange('7d');
  window._loadingAnalytics = false;
}
