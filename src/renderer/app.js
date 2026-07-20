import { icon } from './utils/icons.js';
import { getAPI } from './utils/api-detector.js';
import { destroyAllCharts } from './charts/chart-manager.js';

function renderNavIcons() {
  document.querySelectorAll('.nav-icon').forEach(el => {
    const name = el.dataset.icon;
    const iconMap = {
      dashboard: 'layout-dashboard', activity: 'activity', diet: 'heart',
      energy: 'trending-up', measurements: 'scale', training: 'dumbbell',
      analytics: 'trending-up',       insights: 'sparkles', profile: 'heart', sleep: 'moon', goals: 'target',
    };
    const iconName = iconMap[name] || 'activity';
    el.innerHTML = icon(iconName, 18);
  });
}
renderNavIcons();

const views = {
  dashboard: () => import('./views/dashboard.js'),
  activity: () => import('./views/activity.js'),
  diet: () => import('./views/diet.js'),
  energy: () => import('./views/adaptive.js'),
  measurements: () => import('./views/measurements.js'),
  training: () => import('./views/training.js'),
  analytics: () => import('./views/analytics.js'),
  insights: () => import('./views/insights.js'),
  profile: () => import('./views/profile.js'),
  sleep: () => import('./views/sleep.js'),
  goals: () => import('./views/goals.js'),
};

let _navigateTimeout;
let _loadingView;

async function showView(viewName) {
  if (_loadingView === viewName) return;
  _loadingView = viewName;

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

  const loader = views[viewName];
  if (loader) {
    try {
      const module = await loader();
      module.init();
    } catch (e) {
      console.error(`Failed to load view: ${viewName}`, e);
      if (viewEl) {
        const { renderStateCard } = await import('./utils/state-card.js');
        renderStateCard(viewEl, { state: 'error', title: 'Error al cargar la vista' });
      }
    }
  }

  _loadingView = null;
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => showView(item.dataset.view));
});

let _dataChangedTimeout;

const api = getAPI();
api.onNavigate((view) => showView(view));
api.onDataChanged(() => {
  if (_dataChangedTimeout) clearTimeout(_dataChangedTimeout);
  _dataChangedTimeout = setTimeout(() => {
    const currentView = document.querySelector('.nav-item.active')?.dataset?.view || 'dashboard';
    showView(currentView);
  }, 300);
});
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

function initSidebarSections() {
  // Clear stale localStorage state from previous versions
  ['inicio', 'salud', 'entrenamiento'].forEach(k => localStorage.removeItem(`nav-section-${k}`));

  const sections = document.querySelectorAll('.nav-section:not([data-section="profile-divider"])');
  sections.forEach(section => {
    const sectionName = section.dataset.section;
    const children = document.querySelectorAll(`li[data-section="${sectionName}"]:not(.nav-section)`);

    function getActiveView() {
      return document.querySelector('.nav-item.active')?.dataset?.view;
    }

    function getSectionForView(view) {
      const parent = document.querySelector(`li[data-section] .nav-item[data-view="${view}"]`);
      if (parent) return parent.closest('li').dataset.section;
      return null;
    }

    function updateCollapsed() {
      const activeView = getActiveView();
      const activeSection = getSectionForView(activeView);
      const isActiveSection = sectionName === activeSection;

      if (isActiveSection) {
        section.classList.remove('collapsed');
        children.forEach(el => el.style.display = '');
      } else {
        const stored = localStorage.getItem(`nav-section-${sectionName}`);
        const isCollapsed = stored === 'collapsed';
        section.classList.toggle('collapsed', isCollapsed);
        children.forEach(el => el.style.display = isCollapsed ? 'none' : '');
      }
    }

    section.addEventListener('click', (e) => {
      e.stopPropagation();
      const activeView = getActiveView();
      const activeSection = getSectionForView(activeView);
      if (sectionName === activeSection) return;

      const isCollapsed = section.classList.toggle('collapsed');
      children.forEach(el => el.style.display = isCollapsed ? 'none' : '');
      localStorage.setItem(`nav-section-${sectionName}`, isCollapsed ? 'collapsed' : 'expanded');
    });

    updateCollapsed();

    const observer = new MutationObserver(() => updateCollapsed());
    document.querySelectorAll('.nav-item').forEach(item => {
      observer.observe(item, { attributes: true, attributeFilter: ['class'] });
    });
  });
}

initSidebarSections();

export { views };
