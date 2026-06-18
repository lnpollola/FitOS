export function init() {
  const container = document.getElementById('view-profile');
  const api = window.electronAPI;

  container.innerHTML = `
    <h2 style="margin-bottom:20px">Profile &amp; Settings</h2>
    <div class="card">
      <h2>User Profile</h2>
      <form id="profile-form">
        <div class="form-group">
          <label>Age</label>
          <input type="number" name="age" min="10" max="120" required />
        </div>
        <div class="form-group">
          <label>Sex</label>
          <select name="sex" required>
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div class="form-group">
          <label>Height (cm)</label>
          <input type="number" name="height_cm" min="100" max="250" step="0.1" required />
        </div>
        <div class="form-group">
          <label>Weight (kg)</label>
          <input type="number" name="weight_kg" min="20" max="300" step="0.1" required />
        </div>
        <div class="form-group">
          <label>Activity Baseline</label>
          <select name="activity_baseline" required>
            <option value="">Select...</option>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very Active</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Save Profile</button>
      </form>
    </div>
    <div class="card">
      <h2>Data Management</h2>
      <p style="margin-bottom:12px">Export all data as JSON for backup, or import from a previous backup.</p>
      <button class="btn btn-secondary" id="btn-export" style="margin-right:8px">Export Data</button>
      <button class="btn btn-secondary" id="btn-import">Import Data</button>
    </div>
    <div class="card" id="profile-display" style="display:none">
      <h2>Current Profile</h2>
      <div id="profile-info"></div>
    </div>
  `;

  if (!api) return;

  const form = document.getElementById('profile-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.age = parseInt(data.age);
    data.height_cm = parseFloat(data.height_cm);
    data.weight_kg = parseFloat(data.weight_kg);
    await api.saveProfile(data);
    loadProfile();
  });

  document.getElementById('btn-export').addEventListener('click', () => api.exportData());
  document.getElementById('btn-import').addEventListener('click', () => api.importData());

  async function loadProfile() {
    const profile = await api.getProfile();
    const display = document.getElementById('profile-display');
    const info = document.getElementById('profile-info');
    if (profile) {
      display.style.display = 'block';
      info.innerHTML = `
        <p>Age: ${profile.age}</p>
        <p>Sex: ${profile.sex}</p>
        <p>Height: ${profile.height_cm} cm</p>
        <p>Weight: ${profile.weight_kg} kg</p>
        <p>Activity: ${profile.activity_baseline}</p>
      `;
    }
  }

  loadProfile();
}
