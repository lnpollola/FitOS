export function init() {
  const container = document.getElementById('view-dashboard');
  const api = window.electronAPI;

  container.innerHTML = `<h2 style="margin-bottom:20px">Dashboard</h2><div class="dashboard-grid" id="dashboard-grid"></div>`;

  async function render() {
    const grid = document.getElementById('dashboard-grid');
    if (!api) {
      grid.innerHTML = `<div class="dashboard-card"><h3>Status</h3><div class="value">Offline</div><div class="subtitle">Running outside Electron</div></div>`;
      return;
    }

    const data = await api.getDashboardData();
    const cards = [
      { title: 'Today\'s Calories', value: data?.todayCalories != null ? `${data.todayCalories} kcal` : '--', subtitle: 'Planned intake' },
      { title: 'Week Balance', value: data?.weekBalance != null ? `${data.weekBalance > 0 ? '+' : ''}${data.weekBalance} kcal` : '--', subtitle: 'This week' },
      { title: 'Latest Weight', value: data?.latestWeight != null ? `${data.latestWeight} kg` : '--', subtitle: 'Most recent entry' },
      { title: 'Measurement Delta', value: data?.measurementDelta != null ? `${data.measurementDelta > 0 ? '+' : ''}${data.measurementDelta} cm` : '--', subtitle: 'Since last measurement' },
      { title: 'Next Workout', value: data?.nextWorkout || '--', subtitle: 'Planned training' },
    ];

    grid.innerHTML = cards.map(c => `
      <div class="dashboard-card">
        <h3>${c.title}</h3>
        <div class="value">${c.value}</div>
        <div class="subtitle">${c.subtitle}</div>
      </div>
    `).join('');
  }

  render();
}
