import Chart from 'chart.js/auto';

export function init() {
  const container = document.getElementById('view-activity');
  container.innerHTML = `
    <h2 style="margin-bottom:20px">Activity</h2>
    <div class="card">
      <h2>Import Apple Watch CSV</h2>
      <p style="margin-bottom:12px">Select a CSV file exported from Apple Watch to import your activity data.</p>
      <button class="btn btn-primary" id="btn-import-csv">Import CSV</button>
    </div>
    <div class="card">
      <h2>Manual Entry</h2>
      <form id="activity-form" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label>Date</label>
          <input type="date" name="date" required />
        </div>
        <div class="form-group">
          <label>Steps</label>
          <input type="number" name="steps" min="0" />
        </div>
        <div class="form-group">
          <label>Active Calories</label>
          <input type="number" name="active_calories" min="0" step="1" />
        </div>
        <div class="form-group">
          <label>Resting Calories</label>
          <input type="number" name="resting_calories" min="0" step="1" />
        </div>
        <div class="form-group">
          <label>Avg Heart Rate</label>
          <input type="number" name="heart_rate_avg" min="30" max="250" />
        </div>
        <div class="form-group">
          <label>Sleep (hours)</label>
          <input type="number" name="sleep_hours" min="0" max="24" step="0.1" />
        </div>
        <div style="grid-column:span 2">
          <button type="submit" class="btn btn-primary">Save Activity</button>
        </div>
      </form>
    </div>
    <div class="card">
      <h2>Sport Activity</h2>
      <form id="sport-form" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label>Date</label>
          <input type="date" name="date" required />
        </div>
        <div class="form-group">
          <label>Sport Type</label>
          <select name="sport_type" required>
            <option value="">Select...</option>
            <option value="cycling">Cycling</option>
            <option value="boxing">Boxing</option>
            <option value="HIIT">HIIT</option>
            <option value="walking">Walking</option>
            <option value="football">Football</option>
            <option value="paddle">Paddle</option>
          </select>
        </div>
        <div class="form-group">
          <label>Calories</label>
          <input type="number" name="calories" min="0" step="1" />
        </div>
        <div class="form-group">
          <label>Duration (min)</label>
          <input type="number" name="duration_minutes" min="0" step="1" />
        </div>
        <div style="grid-column:span 2">
          <button type="submit" class="btn btn-primary">Save Sport Activity</button>
        </div>
      </form>
    </div>
    <div class="card">
      <h2>Activity Timeline</h2>
      <div id="activity-timeline"><div class="empty-state"><p>No activities logged yet</p><div class="sub">Import a CSV or add manually</div></div></div>
    </div>
    <div class="card" id="weekly-chart-container">
      <h2>Weekly Sport Summary</h2>
      <canvas id="weekly-chart" height="250"></canvas>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) return;

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
      timeline.innerHTML = `<div class="empty-state"><p>No activities logged yet</p><div class="sub">Import a CSV or add manually</div></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Date</th><th>Steps</th><th>Active kcal</th><th>Resting kcal</th><th>HR avg</th><th>Sleep</th></tr></thead><tbody>';
    for (const d of days) {
      const sports = await api.getSportActivities(d.date);
      const sportStr = sports?.length ? sports.map(s => `${s.sport_type} (${s.calories || 0} kcal)`).join(', ') : '';
      html += `<tr><td>${d.date}</td><td>${d.steps ?? '--'}</td><td>${d.active_calories ?? '--'}</td><td>${d.resting_calories ?? '--'}</td><td>${d.heart_rate_avg ?? '--'}</td><td>${d.sleep_hours ?? '--'}</td></tr>`;
      if (sportStr) {
        html += `<tr style="font-size:12px;color:var(--text-secondary)"><td colspan="6">Sport: ${sportStr}</td></tr>`;
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
          label: 'Calories',
          data: summary.map(s => s.total_calories),
          backgroundColor: '#e94560',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#a0a0b0' }, grid: { color: '#2a2a4e' } },
          x: { ticks: { color: '#a0a0b0' } },
        },
      },
    });
  }

  loadTimeline();
  loadChart();
}
