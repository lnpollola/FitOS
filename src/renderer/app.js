import { init as initDashboard } from './views/dashboard.js';
import { init as initActivity } from './views/activity.js';
import { init as initDiet } from './views/diet.js';
import { init as initAdaptive } from './views/adaptive.js';
import { init as initMeasurements } from './views/measurements.js';
import { init as initTraining } from './views/training.js';
import { init as initProfile } from './views/profile.js';
import { init as initAnalytics } from './views/analytics.js';
import { icon } from './utils/icons.js';

function renderNavIcons() {
  document.querySelectorAll('.nav-icon').forEach(el => {
    const name = el.dataset.icon;
    const iconMap = {
      dashboard: 'activity', activity: 'activity', diet: 'heart',
      energy: 'trending-up', measurements: 'scale', training: 'dumbbell',
      analytics: 'trending-up', profile: 'heart',
    };
    const iconName = iconMap[name] || 'activity';
    el.innerHTML = icon(iconName, 18);
  });
}
renderNavIcons();

const views = {
  dashboard: initDashboard,
  activity: initActivity,
  diet: initDiet,
  energy: initAdaptive,
  measurements: initMeasurements,
  training: initTraining,
  analytics: initAnalytics,
  profile: initProfile,
};

function destroyAllCharts() {
  const chartKeys = Object.keys(window).filter(k => k.startsWith('_') && k.endsWith('Chart'));
  chartKeys.forEach(k => {
    if (window[k]) { window[k].destroy(); window[k] = null; }
  });
}

let _navigateTimeout;

function showView(viewName) {
  if (_navigateTimeout) clearTimeout(_navigateTimeout);

  destroyAllCharts();
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
  document.querySelectorAll('.nav-item').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(v => v.removeAttribute('aria-current'));

  const viewEl = document.getElementById(`view-${viewName}`);
  if (viewEl) viewEl.classList.add('active-view');

  const navEl = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if (navEl) {
    navEl.classList.add('active');
    navEl.setAttribute('aria-current', 'page');
  }

  if (views[viewName]) views[viewName]();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => showView(item.dataset.view));
});

let _dataChangedTimeout;

if (window.electronAPI) {
  window.electronAPI.onNavigate((view) => showView(view));
  window.electronAPI.onDataChanged(() => {
    if (_dataChangedTimeout) clearTimeout(_dataChangedTimeout);
    _dataChangedTimeout = setTimeout(() => {
      showView(document.querySelector('.nav-item.active')?.dataset?.view || 'dashboard');
    }, 300);
  });
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (window.innerWidth < 900) {
    sidebar.classList.add('sidebar-collapsed');
  } else {
    sidebar.classList.remove('sidebar-collapsed');
  }
}

window.addEventListener('resize', toggleSidebar);
toggleSidebar();

showView('dashboard');
