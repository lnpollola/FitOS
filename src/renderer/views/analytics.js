import Chart from 'chart.js/auto';
import { strings } from '../locales/es.js';

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

function getRangeDates(range) {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let from;
  if (range === 'year') {
    from = `${now.getFullYear()}-01-01`;
  } else {
    const d = new Date(now);
    d.setDate(d.getDate() - RANGES[range].days);
    from = d.toISOString().split('T')[0];
  }
  return { from, to };
}

function movingAverage(data, window) {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

export function init() {
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
      <label style="font-size:13px;color:var(--text-secondary)">${s.from}</label>
      <input type="date" class="filter-date-input" id="filter-from" />
      <label style="font-size:13px;color:var(--text-secondary)">${s.to}</label>
      <input type="date" class="filter-date-input" id="filter-to" />
      <button class="filter-btn" id="filter-apply" style="display:none">${s.custom}</button>
    </div>
    <div class="analytics-kpis" id="analytics-kpis"></div>
    <div class="analytics-grid" id="analytics-chart-grid"></div>
    <div class="card" id="analytics-ranking">
      <h2>${s.activityRanking}</h2>
      <div id="ranking-content"></div>
    </div>
    <div class="secondary-section" id="secondary-section">
      <button class="secondary-toggle" id="secondary-toggle">
        <span class="arrow">▶</span> ${s.secondaryMetrics}
      </button>
      <div class="secondary-content" id="secondary-content">
        <div class="secondary-metrics-grid" id="secondary-metrics-grid"></div>
      </div>
    </div>
  `;

  if (!api) return;

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

  function destroyAll() {
    const charts = ['_stepsChart', '_hrChart', '_energyChart', '_hrvChart', '_sleepChart', '_activityChart',
                    '_rhrChart', '_vo2Chart', '_exerciseChart', '_speedChart', '_flightsChart', '_walkDistChart', '_cycleDistChart'];
    charts.forEach(k => {
      if (window[k]) { window[k].destroy(); window[k] = null; }
    });
  }

  async function loadAll() {
    destroyAll();
    const { from, to } = _state;
    if (!api) return;

    const [
      dailyRes,
      hrRes,
      hrvRes,
      sleepRes,
      workoutRes,
      rankingRes,
      rhrRes,
      vo2Res,
      exerciseRes,
      distanceRes,
      speedRes,
      flightsRes,
    ] = await Promise.all([
      api.getHealthDailySummary?.(from, to).catch(() => null),
      api.getHealthHeartRateRange?.(from, to).catch(() => null),
      api.getHealthHRVRange?.(from, to).catch(() => null),
      api.getHealthSleepRange?.(from, to).catch(() => null),
      api.getHealthWorkoutRange?.(from, to).catch(() => null),
      api.getHealthWorkoutRanking?.(from, to).catch(() => null),
      api.getHealthRestingHeartRateRange?.(from, to).catch(() => null),
      api.getHealthVO2MaxRange?.(from, to).catch(() => null),
      api.getHealthExerciseTimeRange?.(from, to).catch(() => null),
      api.getHealthDistanceSummary?.(from, to).catch(() => null),
      api.getHealthWalkingSpeedRange?.(from, to).catch(() => null),
      api.getHealthFlightsClimbedRange?.(from, to).catch(() => null),
    ]);

    renderKPIs(dailyRes, hrvRes, sleepRes);
    renderChartGrid(dailyRes, hrRes, hrvRes, sleepRes, rankingRes);
    renderRanking(rankingRes, workoutRes);
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

    window._stepsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: strings.analytics.steps,
            data: steps,
            borderColor: '#0D9488',
            backgroundColor: 'rgba(13, 148, 136, 0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5,
          },
          {
            label: strings.analytics.ma7,
            data: ma7,
            borderColor: '#64748B',
            borderDash: [5, 3],
            borderWidth: 2,
            pointRadius: 0,
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
        },
        scales: {
          x: { ticks: { color: '#64748B', maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: '#64748B', font: { size: 10 } }, grid: { color: '#F1F5F9' } },
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
            tension: 0.3,
            fill: '+1',
          },
          {
            label: strings.analytics.min,
            data: minV,
            borderColor: 'rgba(239, 68, 68, 0.3)',
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            pointRadius: 0,
            tension: 0.3,
            fill: false,
          },
          {
            label: strings.analytics.avg,
            data: avg,
            borderColor: '#0D9488',
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
        },
        scales: {
          x: { ticks: { color: '#64748B', maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
          y: { beginAtZero: false, ticks: { color: '#64748B', font: { size: 10 } }, grid: { color: '#F1F5F9' } },
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

    window._energyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: strings.analytics.active,
            data: active,
            backgroundColor: '#0D9488',
            borderRadius: 3,
          },
          {
            label: strings.analytics.basal,
            data: basal,
            backgroundColor: '#94A3B8',
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
        },
        scales: {
          x: { stacked: true, ticks: { color: '#64748B', maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, ticks: { color: '#64748B', font: { size: 10 } }, grid: { color: '#F1F5F9' } },
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

    window._hrvChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          label: 'HRV',
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
        },
        scales: {
          x: { ticks: { color: '#64748B', maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: '#64748B', font: { size: 10 } }, grid: { color: '#F1F5F9' } },
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
            borderColor: '#F59E0B',
            borderWidth: 2,
            pointRadius: 0,
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
        },
        scales: {
          x: { ticks: { color: '#64748B', maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: '#64748B', font: { size: 10 } }, grid: { color: '#F1F5F9' } },
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

    const labels = data.map(d => d.activity_type);
    const kcal = data.map(d => d.total_kcal);
    const colors = labels.map((_, i) => ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]);

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
        },
        scales: {
          x: { beginAtZero: true, ticks: { color: '#64748B', font: { size: 10 } }, grid: { color: '#F1F5F9' } },
          y: { ticks: { color: '#64748B', font: { size: 10 } }, grid: { display: false } },
        },
      },
    });
  }

  function renderRanking(rankingRes, workoutRes) {
    const el = document.getElementById('ranking-content');
    const s = strings.analytics;
    const ranking = rankingRes?.ok ? rankingRes.data : [];

    if (!ranking.length) {
      el.innerHTML = `<div class="empty-state"><p>${s.noActivities}</p></div>`;
      return;
    }

    el.innerHTML = `
      <div class="ranking-table-wrap">
        <table>
          <thead><tr>
            <th>${s.type}</th>
            <th>${s.count}</th>
            <th>${s.hoursLabel}</th>
            <th>${s.kcal}</th>
            <th>${s.distance}</th>
          </tr></thead>
          <tbody>
            ${ranking.map(r => `
              <tr>
                <td><strong>${r.activity_type}</strong></td>
                <td>${r.count}</td>
                <td>${r.total_hours}</td>
                <td>${r.total_kcal.toLocaleString()}</td>
                <td>${r.total_km ? r.total_km + ' km' : '--'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderSecondaryMetrics(rhrRes, vo2Res, exerciseRes, distanceRes, speedRes, flightsRes) {
    const grid = document.getElementById('secondary-metrics-grid');
    const s = strings.analytics;

    const metrics = [
      { key: 'rhr', title: s.rhr, data: rhrRes?.ok ? rhrRes.data : [], valueKey: 'rhr_bpm', emptyMsg: s.noRhr, color: '#EF4444', unit: ' bpm' },
      { key: 'vo2', title: s.vo2max, data: vo2Res?.ok ? vo2Res.data : [], valueKey: 'vo2_max', emptyMsg: s.noVo2max, color: '#10B981', unit: '' },
      { key: 'exercise', title: s.exerciseTime, data: exerciseRes?.ok ? exerciseRes.data : [], valueKey: 'minutes', emptyMsg: s.noExerciseTime, color: '#F59E0B', unit: ' min' },
      { key: 'speed', title: s.walkingSpeed, data: speedRes?.ok ? speedRes.data : [], valueKey: 'speed_kmh', emptyMsg: s.noWalkingSpeed, color: '#06B6D4', unit: ' km/h' },
      { key: 'flights', title: s.flightsClimbed, data: flightsRes?.ok ? flightsRes.data : [], valueKey: 'count', emptyMsg: s.noFlights, color: '#8B5CF6', unit: '' },
    ];

    const dist = distanceRes?.ok ? distanceRes.data : null;

    grid.innerHTML = metrics.map(m => `
      <div class="mini-chart-card">
        <h4>${m.title}</h4>
        <div class="chart-container"><canvas id="mini-${m.key}"></canvas></div>
      </div>
    `).join('') + `
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

    window[`_${id}Chart`] = new Chart(ctx, {
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
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: true, ticks: { color: '#94A3B8', font: { size: 9 }, maxTicksLimit: 4 }, grid: { color: '#F1F5F9' } },
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

    window[`_${id.replace('-', '')}Chart`] = new Chart(ctx, {
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
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: true, ticks: { color: '#94A3B8', font: { size: 9 }, maxTicksLimit: 4 }, grid: { color: '#F1F5F9' } },
        },
      },
    });
  }

  applyRange('7d');
}
