import Chart from 'chart.js/auto';
import { strings } from '../locales/es.js';

const SESSION_TEMPLATES = {
  cycling: { name: 'Ciclismo', defaultCal: 400, defaultDur: 60 },
  boxing: { name: 'Boxeo', defaultCal: 500, defaultDur: 45 },
  HIIT: { name: 'HIIT', defaultCal: 350, defaultDur: 30 },
  walking: { name: 'Caminata', defaultCal: 200, defaultDur: 45 },
  football: { name: 'Fútbol', defaultCal: 450, defaultDur: 60 },
  paddle: { name: 'Pádel', defaultCal: 350, defaultDur: 50 },
  running: { name: 'Running', defaultCal: 350, defaultDur: 30 },
  swimming: { name: 'Natación', defaultCal: 300, defaultDur: 40 },
  yoga: { name: 'Yoga', defaultCal: 150, defaultDur: 45 },
  strength: { name: 'Fuerza', defaultCal: 250, defaultDur: 50 },
  other: { name: 'Otro', defaultCal: 200, defaultDur: 30 },
};

export function init() {
  const container = document.getElementById('view-activity');
  container.innerHTML = `
    <h2 class="view-title">${strings.activity.title}</h2>
    <div class="card">
      <h2>${strings.activity.importAppleHealth}</h2>
      <p style="margin-bottom:12px">${strings.activity.importCsvDesc}</p>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-primary" id="btn-import-health">${strings.activity.importAppleHealth}</button>
        <button class="btn btn-secondary" id="btn-install-healthsync" style="display:none">Instalar HealthSync</button>
        <span id="healthsync-status" style="font-size:13px;color:var(--text-secondary)"></span>
      </div>
      <div id="health-import-progress" style="display:none;margin-top:12px">
        <div style="background:var(--bg-tertiary);border-radius:4px;height:20px;overflow:hidden">
          <div id="health-progress-bar" style="width:0%;height:100%;background:var(--accent);transition:width 0.3s"></div>
        </div>
        <p id="health-progress-text" style="font-size:13px;color:var(--text-secondary);margin-top:4px"></p>
      </div>
      <div id="health-import-result" style="display:none;margin-top:8px"></div>
    </div>
    <div class="card">
      <h2>Sesiones Rápidas</h2>
      <p style="margin-bottom:12px;font-size:13px;color:var(--text-secondary)">Selecciona una o varias sesiones para crearlas hoy:</p>
      <div id="session-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:12px"></div>
      <div id="batch-actions" style="display:none;margin-top:8px">
        <button class="btn btn-primary" id="btn-create-selected">Crear sesiones seleccionadas</button>
      </div>
    </div>
    <div class="card">
      <h2>${strings.activity.importCsv}</h2>
      <p style="margin-bottom:12px">${strings.activity.importCsvDesc}</p>
      <button class="btn btn-primary" id="btn-import-csv">${strings.activity.importCsvBtn}</button>
    </div>
    <div class="card">
      <h2>${strings.activity.manualEntry}</h2>
      <form id="activity-form" class="form-row">
        <div class="form-group">
          <label>${strings.activity.date}</label>
          <input type="date" name="date" required />
        </div>
        <div class="form-group">
          <label>${strings.activity.steps}</label>
          <input type="number" name="steps" min="0" />
        </div>
        <div class="form-group">
          <label>${strings.activity.activeCalories}</label>
          <input type="number" name="active_calories" min="0" step="1" />
        </div>
        <div class="form-group">
          <label>${strings.activity.restingCalories}</label>
          <input type="number" name="resting_calories" min="0" step="1" />
        </div>
        <div class="form-group">
          <label>${strings.activity.avgHeartRate}</label>
          <input type="number" name="heart_rate_avg" min="30" max="250" />
        </div>
        <div class="form-group">
          <label>${strings.activity.sleepHours}</label>
          <input type="number" name="sleep_hours" min="0" max="24" step="0.1" />
        </div>
        <div class="form-row-full">
          <button type="submit" class="btn btn-primary">${strings.activity.saveActivity}</button>
        </div>
      </form>
    </div>
    <div class="card">
      <h2>${strings.activity.sportActivity}</h2>
      <form id="sport-form" class="form-row">
        <div class="form-group">
          <label>${strings.activity.date}</label>
          <input type="date" name="date" required />
        </div>
        <div class="form-group">
          <label>${strings.activity.sportType}</label>
          <select name="sport_type" required>
            <option value="">${strings.activity.selectSport}</option>
            <option value="running">${strings.activity.running}</option>
            <option value="cycling">${strings.activity.cycling}</option>
            <option value="walking">${strings.activity.walking}</option>
            <option value="swimming">${strings.activity.swimming}</option>
            <option value="yoga">${strings.activity.yoga}</option>
            <option value="HIIT">${strings.activity.hiit}</option>
            <option value="strength">${strings.activity.strength}</option>
            <option value="football">${strings.activity.football}</option>
            <option value="paddle">${strings.activity.paddle}</option>
            <option value="boxing">${strings.activity.boxing}</option>
            <option value="other">${strings.activity.other}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${strings.activity.calories}</label>
          <input type="number" name="calories" min="0" step="1" />
        </div>
        <div class="form-group">
          <label>${strings.activity.durationMin}</label>
          <input type="number" name="duration_minutes" min="0" step="1" />
        </div>
        <div class="form-row-full">
          <button type="submit" class="btn btn-primary">${strings.activity.saveSportActivity}</button>
        </div>
      </form>
    </div>
    <div class="card">
      <h2>${strings.activity.activityTimeline}</h2>
      <div id="activity-timeline"><div class="empty-state"><p>${strings.activity.noActivities}</p><div class="sub">${strings.activity.noActivitiesSub}</div></div></div>
    </div>
    <div class="card" id="weekly-chart-container">
      <h2>${strings.activity.weeklySportSummary}</h2>
      <canvas id="weekly-chart" height="250"></canvas>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) return;

  // Session cards
  const cardsContainer = document.getElementById('session-cards');
  const batchActions = document.getElementById('batch-actions');
  const createSelectedBtn = document.getElementById('btn-create-selected');
  const selectedTypes = new Set();

  function renderSessionCards() {
    cardsContainer.innerHTML = Object.entries(SESSION_TEMPLATES).map(([type, tpl]) => `
      <div class="session-card" data-sport-type="${type}" style="cursor:pointer;border:2px solid ${selectedTypes.has(type) ? 'var(--accent)' : 'var(--border)'};border-radius:8px;padding:12px;background:var(--bg-secondary);transition:border-color 0.2s">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <input type="checkbox" ${selectedTypes.has(type) ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--accent)" />
          <strong>${tpl.name}</strong>
        </div>
        <div style="font-size:12px;color:var(--text-secondary)">
          <div>🔥 ~${tpl.defaultCal} kcal</div>
          <div>⏱ ${tpl.defaultDur} min</div>
        </div>
      </div>
    `).join('');

    cardsContainer.querySelectorAll('.session-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        const cb = card.querySelector('input[type="checkbox"]');
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event('change'));
      });
      card.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        const type = card.dataset.sportType;
        if (e.target.checked) {
          selectedTypes.add(type);
        } else {
          selectedTypes.delete(type);
        }
        card.style.borderColor = e.target.checked ? 'var(--accent)' : 'var(--border)';
        batchActions.style.display = selectedTypes.size > 0 ? 'block' : 'none';
      });
    });
  }

  createSelectedBtn.addEventListener('click', async () => {
    const today = new Date().toISOString().split('T')[0];
    for (const type of selectedTypes) {
      const tpl = SESSION_TEMPLATES[type];
      await api.saveSportActivity({
        date: today,
        sport_type: type,
        calories: tpl.defaultCal,
        duration_minutes: tpl.defaultDur,
      });
    }
    selectedTypes.clear();
    renderSessionCards();
    batchActions.style.display = 'none';
    loadTimeline();
    loadChart();
  });

  renderSessionCards();

  // Apple Health import
  const healthImportBtn = document.getElementById('btn-import-health');
  const installBtn = document.getElementById('btn-install-healthsync');
  const healthStatus = document.getElementById('healthsync-status');
  const progressEl = document.getElementById('health-import-progress');
  const progressBar = document.getElementById('health-progress-bar');
  const progressText = document.getElementById('health-progress-text');
  const resultEl = document.getElementById('health-import-result');

  async function checkHealthsync() {
    const hasHealthsync = await api.checkHealthsync();
    if (!hasHealthsync) {
      installBtn.style.display = 'inline-block';
      healthStatus.textContent = 'HealthSync no instalado';
    } else {
      installBtn.style.display = 'none';
      healthStatus.textContent = 'HealthSync disponible';
    }
  }

  installBtn.addEventListener('click', async () => {
    installBtn.disabled = true;
    installBtn.textContent = 'Instalando...';
    const ok = await api.installHealthsync();
    await checkHealthsync();
    installBtn.disabled = false;
    installBtn.textContent = 'Instalar HealthSync';
  });

  if (api.onHealthImportProgress) {
    api.onHealthImportProgress((msg) => {
      progressEl.style.display = 'block';
      progressText.textContent = msg;
    });
  }

  healthImportBtn.addEventListener('click', async () => {
    const hasHealthsync = await api.checkHealthsync();
    if (!hasHealthsync) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<p style="color:var(--danger)">HealthSync no encontrado. Instálalo primero.</p>`;
      return;
    }

    const xmlPath = 'apple-healt-export/exportar.xml';
    progressEl.style.display = 'block';
    progressBar.style.width = '50%';
    progressText.textContent = 'Importando datos de Apple Health...';
    healthImportBtn.disabled = true;

    const result = await api.importAppleHealthXML(xmlPath);
    progressBar.style.width = '100%';
    healthImportBtn.disabled = false;

    resultEl.style.display = 'block';
    if (result.errors && result.errors.length > 0) {
      resultEl.innerHTML = `<p style="color:var(--danger)">${result.errors.join(', ')}</p>`;
    } else {
      resultEl.innerHTML = `
        <p style="color:var(--success)">${strings.activity.importComplete}</p>
        <p style="font-size:13px">${strings.activity.recordsCreated}: ${result.created} | ${strings.activity.recordsSkipped}: ${result.skipped}</p>
      `;
    }

    loadTimeline();
    loadChart();
  });

  checkHealthsync();

  document.getElementById('btn-import-csv').addEventListener('click', async () => {
    try {
      await api.importActivityCSV();
      loadTimeline();
    } catch (e) {
      console.error('CSV import error:', e);
    }
  });

  document.getElementById('activity-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.steps = data.steps ? parseInt(data.steps) : null;
    data.active_calories = data.active_calories ? parseFloat(data.active_calories) : null;
    data.resting_calories = data.resting_calories ? parseFloat(data.resting_calories) : null;
    data.heart_rate_avg = data.heart_rate_avg ? parseFloat(data.heart_rate_avg) : null;
    data.sleep_hours = data.sleep_hours ? parseFloat(data.sleep_hours) : null;
    await api.saveActivityDay(data);
    loadTimeline();
  });

  document.getElementById('sport-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.calories = data.calories ? parseFloat(data.calories) : null;
    data.duration_minutes = data.duration_minutes ? parseFloat(data.duration_minutes) : null;
    await api.saveSportActivity(data);
    loadTimeline();
  });

  async function loadTimeline() {
    const days = await api.getActivityDays();
    const timeline = document.getElementById('activity-timeline');
    if (!days || days.length === 0) {
      timeline.innerHTML = `<div class="empty-state"><p>${strings.activity.noActivities}</p><div class="sub">${strings.activity.noActivitiesSub}</div></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Fecha</th><th>Pasos</th><th>kcal Activas</th><th>kcal Reposo</th><th>FC media</th><th>Sueño</th></tr></thead><tbody>';
    for (const d of days) {
      const sports = await api.getSportActivities(d.date);
      const sportStr = sports?.length ? sports.map(s => `${s.sport_type} (${s.calories || 0} kcal)`).join(', ') : '';
      html += `<tr><td>${d.date}</td><td>${d.steps ?? '--'}</td><td>${d.active_calories ?? '--'}</td><td>${d.resting_calories ?? '--'}</td><td>${d.heart_rate_avg ?? '--'}</td><td>${d.sleep_hours ?? '--'}</td></tr>`;
      if (sportStr) {
        html += `<tr style="font-size:12px;color:var(--text-secondary)"><td colspan="6">${strings.activity.sport}: ${sportStr}</td></tr>`;
      }
    }
    html += '</tbody></table>';
    timeline.innerHTML = html;
  }

  async function loadChart() {
    const summary = await api.getWeeklySportSummary();
    const canvas = document.getElementById('weekly-chart');
    if (!canvas || !summary || summary.length === 0) {
      document.getElementById('weekly-chart-container').style.display = 'none';
      return;
    }
    document.getElementById('weekly-chart-container').style.display = 'block';
    const ctx = canvas.getContext('2d');
    if (window._weeklyChart) window._weeklyChart.destroy();
    window._weeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: summary.map(s => s.sport_type),
        datasets: [{
          label: strings.activity.calories,
          data: summary.map(s => s.total_calories),
          backgroundColor: '#0D9488',
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#64748B' }, grid: { color: '#E2E8F0' } },
          x: { ticks: { color: '#64748B' } },
        },
      },
    });
  }

  loadTimeline();
  loadChart();
}
