import Chart from 'chart.js/auto';
import { strings, getSportDisplayName } from '../locales/es.js';
import { sportIcon } from '../utils/sport-icons.js';
import { getRangeDates } from '../utils/date-range.js';
import { safeCall } from '../utils/safe-call.js';
import { chartColors, chartColorWithAlpha } from '../utils/chart-theme.js';
import { skeletonCard } from '../utils/skeleton.js';
import { renderStateCard } from '../utils/state-card.js';
import { icon } from '../utils/icons.js';

export async function init() {
  if (window._loadingActivity) return;
  window._loadingActivity = true;
  try {
    const container = document.getElementById('view-activity');
    container.innerHTML = `
    <h2 class="view-title">${strings.activity.title}</h2>
    <div id="anomaly-banner" class="card" style="display:none;background:var(--warning-bg, #fef3c7);border-left:4px solid var(--warning, #d97706);margin-bottom:12px;padding:12px 16px">
      <p id="anomaly-banner-text" style="margin:0 0 8px 0;font-size:14px"></p>
      <button class="btn-link" id="anomaly-banner-reset" style="font-size:13px;color:var(--accent);background:none;border:none;padding:0;cursor:pointer;text-decoration:underline;font-weight:600"></button>
    </div>
    <div class="card">
      <h2>${strings.activity.syncAppleHealth}</h2>
      <p class="text-sm text-muted" style="margin-bottom:8px">${strings.activity.syncAppleHealthHint}</p>
      <div class="flex-gap-sm" style="flex-wrap:wrap;align-items:center">
        <button class="btn btn-primary" id="btn-sync-apple-health">${strings.activity.syncAppleHealth}</button>
        <button class="btn btn-secondary" id="btn-refresh-apple-health" title="${strings.activity.refreshTitle}">${icon('refresh-cw', 14)} <span id="btn-refresh-label">${strings.activity.refresh}</span></button>
        <button class="btn btn-secondary" id="btn-install-healthsync" style="display:none">${strings.activity.installHealthsync}</button>
        <span id="healthsync-status" class="text-sm text-muted"></span>
      </div>
      <div id="sync-source-info" class="text-sm text-muted" style="margin-top:8px"></div>
      <div id="last-import-info" class="text-sm text-muted" style="margin-top:6px"></div>
      <div style="margin-top:6px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;color:var(--text-muted)">
          <input type="checkbox" id="force-reparse-checkbox" />
          ${strings.activity.forceReparseXml}
        </label>
        <button class="btn-link" id="btn-reset-sync-healthsync" style="font-size:12px;color:var(--text-muted);background:none;border:none;padding:0;cursor:pointer;text-decoration:underline">${strings.activity.resetAndSync}</button>
      </div>
      <div id="health-import-progress" style="display:none;margin-top:12px">
        <div style="background:var(--bg-tertiary);border-radius:4px;height:20px;overflow:hidden">
          <div id="health-progress-bar" style="width:0%;height:100%;background:var(--accent);transition:width 0.3s"></div>
        </div>
        <p id="health-progress-text" class="text-sm text-muted" style="margin-top:4px"></p>
      </div>
      <div id="health-import-result" style="display:none;margin-top:8px"></div>
    </div>
    <div class="card">
      <h2>${strings.activity.activityTimeline}</h2>
      <div id="activity-timeline" aria-live="polite"><div class="empty-state"><p>${strings.activity.noActivities}</p><div class="sub">${strings.activity.noActivitiesSub}</div></div></div>
    </div>
    <div class="card">
      <h2>${strings.activity.weeklySportSummary}</h2>
      <div class="analytics-filters" id="summary-filters">
        <button class="filter-btn active" data-range="7d">7d</button>
        <button class="filter-btn" data-range="15d">15d</button>
        <button class="filter-btn" data-range="1m">1m</button>
      </div>
      <div id="session-comparison" class="analytics-kpis" style="margin-bottom:8px;display:none"></div>
      <div class="chart-container" style="height:280px" aria-live="polite"><canvas id="weekly-chart"></canvas></div>
    </div>
    <div class="card" id="recognition-table-card" style="display:none">
      <h2>${strings.activity.sport} — ${strings.activity.rankingType}</h2>
      <div class="analytics-filters" id="comparison-filters">
        <button class="filter-btn active" data-period="7d">${strings.activity.period7d}</button>
        <button class="filter-btn" data-period="15d">${strings.activity.period15d}</button>
        <button class="filter-btn" data-period="1m">${strings.activity.period1m}</button>
        <button class="filter-btn" data-period="3m">${strings.activity.period3m}</button>
      </div>
      <div id="recognition-table" aria-live="polite"></div>
    </div>
  `;

    const api = window.electronAPI;
    if (!api) return;

    const syncAppleHealthBtn = document.getElementById('btn-sync-apple-health');
    const refreshBtn = document.getElementById('btn-refresh-apple-health');
    const refreshLabel = document.getElementById('btn-refresh-label');
    const installBtn = document.getElementById('btn-install-healthsync');
    const healthStatus = document.getElementById('healthsync-status');
    const sourceInfoEl = document.getElementById('sync-source-info');
    const progressEl = document.getElementById('health-import-progress');
    const progressBar = document.getElementById('health-progress-bar');
    const progressText = document.getElementById('health-progress-text');
    const resultEl = document.getElementById('health-import-result');
    const lastImportInfo = document.getElementById('last-import-info');
    const forceReparseCheckbox = document.getElementById('force-reparse-checkbox');

    let _chartRange = '7d';
    let _comparisonPeriod = '7d';
    let monthOffset = 0;
    const monthNames = strings.activity.monthNames;

    function getMonthRange(offset) {
      const now = new Date();
      now.setMonth(now.getMonth() + offset);
      const y = now.getFullYear();
      const m = now.getMonth();
      const monthStr = String(m + 1).padStart(2, '0');
      const prefix = `${y}-${monthStr}`;
      const from = `${y}-${monthStr}-01`;
      const lastDay = new Date(y, m + 1, 0).getDate();
      const to = `${y}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
      return { year: y, month: monthStr, prefix, from, to };
    }

    async function loadLastImport() {
      const ts = await safeCall(api.getLastImportTimestamp(), null);
      if (ts) {
        const d = new Date(ts);
        lastImportInfo.textContent = `${strings.activity.lastImport}: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        lastImportInfo.textContent = strings.activity.lastImportNever;
      }
    }

    async function checkHealthsync() {
      const hasHealthsync = await safeCall(api.checkHealthsync(), false);
      if (!hasHealthsync) {
        installBtn.style.display = 'inline-block';
        syncAppleHealthBtn.disabled = true;
        syncAppleHealthBtn.style.opacity = '0.5';
        healthStatus.textContent = strings.activity.healthsyncNotInstalled;
      } else {
        installBtn.style.display = 'none';
        syncAppleHealthBtn.disabled = false;
        syncAppleHealthBtn.style.opacity = '1';
        healthStatus.textContent = strings.activity.healthsyncAvailable;
      }
    }

    const anomalyBanner = document.getElementById('anomaly-banner');
    const anomalyBannerText = document.getElementById('anomaly-banner-text');
    const anomalyBannerReset = document.getElementById('anomaly-banner-reset');

    function renderAnomalyBanner(anomalies) {
      if (!anomalies || !anomalies.hasAnomaly) {
        anomalyBanner.style.display = 'none';
        return;
      }
      const { sportDuplicates, weightDuplicates } = anomalies;
      const parts = [];
      if (sportDuplicates > 0) {
        parts.push(strings.activity.anomalyBannerSport.replace('{n}', sportDuplicates.toLocaleString()));
      }
      if (weightDuplicates > 0) {
        parts.push(strings.activity.anomalyBannerWeight.replace('{n}', weightDuplicates.toLocaleString()));
      }
      const msg = parts.length === 2
        ? strings.activity.anomalyBannerBoth.replace('{a}', parts[0]).replace('{b}', parts[1])
        : parts[0];
      anomalyBannerText.textContent = msg;
      anomalyBannerReset.textContent = strings.activity.resetAndSync;
      anomalyBanner.style.display = 'block';
    }

    if (anomalyBannerReset) {
      anomalyBannerReset.addEventListener('click', () => {
        const resetSyncBtn = document.getElementById('btn-reset-sync-healthsync');
        if (resetSyncBtn) resetSyncBtn.click();
      });
    }

    async function loadSourceInfo() {
      const info = await safeCall(api.getHealthsyncDbInfo(), null);
      const fmt = (d) => d ? new Date(d).toLocaleString() : null;
      const xmlMtime = info?.xmlMtime || null;
      const dbMtime = info?.lastModified ? new Date(info.lastModified).toISOString() : null;
      const xmlStr = fmt(xmlMtime);
      const dbStr = fmt(dbMtime);
      const counts = info && info.tables
        ? Object.entries(info.tables).filter(([, c]) => c > 0).map(([t, c]) => `${t}:${c}`).join(', ')
        : '';
      renderAnomalyBanner(info?.anomalies);
      if (!xmlStr && !dbStr) {
        sourceInfoEl.textContent = strings.activity.healthsyncDbMissing;
        syncAppleHealthBtn.disabled = true;
        syncAppleHealthBtn.style.opacity = '0.5';
        return;
      }
      syncAppleHealthBtn.disabled = false;
      syncAppleHealthBtn.style.opacity = '1';
      const parts = [];
      if (xmlStr) {
        const willReparse = !dbStr || new Date(xmlMtime) > new Date(dbMtime);
        parts.push(`${strings.activity.xmlLabel}: ${xmlStr} ${willReparse ? `(${strings.activity.actionWillReparse})` : `(${strings.activity.actionWillSyncOnly})`}`);
      }
      if (dbStr) {
        parts.push(`${strings.activity.healthsyncLastUpdate}: ${dbStr}`);
        if (counts) parts.push(counts);
      }
      sourceInfoEl.textContent = parts.join(' — ');
    }

    installBtn.addEventListener('click', async () => {
      installBtn.disabled = true;
      installBtn.textContent = strings.activity.installingHealthsync;
      const ok = await safeCall(api.installHealthsync(), false);
      await checkHealthsync();
      installBtn.disabled = false;
      installBtn.textContent = strings.activity.installHealthsync;
    });

    if (api.removeHealthImportProgressListener) api.removeHealthImportProgressListener();
    if (api.onHealthImportProgress) {
      api.onHealthImportProgress((msg) => {
        progressEl.style.display = 'block';
        progressText.textContent = msg;
        progressBar.style.width = msg.includes('Parseando') ? '30%' : '70%';
      });
    }

    syncAppleHealthBtn.addEventListener('click', async () => {
      syncAppleHealthBtn.dataset.loading = 'true';
      try {
        const originalLabel = syncAppleHealthBtn.textContent;
        syncAppleHealthBtn.textContent = strings.activity.healthsyncSyncing;
        syncAppleHealthBtn.disabled = true;
        progressEl.style.display = 'block';
        progressBar.style.width = '5%';
        progressText.textContent = strings.activity.healthsyncSyncing;
        resultEl.style.display = 'none';
        forceReparseCheckbox.disabled = true;

        const options = forceReparseCheckbox.checked ? { forceReparse: true } : {};
        const result = await safeCall(api.syncAppleHealth(options), {
          ok: false, action: null, errors: ['Error de comunicación']
        });

        progressBar.style.width = '100%';
        syncAppleHealthBtn.textContent = originalLabel;
        syncAppleHealthBtn.disabled = false;
        forceReparseCheckbox.disabled = false;
        forceReparseCheckbox.checked = false;

        resultEl.style.display = 'block';
        if (!result.ok || (result.errors && result.errors.length > 0)) {
          const errs = (result.errors || []).join(', ');
          resultEl.innerHTML = `<p style="color:var(--danger)">${errs}</p>`;
        } else {
          const actionLabel = result.action === 'parse-and-sync'
            ? strings.activity.actionParseAndSync
            : strings.activity.actionSyncOnly;
          const mig = result.migration || {};
          const cache = result.cache?.periods || {};
          const cacheSummary = Object.entries(cache).map(([k, v]) => `${k}: ${v.rows}`).join(' · ');
          resultEl.innerHTML = `
            <p style="color:var(--success)">${strings.activity.importComplete} <span style="font-size:12px;color:var(--text-muted)">(${actionLabel})</span></p>
            <p style="font-size:13px">${strings.activity.recordsCreated}: ${mig.created || 0}${mig.skipped ? ` | ${strings.activity.recordsSkipped}: ${mig.skipped}` : ''}${cacheSummary ? ` | ${cacheSummary}` : ''}</p>
          `;
        }

        await loadSourceInfo();
        await loadLastImport();

        const tlEl = document.getElementById('activity-timeline');
        if (tlEl) tlEl.innerHTML = skeletonCard();
        const importResults = await Promise.allSettled([loadTimeline(), loadChart()]);
        importResults.forEach(r => r.status !== 'fulfilled' && console.warn('Activity sync load failed:', r.reason));
      } finally {
        syncAppleHealthBtn.dataset.loading = 'false';
      }
    });

    async function refreshActivityView() {
      refreshBtn.disabled = true;
      const originalLabel = refreshLabel.textContent;
      refreshLabel.textContent = strings.activity.refreshing;
      try {
        const tlEl = document.getElementById('activity-timeline');
        const chartContainer = document.querySelector('.chart-container');
        if (tlEl) tlEl.innerHTML = skeletonCard();
        if (chartContainer) {
          const existing = chartContainer.querySelector('.chart-empty-state');
          if (existing) existing.remove();
        }
        await loadSourceInfo();
        await loadLastImport();
        const results = await Promise.allSettled([loadTimeline(), loadChart()]);
        results.forEach(r => r.status !== 'fulfilled' && console.warn('Activity refresh failed:', r.reason));
      } finally {
        refreshBtn.disabled = false;
        refreshLabel.textContent = originalLabel;
      }
    }

    refreshBtn.addEventListener('click', refreshActivityView);

    const resetSyncBtn = document.getElementById('btn-reset-sync-healthsync');
    if (resetSyncBtn && api.resetAndSyncHealthsync) {
      resetSyncBtn.addEventListener('click', async () => {
        const ok = window.confirm(strings.activity.resetAndSyncConfirm);
        if (!ok) return;
        resetSyncBtn.disabled = true;
        const originalLabel = resetSyncBtn.textContent;
        resetSyncBtn.textContent = strings.activity.healthsyncSyncing;
        try {
          const result = await safeCall(api.resetAndSyncHealthsync(), null);
          if (result && result.sync) {
            const r = result.reset;
            const s = result.sync;
            const mig = s.migration || {};
            resultEl.style.display = 'block';
            if (s.ok) {
              resultEl.innerHTML = `
                <p style="color:var(--success)">${strings.activity.resetComplete}</p>
                <p style="font-size:12px;color:var(--text-muted)">${strings.activity.recordsCreated}: ${mig.created || 0} | sport_activities: ${r.after.sport_activities}</p>
              `;
            } else {
              resultEl.innerHTML = `<p style="color:var(--danger)">${(s.errors || []).join(', ')}</p>`;
            }
            await loadSourceInfo();
            await loadLastImport();
            const tlEl = document.getElementById('activity-timeline');
            if (tlEl) tlEl.innerHTML = skeletonCard();
            const importResults = await Promise.allSettled([loadTimeline(), loadChart()]);
            importResults.forEach(r => r.status !== 'fulfilled' && console.warn('Activity reset+sync load failed:', r.reason));
          }
        } finally {
          resetSyncBtn.disabled = false;
          resetSyncBtn.textContent = originalLabel;
        }
      });
    }

    checkHealthsync();
    await loadSourceInfo();
    await loadLastImport();

    document.querySelectorAll('#summary-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _chartRange = btn.dataset.range;
        document.querySelectorAll('#summary-filters .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.range === _chartRange));
        loadChart();
      });
    });

    document.querySelectorAll('#comparison-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _comparisonPeriod = btn.dataset.period;
        document.querySelectorAll('#comparison-filters .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.period === _comparisonPeriod));
        renderSportKPIs();
      });
    });

    function formatSleep(hours) {
      if (hours == null) return '--';
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return strings.activity.sleepFormat.replace('{h}', h).replace('{m}', m);
    }

    function dayArrow(current, previous, goodIsUp = true) {
      if (current == null || previous == null) return { arrow: icon('minus', 12), cls: 'text-muted' };
      if (current === previous) return { arrow: icon('minus', 12), cls: 'text-muted' };
      const improved = goodIsUp ? current > previous : current < previous;
      const regressed = goodIsUp ? current < previous : current > previous;
      if (improved) return { arrow: icon('arrow-up', 12), cls: 'text-success' };
      if (regressed) return { arrow: icon('arrow-down', 12), cls: 'text-danger' };
      return { arrow: icon('minus', 12), cls: 'text-muted' };
    }

    function drawSparkline(canvas, values, color) {
      if (!canvas || !values.length) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;
      const max = Math.max(...values), min = Math.min(...values);
      const range = max - min || 1;
      const padding = 2;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      values.forEach((v, i) => {
        const x = padding + (i / (values.length - 1 || 1)) * (w - 2 * padding);
        const y = h - padding - ((v - min) / range) * (h - 2 * padding);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    function comparisonKpi(label, current, prev, fmt) {
      const trend = dayArrow(current, prev, true);
      const prevDisp = prev != null ? `${fmt(prev)} → ` : '';
      return `<div class="analytics-kpi-card">
        <div class="kpi-label">${label}</div>
        <div class="kpi-value">${prevDisp}${fmt(current)} <span class="${trend.cls}" style="font-size:12px;margin-left:2px" title="${strings.activity.periodComparison}">${trend.arrow}</span></div>
        <div class="kpi-sub">${strings.activity.periodComparison}</div>
      </div>`;
    }

    async function loadTimeline() {
      let allDays;
      try {
        allDays = await api.getActivityDays();
      } catch (err) {
        const tlEl = document.getElementById('activity-timeline');
        if (tlEl) {
          renderStateCard(tlEl, {
            title: strings.activity.activityTimeline,
            state: 'error',
            subtitle: err.message || strings.states.errorLoading,
            onRetry: loadTimeline
          });
        }
        return;
      }
      const timeline = document.getElementById('activity-timeline');

      const chrono = [...allDays].sort((a, b) => a.date.localeCompare(b.date));
      const idxByDate = new Map();
      chrono.forEach((d, i) => idxByDate.set(d.date, i));

      async function renderMonth() {
        const { year, month, prefix } = getMonthRange(monthOffset);
        const days = allDays.filter(d => d.date.startsWith(prefix)).sort((a, b) => b.date.localeCompare(a.date));

        const header = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <button class="btn btn-secondary" id="timeline-prev" style="padding:4px 10px;font-size:12px">${strings.activity.prevMonth}</button>
            <span style="font-size:14px;font-weight:600">${monthNames[parseInt(month) - 1]} ${year}</span>
            <button class="btn btn-secondary" id="timeline-next" style="padding:4px 10px;font-size:12px" ${monthOffset === 0 ? 'disabled' : ''}>${strings.activity.nextMonth}</button>
          </div>`;

        if (!days.length) {
          timeline.innerHTML = header + `<div class="empty-state"><p>${strings.activity.noActivities}</p></div>`;
          wirePagination();
          await renderSportKPIs();
          return;
        }

        let html = `<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>${strings.activity.timelineDate}</th><th>${strings.activity.timelineSteps}</th><th>${strings.activity.timelineActive}</th><th>${strings.activity.timelineResting}</th><th>${strings.activity.timelineHeartRate}</th><th>${strings.activity.timelineSleep}</th></tr></thead><tbody>`;

        for (let i = 0; i < days.length; i++) {
          const d = days[i];
          const prev = days[i + 1];

          const arrowSteps = dayArrow(d.steps, prev?.steps, true);
          const arrowActive = dayArrow(d.active_calories, prev?.active_calories, true);
          const arrowResting = dayArrow(d.resting_calories, prev?.resting_calories, false);
          const arrowHr = dayArrow(d.heart_rate_avg, prev?.heart_rate_avg, false);
          const arrowSleep = dayArrow(d.sleep_hours, prev?.sleep_hours, true);

          const idx = idxByDate.get(d.date);
          const start = Math.max(0, idx - 6);
          const win = chrono.slice(start, idx + 1);
          const last7Steps = win.map(x => x.steps).filter(v => v != null);
          const last7Active = win.map(x => x.active_calories).filter(v => v != null);
          const last7Resting = win.map(x => x.resting_calories).filter(v => v != null);
          const last7Hr = win.map(x => x.heart_rate_avg).filter(v => v != null);
          const last7Sleep = win.map(x => x.sleep_hours).filter(v => v != null);

          const id = d.date.replace(/-/g, '');

          html += `<tr>
          <td>${d.date}</td>
          <td>
            <div style="display:flex;align-items:center;gap:4px">
              <span>${d.steps != null ? d.steps.toLocaleString() : '--'}</span>
              <span class="${arrowSteps.cls}" style="font-size:10px">${arrowSteps.arrow}</span>
            </div>
            <canvas id="spk-steps-${id}" width="60" height="18" style="display:${d.steps != null ? 'block' : 'none'};margin-top:2px"></canvas>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:4px">
              <span>${d.active_calories != null ? `${Math.round(d.active_calories)} ${strings.activity.kcalActiv}` : '--'}</span>
              <span class="${arrowActive.cls}" style="font-size:10px">${arrowActive.arrow}</span>
            </div>
            <canvas id="spk-active-${id}" width="60" height="18" style="display:${d.active_calories != null ? 'block' : 'none'};margin-top:2px"></canvas>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:4px">
              <span>${d.resting_calories != null ? `${Math.round(d.resting_calories)} ${strings.activity.kcalRepo}` : '--'}</span>
              <span class="${arrowResting.cls}" style="font-size:10px">${arrowResting.arrow}</span>
            </div>
            <canvas id="spk-resting-${id}" width="60" height="18" style="display:${d.resting_calories != null ? 'block' : 'none'};margin-top:2px"></canvas>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:4px">
              <span>${d.heart_rate_avg != null ? `${icon('heart', 12)} ${Math.round(d.heart_rate_avg)}` : '--'}</span>
              <span class="${arrowHr.cls}" style="font-size:10px">${arrowHr.arrow}</span>
            </div>
            <canvas id="spk-hr-${id}" width="60" height="18" style="display:${d.heart_rate_avg != null ? 'block' : 'none'};margin-top:2px"></canvas>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:4px">
              <span>${formatSleep(d.sleep_hours)}</span>
              <span class="${arrowSleep.cls}" style="font-size:10px">${arrowSleep.arrow}</span>
            </div>
            <canvas id="spk-sleep-${id}" width="60" height="18" style="display:${d.sleep_hours != null ? 'block' : 'none'};margin-top:2px"></canvas>
          </td>
        </tr>`;
        }
        html += '</tbody></table></div>';
        timeline.innerHTML = header + html;
        wirePagination();

        requestAnimationFrame(() => {
          const sparklineColor = chartColors.accent;
          for (const d of days) {
            const id = d.date.replace(/-/g, '');
            const idx = idxByDate.get(d.date);
            const start = Math.max(0, idx - 6);
            const win = chrono.slice(start, idx + 1);
            drawSparkline(document.getElementById(`spk-steps-${id}`), win.map(x => x.steps).filter(v => v != null), sparklineColor);
            drawSparkline(document.getElementById(`spk-active-${id}`), win.map(x => x.active_calories).filter(v => v != null), sparklineColor);
            drawSparkline(document.getElementById(`spk-resting-${id}`), win.map(x => x.resting_calories).filter(v => v != null), sparklineColor);
            drawSparkline(document.getElementById(`spk-hr-${id}`), win.map(x => x.heart_rate_avg).filter(v => v != null), sparklineColor);
            drawSparkline(document.getElementById(`spk-sleep-${id}`), win.map(x => x.sleep_hours).filter(v => v != null), sparklineColor);
          }
        });

        await renderSportKPIs();
      }

      function wirePagination() {
        const prevBtn = document.getElementById('timeline-prev');
        const nextBtn = document.getElementById('timeline-next');
        if (prevBtn) prevBtn.addEventListener('click', () => { monthOffset--; renderMonth(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { monthOffset++; renderMonth(); });
      }

      renderMonth();
    }

    async function renderSportKPIs() {
      const recCard = document.getElementById('recognition-table-card');
      const recTable = document.getElementById('recognition-table');
      if (!recCard || !recTable) return;

      const { to: monthTo } = getMonthRange(monthOffset);
      const todayStr = new Date().toISOString().split('T')[0];
      const anchorStr = monthTo < todayStr ? monthTo : todayStr;
      const anchor = new Date(anchorStr);
      const L = _comparisonPeriod === '15d' ? 15 : _comparisonPeriod === '1m' ? 30 : _comparisonPeriod === '3m' ? 90 : 7;
      const curFromD = new Date(anchor);
      curFromD.setDate(curFromD.getDate() - (L - 1));
      const currentFrom = curFromD.toISOString().split('T')[0];
      const currentTo = anchorStr;

      let summary, comparison;
      try {
        summary = await api.getSportSummaryByRange(currentFrom, currentTo);
        comparison = await api.getActivityComparison(currentFrom, currentTo);
      } catch (err) {
        recCard.style.display = 'block';
        renderStateCard(recTable, {
          title: strings.activity.sport,
          state: 'error',
          subtitle: err.message || strings.states.errorLoading,
          onRetry: renderSportKPIs
        });
        return;
      }

      if (!summary || summary.length === 0) {
        recCard.style.display = 'block';
        recTable.innerHTML = `<div class="empty-state"><p>${strings.activity.noActivities}</p><div class="sub">${strings.activity.noActivitiesSub}</div></div>`;
        return;
      }
      recCard.style.display = 'block';

      const types = summary.map(s => [s.sport_type, {
        count: s.count,
        totalKcal: s.total_kcal || 0,
        totalMin: s.total_duration || 0,
        avgKcal: s.avg_kcal || 0,
        distanceKm: s.total_distance_km || 0,
      }]);

      const totalSessions = types.reduce((s, [, d]) => s + d.count, 0);
      const totalKcal = types.reduce((s, [, d]) => s + d.totalKcal, 0);
      const totalDistance = types.reduce((s, [, d]) => s + (d.distanceKm || 0), 0);
      const comparisonTip = strings.activity.periodComparisonTooltip;

      const prevByType = {};
      const prevArr = comparison?.previous || [];
      for (const p of prevArr) prevByType[p.sport_type] = p;

      const currentActiveDays = comparison?.currentActiveDays || 0;
      const previousActiveDays = comparison?.previousActiveDays || 0;
      const currentDistanceKm = comparison?.currentDistanceKm || 0;
      const previousDistanceKm = comparison?.previousDistanceKm || 0;

      function getTrendArrow(current, prev) {
        if (prev == null || prev === 0) return { arrow: icon('minus', 12), cls: 'text-muted' };
        const diff = current - prev;
        if (Math.abs(diff) < 0.5) return { arrow: icon('minus', 12), cls: 'text-muted' };
        if (diff > 0) return { arrow: icon('arrow-up', 12), cls: 'text-success' };
        return { arrow: icon('arrow-down', 12), cls: 'text-danger' };
      }

      const activeDaysTrend = getTrendArrow(currentActiveDays, previousActiveDays);
      const distanceTrend = getTrendArrow(currentDistanceKm, previousDistanceKm);

      const kpiHtml = `
      <div class="analytics-kpis" style="margin-bottom:12px">
        <div class="analytics-kpi-card">
          <div class="kpi-label">${strings.dashboard.sessions}</div>
          <div class="kpi-value">${totalSessions}</div>
          <div class="kpi-sub" title="${comparisonTip}">${strings.activity.periodComparison}</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="kpi-label">${strings.activity.calories}</div>
          <div class="kpi-value">${totalKcal.toLocaleString()}</div>
          <div class="kpi-sub">${strings.dashboard.kcalTotal}</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="kpi-label">${strings.activity.activeDays}</div>
          <div class="kpi-value">${currentActiveDays} <span class="${activeDaysTrend.cls}" style="font-size:14px;margin-left:4px" title="${comparisonTip}">${activeDaysTrend.arrow}</span></div>
          <div class="kpi-sub">${strings.activity.activeDaysOf.replace('{total}', L)}</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="kpi-label">${strings.activity.distanceKm}</div>
          <div class="kpi-value">${totalDistance.toFixed(1)} <span class="${distanceTrend.cls}" style="font-size:14px;margin-left:4px" title="${comparisonTip}">${distanceTrend.arrow}</span></div>
          <div class="kpi-sub">${strings.activity.distanceKmUnit}</div>
        </div>
      </div>`;

      let sortCol = 'totalKcal';
      let sortAsc = false;
      function renderTable() {
        const sorted = [...types].sort((a, b) => {
          let va, vb;
          if (sortCol === 'name') { va = getSportDisplayName(a[0]); vb = getSportDisplayName(b[0]); }
          else if (sortCol === 'count') { va = a[1].count; vb = b[1].count; }
          else if (sortCol === 'distanceKm') { va = a[1].distanceKm; vb = b[1].distanceKm; }
          else { va = a[1].totalKcal; vb = b[1].totalKcal; }
          return sortAsc ? (va > vb ? 1 : va < vb ? -1 : 0) : (va < vb ? 1 : va > vb ? -1 : 0);
        });
        const maxRows = sorted.slice(0, 30);
        recTable.innerHTML = kpiHtml + `
        <div class="data-table-wrapper" style="max-height:400px;overflow-y:auto">
          <table class="data-table">
            <thead><tr>
              <th style="cursor:pointer" data-sort="name">${strings.activity.rankingType} ${sortCol === 'name' ? (sortAsc ? icon('arrow-up', 12) : icon('arrow-down', 12)) : ''}</th>
              <th style="cursor:pointer" data-sort="count">${strings.activity.rankingCount} ${sortCol === 'count' ? (sortAsc ? icon('arrow-up', 12) : icon('arrow-down', 12)) : ''}</th>
              <th style="cursor:pointer" data-sort="distanceKm">${strings.activity.rankingDistanceKm} ${sortCol === 'distanceKm' ? (sortAsc ? icon('arrow-up', 12) : icon('arrow-down', 12)) : ''}</th>
              <th style="cursor:pointer" data-sort="totalKcal">${strings.activity.rankingTotalKcal} ${sortCol === 'totalKcal' ? (sortAsc ? icon('arrow-up', 12) : icon('arrow-down', 12)) : ''}</th>
            </tr></thead>
            <tbody>
              ${maxRows.map(([type, data]) => {
                const trend = getTrendArrow(data.totalKcal, prevByType[type]?.total_kcal);
                const kmCell = data.distanceKm > 0 ? `${data.distanceKm.toFixed(1)} ${strings.activity.distanceKmUnit}` : '—';
                return `<tr>
                  <td><strong>${sportIcon(type, 14)} ${getSportDisplayName(type)}</strong></td>
                  <td>${data.count}</td>
                  <td>${kmCell}</td>
                  <td>${data.totalKcal.toLocaleString()} <span class="${trend.cls}" style="font-size:10px;margin-left:2px" title="${comparisonTip}">${trend.arrow}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`;
        recTable.querySelectorAll('th[data-sort]').forEach(th => {
          th.addEventListener('click', () => {
            if (sortCol === th.dataset.sort) sortAsc = !sortAsc;
            else { sortCol = th.dataset.sort; sortAsc = false; }
            renderTable();
          });
        });
      }
      renderTable();
    }

    async function loadChart() {
      const { from, to } = getRangeDates(_chartRange);
      let summary, comparison;
      try {
        summary = await api.getSportSummaryByRange(from, to);
        comparison = await api.getActivityComparison(from, to);
      } catch (err) {
        const compEl = document.getElementById('session-comparison');
        if (compEl) {
          compEl.style.display = 'block';
          renderStateCard(compEl, {
            title: strings.activity.weeklySportSummary,
            state: 'error',
            subtitle: err.message || strings.states.errorLoading,
            onRetry: loadChart
          });
        }
        return;
      }

      const currentSessions = summary.reduce((s, x) => s + x.count, 0);
      const currentMin = summary.reduce((s, x) => s + (x.total_duration || 0), 0);
      const currentDistance = summary.reduce((s, x) => s + (x.total_distance_km || 0), 0);
      const currentAvg = currentSessions ? currentMin / currentSessions : 0;
      const prevArr = comparison?.previous || [];
      const prevSessions = prevArr.reduce((s, x) => s + x.count, 0);
      const prevMin = prevArr.reduce((s, x) => s + (x.total_duration || 0), 0);
      const prevDistance = prevArr.reduce((s, x) => s + (x.total_distance_km || 0), 0);
      const prevAvg = prevSessions ? prevMin / prevSessions : 0;
      const currentActiveDays = comparison?.currentActiveDays || 0;
      const previousActiveDays = comparison?.previousActiveDays || 0;

      const compEl = document.getElementById('session-comparison');
      if (compEl) {
        if (currentSessions > 0) {
          compEl.style.display = 'flex';
          compEl.innerHTML = `
            ${comparisonKpi(strings.dashboard.sessions, currentSessions, prevSessions, n => n.toLocaleString())}
            ${comparisonKpi(strings.activity.totalHours, currentMin / 60, prevSessions ? prevMin / 60 : null, n => n.toFixed(1))}
            ${comparisonKpi(strings.activity.activeDays, currentActiveDays, previousActiveDays, n => n.toString())}
            ${currentDistance > 0 || prevDistance > 0
              ? comparisonKpi(strings.activity.distanceKm, currentDistance, prevDistance, n => n.toFixed(1))
              : ''}`;
        } else {
          compEl.style.display = 'block';
          compEl.innerHTML = `<div class="empty-state"><p>${strings.activity.noActivities}</p></div>`;
        }
      }

      let canvas = document.getElementById('weekly-chart');
      const chartContainer = canvas?.parentElement || document.querySelector('.chart-container');
      if (!canvas && chartContainer) {
        canvas = document.createElement('canvas');
        canvas.id = 'weekly-chart';
        chartContainer.innerHTML = '';
        chartContainer.appendChild(canvas);
      }

      if (!canvas) return;

      if (!summary || summary.length === 0) {
        if (window._weeklyChart) { window._weeklyChart.destroy(); window._weeklyChart = null; }
        const existing = chartContainer.querySelector('.chart-empty-state');
        if (!existing) {
          const msg = document.createElement('div');
          msg.className = 'empty-state chart-empty-state';
          msg.innerHTML = `<p>${strings.activity.noActivities}</p>`;
          chartContainer.insertBefore(msg, canvas);
        }
        canvas.style.display = 'none';
        return;
      }

      canvas.style.display = 'block';
      const existingEmpty = chartContainer.querySelector('.chart-empty-state');
      if (existingEmpty) existingEmpty.remove();

      const ctx = canvas.getContext('2d');
      if (window._weeklyChart) window._weeklyChart.destroy();

      const ordered = [...summary].sort((a, b) => b.count - a.count);
      const prevMap = {};
      for (const p of prevArr) prevMap[p.sport_type] = p;
      const labels = ordered.map(s => getSportDisplayName(s.sport_type));
      const accent = chartColors.accent;
      const warning = chartColors.warning;

      window._weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: strings.activity.rankingCount,
              data: ordered.map(s => s.count),
              backgroundColor: accent,
              borderRadius: 6,
              yAxisID: 'y1',
              order: 2,
            },
            {
              label: `${strings.activity.rankingCount} (${strings.activity.periodComparison})`,
              data: ordered.map(s => prevMap[s.sport_type]?.count || 0),
              backgroundColor: chartColorWithAlpha(accent, 0.35),
              borderRadius: 6,
              yAxisID: 'y1',
              order: 2,
            },
            {
              label: strings.activity.rankingTotalKcal,
              data: ordered.map(s => s.total_kcal || 0),
              backgroundColor: warning,
              borderRadius: 6,
              yAxisID: 'y',
              order: 1,
            },
            {
              label: `${strings.activity.rankingTotalKcal} (${strings.activity.periodComparison})`,
              data: ordered.map(s => prevMap[s.sport_type]?.total_kcal || 0),
              backgroundColor: chartColorWithAlpha(warning, 0.35),
              borderRadius: 6,
              yAxisID: 'y',
              order: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: chartColors.textSecondary, boxWidth: 12, padding: 8 } },
            tooltip: {
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 6,
              padding: 10,
              titleColor: chartColors.textPrimary,
              bodyColor: chartColors.textSecondary,
              callbacks: {
                afterLabel: function(context) {
                  const i = context.dataIndex;
                  const s = ordered[i];
                  if (!s) return '';
                  return `${s.count} ${strings.dashboard.sessions} · ${s.avg_kcal} ${strings.dashboard.avgKcal}`;
                },
              },
            },
          },
          scales: {
            y: { beginAtZero: true, ticks: { color: chartColors.textSecondary }, grid: { color: chartColors.grid }, position: 'left' },
            y1: { beginAtZero: true, ticks: { color: chartColors.textSecondary }, grid: { display: false }, position: 'right' },
            x: { ticks: { color: chartColors.textSecondary }, grid: { display: false } },
          },
        },
      });
    }

    const tlEl = document.getElementById('activity-timeline');
    if (tlEl) tlEl.innerHTML = skeletonCard();
    const initResults = await Promise.allSettled([loadTimeline(), loadChart()]);
    initResults.forEach(r => r.status !== 'fulfilled' && console.warn('Activity init failed:', r.reason));
  } finally {
    window._loadingActivity = false;
  }
}
