import Chart from 'chart.js/auto';
import { strings } from '../locales/es.js';
import { safeCall } from '../utils/safe-call.js';

export async function init() {
  if (window._loadingTraining) return;
  window._loadingTraining = true;
  try {
  const container = document.getElementById('view-training');
  container.innerHTML = `
    <h2 class="view-title">${strings.training.title}</h2>
    <div class="card">
      <h2>${strings.training.frequency || 'Planes de Entrenamiento'}</h2>
      <div style="display:flex;gap:12px;align-items:end;flex-wrap:wrap;margin-bottom:12px">
        <div class="form-group">
          <label>${strings.training.frequency || 'Frecuencia'}</label>
          <select id="frequency-select" style="padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)">
            <option value="">${strings.training.daysPerWeek}</option>
            <option value="2">2 ${strings.training.daysPerWeek}</option>
            <option value="3">3 ${strings.training.daysPerWeek}</option>
            <option value="4">4 ${strings.training.daysPerWeek}</option>
            <option value="5">5 ${strings.training.daysPerWeek}</option>
            <option value="6">6 ${strings.training.daysPerWeek}</option>
          </select>
        </div>
        <button class="btn btn-primary" id="btn-generate-plan">${strings.training.frequency}</button>
      </div>
      <div id="workout-plan-display"></div>
      <div id="plan-day-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:12px"></div>
    </div>
    <div class="card">
      <h2>${strings.training.exerciseLibrary}</h2>
      <form id="exercise-form" class="form-row-3" style="margin-bottom:16px">
        <div class="form-group">
          <label>${strings.training.exerciseName}</label>
          <input type="text" name="name" required />
        </div>
        <div class="form-group">
          <label>${strings.training.muscleGroup}</label>
          <input type="text" name="muscle_group" />
        </div>
        <div class="form-group">
          <label>${strings.training.equipment}</label>
          <input type="text" name="equipment" />
        </div>
        <div class="form-group form-row-full">
          <label>${strings.training.movementPattern}</label>
          <input type="text" name="movement_pattern" />
        </div>
        <div class="form-row-full">
          <button type="submit" class="btn btn-primary">${strings.training.addExercise}</button>
        </div>
      </form>
      <div id="exercise-list"><div class="empty-state"><p>${strings.training.noExercises}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.training.trainingRoutines}</h2>
      <form id="routine-form" class="flex-row" style="align-items:end;margin-bottom:16px">
        <div class="form-group">
          <label>${strings.training.routineName}</label>
          <input type="text" name="name" required />
        </div>
        <button type="submit" class="btn btn-primary">${strings.training.createRoutine}</button>
      </form>
      <div id="routine-list"><div class="empty-state"><p>${strings.training.noRoutines}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.training.sessionLogging}</h2>
      <form id="session-form" class="form-row" style="margin-bottom:16px">
        <div class="form-group">
          <label>${strings.measurements.date}</label>
          <input type="date" name="date" required />
        </div>
        <div class="form-group">
          <label>${strings.training.routine}</label>
          <select name="routine_id" id="routine-select">
            <option value="">${strings.training.none}</option>
          </select>
        </div>
        <div class="form-group" style="grid-column:span 2">
          <label>${strings.training.notes}</label>
          <input type="text" name="notes" />
        </div>
        <div style="grid-column:span 2">
          <button type="submit" class="btn btn-primary">${strings.training.logSession}</button>
        </div>
      </form>
      <div id="session-list"><div class="empty-state"><p>${strings.training.noSessions}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.training.progressionChart}</h2>
      <div class="chart-container"><canvas id="progression-chart"></canvas></div>
    </div>
    <div class="card">
      <h2>${strings.training.sessionDeltas}</h2>
      <div id="session-deltas"><div class="empty-state"><p>${strings.training.deltasEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.training.strengthStatus}</h2>
      <div id="strength-status"><div class="empty-state"><p>${strings.training.strengthStatusEmpty}</p></div></div>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) return;

  document.getElementById('exercise-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await safeCall(api.saveExercise(data), null);
    e.target.reset();
    loadExercises();
  });

  document.getElementById('routine-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await safeCall(api.saveTrainingRoutine(data), null);
    e.target.reset();
    loadRoutines();
  });

  document.getElementById('session-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.routine_id = data.routine_id ? parseInt(data.routine_id) : null;
    await safeCall(api.saveTrainingSession(data), null);
    e.target.reset();
    loadSessions();
    loadProgression();
    loadDeltas();
  });

  // Workout plan generator
  const frequencySelect = document.getElementById('frequency-select');
  const generateBtn = document.getElementById('btn-generate-plan');
  const planDisplay = document.getElementById('workout-plan-display');
  const planDayCards = document.getElementById('plan-day-cards');

  generateBtn.addEventListener('click', async () => {
    const freq = parseInt(frequencySelect.value);
    if (!freq) return;

    const plans = await safeCall(api.getWorkoutPlans(), []);
    const matching = plans.filter(p => freq >= p.min_sessions && freq <= p.max_sessions);

    if (matching.length === 0) {
      planDisplay.innerHTML = `<p style="color:var(--text-secondary)">${strings.training.noPlansAvailable.replace('{freq}', freq)}</p>`;
      planDayCards.innerHTML = '';
      return;
    }

    const exercises = await safeCall(api.getExerciseLibrary(), []);
    const exMap = {};
    for (const ex of exercises) exMap[ex.id] = ex;

    let html = '<p style="margin-bottom:8px;font-size:13px;color:var(--text-secondary)">Planes disponibles:</p>';
    for (const plan of matching) {
      html += `<div style="padding:8px;border:1px solid var(--border);border-radius:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
        <span><strong>${plan.name}</strong> (${plan.min_sessions}-${plan.max_sessions} ${strings.training.daysPerWeek})</span>
        <button class="btn btn-primary" style="padding:4px 12px;font-size:12px" data-activate-plan="${plan.id}">${strings.training.useThisPlan}</button>
      </div>`;
    }
    planDisplay.innerHTML = html;

    planDisplay.querySelectorAll('[data-activate-plan]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const planId = parseInt(btn.dataset.activatePlan);
        const days = await safeCall(api.getPlanDays(planId), []);
        const plan = matching.find(p => p.id === planId);

        let cardsHtml = '';
        for (const day of days) {
          const exIds = day.exercise_ids ? day.exercise_ids.split(',').map(Number) : [];
          const dayExercises = exIds.map(id => exMap[id]).filter(Boolean);
          cardsHtml += `
            <div style="border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--bg-secondary)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <strong>${strings.training.routine} ${day.day_number}</strong>
                <span class="tag">${day.focus_area}</span>
              </div>
              <div style="font-size:12px;color:var(--text-secondary)">
                ${dayExercises.map(ex => `
                  <div style="padding:2px 0">
                    <span>${ex.name}</span>
                    ${ex.practical_examples ? `<span style="font-size:11px"> — ${ex.practical_examples}</span>` : ''}
                    <span class="text-muted" style="font-size:11px"> (${ex.muscle_group || ''}${ex.equipment ? `, ${ex.equipment}` : ''})</span>
                  </div>
                `).join('')}
              </div>
              <div style="margin-top:8px;display:flex;gap:6px">
                <button class="btn btn-primary" style="padding:3px 8px;font-size:11px" data-use-plan-day="${planId}" data-day-number="${day.day_number}">${strings.training.usePlan}</button>
                <button class="btn btn-secondary" style="padding:3px 8px;font-size:11px" data-add-exercise-to-day="${planId}" data-day-number="${day.day_number}">${strings.training.addExercise_}</button>
              </div>
            </div>`;
        }
        planDayCards.innerHTML = cardsHtml;

        // Wire "use plan day" to pre-fill session logging
        planDayCards.querySelectorAll('[data-use-plan-day]').forEach(b => {
          b.addEventListener('click', async () => {
            const dayNum = parseInt(b.dataset.dayNumber);
            const dayExercises = days.find(d => d.day_number === dayNum);
            if (!dayExercises || !dayExercises.exercise_ids) return;

            const today = new Date().toISOString().split('T')[0];
            const routineName = `${plan.name} - Día ${dayNum}`;
            const routineResult = await safeCall(api.saveTrainingRoutine({ name: routineName }), null);
            const routines = await safeCall(api.getTrainingRoutines(), []);
            const routine = routines.find(r => r.name === routineName);
            const routineId = routine ? routine.id : null;

            const newSession = await safeCall(api.saveTrainingSession({
              date: today,
              routine_id: routineId,
              notes: dayExercises.focus_area,
            }), null);
            if (newSession) {
              const exIds = dayExercises.exercise_ids.split(',').map(Number);
              for (let i = 0; i < exIds.length; i++) {
                await safeCall(api.saveTrainingSet({
                  session_id: newSession.id,
                  exercise_id: exIds[i],
                  set_number: i + 1,
                  load_kg: null,
                  reps: null,
                  rpe: null,
                }), null);
              }
            }

            loadSessions();
            loadProgression();
            loadDeltas();
          });
        });

        // Wire "add exercise" to open filter dialog
        const allExercises = exercises;
        planDayCards.querySelectorAll('[data-add-exercise-to-day]').forEach(b => {
          b.addEventListener('click', () => {
            const dayNum = parseInt(b.dataset.dayNumber);
            const dayExercises = days.find(d => d.day_number === dayNum);
            const currentIds = dayExercises?.exercise_ids ? dayExercises.exercise_ids.split(',').map(Number) : [];
            const filtered = allExercises.filter(ex => !currentIds.includes(ex.id));

            let pickerHtml = `
              <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center" id="exercise-picker-overlay">
                <div style="background:var(--bg-primary);border-radius:12px;padding:20px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto">
                   <h3 style="margin-bottom:12px">${strings.training.addExercise_} — ${strings.training.routine} ${dayNum}</h3>
                   <div style="display:flex;gap:8px;margin-bottom:12px">
                     <input type="text" id="picker-search" placeholder="${strings.diet.search}..." style="flex:1;padding:6px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" />
                    <select id="picker-muscle-filter" style="padding:6px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)">
                      <option value="">${strings.training.muscleGroup}</option>
                      ${[...new Set(allExercises.map(e => e.muscle_group).filter(Boolean))].map(m => `<option value="${m}">${m}</option>`).join('')}
                    </select>
                  </div>
                  <div id="picker-results">
                    ${filtered.map(ex => `
                      <div style="padding:6px 8px;border-radius:4px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" class="picker-item" data-ex-id="${ex.id}" data-ex-name="${ex.name}">
                        <span>${ex.name}</span>
                        <span style="font-size:11px;color:var(--text-secondary)">${ex.muscle_group || ''}${ex.equipment ? ` · ${ex.equipment}` : ''}</span>
                      </div>
                    `).join('')}
                  </div>
                  <button class="btn btn-secondary" id="picker-close" style="margin-top:12px">${strings.general.close || 'Cerrar'}</button>
                </div>
              </div>`;
            const overlay = document.createElement('div');
            overlay.innerHTML = pickerHtml;
            document.body.appendChild(overlay.firstElementChild);

            const overlayEl = document.getElementById('exercise-picker-overlay');
            document.getElementById('picker-close').addEventListener('click', () => overlayEl.remove());
            overlayEl.addEventListener('click', (e) => { if (e.target === overlayEl) overlayEl.remove(); });

            document.getElementById('picker-search').addEventListener('input', filterPicker);
            document.getElementById('picker-muscle-filter').addEventListener('change', filterPicker);

            function filterPicker() {
              const search = document.getElementById('picker-search').value.toLowerCase();
              const muscle = document.getElementById('picker-muscle-filter').value;
              document.querySelectorAll('.picker-item').forEach(item => {
                const name = item.dataset.exName.toLowerCase();
                const muscleGroup = allExercises.find(e => e.id === parseInt(item.dataset.exId))?.muscle_group || '';
                const matchSearch = !search || name.includes(search);
                const matchMuscle = !muscle || muscleGroup === muscle;
                item.style.display = matchSearch && matchMuscle ? 'flex' : 'none';
              });
            }

            document.querySelectorAll('.picker-item').forEach(item => {
              item.addEventListener('click', async () => {
                const exId = parseInt(item.dataset.exId);
                const newIds = [...currentIds, exId];
                const updatedDay = dayExercises;
                if (updatedDay) {
                  // Store complement in settings
                  const key = `plan_${planId}_day_${dayNum}_complement`;
                  const existing = JSON.parse(await safeCall(api.getSetting(key), null) || '[]');
                  existing.push(exId);
                  await safeCall(api.setSetting(key, JSON.stringify(existing)), null);
                }
                overlayEl.remove();
                // Refresh display
                generateBtn.click();
              });
            });
          });
        });

        await safeCall(api.setSetting('active_workout_plan', JSON.stringify({ planId: plan.id, planName: plan.name })), null);
      });
    });
  });

  // Load active plan on init
  (async function loadActivePlan() {
    const activePlanSetting = await safeCall(api.getSetting('active_workout_plan'), null);
    if (activePlanSetting) {
      const active = JSON.parse(activePlanSetting);
    const plans = await safeCall(api.getWorkoutPlans(), []);
      const plan = plans.find(p => p.id === active.planId);
      if (plan) {
        const days = await safeCall(api.getPlanDays(plan.id), []);
        const exercises = await safeCall(api.getExerciseLibrary(), []);
        const exMap = {};
        for (const ex of exercises) exMap[ex.id] = ex;
        let cardsHtml = '';
        for (const day of days) {
          const exIds = day.exercise_ids ? day.exercise_ids.split(',').map(Number) : [];
          const key = `plan_${plan.id}_day_${day.day_number}_complement`;
          const complement = JSON.parse(await safeCall(api.getSetting(key), null) || '[]');
          const allExIds = [...exIds, ...complement];
          const dayExercises = allExIds.map(id => exMap[id]).filter(Boolean);
          cardsHtml += `
            <div style="border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--bg-secondary)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <strong>${strings.training.routine} ${day.day_number}</strong>
                <span class="tag">${day.focus_area}</span>
              </div>
              <div style="font-size:12px;color:var(--text-secondary)">
                ${dayExercises.map(ex => `<div style="padding:2px 0"><span>${ex.name}</span>${ex.practical_examples ? `<span class="text-warning" style="font-size:11px"> — ${ex.practical_examples}</span>` : ''}<span class="text-muted" style="font-size:11px"> (${ex.muscle_group || ''}${ex.equipment ? `, ${ex.equipment}` : ''})</span></div>`).join('')}
              </div>
              <div style="margin-top:8px;display:flex;gap:6px">
                <button class="btn btn-primary" style="padding:3px 8px;font-size:11px" data-use-plan-day="${plan.id}" data-day-number="${day.day_number}">${strings.training.usePlan}</button>
                <button class="btn btn-secondary" style="padding:3px 8px;font-size:11px" data-add-exercise-to-day="${plan.id}" data-day-number="${day.day_number}">${strings.training.addExercise_}</button>
              </div>
            </div>`;
        }
        planDayCards.innerHTML = cardsHtml;
        planDisplay.innerHTML = `<p style="font-size:13px;color:var(--text-secondary)">Plan activo: <strong>${plan.name}</strong></p>`;
      }
    }
  })();

  const MUSCLE_ICONS = {
    pecho: '🏋️', pectoral: '🏋️', chest: '🏋️',
    espalda: '🔙', back: '🔙',
    hombro: '🏔️', shoulder: '🏔️',
    brazo: '💪', arm: '💪', biceps: '💪', triceps: '💪',
    pierna: '🦵', leg: '🦵', quad: '🦵', cuadriceps: '🦵',
    femoral: '🦵', hamstring: '🦵',
    gluteo: '🍑', glute: '🍑', glúteo: '🍑',
    abdominal: '🧠', abs: '🧠', core: '🧠',
    pantorrilla: '🦶', calf: '🦶',
    antebrazo: '🤌', forearm: '🤌',
    trapecio: '🔺', trap: '🔺', trapezius: '🔺',
    dorsal: '🦅', lat: '🦅',
  };

  function getMuscleIcon(group) {
    if (!group) return '🏋️';
    const g = group.toLowerCase();
    for (const [key, icon] of Object.entries(MUSCLE_ICONS)) {
      if (g.includes(key)) return icon;
    }
    return '🏋️';
  }

  async function loadExercises() {
    const allExercises = await safeCall(api.getExerciseLibrary(), []);
    const el = document.getElementById('exercise-list');
    if (!allExercises || allExercises.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.noExercises}</p></div>`;
      return;
    }

    let _page = 0;
    const _perPage = 20;
    let _filterMuscle = '';
    let _filterEquipment = '';
    let _sortBy = 'name';
    let _sortAsc = true;

    const muscleGroups = [...new Set(allExercises.map(e => e.muscle_group).filter(Boolean))].sort();
    const equipment = [...new Set(allExercises.map(e => e.equipment).filter(Boolean))].sort();

    function getFiltered() {
      let list = [...allExercises];
      if (_filterMuscle) list = list.filter(e => e.muscle_group === _filterMuscle);
      if (_filterEquipment) list = list.filter(e => e.equipment === _filterEquipment);
      list.sort((a, b) => {
        let va = a[_sortBy] || '', vb = b[_sortBy] || '';
        if (typeof va === 'string') {
          va = va.toLowerCase(); vb = vb.toLowerCase();
          return _sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
        }
        return _sortAsc ? va - vb : vb - va;
      });
      return list;
    }

    function renderPage() {
      const filtered = getFiltered();
      const totalPages = Math.ceil(filtered.length / _perPage);
      if (_page >= totalPages) _page = totalPages - 1;
      if (_page < 0) _page = 0;
      const page = filtered.slice(_page * _perPage, (_page + 1) * _perPage);

      let html = `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:end">
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:11px">${strings.training.muscleGroup}</label>
            <select id="ex-filter-muscle" style="padding:4px 8px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)">
              <option value="">${strings.training.all || 'Todos'}</option>
              ${muscleGroups.map(m => `<option value="${m}" ${_filterMuscle === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:11px">${strings.training.equipment}</label>
            <select id="ex-filter-equipment" style="padding:4px 8px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)">
              <option value="">${strings.training.all || 'Todos'}</option>
              ${equipment.map(e => `<option value="${e}" ${_filterEquipment === e ? 'selected' : ''}>${e}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:11px">${strings.general.sort || 'Ordenar'}</label>
            <select id="ex-sort-by" style="padding:4px 8px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)">
              <option value="name" ${_sortBy === 'name' ? 'selected' : ''}>${strings.training.exerciseName}</option>
              <option value="muscle_group" ${_sortBy === 'muscle_group' ? 'selected' : ''}>${strings.training.muscleGroup}</option>
              <option value="equipment" ${_sortBy === 'equipment' ? 'selected' : ''}>${strings.training.equipment}</option>
            </select>
          </div>
          <button class="btn btn-secondary" id="ex-sort-dir" style="padding:4px 10px;font-size:12px">${_sortAsc ? '▲' : '▼'}</button>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;color:var(--text-secondary)">${filtered.length} ${strings.training.exercises || 'ejercicios'}</span>
          <div style="display:flex;gap:4px;align-items:center">
            <button class="btn btn-secondary" id="ex-prev" style="padding:2px 8px;font-size:12px" ${_page === 0 ? 'disabled' : ''}>‹</button>
            <span style="font-size:12px;color:var(--text-secondary)">${_page + 1}/${totalPages}</span>
            <button class="btn btn-secondary" id="ex-next" style="padding:2px 8px;font-size:12px" ${_page >= totalPages - 1 ? 'disabled' : ''}>›</button>
          </div>
        </div>
        <table><thead><tr><th>${strings.training.exerciseName}</th><th>${strings.training.muscleGroup}</th><th>${strings.training.equipment}</th><th>${strings.training.movementPattern}</th><th></th></tr></thead><tbody>`;
      for (const e of page) {
        html += `<tr><td>${getMuscleIcon(e.muscle_group)} ${e.name}</td><td>${e.muscle_group ?? '--'}</td><td>${e.equipment ?? '--'}</td><td>${e.movement_pattern ?? '--'}</td><td><button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-delete-exercise="${e.id}">${strings.general.delete}</button></td></tr>`;
      }
      html += '</tbody></table>';
      el.innerHTML = html;

      el.querySelectorAll('[data-delete-exercise]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm(strings.training.deleteExerciseConfirm)) {
            await safeCall(api.deleteExercise(parseInt(btn.dataset.deleteExercise)), null);
            _page = 0;
            renderPage();
          }
        });
      });

      // Wire filters
      const muscleSelect = document.getElementById('ex-filter-muscle');
      const equipSelect = document.getElementById('ex-filter-equipment');
      const sortSelect = document.getElementById('ex-sort-by');
      const sortDirBtn = document.getElementById('ex-sort-dir');
      if (muscleSelect) muscleSelect.addEventListener('change', () => { _filterMuscle = muscleSelect.value; _page = 0; renderPage(); });
      if (equipSelect) equipSelect.addEventListener('change', () => { _filterEquipment = equipSelect.value; _page = 0; renderPage(); });
      if (sortSelect) sortSelect.addEventListener('change', () => { _sortBy = sortSelect.value; renderPage(); });
      if (sortDirBtn) sortDirBtn.addEventListener('click', () => { _sortAsc = !_sortAsc; renderPage(); });

      const prevBtn = document.getElementById('ex-prev');
      const nextBtn = document.getElementById('ex-next');
      if (prevBtn) prevBtn.addEventListener('click', () => { _page--; renderPage(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { _page++; renderPage(); });
    }

    renderPage();
  }

  async function loadRoutines() {
    const routines = await safeCall(api.getTrainingRoutines(), []);
    const el = document.getElementById('routine-list');
    const select = document.getElementById('routine-select');
    select.innerHTML = `<option value="">${strings.training.none}</option>`;
    if (!routines || routines.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.noRoutines}</p></div>`;
      return;
    }
    let html = `<table><thead><tr><th>${strings.general.name}</th><th>${strings.general.created}</th></tr></thead><tbody>`;
    for (const r of routines) {
      html += `<tr><td>${r.name}</td><td>${r.created_at}</td></tr>`;
      select.innerHTML += `<option value="${r.id}">${r.name}</option>`;
    }
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  async function loadSessions() {
    const sessions = await safeCall(api.getTrainingSessions(), []);
    const el = document.getElementById('session-list');
    if (!sessions || sessions.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.noSessions}</p></div>`;
      return;
    }
    let html = `<table><thead><tr><th>${strings.general.date}</th><th>${strings.general.routine}</th><th>${strings.general.notes}</th><th></th></tr></thead><tbody>`;
    for (const s of sessions) {
      html += `<tr><td>${s.date}</td><td>${s.routine_name ?? '--'}</td><td>${s.notes ?? ''}</td><td><button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-delete-session="${s.id}">${strings.general.delete}</button></td></tr>`;
    }
    html += '</tbody></table>';
    el.innerHTML = html;

    el.querySelectorAll('[data-delete-session]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm(strings.training.deleteSessionConfirm)) {
          await safeCall(api.deleteTrainingSession(parseInt(btn.dataset.deleteSession)), null);
          loadSessions();
          loadProgression();
          loadDeltas();
          loadStrengthStatus();
        }
      });
    });
  }

  async function loadProgression() {
    const sessions = await safeCall(api.getTrainingSessions(), []);
    const canvas = document.getElementById('progression-chart');
    const ctx = canvas.getContext('2d');
    if (window._progChart) window._progChart.destroy();

    if (!sessions || sessions.length < 2) {
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';

    const sorted = [...sessions].reverse();
    const volumes = [];
    const labels = [];

    for (const s of sorted) {
      const sets = await safeCall(api.getTrainingSets(s.id), []);
      const volume = sets.reduce((sum, set) => sum + (set.load_kg || 0) * (set.reps || 0), 0);
      volumes.push(volume);
      labels.push(s.date);
    }

    window._progChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: strings.training.volumeLoad,
          data: volumes,
          borderColor: '#0D9488',
          backgroundColor: 'rgba(13, 148, 136, 0.08)',
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

  async function loadDeltas() {
    const sessions = await safeCall(api.getTrainingSessions(), []);
    const el = document.getElementById('session-deltas');

    if (!sessions || sessions.length < 2) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.deltasEmpty}</p></div>`;
      return;
    }

    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];

    let html = `<table><thead><tr><th>${strings.general.metric}</th><th>${strings.general.previous}</th><th>${strings.general.last}</th><th>${strings.general.delta}</th></tr></thead><tbody>`;
    html += `<tr><td>${strings.general.date}</td><td>${prev.date}</td><td>${last.date}</td><td></td></tr>`;
    html += `<tr><td>${strings.general.routine}</td><td>${prev.routine_name || '--'}</td><td>${last.routine_name || '--'}</td><td></td></tr>`;

    const prevSets = await safeCall(api.getTrainingSets(prev.id), []);
    const lastSets = await safeCall(api.getTrainingSets(last.id), []);
    const prevVolume = prevSets.reduce((sum, s) => sum + (s.load_kg || 0) * (s.reps || 0), 0);
    const lastVolume = lastSets.reduce((sum, s) => sum + (s.load_kg || 0) * (s.reps || 0), 0);
    const volDelta = lastVolume - prevVolume;
    const volArrow = volDelta > 0 ? '▲' : volDelta < 0 ? '▼' : '―';

    html += `<tr><td>${strings.general.volume}</td><td>${prevVolume.toFixed(0)} ${strings.dashboard.unitKg}</td><td>${lastVolume.toFixed(0)} ${strings.dashboard.unitKg}</td><td style="color:${volDelta > 0 ? 'var(--success)' : volDelta < 0 ? 'var(--danger)' : 'var(--text-secondary)'}">${volArrow} ${volDelta > 0 ? '+' : ''}${volDelta.toFixed(0)} ${strings.dashboard.unitKg}</td></tr>`;
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  async function loadStrengthStatus() {
    const profile = await safeCall(api.getProfile(), null);
    const sessions = await safeCall(api.getTrainingSessions(), []);
    const el = document.getElementById('strength-status');

    if (!profile || !sessions || sessions.length < 2) return;

    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];

    const prevSets = await safeCall(api.getTrainingSets(prev.id), []);
    const lastSets = await safeCall(api.getTrainingSets(last.id), []);

    const prevVolume = prevSets.reduce((sum, s) => sum + (s.load_kg || 0) * (s.reps || 0), 0);
    const lastVolume = lastSets.reduce((sum, s) => sum + (s.load_kg || 0) * (s.reps || 0), 0);

    const volumeChange = prevVolume > 0 ? ((lastVolume - prevVolume) / prevVolume) * 100 : 0;
    const maintaining = volumeChange > -10;

    let html = `
      <p>${strings.training.latestSession}: ${last.date} (${last.routine_name || strings.training.none})</p>
      <p>${strings.training.volumeChange}: <strong style="color:${volumeChange > 0 ? 'var(--success)' : volumeChange < 0 ? 'var(--danger)' : 'var(--text-secondary)'}">
        ${volumeChange > 0 ? '+' : ''}${volumeChange.toFixed(1)}%
      </strong></p>
      <p>${strings.training.status}: <strong style="color:${maintaining ? 'var(--success)' : 'var(--danger)'}">
        ${maintaining ? strings.training.strengthMaintained : strings.training.strengthDecreasing}
      </strong></p>
    `;
    if (!maintaining) {
      html += `<p style="font-size:12px;color:var(--text-secondary);margin-top:4px">${strings.training.volumeDropWarning}</p>`;
    }

    el.innerHTML = html;
  }

  await Promise.allSettled([loadExercises(), loadRoutines(), loadSessions(), loadProgression(), loadDeltas(), loadStrengthStatus()]);
  } finally {
    window._loadingTraining = false;
  }
}
