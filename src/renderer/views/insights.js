import { getAPI } from "../utils/api-detector.js";
import { strings } from '../locales/es.js';
import { icon } from '../utils/icons.js';
import { sportIcon } from '../utils/sport-icons.js';
import { getSportDisplayName } from '../locales/es.js';
import { chartColors } from '../utils/chart-theme.js';
import { skeletonCard, skeletonChart } from '../utils/skeleton.js';
import { safeCall } from '../utils/safe-call.js';
import { renderStateCard } from '../utils/state-card.js';
import { sparkline } from '../utils/sparkline.js';
import {
  heatmapBucket,
  recoveryScore,
} from '../utils/kpi-derivation.js';
import {
  mountStrengthPRs,
  mountStrengthPlateaus,
  mountStrengthScore,
  mountWeeklyTonnage,
} from './panels/strength-insights-panels.js';
import Chart from 'chart.js/auto';

function toIsoDate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getRangeDates(range) {
  const now = new Date();
  const to = toIsoDate(now);
  let from;
  if (range === '90d') from = toIsoDate(new Date(now - 90 * 86400000));
  else if (range === '6m') from = toIsoDate(new Date(now - 180 * 86400000));
  else from = toIsoDate(new Date(now - 365 * 86400000));
  return { from, to };
}

const SPORT_DONUT_COLORS = [
  '#4E5D3F',
  '#2F3D26',
  '#D7DAC7',
  '#8A8870',
  '#C75B3B',
  '#E6E0D2',
];

