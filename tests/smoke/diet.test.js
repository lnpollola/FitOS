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
});
