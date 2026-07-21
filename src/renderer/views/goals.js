import { getAPI } from "../utils/api-detector.js";
import { strings } from '../locales/es.js';
import { icon } from '../utils/icons.js';
import { goalProgressRing } from '../utils/goal-progress-ring.js';
import { computeDaysRemaining, sortGoalsByDeadline } from '../utils/goals.js';
import { triggerConfetti } from '../utils/confetti.js';
import { skeletonCard } from '../utils/skeleton.js';
import { safeCall } from '../utils/safe-call.js';
import { escapeHtml } from '../utils/formatters.js';

let _celebrationQueue = [];
let _seenCompleted = new Set();

export function init() {
  const container = document.getElementById('view-goals');
  const api = getAPI();
  if (!api) {
    container.innerHTML = `<div class="card"><p>${strings.states.offline}</p></div>`;
    return;
  }

  container.innerHTML = `
    <h2 class="view-title">${strings.goals.title}</h2>
    <div id="goals-toolbar" style="margin-bottom:var(--space-4)">
      <button class="btn btn-primary" id="btn-new-goal">${icon('plus', 14)} ${strings.goals.newGoal}</button>
    </div>
    <div id="goals-empty" style="display:none"></div>
    <div id="goals-active" style="display:none"></div>
    <div id="goals-completed" style="display:none"></div>
    <div id="goals-archived" style="display:none"></div>
    <div id="goals-celebration" style="display:none"></div>
    <div id="goals-modal" style="display:none"></div>
    <div id="goals-skeleton">${skeletonCard()}</div>
  `;

  renderGoals(container, api);
  setupEventListeners(container, api);
}

async function renderGoals(container, api) {
  const skeletonEl = container.querySelector('#goals-skeleton');
  const emptyEl = container.querySelector('#goals-empty');
  const activeEl = container.querySelector('#goals-active');
  const completedEl = container.querySelector('#goals-completed');
  const archivedEl = container.querySelector('#goals-archived');

  skeletonEl.style.display = '';
  emptyEl.style.display = 'none';
  activeEl.style.display = 'none';
  completedEl.style.display = 'none';
  archivedEl.style.display = 'none';

  let goals;
  try {
    goals = await api.getGoals();
  } catch {
    goals = [];
  }

  if (!Array.isArray(goals)) goals = [];

  const progressMap = new Map();
  for (const g of goals) {
    const result = await safeCall(api.getGoalProgress(g.id), null);
    if (result && result.ok) {
      g.current = result.current;
      g.progress_pct = result.progress_pct;
    } else {
      g.progress_pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 1000) / 10) : 0;
    }
  }

  const active = goals.filter(g => !g.archived && g.progress_pct < 100);
  const completed = goals.filter(g => !g.archived && g.progress_pct >= 100);
  const archived = goals.filter(g => g.archived);

  const sortedActive = sortGoalsByDeadline(active);

  skeletonEl.style.display = 'none';

  if (goals.length === 0) {
    emptyEl.style.display = '';
    emptyEl.innerHTML = `
      <div class="card" style="text-align:center;padding:var(--space-8)">
        <div style="font-size:48px;margin-bottom:var(--space-4);opacity:0.3">${icon('target', 48)}</div>
        <h3>${strings.goals.emptyTitle}</h3>
        <p class="text-muted" style="margin-bottom:var(--space-4)">${strings.goals.emptySubtitle}</p>
        <button class="btn btn-primary" id="btn-empty-new-goal">${icon('plus', 14)} ${strings.goals.createGoal}</button>
      </div>
    `;
    return;
  }

  if (sortedActive.length > 0) {
    activeEl.style.display = '';
    activeEl.innerHTML = `
      <div class="goals-grid">
        ${sortedActive.map(g => renderGoalCard(g)).join('')}
      </div>
    `;
  }

  if (completed.length > 0) {
    completedEl.style.display = '';
    completedEl.innerHTML = `
      <h3 class="goals-section-header">${strings.goals.completedSection}</h3>
      <div class="goals-grid">
        ${completed.map(g => renderGoalCard(g, true)).join('')}
      </div>
    `;
    checkCelebration(completed, api);
  }

  if (archived.length > 0) {
    archivedEl.style.display = '';
    archivedEl.innerHTML = `
      <button class="btn btn-ghost" id="toggle-archived" style="width:100%;justify-content:center">
        ${icon('archive', 14)} ${strings.goals.showArchived}
      </button>
      <div id="archived-list" style="display:none;margin-top:var(--space-3)">
        <div class="goals-grid">
          ${archived.map(g => renderGoalCard(g)).join('')}
        </div>
      </div>
    `;
  }
}

