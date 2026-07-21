import { getAPI } from "../utils/api-detector.js";
import { strings, getSportDisplayName } from '../locales/es.js';
import { createChart } from '../charts/chart-manager.js';
import { sportIcon } from '../utils/sport-icons.js';
import { getRangeDates } from '../utils/date-range.js';
import { chartColors, chartColorWithAlpha } from '../utils/chart-theme.js';
import { skeletonCard, skeletonChart, skeletonRow } from '../utils/skeleton.js';
import { safeCall } from '../utils/safe-call.js';
import { renderStateCard } from '../utils/state-card.js';
import { getTrendArrow } from '../utils/trend-arrow.js';
import { formatNumber } from '../utils/formatters.js';

const RANGES = {
  '7d': { label: 'last7d', days: 7 },
  '15d': { label: 'last15d', days: 15 },
  '1m': { label: 'last1m', days: 30 },
  '3m': { label: 'last3m', days: 90 },
  'year': { label: 'thisYear', days: null },
};

function activityPalette(n) {
  const palette = [
    chartColors.accent, chartColors.warning, chartColors.danger, chartColors.success,
    chartColors.accentHover, chartColors.textSecondary,
  ];
  return Array.from({ length: n }, (_, i) => palette[i % palette.length]);
}

const TOOLTIP_BG = chartColorWithAlpha(chartColors.grid, 0.95);

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

