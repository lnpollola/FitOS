import { getAPI } from "../../utils/api-detector.js";
import { strings } from '../../locales/es.js';
import { icon } from '../../utils/icons.js';
import { safeCall } from '../../utils/safe-call.js';
import { skeletonCard, skeletonChart } from '../../utils/skeleton.js';
import { chartColors } from '../../utils/chart-theme.js';
import Chart from 'chart.js/auto';

const SI = strings.strengthInsights;

function destroyTonnageChart() {
  if (window._tonnageChart) { window._tonnageChart.destroy(); window._tonnageChart = null; }
}

export function mountStrengthPRs(container) {
  if (!container) return;
  container.innerHTML = skeletonCard();
  const api = getAPI();
  if (!api) return;

  const load = async () => {
    container.innerHTML = skeletonCard();
    const data = await safeCall(api.getStrengthPersonalRecords(), null);
    if (!data) {
      container.innerHTML = `<div class="strava-panel"><p class="strava-helper-text">${strings.states.errorLoading}</p></div>`;
      return;
    }
    const exercises = data.exercises || [];
    const volumePRs = data.volumePRs || [];
    const muscleGroups = data.muscleGroups || [];

    if (exercises.length === 0) {
      container.innerHTML = `<div class="strava-panel"><h3 class="strava-panel-title">${SI.personalRecords.title}</h3><p class="strava-helper-text">${SI.personalRecords.empty}</p></div>`;
      return;
    }

    let _filterMuscle = '';

    function renderPRs() {
      let filtered = exercises;
      if (_filterMuscle) filtered = exercises.filter(e => e.muscle_group === _filterMuscle);

      let html = `<div class="strava-panel strength-pr-panel">
        <h3 class="strava-panel-title">${icon('medal', 14)} ${SI.personalRecords.title}</h3>
        <div class="strength-pr-filter">
          <select id="pr-muscle-filter" aria-label="${SI.personalRecords.filterByMuscle}">
            <option value="">${SI.personalRecords.allMuscles}</option>
            ${muscleGroups.map(m => `<option value="${m}" ${_filterMuscle === m ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="strength-pr-list">`;

      if (filtered.length === 0) {
        html += `<p class="strava-helper-text">${SI.personalRecords.noExercises}</p>`;
      } else {
        for (const ex of filtered) {
          const rankClass = ex.prs && ex.prs.length > 0 ? `strength-pr-rank--${Math.min(ex.prs[0].rank, 3)}` : '';
          const rankLabel = ex.prs && ex.prs.length > 0 ? (SI.personalRecords.rankLabels[ex.prs[0].rank - 1] || '') : '';
          const value = ex.best_1rm != null ? `${ex.best_1rm}` : '--';
          html += `<div class="strength-pr-item">
            <div class="strength-pr-rank ${rankClass}">${rankLabel}</div>
            <div class="strength-pr-info">
              <div class="strength-pr-name">${ex.exercise_name}</div>
              <div class="strength-pr-meta">${ex.muscle_group || ''}${ex.best_1rm_date ? ` · ${ex.best_1rm_date}` : ''}</div>
            </div>
            <div class="strength-pr-value">${value} kg</div>
          </div>`;
        }
      }

      html += `</div>`;

      if (volumePRs.length > 0) {
        html += `<div class="strength-volume-pr">
          <div class="strength-volume-pr-title">${SI.personalRecords.volumePR}</div>`;
        for (const vp of volumePRs) {
          const rankLabel = SI.personalRecords.rankLabels[vp.rank - 1] || '';
          html += `<div class="strength-volume-pr-item">
            <span>${rankLabel} ${vp.date || ''} (${vp.exercise_count} ejercicios, ${vp.set_count} series)</span>
            <span style="font-family:var(--font-mono);color:var(--accent)">${(vp.volume_kg || 0).toLocaleString('es')} kg</span>
          </div>`;
        }
        html += `</div>`;
      }

      html += `</div>`;
      container.innerHTML = html;

      const filterEl = container.querySelector('#pr-muscle-filter');
      if (filterEl) {
        filterEl.addEventListener('change', () => {
          _filterMuscle = filterEl.value;
          renderPRs();
        });
      }
    }

    renderPRs();
  };

  load();
}

export function mountStrengthPlateaus(container) {
  if (!container) return;
  container.innerHTML = skeletonCard();
  const api = getAPI();
  if (!api) return;

  const load = async () => {
    container.innerHTML = skeletonCard();
    const data = await safeCall(api.getStrengthPlateau(), null);
    if (!data) {
      container.innerHTML = `<div class="strava-panel"><p class="strava-helper-text">${strings.states.errorLoading}</p></div>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `<div class="strava-panel"><h3 class="strava-panel-title">${icon('check-circle', 14)} ${SI.plateau.title}</h3><p class="strava-helper-text">${SI.plateau.empty}</p></div>`;
      return;
    }

    let html = `<div class="strava-panel">
      <h3 class="strava-panel-title">${icon('alert-triangle', 14)} ${SI.plateau.title}</h3>
      <div class="strength-plateau-grid">`;

    for (const p of data) {
      const sevLabel = SI.plateau.severityLabels[p.severity] || p.severity;
      const weeksLabel = SI.plateau.weeksSince.replace('{n}', p.weeks_since_pr);
      const dateLabel = SI.plateau.dateLabel.replace('{date}', p.current_pr_date || '');
      html += `<div class="strength-plateau-card strength-plateau-card--${p.severity}">
        <div class="strength-plateau-header">
          <span class="strength-plateau-name">${p.exercise_name}</span>
          <span class="strength-plateau-severity strength-plateau-severity--${p.severity}">${sevLabel}</span>
        </div>
        <div class="strength-plateau-value">${weeksLabel}</div>
        <div class="strength-plateau-date">${SI.plateau.currentPR.replace('{value}', p.current_pr_1rm != null ? p.current_pr_1rm : '--')}</div>
        <div class="strength-plateau-date">${dateLabel}</div>
        <div class="strength-plateau-date">${SI.plateau.setsSincePR.replace('{n}', p.total_sets_since_pr || 0)}</div>
        <button class="strength-plateau-action" data-view-progression="${p.exercise_id}">${SI.plateau.viewProgression}</button>
      </div>`;
    }

    html += `</div></div>`;
    container.innerHTML = html;

    container.querySelectorAll('[data-view-progression]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (api.navigate) api.navigate('training');
      });
    });
  };

  load();
}

