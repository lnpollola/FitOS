import Chart from 'chart.js/auto';
import { strings, getMeasurementLabel } from '../locales/es.js';
import { calculateBodyFat } from '../utils/body-fat.js';
import { safeCall } from '../utils/safe-call.js';
import { skeletonCard, skeletonRow, skeletonChart } from '../utils/skeleton.js';
import { chartColors, chartColorWithAlpha } from '../utils/chart-theme.js';
import { icon } from '../utils/icons.js';
import { renderStateCard } from '../utils/state-card.js';
import { getTrendArrow } from '../utils/trend-arrow.js';

const METRIC_COLUMNS = [
  'chest_cm', 'neck_cm', 'shoulders_cm', 'biceps_left_cm', 'biceps_right_cm',
  'forearms_left_cm', 'forearms_right_cm', 'waist_cm', 'hips_cm',
  'thighs_left_cm', 'thighs_right_cm', 'calves_left_cm', 'calves_right_cm',
];

const FIELDSETS = [
  { key: 'neckShoulders', icon: 'ruler', metrics: ['neck_cm', 'shoulders_cm'] },
  { key: 'torso', icon: 'scan-line', metrics: ['chest_cm', 'waist_cm', 'hips_cm', 'weight_kg'] },
  { key: 'arms', icon: 'dumbbell', metrics: ['biceps_left_cm', 'biceps_right_cm', 'forearms_left_cm', 'forearms_right_cm'] },
  { key: 'legs', icon: 'footprints', metrics: ['thighs_left_cm', 'thighs_right_cm', 'calves_left_cm', 'calves_right_cm'] },
];

const CHART_COLORS = [
  chartColors.accent, chartColors.accentHover, chartColors.warning, chartColors.danger, chartColors.success,
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4',
  '#84CC16', '#F43F5E', '#A855F7',
];

const EVOLUTION_METRICS = [
  { col: 'waist_cm', color: chartColors.warning },
  { col: 'chest_cm', color: chartColors.accent },
  { col: 'hips_cm', color: chartColors.success },
];

function formatDelta(delta, metricKey) {
  const sign = delta > 0 ? '+' : '';
  const isNeg = metricKey.includes('waist') || metricKey === 'weight_kg';
  const cls = isNeg ? (delta > 0 ? 'style="color:var(--danger)"' : 'style="color:var(--success)"') : (delta > 0 ? 'style="color:var(--success)"' : 'style="color:var(--danger)"');
  return `<span ${cls}>${sign}${delta.toFixed(1)}</span>`;
}

function formField(metric) {
  const label = getMeasurementLabel(metric);
  const unit = metric === 'weight_kg' ? strings.general.unitKg : strings.measurements.unitCm;
  const min = metric === 'weight_kg' ? 20 : 0;
  const max = metric === 'weight_kg' ? 300 : 200;
  return `
    <div class="form-group">
      <label>${label} (${unit})</label>
      <input type="number" name="${metric}" min="${min}" max="${max}" step="0.1" aria-label="${label}" />
    </div>
  `;
}

function isIpcError(result) {
  return result === null || (result && result.ok === false);
}

