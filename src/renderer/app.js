import { init as initDashboard } from './views/dashboard.js';
import { init as initActivity } from './views/activity.js';
import { init as initDiet } from './views/diet.js';
import { init as initAdaptive } from './views/adaptive.js';
import { init as initMeasurements } from './views/measurements.js';
import { init as initTraining } from './views/training.js';
import { init as initProfile } from './views/profile.js';

const views = {
  dashboard: initDashboard,
  activity: initActivity,
  diet: initDiet,
  energy: initAdaptive,
  measurements: initMeasurements,
  training: initTraining,
  profile: initProfile,
};

function showView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
  document.querySelectorAll('.nav-list li').forEach(v => v.classList.remove('active'));

  const viewEl = document.getElementById(`view-${viewName}`);
  if (viewEl) viewEl.classList.add('active-view');

  const navEl = document.querySelector(`.nav-list li[data-view="${viewName}"]`);
  if (navEl) navEl.classList.add('active');

  if (views[viewName]) views[viewName]();
}

document.querySelectorAll('.nav-list li').forEach(item => {
  item.addEventListener('click', () => showView(item.dataset.view));
});

if (window.electronAPI) {
  window.electronAPI.onNavigate((view) => showView(view));
  window.electronAPI.onDataChanged(() => showView(document.querySelector('.nav-list li.active')?.dataset?.view || 'dashboard'));
}

showView('dashboard');
