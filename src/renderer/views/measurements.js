import Chart from 'chart.js/auto';
import { strings } from '../locales/es.js';

export function init() {
  const container = document.getElementById('view-measurements');
  container.innerHTML = `
    <h2 style="margin-bottom:20px">${strings.measurements.title}</h2>
    <div class="card">
      <h2>${strings.measurements.fullEntry}</h2>
      <form id="measurement-form" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
        <div class="form-group" style="grid-column:span 3">
          <label>${strings.measurements.date}</label>
          <input type="date" name="date" required />
        </div>
        ${['chest','neck','shoulders','biceps_left','biceps_right','forearms_left','forearms_right','waist','hips','thighs_left','thighs_right','calves_left','calves_right'].map(m => `
          <div class="form-group">
            <label>${m.replace(/_/g,' ')} (cm)</label>
            <input type="number" name="${m}_cm" min="0" max="200" step="0.1" />
          </div>
        `).join('')}
        <div class="form-group">
          <label>${strings.measurements.weight}</label>
          <input type="number" name="weight_kg" min="20" max="300" step="0.1" />
        </div>
        <div style="grid-column:span 3">
          <button type="submit" class="btn btn-primary">${strings.measurements.saveMeasurement}</button>
        </div>
      </form>
    </div>
    <div class="card">
      <h2>${strings.measurements.quickWeight}</h2>
      <form id="weight-form" style="display:flex;gap:12px;align-items:end">
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
      <canvas id="weight-chart" height="250"></canvas>
    </div>
    <div class="card">
      <h2>${strings.measurements.measurementTrends}</h2>
      <canvas id="measurement-chart" height="250"></canvas>
      <div style="margin-top:12px">
        <label style="font-size:13px;color:var(--text-secondary);margin-right:8px">${strings.measurements.metric}:</label>
        <select id="trend-metric" style="padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary)">
          <option value="waist_cm">Cintura</option>
          <option value="chest_cm">Pecho</option>
          <option value="neck_cm">Cuello</option>
          <option value="shoulders_cm">Hombros</option>
          <option value="hips_cm">Cadera</option>
        </select>
      </div>
    </div>
    <div class="card">
      <h2>${strings.measurements.bodyFatTrend}</h2>
      <canvas id="bodyfat-chart" height="250"></canvas>
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
  if (!api) return;

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

  document.getElementById('trend-metric').addEventListener('change', loadMeasurementChart);
  document.getElementById('btn-compare').addEventListener('click', loadComparison);

  async function loadAll() {
    loadHistory();
    loadWeightChart();
    loadMeasurementChart();
    loadBodyFatChart();
    loadBodyFatEstimate();
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
    let html = '<table><thead><tr><th>Fecha</th><th>Peso</th><th>Pecho</th><th>Cintura</th><th>Cuello</th><th>Cadera</th><th>%GC</th></tr></thead><tbody>';
    const profile = await api.getProfile();
    for (const s of sets) {
      let bf = '--';
      if (s.neck_cm && s.waist_cm && s.hips_cm && profile) {
        const bfVal = calculateBodyFat(s.neck_cm, s.waist_cm, s.hips_cm, profile.sex, profile.height_cm);
        if (bfVal !== null) bf = bfVal.toFixed(1) + '%';
      }
      html += `<tr><td>${s.date}</td><td>${s.weight_kg ?? '--'}</td><td>${s.chest_cm ?? '--'}</td><td>${s.waist_cm ?? '--'}</td><td>${s.neck_cm ?? '--'}</td><td>${s.hips_cm ?? '--'}</td><td>${bf}</td></tr>`;
    }
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  async function loadWeightChart() {
    const weights = await api.getWeightEntries();
    const canvas = document.getElementById('weight-chart');
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
            borderColor: '#e94560',
            backgroundColor: 'transparent',
            pointRadius: 3,
            tension: 0.3,
          },
          {
            label: strings.measurements.sevenDayMa,
            data: movingAvg,
            borderColor: '#4ecdc4',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            pointRadius: 0,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#a0a0b0' } } },
        scales: {
          y: { ticks: { color: '#a0a0b0' }, grid: { color: '#2a2a4e' } },
          x: { ticks: { color: '#a0a0b0', maxTicksLimit: 10 } },
        },
      },
    });
  }

  async function loadMeasurementChart() {
    const sets = await api.getMeasurementSets();
    const canvas = document.getElementById('measurement-chart');
    const ctx = canvas.getContext('2d');
    if (window._measChart) window._measChart.destroy();

    if (!sets || sets.length < 2) {
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';

    const metric = document.getElementById('trend-metric').value;
    const sorted = [...sets].reverse();
    const labels = sorted.map(s => s.date);
    const data = sorted.map(s => s[metric]).filter(v => v != null);

    window._measChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.slice(0, data.length),
        datasets: [{
          label: metric.replace(/_/g, ' '),
          data,
          borderColor: '#e94560',
          backgroundColor: 'rgba(233, 69, 96, 0.1)',
          fill: true,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#a0a0b0' } } },
        scales: {
          y: { ticks: { color: '#a0a0b0' }, grid: { color: '#2a2a4e' } },
          x: { ticks: { color: '#a0a0b0', maxTicksLimit: 10 } },
        },
      },
    });
  }

  async function loadBodyFatChart() {
    const sets = await api.getMeasurementSets();
    const profile = await api.getProfile();
    const canvas = document.getElementById('bodyfat-chart');
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
          borderColor: '#ffd166',
          backgroundColor: 'rgba(255, 209, 102, 0.1)',
          fill: true,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#a0a0b0' } } },
        scales: {
          y: { ticks: { color: '#a0a0b0' }, grid: { color: '#2a2a4e' } },
          x: { ticks: { color: '#a0a0b0', maxTicksLimit: 10 } },
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

    const metrics = ['weight_kg', 'chest_cm', 'neck_cm', 'shoulders_cm', 'biceps_left_cm', 'biceps_right_cm',
      'waist_cm', 'hips_cm', 'thighs_left_cm', 'thighs_right_cm', 'calves_left_cm', 'calves_right_cm'];
    let html = '<table><thead><tr><th>Métrica</th><th>Antes</th><th>Después</th><th>Delta</th></tr></thead><tbody>';
    for (const m of metrics) {
      const bVal = before[m];
      const aVal = after[m];
      if (bVal != null && aVal != null) {
        const delta = aVal - bVal;
        const sign = delta > 0 ? '+' : '';
        const cls = m.includes('waist') || m.includes('weight') ? (delta > 0 ? 'style="color:#e94560"' : 'style="color:#4ecdc4"') : '';
        html += `<tr><td>${m.replace(/_/g, ' ')}</td><td>${bVal}</td><td>${aVal}</td><td ${cls}>${sign}${delta.toFixed(1)}</td></tr>`;
      }
    }
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  loadAll();
}
