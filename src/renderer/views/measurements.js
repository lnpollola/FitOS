import Chart from 'chart.js/auto';
import { strings, getMeasurementLabel } from '../locales/es.js';

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
    </div>
    <div id="measurement-charts-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px"></div>
    <div class="card">
      <h2>${strings.measurements.bodyFatTrend}</h2>
      <div class="chart-container"><canvas id="bodyfat-chart"></canvas></div>
    </div>
    <div class="card">
      <h2>${strings.measurements.beforeAfter}</h2>
      <div style="display:flex;gap:12px;align-items:end;margin-bottom:16px">
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
      <div id="comparison-result"></div>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) { window._loadingMeasurements = false; return; }

  // Pre-fill form with latest measurement set
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
    ]);
  }

  function calculateBodyFat(neck, waist, hips, sex, height) {
    if (!neck || !waist || !hips || !sex || !height) return null;
    if (sex === 'male') {
      const logVal = Math.log10(waist - neck);
      const bf = 86.010 * logVal - 70.041 * Math.log10(height) + 36.76;
      return Math.max(bf, 3);
    } else {
      const logVal = Math.log10(waist + hips - neck);
      const bf = 163.205 * logVal - 97.684 * Math.log10(height) - 78.387;
      return Math.max(bf, 10);
    }
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
    const headers = ['Fecha', ...allCols.map(c => getMeasurementLabel(c))];
    let html = '<table><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
    const profile = await api.getProfile();
    for (let i = 0; i < sets.length; i++) {
      const s = sets[i];
      const rowClass = i % 2 === 1 ? ' style="background:var(--bg-tertiary)"' : '';
      html += `<tr${rowClass}><td>${s.date}</td>`;
      for (const col of allCols) {
        const val = s[col];
        html += `<td>${val != null ? val.toFixed(1) : '--'}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    el.innerHTML = html;
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
  }

  async function loadMeasurementCharts() {
    const sets = await api.getMeasurementSets();
    const grid = document.getElementById('measurement-charts-grid');
    if (!sets || sets.length < 2) {
      grid.innerHTML = '';
      return;
    }

    const sorted = [...sets].reverse();

    grid.innerHTML = METRIC_COLUMNS.map((col, idx) => `
      <div class="card" style="padding:14px">
        <h3 style="font-size:13px;margin-bottom:8px">${getMeasurementLabel(col)}</h3>
        <div class="chart-container" style="height:200px"><canvas id="chart-${col}"></canvas></div>
      </div>
    `).join('');

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
    let html = '<table><thead><tr><th>Métrica</th><th>Antes</th><th>Después</th><th>Delta</th></tr></thead><tbody>';
    for (const m of allCols) {
      const bVal = before[m];
      const aVal = after[m];
      if (bVal != null && aVal != null) {
        const delta = aVal - bVal;
        const sign = delta > 0 ? '+' : '';
        const isNeg = m.includes('waist') || m.includes('weight');
        const cls = isNeg ? (delta > 0 ? 'style="color:var(--danger)"' : 'style="color:var(--success)"') : '';
        html += `<tr><td>${getMeasurementLabel(m)}</td><td>${bVal.toFixed(1)}</td><td>${aVal.toFixed(1)}</td><td ${cls}>${sign}${delta.toFixed(1)}</td></tr>`;
      }
    }
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  await prefillForm();
  await loadAll();
  window._loadingMeasurements = false;
}
