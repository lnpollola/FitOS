import Chart from 'chart.js/auto';
import { strings, getSportDisplayName } from '../locales/es.js';
import { sportIcon } from '../utils/sport-icons.js';
import { getRangeDates } from '../utils/date-range.js';
import { safeCall } from '../utils/safe-call.js';
import { chartColors, chartColorWithAlpha } from '../utils/chart-theme.js';
import { skeletonCard } from '../utils/skeleton.js';
import { icon } from '../utils/icons.js';

export async function init() {
  if (window._loadingActivity) return;
  window._loadingActivity = true;
  const container = document.getElementById('view-activity');
  container.innerHTML = `
    <h2 class="view-title">${strings.activity.title}</h2>
    <div class="card">
      <h2>${strings.activity.importAppleHealth}</h2>
      <p class="text-sm text-muted" style="margin-bottom:8px">${strings.activity.importReference}</p>
      <div class="flex-gap-sm" style="flex-wrap:wrap">
        <button class="btn btn-primary" id="btn-import-health">${strings.activity.importAppleHealth}</button>
        <button class="btn btn-secondary" id="btn-install-healthsync" style="display:none">${strings.activity.installHealthsync}</button>
        <span id="healthsync-status" class="text-sm text-muted"></span>
      </div>
      <div id="last-import-info" class="text-sm text-muted" style="margin-top:8px"></div>
      <div style="margin-top:8px;display:none" id="reimport-section">
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
          <input type="checkbox" id="reimport-checkbox" />
          ${strings.activity.reImportCheckbox}
        </label>
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
      <div class="chart-container" style="height:250px" aria-live="polite"><canvas id="weekly-chart"></canvas></div>
    </div>
    <div class="card" id="recognition-table-card" style="display:none">
      <h2>${strings.activity.sport} — ${strings.activity.rankingType}</h2>
      <div class="analytics-filters" id="comparison-filters">
        <button class="filter-btn active" data-period="15d">${strings.activity.period15d}</button>
        <button class="filter-btn" data-period="1m">${strings.activity.period1m}</button>
        <button class="filter-btn" data-period="3m">${strings.activity.period3m}</button>
      </div>
      <div id="recognition-table" aria-live="polite"></div>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) { window._loadingActivity = false; return; }

  // Apple Health import
  const healthImportBtn = document.getElementById('btn-import-health');
  const installBtn = document.getElementById('btn-install-healthsync');
  const healthStatus = document.getElementById('healthsync-status');
  const progressEl = document.getElementById('health-import-progress');
  const progressBar = document.getElementById('health-progress-bar');
  const progressText = document.getElementById('health-progress-text');
  const resultEl = document.getElementById('health-import-result');
  const lastImportInfo = document.getElementById('last-import-info');
  const reimportSection = document.getElementById('reimport-section');
  const reimportCheckbox = document.getElementById('reimport-checkbox');

  let _chartRange = '7d';
  let _comparisonPeriod = '15d';

  async function loadLastImport() {
    const ts = await safeCall(api.getLastImportTimestamp(), null);
    if (ts) {
      const d = new Date(ts);
      lastImportInfo.textContent = `${strings.activity.lastImport}: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      reimportSection.style.display = 'block';
      healthImportBtn.disabled = true;
      healthImportBtn.style.opacity = '0.5';
      reimportCheckbox.addEventListener('change', () => {
        healthImportBtn.disabled = !reimportCheckbox.checked;
        healthImportBtn.style.opacity = reimportCheckbox.checked ? '1' : '0.5';
      });
    } else {
      lastImportInfo.textContent = '';
      reimportSection.style.display = 'none';
      healthImportBtn.disabled = false;
      healthImportBtn.style.opacity = '1';
    }
  }

  async function checkHealthsync() {
    const hasHealthsync = await safeCall(api.checkHealthsync(), false);
    if (!hasHealthsync) {
      installBtn.style.display = 'inline-block';
      healthStatus.textContent = strings.activity.healthsyncNotInstalled;
    } else {
      installBtn.style.display = 'none';
      healthStatus.textContent = strings.activity.healthsyncAvailable;
    }
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
    });
  }

  healthImportBtn.addEventListener('click', async () => {
    healthImportBtn.dataset.loading = 'true';
    try {
      const hasHealthsync = await safeCall(api.checkHealthsync(), false);
      if (!hasHealthsync) {
        resultEl.style.display = 'block';
        resultEl.innerHTML = `<p style="color:var(--danger)">${strings.activity.healthsyncImportError}</p>`;
        return;
      }

      const xmlPath = 'apple-health-export/exportar.xml';
      progressEl.style.display = 'block';
      progressBar.style.width = '50%';
      progressText.textContent = strings.activity.importingData;
      healthImportBtn.disabled = true;

      const result = await safeCall(api.importAppleHealthXML(xmlPath), { created: 0, skipped: 0, errors: ['Error de comunicación'] });
      progressBar.style.width = '100%';

      const now = new Date().toISOString();
      await safeCall(api.setLastImportTimestamp(now));

      reimportCheckbox.checked = false;
      healthImportBtn.disabled = true;
      healthImportBtn.style.opacity = '0.5';

      resultEl.style.display = 'block';
      if (result.errors && result.errors.length > 0) {
        resultEl.innerHTML = `<p style="color:var(--danger)">${result.errors.join(', ')}</p>`;
      } else {
        resultEl.innerHTML = `
          <p style="color:var(--success)">${strings.activity.importComplete}</p>
          <p style="font-size:13px">${strings.activity.recordsCreated}: ${result.created} | ${strings.activity.recordsSkipped}: ${result.skipped}</p>
        `;
      }

      const tlEl = document.getElementById('activity-timeline');
      if (tlEl) tlEl.innerHTML = skeletonCard();
      const importResults = await Promise.allSettled([loadTimeline(), loadChart(), loadLastImport()]);
      importResults.forEach(r => r.status !== 'fulfilled' && console.warn('Activity import load failed:', r.reason));
    } finally {
      healthImportBtn.dataset.loading = 'false';
    }
  });

  checkHealthsync();
  await loadLastImport();

  // Summary chart date range filters
  document.querySelectorAll('#summary-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _chartRange = btn.dataset.range;
      document.querySelectorAll('#summary-filters .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.range === _chartRange));
      loadChart();
    });
  });

  // Comparison period filters
  document.querySelectorAll('#comparison-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _comparisonPeriod = btn.dataset.period;
      document.querySelectorAll('#comparison-filters .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.period === _comparisonPeriod));
      loadTimeline();
    });
  });

  function formatSleep(hours) {
    if (hours == null) return '--';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return strings.activity.sleepFormat.replace('{h}', h).replace('{m}', m);
  }

  function dayArrow(current, previous) {
    if (current == null || previous == null) return { arrow: icon('minus', 12), cls: 'text-muted' };
    if (current > previous) return { arrow: icon('arrow-up', 12), cls: 'text-success' };
    if (current < previous) return { arrow: icon('arrow-down', 12), cls: 'text-danger' };
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

  async function loadTimeline() {
    const allDays = await safeCall(api.getActivityDays(), []);
    const timeline = document.getElementById('activity-timeline');

    let monthOffset = 0;
    function getMonthRange(offset) {
      const now = new Date();
      now.setMonth(now.getMonth() + offset);
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      return { year: y, month: m, prefix: `${y}-${m}` };
    }

    async function renderMonth() {
      const { year, month, prefix } = getMonthRange(monthOffset);
      const days = allDays.filter(d => d.date.startsWith(prefix)).sort((a, b) => b.date.localeCompare(a.date));

      if (!days.length) {
        timeline.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <button class="btn btn-secondary" id="timeline-prev" style="padding:4px 10px;font-size:12px">${strings.activity.prevMonth}</button>
            <span style="font-size:14px;font-weight:600">${monthNames[parseInt(month) - 1]} ${year}</span>
            <button class="btn btn-secondary" id="timeline-next" style="padding:4px 10px;font-size:12px" ${monthOffset === 0 ? 'disabled' : ''}>${strings.activity.nextMonth}</button>
          </div>
          <div class="empty-state"><p>${strings.activity.noActivities}</p></div>`;
        wirePagination();
        return;
      }

      const sportTypeMap = {};
      for (const d of days) {
        const sports = await safeCall(api.getSportActivities(d.date), []);
        if (sports) {
          for (const s of sports) {
            if (!sportTypeMap[s.sport_type]) sportTypeMap[s.sport_type] = { count: 0, totalKcal: 0, totalMin: 0 };
            sportTypeMap[s.sport_type].count++;
            sportTypeMap[s.sport_type].totalKcal += (s.calories || 0);
            sportTypeMap[s.sport_type].totalMin += (s.duration_minutes || 0);
          }
        }
      }

      const sparklineColor = chartColors.accent;
      const header = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <button class="btn btn-secondary" id="timeline-prev" style="padding:4px 10px;font-size:12px">${strings.activity.prevMonth}</button>
          <span style="font-size:14px;font-weight:600">${monthNames[parseInt(month) - 1]} ${year}</span>
          <button class="btn btn-secondary" id="timeline-next" style="padding:4px 10px;font-size:12px" ${monthOffset === 0 ? 'disabled' : ''}>${strings.activity.nextMonth}</button>
        </div>`;

      let html = `<table><thead><tr><th>${strings.activity.timelineDate}</th><th>${strings.activity.timelineSteps}</th><th>${strings.activity.timelineActive}</th><th>${strings.activity.timelineResting}</th><th>${strings.activity.timelineHeartRate}</th><th>${strings.activity.timelineSleep}</th></tr></thead><tbody>`;

      const allSteps = allDays.filter(d => d.steps != null).map(d => d.steps);
      const allActive = allDays.filter(d => d.active_calories != null).map(d => d.active_calories);
      const allResting = allDays.filter(d => d.resting_calories != null).map(d => d.resting_calories);
      const allHr = allDays.filter(d => d.heart_rate_avg != null).map(d => d.heart_rate_avg);
      const allSleep = allDays.filter(d => d.sleep_hours != null).map(d => d.sleep_hours);

      for (let i = 0; i < days.length; i++) {
        const d = days[i];
        const prev = days[i + 1];

        const arrowSteps = dayArrow(d.steps, prev?.steps);
        const arrowActive = dayArrow(d.active_calories, prev?.active_calories);
        const arrowResting = dayArrow(d.resting_calories, prev?.resting_calories);
        const arrowHr = dayArrow(d.heart_rate_avg, prev?.heart_rate_avg);
        const arrowSleep = dayArrow(d.sleep_hours, prev?.sleep_hours);

        const recentSteps = allSteps.slice(-7);
        const recentActive = allActive.slice(-7);
        const recentResting = allResting.slice(-7);
        const recentHr = allHr.slice(-7);
        const recentSleep = allSleep.slice(-7);

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
              <span>${d.heart_rate_avg != null ? `❤️ ${Math.round(d.heart_rate_avg)}` : '--'}</span>
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
      html += '</tbody></table>';
      timeline.innerHTML = header + html;
      wirePagination();

      requestAnimationFrame(() => {
        for (const d of days) {
          const id = d.date.replace(/-/g, '');
          const todayAll = allDays.filter(x => x.date <= d.date);
          const last7Steps = todayAll.filter(x => x.steps != null).map(x => x.steps).slice(-7);
          const last7Active = todayAll.filter(x => x.active_calories != null).map(x => x.active_calories).slice(-7);
          const last7Resting = todayAll.filter(x => x.resting_calories != null).map(x => x.resting_calories).slice(-7);
          const last7Hr = todayAll.filter(x => x.heart_rate_avg != null).map(x => x.heart_rate_avg).slice(-7);
          const last7Sleep = todayAll.filter(x => x.sleep_hours != null).map(x => x.sleep_hours).slice(-7);
          drawSparkline(document.getElementById(`spk-steps-${id}`), last7Steps, sparklineColor);
          drawSparkline(document.getElementById(`spk-active-${id}`), last7Active, sparklineColor);
          drawSparkline(document.getElementById(`spk-resting-${id}`), last7Resting, sparklineColor);
          drawSparkline(document.getElementById(`spk-hr-${id}`), last7Hr, sparklineColor);
          drawSparkline(document.getElementById(`spk-sleep-${id}`), last7Sleep, sparklineColor);
        }
      });

      renderSportKPIs(sportTypeMap);
    }

    function wirePagination() {
      const prevBtn = document.getElementById('timeline-prev');
      const nextBtn = document.getElementById('timeline-next');
      if (prevBtn) prevBtn.addEventListener('click', () => { monthOffset--; renderMonth(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { monthOffset++; renderMonth(); });
    }

    const monthNames = strings.activity.monthNames;
    renderMonth();
  }

  async function renderSportKPIs(sportTypeMap) {
    const recCard = document.getElementById('recognition-table-card');
    const recTable = document.getElementById('recognition-table');
    const types = Object.entries(sportTypeMap);

    if (types.length === 0) {
      recCard.style.display = 'none';
      return;
    }
    recCard.style.display = 'block';

    const totalSessions = types.reduce((s, [, data]) => s + data.count, 0);
    const totalKcal = types.reduce((s, [, data]) => s + data.totalKcal, 0);
    const totalMin = types.reduce((s, [, data]) => s + data.totalMin, 0);
    const uniqueTypes = types.length;

    // Compute comparison data for the selected period
    let comparisonData = null;
    const now = new Date();
    let compFrom, compTo, compLabel;
    if (_comparisonPeriod === '15d') {
      compTo = now.toISOString().split('T')[0];
      const d = new Date(now); d.setDate(d.getDate() - 15); compFrom = d.toISOString().split('T')[0];
      compLabel = strings.activity.period15d;
    } else if (_comparisonPeriod === '1m') {
      compTo = now.toISOString().split('T')[0];
      const d = new Date(now); d.setDate(d.getDate() - 30); compFrom = d.toISOString().split('T')[0];
      compLabel = strings.activity.period1m;
    } else {
      compTo = now.toISOString().split('T')[0];
      const d = new Date(now); d.setDate(d.getDate() - 90); compFrom = d.toISOString().split('T')[0];
      compLabel = strings.activity.period3m;
    }
    comparisonData = await api.getActivityComparison(compFrom, compTo).catch(() => null);

    // Build comparison lookup
    const prevKcalByType = {};
    if (comparisonData?.previous) {
      for (const p of comparisonData.previous) {
        prevKcalByType[p.sport_type] = p.total_kcal;
      }
    }

    function getTrendArrow(currentKcal, prevKcal) {
      if (prevKcal == null || prevKcal === 0) return { arrow: icon('minus', 12), cls: 'text-muted' };
      const pct = ((currentKcal - prevKcal) / prevKcal) * 100;
      if (pct > 5) return { arrow: icon('arrow-up', 12), cls: 'text-success' };
      if (pct < -5) return { arrow: icon('arrow-down', 12), cls: 'text-danger' };
      return { arrow: icon('minus', 12), cls: 'text-muted' };
    }

    const kpiHtml = `
      <div class="analytics-kpis" style="margin-bottom:12px">
        <div class="analytics-kpi-card">
          <div class="kpi-label">${strings.dashboard.sessions}</div>
          <div class="kpi-value">${totalSessions}</div>
          <div class="kpi-sub">${strings.dashboard.sessions}</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="kpi-label">${strings.activity.calories}</div>
          <div class="kpi-value">${totalKcal.toLocaleString()}</div>
          <div class="kpi-sub">${strings.dashboard.kcalTotal}</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="kpi-label">${strings.activity.durationMin}</div>
          <div class="kpi-value">${totalMin}</div>
          <div class="kpi-sub">min</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="kpi-label">${strings.activity.types || 'Tipos'}</div>
          <div class="kpi-value">${uniqueTypes}</div>
          <div class="kpi-sub">${strings.activity.differentTypes || 'diferentes'}</div>
        </div>
      </div>`;

    let sortCol = 'totalKcal';
    let sortAsc = false;
    function renderTable() {
      const sorted = [...types].sort((a, b) => {
        let va, vb;
        if (sortCol === 'name') { va = a[0]; vb = b[0]; }
        else if (sortCol === 'count') { va = a[1].count; vb = b[1].count; }
        else if (sortCol === 'avgKcal') { va = a[1].count ? a[1].totalKcal / a[1].count : 0; vb = b[1].count ? b[1].totalKcal / b[1].count : 0; }
        else if (sortCol === 'avgMin') { va = a[1].count ? a[1].totalMin / a[1].count : 0; vb = b[1].count ? b[1].totalMin / b[1].count : 0; }
        else { va = a[1].totalKcal; vb = b[1].totalKcal; }
        return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
      const maxRows = sorted.slice(0, 30);
      recTable.innerHTML = kpiHtml + `
        <div style="overflow-x:auto;max-height:400px;overflow-y:auto">
          <table>
            <thead><tr>
              <th style="cursor:pointer" data-sort="name">${strings.activity.rankingType} ${sortCol === 'name' ? (sortAsc ? icon('arrow-up', 12) : icon('arrow-down', 12)) : ''}</th>
              <th style="cursor:pointer" data-sort="count">${strings.activity.rankingCount} ${sortCol === 'count' ? (sortAsc ? icon('arrow-up', 12) : icon('arrow-down', 12)) : ''}</th>
              <th style="cursor:pointer" data-sort="avgMin">${strings.activity.durationMin} ${sortCol === 'avgMin' ? (sortAsc ? icon('arrow-up', 12) : icon('arrow-down', 12)) : ''}</th>
              <th style="cursor:pointer" data-sort="avgKcal">${strings.activity.rankingAvgKcal} ${sortCol === 'avgKcal' ? (sortAsc ? icon('arrow-up', 12) : icon('arrow-down', 12)) : ''}</th>
              <th style="cursor:pointer" data-sort="totalKcal">${strings.activity.rankingTotalKcal} ${sortCol === 'totalKcal' ? (sortAsc ? icon('arrow-up', 12) : icon('arrow-down', 12)) : ''}</th>
              <th>${strings.activity.rankingDuration || 'Dur.'}</th>
            </tr></thead>
            <tbody>
              ${maxRows.map(([type, data]) => {
                const trend = getTrendArrow(data.totalKcal, prevKcalByType[type]);
                return `<tr>
                  <td><strong>${sportIcon(type, 14)} ${getSportDisplayName(type)}</strong></td>
                  <td>${data.count}</td>
                  <td>${data.count ? Math.round(data.totalMin / data.count) : 0} min</td>
                  <td>${data.count ? Math.round(data.totalKcal / data.count) : 0}</td>
                  <td>${data.totalKcal.toLocaleString()} <span class="${trend.cls}" style="font-size:10px;margin-left:2px" title="${strings.activity.periodComparison}">${trend.arrow}</span>
                    <canvas id="spk-type-${type.replace(/\s/g, '')}" width="60" height="18" style="display:inline-block;vertical-align:middle;margin-left:4px"></canvas>
                  </td>
                  <td>${data.count ? Math.round(data.totalMin / data.count) : 0}</td>
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
    const summary = await safeCall(api.getSportSummaryByRange(from, to), []);

    // Session count comparison strip
    const comparison = await safeCall(api.getActivityComparison(from, to), null);
    const currentSessions = summary.reduce((s, x) => s + x.count, 0);
    const prevSessions = comparison?.previous ? comparison.previous.reduce((s, x) => s + x.count, 0) : null;
    const compEl = document.getElementById('session-comparison');
    if (currentSessions > 0 && compEl) {
      let trendArrow = icon('minus', 12), trendCls = 'text-muted';
      if (prevSessions != null && prevSessions > 0) {
        const pct = ((currentSessions - prevSessions) / prevSessions) * 100;
        if (pct > 5) { trendArrow = icon('arrow-up', 12); trendCls = 'text-success'; }
        else if (pct < -5) { trendArrow = icon('arrow-down', 12); trendCls = 'text-danger'; }
      }
      const arrowHtml = prevSessions != null ? `<span class="${trendCls}" style="font-size:12px;margin-left:4px" title="${strings.activity.periodComparison}">${trendArrow}</span>` : '';
      compEl.style.display = 'flex';
      compEl.innerHTML = `
        <div class="analytics-kpi-card">
          <div class="kpi-label">${strings.dashboard.sessions}</div>
          <div class="kpi-value">${currentSessions}${arrowHtml}</div>
          <div class="kpi-sub">${prevSessions != null ? `${strings.activity.periodComparison}` : strings.dashboard.avgDay}</div>
        </div>`;
    } else if (compEl) {
      compEl.style.display = 'none';
    }

    let canvas = document.getElementById('weekly-chart');
    const chartContainer = canvas?.parentElement || document.querySelector('.chart-container');
    if (!canvas && chartContainer) {
      canvas = document.createElement('canvas');
      canvas.id = 'weekly-chart';
      chartContainer.innerHTML = '';
      chartContainer.appendChild(canvas);
    }

    if (!canvas || !summary || summary.length === 0) {
      if (chartContainer) chartContainer.style.display = 'none';
      return;
    }
    if (chartContainer) chartContainer.style.display = 'block';
    const ctx = canvas.getContext('2d');
    if (window._weeklyChart) window._weeklyChart.destroy();

    const labels = summary.map(s => getSportDisplayName(s.sport_type));
    window._weeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: strings.activity.calories,
            data: summary.map(s => s.total_kcal),
            backgroundColor: chartColors.accent,
            borderRadius: 6,
            order: 2,
          },
          {
            label: strings.activity.durationMin,
            data: summary.map(s => s.total_duration),
            backgroundColor: chartColors.warning,
            borderRadius: 6,
            order: 1,
            yAxisID: 'y1',
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
                const s = summary[i];
                return `${s.count} ${strings.dashboard.sessions} · ${s.avg_kcal} ${strings.dashboard.avgKcal}`;
              },
            },
          },
        },
        scales: {
          y: { beginAtZero: true, ticks: { color: chartColors.textSecondary }, grid: { color: chartColors.grid }, position: 'left' },
          y1: { beginAtZero: true, ticks: { color: chartColors.warning }, grid: { display: false }, position: 'right' },
          x: { ticks: { color: chartColors.textSecondary }, grid: { display: false } },
        },
      },
    });
  }

  const tlEl = document.getElementById('activity-timeline');
  if (tlEl) tlEl.innerHTML = skeletonCard();
  const initResults = await Promise.allSettled([loadTimeline(), loadChart()]);
  initResults.forEach(r => r.status !== 'fulfilled' && console.warn('Activity init failed:', r.reason));
  window._loadingActivity = false;
}