export async function init() {
  if (window._loadingMeasurements) return;
  window._loadingMeasurements = true;
  try {
    const container = document.getElementById('view-measurements');

    const fieldsetHtml = FIELDSETS.map(fs => `
      <fieldset>
        <legend>${icon(fs.icon, 16)} ${strings.measurements.bodyParts[fs.key]}</legend>
        <div class="form-row-3">
          ${fs.metrics.map(formField).join('')}
        </div>
      </fieldset>
    `).join('');

    container.innerHTML = `
      <h2 class="view-title">${strings.measurements.title}</h2>
      <div class="card">
        <h2>${strings.measurements.fullEntry}</h2>
        <form id="measurement-form">
          <div class="form-group form-row-full">
            <label>${strings.measurements.date}</label>
            <input type="date" name="date" required aria-label="${strings.measurements.date}" />
          </div>
          ${fieldsetHtml}
          <div class="form-row-full">
            <button type="submit" class="btn btn-primary">${strings.measurements.saveMeasurement}</button>
          </div>
          <div id="prefill-error" role="alert"></div>
        </form>
      </div>
      <div class="card">
        <h2>${strings.measurements.quickWeight}</h2>
        <form id="weight-form" class="flex-row" style="align-items:end">
          <div class="form-group">
            <label>${strings.measurements.date}</label>
            <input type="date" name="date" required aria-label="${strings.measurements.date}" />
          </div>
          <div class="form-group">
            <label>${strings.measurements.weight}</label>
            <input type="number" name="weight_kg" min="20" max="300" step="0.1" required aria-label="${strings.measurements.weight}" />
          </div>
          <button type="submit" class="btn btn-primary">${strings.measurements.saveWeight}</button>
        </form>
      </div>
      <div class="card">
        <h2>${strings.measurements.bodyFatEstimate}</h2>
        <div id="body-fat-estimate" aria-live="polite"><div class="empty-state"><p>${strings.measurements.bodyFatEmpty}</p></div></div>
      </div>
      <div class="card">
        <h2>${strings.measurements.measurementHistory}</h2>
        <div id="measurement-history" aria-live="polite"><div class="empty-state"><p>${strings.measurements.noMeasurements}</p></div></div>
      </div>
      <div class="card">
        <h2>${strings.measurements.weightTrend}</h2>
        <div class="empty-state" id="weight-chart-empty" style="display:none"><p>${strings.states.noData}</p></div>
        <div class="chart-container"><canvas id="weight-chart"></canvas></div>
        <div id="weight-monthly-summary" class="mt-3"></div>
      </div>
      <div id="measurement-charts-grid" aria-live="polite" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px"></div>
      <div class="card" id="evolution-chart-card">
        <h2>${strings.measurements.evolution}</h2>
        <div class="empty-state" id="evolution-chart-empty" style="display:none"><p>${strings.states.noData}</p></div>
        <div id="evolution-kpis" class="text-sm" style="margin-bottom:8px"></div>
        <div class="chart-container"><canvas id="evolution-chart"></canvas></div>
      </div>
      <div class="card">
        <h2>${strings.measurements.bodyFatTrend}</h2>
        <div class="empty-state" id="bodyfat-chart-empty" style="display:none"><p>${strings.states.noData}</p></div>
        <div class="chart-container"><canvas id="bodyfat-chart"></canvas></div>
      </div>
      <div class="card">
        <h2>${strings.measurements.beforeAfter}</h2>
        <div style="display:flex;gap:12px;align-items:end;margin-bottom:16px;flex-wrap:wrap">
          <div class="form-group">
            <label>${strings.measurements.beforeDate}</label>
            <input type="date" id="before-date" aria-label="${strings.measurements.beforeDate}" />
          </div>
          <div class="form-group">
            <label>${strings.measurements.afterDate}</label>
            <input type="date" id="after-date" aria-label="${strings.measurements.afterDate}" />
          </div>
          <button class="btn btn-primary" id="btn-compare">${strings.measurements.compare}</button>
        </div>
        <div id="comparison-result" aria-live="polite"></div>
      </div>
    `;

    const api = window.electronAPI;
    if (!api) { return; }

    const PAGE_SIZE = 10;
    let _historyPage = 0;

    async function prefillForm() {
      const today = new Date().toISOString().split('T')[0];
      const dateInput = document.querySelector('#measurement-form input[name="date"]');
      if (dateInput) dateInput.value = today;
      const weightDateInput = document.querySelector('#weight-form input[name="date"]');
      if (weightDateInput) weightDateInput.value = today;

      const errorEl = document.getElementById('prefill-error');
      const latest = await safeCall(api.getLatestMeasurementSet(), null);
      if (isIpcError(latest)) {
        if (errorEl) renderStateCard(errorEl, { state: 'error', subtitle: strings.states.errorLoading, onRetry: prefillForm });
        return;
      }
      if (errorEl) errorEl.innerHTML = '';
      if (!latest) return;
      for (const col of METRIC_COLUMNS) {
        const input = document.querySelector(`#measurement-form input[name="${col}"]`);
        if (input && latest[col] != null) input.value = latest[col];
      }
      const weightInput = document.querySelector('#measurement-form input[name="weight_kg"]');
      if (weightInput && latest.weight_kg != null) weightInput.value = latest.weight_kg;
    }

    document.getElementById('measurement-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      for (const key of Object.keys(data)) {
        if (key !== 'date' && data[key] !== '') data[key] = parseFloat(data[key]);
        else if (key !== 'date' && data[key] === '') data[key] = null;
      }
      await safeCall(api.saveMeasurementSet(data), null);
      loadAll();
    });

    document.getElementById('weight-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      data.weight_kg = parseFloat(data.weight_kg);
      await safeCall(api.saveWeightEntry(data), null);
      loadAll();
    });

    document.getElementById('btn-compare').addEventListener('click', loadComparison);

    async function loadAll() {
      document.getElementById('measurement-history').innerHTML = skeletonRow();
      document.getElementById('measurement-charts-grid').innerHTML = skeletonCard().repeat(6);
      document.getElementById('body-fat-estimate').innerHTML = skeletonCard();
      ['weight-chart-empty', 'bodyfat-chart-empty', 'evolution-chart-empty'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });

      await Promise.allSettled([
        loadHistory(),
        loadWeightChart(),
        loadMeasurementCharts(),
        loadBodyFatChart(),
        loadBodyFatEstimate(),
        loadEvolutionChart(),
      ]);
    }

    async function loadBodyFatEstimate() {
      const profile = await safeCall(api.getProfile(), null);
      const sets = await safeCall(api.getMeasurementSets(), null);
      const el = document.getElementById('body-fat-estimate');
      if (isIpcError(profile) || isIpcError(sets)) {
        renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadBodyFatEstimate });
        return;
      }
      if (!sets || sets.length === 0 || !profile) {
        el.innerHTML = `<div class="empty-state"><p>${strings.measurements.bodyFatEmpty}</p></div>`;
        return;
      }
      const latest = sets[0];
      const isMale = profile.sex === 'male';
      if (!latest.neck_cm || !latest.waist_cm) {
        el.innerHTML = `<div class="empty-state"><p>${strings.measurements.bodyFatEmptyDetail}</p></div>`;
        return;
      }
      if (!isMale && !latest.hips_cm) {
        el.innerHTML = `<div class="empty-state"><p>${strings.measurements.hipsMissingFemale}</p></div>`;
        return;
      }
      const bf = calculateBodyFat(latest.neck_cm, latest.waist_cm, latest.hips_cm, profile.sex, profile.height_cm);
      if (bf !== null) {
        el.innerHTML = `
          <p>${strings.measurements.estimatedBodyFat}: <strong>${bf.toFixed(1)}${strings.general.unitPercent}</strong></p>
          <p class="text-xs text-muted mt-1">${strings.measurements.navyMethod}</p>
        `;
      } else {
        el.innerHTML = `<div class="empty-state"><p>${strings.measurements.bodyFatEmptyDetail}</p></div>`;
      }
    }

    async function loadHistory() {
      const sets = await safeCall(api.getMeasurementSets(), null);
      const el = document.getElementById('measurement-history');
      if (isIpcError(sets)) {
        renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadHistory });
        return;
      }
      if (!sets || sets.length === 0) {
        el.innerHTML = `<div class="empty-state"><p>${strings.measurements.noMeasurements}</p></div>`;
        return;
      }
      const allCols = [...METRIC_COLUMNS, 'weight_kg'];
      const headers = [strings.measurements.date, ...allCols.map(c => getMeasurementLabel(c)), ''];
      const totalPages = Math.ceil(sets.length / PAGE_SIZE);
      if (_historyPage >= totalPages) _historyPage = totalPages - 1;
      const start = _historyPage * PAGE_SIZE;
      const displaySets = sets.slice(start, start + PAGE_SIZE);
      let html = '<div class="data-table-wrapper"><table class="data-table data-table--sticky-col"><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
      for (let i = 0; i < displaySets.length; i++) {
        const s = displaySets[i];
        const prev = i + start > 0 ? sets[i + start - 1] : null;
        html += `<tr><td>${s.date}</td>`;
        for (const col of allCols) {
          const val = s[col];
          const arrow = prev ? getTrendArrow(val, prev[col], { threshold: 0.5 }) : null;
          html += `<td>${val != null ? val.toFixed(1) : '--'}${arrow ? ` <span class="${arrow.cls}">${arrow.arrow}</span>` : ''}</td>`;
        }
        html += `<td><button class="btn btn-secondary" style="padding:2px 6px" data-delete-measurement="${s.id}">${strings.general.delete}</button></td>`;
        html += '</tr>';
      }
      html += '</tbody></table></div>';
      if (totalPages > 1) {
        html += `<div class="data-table-pagination">
          <button id="hist-prev" ${_historyPage === 0 ? 'disabled' : ''}>${strings.measurements.prevPage || '‹ Anterior'}</button>
          <span>${strings.measurements.page || 'Página'} ${_historyPage + 1} ${strings.measurements.pageOf || 'de'} ${totalPages}</span>
          <button id="hist-next" ${_historyPage >= totalPages - 1 ? 'disabled' : ''}>${strings.measurements.nextPage || 'Siguiente ›'}</button>
        </div>`;
      }
      el.innerHTML = html;

      const prevBtn = document.getElementById('hist-prev');
      const nextBtn = document.getElementById('hist-next');
      if (prevBtn) prevBtn.addEventListener('click', () => { _historyPage--; loadHistory(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { _historyPage++; loadHistory(); });

      el.querySelectorAll('[data-delete-measurement]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm(strings.measurements.deleteConfirm)) {
            await safeCall(api.deleteMeasurementSet(parseInt(btn.dataset.deleteMeasurement)), null);
            loadAll();
          }
        });
      });
    }

    async function loadWeightChart() {
      const weights = await safeCall(api.getWeightEntries(), null);
      const canvas = document.getElementById('weight-chart');
      if (!canvas) return;
      const emptyEl = document.getElementById('weight-chart-empty');
      const ctx = canvas.getContext('2d');
      if (window._weightChart) window._weightChart.destroy();

      if (isIpcError(weights)) {
        canvas.style.display = 'none';
        if (emptyEl) { emptyEl.style.display = 'block'; renderStateCard(emptyEl, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadWeightChart }); }
        return;
      }
      if (!weights || weights.length === 0) {
        canvas.style.display = 'none';
        if (emptyEl) { emptyEl.style.display = 'block'; emptyEl.innerHTML = `<p>${strings.states.noData}</p>`; }
        return;
      }
      canvas.style.display = 'block';
      if (emptyEl) emptyEl.style.display = 'none';

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
              borderColor: chartColors.accent,
              backgroundColor: 'transparent',
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: chartColors.accent,
              tension: 0.3,
            },
            {
              label: strings.measurements.sevenDayMa,
              data: movingAvg,
              borderColor: chartColors.success,
              backgroundColor: chartColorWithAlpha(chartColors.success, 0.05),
              borderDash: [5, 5],
              pointRadius: 0,
              pointHoverRadius: 5,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: chartColors.textSecondary } }, tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary } },
          scales: {
            y: { ticks: { color: chartColors.textSecondary }, grid: { color: chartColors.grid } },
            x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 10 }, grid: { display: false } },
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
      const months = Object.keys(monthGroups).sort().reverse();
      let prevAvg = null;
      let summaryHtml = `<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>${strings.measurements.month}</th><th>${strings.measurements.avgWeight}</th><th>${strings.measurements.monthDelta}</th></tr></thead><tbody>`;
      for (const m of months) {
        const vals = monthGroups[m];
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        const monthName = new Date(m + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        summaryHtml += `<tr><td>${monthName}</td><td>${avg.toFixed(1)} ${strings.general.unitKg}</td><td>`;
        if (prevAvg !== null) {
          const diff = avg - prevAvg;
          summaryHtml += formatDelta(diff, 'weight_kg');
        } else {
          summaryHtml += '--';
        }
        summaryHtml += '</td></tr>';
        prevAvg = avg;
      }
      summaryHtml += '</tbody></table></div>';
      summaryEl.innerHTML = summaryHtml;
    }

    async function loadMeasurementCharts() {
      const sets = await safeCall(api.getMeasurementSets(), null);
      const grid = document.getElementById('measurement-charts-grid');
      if (isIpcError(sets)) {
        renderStateCard(grid, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadMeasurementCharts });
        return;
      }
      if (!sets || sets.length === 0) {
        grid.innerHTML = '';
        return;
      }
      if (sets.length === 1) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>${strings.measurements.moreDataNeeded}</p></div>`;
        return;
      }

      const sorted = [...sets].reverse();

      grid.innerHTML = METRIC_COLUMNS.map((col) => {
        const filtered = sorted.map(s => ({ date: s.date, val: s[col] })).filter(p => p.val != null);
        const latest = filtered.length > 0 ? filtered[filtered.length - 1].val : null;
        let kpiHtml = '';
        if (latest != null) {
          kpiHtml += `<span style="font-size:20px;font-weight:700">${latest.toFixed(1)}</span> <span class="text-xs text-muted">${strings.measurements.unitCm}</span>`;
          if (filtered.length >= 2) {
            const delta = latest - filtered[filtered.length - 2].val;
            kpiHtml += `<span class="text-xs" style="margin-left:8px">${formatDelta(delta, col)}</span>`;
          }
        }
        return `
          <div class="card" style="padding:14px;position:relative">
            <h3 class="text-sm" style="margin-bottom:4px">${getMeasurementLabel(col)}</h3>
            <div style="margin-bottom:4px">${kpiHtml}</div>
            <div class="chart-container" style="height:140px"><canvas id="chart-${col}"></canvas></div>
          </div>
        `;
      }).join('');

      for (let i = 0; i < METRIC_COLUMNS.length; i++) {
        const col = METRIC_COLUMNS[i];
        const canvas = document.getElementById(`chart-${col}`);
        if (!canvas) continue;

        const chartKey = `_meas${col.replace(/_/g, '')}Chart`;
        if (window[chartKey]) window[chartKey].destroy();

        const filtered = sorted.map(s => ({ date: s.date, val: s[col] })).filter(p => p.val != null);
        const labels = filtered.map(p => p.date);
        const data = filtered.map(p => p.val);

        if (data.length < 2) {
          canvas.parentElement.innerHTML = `<div class="chart-empty" style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px">${strings.measurements.moreDataNeeded}</div>`;
          continue;
        }

        const ctx = canvas.getContext('2d');

        window[chartKey] = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: getMeasurementLabel(col),
              data,
              borderColor: CHART_COLORS[i % CHART_COLORS.length],
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 5,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary } },
            scales: {
              y: { ticks: { color: chartColors.textSecondary }, grid: { color: chartColors.grid } },
              x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 8 }, grid: { display: false } },
            },
          },
        });
      }
    }

    async function loadBodyFatChart() {
      const sets = await safeCall(api.getMeasurementSets(), null);
      const profile = await safeCall(api.getProfile(), null);
      const canvas = document.getElementById('bodyfat-chart');
      if (!canvas) return;
      const emptyEl = document.getElementById('bodyfat-chart-empty');
      const ctx = canvas.getContext('2d');
      if (window._bfChart) window._bfChart.destroy();

      if (isIpcError(sets) || isIpcError(profile)) {
        canvas.style.display = 'none';
        if (emptyEl) { emptyEl.style.display = 'block'; renderStateCard(emptyEl, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadBodyFatChart }); }
        return;
      }
      if (!sets || sets.length < 2 || !profile) {
        canvas.style.display = 'none';
        if (emptyEl) { emptyEl.style.display = 'block'; emptyEl.innerHTML = `<p>${strings.states.noData}</p>`; }
        return;
      }

      const isMale = profile.sex === 'male';
      const sorted = [...sets].reverse();
      const labels = [];
      const bfData = [];
      for (const s of sorted) {
        if (!s.neck_cm || !s.waist_cm) continue;
        if (!isMale && !s.hips_cm) continue;
        const bf = calculateBodyFat(s.neck_cm, s.waist_cm, s.hips_cm, profile.sex, profile.height_cm);
        if (bf !== null) {
          labels.push(s.date);
          bfData.push(bf);
        }
      }

      if (bfData.length < 2) {
        canvas.style.display = 'none';
        if (emptyEl) { emptyEl.style.display = 'block'; emptyEl.innerHTML = `<p>${strings.states.noData}</p>`; }
        return;
      }
      canvas.style.display = 'block';
      if (emptyEl) emptyEl.style.display = 'none';

      window._bfChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: strings.measurements.bodyFatPercent,
            data: bfData,
            borderColor: chartColors.warning,
            backgroundColor: chartColorWithAlpha(chartColors.warning, 0.08),
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 5,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: chartColors.textSecondary } }, tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary } },
          scales: {
            y: { ticks: { color: chartColors.textSecondary }, grid: { color: chartColors.grid } },
            x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 10 }, grid: { display: false } },
          },
        },
      });
    }

    async function loadEvolutionChart() {
      const sets = await safeCall(api.getMeasurementSets(), null);
      const card = document.getElementById('evolution-chart-card');
      if (!card) return;
      const canvas = document.getElementById('evolution-chart');
      const emptyEl = document.getElementById('evolution-chart-empty');
      const kpiEl = document.getElementById('evolution-kpis');
      if (!canvas || !emptyEl || !kpiEl) return;

      if (window._evolutionChart) window._evolutionChart.destroy();

      if (isIpcError(sets)) {
        canvas.style.display = 'none';
        kpiEl.innerHTML = '';
        emptyEl.style.display = 'block';
        renderStateCard(emptyEl, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadEvolutionChart });
        return;
      }
      if (!sets || sets.length === 0) {
        canvas.style.display = 'none';
        kpiEl.innerHTML = '';
        emptyEl.style.display = 'block';
        emptyEl.innerHTML = `<p>${strings.states.noData}</p>`;
        return;
      }
      if (sets.length === 1) {
        canvas.style.display = 'none';
        kpiEl.innerHTML = '';
        emptyEl.style.display = 'block';
        emptyEl.innerHTML = `<p>${strings.measurements.moreDataNeeded}</p>`;
        return;
      }

      const sorted = [...sets].reverse();
      const hasData = EVOLUTION_METRICS.some(m => sorted.some(s => s[m.col] != null));
      if (!hasData) {
        canvas.style.display = 'none';
        kpiEl.innerHTML = '';
        emptyEl.style.display = 'block';
        emptyEl.innerHTML = `<p>${strings.states.noData}</p>`;
        return;
      }

      const labels = sorted.map(s => s.date);
      const datasets = [];
      const kpis = [];
      for (const m of EVOLUTION_METRICS) {
        const vals = sorted.map(s => s[m.col]);
        const nonNull = vals.filter(v => v != null);
        if (nonNull.length === 0) continue;

        datasets.push({
          label: getMeasurementLabel(m.col),
          data: vals,
          borderColor: m.color,
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true,
        });

        const latest = nonNull[nonNull.length - 1];
        const prev = nonNull.length >= 2 ? nonNull[nonNull.length - 2] : null;
        let deltaHtml = '';
        if (prev != null) {
          const delta = latest - prev;
          deltaHtml = ` <span class="text-xs">${formatDelta(delta, m.col)}</span>`;
        }
        kpis.push(`<span class="text-xs" style="margin-right:12px"><span style="color:${m.color};font-weight:700">${getMeasurementLabel(m.col)}</span>: ${latest.toFixed(1)} ${strings.measurements.unitCm}${deltaHtml}</span>`);
      }

      if (datasets.length === 0) {
        canvas.style.display = 'none';
        kpiEl.innerHTML = '';
        emptyEl.style.display = 'block';
        emptyEl.innerHTML = `<p>${strings.states.noData}</p>`;
        return;
      }

      canvas.style.display = 'block';
      emptyEl.style.display = 'none';
      kpiEl.innerHTML = kpis.join('');

      const ctx = canvas.getContext('2d');
      window._evolutionChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: chartColors.textSecondary, font: { size: 11 } } }, tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary } },
          scales: {
            y: { ticks: { color: chartColors.textSecondary }, grid: { color: chartColors.grid } },
            x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 8 }, grid: { display: false } },
          },
        },
      });
    }

    async function loadComparison() {
      const beforeDate = document.getElementById('before-date').value;
      const afterDate = document.getElementById('after-date').value;
      if (!beforeDate || !afterDate) return;

      const sets = await safeCall(api.getMeasurementSets(), null);
      const el = document.getElementById('comparison-result');

      if (isIpcError(sets)) {
        renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadComparison });
        return;
      }
      const before = sets.find(s => s.date === beforeDate);
      const after = sets.find(s => s.date === afterDate);
      if (!before || !after) {
        el.innerHTML = `<div class="empty-state"><p>${strings.measurements.noMeasurementsFound}</p></div>`;
        return;
      }

      const allCols = ['weight_kg', ...METRIC_COLUMNS];
      let html = '<div class="data-table-wrapper"><table class="data-table data-table--sticky-col"><thead><tr><th>' + strings.measurements.metricLabel + '</th><th>' + strings.measurements.before + '</th><th>' + strings.measurements.after + '</th><th>' + strings.measurements.delta + '</th></tr></thead><tbody>';
      for (const m of allCols) {
        const bVal = before[m];
        const aVal = after[m];
        if (bVal != null && aVal != null) {
          const delta = aVal - bVal;
          html += `<tr><td>${getMeasurementLabel(m)}</td><td>${bVal.toFixed(1)}</td><td>${aVal.toFixed(1)}</td><td>${formatDelta(delta, m)}</td></tr>`;
        }
      }
      html += '</tbody></table></div>';
      el.innerHTML = html;
    }

    await prefillForm();
    await loadAll();
  } finally {
    window._loadingMeasurements = false;
  }
}
