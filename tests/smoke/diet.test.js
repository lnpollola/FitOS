import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockApi = {
  getFoodItems: () => Promise.resolve([]),
  getMealTemplates: () => Promise.resolve([]),
  getDailyPlan: () => Promise.resolve([]),
  getDishes: () => Promise.resolve([]),
  getDishIngredients: () => Promise.resolve([]),
  getEnergyBalance: () => Promise.resolve(null),
  saveFoodItem: () => Promise.resolve(true),
  saveDish: () => Promise.resolve(true),
  saveDishIngredient: () => Promise.resolve(true),
  deleteDish: () => Promise.resolve(true),
  saveDailyPlanEntry: () => Promise.resolve(true),
  deleteDailyPlanEntries: () => Promise.resolve(true),
  updateDailyPlanEntry: () => Promise.resolve(true),
  hideFoodItem: () => Promise.resolve(true),
  unhideFoodItem: () => Promise.resolve(true),
  linkDishToMeal: () => Promise.resolve(true),
  searchFoodItems: () => Promise.resolve([]),
};

describe('Diet view smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="view-diet"></div><ul class="nav-list"><li data-view="diet"></li></ul>';
    window.electronAPI = mockApi;
    window._loadingDiet = false;
  });

  afterEach(() => {
    delete window.electronAPI;
    delete window._loadingDiet;
    document.body.innerHTML = '';
  });

  it('init does not throw', async () => {
    const { init } = await import('../../src/renderer/views/diet.js');
    await expect(init()).resolves.not.toThrow();
  });

  it('renders daily plan with date input and day type toggle', async () => {
    const { init } = await import('../../src/renderer/views/diet.js');
    await init();
    expect(document.getElementById('plan-date')).toBeTruthy();
    expect(document.getElementById('day-type-toggle')).toBeTruthy();
    expect(document.getElementById('btn-generate-daily-plan')).toBeTruthy();
    expect(document.getElementById('daily-plan-totals')).toBeTruthy();
  });

  it('renders collapsible dish manager', async () => {
    const { init } = await import('../../src/renderer/views/diet.js');
    await init();
    const html = document.getElementById('view-diet').innerHTML;
    expect(html).toContain('Gestor de Platos');
    expect(html).toContain('details');
  });

  it('renders meal templates section', async () => {
    const { init } = await import('../../src/renderer/views/diet.js');
    await init();
    expect(document.getElementById('meal-templates')).toBeTruthy();
  });
});
