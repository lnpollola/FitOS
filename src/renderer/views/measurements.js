import Chart from 'chart.js/auto';
import { strings, getMeasurementLabel } from '../locales/es.js';
import { calculateBodyFat } from '../utils/body-fat.js';

const METRIC_COLUMNS = [
  'chest_cm', 'neck_cm', 'shoulders_cm', 'biceps_left_cm', 'biceps_right_cm',
  'forearms_left_cm', 'forearms_right_cm', 'waist_cm', 'hips_cm',
  'thighs_left_cm', 'thighs_right_cm', 'calves_left_cm', 'calves_right_cm',
];

const CHART_COLORS = [
  '#0D9488', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
  '#F43F5E', '#A855F7', '#0EA5E9',
];

const CNS_COLORS = { chest: '#0D9488', neck: '#F59E0B', shoulders: '#6366F1' };

function formatDelta(delta, metricKey) {
  const sign = delta > 0 ? '+' : '';
  const isNeg = metricKey.includes('waist') || metricKey === 'weight_kg';
  const cls = isNeg ? (delta > 0 ? 'style="color:var(--danger)"' : 'style="color:var(--success)"') : (delta > 0 ? 'style="color:var(--success)"' : 'style="color:var(--danger)"');
  return `<span ${cls}>${sign}${delta.toFixed(1)}</span>`;
}

