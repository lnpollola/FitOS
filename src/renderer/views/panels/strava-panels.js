import { strings } from '../../locales/es.js';
import { icon } from '../../utils/icons.js';
import { sportIcon } from '../../utils/sport-icons.js';
import { safeCall } from '../../utils/safe-call.js';
import { renderStateCard } from '../../utils/state-card.js';
import { skeletonCard } from '../../utils/skeleton.js';
import {
  formatDuration,
  formatDateLong,
  formatDateShort,
  formatDateRange,
  formatRecordTime,
  effortLevel,
  clampEffortDisplay,
  currentIsoWeekRange,
  previousIsoWeekRange,
  toIsoDate,
} from '../../utils/kpi-derivation.js';

const SP = strings.stravaPanels;

function rankBadgeClass(rank) {
  if (rank === 1) return 'strava-pr-badge--gold';
  if (rank === 2) return 'strava-pr-badge--silver';
  if (rank === 3) return 'strava-pr-badge--bronze';
  return 'strava-pr-badge--bronze';
}

function getRankLabel(rank) {
  if (!rank || rank < 1 || rank > 3) return '';
  return SP.prBanner.rankLabels[rank - 1];
}

function getDistanceLabel(distanceKey) {
  return SP.prBanner.distanceLabels[distanceKey] || `${distanceKey} km`;
}

function formatPrTime(timeMin) {
  const seconds = Math.round(timeMin * 60);
  return formatRecordTime(seconds);
}

function formatPrValue(record) {
  if (record.is_volume) {
    const kg = Math.round(record.volume_kg || 0);
    return `${kg.toLocaleString('es')} kg`;
  }
  if (record.is_distance) {
    const km = record.distance_km;
    return `${km.toFixed(1)} km`;
  }
  return formatPrTime(record.time_min);
}

function getPrLabelText(record) {
  if (record.is_volume) {
    return `Mayor volumen en pesas`;
  }
  if (record.is_distance) {
    return record.distance_label || 'Distancia más larga';
  }
  const rank = getRankLabel(record.rank);
  return `${rank} ${getDistanceLabel(record.distance_key)}`;
}