export function mountStrengthScore(container) {
  if (!container) return;
  container.innerHTML = skeletonCard();
  const api = getAPI();
  if (!api) return;

  const load = async () => {
    container.innerHTML = skeletonCard();
    const data = await safeCall(api.getStrengthScore(), null);
    if (!data) {
      container.innerHTML = `<div class="strava-panel"><p class="strava-helper-text">${strings.states.errorLoading}</p></div>`;
      return;
    }

    const mg = data.muscle_groups || [];

    if (mg.length === 0 && data.insufficient_muscle_groups) {
      const msg = data.body_weight_kg == null ? SI.score.noWeightForBodyweight : SI.score.insufficientData;
      container.innerHTML = `<div class="strava-panel"><h3 class="strava-panel-title">${SI.score.title}</h3><p class="strava-helper-text">${msg}</p></div>`;
      return;
    }

    if (mg.length === 0) {
      container.innerHTML = `<div class="strava-panel"><h3 class="strava-panel-title">${SI.score.title}</h3><p class="strava-helper-text">${SI.score.empty}</p></div>`;
      return;
    }

    const composite = data.composite_score;
    const maxScore = Math.max(...mg.map(m => m.score), 300);

    const ringPct = composite != null ? Math.min(100, (composite / 300) * 100) : 0;
    const circumference = 2 * Math.PI * 45;
    const dashOffset = circumference - (ringPct / 100) * circumference;

    let html = `<div class="strava-panel">
      <h3 class="strava-panel-title">${SI.score.title}</h3>
      <div class="strength-score-layout">
        <div class="strength-score-ring">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--text-secondary)" stroke-opacity="0.15" stroke-width="8"/>
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="8"
              stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
              stroke-linecap="round" transform="rotate(-90, 50, 50)"/>
          </svg>
          <div class="strength-score-ring-center">
            <div class="strength-score-ring-value">${composite != null ? composite : '--'}</div>
            <div class="strength-score-ring-label">${SI.score.compositeLabel}</div>
          </div>
        </div>
        <div class="strength-score-bars">`;

    for (const m of mg) {
      const barPct = Math.max(2, (m.score / maxScore) * 100);
      html += `<div class="strength-score-bar-row">
        <div class="strength-score-bar-label">${m.muscle_group}</div>
        <div class="strength-score-bar-track">
          <div class="strength-score-bar-fill" style="width:${barPct}%"></div>
        </div>
        <div class="strength-score-bar-value">${m.score}</div>
        <div class="strength-score-bar-top" title="${m.top_exercise || ''}">${m.top_exercise || ''}</div>
      </div>`;
    }

    html += `</div></div></div>`;
    container.innerHTML = html;
  };

  load();
}