function renderGoalCard(goal, isCompleted) {
  const ring = goalProgressRing(goal.progress_pct, { size: 72 });
  const days = computeDaysRemaining(goal.targetDate);
  const daysLabel = days > 0
    ? `<span class="countdown countdown--${days > 30 ? 'normal' : days > 7 ? 'approaching' : 'urgent'}">${days === 1 ? strings.goals.oneDayRemaining : strings.goals.daysRemaining.replace('{n}', days)}</span>`
    : `<span class="countdown countdown--urgent">${strings.goals.overdue}</span>`;

  const badgeHtml = isCompleted ? `<span class="goal-badge">${icon('badge-check', 16)}</span>` : '';

  let progressDisplay = '';
  if (goal.type === 'weight') {
    const startWeight = goal.startWeight || goal.current;
    progressDisplay = `<span class="goal-card-value">${startWeight.toFixed(1)} → ${goal.target.toFixed(1)}</span>`;
  } else {
    progressDisplay = `<span class="goal-card-value">${formatProgress(goal.current, goal.type)} / ${goal.target}</span>`;
  }

  return `
    <div class="goal-card ${isCompleted ? 'goal-card--completed' : 'goal-card--active'}" data-goal-id="${goal.id}">
      <div class="goal-card-ring">${ring}</div>
      <div class="goal-card-body">
        <div class="goal-card-header">
          <span class="goal-card-label">${badgeHtml}${escapeHtml(goal.label)}</span>
        </div>
        <div class="goal-card-progress">
          ${progressDisplay}
          <span class="goal-card-unit">${escapeHtml(goal.unit)}</span>
        </div>
        <div class="goal-card-percentage-bar">
          <div class="goal-card-percentage-fill" style="width: ${Math.min(100, goal.progress_pct)}%"></div>
        </div>
        <div class="goal-card-footer">
          ${daysLabel}
          <span class="goal-card-pct">${goal.progress_pct}%</span>
        </div>
      </div>
      <div class="goal-card-actions">
        <button class="btn-icon goal-edit" data-goal-id="${goal.id}" title="${strings.goals.edit}">${icon('pencil', 14)}</button>
        ${!isCompleted ? `<button class="btn-icon goal-archive" data-goal-id="${goal.id}" title="${strings.goals.archive}">${icon('archive', 14)}</button>` : ''}
        <button class="btn-icon goal-delete" data-goal-id="${goal.id}" title="${strings.goals.delete}">${icon('trash-2', 14)}</button>
      </div>
    </div>
  `;
}

function setupEventListeners(container, api) {
  container.addEventListener('click', async (e) => {
    const goalCard = e.target.closest('.goal-card');
    const goalIdEl = e.target.closest('[data-goal-id]');
    const goalId = goalIdEl?.dataset.goalId;

    if (e.target.closest('#btn-new-goal') || e.target.closest('#btn-empty-new-goal')) {
      showGoalForm(container, api, null);
    }

    if (e.target.closest('.goal-edit') && goalId) {
      const goals = await api.getGoals();
      const goal = (goals || []).find(g => g.id === goalId);
      if (goal) showGoalForm(container, api, goal);
    }

    if (e.target.closest('.goal-delete') && goalId) {
      showDeleteConfirm(container, api, goalId);
    }

    if (e.target.closest('.goal-archive') && goalId) {
      await safeCall(api.archiveGoal(goalId), null);
      renderGoals(container, api);
    }

    if (e.target.closest('#toggle-archived')) {
      const list = container.querySelector('#archived-list');
      const btn = container.querySelector('#toggle-archived');
      if (list) {
        const hidden = list.style.display === 'none';
        list.style.display = hidden ? '' : 'none';
        if (btn) btn.textContent = hidden ? `${icon('archive', 14)} ${strings.goals.hideArchived}` : `${icon('archive', 14)} ${strings.goals.showArchived}`;
      }
    }
  });

  if (api.onDataChanged) {
    api.onDataChanged(() => {
      renderGoals(container, api);
    });
  }
}

