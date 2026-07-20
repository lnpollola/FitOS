import { getAPI } from "../utils/api-detector.js";
import { strings } from '../locales/es.js';
import { icon } from '../utils/icons.js';
import { chartColors } from '../utils/chart-theme.js';
import { skeletonCard, skeletonChart } from '../utils/skeleton.js';
import { safeCall } from '../utils/safe-call.js';
import { createChart } from '../charts/chart-manager.js';

export async function init() {
  const container = document.getElementById('view-sleep');
  const api = getAPI();
  if (!api) {
    container.innerHTML = `<h2 class="view-title">${strings.sleep.title || 'Análisis de Sueño'}</h2><div class="card"><p>${strings.dashboard.offline}</p></div>`;
    return;
  }
  container.innerHTML = `
    <h2 class="view-title">${strings.sleep.title || 'Análisis de Sueño'}</h2>
    <div class="sleep-kpis" id="sleep-kpis">${skeletonCard().repeat(3)}</div>
    <div class="sleep-chart-row">
      <div class="card" id="sleep-timeline-card">
        <h3>${strings.sleep.timeline || 'Duración de Sueño'}</h3>
        <div class="chart-container" style="height:220px"><canvas id="sleep-timeline-chart"></canvas></div>
      </div>
      <div class="card" id="sleep-phases-card">
        <h3>${strings.sleep.phases || 'Fases del Sueño'}</h3>
        <div class="chart-container" style="height:220px"><canvas id="sleep-phases-chart"></canvas></div>
      </div>
    </div>
  `;
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dataPromise = safeCall(api.getSleepAnalysis(from, to), null);
  const data = await dataPromise;
  if (!data || !data.ok) {
    document.getElementById('sleep-kpis').innerHTML = `<div class="card"><p>${strings.sleep.noData || 'Sin datos de sueño. Importa datos desde Apple Health vía HealthSync o desde un archivo CSV en la pestaña Actividad.'}</p></div>`;
    document.getElementById('sleep-timeline-card').style.display = 'none';
    document.getElementById('sleep-phases-card').style.display = 'none';
    return;
  }
  renderKpis(data);
  renderTimelineChart(data);
  renderPhasesChart(data);
}

function renderKpis(data) {
  const kpisEl = document.getElementById('sleep-kpis');
  const avg = data.totalAvg != null ? `${data.totalAvg.toFixed(1)} h` : '--';
  const consistencyValue = data.consistency != null ? `${Math.round(data.consistency)}%` : '--';
  const consistencyLabel = data.consistency != null
    ? (data.consistency >= 75 ? strings.sleep.consistent : data.consistency >= 50 ? strings.sleep.irregular : strings.sleep.veryIrregular)
    : '';
  const trendArrowVal = data.trendArrow;
  const trendArrow = trendArrowVal === 'up' ? icon('trending-up', 16) : trendArrowVal === 'down' ? icon('trending-down', 16) : icon('minus', 16);
  const trendClass = trendArrowVal === 'up' ? 'trend-up' : trendArrowVal === 'down' ? 'trend-down' : 'trend-flat';
  const trendLabel = trendArrowVal === 'up' ? strings.sleep.trendUp : trendArrowVal === 'down' ? strings.sleep.trendDown : strings.sleep.trendFlat;
  kpisEl.innerHTML = `
    <div class="sleep-kpi-card">
      <div class="sleep-kpi-label">${strings.sleep.avg || 'Promedio'}</div>
      <div class="sleep-kpi-value">${avg}</div>
      <div class="sleep-kpi-sub">${strings.sleep.avg7d || '7 días'}</div>
    </div>
    <div class="sleep-kpi-card">
      <div class="sleep-kpi-label">${strings.sleep.consistency}</div>
      <div class="sleep-kpi-value">${consistencyValue}</div>
      <div class="sleep-kpi-sub">${consistencyLabel}</div>
    </div>
    <div class="sleep-kpi-card">
      <div class="sleep-kpi-label">${strings.sleep.trend || 'Tendencia'}</div>
      <div class="sleep-kpi-value ${trendClass}">${trendArrow}</div>
      <div class="sleep-kpi-sub">${trendLabel}</div>
    </div>
  `;
}

function renderTimelineChart(data) {
  if (!data.dailySeries || data.dailySeries.length < 1) {
    document.getElementById('sleep-timeline-card').style.display = 'none';
    return;
  }
  const series = data.dailySeries;
  const labels = series.map(d => d.date || d.dia);
  const hours = series.map(d => d.sleep_hours);
  const ma7 = hours.map((_, i, arr) => {
    const slice = arr.slice(Math.max(0, i - 6), i + 1);
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  });
  const ctx = document.getElementById('sleep-timeline-chart')?.getContext('2d');
  if (!ctx) return;
  createChart('timeline', ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: strings.sleep.title || 'Sueño', data: hours, borderColor: chartColors.accent, backgroundColor: chartColors.accent + '1a', fill: true, tension: 0.3, pointRadius: 0, pointHoverRadius: 5 },
        { label: strings.analytics.ma7 || 'Media 7d', data: ma7, borderColor: chartColors.warning, borderDash: [5, 5], pointRadius: 0, pointHoverRadius: 5, tension: 0.3 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: chartColors.textSecondary, boxWidth: 12, padding: 8 } },
        tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary },
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: chartColors.textSecondary }, grid: { color: chartColors.grid } },
        x: { ticks: { color: chartColors.textSecondary, maxTicksLimit: 10 }, grid: { display: false } },
      },
    },
  });
}

function renderPhasesChart(data) {
  if (data.deepAvg == null && data.remAvg == null && data.lightAvg == null) {
    document.getElementById('sleep-phases-card').innerHTML = `
      <h3>${strings.sleep.phases || 'Fases del Sueño'}</h3>
      <p class="text-sm text-muted" style="padding:var(--space-4)">${strings.sleep.phasesUnavailableDetail || 'Datos de fases no disponibles — requiere importación desde Apple Health'}</p>
    `;
    return;
  }
  const ctx = document.getElementById('sleep-phases-chart')?.getContext('2d');
  if (!ctx) return;
  const labels = [strings.sleep.phases || 'Fases'];
  createChart('phases', ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: strings.sleep.deep || 'Profundo', data: [data.deepAvg || 0], backgroundColor: chartColors.accent, borderRadius: 3 },
        { label: strings.sleep.rem || 'REM', data: [data.remAvg || 0], backgroundColor: chartColors.warning, borderRadius: 3 },
        { label: strings.sleep.light || 'Ligero', data: [data.lightAvg || 0], backgroundColor: chartColors.accent + '66', borderRadius: 3 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { labels: { color: chartColors.textSecondary, boxWidth: 12, padding: 8 } },
        tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary, callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.x.toFixed(2)} h` } },
      },
      scales: {
        x: { stacked: true, ticks: { color: chartColors.textSecondary }, grid: { color: chartColors.grid } },
        y: { stacked: true, ticks: { display: false }, grid: { display: false } },
      },
    },
  });
}
