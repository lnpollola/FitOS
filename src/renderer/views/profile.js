import { strings } from '../locales/es.js';
import { safeCall } from '../utils/safe-call.js';

export async function init() {
  const container = document.getElementById('view-profile');
  const api = window.electronAPI;

  container.innerHTML = `
    <h2 class="view-title">${strings.profile.title}</h2>
    <div class="card">
      <h2>${strings.profile.userProfile}</h2>
      <form id="profile-form">
        <div class="form-group">
          <label>${strings.profile.age}</label>
          <input type="number" name="age" min="10" max="120" required />
        </div>
        <div class="form-group">
          <label>${strings.profile.sex}</label>
          <select name="sex" required>
            <option value="">${strings.profile.select}</option>
            <option value="male">${strings.profile.male}</option>
            <option value="female">${strings.profile.female}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${strings.profile.height}</label>
          <input type="number" name="height_cm" min="100" max="250" step="0.1" required />
        </div>
        <div class="form-group">
          <label>${strings.profile.weight}</label>
          <input type="number" name="weight_kg" min="20" max="300" step="0.1" required />
        </div>
        <div class="form-group">
          <label>${strings.profile.activityBaseline}</label>
          <select name="activity_baseline" required>
            <option value="">${strings.profile.select}</option>
            <option value="sedentary">${strings.profile.sedentary}</option>
            <option value="light">${strings.profile.light}</option>
            <option value="moderate">${strings.profile.moderate}</option>
            <option value="active">${strings.profile.active}</option>
            <option value="very_active">${strings.profile.veryActive}</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">${strings.profile.saveProfile}</button>
      </form>
    </div>
    <div class="card">
      <h2>${strings.profile.dataManagement}</h2>
      <p style="margin-bottom:12px">${strings.profile.dataManagementDesc}</p>
      <button class="btn btn-secondary" id="btn-export" style="margin-right:8px">${strings.profile.exportData}</button>
      <button class="btn btn-secondary" id="btn-import">${strings.profile.importData}</button>
    </div>
    <div class="card" id="profile-display" style="display:none">
      <h2>${strings.profile.currentProfile}</h2>
      <div id="profile-info"></div>
    </div>
  `;

  // Unused metrics section
  const unusedMetrics = [
    { name: strings.profile.bloodPressureSystolic, icon: '💓', source: 'Blood Pressure', note: strings.profile.availableInHealthSync },
    { name: strings.profile.bloodPressureDiastolic, icon: '💓', source: 'Blood Pressure', note: strings.profile.availableInHealthSync },
    { name: strings.profile.bloodGlucose, icon: '🩸', source: 'Blood Glucose', note: strings.profile.availableInHealthSync },
    { name: strings.profile.oxygenSaturation, icon: '🫁', source: 'Oxygen Saturation', note: strings.profile.availableInHealthSync },
    { name: strings.profile.wristTemperature, icon: '🌡️', source: 'Wrist Temperature', note: strings.profile.availableInHealthSync },
    { name: strings.profile.respiratoryRate, icon: '🫁', source: 'Respiratory Rate', note: strings.profile.availableInHealthSync },
    { name: strings.profile.hrZoneTime, icon: '❤️', source: 'Heart Rate Zone', note: strings.profile.availableInHealthSync },
    { name: strings.profile.walkingDistance, icon: '🚶', source: 'Walking/Running Distance', note: strings.profile.partiallyAdded },
    { name: strings.profile.cyclingDistance, icon: '🚴', source: 'Cycling Distance', note: strings.profile.partiallyAdded },
  ];

  const metricsHtml = `
    <div class="card">
      <h2>📊 ${strings.profile.availableMetrics}</h2>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
        ${strings.profile.availableMetricsDesc}
      </p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px">
        ${unusedMetrics.map(m => `
          <div style="padding:8px;background:var(--bg-secondary);border-radius:6px;border:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
              <span>${m.icon}</span>
              <strong style="font-size:13px">${m.name}</strong>
            </div>
            <div style="font-size:11px;color:var(--text-secondary)">${m.note}</div>
          </div>
        `).join('')}
      </div>
    </div>`;

  const dataMgmtCard = container.querySelector('.card:last-of-type');
  dataMgmtCard.insertAdjacentHTML('afterend', metricsHtml);

  if (!api) return;

  const form = document.getElementById('profile-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.age = parseInt(data.age);
    data.height_cm = parseFloat(data.height_cm);
    data.weight_kg = parseFloat(data.weight_kg);
    await safeCall(api.saveProfile(data), null);
    loadProfile();
  });

  document.getElementById('btn-export').addEventListener('click', () => safeCall(api.exportData(), null));
  document.getElementById('btn-import').addEventListener('click', () => safeCall(api.importData(), null));

  async function loadProfile() {
    const profile = await safeCall(api.getProfile(), null);
    const display = document.getElementById('profile-display');
    const info = document.getElementById('profile-info');
    if (profile) {
      display.style.display = 'block';
      info.innerHTML = `
        <p>${strings.profile.age}: ${profile.age}</p>
        <p>${strings.profile.sex}: ${profile.sex === 'male' ? strings.profile.male : strings.profile.female}</p>
        <p>${strings.profile.height}: ${profile.height_cm} cm</p>
        <p>${strings.profile.weight}: ${profile.weight_kg} kg</p>
        <p>${strings.profile.activityBaseline}: ${profile.activity_baseline}</p>
      `;
    }
  }

  loadProfile();
}
