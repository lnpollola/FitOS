import Chart from 'chart.js/auto';
import { strings } from '../locales/es.js';

export function init() {
  const container = document.getElementById('view-training');
  container.innerHTML = `
    <h2 class="view-title">${strings.training.title}</h2>
    <div class="card">
      <h2>${strings.training.frequency || 'Planes de Entrenamiento'}</h2>
      <div style="display:flex;gap:12px;align-items:end;flex-wrap:wrap;margin-bottom:12px">
        <div class="form-group">
          <label>${strings.training.frequency || 'Frecuencia'}</label>
          <select id="frequency-select" style="padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)">
            <option value="">${strings.training.daysPerWeek || 'Seleccionar días/semana'}</option>
            <option value="2">2 ${strings.training.daysPerWeek || 'días/semana'}</option>
            <option value="3">3 ${strings.training.daysPerWeek || 'días/semana'}</option>
            <option value="4">4 ${strings.training.daysPerWeek || 'días/semana'}</option>
            <option value="5">5 ${strings.training.daysPerWeek || 'días/semana'}</option>
            <option value="6">6 ${strings.training.daysPerWeek || 'días/semana'}</option>
          </select>
        </div>
        <button class="btn btn-primary" id="btn-generate-plan">Generar Plan</button>
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
          <label>${strings.measurements?.date || 'Fecha'}</label>
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
      <canvas id="progression-chart" height="250"></canvas>
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
    await api.saveExercise(data);
    e.target.reset();
    loadExercises();
  });

  document.getElementById('routine-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await api.saveTrainingRoutine(data);
    e.target.reset();
    loadRoutines();
  });

  document.getElementById('session-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.routine_id = data.routine_id ? parseInt(data.routine_id) : null;
    await api.saveTrainingSession(data);
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

    const plans = await api.getWorkoutPlans();
    const matching = plans.filter(p => freq >= p.min_sessions && freq <= p.max_sessions);

    if (matching.length === 0) {
      planDisplay.innerHTML = `<p style="color:var(--text-secondary)">No hay planes disponibles para ${freq} días/semana</p>`;
      planDayCards.innerHTML = '';
      return;
    }

    const exercises = await api.getExerciseLibrary();
    const exMap = {};
    for (const ex of exercises) exMap[ex.id] = ex;

    let html = '<p style="margin-bottom:8px;font-size:13px;color:var(--text-secondary)">Planes disponibles:</p>';
    for (const plan of matching) {
      html += `<div style="padding:8px;border:1px solid var(--border);border-radius:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
        <span><strong>${plan.name}</strong> (${plan.min_sessions}-${plan.max_sessions} días/semana)</span>
        <button class="btn btn-primary" style="padding:4px 12px;font-size:12px" data-activate-plan="${plan.id}">${strings.training.useThisPlan || 'Usar este Plan'}</button>
      </div>`;
    }
    planDisplay.innerHTML = html;

    planDisplay.querySelectorAll('[data-activate-plan]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const planId = parseInt(btn.dataset.activatePlan);
        const days = await api.getPlanDays(planId);
        const plan = matching.find(p => p.id === planId);

        let cardsHtml = '';
        for (const day of days) {
          const exIds = day.exercise_ids ? day.exercise_ids.split(',').map(Number) : [];
          const dayExercises = exIds.map(id => exMap[id]).filter(Boolean);
          cardsHtml += `
            <div style="border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--bg-secondary)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <strong>Día ${day.day_number}</strong>
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
                <button class="btn btn-primary" style="padding:3px 8px;font-size:11px" data-use-plan-day="${planId}" data-day-number="${day.day_number}">${strings.training.useThisPlan || 'Usar'}</button>
                <button class="btn btn-secondary" style="padding:3px 8px;font-size:11px" data-add-exercise-to-day="${planId}" data-day-number="${day.day_number}">${strings.training.addExercise_ || 'Añadir ejercicio'}</button>
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
            const routineResult = await api.saveTrainingRoutine({ name: routineName });
            const routines = await api.getTrainingRoutines();
            const routine = routines.find(r => r.name === routineName);
            const routineId = routine ? routine.id : null;

            const session = await api.saveTrainingSession({
              date: today,
              routine_id: routineId,
              notes: dayExercises.focus_area,
            });

            const sessions = await api.getTrainingSessions();
            const newSession = sessions[0];
            if (newSession) {
              const exIds = dayExercises.exercise_ids.split(',').map(Number);
              for (let i = 0; i < exIds.length; i++) {
                await api.saveTrainingSet({
                  session_id: newSession.id,
                  exercise_id: exIds[i],
                  set_number: i + 1,
                  load_kg: null,
                  reps: null,
                  rpe: null,
                });
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
                  <h3 style="margin-bottom:12px">${strings.training.addExercise_ || 'Añadir ejercicio'} — Día ${dayNum}</h3>
                  <div style="display:flex;gap:8px;margin-bottom:12px">
                    <input type="text" id="picker-search" placeholder="Buscar..." style="flex:1;padding:6px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" />
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
                  const existing = JSON.parse(await api.getSetting(key) || '[]');
                  existing.push(exId);
                  await api.setSetting(key, JSON.stringify(existing));
                }
                overlayEl.remove();
                // Refresh display
                generateBtn.click();
              });
            });
          });
        });

        await api.setSetting('active_workout_plan', JSON.stringify({ planId: plan.id, planName: plan.name }));
      });
    });
  });

  // Load active plan on init
  (async function loadActivePlan() {
    const activePlanSetting = await api.getSetting('active_workout_plan');
    if (activePlanSetting) {
      const active = JSON.parse(activePlanSetting);
      const plans = await api.getWorkoutPlans();
      const plan = plans.find(p => p.id === active.planId);
      if (plan) {
        const days = await api.getPlanDays(plan.id);
        const exercises = await api.getExerciseLibrary();
        const exMap = {};
        for (const ex of exercises) exMap[ex.id] = ex;
        let cardsHtml = '';
        for (const day of days) {
          const exIds = day.exercise_ids ? day.exercise_ids.split(',').map(Number) : [];
          const key = `plan_${plan.id}_day_${day.day_number}_complement`;
          const complement = JSON.parse(await api.getSetting(key) || '[]');
          const allExIds = [...exIds, ...complement];
          const dayExercises = allExIds.map(id => exMap[id]).filter(Boolean);
          cardsHtml += `
            <div style="border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--bg-secondary)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <strong>Día ${day.day_number}</strong>
                <span class="tag">${day.focus_area}</span>
              </div>
              <div style="font-size:12px;color:var(--text-secondary)">
                ${dayExercises.map(ex => `<div style="padding:2px 0"><span>${ex.name}</span>${ex.practical_examples ? `<span class="text-warning" style="font-size:11px"> — ${ex.practical_examples}</span>` : ''}<span class="text-muted" style="font-size:11px"> (${ex.muscle_group || ''}${ex.equipment ? `, ${ex.equipment}` : ''})</span></div>`).join('')}
              </div>
              <div style="margin-top:8px;display:flex;gap:6px">
                <button class="btn btn-primary" style="padding:3px 8px;font-size:11px" data-use-plan-day="${plan.id}" data-day-number="${day.day_number}">${strings.training.useThisPlan || 'Usar'}</button>
                <button class="btn btn-secondary" style="padding:3px 8px;font-size:11px" data-add-exercise-to-day="${plan.id}" data-day-number="${day.day_number}">${strings.training.addExercise_ || 'Añadir ejercicio'}</button>
              </div>
            </div>`;
        }
        planDayCards.innerHTML = cardsHtml;
        planDisplay.innerHTML = `<p style="font-size:13px;color:var(--text-secondary)">Plan activo: <strong>${plan.name}</strong></p>`;
      }
    }
  })();

  async function loadExercises() {
    const exercises = await api.getExerciseLibrary();
    const el = document.getElementById('exercise-list');
    if (!exercises || exercises.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.noExercises}</p></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Nombre</th><th>Grupo Muscular</th><th>Equipo</th><th>Patrón</th></tr></thead><tbody>';
    for (const e of exercises) {
      html += `<tr><td>${e.name}</td><td>${e.muscle_group ?? '--'}</td><td>${e.equipment ?? '--'}</td><td>${e.movement_pattern ?? '--'}</td></tr>`;
    }
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  async function loadRoutines() {
    const routines = await api.getTrainingRoutines();
    const el = document.getElementById('routine-list');
    const select = document.getElementById('routine-select');
    select.innerHTML = `<option value="">${strings.training.none}</option>`;
    if (!routines || routines.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.noRoutines}</p></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Nombre</th><th>Creado</th></tr></thead><tbody>';
    for (const r of routines) {
      html += `<tr><td>${r.name}</td><td>${r.created_at}</td></tr>`;
      select.innerHTML += `<option value="${r.id}">${r.name}</option>`;
    }
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  async function loadSessions() {
    const sessions = await api.getTrainingSessions();
    const el = document.getElementById('session-list');
    if (!sessions || sessions.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.noSessions}</p></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Fecha</th><th>Rutina</th><th>Notas</th></tr></thead><tbody>';
    for (const s of sessions) {
      html += `<tr><td>${s.date}</td><td>${s.routine_name ?? '--'}</td><td>${s.notes ?? ''}</td></tr>`;
    }
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  async function loadProgression() {
    const sessions = await api.getTrainingSessions();
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
      const sets = await api.getTrainingSets ? await api.getTrainingSets(s.id) : [];
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
    const sessions = await api.getTrainingSessions();
    const el = document.getElementById('session-deltas');

    if (!sessions || sessions.length < 2) {
      el.innerHTML = `<div class="empty-state"><p>${strings.training.deltasEmpty}</p></div>`;
      return;
    }

    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];

    let html = '<table><thead><tr><th>Métrica</th><th>Anterior</th><th>Última</th><th>Delta</th></tr></thead><tbody>';
    html += `<tr><td>Fecha</td><td>${prev.date}</td><td>${last.date}</td><td></td></tr>`;
    html += `<tr><td>Rutina</td><td>${prev.routine_name || '--'}</td><td>${last.routine_name || '--'}</td><td></td></tr>`;

    const prevSets = await api.getTrainingSets ? await api.getTrainingSets(prev.id) : [];
    const lastSets = await api.getTrainingSets ? await api.getTrainingSets(last.id) : [];
    const prevVolume = prevSets.reduce((sum, s) => sum + (s.load_kg || 0) * (s.reps || 0), 0);
    const lastVolume = lastSets.reduce((sum, s) => sum + (s.load_kg || 0) * (s.reps || 0), 0);
    const volDelta = lastVolume - prevVolume;
    const volArrow = volDelta > 0 ? '▲' : volDelta < 0 ? '▼' : '―';

    html += `<tr><td>Volumen</td><td>${prevVolume.toFixed(0)} kg</td><td>${lastVolume.toFixed(0)} kg</td><td style="color:${volDelta > 0 ? 'var(--success)' : volDelta < 0 ? 'var(--danger)' : 'var(--text-secondary)'}">${volArrow} ${volDelta > 0 ? '+' : ''}${volDelta.toFixed(0)} kg</td></tr>`;
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  async function loadStrengthStatus() {
    const profile = await api.getProfile();
    const sessions = await api.getTrainingSessions();
    const el = document.getElementById('strength-status');

    if (!profile || !sessions || sessions.length < 2) return;

    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];

    const prevSets = await api.getTrainingSets ? await api.getTrainingSets(prev.id) : [];
    const lastSets = await api.getTrainingSets ? await api.getTrainingSets(last.id) : [];

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

  loadExercises();
  loadRoutines();
  loadSessions();
  loadProgression();
  loadDeltas();
  loadStrengthStatus();
}