function aggregateToWeekly(data, dateKey, valueKey, aggregation = 'sum') {
  if (!data || data.length === 0) return [];
  
  const weeks = new Map();
  
  data.forEach(d => {
    const date = new Date(d[dateKey]);
    const year = date.getFullYear();
    const weekNum = getWeekNumber(date);
    const key = `${year}-W${weekNum}`;
    
    if (!weeks.has(key)) {
      weeks.set(key, { label: `S${weekNum}`, values: [], startDate: date });
    }
    weeks.get(key).values.push(d[valueKey]);
  });
  
  const result = Array.from(weeks.values())
    .sort((a, b) => a.startDate - b.startDate)
    .map(w => ({
      label: w.label,
      value: aggregation === 'sum' 
        ? w.values.reduce((a, b) => a + b, 0)
        : w.values.reduce((a, b) => a + b, 0) / w.values.length
    }));
  
  return result;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function aggregateToMonthly(data, dateKey, valueKey, aggregation = 'sum') {
  if (!data || data.length === 0) return [];
  
  const months = new Map();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  data.forEach(d => {
    const date = new Date(d[dateKey]);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;
    
    if (!months.has(key)) {
      months.set(key, { label: `${monthNames[month]} ${year}`, values: [], startDate: date });
    }
    months.get(key).values.push(d[valueKey]);
  });
  
  const result = Array.from(months.values())
    .sort((a, b) => a.startDate - b.startDate)
    .map(m => ({
      label: m.label,
      value: aggregation === 'sum' 
        ? m.values.reduce((a, b) => a + b, 0)
        : m.values.reduce((a, b) => a + b, 0) / m.values.length
    }));
  
  return result;
}

function debounce(fn, ms) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

function isEmptyRes(r) {
  if (!r) return true;
  if (Array.isArray(r)) return r.length === 0;
  if (r.ok === false) return true;
  if (r.ok === true) return !r.data || r.data.length === 0;
  return true;
}

export async function init() {
  if (window._loadingAnalytics) return;
  window._loadingAnalytics = true;
  try {
    const container = document.getElementById('view-analytics');
    const api = getAPI();
    const s = strings.analytics;

    container.innerHTML = `
      <h2 class="view-title">${s.title}</h2>
      <div class="analytics-filters" id="analytics-filters">
        <button class="filter-btn active" data-range="7d">${s.last7d}</button>
        <button class="filter-btn" data-range="15d">${s.last15d}</button>
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
      <div class="form-error" id="analytics-error" role="alert"></div>
      <div class="analytics-kpis" id="analytics-kpis" aria-live="polite"></div>
      <div class="analytics-grid" id="analytics-chart-grid" aria-live="polite"></div>
      <div class="secondary-section" id="secondary-section">
        <button class="secondary-toggle" id="secondary-toggle">
          <span class="arrow">▶</span> ${s.secondaryMetrics}
        </button>
        <div class="secondary-content" id="secondary-content">
          <div class="secondary-metrics-grid" id="secondary-metrics-grid" aria-live="polite"></div>
        </div>
      </div>
    `;

    if (!api) return;

    const errEl = document.getElementById('analytics-error');

    async function applyRange(range) {
      if (window._loadingAnalytics) return;
      _state.range = range;
      const { from, to } = getRangeDates(range);
      _state.from = from;
      _state.to = to;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.range === range);
      });
      document.getElementById('filter-from').value = '';
      document.getElementById('filter-to').value = '';
      if (errEl) errEl.textContent = '';
      document.getElementById('filter-apply').style.display = 'none';

      const chartContainers = document.querySelectorAll('#analytics-chart-grid .chart-container, #secondary-metrics-grid .chart-container');
      chartContainers.forEach(el => el.classList.add('chart-transitioning'));
      await new Promise(r => setTimeout(r, 200));

      await loadAll();

      const newContainers = document.querySelectorAll('#analytics-chart-grid .chart-container, #secondary-metrics-grid .chart-container');
      newContainers.forEach(el => {
        el.classList.add('chart-transitioning');
        requestAnimationFrame(() => el.classList.remove('chart-transitioning'));
      });
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

    const applyCustom = debounce(() => {
      const from = fromInput.value;
      const to = toInput.value;
      if (!from || !to) {
        if (errEl) errEl.textContent = '';
        return;
      }
      if (new Date(from) > new Date(to)) {
        if (errEl) errEl.textContent = strings.analytics.invalidDateRange;
        return;
      }
      if (errEl) errEl.textContent = '';
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      _state.range = 'custom';
      _state.from = from;
      _state.to = to;
      loadAll();
    }, 300);

    applyBtn.addEventListener('click', applyCustom);

    document.getElementById('secondary-toggle').addEventListener('click', () => {
      const content = document.getElementById('secondary-content');
      const arrow = document.querySelector('#secondary-toggle .arrow');
      content.classList.toggle('open');
      arrow.classList.toggle('open');
    });

    async function loadAll() {
      if (window._loadingAnalytics) return;
      window._loadingAnalytics = true;
      try {
        const { from, to } = _state;
        if (!api) return;

        const prevRange = getPrevRangeDates(from, to);

        document.getElementById('analytics-kpis').innerHTML = skeletonCard().repeat(5);
        document.getElementById('analytics-chart-grid').innerHTML = skeletonChart().repeat(6);
        document.getElementById('secondary-metrics-grid').innerHTML = skeletonCard().repeat(6);

        const [
          dailyRes, hrRes, hrvRes, sleepRes,
          workoutRes,
          rhrRes, vo2Res, exerciseRes, distanceRes, speedRes, flightsRes,
          prevDailyRes, prevHrvRes, prevSleepRes,
        ] = await Promise.all([
          safeCall(api.getHealthDailySummary?.(from, to)),
          safeCall(api.getHealthHeartRateRange?.(from, to)),
          safeCall(api.getHealthHRVRange?.(from, to)),
          safeCall(api.getHealthSleepRange?.(from, to)),
          safeCall(api.getHealthWorkoutRange?.(from, to)),
          safeCall(api.getHealthRestingHeartRateRange?.(from, to)),
          safeCall(api.getHealthVO2MaxRange?.(from, to)),
          safeCall(api.getHealthExerciseTimeRange?.(from, to)),
          safeCall(api.getHealthDistanceSummary?.(from, to)),
          safeCall(api.getHealthWalkingSpeedRange?.(from, to)),
          safeCall(api.getHealthFlightsClimbedRange?.(from, to)),
          safeCall(api.getHealthDailySummary?.(prevRange.from, prevRange.to)),
          safeCall(api.getHealthHRVRange?.(prevRange.from, prevRange.to)),
          safeCall(api.getHealthSleepRange?.(prevRange.from, prevRange.to)),
        ]);

        const mainEmpty = [dailyRes, hrRes, hrvRes, sleepRes, workoutRes].every(isEmptyRes);
        if (mainEmpty) {
          renderNoHealthDataBanner();
          return;
        }

        const kpiFailed = [dailyRes, prevDailyRes, hrvRes, prevHrvRes, sleepRes, prevSleepRes].every(r => !r?.ok);
        const chartFailed = [dailyRes, hrRes, hrvRes, sleepRes].every(r => !r?.ok);
        const secondaryFailed = [rhrRes, vo2Res, exerciseRes, distanceRes, speedRes, flightsRes].every(r => !r?.ok);

        if (kpiFailed) {
          renderStateCard(document.getElementById('analytics-kpis'), {
            title: strings.analytics.title,
            state: 'error',
            subtitle: strings.states.errorLoading,
            onRetry: loadAll,
          });
        } else {
          renderKPIs(dailyRes, prevDailyRes, hrvRes, prevHrvRes, sleepRes, prevSleepRes);
        }

        if (chartFailed) {
          renderStateCard(document.getElementById('analytics-chart-grid'), {
            title: strings.analytics.title,
            state: 'error',
            subtitle: strings.states.errorLoading,
            onRetry: loadAll,
          });
        } else {
          renderChartGrid(dailyRes, hrRes, hrvRes, sleepRes);
        }

        if (secondaryFailed) {
          renderStateCard(document.getElementById('secondary-metrics-grid'), {
            title: strings.analytics.secondaryMetrics,
            state: 'error',
            subtitle: strings.states.errorLoading,
            onRetry: loadAll,
          });
        } else {
          renderSecondaryMetrics(rhrRes, vo2Res, exerciseRes, distanceRes, speedRes, flightsRes);
        }
      } finally {
        window._loadingAnalytics = false;
      }
    }

    function renderNoHealthDataBanner() {
      const kpiEl = document.getElementById('analytics-kpis');
      const gridEl = document.getElementById('analytics-chart-grid');
      const secEl = document.getElementById('secondary-metrics-grid');
      [gridEl, secEl].forEach(el => { if (el) el.innerHTML = ''; });
      kpiEl.innerHTML = `
        <div class="empty-state" role="alert">
          <p>${strings.analytics.noHealthData}</p>
          <button class="filter-btn" id="analytics-go-activity">${strings.analytics.goToActivity}</button>
        </div>
      `;
      const btn = document.getElementById('analytics-go-activity');
      if (btn) btn.addEventListener('click', () => {
        if (api?.navigate) api.navigate('activity');
      });
    }

    function renderKPIs(dailyRes, prevDailyRes, hrvRes, prevHrvRes, sleepRes, prevSleepRes) {
      const el = document.getElementById('analytics-kpis');
      const s = strings.analytics;
      const daily = dailyRes?.ok ? dailyRes.data : [];
      const prevDaily = prevDailyRes?.ok ? prevDailyRes.data : [];
      const hrv = hrvRes?.ok ? hrvRes.data : [];
      const prevHrv = prevHrvRes?.ok ? prevHrvRes.data : [];
      const sleep = sleepRes?.ok ? sleepRes.data : [];
      const prevSleep = prevSleepRes?.ok ? prevSleepRes.data : [];

      const avgSteps = daily.length ? Math.round(daily.reduce((a, d) => a + d.steps, 0) / daily.length) : null;
      const totalEnergy = daily.length ? Math.round(daily.reduce((a, d) => a + d.kcal_activas + d.kcal_basales, 0)) : null;
      const hrDays = daily.filter(d => d.hr_media);
      const avgHr = hrDays.length ? Math.round(hrDays.reduce((a, d) => a + d.hr_media, 0) / hrDays.length) : null;
      const avgSleep = sleep.length ? Math.round(sleep.reduce((a, d) => a + d.hours, 0) / sleep.length * 10) / 10 : null;
      const avgHrv = hrv.length ? Math.round(hrv.reduce((a, d) => a + d.hrv_ms, 0) / hrv.length * 10) / 10 : null;

      const prevAvgSteps = prevDaily.length ? Math.round(prevDaily.reduce((a, d) => a + d.steps, 0) / prevDaily.length) : null;
      const prevTotalEnergy = prevDaily.length ? Math.round(prevDaily.reduce((a, d) => a + d.kcal_activas + d.kcal_basales, 0)) : null;
      const prevHrDays = prevDaily.filter(d => d.hr_media);
      const prevAvgHr = prevHrDays.length ? Math.round(prevHrDays.reduce((a, d) => a + d.hr_media, 0) / prevHrDays.length) : null;
      const prevAvgSleep = prevSleep.length ? Math.round(prevSleep.reduce((a, d) => a + d.hours, 0) / prevSleep.length * 10) / 10 : null;
      const prevAvgHrv = prevHrv.length ? Math.round(prevHrv.reduce((a, d) => a + d.hrv_ms, 0) / prevHrv.length * 10) / 10 : null;

      const cards = [
        { label: s.stepsAvg, value: avgSteps != null ? formatNumber(avgSteps) : '--', trend: getTrendArrow(avgSteps, prevAvgSteps) },
        { label: s.totalEnergy, value: totalEnergy != null ? `${formatNumber(totalEnergy)} ${s.kcal}` : '--', trend: getTrendArrow(totalEnergy, prevTotalEnergy) },
        { label: s.hrAvg, value: avgHr != null ? `${avgHr} ${s.bpm}` : `-- ${s.bpm}`, trend: getTrendArrow(avgHr, prevAvgHr) },
        { label: s.sleepAvg, value: avgSleep != null ? `${avgSleep} ${s.hours}` : '--', trend: getTrendArrow(avgSleep, prevAvgSleep) },
        { label: s.hrvAvg, value: avgHrv != null ? `${avgHrv} ${s.ms}` : '--', trend: getTrendArrow(avgHrv, prevAvgHrv) },
      ];

      el.innerHTML = cards.map(c => `
        <div class="analytics-kpi-card">
          <div class="kpi-label">${c.label}</div>
          <div class="kpi-value-row">
            <div class="kpi-value">${c.value}</div>
            <div class="kpi-trend ${c.trend.cls}">${c.trend.arrow}</div>
          </div>
        </div>
      `).join('');
    }

    function renderChartGrid(dailyRes, hrRes, hrvRes, sleepRes) {
      const grid = document.getElementById('analytics-chart-grid');
      const s = strings.analytics;

      grid.innerHTML = `
        <div class="chart-card"><h3>${s.stepsChart}</h3><div class="chart-container"><canvas id="chart-steps"></canvas></div></div>
        <div class="chart-card"><h3>${s.hrChart}</h3><div class="chart-container"><canvas id="chart-hr"></canvas></div></div>
        <div class="chart-card"><h3>${s.energyChart}</h3><div class="chart-container"><canvas id="chart-energy"></canvas></div></div>
        <div class="chart-card"><h3>${s.hrvChart}</h3><div class="chart-container"><canvas id="chart-hrv"></canvas></div></div>
        <div class="chart-card"><h3>${s.sleepChart}</h3><div class="chart-container"><canvas id="chart-sleep"></canvas></div></div>
        <div class="chart-card"><h3>${s.sleepDetailChart}</h3><div class="chart-container"><canvas id="chart-sleep-detail"></canvas></div></div>
      `;

      renderStepsChart(dailyRes);
      renderHRChart(hrRes);
      renderEnergyChart(dailyRes);
      renderHRVChart(hrvRes);
      renderSleepChart(sleepRes);
      renderSleepDetailChart(sleepRes);
    }

    function renderStepsChart(dailyRes) {
      const canvas = document.getElementById('chart-steps');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const data = dailyRes?.ok ? dailyRes.data : [];
      
      if (!data.length) {
        canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noSteps}</div>`;
        return;
      }

      const useWeekly = _state.range === '1m' || _state.range === '3m';
      const useMonthly = _state.range === 'year';
      
      let days, steps, ma7;
      
      if (useMonthly) {
        const monthlyData = aggregateToMonthly(data, 'dia', 'steps', 'sum');
        days = monthlyData.map(d => d.label);
        steps = monthlyData.map(d => d.value);
        ma7 = [];
      } else if (useWeekly) {
        const weeklyData = aggregateToWeekly(data, 'dia', 'steps', 'sum');
        days = weeklyData.map(d => d.label);
        steps = weeklyData.map(d => d.value);
        ma7 = [];
      } else {
        const sorted = [...data].sort((a, b) => new Date(a.dia) - new Date(b.dia));
        days = sorted.map(d => d.dia);
        steps = sorted.map(d => d.steps);
        ma7 = movingAverage(steps, 7);
      }

      createChart('steps', ctx, {
        type: 'line',
        data: {
          labels: days,
          datasets: [
            {
              label: strings.analytics.steps,
              data: steps,
              borderColor: chartColors.accent,
              backgroundColor: chartColorWithAlpha(chartColors.accent, 0.08),
              fill: true,
              tension: 0.3,
              pointRadius: 2,
              pointHoverRadius: 5,
            },
            ...(ma7.length > 0 ? [{
              label: strings.analytics.ma7,
              data: ma7,
              borderColor: chartColors.textSecondary,
              borderDash: [5, 3],
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 5,
              tension: 0.3,
              fill: false,
            }] : []),
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
            tooltip: { backgroundColor: TOOLTIP_BG, borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
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
      
      if (!data.length) {
        canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noHr}</div>`;
        return;
      }

      const useWeekly = _state.range === '1m' || _state.range === '3m';
      const useMonthly = _state.range === 'year';
      
      let days, avg, minV, maxV;
      
      if (useMonthly) {
        const monthlyAvg = aggregateToMonthly(data, 'date', 'avg_bpm', 'avg');
        const monthlyMin = aggregateToMonthly(data, 'date', 'min_bpm', 'min');
        const monthlyMax = aggregateToMonthly(data, 'date', 'max_bpm', 'max');
        days = monthlyAvg.map(d => d.label);
        avg = monthlyAvg.map(d => d.value);
        minV = monthlyMin.map(d => d.value);
        maxV = monthlyMax.map(d => d.value);
      } else if (useWeekly) {
        const weeklyAvg = aggregateToWeekly(data, 'date', 'avg_bpm', 'avg');
        const weeklyMin = aggregateToWeekly(data, 'date', 'min_bpm', 'min');
        const weeklyMax = aggregateToWeekly(data, 'date', 'max_bpm', 'max');
        days = weeklyAvg.map(d => d.label);
        avg = weeklyAvg.map(d => d.value);
        minV = weeklyMin.map(d => d.value);
        maxV = weeklyMax.map(d => d.value);
      } else {
        days = data.map(d => d.date);
        avg = data.map(d => d.avg_bpm);
        minV = data.map(d => d.min_bpm);
        maxV = data.map(d => d.max_bpm);
      }

      createChart('hr', ctx, {
        type: 'line',
        data: {
          labels: days,
          datasets: [
            {
              label: strings.analytics.max,
              data: maxV,
              borderColor: chartColorWithAlpha(chartColors.danger, 0.3),
              backgroundColor: 'transparent',
              pointRadius: 0,
              pointHoverRadius: 5,
              tension: 0.3,
              fill: '+1',
            },
            {
              label: strings.analytics.min,
              data: minV,
              borderColor: chartColorWithAlpha(chartColors.danger, 0.3),
              backgroundColor: chartColorWithAlpha(chartColors.danger, 0.06),
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
            tooltip: { backgroundColor: TOOLTIP_BG, borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
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
      
      if (!data.length) {
        canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noEnergy}</div>`;
        return;
      }

      const useWeekly = _state.range === '1m' || _state.range === '3m';
      const useMonthly = _state.range === 'year';
      
      let days, active, basal;
      
      if (useMonthly) {
        const monthlyActive = aggregateToMonthly(data, 'dia', 'kcal_activas', 'sum');
        const monthlyBasal = aggregateToMonthly(data, 'dia', 'kcal_basales', 'sum');
        days = monthlyActive.map(d => d.label);
        active = monthlyActive.map(d => d.value);
        basal = monthlyBasal.map(d => d.value);
      } else if (useWeekly) {
        const weeklyActive = aggregateToWeekly(data, 'dia', 'kcal_activas', 'sum');
        const weeklyBasal = aggregateToWeekly(data, 'dia', 'kcal_basales', 'sum');
        days = weeklyActive.map(d => d.label);
        active = weeklyActive.map(d => d.value);
        basal = weeklyBasal.map(d => d.value);
      } else {
        const sorted = [...data].sort((a, b) => new Date(a.dia) - new Date(b.dia));
        days = sorted.map(d => d.dia);
        active = sorted.map(d => d.kcal_activas);
        basal = sorted.map(d => d.kcal_basales);
      }

      const avgActive = Math.round(active.reduce((a, b) => a + b, 0) / active.length);
      const avgBasal = Math.round(basal.reduce((a, b) => a + b, 0) / basal.length);
      const ratio = avgBasal > 0 ? Math.round((avgActive / avgBasal) * 100) : 0;

      const contextKpis = `
        <div class="chart-context-kpis">
          <div class="context-kpi">
            <span class="context-kpi-value">${avgActive}</span>
            <span class="context-kpi-label">${strings.analytics.avgActiveKcal}</span>
          </div>
          <div class="context-kpi">
            <span class="context-kpi-value">${avgBasal}</span>
            <span class="context-kpi-label">${strings.analytics.avgBasalKcal}</span>
          </div>
          <div class="context-kpi">
            <span class="context-kpi-value">${ratio}%</span>
            <span class="context-kpi-label">${strings.analytics.activeBasalRatio}</span>
          </div>
        </div>
      `;

      canvas.parentElement.insertAdjacentHTML('beforebegin', contextKpis);

      createChart('energy', ctx, {
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
            tooltip: { backgroundColor: TOOLTIP_BG, borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
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
      
      if (!data.length) {
        canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noHrv}</div>`;
        return;
      }

      const useWeekly = _state.range === '1m' || _state.range === '3m';
      const useMonthly = _state.range === 'year';
      
      let days, values;
      
      if (useMonthly) {
        const monthlyData = aggregateToMonthly(data, 'date', 'hrv_ms', 'avg');
        days = monthlyData.map(d => d.label);
        values = monthlyData.map(d => d.value);
      } else if (useWeekly) {
        const weeklyData = aggregateToWeekly(data, 'date', 'hrv_ms', 'avg');
        days = weeklyData.map(d => d.label);
        values = weeklyData.map(d => d.value);
      } else {
        days = data.map(d => d.date);
        values = data.map(d => d.hrv_ms);
      }

      createChart('hrv', ctx, {
        type: 'line',
        data: {
          labels: days,
          datasets: [{
            label: strings.analytics.hrv,
            data: values,
            borderColor: chartColors.success,
            backgroundColor: chartColorWithAlpha(chartColors.success, 0.08),
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
            tooltip: { backgroundColor: TOOLTIP_BG, borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
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
      
      if (!data.length) {
        canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noSleep}</div>`;
        return;
      }

      const useWeekly = _state.range === '1m' || _state.range === '3m';
      const useMonthly = _state.range === 'year';
      
      let days, hours, ma7;
      
      if (useMonthly) {
        const monthlyData = aggregateToMonthly(data, 'night', 'hours', 'avg');
        days = monthlyData.map(d => d.label);
        hours = monthlyData.map(d => d.value);
        ma7 = [];
      } else if (useWeekly) {
        const weeklyData = aggregateToWeekly(data, 'night', 'hours', 'avg');
        days = weeklyData.map(d => d.label);
        hours = weeklyData.map(d => d.value);
        ma7 = [];
      } else {
        days = data.map(d => d.night);
        hours = data.map(d => d.hours);
        ma7 = movingAverage(hours, 7);
      }

      createChart('sleep', ctx, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [
            {
              label: strings.analytics.sleep,
              data: hours,
              backgroundColor: chartColors.accentHover,
              borderRadius: 3,
              order: 2,
            },
            ...(ma7.length > 0 ? [{
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
            }] : []),
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
            tooltip: { backgroundColor: TOOLTIP_BG, borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
          },
          scales: {
            x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: chartColors.textSecondary, font: { size: 10 } }, grid: { color: chartColors.grid } },
          },
        },
      });
    }

    function renderSleepDetailChart(sleepRes) {
      const canvas = document.getElementById('chart-sleep-detail');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const data = sleepRes?.ok ? sleepRes.data : [];
      
      if (!data.length) {
        canvas.parentElement.innerHTML = `<div class="chart-empty">${strings.analytics.noSleep}</div>`;
        return;
      }

      const useWeekly = _state.range === '1m' || _state.range === '3m';
      const useMonthly = _state.range === 'year';
      
      let days, deep, rem, light;
      
      if (useMonthly) {
        const monthlyDeep = aggregateToMonthly(data, 'night', 'deep', 'avg');
        const monthlyRem = aggregateToMonthly(data, 'night', 'rem', 'avg');
        const monthlyLight = aggregateToMonthly(data, 'night', 'light', 'avg');
        days = monthlyDeep.map(d => d.label);
        deep = monthlyDeep.map(d => d.value);
        rem = monthlyRem.map(d => d.value);
        light = monthlyLight.map(d => d.value);
      } else if (useWeekly) {
        const weeklyDeep = aggregateToWeekly(data, 'night', 'deep', 'avg');
        const weeklyRem = aggregateToWeekly(data, 'night', 'rem', 'avg');
        const weeklyLight = aggregateToWeekly(data, 'night', 'light', 'avg');
        days = weeklyDeep.map(d => d.label);
        deep = weeklyDeep.map(d => d.value);
        rem = weeklyRem.map(d => d.value);
        light = weeklyLight.map(d => d.value);
      } else {
        days = data.map(d => d.night);
        deep = data.map(d => d.deep || 0);
        rem = data.map(d => d.rem || 0);
        light = data.map(d => d.light || 0);
      }

      createChart('sleepDetail', ctx, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [
            {
              label: 'Profundo',
              data: deep,
              backgroundColor: '#1e3a8a',
              borderRadius: 0,
            },
            {
              label: 'REM',
              data: rem,
              backgroundColor: '#7c3aed',
              borderRadius: 0,
            },
            {
              label: 'Ligero',
              data: light,
              backgroundColor: '#94a3b8',
              borderRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
            tooltip: { 
              backgroundColor: TOOLTIP_BG, 
              borderRadius: 6, 
              padding: 10, 
              titleColor: chartColors.textPrimary, 
              bodyColor: chartColors.textSecondary,
              callbacks: {
                label: (context) => {
                  const value = context.parsed.y;
                  return `${context.dataset.label}: ${value.toFixed(1)}h`;
                }
              }
            },
          },
          scales: {
            x: { stacked: true, ticks: { color: chartColors.textSecondary, maxTicksLimit: 10, font: { size: 10 } }, grid: { display: false } },
            y: { stacked: true, beginAtZero: true, ticks: { color: chartColors.textSecondary, font: { size: 10 }, callback: (value) => value + 'h' }, grid: { color: chartColors.grid } },
          },
        },
      });
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

      function statsRow(kpi, unit) {
        return `<div class="flex-gap-sm text-xs" style="margin-bottom:8px">
          <span><strong>${s.current}:</strong> ${kpi.current != null ? kpi.current.toFixed(1) + unit : '--'}</span>
          <span><strong>${s.avg}:</strong> ${kpi.avg.toFixed(1) + unit}</span>
          <span><strong>${s.min}:</strong> ${kpi.min.toFixed(1) + unit}</span>
          <span><strong>${s.max}:</strong> ${kpi.max.toFixed(1) + unit}</span>
        </div>`;
      }

      const metrics = [
        { key: 'rhr', title: s.rhr, data: rhrRes?.ok ? rhrRes.data : [], valueKey: 'rhr_bpm', emptyMsg: s.noRhr, color: chartColors.danger, unit: ' bpm' },
        { key: 'vo2', title: s.vo2max, data: vo2Res?.ok ? vo2Res.data : [], valueKey: 'vo2_max', emptyMsg: s.noVo2max, color: chartColors.success, unit: '' },
        { key: 'exercise', title: s.exerciseTime, data: exerciseRes?.ok ? exerciseRes.data : [], valueKey: 'minutes', emptyMsg: s.noExerciseTime, color: chartColors.warning, unit: ' min' },
        { key: 'speed', title: s.walkingSpeed, data: speedRes?.ok ? speedRes.data : [], valueKey: 'speed_kmh', emptyMsg: s.noWalkingSpeed, color: chartColors.accent, unit: ' km/h' },
        { key: 'flights', title: s.flightsClimbed, data: flightsRes?.ok ? flightsRes.data : [], valueKey: 'count', emptyMsg: s.noFlights, color: chartColors.textSecondary, unit: '' },
      ];

      const dist = distanceRes?.ok ? distanceRes.data : null;
      const walkKpi = computeKPI(dist?.walking || [], 'km');
      const cycleKpi = computeKPI(dist?.cycling || [], 'km');

      grid.innerHTML = metrics.map(m => {
        const kpi = computeKPI(m.data, m.valueKey);
        return `
          <div class="mini-chart-card">
            <h4>${m.title}</h4>
            ${kpi ? statsRow(kpi, m.unit) : ''}
            <div class="chart-container"><canvas id="mini-${m.key}"></canvas></div>
          </div>
        `;
      }).join('') + `
        <div class="mini-chart-card">
          <h4>${s.walkingDistance}</h4>
          ${walkKpi ? statsRow(walkKpi, ' km') : ''}
          <div class="chart-container"><canvas id="mini-walk-dist"></canvas></div>
        </div>
        <div class="mini-chart-card">
          <h4>${s.cyclingDistance}</h4>
          ${cycleKpi ? statsRow(cycleKpi, ' km') : ''}
          <div class="chart-container"><canvas id="mini-cycle-dist"></canvas></div>
        </div>
      `;

      metrics.forEach(m => renderMiniChart(m.key, m.data, m.valueKey, m.emptyMsg, m.color, m.unit));
      renderMiniDistanceChart('walk-dist', dist?.walking || [], 'km', s.noDistance, chartColors.accent, ' km');
      renderMiniDistanceChart('cycle-dist', dist?.cycling || [], 'km', s.noDistance, chartColors.accentHover, ' km');
    }

    function renderMiniChart(id, data, valueKey, emptyMsg, color, unit) {
      const canvas = document.getElementById(`mini-${id}`);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      if (!data.length) {
        canvas.parentElement.innerHTML = `<div class="chart-empty">${emptyMsg}</div>`;
        return;
      }

      const useWeekly = _state.range === '1m' || _state.range === '3m';
      const useMonthly = _state.range === 'year';
      
      let labels, values;
      
      if (useMonthly) {
        const monthlyData = aggregateToMonthly(data, 'date', valueKey, 'avg');
        labels = monthlyData.map(d => d.label);
        values = monthlyData.map(d => d.value);
      } else if (useWeekly) {
        const weeklyData = aggregateToWeekly(data, 'date', valueKey, 'avg');
        labels = weeklyData.map(d => d.label);
        values = weeklyData.map(d => d.value);
      } else {
        const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        labels = sorted.map(d => d.date);
        values = sorted.map(d => d[valueKey]);
      }

      createChart(id, ctx, {
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
          plugins: { legend: { display: false }, tooltip: { backgroundColor: TOOLTIP_BG, borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary } },
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

      const useWeekly = _state.range === '1m' || _state.range === '3m';
      const useMonthly = _state.range === 'year';
      
      let labels, values;
      
      if (useMonthly) {
        const monthlyData = aggregateToMonthly(data, 'date', valueKey, 'sum');
        labels = monthlyData.map(d => d.label);
        values = monthlyData.map(d => d.value);
      } else if (useWeekly) {
        const weeklyData = aggregateToWeekly(data, 'date', valueKey, 'sum');
        labels = weeklyData.map(d => d.label);
        values = weeklyData.map(d => d.value);
      } else {
        const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        labels = sorted.map(d => d.date);
        values = sorted.map(d => d[valueKey]);
      }

      createChart(id, ctx, {
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
          plugins: { legend: { display: false }, tooltip: { backgroundColor: TOOLTIP_BG, borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary } },
          scales: {
            x: { display: true, ticks: { color: chartColors.textSecondary, font: { size: 9 }, maxTicksLimit: 6 }, grid: { display: false } },
            y: { display: true, ticks: { color: chartColors.textSecondary, font: { size: 9 }, maxTicksLimit: 4 }, grid: { color: chartColors.grid } },
          },
        },
      });
    }

    window._loadingAnalytics = false;
    await applyRange('7d');
  } finally {
    window._loadingAnalytics = false;
  }
}