function showGoalForm(container, api, existing) {
  const modalEl = container.querySelector('#goals-modal');
  const isEdit = !!existing;

  modalEl.style.display = '';
  modalEl.innerHTML = `
    <div class="modal-overlay">
      <div class="modal" role="dialog" aria-label="${isEdit ? strings.goals.editGoal : strings.goals.newGoal}">
        <h3>${isEdit ? strings.goals.editGoal : strings.goals.newGoal}</h3>
        <form id="goal-form">
          <div class="form-group">
            <label>${strings.goals.formType}</label>
            <select name="type" id="goal-type" required>
              <option value="weight" ${existing?.type === 'weight' ? 'selected' : ''}>${strings.goals.typeWeight}</option>
              <option value="distance" ${existing?.type === 'distance' ? 'selected' : ''}>${strings.goals.typeDistance}</option>
              <option value="frequency" ${existing?.type === 'frequency' ? 'selected' : ''}>${strings.goals.typeFrequency}</option>
              <option value="custom" ${existing?.type === 'custom' ? 'selected' : ''}>${strings.goals.typeCustom}</option>
            </select>
          </div>
          <div class="form-group">
            <label>${strings.goals.formLabel}</label>
            <input type="text" name="label" required maxlength="100" value="${existing ? escapeHtml(existing.label) : ''}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>${strings.goals.formTarget}</label>
              <input type="number" name="target" min="0.1" step="any" required value="${existing ? existing.target : ''}">
            </div>
            <div class="form-group">
              <label>${strings.goals.formUnit}</label>
              <input type="text" name="unit" required maxlength="30" value="${existing ? escapeHtml(existing.unit) : (unitForType(existing?.type))}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>${strings.goals.formStartDate}</label>
              <input type="date" name="startDate" required value="${existing ? existing.startDate : todayStr()}">
            </div>
            <div class="form-group">
              <label>${strings.goals.formTargetDate}</label>
              <input type="date" name="targetDate" required value="${existing ? existing.targetDate : ''}">
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" id="goal-form-cancel">${strings.goals.cancel}</button>
            <button type="submit" class="btn btn-primary">${isEdit ? strings.goals.save : strings.goals.create}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const typeSelect = modalEl.querySelector('#goal-type');
  const unitInput = modalEl.querySelector('input[name="unit"]');
  typeSelect.addEventListener('change', () => {
    if (!existing) {
      unitInput.value = unitForType(typeSelect.value);
    }
  });

  modalEl.querySelector('#goal-form-cancel').addEventListener('click', () => { modalEl.style.display = 'none'; });
  modalEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) modalEl.style.display = 'none';
  });

  modalEl.querySelector('#goal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const goal = {
      id: existing ? existing.id : crypto.randomUUID(),
      type: fd.get('type'),
      label: fd.get('label').trim(),
      target: parseFloat(fd.get('target')),
      current: existing ? existing.current : 0,
      unit: fd.get('unit').trim(),
      startDate: fd.get('startDate'),
      targetDate: fd.get('targetDate'),
      archived: existing ? existing.archived : false,
      archivedAt: existing ? existing.archivedAt : null,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await api.saveGoal(goal);
    if (result && result.ok) {
      modalEl.style.display = 'none';
      renderGoals(container, api);
    } else {
      alert(result?.error || strings.goals.saveError);
    }
  });
}

function showDeleteConfirm(container, api, goalId) {
  const modalEl = container.querySelector('#goals-modal');
  modalEl.style.display = '';
  modalEl.innerHTML = `
    <div class="modal-overlay">
      <div class="modal" role="dialog" aria-label="${strings.goals.deleteConfirm}">
        <h3>${strings.goals.deleteConfirm}</h3>
        <p>${strings.goals.deleteWarning}</p>
        <div class="form-actions">
          <button class="btn btn-ghost" id="delete-cancel">${strings.goals.cancel}</button>
          <button class="btn btn-danger" id="delete-confirm">${strings.goals.delete}</button>
        </div>
      </div>
    </div>
  `;
  modalEl.querySelector('#delete-cancel').addEventListener('click', () => { modalEl.style.display = 'none'; });
  modalEl.querySelector('#delete-confirm').addEventListener('click', async () => {
    await api.deleteGoal(goalId);
    modalEl.style.display = 'none';
    renderGoals(container, api);
  });
  modalEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) modalEl.style.display = 'none';
  });
}

function checkCelebration(completed, api) {
  const unseen = completed.filter(g => !_seenCompleted.has(g.id));
  for (const g of unseen) {
    _seenCompleted.add(g.id);
    _celebrationQueue.push(g);
  }
  if (_celebrationQueue.length > 0) {
    showNextCelebration(api);
  }
}

function showNextCelebration(api) {
  const container = document.getElementById('view-goals');
  const celebrationEl = container.querySelector('#goals-celebration');
  const goal = _celebrationQueue.shift();
  if (!goal) return;

  celebrationEl.style.display = '';
  const ring = goalProgressRing(100, { size: 96 });
  celebrationEl.innerHTML = `
    <div class="celebration-overlay">
      <canvas class="celebration-canvas" id="confetti-canvas"></canvas>
      <div class="celebration-content">
        <div class="celebration-ring">${ring}</div>
        <h2 class="celebration-title">${strings.goals.celebrationTitle}</h2>
        <p class="celebration-label">${escapeHtml(goal.label)}</p>
        <button class="btn btn-primary" id="celebration-close">${strings.goals.celebrationClose}</button>
      </div>
    </div>
  `;

  const canvas = celebrationEl.querySelector('#confetti-canvas');
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    triggerConfetti(canvas, 2500);
  }

  celebrationEl.querySelector('#celebration-close').addEventListener('click', () => {
    celebrationEl.style.display = 'none';
    if (_celebrationQueue.length > 0) showNextCelebration(api);
  });

  celebrationEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('celebration-overlay')) {
      celebrationEl.style.display = 'none';
      if (_celebrationQueue.length > 0) showNextCelebration(api);
    }
  });
}

function formatProgress(value, type) {
  if (type === 'weight') return Number(value || 0).toFixed(1);
  if (type === 'distance') return Number(value || 0).toFixed(1);
  return Math.round(value || 0);
}

function unitForType(type) {
  const map = { weight: 'kg', distance: 'km', frequency: 'sesiones/sem', custom: '' };
  return map[type] || '';
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}