export function mountPersonalRecord(container) {
  if (!container) return () => {};
  container.innerHTML = `<div class="strava-panel">${skeletonCard()}</div>`;
  const api = window.electronAPI;
  if (!api) return () => {};

  let activeTab = null;
  let allData = null;

  const renderLoading = () => {
    container.innerHTML = `<div class="strava-panel">${skeletonCard()}</div>`;
  };

  const renderError = (onRetry) => {
    renderStateCard(container.firstElementChild || container, {
      title: SP.prBanner.title,
      state: 'error',
      subtitle: strings.states.errorLoading,
      onRetry,
    });
  };

  const renderEmpty = () => {
    const panel = document.createElement('div');
    panel.className = 'strava-panel';
    panel.innerHTML = `
      <h3 class="strava-panel-title">${SP.prBanner.title}</h3>
      <p class="strava-helper-text">${SP.prBanner.empty}</p>
      <button class="btn btn-primary" data-pr-empty-cta>${SP.prBanner.emptyCta}</button>
    `;
    container.innerHTML = '';
    container.appendChild(panel);
    const btn = panel.querySelector('[data-pr-empty-cta]');
    if (btn && api.navigate) {
      btn.addEventListener('click', () => api.navigate('activity'));
    }
  };

  const getRecordsForTab = (tab) => {
    if (!allData || !allData.by_sport) return [];
    return allData.by_sport[tab] || [];
  };

  const renderTabs = () => {
    const tabs = ['running', 'cycling', 'strength'];
    return `<div class="strava-pr-tabs" role="tablist">
      ${tabs.map(tab => `
        <button class="strava-pr-tab ${activeTab === tab ? 'strava-pr-tab--active' : ''}" 
                role="tab" 
                aria-selected="${activeTab === tab}" 
                data-tab="${tab}">
          ${SP.prBanner.tabs[tab]}
        </button>
      `).join('')}
    </div>`;
  };

  const renderRecord = (record, total) => {
    const panel = document.createElement('div');
    panel.className = 'strava-panel strava-pr-panel';
    const badgeClass = rankBadgeClass(record.rank);
    const rankLabel = record.rank ? getRankLabel(record.rank) : '';
    const labelText = getPrLabelText(record);
    const valueText = formatPrValue(record);
    const dateStr = formatDateLong(new Date(record.achieved_at + 'T00:00:00'));
    const sportIconHtml = sportIcon(record.sport_type, 14);
    panel.innerHTML = `
      <h3 class="strava-panel-title">${SP.prBanner.title}</h3>
      ${renderTabs()}
      <div class="strava-pr-banner" role="article" aria-label="${labelText}, ${valueText}, ${dateStr}">
        <div class="strava-pr-badge ${badgeClass}" aria-hidden="true">${icon('medal', 24)}</div>
        <div class="strava-pr-content">
          <div class="strava-pr-label">${rankLabel ? rankLabel + ' · ' : ''}${sportIconHtml} ${labelText}</div>
          <div class="strava-pr-time">${valueText}</div>
          <div class="strava-pr-date">${dateStr}</div>
        </div>
        <div class="strava-pr-chevron">${icon('chevron-right', 18)}</div>
      </div>
    `;
    
    // Add tab event listeners
    const tabButtons = panel.querySelectorAll('.strava-pr-tab');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        renderCurrentView();
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const tabs = Array.from(tabButtons);
          const currentIndex = tabs.indexOf(btn);
          let nextIndex;
          if (e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % tabs.length;
          } else {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          }
          tabs[nextIndex].focus();
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    if (total > 1) {
      const link = document.createElement('button');
      link.className = 'strava-pr-view-all';
      link.textContent = SP.prBanner.viewAllCount(total);
      link.setAttribute('data-pr-view-all', '1');
      panel.appendChild(link);
      link.addEventListener('click', (e) => { e.stopPropagation(); openModal(panel, total); });
    }
    return panel;
  };

  const renderCurrentView = () => {
    const records = getRecordsForTab(activeTab);
    if (records.length === 0) {
      renderEmpty();
    } else {
      const panel = renderRecord(records[0], records.length);
      container.innerHTML = '';
      container.appendChild(panel);
    }
  };

  const openModal = (parentPanel, total) => {
    const existing = parentPanel.querySelector('dialog.strava-pr-modal');
    if (existing) { existing.showModal(); return; }
    
    const records = getRecordsForTab(activeTab);
    const dialog = document.createElement('dialog');
    dialog.className = 'strava-pr-modal';
    const list = records.map((r) => {
      const cls = rankBadgeClass(r.rank);
      const labelText = getPrLabelText(r);
      const valueText = formatPrValue(r);
      const sportIconHtml = sportIcon(r.sport_type, 12);
      return `<div class="strava-pr-modal-row">
        <span class="strava-pr-badge ${cls} strava-pr-modal-row-badge">${icon('medal', 16)}</span>
        <div class="strava-pr-modal-row-content">
          <div class="strava-pr-modal-row-label">${getRankLabel(r.rank) ? getRankLabel(r.rank) + ' · ' : ''}${sportIconHtml} ${labelText}</div>
          <div class="strava-pr-modal-row-time">${valueText}</div>
          <div class="strava-pr-modal-row-date">${formatDateLong(new Date(r.achieved_at + 'T00:00:00'))}</div>
        </div>
      </div>`;
    }).join('');
    dialog.innerHTML = `
      <button class="strava-pr-modal-close" aria-label="Cerrar">${icon('x', 16)}</button>
      <h2>${SP.prBanner.tabs[activeTab]} (${total})</h2>
      ${list || '<p class="strava-pr-modal-empty">Sin récords</p>'}
    `;
    parentPanel.appendChild(dialog);
    const closeBtn = dialog.querySelector('.strava-pr-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.showModal();
  };

  let cancelled = false;
  const load = async () => {
    renderLoading();
    const data = await safeCall(api.getPersonalRecords(), null);
    if (cancelled) return;
    if (!data) {
      renderError(load);
      return;
    }
    allData = data;
    activeTab = data.primary_sport || 'running';
    renderCurrentView();
  };

  load();

  return () => { cancelled = true; };
}

export function mountRelativeEffort(container) {
  if (!container) return () => {};
  const api = window.electronAPI;
  if (!api) {
    container.innerHTML = `<div class="strava-panel">${skeletonCard()}</div>`;
    return () => {};
  }

  let cancelled = false;

  const renderLoading = () => {
    container.innerHTML = `<div class="strava-panel">${skeletonCard()}</div>`;
  };

  const renderError = () => {
    renderStateCard(container.firstElementChild || container, {
      title: SP.relativeEffort.title,
      state: 'error',
      subtitle: strings.states.errorLoading,
      onRetry: load,
    });
  };

  const renderContent = (data) => {
    const cur = data.current_week || {};
    const prev = data.previous_week || {};
    const curValue = Number(cur.value) || 0;
    const prevValue = Number(prev.value) || 0;
    const curClamped = clampEffortDisplay(curValue);
    const prevClamped = clampEffortDisplay(prevValue);
    const level = effortLevel(curValue);
    const curRange = `${formatDateShort(new Date(cur.start_date + 'T00:00:00'))} – ${formatDateShort(new Date(cur.end_date + 'T00:00:00'))} ${new Date(cur.end_date + 'T00:00:00').getFullYear()}`;
    const prevRange = `${formatDateShort(new Date(prev.start_date + 'T00:00:00'))} – ${formatDateShort(new Date(prev.end_date + 'T00:00:00'))} ${new Date(prev.end_date + 'T00:00:00').getFullYear()}`;
    const trend = data.trend || 'flat';
    const trendIcon = trend === 'up' ? icon('arrow-up', 14) : trend === 'down' ? icon('arrow-down', 14) : icon('minus', 14);
    const trendClass = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-flat';
    const deltaSign = data.delta > 0 ? '+' : '';
    const panel = document.createElement('div');
    panel.className = 'strava-panel strava-relative-effort';
    panel.setAttribute('aria-label', SP.relativeEffort.detailLabel);
    panel.innerHTML = `
      <h3 class="strava-panel-title">${SP.relativeEffort.title}</h3>
      <div class="strava-relative-effort-main">
        <div class="strava-relative-effort-value effort-level--${level}">${curClamped.value}${curClamped.clamped ? '+' : ''}</div>
        <div class="strava-relative-effort-delta ${trendClass}">${trendIcon} ${deltaSign}${data.delta}</div>
      </div>
      <div class="strava-relative-effort-label">${SP.relativeEffort.thisWeek} · ${curRange}</div>
      <div class="strava-relative-effort-prev">
        <div class="strava-relative-effort-prev-value">${prevClamped.value}${prevClamped.clamped ? '+' : ''}</div>
        <div class="strava-relative-effort-label">${SP.relativeEffort.previousWeek} · ${prevRange}</div>
      </div>
      <div class="strava-relative-effort-chevron" aria-hidden="true">${icon('chevron-right', 18)}</div>
    `;
    container.innerHTML = '';
    container.appendChild(panel);
  };

  const load = async () => {
    renderLoading();
    const data = await safeCall(api.getRelativeEffort(), null);
    if (cancelled) return;
    if (!data) { renderError(); return; }
    renderContent(data);
  };

  load();

  return () => { cancelled = true; };
}

export function mountTrainingLog(container) {
  if (!container) return () => {};
  const api = window.electronAPI;
  if (!api) {
    container.innerHTML = `<div class="strava-panel">${skeletonCard()}</div>`;
    return () => {};
  }

  let cancelled = false;
  const state = {
    weekStart: (() => {
      const d = new Date();
      const dow = d.getDay() || 7;
      const m = new Date(d);
      m.setDate(d.getDate() - (dow - 1));
      return toIsoDate(m);
    })(),
  };

  const renderLoading = () => {
    container.innerHTML = `<div class="strava-panel">${skeletonCard()}</div>`;
  };

  const renderError = () => {
    renderStateCard(container.firstElementChild || container, {
      title: SP.trainingLog.title,
      state: 'error',
      subtitle: strings.states.errorLoading,
      onRetry: load,
    });
  };

  const shiftWeek = (deltaWeeks) => {
    const d = new Date(state.weekStart + 'T00:00:00');
    d.setDate(d.getDate() + (deltaWeeks * 7));
    state.weekStart = toIsoDate(d);
    load();
  };

  const goToCurrentWeek = () => {
    const d = new Date();
    const dow = d.getDay() || 7;
    const m = new Date(d);
    m.setDate(d.getDate() - (dow - 1));
    state.weekStart = toIsoDate(m);
    load();
  };

  const renderEmpty = (data) => {
    const panel = document.createElement('div');
    panel.className = 'strava-panel';
    const range = `${formatDateShort(new Date(data.week_start + 'T00:00:00'))} – ${formatDateShort(new Date(data.week_end + 'T00:00:00'))} ${new Date(data.week_end + 'T00:00:00').getFullYear()}`;
    panel.innerHTML = `
      <h3 class="strava-panel-title">${SP.trainingLog.title}</h3>
      <div class="strava-training-log-header">
        <button class="strava-calendar-nav-btn" data-week-nav="prev" aria-label="Semana anterior">${icon('chevron-left', 14)}</button>
        <div class="strava-training-log-range">${range}</div>
        <button class="strava-calendar-nav-btn" data-week-nav="next" aria-label="Semana siguiente">${icon('chevron-right', 14)}</button>
        ${data.is_current ? '' : `<button class="strava-calendar-today-btn" data-week-today>${SP.calendar.today}</button>`}
      </div>
      <div class="strava-bubbles" aria-label="${SP.trainingLog.empty}">
        ${SP.trainingLog.days.map((d) => `
          <div class="strava-bubble-col">
            <div class="strava-bubble-day">${d}</div>
            <div class="strava-bubble-empty" aria-hidden="true"></div>
            <div class="strava-bubble-label"></div>
          </div>
        `).join('')}
      </div>
      <p class="strava-helper-text-sm">${SP.trainingLog.empty}</p>
    `;
    container.innerHTML = '';
    container.appendChild(panel);
    attachNavHandlers(panel);
  };

  const attachNavHandlers = (panel) => {
    const prev = panel.querySelector('[data-week-nav="prev"]');
    const next = panel.querySelector('[data-week-nav="next"]');
    const today = panel.querySelector('[data-week-today]');
    if (prev) prev.addEventListener('click', () => shiftWeek(-1));
    if (next) next.addEventListener('click', () => shiftWeek(1));
    if (today) today.addEventListener('click', goToCurrentWeek);
  };

  const renderBubbles = (data) => {
    const days = data.days || [];
    const totalMin = days.reduce((s, d) => s + (Number(d.duration_minutes) || 0), 0);
    const maxMin = Math.max(...days.map(d => Number(d.duration_minutes) || 0), 1);
    const MIN_R = 8, MAX_R = 28;
    const range = `${formatDateShort(new Date(data.week_start + 'T00:00:00'))} – ${formatDateShort(new Date(data.week_end + 'T00:00:00'))} ${new Date(data.week_end + 'T00:00:00').getFullYear()}`;
    const dowLabels = SP.trainingLog.days;
    const bubblesHtml = days.map((d, i) => {
      const minutes = Number(d.duration_minutes) || 0;
      const hasActivity = minutes > 0;
      const r = hasActivity
        ? Math.round(MIN_R + (minutes / maxMin) * (MAX_R - MIN_R))
        : 8;
      const showLabel = minutes >= 60;
      const label = showLabel ? formatDuration(minutes) : '';
      const dayName = dowLabels[i];
      const aria = d.date
        ? `${dayName} ${formatDateLong(new Date(d.date + 'T00:00:00'))}, ${formatDuration(minutes)} de entrenamiento`
        : dayName;
      return `
        <div class="strava-bubble-col">
          <div class="strava-bubble-day">${dayName}</div>
          ${hasActivity
            ? `<button class="strava-bubble" style="width:${r * 2}px;height:${r * 2}px" aria-label="${aria}" data-bubble-date="${d.date}"></button>`
            : `<div class="strava-bubble-empty" aria-label="${aria}"></div>`}
          <div class="strava-bubble-label">${label}</div>
        </div>
      `;
    }).join('');
    const panel = document.createElement('div');
    panel.className = 'strava-panel';
    panel.innerHTML = `
      <h3 class="strava-panel-title">${SP.trainingLog.title}</h3>
      <div class="strava-training-log-header">
        <button class="strava-calendar-nav-btn" data-week-nav="prev" aria-label="Semana anterior">${icon('chevron-left', 14)}</button>
        <div class="strava-training-log-range">${range}</div>
        <button class="strava-calendar-nav-btn" data-week-nav="next" aria-label="Semana siguiente">${icon('chevron-right', 14)}</button>
        ${data.is_current ? '' : `<button class="strava-calendar-today-btn" data-week-today>${SP.calendar.today}</button>`}
      </div>
      <div class="strava-bubbles" role="region" aria-label="${SP.trainingLog.title}">
        ${bubblesHtml}
      </div>
      <div style="text-align:right;margin-top:var(--space-2)">
        <span class="strava-training-log-total">${formatDuration(totalMin)}</span>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(panel);
    attachNavHandlers(panel);
    panel.querySelectorAll('[data-bubble-date]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (api.navigate) api.navigate('activity');
      });
    });
  };

  const load = async () => {
    renderLoading();
    const data = await safeCall(api.getTrainingLogWeek(state.weekStart), null);
    if (cancelled) return;
    if (!data) { renderError(); return; }
    const total = (data.days || []).reduce((s, d) => s + (Number(d.duration_minutes) || 0), 0);
    if (total === 0) renderEmpty(data);
    else renderBubbles(data);
  };

  load();

  return () => { cancelled = true; };
}

export function mountStreak(container) {
  if (!container) return () => {};
  const api = window.electronAPI;
  if (!api) {
    container.innerHTML = `<div class="strava-panel">${skeletonCard()}</div>`;
    return () => {};
  }

  let cancelled = false;

  const renderLoading = () => {
    container.innerHTML = `<div class="strava-panel">${skeletonCard()}</div>`;
  };

  const renderError = () => {
    renderStateCard(container.firstElementChild || container, {
      title: SP.streak.title,
      state: 'error',
      subtitle: strings.states.errorLoading,
      onRetry: load,
    });
  };

  const renderContent = (data) => {
    const weeks = Number(data.weeks) || 0;
    const acts = Number(data.total_activities) || 0;
    const isActive = !!data.is_active;
    const panel = document.createElement('div');
    panel.className = 'strava-panel';
    if (weeks === 0) {
      panel.innerHTML = `
        <h3 class="strava-panel-title">${SP.streak.title}</h3>
        <div class="strava-streak">
          <div class="strava-streak-empty">${SP.streak.broken}</div>
          <button class="strava-streak-share" disabled aria-label="${SP.streak.shareDisabledLabel}" aria-disabled="true">
            ${icon('share-2', 14)} ${SP.streak.shareLabel}
          </button>
        </div>
        <p class="strava-helper-text-sm-left">${SP.streak.startPrompt}</p>
      `;
    } else {
      const subject = encodeURIComponent(SP.streak.shareSubject);
      const body = encodeURIComponent(SP.streak.shareBody(weeks, acts));
      const mailto = `mailto:?subject=${subject}&body=${body}`;
      panel.innerHTML = `
        <h3 class="strava-panel-title">${SP.streak.title}</h3>
        <div class="strava-streak">
          <div class="strava-streak-metrics">
            <div class="strava-streak-metric">
              <div class="strava-streak-value">${weeks}</div>
              <div class="strava-streak-label">${SP.streak.weeks}</div>
            </div>
            <div class="strava-streak-metric">
              <div class="strava-streak-value">${acts}</div>
              <div class="strava-streak-label">${SP.streak.inStreak}</div>
            </div>
          </div>
          <a class="strava-streak-share" href="${mailto}" aria-label="${SP.streak.shareLabel}">
            ${icon('share-2', 14)} ${SP.streak.shareLabel}
          </a>
        </div>
        ${!isActive && weeks > 0 ? `<p class="strava-grace-text">${SP.streak.gracePeriodPrompt}</p>` : ''}
      `;
    }
    container.innerHTML = '';
    container.appendChild(panel);
  };

  const load = async () => {
    renderLoading();
    const data = await safeCall(api.getStreak(), null);
    if (cancelled) return;
    if (!data) { renderError(); return; }
    renderContent(data);
  };

  load();

  return () => { cancelled = true; };
}

export function mountStreakCalendar(container) {
  if (!container) return () => {};
  const api = window.electronAPI;
  if (!api) {
    container.innerHTML = `<div class="strava-panel">${skeletonCard()}</div>`;
    return () => {};
  }

  let cancelled = false;
  const state = {
    yearMonth: (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })(),
  };

  const renderLoading = () => {
    container.innerHTML = `<div class="strava-panel strava-streak-calendar">
      <div class="strava-streak-calendar-left">${skeletonCard()}</div>
      <div class="strava-streak-calendar-right">
        <div class="strava-skeleton-calendar-grid">
          ${Array.from({ length: 35 }, () => '<div class="strava-skeleton-calendar-cell skeleton"></div>').join('')}
        </div>
      </div>
    </div>`;
  };

  const renderError = () => {
    renderStateCard(container.firstElementChild || container, {
      title: SP.streak.combinedTitle,
      state: 'error',
      subtitle: strings.states.errorLoading,
      onRetry: load,
    });
  };

  const renderContent = (streakData, calendarData) => {
    const weeks = Number(streakData.weeks) || 0;
    const acts = Number(streakData.total_activities) || 0;
    const isActive = !!streakData.is_active;

    const months = SP.calendar.months;
    const [year, monthNum] = state.yearMonth.split('-').map(Number);
    const monthName = months[monthNum - 1];
    const days = calendarData.days || [];
    const calWeeks = (calendarData.weeks || []).filter(w => w.in_month);
    const today = toIsoDate(new Date());
    const firstDow = days.length > 0 ? days[0].day_of_week : 0;
    const emptyCellsBefore = Array.from({ length: firstDow }, () => '<div class="strava-calendar-empty"></div>').join('');
    const dayCells = days.map((d) => {
      const isFuture = d.date > today;
      const hasActivity = d.has_activity;
      const classes = [
        'strava-calendar-day',
        hasActivity ? 'strava-calendar-day--active' : 'strava-calendar-day--inactive',
        isFuture ? 'strava-calendar-day--future' : '',
      ].filter(Boolean).join(' ');
      const monthNameLong = months[monthNum - 1];
      const ariaLabel = hasActivity
        ? SP.calendar.activityAria(d.day, monthNameLong, d.activity_count, d.sport_type || 'actividad')
        : SP.calendar.activityAria(d.day, monthNameLong, 0, '');
      const inner = hasActivity
        ? `${sportIcon(d.sport_type, 14)}${d.activity_count > 1 ? '<span class="strava-calendar-day-multi-dot" aria-hidden="true"></span>' : ''}`
        : `${d.day}`;
      return `<button class="${classes}" data-cal-date="${d.date}" aria-label="${ariaLabel}">${inner}</button>`;
    }).join('');
    const weekStatusCells = calWeeks.map((w) => {
      let cls = 'strava-calendar-week-status--incomplete';
      let inner = '';
      if (w.completed) {
        cls = 'strava-calendar-week-status--completed';
        inner = icon('check', 12);
      } else if (w.is_current && calWeeks.length > 0) {
        cls = 'strava-calendar-week-status--active';
        const label = SP.streak.weeks;
        inner = `<span>${icon('flame', 10)}</span><span>${label}</span>`;
      }
      return `<div class="strava-calendar-week-status ${cls}" aria-hidden="true">${inner}</div>`;
    }).join('');
    const dowHeaders = SP.trainingLog.days.map(d => `<div class="strava-calendar-dow-header">${d}</div>`).join('');
    const monthHeader = `<div class="strava-calendar-dow-header"></div>`;

    let streakHtml = '';
    if (weeks === 0) {
      streakHtml = `
        <div class="strava-streak-calendar-left">
          <h3 class="strava-panel-title">${SP.streak.title}</h3>
          <div class="strava-streak-empty">${SP.streak.broken}</div>
          <p class="strava-helper-text-sm-left">${SP.streak.startPrompt}</p>
        </div>
      `;
    } else {
      streakHtml = `
        <div class="strava-streak-calendar-left">
          <h3 class="strava-panel-title">${SP.streak.title}</h3>
          <div class="strava-streak-metrics">
            <div class="strava-streak-metric">
              <div class="strava-streak-value">${weeks}</div>
              <div class="strava-streak-label">${SP.streak.weeks}</div>
            </div>
            <div class="strava-streak-metric">
              <div class="strava-streak-value">${acts}</div>
              <div class="strava-streak-label">${SP.streak.inStreak}</div>
            </div>
          </div>
          ${!isActive && weeks > 0 ? `<p class="strava-grace-text">${SP.streak.gracePeriodPrompt}</p>` : ''}
        </div>
      `;
    }

    const panel = document.createElement('div');
    panel.className = 'strava-panel strava-streak-calendar';
    panel.innerHTML = `
      ${streakHtml}
      <div class="strava-streak-calendar-right">
        <div class="strava-calendar-header">
          <button class="strava-calendar-nav-btn" data-cal-nav="prev" aria-label="${SP.calendar.navPrev}">${icon('chevron-left', 14)}</button>
          <div class="strava-calendar-title">${monthName} ${year}</div>
          <button class="strava-calendar-nav-btn" data-cal-nav="next" aria-label="${SP.calendar.navNext}">${icon('chevron-right', 14)}</button>
          <button class="strava-calendar-today-btn" data-cal-today>${SP.calendar.today}</button>
        </div>
        <div class="strava-calendar-grid" role="grid" aria-label="${monthName} ${year}">
          ${dowHeaders}
          ${monthHeader}
          ${emptyCellsBefore}${dayCells}
          ${weekStatusCells}
        </div>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(panel);
    attachHandlers(panel);
  };

  const attachHandlers = (panel) => {
    const prev = panel.querySelector('[data-cal-nav="prev"]');
    const next = panel.querySelector('[data-cal-nav="next"]');
    const today = panel.querySelector('[data-cal-today]');
    if (prev) prev.addEventListener('click', () => shiftMonth(-1));
    if (next) next.addEventListener('click', () => shiftMonth(1));
    if (today) today.addEventListener('click', () => goToToday());
    panel.querySelectorAll('[data-cal-date]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (api.navigate) api.navigate('activity');
      });
    });
  };

  const shiftMonth = (delta) => {
    const [y, m] = state.yearMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    state.yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    load();
  };

  const goToToday = () => {
    const d = new Date();
    state.yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    load();
  };

  const load = async () => {
    renderLoading();
    const [streakData, calendarData] = await Promise.all([
      safeCall(api.getStreak(), null),
      safeCall(api.getMonthlyCalendar(state.yearMonth), null),
    ]);
    if (cancelled) return;
    if (!streakData || !calendarData) { renderError(); return; }
    renderContent(streakData, calendarData);
  };

  load();

  return () => { cancelled = true; };
}

