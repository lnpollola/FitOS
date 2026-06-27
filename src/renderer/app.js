import { init as initDashboard } from './views/dashboard.js';
import { init as initActivity } from './views/activity.js';
import { init as initDiet } from './views/diet.js';
import { init as initAdaptive } from './views/adaptive.js';
import { init as initMeasurements } from './views/measurements.js';
import { init as initTraining } from './views/training.js';
import { init as initProfile } from './views/profile.js';
import { init as initAnalytics } from './views/analytics.js';
import { init as initInsights } from './views/insights.js';
import { init as initSleep } from './views/sleep.js';
import { init as initGoals } from './views/goals.js';
import { icon } from './utils/icons.js';
import { cacheStore } from './utils/cache-store.js';

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
  dashboard: initDashboard,
  activity: initActivity,
  diet: initDiet,
  energy: initAdaptive,
  measurements: initMeasurements,
  training: initTraining,
  analytics: initAnalytics,
  insights: initInsights,
  profile: initProfile,
  sleep: initSleep,
  goals: initGoals,
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
  window.electronAPI.onDomainChanged((domain) => {
    cacheStore.invalidate(domain);
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
