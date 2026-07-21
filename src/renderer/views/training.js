import { getAPI } from "../utils/api-detector.js";
import { strings } from '../locales/es.js';
import { createChart } from '../charts/chart-manager.js';
import { safeCall } from '../utils/safe-call.js';
import { chartColors, chartColorWithAlpha } from '../utils/chart-theme.js';
import { skeletonCard, skeletonRow } from '../utils/skeleton.js';
import { icon } from '../utils/icons.js';
import { renderStateCard } from '../utils/state-card.js';

export async function init() {
  if (window._loadingTraining) return;
  window._loadingTraining = true;
  try {
  const container = document.getElementById('view-training');
  container.innerHTML = `
    <h2 class="view-title">${strings.training.title}</h2>
    <div class="card">
      <h2>${strings.training.frequency}</h2>
      <div style="display:flex;gap:12px;align-items:end;flex-wrap:wrap;margin-bottom:12px">
        <div class="form-group">
          <label>${strings.training.frequency}</label>
          <select id="frequency-select" style="padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" aria-label="${strings.training.frequency}">
            <option value="">${strings.training.daysPerWeek}</option>
            <option value="2">2 ${strings.training.daysPerWeek}</option>
            <option value="3">3 ${strings.training.daysPerWeek}</option>
            <option value="4">4 ${strings.training.daysPerWeek}</option>
            <option value="5">5 ${strings.training.daysPerWeek}</option>
            <option value="6">6 ${strings.training.daysPerWeek}</option>
          </select>
        </div>
        <button class="btn btn-primary" id="btn-generate-plan">${strings.training.generatePlans}</button>
      </div>
      <div id="workout-plan-display" aria-live="polite"></div>
      <div id="plan-day-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:12px" aria-live="polite"></div>
    </div>
    <div class="card">
      <h2>${strings.training.trainingRoutines}</h2>
      <form id="routine-form" class="flex-row" style="align-items:end;margin-bottom:16px">
        <div class="form-group">
          <label>${strings.training.routineName}</label>
          <input type="text" name="name" required aria-label="${strings.training.routineName}" />
        </div>
        <button type="submit" class="btn btn-primary">${strings.training.createRoutine}</button>
      </form>
      <div id="routine-list" aria-live="polite"><div class="empty-state"><p>${strings.training.noRoutines}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.training.sessionLogging}</h2>
      <form id="session-form" class="form-row" style="margin-bottom:16px">
        <div class="form-group">
          <label>${strings.measurements.date}</label>
          <input type="date" name="date" required aria-label="${strings.measurements.date}" />
        </div>
        <div class="form-group">
          <label>${strings.training.routine}</label>
          <select name="routine_id" id="routine-select" aria-label="${strings.training.routine}">
            <option value="">${strings.training.none}</option>
          </select>
        </div>
        <div class="form-group" style="grid-column:span 2">
          <label>${strings.training.notes}</label>
          <input type="text" name="notes" aria-label="${strings.training.notes}" />
        </div>
        <div style="grid-column:span 2">
          <button type="submit" class="btn btn-primary">${strings.training.logSession}</button>
        </div>
      </form>
      <div id="session-list" aria-live="polite"><div class="empty-state"><p>${strings.training.noSessions}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.training.progressionChart}</h2>
      <div id="progression-placeholder" aria-live="polite"></div>
      <div class="chart-container"><canvas id="progression-chart"></canvas></div>
    </div>
    <div class="card">
      <h2>${strings.training.sessionDeltas}</h2>
      <div id="session-deltas" aria-live="polite"><div class="empty-state"><p>${strings.training.deltasEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.training.exerciseLibrary}</h2>
      <form id="exercise-form" class="form-row-3" style="margin-bottom:16px">
        <div class="form-group">
          <label>${strings.training.exerciseName}</label>
          <input type="text" name="name" required aria-label="${strings.training.exerciseName}" />
        </div>
        <div class="form-group">
          <label>${strings.training.muscleGroup}</label>
          <input type="text" name="muscle_group" aria-label="${strings.training.muscleGroup}" />
        </div>
        <div class="form-group">
          <label>${strings.training.equipment}</label>
          <input type="text" name="equipment" aria-label="${strings.training.equipment}" />
        </div>
        <div class="form-group form-row-full">
          <label>${strings.training.movementPattern}</label>
          <input type="text" name="movement_pattern" aria-label="${strings.training.movementPattern}" />
        </div>
        <div class="form-row-full">
          <button type="submit" class="btn btn-primary">${strings.training.addExercise}</button>
        </div>
      </form>
      <div id="exercise-list" aria-live="polite"><div class="empty-state"><p>${strings.training.noExercises}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.training.strengthStatus}</h2>
      <div id="strength-status" aria-live="polite"><div class="empty-state"><p>${strings.training.strengthStatusEmpty}</p></div></div>
    </div>
  `;

  const api = getAPI();
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
    loadStrengthStatus();
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

    let html = `<p class="text-sm text-muted" style="margin-bottom:8px">${strings.training.plansAvailable}</p>`;
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
              <div class="text-xs text-muted">
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
            if (newSession && newSession.id) {
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
            loadStrengthStatus();
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
                     <input type="text" id="picker-search" placeholder="${strings.diet.search}..." style="flex:1;padding:6px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" aria-label="${strings.diet.search}" />
                    <select id="picker-muscle-filter" style="padding:6px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" aria-label="${strings.training.muscleGroup}">
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
                  <button class="btn btn-secondary" id="picker-close" style="margin-top:12px">${strings.general.close}</button>
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
  async function loadActivePlan() {
    const activePlanSetting = await safeCall(api.getSetting('active_workout_plan'), null);
    if (!activePlanSetting) return;
    const active = JSON.parse(activePlanSetting);
    const plans = await safeCall(api.getWorkoutPlans(), null);
    if (!plans) {
      renderStateCard(planDisplay, { title: strings.training.frequency, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadActivePlan });
      planDayCards.innerHTML = '';
      return;
    }
    const plan = plans.find(p => p.id === active.planId);
    if (!plan) return;

    const days = await safeCall(api.getPlanDays(plan.id), null);
    if (!days) {
      renderStateCard(planDisplay, { title: strings.training.routine, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadActivePlan });
      planDayCards.innerHTML = '';
      return;
    }
    const exercises = await safeCall(api.getExerciseLibrary(), null);
    if (!exercises) {
      renderStateCard(planDisplay, { title: strings.training.exerciseLibrary, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadActivePlan });
      planDayCards.innerHTML = '';
      return;
    }
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
          <div class="text-xs text-muted">
            ${dayExercises.map(ex => `<div style="padding:2px 0"><span>${ex.name}</span>${ex.practical_examples ? `<span class="text-warning" style="font-size:11px"> — ${ex.practical_examples}</span>` : ''}<span class="text-muted" style="font-size:11px"> (${ex.muscle_group || ''}${ex.equipment ? `, ${ex.equipment}` : ''})</span></div>`).join('')}
          </div>
          <div style="margin-top:8px;display:flex;gap:6px">
            <button class="btn btn-primary" style="padding:3px 8px;font-size:11px" data-use-plan-day="${plan.id}" data-day-number="${day.day_number}">${strings.training.usePlan}</button>
            <button class="btn btn-secondary" style="padding:3px 8px;font-size:11px" data-add-exercise-to-day="${plan.id}" data-day-number="${day.day_number}">${strings.training.addExercise_}</button>
          </div>
        </div>`;
    }
    planDayCards.innerHTML = cardsHtml;
    planDisplay.innerHTML = `<p class="text-sm text-muted">${strings.training.activePlan} <strong>${plan.name}</strong></p>`;

    planDayCards.querySelectorAll('[data-use-plan-day]').forEach(b => {
      b.addEventListener('click', async () => {
        const dayNum = parseInt(b.dataset.dayNumber);
        const dayObj = days.find(d => d.day_number === dayNum);
        if (!dayObj || !dayObj.exercise_ids) return;

        const baseIds = dayObj.exercise_ids.split(',').map(Number);
        const cKey = `plan_${plan.id}_day_${dayNum}_complement`;
        const cIds = JSON.parse(await safeCall(api.getSetting(cKey), null) || '[]');
        const exIds = [...baseIds, ...cIds];

        const today = new Date().toISOString().split('T')[0];
        const routineName = `${plan.name} - Día ${dayNum}`;
        const routineResult = await safeCall(api.saveTrainingRoutine({ name: routineName }), null);
        const routines = await safeCall(api.getTrainingRoutines(), []);
        const routine = routines.find(r => r.name === routineName);
        const routineId = routine ? routine.id : (routineResult && routineResult.id ? routineResult.id : null);

        const newSession = await safeCall(api.saveTrainingSession({
          date: today,
          routine_id: routineId,
          notes: dayObj.focus_area,
        }), null);
        if (newSession && newSession.id) {
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
        loadStrengthStatus();
      });
    });

    planDayCards.querySelectorAll('[data-add-exercise-to-day]').forEach(b => {
      b.addEventListener('click', async () => {
        const dayNum = parseInt(b.dataset.dayNumber);
        const dayObj = days.find(d => d.day_number === dayNum);
        const baseIds = dayObj && dayObj.exercise_ids ? dayObj.exercise_ids.split(',').map(Number) : [];
        const cKey = `plan_${plan.id}_day_${dayNum}_complement`;
        const cIds = JSON.parse(await safeCall(api.getSetting(cKey), null) || '[]');
        const currentIds = [...baseIds, ...cIds];
        const filtered = exercises.filter(ex => !currentIds.includes(ex.id));

        let pickerHtml = `
          <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center" id="exercise-picker-overlay">
            <div style="background:var(--bg-primary);border-radius:12px;padding:20px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto">
              <h3 style="margin-bottom:12px">${strings.training.addExercise_} — ${strings.training.routine} ${dayNum}</h3>
              <div style="display:flex;gap:8px;margin-bottom:12px">
                <input type="text" id="picker-search" placeholder="${strings.diet.search}..." style="flex:1;padding:6px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" aria-label="${strings.diet.search}" />
                <select id="picker-muscle-filter" style="padding:6px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" aria-label="${strings.training.muscleGroup}">
                  <option value="">${strings.training.muscleGroup}</option>
                  ${[...new Set(exercises.map(e => e.muscle_group).filter(Boolean))].map(m => `<option value="${m}">${m}</option>`).join('')}
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
              <button class="btn btn-secondary" id="picker-close" style="margin-top:12px">${strings.general.close}</button>
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
            const muscleGroup = exercises.find(e => e.id === parseInt(item.dataset.exId))?.muscle_group || '';
            const matchSearch = !search || name.includes(search);
            const matchMuscle = !muscle || muscleGroup === muscle;
            item.style.display = matchSearch && matchMuscle ? 'flex' : 'none';
          });
        }

        document.querySelectorAll('.picker-item').forEach(item => {
          item.addEventListener('click', async () => {
            const exId = parseInt(item.dataset.exId);
            const existing = JSON.parse(await safeCall(api.getSetting(cKey), null) || '[]');
            if (!existing.includes(exId)) existing.push(exId);
            await safeCall(api.setSetting(cKey, JSON.stringify(existing)), null);
            overlayEl.remove();
            await loadActivePlan();
          });
        });
      });
    });
  }

  await loadActivePlan();

  const MUSCLE_ICONS = {
    pecho: 'heart', pectoral: 'heart', chest: 'heart',
    espalda: 'arrow-up-right-from-square', back: 'arrow-up-right-from-square',
    dorsal: 'arrow-up-right-from-square', lat: 'arrow-up-right-from-square',
    hombro: 'circle-user', shoulder: 'circle-user',
    trapecio: 'circle-user', trap: 'circle-user', trapezius: 'circle-user',
    brazo: 'dumbbell', arm: 'dumbbell',
    biceps: 'dumbbell', bíceps: 'dumbbell',
    triceps: 'dumbbell', tríceps: 'dumbbell',
    antebrazo: 'dumbbell', forearm: 'dumbbell',
    pierna: 'footprints', leg: 'footprints',
    quad: 'footprints', cuadriceps: 'footprints',
    femoral: 'footprints', hamstring: 'footprints',
    pantorrilla: 'footprints', calf: 'footprints', gemelo: 'footprints',
    gluteo: 'circle', glúteo: 'circle', glute: 'circle',
    abdominal: 'activity', abs: 'activity', core: 'activity',
    'cuerpo completo': 'layers', 'full body': 'layers', fullbody: 'layers',
  };

  function getMuscleIcon(group, size = 14) {
    if (!group) return icon('dumbbell', size);
    const g = group.toLowerCase();
    for (const [key, name] of Object.entries(MUSCLE_ICONS)) {
      if (g.includes(key)) return icon(name, size);
    }
    return icon('dumbbell', size);
  }

  async function loadExercises() {
    const el = document.getElementById('exercise-list');
    try {
    const allExercises = await safeCall(api.getExerciseLibrary(), null);
    if (!allExercises) {
      renderStateCard(el, { title: strings.training.exerciseLibrary, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadExercises });
      return;
    }
    if (allExercises.length === 0) {
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
            <select id="ex-filter-muscle" style="padding:4px 8px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" aria-label="${strings.training.muscleGroup}">
              <option value="">${strings.training.all}</option>
              ${muscleGroups.map(m => `<option value="${m}" ${_filterMuscle === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:11px">${strings.training.equipment}</label>
            <select id="ex-filter-equipment" style="padding:4px 8px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" aria-label="${strings.training.equipment}">
              <option value="">${strings.training.all}</option>
              ${equipment.map(e => `<option value="${e}" ${_filterEquipment === e ? 'selected' : ''}>${e}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:11px">${strings.general.sort}</label>
            <select id="ex-sort-by" style="padding:4px 8px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" aria-label="${strings.general.sort}">
              <option value="name" ${_sortBy === 'name' ? 'selected' : ''}>${strings.training.exerciseName}</option>
              <option value="muscle_group" ${_sortBy === 'muscle_group' ? 'selected' : ''}>${strings.training.muscleGroup}</option>
              <option value="equipment" ${_sortBy === 'equipment' ? 'selected' : ''}>${strings.training.equipment}</option>
            </select>
          </div>
          <button class="btn btn-secondary" id="ex-sort-dir" style="padding:4px 10px;font-size:12px">${_sortAsc ? '▲' : '▼'}</button>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span class="text-xs text-muted">${filtered.length} ${strings.training.exercises}</span>
          <div style="display:flex;gap:4px;align-items:center">
            <button class="btn btn-secondary" id="ex-prev" style="padding:2px 8px;font-size:12px" ${_page === 0 ? 'disabled' : ''}>‹</button>
            <span class="text-xs text-muted">${_page + 1}/${totalPages}</span>
            <button class="btn btn-secondary" id="ex-next" style="padding:2px 8px;font-size:12px" ${_page >= totalPages - 1 ? 'disabled' : ''}>›</button>
          </div>
        </div>
        <div class="data-table-wrapper"><table class="data-table"><thead><tr><th>${strings.training.exerciseName}</th><th>${strings.training.muscleGroup}</th><th>${strings.training.equipment}</th><th>${strings.training.movementPattern}</th><th></th></tr></thead><tbody>`;
      for (const e of page) {
        html += `<tr><td>${getMuscleIcon(e.muscle_group)} ${e.name}</td><td>${e.muscle_group ?? '--'}</td><td>${e.equipment ?? '--'}</td><td>${e.movement_pattern ?? '--'}</td><td><button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-delete-exercise="${e.id}">${strings.general.delete}</button></td></tr>`;
      }
      html += '</tbody></table></div>';
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
    } catch (err) {
      console.error('loadExercises error:', err);
      renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadExercises });
    }
  }

  async function loadRoutines() {
    const el = document.getElementById('routine-list');
    try {
    const routines = await safeCall(api.getTrainingRoutines(), null);
    const select = document.getElementById('routine-select');
    select.innerHTML = `<option value="">${strings.training.none}</option>`;
    if (!routines) {
      renderStateCard(el, { title: strings.training.trainingRoutines, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadRoutines });
      return;
    }
    if (routines.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.noRoutines}</p></div>`;
      return;
    }
    let html = `<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>${strings.general.name}</th><th>${strings.general.created}</th><th></th></tr></thead><tbody>`;
    for (const r of routines) {
      html += `<tr><td data-routine-name="${r.id}">${r.name}</td><td>${r.created_at}</td><td style="white-space:nowrap"><button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-edit-routine="${r.id}">${strings.training.editRoutine}</button> <button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-delete-routine="${r.id}">${strings.training.deleteRoutine}</button></td></tr>`;
      select.innerHTML += `<option value="${r.id}">${r.name}</option>`;
    }
    html += '</tbody></table></div>';
    el.innerHTML = html;

    el.querySelectorAll('[data-edit-routine]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.editRoutine);
        const nameCell = el.querySelector(`td[data-routine-name="${id}"]`);
        const currentName = nameCell ? nameCell.textContent.trim() : '';
        const newName = prompt(strings.training.routineName, currentName);
        if (newName && newName.trim() && newName.trim() !== currentName) {
          await safeCall(api.saveTrainingRoutine({ id, name: newName.trim() }), null);
          loadRoutines();
        }
      });
    });

    el.querySelectorAll('[data-delete-routine]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.deleteRoutine);
        if (confirm(strings.training.deleteRoutineConfirm)) {
          await safeCall(api.deleteTrainingRoutine(id), null);
          loadRoutines();
          loadSessions();
        }
      });
    });
    } catch (err) {
      console.error('loadRoutines error:', err);
      renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadRoutines });
    }
  }

  async function loadSessions() {
    const el = document.getElementById('session-list');
    try {
    const sessions = await safeCall(api.getTrainingSessions(), null);
    if (!sessions) {
      renderStateCard(el, { title: strings.training.sessionLogging, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadSessions });
      return;
    }
    if (sessions.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.noSessions}</p></div>`;
      return;
    }
    let html = `<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>${strings.general.date}</th><th>${strings.general.routine}</th><th>${strings.general.notes}</th><th></th><th></th></tr></thead><tbody>`;
    for (const s of sessions) {
      html += `<tr><td>${s.date}</td><td>${s.routine_name ?? '--'}</td><td>${s.notes ?? ''}</td><td><button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-toggle-sets="${s.id}" aria-label="${strings.training.addSet}">${icon('chevron-down', 12)}</button></td><td><button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-delete-session="${s.id}">${strings.general.delete}</button></td></tr>`;
      html += `<tr data-sets-row="${s.id}" style="display:none"><td colspan="5"><div data-sets-container="${s.id}" style="padding:8px 12px;background:var(--bg-primary);border-radius:6px"></div></td></tr>`;
    }
    html += '</tbody></table></div>';
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

    el.querySelectorAll('[data-toggle-sets]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const sessionId = parseInt(btn.dataset.toggleSets);
        const row = el.querySelector(`tr[data-sets-row="${sessionId}"]`);
        const container = el.querySelector(`div[data-sets-container="${sessionId}"]`);
        if (row.style.display === 'none') {
          row.style.display = '';
          btn.innerHTML = icon('chevron-up', 12);
          await renderSessionSets(sessionId, container);
        } else {
          row.style.display = 'none';
          btn.innerHTML = icon('chevron-down', 12);
        }
      });
    });
    } catch (err) {
      console.error('loadSessions error:', err);
      renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadSessions });
    }
  }

  async function renderSessionSets(sessionId, container) {
    const [sets, exercises] = await Promise.all([
      safeCall(api.getTrainingSets(sessionId), []),
      safeCall(api.getExerciseLibrary(), []),
    ]);
    const exMap = {};
    for (const ex of exercises) exMap[ex.id] = ex;

    function estimated1RM(load, reps) {
      if (load == null || reps == null || reps < 1) return null;
      return Math.round(load * (1 + reps / 30) * 10) / 10;
    }

    let html = `<table class="data-table" style="margin-bottom:12px"><thead><tr><th>${strings.training.setNumber}</th><th>${strings.training.exerciseName}</th><th>${strings.training.load}</th><th>${strings.training.reps}</th><th>${strings.training.rpe}</th><th>1RM est.</th><th></th></tr></thead><tbody>`;
    if (sets && sets.length > 0) {
      for (const set of sets) {
        const ex = exMap[set.exercise_id];
        const rm = estimated1RM(set.load_kg, set.reps);
        const rmDisplay = rm != null ? `${rm} kg` : '--';
        html += `<tr><td>${set.set_number}</td><td>${ex ? ex.name : '--'}</td><td>${set.load_kg ?? '--'}</td><td>${set.reps ?? '--'}</td><td>${set.rpe ?? '--'}</td><td style="font-family:var(--font-mono);color:var(--accent);font-weight:500">${rmDisplay}</td><td><button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-delete-set="${set.id}">${strings.training.deleteSet}</button></td></tr>`;
      }
    } else {
      html += `<tr><td colspan="7" class="text-xs text-muted">${strings.states.noData}</td></tr>`;
    }
    html += '</tbody></table>';

    if (!exercises || exercises.length === 0) {
      html += `<p class="text-xs text-muted">${strings.training.noExercises}</p>`;
      container.innerHTML = html;
      wireSetDeletes(container, sessionId);
      return;
    }

    html += `<form class="form-row" style="align-items:end;gap:8px" data-set-form="${sessionId}">
      <div class="form-group" style="grid-column:span 2">
        <label>${strings.training.exerciseName}</label>
        <select name="exercise_id" required aria-label="${strings.training.exerciseName}">
          ${exercises.map(ex => `<option value="${ex.id}">${ex.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>${strings.training.load}</label>
        <input type="number" step="0.5" name="load_kg" aria-label="${strings.training.load}" />
      </div>
      <div class="form-group">
        <label>${strings.training.reps}</label>
        <input type="number" name="reps" aria-label="${strings.training.reps}" />
      </div>
      <div class="form-group">
        <label>${strings.training.rpe}</label>
        <input type="number" min="1" max="10" name="rpe" aria-label="${strings.training.rpe}" />
      </div>
      <div>
        <button type="submit" class="btn btn-primary">${strings.training.addSet}</button>
      </div>
    </form>`;

    container.innerHTML = html;
    wireSetDeletes(container, sessionId);

    container.querySelector(`form[data-set-form="${sessionId}"]`).addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      const existing = await safeCall(api.getTrainingSets(sessionId), []);
      const setNumber = (existing && existing.length > 0 ? Math.max(...existing.map(s => s.set_number || 0)) : 0) + 1;
      await safeCall(api.saveTrainingSet({
        session_id: sessionId,
        exercise_id: parseInt(data.exercise_id),
        set_number: setNumber,
        load_kg: data.load_kg ? parseFloat(data.load_kg) : null,
        reps: data.reps ? parseInt(data.reps) : null,
        rpe: data.rpe ? parseInt(data.rpe) : null,
      }), null);
      e.target.reset();
      await renderSessionSets(sessionId, container);
      loadProgression();
      loadDeltas();
      loadStrengthStatus();
    });
  }

  function wireSetDeletes(container, sessionId) {
    container.querySelectorAll('[data-delete-set]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await safeCall(api.deleteTrainingSet(parseInt(btn.dataset.deleteSet)), null);
        await renderSessionSets(sessionId, container);
        loadProgression();
        loadDeltas();
        loadStrengthStatus();
      });
    });
  }

  async function loadProgression() {
    const canvas = document.getElementById('progression-chart');
    const placeholder = document.getElementById('progression-placeholder');
    try {
    const sessions = await safeCall(api.getTrainingSessions(), null);
    if (!sessions) {
      canvas.style.display = 'none';
      if (placeholder) renderStateCard(placeholder, { title: strings.training.progressionChart, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadProgression });
      return;
    }
    const ctx = canvas.getContext('2d');

    if (sessions.length < 2) {
      canvas.style.display = 'none';
      if (placeholder) placeholder.innerHTML = `<div class="empty-state"><p>${strings.training.progressionPlaceholder}</p></div>`;
      return;
    }
    canvas.style.display = 'block';
    if (placeholder) placeholder.innerHTML = '';

    const sorted = [...sessions].reverse();
    const volumes = [];
    const labels = [];

    for (const s of sorted) {
      const sets = await safeCall(api.getTrainingSets(s.id), []);
      const volume = sets.reduce((sum, set) => sum + (set.load_kg || 0) * (set.reps || 0), 0);
      volumes.push(volume);
      labels.push(s.date);
    }

    createChart('progression', ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: strings.training.volumeLoad,
          data: volumes,
          borderColor: chartColors.accent,
          backgroundColor: chartColorWithAlpha(chartColors.accent, 0.08),
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
    } catch (err) {
      console.error('loadProgression error:', err);
      canvas.style.display = 'none';
      if (placeholder) renderStateCard(placeholder, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadProgression });
    }
  }

  async function loadDeltas() {
    const el = document.getElementById('session-deltas');
    try {
    const sessions = await safeCall(api.getTrainingSessions(), null);
    if (!sessions) {
      renderStateCard(el, { title: strings.training.sessionDeltas, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadDeltas });
      return;
    }

    if (sessions.length < 2) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.deltasEmpty}</p></div>`;
      return;
    }

    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];

    let html = `<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>${strings.general.metric}</th><th>${strings.general.previous}</th><th>${strings.general.last}</th><th>${strings.general.delta}</th></tr></thead><tbody>`;
    html += `<tr><td>${strings.general.date}</td><td>${prev.date}</td><td>${last.date}</td><td></td></tr>`;
    html += `<tr><td>${strings.general.routine}</td><td>${prev.routine_name || '--'}</td><td>${last.routine_name || '--'}</td><td></td></tr>`;

    const prevSets = await safeCall(api.getTrainingSets(prev.id), []);
    const lastSets = await safeCall(api.getTrainingSets(last.id), []);
    const prevVolume = prevSets.reduce((sum, s) => sum + (s.load_kg || 0) * (s.reps || 0), 0);
    const lastVolume = lastSets.reduce((sum, s) => sum + (s.load_kg || 0) * (s.reps || 0), 0);
    const volDelta = lastVolume - prevVolume;
    const volArrow = volDelta > 0 ? '▲' : volDelta < 0 ? '▼' : '―';

    html += `<tr><td>${strings.general.volume}</td><td>${prevVolume.toFixed(0)} ${strings.dashboard.unitKg}</td><td>${lastVolume.toFixed(0)} ${strings.dashboard.unitKg}</td><td style="color:${volDelta > 0 ? 'var(--success)' : volDelta < 0 ? 'var(--danger)' : 'var(--text-secondary)'}">${volArrow} ${volDelta > 0 ? '+' : ''}${volDelta.toFixed(0)} ${strings.dashboard.unitKg}</td></tr>`;
    html += '</tbody></table></div>';
    el.innerHTML = html;
    } catch (err) {
      console.error('loadDeltas error:', err);
      renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadDeltas });
    }
  }

  async function loadStrengthStatus() {
    const el = document.getElementById('strength-status');
    try {
    const profile = await safeCall(api.getProfile(), null);
    const sessions = await safeCall(api.getTrainingSessions(), null);
    if (!sessions) {
      renderStateCard(el, { title: strings.training.strengthStatus, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadStrengthStatus });
      return;
    }

    if (!profile || sessions.length < 2) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.maintenancePlaceholder}</p></div>`;
      return;
    }

    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    const firstDate = new Date(sorted[0].date);
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const spanDays = Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24));
    if (spanDays < 14) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.maintenancePlaceholder}</p></div>`;
      return;
    }

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
      html += `<p class="text-xs text-muted" style="margin-top:4px">${strings.training.volumeDropWarning}</p>`;
    }

    el.innerHTML = html;
    } catch (err) {
      console.error('loadStrengthStatus error:', err);
      renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadStrengthStatus });
    }
  }

  document.getElementById('exercise-list').innerHTML = skeletonRow();
  document.getElementById('routine-list').innerHTML = skeletonRow(2);
  document.getElementById('session-list').innerHTML = skeletonRow();
  document.getElementById('session-deltas').innerHTML = skeletonCard();
  document.getElementById('strength-status').innerHTML = skeletonCard();

  await Promise.allSettled([loadExercises(), loadRoutines(), loadSessions(), loadProgression(), loadDeltas(), loadStrengthStatus()]);
  } finally {
    window._loadingTraining = false;
  }
}