export function mountMonthlyCalendar(container) {
  if (!container) return () => {};
  const api = window.electronAPI;
  if (!api) {
    container.innerHTML = `<div class="strava-panel">${skeletonCard()}</div>`;
    return () => {};
  }

  let cancelled = false;
  const state = {
    yearMonth: (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })(),
  };

  const renderLoading = () => {
    container.innerHTML = `<div class="strava-panel">${skeletonCard()}</div>`;
  };

  const renderError = () => {
    renderStateCard(container.firstElementChild || container, {
      title: SP.calendar.thisMonth,
      state: 'error',
      subtitle: strings.states.errorLoading,
      onRetry: load,
    });
  };

  const renderCalendar = (data) => {
    const months = SP.calendar.months;
    const [year, monthNum] = state.yearMonth.split('-').map(Number);
    const monthName = months[monthNum - 1];
    const days = data.days || [];
    const weeks = (data.weeks || []).filter(w => w.in_month);
    const today = toIsoDate(new Date());
    const firstDow = days.length > 0 ? days[0].day_of_week : 0;
    const emptyCellsBefore = Array.from({ length: firstDow }, () => '<div class="strava-calendar-empty"></div>').join('');
    const dayCells = days.map((d) => {
      const isFuture = d.date > today;
      const hasActivity = d.has_activity;
      const classes = [
        'strava-calendar-day',
        hasActivity ? 'strava-calendar-day--active' : 'strava-calendar-day--inactive',
        isFuture ? 'strava-calendar-day--future' : '',
      ].filter(Boolean).join(' ');
      const monthNameLong = months[monthNum - 1];
      const ariaLabel = hasActivity
        ? SP.calendar.activityAria(d.day, monthNameLong, d.activity_count, d.sport_type || 'actividad')
        : SP.calendar.activityAria(d.day, monthNameLong, 0, '');
      const inner = hasActivity
        ? `${sportIcon(d.sport_type, 14)}${d.activity_count > 1 ? '<span class="strava-calendar-day-multi-dot" aria-hidden="true"></span>' : ''}`
        : `${d.day}`;
      return `<button class="${classes}" data-cal-date="${d.date}" aria-label="${ariaLabel}">${inner}</button>`;
    }).join('');
    const weekStatusCells = weeks.map((w) => {
      let cls = 'strava-calendar-week-status--incomplete';
      let inner = '';
      if (w.completed) {
        cls = 'strava-calendar-week-status--completed';
        inner = icon('check', 12);
      } else if (w.is_current && weeks.length > 0) {
        cls = 'strava-calendar-week-status--active';
        const label = SP.streak.weeks;
        inner = `<span>${icon('flame', 10)}</span><span>${label}</span>`;
      }
      return `<div class="strava-calendar-week-status ${cls}" aria-hidden="true">${inner}</div>`;
    }).join('');
    const dowHeaders = SP.trainingLog.days.map(d => `<div class="strava-calendar-dow-header">${d}</div>`).join('');
    const monthHeader = `<div class="strava-calendar-dow-header"></div>`;
    const panel = document.createElement('div');
    panel.className = 'strava-panel';
    panel.innerHTML = `
      <div class="strava-calendar-header">
        <button class="strava-calendar-nav-btn" data-cal-nav="prev" aria-label="${SP.calendar.navPrev}">${icon('chevron-left', 14)}</button>
        <div class="strava-calendar-title">${monthName} ${year}</div>
        <button class="strava-calendar-nav-btn" data-cal-nav="next" aria-label="${SP.calendar.navNext}">${icon('chevron-right', 14)}</button>
        <button class="strava-calendar-today-btn" data-cal-today>${SP.calendar.today}</button>
      </div>
      <div class="strava-calendar-grid" role="grid" aria-label="${monthName} ${year}">
        ${dowHeaders}
        ${monthHeader}
        ${emptyCellsBefore}${dayCells}
        ${weekStatusCells}
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(panel);
    attachHandlers(panel);
  };

  const attachHandlers = (panel) => {
    const prev = panel.querySelector('[data-cal-nav="prev"]');
    const next = panel.querySelector('[data-cal-nav="next"]');
    const today = panel.querySelector('[data-cal-today]');
    if (prev) prev.addEventListener('click', () => shiftMonth(-1));
    if (next) next.addEventListener('click', () => shiftMonth(1));
    if (today) today.addEventListener('click', () => goToToday());
    panel.querySelectorAll('[data-cal-date]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (api.navigate) api.navigate('activity');
      });
    });
  };

  const shiftMonth = (delta) => {
    const [y, m] = state.yearMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    state.yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    load();
  };

  const goToToday = () => {
    const d = new Date();
    state.yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    load();
  };

  const load = async () => {
    renderLoading();
    const data = await safeCall(api.getMonthlyCalendar(state.yearMonth), null);
    if (cancelled) return;
    if (!data) { renderError(); return; }
    renderCalendar(data);
  };

  load();

  return () => { cancelled = true; };
}