export function mountWeeklyTonnage(container) {
  if (!container) return;
  container.innerHTML = skeletonChart();
  const api = getAPI();
  if (!api) return;

  const load = async () => {
    destroyTonnageChart();
    container.innerHTML = skeletonChart();
    const data = await safeCall(api.getWeeklyTonnage(), null);
    if (!data) {
      container.innerHTML = `<div class="strava-panel"><p class="strava-helper-text">${strings.states.errorLoading}</p></div>`;
      return;
    }

    const weeks = data.weeks || [];
    if (weeks.length < 4) {
      const msg = weeks.length === 0 ? SI.weeklyTonnage.empty : SI.weeklyTonnage.insufficientData;
      container.innerHTML = `<div class="strava-panel"><h3 class="strava-panel-title">${SI.weeklyTonnage.title}</h3><p class="strava-helper-text">${msg}</p></div>`;
      return;
    }

    const now = new Date();
    const currentWeekKey = (() => {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    })();

    const cutoff = (() => {
      const m = currentWeekKey.match(/^(\d{4})-W(\d{2})$/);
      if (!m) return null;
      let y = parseInt(m[1]), w = parseInt(m[2]);
      w -= 23;
      while (w <= 0) { w += 52; y -= 1; }
      return `${y}-W${String(w).padStart(2, '0')}`;
    })();

    const displayWeeks = cutoff ? weeks.filter(w => w.week >= cutoff) : weeks;
    const last24 = displayWeeks.slice(-24);

    const labels = last24.map(w => w.week.replace('W', ' S'));
    const values = last24.map(w => w.tonnage_kg);

    const nowParsed = currentWeekKey.match(/^(\d{4})-W(\d{2})$/);
    const currentStart = nowParsed ? (() => {
      let y = parseInt(nowParsed[1]), w = parseInt(nowParsed[2]);
      w -= 11;
      while (w <= 0) { w += 52; y -= 1; }
      return `${y}-W${String(w).padStart(2, '0')}`;
    })() : null;

    const colors = last24.map(w => {
      if (currentStart && w.week >= currentStart) return 'rgba(78, 93, 63, 0.8)';
      return 'rgba(78, 93, 63, 0.3)';
    });

    const avg = values.reduce((s, v) => s + v, 0) / values.length;

    const canvasId = 'strength-tonnage-chart';
    const directionClass = data.direction === 'up' ? 'strength-tonnage-direction--up' : data.direction === 'down' ? 'strength-tonnage-direction--down' : 'strength-tonnage-direction--flat';
    const directionIcon = data.direction === 'up' ? icon('arrow-up', 12) : data.direction === 'down' ? icon('arrow-down', 12) : icon('minus', 12);
    const deltaLabel = data.delta_pct != null ? SI.weeklyTonnage.deltaFormat.replace('{delta}', (data.delta_kg || 0).toLocaleString('es')).replace('{pct}', data.delta_pct) : '';
    const trendLabel = SI.weeklyTonnage[data.direction] || '';

    container.innerHTML = `<div class="strava-panel">
      <h3 class="strava-panel-title">${SI.weeklyTonnage.title}</h3>
      <div class="chart-container" style="height:200px"><canvas id="${canvasId}"></canvas></div>
      <div class="strength-tonnage-summary">
        <div class="strength-tonnage-metric">
          <div class="strength-tonnage-metric-value">${(data.current_12w_total || 0).toLocaleString('es')} kg</div>
          <div class="strength-tonnage-metric-label">${SI.weeklyTonnage.currentPeriod}</div>
        </div>
        ${data.previous_12w_total != null ? `
        <div class="strength-tonnage-metric">
          <div class="strength-tonnage-metric-value">${(data.previous_12w_total || 0).toLocaleString('es')} kg</div>
          <div class="strength-tonnage-metric-label">${SI.weeklyTonnage.previousPeriod}</div>
        </div>
        <div class="strength-tonnage-metric">
          <div class="strength-tonnage-metric-value ${directionClass}">${directionIcon} ${deltaLabel}</div>
          <div class="strength-tonnage-metric-label">${trendLabel}</div>
        </div>` : ''}
      </div>
    </div>`;

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    window._tonnageChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => `${(Number(item.raw) || 0).toLocaleString('es')} kg`,
            },
          },
        },
        scales: {
          y: { beginAtZero: true, ticks: { font: { size: 10 } }, grid: { color: 'var(--border)' } },
          x: { ticks: { font: { size: 9 }, maxTicksLimit: 12 }, grid: { display: false } },
        },
      },
      plugins: [{
        id: 'avgLine',
        afterDraw(chart) {
          const yScale = chart.scales.y;
          const y = yScale.getPixelForValue(avg);
          const ctx2 = chart.ctx;
          ctx2.save();
          ctx2.setLineDash([4, 4]);
          ctx2.strokeStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#888';
          ctx2.lineWidth = 1;
          ctx2.beginPath();
          ctx2.moveTo(chart.chartArea.left, y);
          ctx2.lineTo(chart.chartArea.right, y);
          ctx2.stroke();
          ctx2.restore();
        },
      }],
    });
  };

  load();
}