const SPANISH_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const SPANISH_DAYS_FULL = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export async function init() {
  if (window._loadingInsights) return;
  window._loadingInsights = true;
  try {
    const container = document.getElementById('view-insights');
    const api = getAPI();
    const SI = strings.insights;

    container.innerHTML = `
      <h2 class="view-title">${SI.title}</h2>
      <div class="insights-filters" id="insights-filters">
        <button class="filter-btn filter-btn--active" data-range="90d">${SI.dateRange.label90d}</button>
        <button class="filter-btn" data-range="6m">${SI.dateRange.label6m}</button>
        <button class="filter-btn" data-range="1y">${SI.dateRange.label1y}</button>
      </div>
      <div class="insights-global-banner" id="insights-global-banner" style="display:none">${SI.globalEmpty}</div>
      <div id="insights-sections">
        <section class="insights-section" id="section-heatmap">
          <h3 class="insights-section-title" id="heatmap-title">${SI.heatmap.title}</h3>
          <div id="heatmap-content" aria-live="polite"></div>
        </section>
        <section class="insights-section" id="section-dow">
          <h3 class="insights-section-title">${SI.dayOfWeek.title}</h3>
          <div id="dow-content" aria-live="polite"></div>
        </section>
        <section class="insights-section" id="section-sport-dist">
          <h3 class="insights-section-title">${SI.sportDistribution.title}</h3>
          <div id="sport-dist-content" aria-live="polite"></div>
        </section>
        <section class="insights-section" id="section-recovery">
          <p class="insights-section-label">${SI.fixedWindowLabels.recovery}</p>
          <h3 class="insights-section-title">${SI.recovery.title}</h3>
          <div id="recovery-content" aria-live="polite"></div>
        </section>
        <section class="insights-section" id="section-strength">
          <p class="insights-section-label">${strings.strengthInsights.fixedWindowLabel}</p>
          <h3 class="insights-section-title">${strings.strengthInsights.title}</h3>
          <div class="strength-grid">
            <div id="strength-pr-content" aria-live="polite"></div>
            <div id="strength-plateau-content" aria-live="polite"></div>
            <div id="strength-score-content" aria-live="polite"></div>
            <div id="strength-tonnage-content" aria-live="polite"></div>
          </div>
        </section>
      </div>
    `;

    if (!api) return;

    const _state = { range: '90d' };

    function setRange(range) {
      _state.range = range;
      document.querySelectorAll('#insights-filters .filter-btn').forEach(b => {
        b.classList.toggle('filter-btn--active', b.dataset.range === range);
      });
    }

    document.querySelectorAll('#insights-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setRange(btn.dataset.range);
        loadAll();
      });
    });

    let _dataChangedCb;
    if (api.onDataChanged) {
      _dataChangedCb = () => {
        setTimeout(() => {
          const active = document.querySelector('.nav-item[aria-current="page"]');
          if (active && active.dataset.view === 'insights') loadAll();
        }, 200);
      };
      api.onDataChanged(_dataChangedCb);
    }

    function destroyCharts() {
      ['_insightsDowChart', '_insightsDonutChart', '_insightsVelocityChart'].forEach(k => {
        if (window[k]) { window[k].destroy(); window[k] = null; }
      });
    }

    async function loadAll() {
      destroyCharts();

      document.getElementById('heatmap-content').innerHTML = skeletonCard();
      document.getElementById('dow-content').innerHTML = skeletonChart();
      document.getElementById('sport-dist-content').innerHTML = skeletonChart();
      document.getElementById('recovery-content').innerHTML = skeletonCard();
      document.getElementById('strength-pr-content').innerHTML = skeletonCard();
      document.getElementById('strength-plateau-content').innerHTML = skeletonCard();
      document.getElementById('strength-score-content').innerHTML = skeletonCard();
      document.getElementById('strength-tonnage-content').innerHTML = skeletonChart();

      const { from, to } = getRangeDates(_state.range);

      const results = await Promise.allSettled([
        safeCall(api.getYearInMotion(from, to)),
        safeCall(api.getDayOfWeekStats(from, to)),
        safeCall(api.getSportDistribution()),
        safeCall(api.getRecoveryScore()),
        safeCall(api.getAutoInsights()),
      ]);

      const [heatmapRes, dowRes, sportDistRes, recoveryRes, insightsRes] = results;

      let emptySections = 0;
      const totalSections = 5;

      emptySections += renderHeatmap(heatmapRes.status === 'fulfilled' ? heatmapRes.value : null) ? 1 : 0;
      emptySections += renderDayOfWeek(dowRes.status === 'fulfilled' ? dowRes.value : null) ? 1 : 0;
      emptySections += renderSportDistribution(sportDistRes.status === 'fulfilled' ? sportDistRes.value : null) ? 1 : 0;
      emptySections += renderRecovery(recoveryRes.status === 'fulfilled' ? recoveryRes.value : null) ? 1 : 0;
      mountStrengthPRs(document.getElementById('strength-pr-content'));
      mountStrengthPlateaus(document.getElementById('strength-plateau-content'));
      mountStrengthScore(document.getElementById('strength-score-content'));
      mountWeeklyTonnage(document.getElementById('strength-tonnage-content'));

      const banner = document.getElementById('insights-global-banner');
      if (banner) banner.style.display = emptySections === totalSections ? '' : 'none';
    }

    function renderHeatmap(data) {
      const el = document.getElementById('heatmap-content');
      const titleEl = document.getElementById('heatmap-title');
      if (!el) return false;
      
      // Update title based on selected period
      if (titleEl) {
        const periodLabels = {
          '90d': SI.heatmap.titles['90d'],
          '6m': SI.heatmap.titles['6m'],
          '1y': SI.heatmap.titles['1y']
        };
        titleEl.textContent = periodLabels[_state.range] || SI.heatmap.title;
      }
      
      if (!data || !data.points || data.points.length === 0) {
        el.innerHTML = `<div class="insights-empty"><p>${SI.heatmap.empty}</p><button class="btn" id="heatmap-cta">${SI.heatmap.cta}</button></div>`;
        const btn = document.getElementById('heatmap-cta');
        if (btn) btn.addEventListener('click', () => api.navigate('activity'));
        return true;
      }

      const points = data.points;
      if (points.length === 0) {
        el.innerHTML = `<div class="insights-empty"><p>${SI.heatmap.empty}</p></div>`;
        return true;
      }

      const byDate = new Map();
      points.forEach(p => byDate.set(p.date, p.minutes));
      const sorted = points.map(p => p.date).sort();
      const fromDate = sorted[0] ? new Date(sorted[0] + 'T00:00:00') : new Date();
      const firstMonday = new Date(fromDate);
      const dow = firstMonday.getDay() || 7;
      firstMonday.setDate(firstMonday.getDate() - (dow - 1));

      const weeks = [];
      let cursor = new Date(firstMonday);
      const now = new Date();
      while (cursor <= now) {
        const weekDays = [];
        for (let d = 0; d < 7; d++) {
          const day = new Date(cursor);
          day.setDate(cursor.getDate() + d);
          const iso = toIsoDate(day);
          const minutes = byDate.get(iso) || 0;
          const isFuture = day > now;
          weekDays.push({ date: iso, minutes, isFuture, weekday: d });
        }
        weeks.push(weekDays);
        cursor.setDate(cursor.getDate() + 7);
      }

      const cellSize = 11;
      const gap = 2;
      const svgHeight = weeks[0].length * (cellSize + gap) + 16;

      let svg = `<svg width="${weeks.length * (cellSize + gap) + 30}" height="${svgHeight}" shape-rendering="crispEdges">`;
      weeks.forEach((week, wi) => {
        week.forEach((day, di) => {
          const x = wi * (cellSize + gap) + 24;
          const y = di * (cellSize + gap);
          const bucket = heatmapBucket(day.minutes);
          let cls = `insights-heatmap-cell--moss-${bucket}`;
          if (day.isFuture) cls += ' insights-heatmap-cell--future';
          else if (bucket === 0) cls = 'insights-heatmap-cell--moss-0';
          svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ry="2" class="${cls}"><title>${day.date} — ${Math.round(day.minutes)} min</title></rect>`;
        });
      });
      svg += '</svg>';

      const activeDays = points.filter(p => p.minutes > 0).length;
      const inactiveDays = points.length - activeDays;
      const highActivityDays = points.filter(p => p.minutes >= 60).length;
      const lowActivityDays = points.filter(p => p.minutes > 0 && p.minutes < 30).length;
      const totalMinutes = points.reduce((s, p) => s + p.minutes, 0);
      const avgMinutesPerActiveDay = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;
      const totalActivities = points.filter(p => p.sessions > 0).reduce((s, p) => s + (p.sessions || 0), 0);

      const caption = activeDays < 7 ? `<p class="insights-heatmap-caption">${SI.heatmap.caption.replace('{n}', activeDays)}</p>` : '';

      const summaryHtml = `
        <div class="insights-heatmap-summary">
          <div class="insights-heatmap-stat">
            <span class="insights-heatmap-stat-value">${activeDays}</span>
            <span class="insights-heatmap-stat-label">Días activos</span>
          </div>
          <div class="insights-heatmap-stat">
            <span class="insights-heatmap-stat-value">${inactiveDays}</span>
            <span class="insights-heatmap-stat-label">Días sin actividad</span>
          </div>
          <div class="insights-heatmap-stat">
            <span class="insights-heatmap-stat-value">${highActivityDays}</span>
            <span class="insights-heatmap-stat-label">Alta actividad (≥60min)</span>
          </div>
          <div class="insights-heatmap-stat">
            <span class="insights-heatmap-stat-value">${lowActivityDays}</span>
            <span class="insights-heatmap-stat-label">Baja actividad (&lt;30min)</span>
          </div>
          <div class="insights-heatmap-stat">
            <span class="insights-heatmap-stat-value">${avgMinutesPerActiveDay}</span>
            <span class="insights-heatmap-stat-label">Min prom/día activo</span>
          </div>
        </div>
      `;

      el.innerHTML = `<div class="insights-heatmap">${svg}</div>${summaryHtml}${caption}`;
      return false;
    }

    function renderDayOfWeek(data) {
      const el = document.getElementById('dow-content');
      if (!el) return false;
      if (!data || !Array.isArray(data) || data.length === 0) {
        el.innerHTML = `<div class="insights-empty"><p>${SI.dayOfWeek.empty}</p></div>`;
        return true;
      }

      const totalWeeks = data.reduce((sum, d) => sum + (d.sessions || 0), 0) / 7;
      if (totalWeeks < 2) {
        el.innerHTML = `<div class="insights-empty"><p>${SI.dayOfWeek.empty}</p></div>`;
        return true;
      }

      const labels = data.map(d => d.weekday_label || SPANISH_DAYS[d.weekday || 0]);
      const values = data.map(d => Math.round(d.minutes || 0));
      const bestIdx = values.indexOf(Math.max(...values));

      const bgColors = labels.map((_, i) => {
        const hex = getComputedStyle(document.body).getPropertyValue(i === bestIdx ? '--moss-ink' : '--moss').trim();
        return hex || (i === bestIdx ? '#2F3D26' : '#4E5D3F');
      });

      const canvasId = 'insights-dow-chart';
      const bestDay = data[bestIdx];
      const worstIdx = values.indexOf(Math.min(...values));
      const worstDay = data[worstIdx];
      const avgMinutes = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - avgMinutes, 2), 0) / values.length);
      const consistencyLabel = stdDev < 20 ? 'Alta' : stdDev < 40 ? 'Media' : 'Baja';
      
      el.innerHTML = `
        <div class="chart-container" style="height:200px"><canvas id="${canvasId}"></canvas></div>
        <div class="insights-dow-kpis">
          <div class="insights-dow-kpi">
            <span class="insights-dow-kpi-label">Mejor día</span>
            <span class="insights-dow-kpi-value">${bestDay.weekday_label}</span>
            <span class="insights-dow-kpi-detail">${Math.round(bestDay.minutes)} min prom.</span>
          </div>
          <div class="insights-dow-kpi">
            <span class="insights-dow-kpi-label">Peor día</span>
            <span class="insights-dow-kpi-value">${worstDay.weekday_label}</span>
            <span class="insights-dow-kpi-detail">${Math.round(worstDay.minutes)} min prom.</span>
          </div>
          <div class="insights-dow-kpi">
            <span class="insights-dow-kpi-label">Consistencia</span>
            <span class="insights-dow-kpi-value">${consistencyLabel}</span>
            <span class="insights-dow-kpi-detail">σ ${Math.round(stdDev)} min</span>
          </div>
        </div>
      `;
      if (totalWeeks < 5) {
        el.innerHTML += `<p class="insights-heatmap-caption" style="text-align:center">${SI.dayOfWeek.partialPattern.replace('{n}', Math.round(totalWeeks))}</p>`;
      }

      const ctx = document.getElementById(canvasId);
      if (!ctx) return false;

      window._insightsDowChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: bgColors,
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderColor: chartColors.grid,
              borderWidth: 1,
              titleColor: chartColors.textPrimary,
              bodyColor: chartColors.textSecondary,
              padding: 10,
              cornerRadius: 6,
              callbacks: {
                label: (item) => {
                  const d = data[item.dataIndex];
                  return `${d.weekday_label}: ${item.raw} min, ${d.sessions || 0} sesiones`;
                },
              },
            },
          },
          scales: {
            y: { 
              beginAtZero: true, 
              title: { display: false }, 
              ticks: { 
                color: chartColors.textSecondary,
                font: { size: 11 } 
              }, 
              grid: { color: chartColors.grid } 
            },
            x: { 
              ticks: { 
                color: chartColors.textSecondary,
                font: { size: 11 } 
              }, 
              grid: { display: false } 
            },
          },
        },
      });

      return false;
    }

    function renderSportDistribution(data) {
      const el = document.getElementById('sport-dist-content');
      if (!el) return false;
      if (!data || !Array.isArray(data.sports) || data.sports.length === 0) {
        el.innerHTML = `<div class="insights-empty"><p>${SI.sportDistribution.empty}</p></div>`;
        return true;
      }

      let sports = data.sports;
      let others = null;
      if (sports.length > 6) {
        const top = sports.slice(0, 5);
        const rest = sports.slice(5);
        const restMin = rest.reduce((s, r) => s + r.minutes, 0);
        sports = [...top, { sport_type: 'other', minutes: restMin, sessions: rest.reduce((s, r) => s + r.sessions, 0), share_pct: rest.reduce((s, r) => s + r.share_pct, 0) }];
        others = rest;
      }

      const totalH = Math.round(data.total_minutes / 60);
      const labels = sports.map(s => getSportDisplayName(s.sport_type));
      const minutesData = sports.map(s => Math.round(s.minutes));

      const canvasId = 'insights-donut-chart';
      el.innerHTML = `
        <div class="insights-sport-dist-layout">
          <div class="insights-sport-dist-chart">
            <div class="insights-donut-wrapper">
              <canvas id="${canvasId}"></canvas>
              <div class="insights-donut-center">
                <div class="insights-donut-center-total">${totalH}h</div>
                <div class="insights-donut-center-label">${SI.sportDistribution.totalLabel}</div>
              </div>
            </div>
          </div>
          <div class="insights-sport-dist-divider" aria-hidden="true"></div>
          <div class="insights-sport-dist-metrics">
            <div class="insights-donut-legend">
              ${sports.map((s, i) => `
                <div class="insights-donut-legend-item">
                  <span class="insights-donut-legend-swatch" style="background:${SPORT_DONUT_COLORS[i] || SPORT_DONUT_COLORS[5]}"></span>
                  <span>${getSportDisplayName(s.sport_type)}</span>
                  <span class="insights-donut-legend-info">${Math.round(s.minutes)} min · ${s.sessions} sesiones · ${s.share_pct.toFixed(1)}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      const ctx = document.getElementById(canvasId);
      if (!ctx) return false;

      window._insightsDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: minutesData,
            backgroundColor: SPORT_DONUT_COLORS.slice(0, sports.length),
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '65%',
          plugins: {
            legend: { display: false },
          },
        },
      });

      return false;
    }

    function renderRecovery(data) {
      const el = document.getElementById('recovery-content');
      if (!el) return false;
      if (!data || data.error) {
        renderStateCard(el, { state: 'error', title: SI.recovery.title, onRetry: () => loadAll() });
        return false;
      }

      const rec = recoveryScore({
        hrv: data.hrv,
        rhr: data.rhr,
        sleep: data.sleep,
      });

      if (!rec.baselineComplete) {
        const daysLeft = rec.daysUntilBaseline;
        const daysAvailable = 30 - (daysLeft || 0);
        const pct = Math.max(0, Math.min(100, (daysAvailable / 30) * 100));
        el.innerHTML = `
          <div class="insights-empty">
            <p>${SI.recovery.empty}</p>
            <div class="insights-recovery-baseline-bar">
              <div class="insights-recovery-baseline-fill" style="width:${pct}%"></div>
            </div>
            <p class="insights-recovery-progress">${daysAvailable} de 30 días de datos</p>
          </div>`;
        return true;
      }

      const label = SI.recoveryZones[rec.zone] || rec.zone;
      const sparklineSvg = rec.sparkline && rec.sparkline.length > 1
        ? sparkline(rec.sparkline, { width: 180, height: 36, stroke: 'var(--moss)' })
        : '';

      el.innerHTML = `
        <div class="insights-recovery">
          <div class="insights-recovery-composite">
            <span class="insights-recovery-value">${rec.composite}</span>
            <span class="insights-recovery-chip insights-recovery-zone--${rec.zone}">${label}</span>
          </div>
          ${sparklineSvg ? `<div class="insights-recovery-sparkline">${sparklineSvg}</div>` : ''}
          <div class="insights-recovery-submeters">
            ${renderSubmeter('hrv', rec, data)}
            ${renderSubmeter('rhr', rec, data)}
            ${renderSubmeter('sleep', rec, data)}
          </div>
          ${rec.signalCount < 3 && rec.signalCount >= 2 ? `<p class="insights-recovery-note">${SI.recovery.partialSignal}</p>` : ''}
        </div>
      `;
      return false;
    }

    function renderSubmeter(key, rec, data) {
      const sig = rec.signals && rec.signals[key];
      const tooltipText = SI.recovery.subMeterTooltips[key] || '';
      if (!sig || sig.insufficient) {
        return `<div class="insights-recovery-submeter insights-recovery-submeter--disabled"><span class="insights-recovery-submeter-name">${SI.recovery.subMeters[key]} <span class="info-icon" title="${tooltipText}">${icon('info', 12)}</span></span><span class="insights-recovery-submeter-values">Datos insuficientes</span><div class="insights-recovery-submeter-bar"><div class="insights-recovery-submeter-fill" style="width:0%"></div></div></div>`;
      }
      const unit = key === 'hrv' ? ' ms' : key === 'rhr' ? ' bpm' : 'h';
      const currentVal = sig.current != null ? Math.round(sig.current) + unit : '—';
      const baselineVal = sig.baseline != null ? Math.round(sig.baseline) + unit : '—';
      return `<div class="insights-recovery-submeter">
        <span class="insights-recovery-submeter-name">${SI.recovery.subMeters[key]} <span class="info-icon" title="${tooltipText}">${icon('info', 12)}</span></span>
        <span class="insights-recovery-submeter-values">${currentVal} / ${baselineVal}</span>
        <div class="insights-recovery-submeter-bar"><div class="insights-recovery-submeter-fill insights-recovery-submeter-fill--${sig.zone}" style="width:${sig.subScore}%"></div></div>
        <span style="font-size:11px;width:30px;text-align:right;color:var(--lichen)">${sig.subScore}</span>
      </div>`;
    }

    await loadAll();

  } finally {
    window._loadingInsights = false;
  }
}
