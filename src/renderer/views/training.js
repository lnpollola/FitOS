import Chart from 'chart.js/auto';

export function init() {
  const container = document.getElementById('view-training');
  container.innerHTML = `
    <h2 style="margin-bottom:20px">Strength Training</h2>
    <div class="card">
      <h2>Exercise Library</h2>
      <form id="exercise-form" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="form-group">
          <label>Exercise Name</label>
          <input type="text" name="name" required />
        </div>
        <div class="form-group">
          <label>Muscle Group</label>
          <input type="text" name="muscle_group" />
        </div>
        <div class="form-group">
          <label>Equipment</label>
          <input type="text" name="equipment" />
        </div>
        <div class="form-group" style="grid-column:span 3">
          <label>Movement Pattern</label>
          <input type="text" name="movement_pattern" />
        </div>
        <div style="grid-column:span 3">
          <button type="submit" class="btn btn-primary">Add Exercise</button>
        </div>
      </form>
      <div id="exercise-list"><div class="empty-state"><p>No exercises in library</p></div></div>
    </div>
    <div class="card">
      <h2>Training Routines</h2>
      <form id="routine-form" style="display:flex;gap:12px;align-items:end;margin-bottom:16px">
        <div class="form-group">
          <label>Routine Name</label>
          <input type="text" name="name" required />
        </div>
        <button type="submit" class="btn btn-primary">Create Routine</button>
      </form>
      <div id="routine-list"><div class="empty-state"><p>No routines defined</p></div></div>
    </div>
    <div class="card">
      <h2>Session Logging</h2>
      <form id="session-form" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="form-group">
          <label>Date</label>
          <input type="date" name="date" required />
        </div>
        <div class="form-group">
          <label>Routine</label>
          <select name="routine_id" id="routine-select">
            <option value="">None</option>
          </select>
        </div>
        <div class="form-group" style="grid-column:span 2">
          <label>Notes</label>
          <input type="text" name="notes" />
        </div>
        <div style="grid-column:span 2">
          <button type="submit" class="btn btn-primary">Log Session</button>
        </div>
      </form>
      <div id="session-list"><div class="empty-state"><p>No sessions logged</p></div></div>
    </div>
    <div class="card">
      <h2>Progression Chart</h2>
      <canvas id="progression-chart" height="250"></canvas>
    </div>
    <div class="card">
      <h2>Session Deltas</h2>
      <div id="session-deltas"><div class="empty-state"><p>Log multiple sessions to see deltas</p></div></div>
    </div>
    <div class="card">
      <h2>Strength Maintenance Status</h2>
      <div id="strength-status"><div class="empty-state"><p>Log training sessions and set your profile to see strength maintenance status</p></div></div>
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

  async function loadExercises() {
    const exercises = await api.getExerciseLibrary();
    const el = document.getElementById('exercise-list');
    if (!exercises || exercises.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>No exercises in library</p></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Name</th><th>Muscle Group</th><th>Equipment</th><th>Pattern</th></tr></thead><tbody>';
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
    select.innerHTML = '<option value="">None</option>';
    if (!routines || routines.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>No routines defined</p></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Name</th><th>Created</th></tr></thead><tbody>';
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
      el.innerHTML = `<div class="empty-state"><p>No sessions logged</p></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Date</th><th>Routine</th><th>Notes</th></tr></thead><tbody>';
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
          label: 'Volume Load (kg)',
          data: volumes,
          borderColor: '#e94560',
          backgroundColor: 'rgba(233, 69, 96, 0.1)',
          fill: true,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#a0a0b0' } } },
        scales: {
          y: { ticks: { color: '#a0a0b0' }, grid: { color: '#2a2a4e' } },
          x: { ticks: { color: '#a0a0b0', maxTicksLimit: 10 } },
        },
      },
    });
  }

  async function loadDeltas() {
    const sessions = await api.getTrainingSessions();
    const el = document.getElementById('session-deltas');

    if (!sessions || sessions.length < 2) {
      el.innerHTML = `<div class="empty-state"><p>Log multiple sessions to see deltas</p></div>`;
      return;
    }

    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];

    let html = '<table><thead><tr><th>Metric</th><th>Previous</th><th>Latest</th><th>Delta</th></tr></thead><tbody>';
    html += `<tr><td>Date</td><td>${prev.date}</td><td>${last.date}</td><td></td></tr>`;
    html += `<tr><td>Routine</td><td>${prev.routine_name || '--'}</td><td>${last.routine_name || '--'}</td><td></td></tr>`;

    const prevSets = await api.getTrainingSets ? await api.getTrainingSets(prev.id) : [];
    const lastSets = await api.getTrainingSets ? await api.getTrainingSets(last.id) : [];
    const prevVolume = prevSets.reduce((sum, s) => sum + (s.load_kg || 0) * (s.reps || 0), 0);
    const lastVolume = lastSets.reduce((sum, s) => sum + (s.load_kg || 0) * (s.reps || 0), 0);
    const volDelta = lastVolume - prevVolume;
    const volArrow = volDelta > 0 ? '▲' : volDelta < 0 ? '▼' : '―';

    html += `<tr><td>Volume Load</td><td>${prevVolume.toFixed(0)} kg</td><td>${lastVolume.toFixed(0)} kg</td><td style="color:${volDelta > 0 ? '#4ecdc4' : volDelta < 0 ? '#e94560' : '#a0a0b0'}">${volArrow} ${volDelta > 0 ? '+' : ''}${volDelta.toFixed(0)} kg</td></tr>`;
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
      <p>Latest session: ${last.date} (${last.routine_name || 'No routine'})</p>
      <p>Volume change from previous: <strong style="color:${volumeChange > 0 ? '#4ecdc4' : volumeChange < 0 ? '#e94560' : '#a0a0b0'}">
        ${volumeChange > 0 ? '+' : ''}${volumeChange.toFixed(1)}%
      </strong></p>
      <p>Status: <strong style="color:${maintaining ? '#4ecdc4' : '#e94560'}">
        ${maintaining ? 'Strength maintained ✓' : 'Strength decreasing — consider reducing deficit ⚠'}
      </strong></p>
    `;
    if (!maintaining) {
      html += `<p style="font-size:12px;color:var(--text-secondary);margin-top:4px">Volume has dropped more than 10%. Consider adjusting calorie intake or reducing cardio.</p>`;
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