export async function init() {
  if (window._loadingMeasurements) return;
  window._loadingMeasurements = true;
  const container = document.getElementById('view-measurements');

  const formFields = METRIC_COLUMNS.map(m => `
    <div class="form-group">
      <label>${getMeasurementLabel(m)} (cm)</label>
      <input type="number" name="${m}" min="0" max="200" step="0.1" />
    </div>
  `).join('');

  container.innerHTML = `
    <h2 class="view-title">${strings.measurements.title}</h2>
    <div class="card">
      <h2>${strings.measurements.fullEntry}</h2>
      <form id="measurement-form" class="form-row-3">
        <div class="form-group form-row-full">
          <label>${strings.measurements.date}</label>
          <input type="date" name="date" required />
        </div>
        ${formFields}
        <div class="form-group">
          <label>${strings.measurements.weight}</label>
          <input type="number" name="weight_kg" min="20" max="300" step="0.1" />
        </div>
        <div class="form-row-full">
          <button type="submit" class="btn btn-primary">${strings.measurements.saveMeasurement}</button>
        </div>
      </form>
    </div>
    <div class="card">
      <h2>${strings.measurements.quickWeight}</h2>
      <form id="weight-form" class="flex-row" style="align-items:end">
        <div class="form-group">
          <label>${strings.measurements.date}</label>
          <input type="date" name="date" required />
        </div>
        <div class="form-group">
          <label>${strings.measurements.weight}</label>
          <input type="number" name="weight_kg" min="20" max="300" step="0.1" required />
        </div>
        <button type="submit" class="btn btn-primary">${strings.measurements.saveWeight}</button>
      </form>
    </div>
    <div class="card">
      <h2>${strings.measurements.bodyFatEstimate}</h2>
      <div id="body-fat-estimate"><div class="empty-state"><p>${strings.measurements.bodyFatEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.measurements.measurementHistory}</h2>
      <div id="measurement-history"><div class="empty-state"><p>${strings.measurements.noMeasurements}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.measurements.weightTrend}</h2>
      <div class="chart-container"><canvas id="weight-chart"></canvas></div>
      <div id="weight-monthly-summary" style="margin-top:12px"></div>
    </div>
    <div id="measurement-charts-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px"></div>
    <div class="card">
      <h2>${strings.measurements.bodyFatTrend}</h2>
      <div class="chart-container"><canvas id="bodyfat-chart"></canvas></div>
    </div>
    <div class="card" id="cns-chart-card" style="display:none">
      <h2>${strings.measurements.chestNeckShoulders}</h2>
      <div class="chart-container"><canvas id="cns-chart"></canvas></div>
    </div>
    <div class="card">
      <h2>${strings.measurements.beforeAfter}</h2>
      <div style="display:flex;gap:12px;align-items:end;margin-bottom:16px;flex-wrap:wrap">
        <div class="form-group">
          <label>${strings.measurements.beforeDate}</label>
          <input type="date" id="before-date" />
        </div>
        <div class="form-group">
          <label>${strings.measurements.afterDate}</label>
          <input type="date" id="after-date" />
        </div>
        <button class="btn btn-primary" id="btn-compare">${strings.measurements.compare}</button>
      </div>
      <div id="comparison-result" style="overflow-x:auto"></div>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) { window._loadingMeasurements = false; return; }

  async function prefillForm() {
    const latest = await api.getLatestMeasurementSet();
    if (latest) {
      document.querySelector('#measurement-form input[name="date"]').value = new Date().toISOString().split('T')[0];
      for (const col of METRIC_COLUMNS) {
        const input = document.querySelector(`#measurement-form input[name="${col}"]`);
        if (input && latest[col] != null) input.value = latest[col];
      }
      const weightInput = document.querySelector('#measurement-form input[name="weight_kg"]');
      if (weightInput && latest.weight_kg != null) weightInput.value = latest.weight_kg;
    }
  }

  document.getElementById('measurement-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    for (const key of Object.keys(data)) {
      if (key !== 'date' && data[key] !== '') data[key] = parseFloat(data[key]);
      else if (key !== 'date' && data[key] === '') data[key] = null;
    }
    await api.saveMeasurementSet(data);
    loadAll();
  });

  document.getElementById('weight-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.weight_kg = parseFloat(data.weight_kg);
    await api.saveWeightEntry(data);
    loadAll();
  });

  document.getElementById('btn-compare').addEventListener('click', loadComparison);

  async function loadAll() {
    await Promise.all([
      loadHistory(),
      loadWeightChart(),
      loadMeasurementCharts(),
      loadBodyFatChart(),
      loadBodyFatEstimate(),
      loadChestNeckShouldersChart(),
    ]);
  }

  async function loadBodyFatEstimate() {
    const profile = await api.getProfile();
    const sets = await api.getMeasurementSets();
    const el = document.getElementById('body-fat-estimate');
    if (!sets || sets.length === 0 || !profile) {
      el.innerHTML = `<div class="empty-state"><p>${strings.measurements.bodyFatEmpty}</p></div>`;
      return;
    }
    const latest = sets[0];
    if (!latest.neck_cm || !latest.waist_cm || !latest.hips_cm) {
      el.innerHTML = `<div class="empty-state"><p>${strings.measurements.bodyFatEmptyDetail}</p></div>`;
      return;
    }
    const bf = calculateBodyFat(latest.neck_cm, latest.waist_cm, latest.hips_cm, profile.sex, profile.height_cm);
    if (bf !== null) {
      el.innerHTML = `
        <p>${strings.measurements.estimatedBodyFat}: <strong>${bf.toFixed(1)}%</strong></p>
        <p style="font-size:12px;color:var(--text-secondary);margin-top:4px">${strings.measurements.navyMethod}</p>
      `;
    }
  }

  async function loadHistory() {
    const sets = await api.getMeasurementSets();
    const el = document.getElementById('measurement-history');
    if (!sets || sets.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.measurements.noMeasurements}</p></div>`;
      return;
    }
    const allCols = [...METRIC_COLUMNS, 'weight_kg'];
    const headers = ['Fecha', ...allCols.map(c => getMeasurementLabel(c)), ''];
    const showAll = el.dataset.showAll === 'true';
    const displaySets = showAll ? sets : sets.slice(0, 5);
    let html = '<div style="overflow-x:auto"><table><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
    const profile = await api.getProfile();
    for (let i = 0; i < displaySets.length; i++) {
      const s = displaySets[i];
      const rowClass = i % 2 === 1 ? ' style="background:var(--bg-tertiary)"' : '';
      html += `<tr${rowClass}><td>${s.date}</td>`;
      for (const col of allCols) {
        const val = s[col];
        html += `<td>${val != null ? val.toFixed(1) : '--'}</td>`;
      }
      html += `<td><button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-delete-measurement="${s.id}">${strings.general.delete}</button></td>`;
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    if (sets.length > 5) {
      html += `<button class="btn btn-secondary" id="toggle-history" style="margin-top:8px">${showAll ? strings.measurements.showLess : strings.measurements.showAll}</button>`;
    }
    el.innerHTML = html;

    const toggleBtn = document.getElementById('toggle-history');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        el.dataset.showAll = showAll ? 'false' : 'true';
        loadHistory();
      });
    }

    el.querySelectorAll('[data-delete-measurement]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm(strings.importExport?.confirmImport || '¿Eliminar esta medición?')) {
          await api.deleteMeasurementSet(parseInt(btn.dataset.deleteMeasurement));
          loadAll();
        }
      });
    });
  }

  async function loadWeightChart() {
    const weights = await api.getWeightEntries();
    const canvas = document.getElementById('weight-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (window._weightChart) window._weightChart.destroy();

    if (!weights || weights.length === 0) {
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';

    const sorted = [...weights].reverse();
    const labels = sorted.map(w => w.date);
    const data = sorted.map(w => w.weight_kg);

    const movingAvg = [];
    const windowSize = 7;
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const slice = data.slice(start, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      movingAvg.push(avg);
    }

    window._weightChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: strings.measurements.weight,
            data,
            borderColor: '#0D9488',
            backgroundColor: 'transparent',
            pointRadius: 3,
            pointBackgroundColor: '#0D9488',
            tension: 0.3,
          },
          {
            label: strings.measurements.sevenDayMa,
            data: movingAvg,
            borderColor: '#14B8A6',
            backgroundColor: 'rgba(20, 184, 166, 0.05)',
            borderDash: [5, 5],
            pointRadius: 0,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#64748B' } } },
        scales: {
          y: { ticks: { color: '#64748B' }, grid: { color: '#E2E8F0' } },
          x: { ticks: { color: '#64748B', maxTicksLimit: 10 } },
        },
      },
    });

    const summaryEl = document.getElementById('weight-monthly-summary');
    const monthGroups = {};
    for (const w of weights) {
      const key = w.date.substring(0, 7);
      if (!monthGroups[key]) monthGroups[key] = [];
      monthGroups[key].push(w.weight_kg);
    }
    const months = Object.keys(monthGroups).sort();
    let prevAvg = null;
    let summaryHtml = `<table style="width:100%;font-size:13px"><thead><tr><th>${strings.measurements.month}</th><th>${strings.measurements.avgWeight}</th><th>${strings.measurements.monthDelta}</th></tr></thead><tbody>`;
    for (const m of months) {
      const vals = monthGroups[m];
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const monthName = new Date(m + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      summaryHtml += `<tr><td>${monthName}</td><td>${avg.toFixed(1)} kg</td><td>`;
      if (prevAvg !== null) {
        const diff = avg - prevAvg;
        summaryHtml += formatDelta(diff, 'weight_kg');
      } else {
        summaryHtml += '--';
      }
      summaryHtml += '</td></tr>';
      prevAvg = avg;
    }
    summaryHtml += '</tbody></table>';
    summaryEl.innerHTML = summaryHtml;
  }

  async function loadMeasurementCharts() {
    const sets = await api.getMeasurementSets();
    const grid = document.getElementById('measurement-charts-grid');
    if (!sets || sets.length < 2) {
      grid.innerHTML = '';
      return;
    }

    const sorted = [...sets].reverse();

    grid.innerHTML = METRIC_COLUMNS.map((col, idx) => {
      const vals = sorted.map(s => s[col]).filter(v => v != null);
      const latest = vals[vals.length - 1];
      let kpiHtml = '';
      if (latest != null) {
        kpiHtml += `<span style="font-size:20px;font-weight:700">${latest.toFixed(1)}</span> <span style="font-size:12px;color:var(--text-secondary)">cm</span>`;
        if (vals.length >= 2) {
          const delta = latest - vals[vals.length - 2];
          kpiHtml += `<span style="font-size:12px;margin-left:8px">${formatDelta(delta, col)}</span>`;
        }
      }
      return `
        <div class="card" style="padding:14px;position:relative">
          <h3 style="font-size:13px;margin-bottom:4px">${getMeasurementLabel(col)}</h3>
          <div style="margin-bottom:4px">${kpiHtml}</div>
          <div class="chart-container" style="height:140px"><canvas id="chart-${col}"></canvas></div>
        </div>
      `;
    }).join('');

    for (let i = 0; i < METRIC_COLUMNS.length; i++) {
      const col = METRIC_COLUMNS[i];
      const canvas = document.getElementById(`chart-${col}`);
      if (!canvas) continue;
      const ctx = canvas.getContext('2d');
      const chartKey = `_meas${col.replace(/_/g, '')}Chart`;
      if (window[chartKey]) window[chartKey].destroy();

      const labels = sorted.map(s => s.date);
      const data = sorted.map(s => s[col]).filter(v => v != null);

      if (data.length < 2) {
        canvas.parentElement.innerHTML = `<div class="chart-empty" style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px">${strings.measurements.noMeasurements}</div>`;
        continue;
      }

      window[chartKey] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels.slice(0, data.length),
          datasets: [{
            label: getMeasurementLabel(col),
            data,
            borderColor: CHART_COLORS[i % CHART_COLORS.length],
            backgroundColor: 'transparent',
            tension: 0.3,
            pointRadius: 3,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { ticks: { color: '#64748B' }, grid: { color: '#E2E8F0' } },
            x: { ticks: { color: '#64748B', maxTicksLimit: 8 } },
          },
        },
      });
    }
  }

  async function loadBodyFatChart() {
    const sets = await api.getMeasurementSets();
    const profile = await api.getProfile();
    const canvas = document.getElementById('bodyfat-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (window._bfChart) window._bfChart.destroy();

    if (!sets || sets.length < 2 || !profile) {
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';

    const sorted = [...sets].reverse();
    const labels = [];
    const bfData = [];
    for (const s of sorted) {
      if (s.neck_cm && s.waist_cm && s.hips_cm) {
        const bf = calculateBodyFat(s.neck_cm, s.waist_cm, s.hips_cm, profile.sex, profile.height_cm);
        if (bf !== null) {
          labels.push(s.date);
          bfData.push(bf);
        }
      }
    }

    if (bfData.length < 2) {
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';

    window._bfChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: strings.measurements.bodyFatPercent,
          data: bfData,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          fill: true,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#64748B' } } },
        scales: {
          y: { ticks: { color: '#64748B' }, grid: { color: '#E2E8F0' } },
          x: { ticks: { color: '#64748B', maxTicksLimit: 10 } },
        },
      },
    });
  }

  async function loadChestNeckShouldersChart() {
    const sets = await api.getMeasurementSets();
    const card = document.getElementById('cns-chart-card');
    if (!sets || sets.length < 2) {
      card.style.display = 'none';
      return;
    }
    const sorted = [...sets].reverse();
    const hasData = ['chest_cm', 'neck_cm', 'shoulders_cm'].some(c => sorted.some(s => s[c] != null));
    if (!hasData) {
      card.style.display = 'none';
      return;
    }
    card.style.display = 'block';

    const canvas = document.getElementById('cns-chart');
    const ctx = canvas.getContext('2d');
    if (window._cnsChart) window._cnsChart.destroy();

    const labels = sorted.map(s => s.date);
    const datasets = [];
    const kpis = [];
    for (const [key, color] of Object.entries(CNS_COLORS)) {
      const col = key + '_cm';
      const data = sorted.map(s => s[col]).filter(v => v != null);
      if (data.length < 2) continue;

      const n = data.length;
      const xMean = (n - 1) / 2;
      const yMean = data.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) {
        num += (i - xMean) * (data[i] - yMean);
        den += (i - xMean) ** 2;
      }
      const slope = den ? num / den : 0;
      const intercept = yMean - slope * xMean;
      const trendData = data.map((_, i) => intercept + slope * i);

      datasets.push({
        label: getMeasurementLabel(col),
        data,
        borderColor: color,
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 3,
      });
      datasets.push({
        label: `${getMeasurementLabel(col)} (tendencia)`,
        data: trendData,
        borderColor: color,
        borderDash: [4, 4],
        pointRadius: 0,
        borderWidth: 1.5,
      });
      kpis.push(`<span style="font-size:12px;margin-right:12px"><span style="color:${color};font-weight:700">${getMeasurementLabel(col)}</span>: ${data[data.length - 1].toFixed(1)}</span>`);
    }

    if (datasets.length === 0) {
      card.style.display = 'none';
      return;
    }

    const kpiContainer = card.querySelector('h2');
    if (kpiContainer && kpiContainer.parentElement) {
      const existingKpi = card.querySelector('.cns-kpi');
      if (existingKpi) existingKpi.remove();
      const kpiDiv = document.createElement('div');
      kpiDiv.className = 'cns-kpi';
      kpiDiv.style.cssText = 'margin-bottom:8px;font-size:13px';
      kpiDiv.innerHTML = kpis.join('');
      kpiContainer.parentElement.insertBefore(kpiDiv, kpiContainer.nextSibling);
    }

    window._cnsChart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#64748B', font: { size: 11 } } } },
        scales: {
          y: { ticks: { color: '#64748B' }, grid: { color: '#E2E8F0' } },
          x: { ticks: { color: '#64748B', maxTicksLimit: 8 } },
        },
      },
    });
  }

  async function loadComparison() {
    const beforeDate = document.getElementById('before-date').value;
    const afterDate = document.getElementById('after-date').value;
    if (!beforeDate || !afterDate) return;

    const sets = await api.getMeasurementSets();
    const before = sets.find(s => s.date === beforeDate);
    const after = sets.find(s => s.date === afterDate);
    const el = document.getElementById('comparison-result');

    if (!before || !after) {
      el.innerHTML = `<div class="empty-state"><p>${strings.measurements.noMeasurementsFound}</p></div>`;
      return;
    }

    const allCols = ['weight_kg', ...METRIC_COLUMNS];
    let html = '<table><thead><tr><th>' + strings.measurements.metricLabel + '</th><th>' + strings.measurements.before + '</th><th>' + strings.measurements.after + '</th><th>' + strings.measurements.delta + '</th></tr></thead><tbody>';
    for (const m of allCols) {
      const bVal = before[m];
      const aVal = after[m];
      if (bVal != null && aVal != null) {
        const delta = aVal - bVal;
        html += `<tr><td>${getMeasurementLabel(m)}</td><td>${bVal.toFixed(1)}</td><td>${aVal.toFixed(1)}</td><td>${formatDelta(delta, m)}</td></tr>`;
      }
    }
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  await prefillForm();
  await loadAll();
  window._loadingMeasurements = false;
}
