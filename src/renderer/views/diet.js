import { strings } from '../locales/es.js';
import { safeCall } from '../utils/safe-call.js';
import { skeletonCard, skeletonRow } from '../utils/skeleton.js';
import { renderStateCard } from '../utils/state-card.js';

export async function init() {
  if (window._loadingDiet) return;
  window._loadingDiet = true;
  try {
  const container = document.getElementById('view-diet');
  container.innerHTML = `
    <h2 class="view-title">${strings.diet.title}</h2>
    <div class="card">
      <h2>${strings.diet.mealTemplates}</h2>
      <div id="meal-templates" aria-live="polite"><div class="empty-state"><p>${strings.diet.noMealTemplates}</p><div class="sub">${strings.diet.noMealTemplatesSub}</div></div></div>
    </div>
    <div class="card">
      <h2>${strings.diet.dailyPlan}</h2>
      <div class="flex-gap-sm mb-3" style="flex-wrap:wrap;align-items:flex-end">
        <div class="form-group" style="margin-bottom:0">
          <label>${strings.diet.date}</label>
          <input type="date" id="plan-date" aria-label="${strings.diet.date}" />
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label>${strings.diet.category}</label>
          <div id="day-type-toggle" style="display:flex">
            <button type="button" class="btn day-type-btn active" data-day-type="training" style="background:var(--accent);color:var(--bg-secondary);border-radius:var(--radius-sm) 0 0 var(--radius-sm)">${strings.diet.dayTypeTraining}</button>
            <button type="button" class="btn day-type-btn" data-day-type="rest" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none">${strings.diet.dayTypeRest}</button>
          </div>
        </div>
        <button class="btn btn-primary" id="btn-generate-daily-plan" style="margin-bottom:0">${strings.diet.generateDailyPlan}</button>
        <button class="btn btn-secondary" id="btn-auto-create-plan" style="margin-bottom:0">${strings.diet.generateAutoPlan}</button>
      </div>
      <div id="daily-plan-meals" aria-live="polite"><div class="empty-state"><p>${strings.diet.selectDate}</p></div></div>
      <div id="daily-plan-totals" class="mt-3" style="display:none;padding:14px 16px;background:var(--bg-tertiary);border-radius:var(--radius)">
        <strong>${strings.diet.dailyAggregate}:</strong>
        <span id="plan-total-kcal" class="text-danger">0 ${strings.diet.kcal}</span> |
        <span id="plan-total-protein" class="text-accent">${strings.diet.proteinShort}: 0g</span> |
        <span id="plan-total-carbs">${strings.diet.carbsShort}: 0g</span> |
        <span id="plan-total-fat">${strings.diet.fatShort}: 0g</span>
        <span id="plan-compliance" style="margin-left:8px"></span>
      </div>
      <div id="plan-review-actions" class="mt-3" style="display:none">
        <button class="btn btn-primary" id="btn-save-plan">${strings.diet.savePlan}</button>
      </div>
    </div>
    <div class="card" id="dish-manager-card">
      <details>
        <summary style="cursor:pointer;font-size:18px;font-weight:600;list-style:none">${strings.diet.dishManager}</summary>
        <div style="margin-top:12px">
          <div id="dish-list" aria-live="polite"><div class="empty-state"><p>${strings.diet.noDishesCreated}</p></div></div>
          <div class="mt-3">
            <button class="btn btn-primary" id="btn-show-dish-form">${strings.diet.createDish}</button>
          </div>
          <div id="dish-form-container" style="display:none" class="mt-3"></div>
          <div id="dish-edit-container" style="display:none" class="mt-3"></div>
        </div>
      </details>
    </div>
    <div class="card">
      <details>
        <summary style="cursor:pointer;font-size:18px;font-weight:600;list-style:none">${strings.diet.foodItemManager}</summary>
        <div style="margin-top:12px">
          <form id="food-form" class="form-row mb-4">
            <div class="form-group form-row-full">
              <label>${strings.diet.foodName}</label>
              <input type="text" name="name" required aria-label="${strings.diet.foodName}" />
              <div id="food-search-results" class="text-xs text-muted mt-1"></div>
            </div>
            <div class="form-group">
              <label>${strings.diet.kcalPer100g}</label>
              <input type="number" name="kcal_per_100g" min="0" step="0.1" required aria-label="${strings.diet.kcalPer100g}" />
            </div>
            <div class="form-group">
              <label>${strings.diet.proteinPer100g}</label>
              <input type="number" name="protein_per_100g" min="0" step="0.1" required aria-label="${strings.diet.proteinPer100g}" />
            </div>
            <div class="form-group">
              <label>${strings.diet.carbsPer100g}</label>
              <input type="number" name="carbs_per_100g" min="0" step="0.1" required aria-label="${strings.diet.carbsPer100g}" />
            </div>
            <div class="form-group">
              <label>${strings.diet.fatPer100g}</label>
              <input type="number" name="fat_per_100g" min="0" step="0.1" required aria-label="${strings.diet.fatPer100g}" />
            </div>
            <div class="form-row-full">
              <button type="submit" class="btn btn-primary">${strings.diet.addFoodItem}</button>
            </div>
          </form>
          <h3>${strings.diet.learnNewFood}</h3>
          <p class="text-sm text-muted mb-3">${strings.diet.learnNewFoodDesc}</p>
          <div class="flex-gap-sm mb-3">
            <input type="text" id="learn-food-name" placeholder="${strings.diet.foodPlaceholder}" class="form-group" style="flex:1;margin-bottom:0" aria-label="${strings.diet.foodPlaceholder}" />
            <button class="btn btn-secondary" id="btn-suggest">${strings.diet.suggest}</button>
          </div>
          <div id="learn-suggestion" style="display:none">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
              <div class="form-group"><label>${strings.diet.estimatedKcal}</label><input type="number" id="suggest-kcal" step="0.1" aria-label="${strings.diet.estimatedKcal}" /></div>
              <div class="form-group"><label>${strings.diet.estimatedProtein}</label><input type="number" id="suggest-protein" step="0.1" aria-label="${strings.diet.estimatedProtein}" /></div>
              <div class="form-group"><label>${strings.diet.estimatedCarbs}</label><input type="number" id="suggest-carbs" step="0.1" aria-label="${strings.diet.estimatedCarbs}" /></div>
              <div class="form-group"><label>${strings.diet.estimatedFat}</label><input type="number" id="suggest-fat" step="0.1" aria-label="${strings.diet.estimatedFat}" /></div>
            </div>
            <button class="btn btn-primary" id="btn-confirm-learn">${strings.diet.confirmSave}</button>
          </div>
          <h3>${strings.diet.foodDatabase}</h3>
          <div class="flex-gap-sm mb-3" style="flex-wrap:wrap">
            <div id="food-category-pills" style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="filter-btn active" data-cat="">${strings.diet.categoryFilter}</button>
              <button class="filter-btn" data-cat="breads">${strings.diet.categories.breads}</button>
              <button class="filter-btn" data-cat="proteins">${strings.diet.categories.proteins}</button>
              <button class="filter-btn" data-cat="fats">${strings.diet.categories.fats}</button>
              <button class="filter-btn" data-cat="fruits">${strings.diet.categories.fruits}</button>
              <button class="filter-btn" data-cat="vegetables">${strings.diet.categories.vegetables}</button>
              <button class="filter-btn" data-cat="drinks">${strings.diet.categories.drinks}</button>
              <button class="filter-btn" data-cat="legumes">${strings.diet.categories.legumes}</button>
            </div>
            <input type="text" id="food-search" placeholder="${strings.diet.search}" style="flex:1;padding:6px 10px;min-width:150px" aria-label="${strings.diet.search}" />
          </div>
          <div id="food-list" aria-live="polite"><div class="empty-state"><p>${strings.diet.noFoodItems}</p></div></div>
          <div id="food-pagination" class="flex-gap-sm mt-2" style="display:none;justify-content:center">
            <button class="btn btn-secondary text-xs" id="food-prev" style="padding:4px 10px">${strings.diet.prevPage}</button>
            <span id="food-page-info" class="text-sm text-muted"></span>
            <button class="btn btn-secondary text-xs" id="food-next" style="padding:4px 10px">${strings.diet.nextPage}</button>
          </div>
        </div>
      </details>
    </div>
    <div class="card">
      <h2>${strings.diet.hiddenFoodManager}</h2>
      <div id="hidden-foods" aria-live="polite"><div class="empty-state"><p>${strings.diet.noHiddenFoods}</p></div></div>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) return;

  let _dayType = 'training';
  let _pendingPlan = null;
  let _gramDebounce = null;
  let _cachedTargetKcal = null;
  let _foodPage = 0;
  const PAGE_SIZE = 20;

  const CATEGORY_KEYWORDS = {
    breads: ['pan', 'arroz', 'pasta', 'avena', 'cereal', 'cuscús', 'couscous', 'quinoa', 'quínoa', 'patata', 'papa', 'boniato', 'ñoqui', 'gnocchi', 'torta', 'harina', 'corn flakes', 'crema de arroz'],
    proteins: ['pollo', 'pavo', 'jamón', 'jamon', 'lomo', 'pescado', 'salmón', 'salmon', 'merluza', 'calamar', 'sepia', 'carne', 'huevo', 'clara', 'proteína', 'proteina', 'atún', 'atun', 'tuna', 'tofu', 'tempeh', 'seitán', 'seitan', 'chicken', 'fish', 'turkey', 'beef', 'egg', 'whey'],
    fats: ['aceite', 'aguacate', 'avocado', 'fruto seco', 'frutos secos', 'frutos', 'cacahuete', 'crema de cacahuete', 'almendra', 'almendras', 'nuez', 'nueces', 'queso', 'mozzarella', 'oil', 'nut', 'peanut', 'cheese', 'chocolate'],
    fruits: ['manzana', 'plátano', 'platano', 'naranja', 'pera', 'uva', 'uvas', 'fresa', 'fresas', 'fruta', 'apple', 'banana', 'orange'],
    vegetables: ['brócoli', 'brocoli', 'espinaca', 'espinacas', 'lechuga', 'tomate', 'tomates', 'pepino', 'verdura', 'verduras', 'ensalada', 'vegetable', 'salad'],
    legumes: ['lenteja', 'lentejas', 'garbanzo', 'garbanzos', 'alubia', 'alubias', 'judía', 'judías', 'judias', 'poroto', 'frijol', 'legumbre', 'legumbres'],
    drinks: ['té', 'te', 'café', 'cafe', 'infusión', 'infusion', 'tea', 'coffee'],
  };

  const CATEGORY_STYLES = {
    breads: 'background:rgba(199,91,59,0.12);color:#C75B3B',
    proteins: 'background:rgba(78,93,63,0.12);color:#4E5D3F',
    fats: 'background:rgba(138,111,71,0.15);color:#8A6F47',
    fruits: 'background:rgba(199,91,59,0.10);color:#C75B3B',
    vegetables: 'background:rgba(78,93,63,0.10);color:#4E5D3F',
    drinks: 'background:rgba(107,68,35,0.12);color:#6B4423',
    legumes: 'background:rgba(122,107,79,0.15);color:#7A6B4F',
  };

  function getFoodCategory(name) {
    const lower = (name || '').toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(k => lower.includes(k))) return cat;
    }
    return null;
  }

  function gramRange(trainingGrams, restGrams) {
    const g1 = trainingGrams != null ? trainingGrams : 0;
    const g2 = restGrams != null ? restGrams : g1;
    if (g1 <= 0 && g2 <= 0) return '—';
    const lo = Math.min(g1, g2);
    const hi = Math.max(g1, g2);
    if (lo === hi) return `${lo}g`;
    return strings.diet.gramRange.replace('{min}', lo).replace('{max}', hi);
  }

  function isFixedRecipeColumn(name) {
    return /media\s*mañana|merienda/i.test(name || '');
  }

  document.getElementById('food-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.kcal_per_100g = parseFloat(data.kcal_per_100g);
    data.protein_per_100g = parseFloat(data.protein_per_100g);
    data.carbs_per_100g = parseFloat(data.carbs_per_100g);
    data.fat_per_100g = parseFloat(data.fat_per_100g);
    await safeCall(api.saveFoodItem(data), null);
    e.target.reset();
    document.getElementById('food-search-results').textContent = '';
    loadFoods();
    loadHiddenFoods();
  });

  document.querySelector('#food-form input[name="name"]').addEventListener('blur', async (e) => {
    const name = e.target.value.trim();
    const resultsEl = document.getElementById('food-search-results');
    if (!name || name.length < 2) { resultsEl.textContent = ''; return; }
    const matches = await safeCall(api.searchFoodItems(name), []);
    if (matches && matches.length > 0) {
      const best = matches[0];
      const form = e.target.closest('form');
      const kcalInput = form.querySelector('input[name="kcal_per_100g"]');
      const proteinInput = form.querySelector('input[name="protein_per_100g"]');
      const carbsInput = form.querySelector('input[name="carbs_per_100g"]');
      const fatInput = form.querySelector('input[name="fat_per_100g"]');
      if (!parseFloat(kcalInput.value)) kcalInput.value = best.kcal_per_100g;
      if (!parseFloat(proteinInput.value)) proteinInput.value = best.protein_per_100g;
      if (!parseFloat(carbsInput.value)) carbsInput.value = best.carbs_per_100g;
      if (!parseFloat(fatInput.value)) fatInput.value = best.fat_per_100g;
      resultsEl.innerHTML = `✓ ${strings.diet.suggest}: <strong>${best.name}</strong> (${best.kcal_per_100g} ${strings.diet.kcal})`;
    } else {
      resultsEl.textContent = strings.diet.noMatch + ' — ' + strings.diet.noMatchSub;
    }
  });

  const dishFormContainer = document.getElementById('dish-form-container');
  const dishEditContainer = document.getElementById('dish-edit-container');

  function showDishForm(editDish) {
    dishFormContainer.style.display = 'block';
    dishFormContainer.innerHTML = `
      <h3>${editDish ? strings.diet.editDish : strings.diet.createDish}</h3>
      <form id="dish-form" class="form-row">
        <div class="form-group form-row-full">
          <label>${strings.diet.name}</label>
          <input type="text" id="dish-name" value="${editDish ? editDish.name : ''}" required aria-label="${strings.diet.name}" />
        </div>
        <div class="form-group form-row-full">
          <label>${strings.diet.description}</label>
          <input type="text" id="dish-desc" value="${editDish ? (editDish.description || '') : ''}" aria-label="${strings.diet.description}" />
        </div>
        <div class="form-group">
          <label>${strings.diet.servings}</label>
          <input type="number" id="dish-servings" value="${editDish ? editDish.servings : 1}" min="1" step="0.5" aria-label="${strings.diet.servings}" />
        </div>
        <div class="form-row-full flex-gap-sm">
          <button type="submit" class="btn btn-primary">${editDish ? strings.general.save : strings.diet.confirmSave}</button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-dish">${strings.general.cancel}</button>
        </div>
      </form>
      <div id="dish-ingredients-section" class="mt-3">
        <h4>${strings.diet.ingredients}</h4>
        <div id="dish-ingredients-list"></div>
        <div class="flex-gap-sm mt-2">
          <select id="ingredient-food-select" style="flex:1;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" aria-label="${strings.diet.ingredients}"></select>
          <input type="number" id="ingredient-grams" placeholder="${strings.diet.grams}" style="width:80px;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" aria-label="${strings.diet.grams}" />
          <button class="btn btn-secondary" id="btn-add-ingredient">${strings.diet.add}</button>
        </div>
      </div>
    `;

    const cancelBtn = document.getElementById('btn-cancel-dish');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        dishFormContainer.style.display = 'none';
        dishEditContainer.style.display = 'none';
      });
    }

    const foodSelect = document.getElementById('ingredient-food-select');
    safeCall(api.getFoodItems(false), []).then(foods => {
      foodSelect.innerHTML = foods.map(f => `<option value="${f.id}" data-kcal="${f.kcal_per_100g}" data-protein="${f.protein_per_100g}" data-carbs="${f.carbs_per_100g}" data-fat="${f.fat_per_100g}">${f.name}</option>`).join('');
    });

    const ingredients = [];
    if (editDish && editDish.ingredients && editDish.ingredients.length > 0) {
      for (const ing of editDish.ingredients) {
        ingredients.push({
          food_item_id: ing.food_item_id,
          food_name: ing.food_name,
          grams: ing.grams,
          kcal_per_100g: ing.kcal_per_100g,
          protein_per_100g: ing.protein_per_100g,
          carbs_per_100g: ing.carbs_per_100g,
          fat_per_100g: ing.fat_per_100g,
        });
      }
      renderIngredients();
    }

    document.getElementById('btn-add-ingredient').addEventListener('click', () => {
      const select = document.getElementById('ingredient-food-select');
      const grams = parseFloat(document.getElementById('ingredient-grams').value);
      if (!select.value || !grams) return;
      const option = select.options[select.selectedIndex];
      ingredients.push({
        food_item_id: parseInt(select.value),
        food_name: option.text,
        grams,
        kcal_per_100g: parseFloat(option.dataset.kcal),
        protein_per_100g: parseFloat(option.dataset.protein),
        carbs_per_100g: parseFloat(option.dataset.carbs),
        fat_per_100g: parseFloat(option.dataset.fat),
      });
      document.getElementById('ingredient-grams').value = '';
      renderIngredients();
    });

    function renderIngredients() {
      const el = document.getElementById('dish-ingredients-list');
      let totalKcal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
      let html = `<table><thead><tr><th>${strings.diet.food}</th><th>${strings.diet.grams}</th><th>${strings.diet.kcal}</th><th>${strings.diet.proteinShort}</th><th>${strings.diet.carbsShort}</th><th>${strings.diet.fatShort}</th><th></th></tr></thead><tbody>`;
      ingredients.forEach((ing, i) => {
        const factor = ing.grams / 100;
        const kcal = ing.kcal_per_100g * factor;
        const protein = ing.protein_per_100g * factor;
        const carbs = ing.carbs_per_100g * factor;
        const fat = ing.fat_per_100g * factor;
        totalKcal += kcal; totalProtein += protein; totalCarbs += carbs; totalFat += fat;
        html += `<tr><td>${ing.food_name}</td><td>${ing.grams}g</td><td>${kcal.toFixed(0)}</td><td>${protein.toFixed(1)}g</td><td>${carbs.toFixed(1)}g</td><td>${fat.toFixed(1)}g</td><td><button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-remove-ingredient="${i}">✕</button></td></tr>`;
      });
      html += `</tbody><tfoot><tr style="font-weight:bold"><td>${strings.diet.total}</td><td></td><td>${totalKcal.toFixed(0)}</td><td>${totalProtein.toFixed(1)}g</td><td>${totalCarbs.toFixed(1)}g</td><td>${totalFat.toFixed(1)}g</td><td></td></tr></tfoot></table>`;
      el.innerHTML = html;

      el.querySelectorAll('[data-remove-ingredient]').forEach(btn => {
        btn.addEventListener('click', () => {
          ingredients.splice(parseInt(btn.dataset.removeIngredient), 1);
          renderIngredients();
        });
      });
    }

    document.getElementById('dish-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('dish-name').value.trim();
      if (!name) return;
      const servings = parseFloat(document.getElementById('dish-servings').value) || 1;
      let totalKcal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
      for (const ing of ingredients) {
        const factor = ing.grams / 100;
        totalKcal += ing.kcal_per_100g * factor;
        totalProtein += ing.protein_per_100g * factor;
        totalCarbs += ing.carbs_per_100g * factor;
        totalFat += ing.fat_per_100g * factor;
      }
      const dishId = await safeCall(api.saveDish({
        id: editDish ? editDish.id : undefined,
        name,
        description: document.getElementById('dish-desc').value,
        total_kcal: totalKcal,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fat: totalFat,
        servings,
      }), null);
      for (const ing of ingredients) {
        await safeCall(api.saveDishIngredient({ dish_id: dishId, food_item_id: ing.food_item_id, grams: ing.grams }), null);
      }
      dishFormContainer.style.display = 'none';
      loadDishes();
    });
  }

  document.getElementById('btn-show-dish-form').addEventListener('click', () => {
    showDishForm(null);
  });

  async function loadDishes() {
    const el = document.getElementById('dish-list');
    el.innerHTML = skeletonCard();
    let dishes;
    try {
      dishes = await api.getDishes();
    } catch (e) {
      console.error('IPC error:', e);
      renderStateCard(el, { title: strings.diet.dishManager, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadDishes });
      return;
    }
    if (!dishes || dishes.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.diet.noDishesCreated}</p></div>`;
      return;
    }
    let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">';
    for (const d of dishes) {
      const ingredients = await safeCall(api.getDishIngredients(d.id), []);
      const ingList = ingredients.map(i => `${i.food_name} (${i.grams}g)`).join(', ');
      html += `
        <div class="dish-card" style="border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--bg-secondary)">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <strong>${d.name}</strong>
            <div style="display:flex;gap:4px">
              <button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-edit-dish="${d.id}">${strings.diet.editDish}</button>
              <button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-delete-dish="${d.id}">✕</button>
            </div>
          </div>
          ${d.description ? `<div class="text-xs text-muted" style="margin:4px 0">${d.description}</div>` : ''}
          <div style="font-size:13px;margin-top:6px">
            <span class="data-value">${(d.total_kcal || 0).toFixed(0)} ${strings.diet.kcal}</span> |
            <span style="color:var(--success)">${strings.diet.proteinShort}: ${(d.total_protein || 0).toFixed(1)}g</span> |
            <span>${strings.diet.carbsShort}: ${(d.total_carbs || 0).toFixed(1)}g</span> |
            <span>${strings.diet.fatShort}: ${(d.total_fat || 0).toFixed(1)}g</span>
          </div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${d.servings} ${strings.diet.dishServings}</div>
          <details class="text-xs" style="margin-top:6px">
            <summary style="cursor:pointer;color:var(--text-secondary)">${strings.diet.ingredients}</summary>
            <p style="margin-top:4px;color:var(--text-secondary)">${ingList || strings.general.noData}</p>
          </details>
        </div>
      `;
    }
    html += '</div>';
    el.innerHTML = html;

    el.querySelectorAll('[data-delete-dish]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await safeCall(api.deleteDish(parseInt(btn.dataset.deleteDish)), null);
        loadDishes();
      });
    });

    el.querySelectorAll('[data-edit-dish]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const dishId = parseInt(btn.dataset.editDish);
        const dish = dishes.find(d => d.id === dishId);
        if (dish) {
          const ingredients = await safeCall(api.getDishIngredients(dishId), []);
          showDishForm({ ...dish, ingredients });
        }
      });
    });
  }

  loadDishes();

  async function loadMealTemplates() {
    const el = document.getElementById('meal-templates');
    el.innerHTML = skeletonRow(3);
    let templates;
    try {
      templates = await api.getMealTemplates();
    } catch (e) {
      console.error('IPC error:', e);
      renderStateCard(el, { title: strings.diet.mealTemplates, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadMealTemplates });
      return;
    }
    if (!templates || templates.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.diet.noMealTemplates}</p><div class="sub">${strings.diet.noMealTemplatesSub}</div></div>`;
      return;
    }

    const date = document.getElementById('plan-date').value;

    let html = `<div class="meal-columns" style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;overflow-x:auto">`;
    for (const tmpl of templates) {
      html += `<div class="meal-column" style="border:1px solid var(--border);border-radius:8px;padding:10px;background:var(--bg-secondary);min-width:180px">
        <h3 style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--accent)">${tmpl.name}</h3>`;

      if (isFixedRecipeColumn(tmpl.name)) {
        const recipeText = /media\s*mañana/i.test(tmpl.name)
          ? strings.diet.fixedRecipeMidMorning
          : strings.diet.fixedRecipeSnack;
        html += `<div class="fixed-recipe" style="padding:8px;border-radius:6px;background:var(--bg-primary);font-size:12px;color:var(--text-secondary);line-height:1.4">${recipeText}</div>`;
      } else {
        for (const comp of tmpl.components || []) {
          const rangeText = gramRange(comp.default_grams, comp.restday_grams);
          html += `<div class="text-xs" style="margin-bottom:6px;padding:6px;border-radius:4px;background:var(--bg-primary)">
            <div style="font-weight:500;margin-bottom:2px">${comp.food_name}</div>
            <div style="color:var(--text-secondary);font-size:11px">
              ${comp.kcal_per_100g} ${strings.diet.kcal}/100g · ${strings.diet.gramMin}/${strings.diet.gramMax}: ${rangeText}
            </div>
            <div style="margin-top:4px">`;

          const optionsByCategory = {};
          for (const opt of comp.options || []) {
            const cat = getFoodCategory(opt.food_name) || 'extras';
            if (!optionsByCategory[cat]) optionsByCategory[cat] = [];
            optionsByCategory[cat].push(opt);
          }

          const sortedCats = Object.keys(optionsByCategory).sort((a, b) => {
            const order = ['breads', 'proteins', 'fats', 'legumes', 'vegetables', 'fruits', 'drinks', 'extras'];
            return order.indexOf(a) - order.indexOf(b);
          });

          for (const cat of sortedCats) {
            const opts = optionsByCategory[cat];
            const catLabel = strings.diet.categories[cat] || strings.diet.categories.extras;
            const catStyle = CATEGORY_STYLES[cat] || 'background:var(--bg-tertiary);color:var(--text-secondary)';
            html += `<div style="margin-bottom:4px">
              <span style="display:inline-block;padding:1px 6px;border-radius:10px;font-size:9px;font-weight:600;margin-bottom:2px;${catStyle}">${catLabel}</span>
              <div style="display:flex;gap:4px;flex-wrap:wrap">`;
            for (const opt of opts) {
              const optGrams = _dayType === 'rest' ? (comp.restday_grams || comp.default_grams) : comp.default_grams;
              html += `<button class="btn btn-secondary food-option-btn" style="padding:2px 6px;font-size:10px" data-comp-id="${comp.id}" data-food-id="${opt.food_item_id}" data-kcal="${opt.kcal_per_100g}" data-protein="${opt.protein_per_100g}" data-carbs="${opt.carbs_per_100g}" data-fat="${opt.fat_per_100g}" data-name="${opt.food_name}" data-grams="${optGrams}">${opt.food_name}</button>`;
            }
            html += `</div></div>`;
          }

          html += `</div></div>`;
        }
      }

      html += `<div class="meal-column-total" style="font-size:12px;font-weight:600;text-align:center;margin-top:8px;padding:6px;background:var(--bg-tertiary);border-radius:4px">
        <span id="col-total-${tmpl.id}">0 ${strings.diet.kcal}</span>
      </div>`;
      html += `</div>`;
    }
    html += `</div>
      <div class="mt-3" style="text-align:center">
        <button class="btn btn-primary" id="btn-use-5meals">${strings.diet.use5meals}</button>
      </div>`;

    el.innerHTML = html;

    const selections = {};

    el.querySelectorAll('.food-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const compId = btn.dataset.compId;
        btn.closest('.meal-column').querySelectorAll(`.food-option-btn[data-comp-id="${compId}"]`).forEach(b => {
          b.style.borderColor = 'var(--border)';
          b.style.background = 'var(--bg-primary)';
        });
        btn.style.borderColor = 'var(--accent)';
        btn.style.background = 'rgba(13,148,136,0.15)';
        selections[compId] = {
          food_item_id: parseInt(btn.dataset.foodId),
          food_name: btn.dataset.name,
          grams: parseFloat(btn.dataset.grams) || 0,
          kcal_per_100g: parseFloat(btn.dataset.kcal),
          protein_per_100g: parseFloat(btn.dataset.protein),
          carbs_per_100g: parseFloat(btn.dataset.carbs),
          fat_per_100g: parseFloat(btn.dataset.fat),
        };
        updateColumnTotals();
      });
    });

    function updateColumnTotals() {
      const totals = {};
      for (const tmpl of templates) {
        let kcal = 0;
        if (isFixedRecipeColumn(tmpl.name)) {
          kcal = 0;
        } else {
          for (const comp of tmpl.components || []) {
            const sel = selections[comp.id];
            if (sel) {
              kcal += (sel.grams / 100) * sel.kcal_per_100g;
            } else {
              const baseGrams = _dayType === 'rest' ? (comp.restday_grams || comp.default_grams) : comp.default_grams;
              kcal += (baseGrams / 100) * comp.kcal_per_100g;
            }
          }
        }
        totals[tmpl.id] = Math.round(kcal);
        const el2 = document.getElementById(`col-total-${tmpl.id}`);
        if (el2) el2.textContent = `${Math.round(kcal)} ${strings.diet.kcal}`;
      }
      return totals;
    }

    updateColumnTotals();

    document.getElementById('btn-use-5meals').addEventListener('click', async () => {
      if (!date) return;
      const totals = updateColumnTotals();
      await safeCall(api.deleteDailyPlanEntries(date), null);
      for (const tmpl of templates) {
        if (isFixedRecipeColumn(tmpl.name)) continue;
        for (const comp of tmpl.components || []) {
          const sel = selections[comp.id];
          const foodId = sel ? sel.food_item_id : comp.food_item_id;
          const grams = sel ? sel.grams : (_dayType === 'rest' ? (comp.restday_grams || comp.default_grams) : comp.default_grams);
          await safeCall(api.saveDailyPlanEntry({
            date,
            meal_component_id: comp.id,
            food_item_id: foodId,
            grams,
          }), null);
        }
      }
      if (document.getElementById('plan-date').value) {
        loadDailyPlan(document.getElementById('plan-date').value);
      }
    });
  }

  loadMealTemplates();

  document.querySelectorAll('.day-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.day-type-btn').forEach(b => {
        b.classList.toggle('active', b === btn);
        if (b === btn) {
          b.style.background = 'var(--accent)';
          b.style.color = 'var(--bg-secondary)';
        } else {
          b.style.background = '';
          b.style.color = '';
        }
      });
      _dayType = btn.dataset.dayType;
      loadMealTemplates();
    });
  });

  document.getElementById('plan-date').addEventListener('change', async (e) => {
    _pendingPlan = null;
    document.getElementById('plan-review-actions').style.display = 'none';
    loadDailyPlan(e.target.value);
  });

  document.getElementById('plan-date').valueAsDate = new Date();

  document.querySelectorAll('#food-category-pills .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#food-category-pills .filter-btn').forEach(b => b.classList.toggle('active', b === btn));
      _foodPage = 0;
      loadFoods();
    });
  });

  document.getElementById('food-search').addEventListener('input', () => {
    _foodPage = 0;
    loadFoods();
  });

  document.getElementById('btn-generate-daily-plan').addEventListener('click', async () => {
    const date = document.getElementById('plan-date').value;
    if (!date) return;
    const balance = await safeCall(api.getEnergyBalance(date), null);
    const targetPaceSetting = await safeCall(api.getSetting ? api.getSetting('target_pace') : undefined, null);
    const targetPace = parseFloat(targetPaceSetting) || 0.5;
    const targetKcal = balance ? balance.tdee - (targetPace * 7700 / 7) : null;
    if (!targetKcal || targetKcal <= 0) {
      alert(strings.diet.setTargetFirst);
      return;
    }

    const templates = await safeCall(api.getMealTemplates(), []);
    if (!templates || templates.length === 0) return;

    let totalSeedKcal = 0;
    const mealKcal = {};
    for (const tmpl of templates) {
      let kcal = 0;
      if (!isFixedRecipeColumn(tmpl.name)) {
        for (const comp of tmpl.components || []) {
          const baseGrams = _dayType === 'rest' ? (comp.restday_grams || comp.default_grams) : comp.default_grams;
          kcal += (baseGrams / 100) * comp.kcal_per_100g;
        }
      }
      mealKcal[tmpl.id] = kcal;
      totalSeedKcal += kcal;
    }

    _pendingPlan = [];
    let pendingIndex = 0;
    for (const tmpl of templates) {
      if (isFixedRecipeColumn(tmpl.name)) continue;
      const ratio = totalSeedKcal > 0 ? mealKcal[tmpl.id] / totalSeedKcal : 1 / templates.length;
      const mealTarget = Math.round(targetKcal * ratio);

      for (const comp of tmpl.components || []) {
        const baseGrams = _dayType === 'rest' ? (comp.restday_grams || comp.default_grams) : comp.default_grams;
        const optionGrams = comp.options && comp.options.length > 0 ? comp.options[0] : null;
        const foodId = optionGrams ? optionGrams.food_item_id : comp.food_item_id;
        const foodKcal = optionGrams ? optionGrams.kcal_per_100g : comp.kcal_per_100g;
        const foodProtein = optionGrams ? optionGrams.protein_per_100g : comp.protein_per_100g;
        const foodCarbs = optionGrams ? optionGrams.carbs_per_100g : comp.carbs_per_100g;
        const foodFat = optionGrams ? optionGrams.fat_per_100g : comp.fat_per_100g;
        const foodName = optionGrams ? optionGrams.food_name : comp.food_name;
        const compRatio = mealKcal[tmpl.id] > 0 ? (baseGrams * comp.kcal_per_100g / 100) / mealKcal[tmpl.id] : 1 / (tmpl.components?.length || 1);
        const compTargetKcal = Math.round(mealTarget * compRatio);
        const grams = foodKcal > 0 ? Math.round((compTargetKcal / foodKcal) * 100) : 0;

        _pendingPlan.push({
          _pendingIndex: pendingIndex,
          date,
          meal_component_id: comp.id,
          meal_template_id: tmpl.id,
          meal_template_name: tmpl.name,
          sort_order: comp.sort_order || 0,
          food_item_id: foodId,
          food_name: foodName,
          grams: Math.max(grams, 10),
          kcal_per_100g: foodKcal,
          protein_per_100g: foodProtein,
          carbs_per_100g: foodCarbs,
          fat_per_100g: foodFat,
        });
        pendingIndex++;
      }
    }

    await loadDailyPlan(date, _pendingPlan);
    document.getElementById('plan-review-actions').style.display = 'block';
  });

  document.getElementById('btn-save-plan').addEventListener('click', async () => {
    const date = document.getElementById('plan-date').value;
    if (!date || !_pendingPlan) return;
    document.querySelectorAll('.gram-input[data-pending-index]').forEach(input => {
      const idx = parseInt(input.dataset.pendingIndex);
      if (_pendingPlan[idx]) _pendingPlan[idx].grams = parseFloat(input.value) || 0;
    });
    await safeCall(api.deleteDailyPlanEntries(date), null);
    for (const entry of _pendingPlan) {
      await safeCall(api.saveDailyPlanEntry({
        date: entry.date,
        meal_component_id: entry.meal_component_id,
        food_item_id: entry.food_item_id,
        grams: entry.grams,
      }), null);
    }
    _pendingPlan = null;
    document.getElementById('plan-review-actions').style.display = 'none';
    alert(strings.diet.planGenerated);
    loadDailyPlan(date);
  });

  document.getElementById('btn-auto-create-plan').addEventListener('click', async () => {
    const date = document.getElementById('plan-date').value;
    if (!date) return;
    const balance = await safeCall(api.getEnergyBalance(date), null);
    const targetPaceSetting = await safeCall(api.getSetting ? api.getSetting('target_pace') : undefined, null);
    const targetPace = parseFloat(targetPaceSetting) || 0.5;
    const targetKcal = balance ? balance.tdee - (targetPace * 7700 / 7) : null;
    if (!targetKcal || targetKcal <= 0) {
      alert(strings.diet.setTargetFirst);
      return;
    }

    const templates = await safeCall(api.getMealTemplates(), []);
    if (!templates || templates.length === 0) return;

    let totalSeedKcal = 0;
    const mealKcal = {};
    for (const tmpl of templates) {
      let kcal = 0;
      if (!isFixedRecipeColumn(tmpl.name)) {
        for (const comp of tmpl.components || []) {
          const baseGrams = _dayType === 'rest' ? (comp.restday_grams || comp.default_grams) : comp.default_grams;
          kcal += (baseGrams / 100) * comp.kcal_per_100g;
        }
      }
      mealKcal[tmpl.id] = kcal;
      totalSeedKcal += kcal;
    }

    await safeCall(api.deleteDailyPlanEntries(date), null);
    for (const tmpl of templates) {
      if (isFixedRecipeColumn(tmpl.name)) continue;
      const ratio = totalSeedKcal > 0 ? mealKcal[tmpl.id] / totalSeedKcal : 1 / templates.length;
      const mealTarget = Math.round(targetKcal * ratio);

      for (const comp of tmpl.components || []) {
        const baseGrams = _dayType === 'rest' ? (comp.restday_grams || comp.default_grams) : comp.default_grams;
        const optionGrams = comp.options && comp.options.length > 0 ? comp.options[0] : null;
        const foodId = optionGrams ? optionGrams.food_item_id : comp.food_item_id;
        const foodKcal = optionGrams ? optionGrams.kcal_per_100g : comp.kcal_per_100g;
        const compRatio = mealKcal[tmpl.id] > 0 ? (baseGrams * comp.kcal_per_100g / 100) / mealKcal[tmpl.id] : 1 / (tmpl.components?.length || 1);
        const compTargetKcal = Math.round(mealTarget * compRatio);
        const grams = foodKcal > 0 ? Math.round((compTargetKcal / foodKcal) * 100) : 0;

        await safeCall(api.saveDailyPlanEntry({
          date,
          meal_component_id: comp.id,
          food_item_id: foodId,
          grams: Math.max(grams, 10),
        }), null);
      }
    }

    loadDailyPlan(date);
    alert(strings.diet.planGenerated);
  });

  async function loadDailyPlan(date, pendingEntries) {
    const isPending = !!pendingEntries;
    const mealsContainer = document.getElementById('daily-plan-meals');
    const totalsContainer = document.getElementById('daily-plan-totals');
    mealsContainer.innerHTML = skeletonRow(5);
    totalsContainer.style.display = 'none';
    if (!isPending) {
      document.getElementById('plan-review-actions').style.display = 'none';
    }
    let plan, templates;
    try {
      plan = pendingEntries || await api.getDailyPlan(date);
      templates = await api.getMealTemplates();
    } catch (e) {
      console.error('IPC error:', e);
      renderStateCard(mealsContainer, { title: strings.diet.dailyPlan, state: 'error', subtitle: strings.states.errorLoading, onRetry: () => loadDailyPlan(date) });
      return;
    }

    const entriesByMeal = {};
    (plan || []).forEach((entry, i) => {
      let mealId, sortOrder;
      if (isPending) {
        mealId = entry.meal_template_id;
        sortOrder = entry.sort_order || 0;
      } else {
        const comp = templates ? templates.flatMap(t => t.components || []).find(c => c.id === entry.meal_component_id) : null;
        mealId = comp ? comp.meal_template_id : 'unknown';
        sortOrder = comp?.sort_order || 0;
      }
      if (!entriesByMeal[mealId]) entriesByMeal[mealId] = [];
      entriesByMeal[mealId].push({ ...entry, _sortOrder: sortOrder, _pendingIndex: isPending ? entry._pendingIndex : null });
    });

    for (const mealId in entriesByMeal) {
      entriesByMeal[mealId].sort((a, b) => (a._sortOrder || 0) - (b._sortOrder || 0));
    }

    let totalKcal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    let hasEntries = false;

    let html = '';
    for (const tmpl of templates || []) {
      const entries = entriesByMeal[tmpl.id] || [];
      hasEntries = hasEntries || entries.length > 0;

      html += `
        <div class="meal-card" style="border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;background:var(--bg-secondary)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="font-size:14px">${tmpl.name}</strong>
            ${entries.length > 0 ? `<span id="meal-total-${tmpl.id}" class="text-xs text-muted"></span>` : ''}
          </div>
          ${entries.length === 0 ? `<div class="text-xs text-muted mb-2">${strings.diet.noFoodAssigned}</div>` : ''}
          <div id="meal-entries-${tmpl.id}">
            ${entries.map((entry) => {
              const factor = entry.grams / 100;
              const kcal = entry.kcal_per_100g * factor;
              const protein = entry.protein_per_100g * factor;
              const carbs = entry.carbs_per_100g * factor;
              const fat = entry.fat_per_100g * factor;
              totalKcal += kcal; totalProtein += protein; totalCarbs += carbs; totalFat += fat;
              const inputDataAttr = isPending
                ? `data-pending-index="${entry._pendingIndex}"`
                : `data-entry-id="${entry.id}"`;
              return `
                <div class="meal-entry" style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                  <span style="flex:1;font-size:13px">${entry.food_name}</span>
                  <input type="number" value="${entry.grams}" step="5" min="0" ${inputDataAttr} data-meal-id="${tmpl.id}" data-kcal="${entry.kcal_per_100g}" data-protein="${entry.protein_per_100g}" data-carbs="${entry.carbs_per_100g}" data-fat="${entry.fat_per_100g}" class="gram-input meal-gram-input text-xs" style="width:60px;padding:2px 6px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" aria-label="${strings.diet.grams} de ${entry.food_name}" />
                  <span class="data-value text-xs" style="width:50px;text-align:right">${kcal.toFixed(0)}</span>
                  <span style="font-size:11px;color:var(--text-secondary);width:80px;text-align:right">${strings.diet.proteinShort}:${protein.toFixed(1)} ${strings.diet.carbsShort}:${carbs.toFixed(1)} ${strings.diet.fatShort}:${fat.toFixed(1)}</span>
                  ${!isPending ? `<button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-hide-food-id="${entry.food_item_id}">${strings.diet.hide}</button>` : ''}
                </div>
              `;
            }).join('')}
          </div>
          ${!isPending ? `
          <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
            <select class="swap-food-select text-xs" data-meal-template-id="${tmpl.id}" style="padding:3px 6px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);max-width:150px" aria-label="${strings.diet.changeFood}">
              <option value="">${strings.diet.changeFood}</option>
            </select>
            <select class="dish-option-select text-xs" data-meal-template-id="${tmpl.id}" style="padding:3px 6px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);max-width:150px" aria-label="${strings.diet.addDish}">
              <option value="">${strings.diet.addDish}</option>
            </select>
          </div>` : ''}
        </div>`;
    }

    if (!hasEntries && !isPending) {
      html = `<div class="empty-state"><p>${strings.diet.noPlanForDate}</p></div>`;
    }

    mealsContainer.innerHTML = html;

    if (hasEntries || isPending) {
      totalsContainer.style.display = 'block';
      document.getElementById('plan-total-kcal').textContent = `${totalKcal.toFixed(0)} ${strings.diet.kcal}`;
      document.getElementById('plan-total-protein').textContent = `${strings.diet.proteinShort}: ${totalProtein.toFixed(1)}g`;
      document.getElementById('plan-total-carbs').textContent = `${strings.diet.carbsShort}: ${totalCarbs.toFixed(1)}g`;
      document.getElementById('plan-total-fat').textContent = `${strings.diet.fatShort}: ${totalFat.toFixed(1)}g`;

      for (const tmpl of templates || []) {
        const entries = entriesByMeal[tmpl.id] || [];
        if (entries.length > 0) {
          let mKcal = 0, mProt = 0, mCarb = 0, mFat = 0;
          for (const entry of entries) {
            const factor = entry.grams / 100;
            mKcal += entry.kcal_per_100g * factor;
            mProt += entry.protein_per_100g * factor;
            mCarb += entry.carbs_per_100g * factor;
            mFat += entry.fat_per_100g * factor;
          }
          const el = document.getElementById(`meal-total-${tmpl.id}`);
          if (el) el.textContent = `${mKcal.toFixed(0)} ${strings.diet.kcal} | ${strings.diet.proteinShort}:${mProt.toFixed(1)} ${strings.diet.carbsShort}:${mCarb.toFixed(1)} ${strings.diet.fatShort}:${mFat.toFixed(1)}`;
        }
      }

      if (!isPending) {
        const balance = await safeCall(api.getEnergyBalance(date), null);
        if (balance && balance.tdee) {
          const targetPaceSetting = await safeCall(api.getSetting ? api.getSetting('target_pace') : undefined, null);
          const targetPace = parseFloat(targetPaceSetting) || 0.5;
          _cachedTargetKcal = balance.tdee - (targetPace * 7700 / 7);
        } else {
          _cachedTargetKcal = null;
        }
        updateCompliance(totalKcal);
      } else {
        _cachedTargetKcal = null;
        document.getElementById('plan-compliance').innerHTML = '';
      }
    } else {
      totalsContainer.style.display = 'none';
    }

    mealsContainer.querySelectorAll('.gram-input').forEach(input => {
      input.addEventListener('input', () => {
        recalcTotals();
        if (_gramDebounce) clearTimeout(_gramDebounce);
        _gramDebounce = setTimeout(() => {
          if (input.dataset.pendingIndex != null) {
            const idx = parseInt(input.dataset.pendingIndex);
            if (_pendingPlan && _pendingPlan[idx]) {
              _pendingPlan[idx].grams = parseFloat(input.value) || 0;
            }
          } else {
            const entryId = parseInt(input.dataset.entryId);
            if (entryId) {
              safeCall(api.updateDailyPlanEntry(entryId, parseFloat(input.value) || 0), null);
            }
          }
        }, 500);
      });
      input.addEventListener('blur', () => {
        let val = parseFloat(input.value) || 0;
        const min = parseFloat(input.min) || 0;
        val = Math.max(min, val);
        input.value = val;
        recalcTotals();
      });
    });

    if (!isPending) {
      mealsContainer.querySelectorAll('[data-hide-food-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await safeCall(api.hideFoodItem(parseInt(btn.dataset.hideFoodId)), null);
          loadFoods();
          loadHiddenFoods();
        });
      });

      const allFoods = await safeCall(api.getFoodItems(false), []);
      mealsContainer.querySelectorAll('.swap-food-select').forEach(select => {
        const mealId = parseInt(select.dataset.mealTemplateId);
        const mealEntries = entriesByMeal[mealId] || [];
        if (mealEntries.length > 0) {
          select.dataset.mealComponentId = mealEntries[0].meal_component_id;
          allFoods.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id;
            opt.textContent = f.name;
            select.appendChild(opt);
          });
          select.addEventListener('change', async () => {
            if (!select.value) return;
            const foodId = parseInt(select.value);
            const food = allFoods.find(f => f.id === foodId);
            if (!food) return;
            await safeCall(api.deleteDailyPlanEntries(date), null);
            for (const entry of mealEntries) {
              await safeCall(api.saveDailyPlanEntry({
                date,
                meal_component_id: entry.meal_component_id,
                food_item_id: foodId,
                grams: entry.grams,
              }), null);
            }
            select.value = '';
            loadDailyPlan(date);
          });
        }
      });

      const allDishes = await safeCall(api.getDishes(), []);
      mealsContainer.querySelectorAll('.dish-option-select').forEach(select => {
        const mealId = parseInt(select.dataset.mealTemplateId);
        if (allDishes && allDishes.length > 0) {
          allDishes.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = `${d.name} (${(d.total_kcal || 0).toFixed(0)} ${strings.diet.kcal})`;
            select.appendChild(opt);
          });
          select.addEventListener('change', async () => {
            if (!select.value) return;
            const dishId = parseInt(select.value);
            await safeCall(api.linkDishToMeal({ meal_template_id: mealId, dish_id: dishId, sort_order: 0 }), null);
            const dishIngredients = await safeCall(api.getDishIngredients(dishId), []);
            for (const ing of dishIngredients) {
              await safeCall(api.saveDailyPlanEntry({
                date,
                meal_component_id: null,
                food_item_id: ing.food_item_id,
                grams: ing.grams,
              }), null);
            }
            select.value = '';
            loadDailyPlan(date);
          });
        }
      });
    }
  }

  function updateCompliance(totalKcal) {
    const complianceEl = document.getElementById('plan-compliance');
    if (!complianceEl) return;
    if (!_cachedTargetKcal || _cachedTargetKcal <= 0) {
      complianceEl.innerHTML = '';
      return;
    }
    const ratio = totalKcal / _cachedTargetKcal;
    if (Math.abs(ratio - 1) <= 0.1) {
      complianceEl.innerHTML = `<span class="compliance-ok">✓ ${strings.diet.complianceOk}</span>`;
    } else {
      complianceEl.innerHTML = `<span class="compliance-warn">⚠ ${strings.diet.complianceWarn}</span>`;
    }
  }

  function recalcTotals() {
    let totalKcal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    const mealTotals = {};
    document.querySelectorAll('.gram-input').forEach(input => {
      const grams = parseFloat(input.value) || 0;
      const kcalPer100 = parseFloat(input.dataset.kcal) || 0;
      const proteinPer100 = parseFloat(input.dataset.protein) || 0;
      const carbsPer100 = parseFloat(input.dataset.carbs) || 0;
      const fatPer100 = parseFloat(input.dataset.fat) || 0;
      const factor = grams / 100;
      const kcal = kcalPer100 * factor;
      const protein = proteinPer100 * factor;
      const carbs = carbsPer100 * factor;
      const fat = fatPer100 * factor;
      totalKcal += kcal;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFat += fat;
      const mealId = input.dataset.mealId;
      if (mealId) {
        if (!mealTotals[mealId]) mealTotals[mealId] = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
        mealTotals[mealId].kcal += kcal;
        mealTotals[mealId].protein += protein;
        mealTotals[mealId].carbs += carbs;
        mealTotals[mealId].fat += fat;
      }
    });
    document.getElementById('plan-total-kcal').textContent = `${totalKcal.toFixed(0)} ${strings.diet.kcal}`;
    document.getElementById('plan-total-protein').textContent = `${strings.diet.proteinShort}: ${totalProtein.toFixed(1)}g`;
    document.getElementById('plan-total-carbs').textContent = `${strings.diet.carbsShort}: ${totalCarbs.toFixed(1)}g`;
    document.getElementById('plan-total-fat').textContent = `${strings.diet.fatShort}: ${totalFat.toFixed(1)}g`;
    for (const [mealId, mt] of Object.entries(mealTotals)) {
      const el = document.getElementById(`meal-total-${mealId}`);
      if (el) {
        el.textContent = `${mt.kcal.toFixed(0)} ${strings.diet.kcal} | ${strings.diet.proteinShort}:${mt.protein.toFixed(1)} ${strings.diet.carbsShort}:${mt.carbs.toFixed(1)} ${strings.diet.fatShort}:${mt.fat.toFixed(1)}`;
      }
    }
    updateCompliance(totalKcal);
  }

  async function loadFoods() {
    const list = document.getElementById('food-list');
    list.innerHTML = skeletonRow(10);
    let foods;
    try {
      foods = await api.getFoodItems(false);
    } catch (e) {
      console.error('IPC error:', e);
      renderStateCard(list, { title: strings.diet.foodDatabase, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadFoods });
      return;
    }
    const activeCat = document.querySelector('#food-category-pills .filter-btn.active');
    const category = activeCat ? activeCat.dataset.cat : '';
    const search = document.getElementById('food-search').value.toLowerCase();
    const paginationEl = document.getElementById('food-pagination');

    if (!foods || foods.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>${strings.diet.noFoodItems}</p></div>`;
      paginationEl.style.display = 'none';
      return;
    }

    let filtered = foods;
    if (category) {
      filtered = filtered.filter(f => getFoodCategory(f.name) === category);
    }
    if (search) {
      filtered = filtered.filter(f => f.name.toLowerCase().includes(search));
    }
    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>${strings.diet.noFoodItems}</p></div>`;
      paginationEl.style.display = 'none';
      return;
    }

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const page = Math.min(_foodPage, totalPages - 1);
    const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    let html = `<table style="width:100%"><thead><tr><th>${strings.diet.name}</th><th>${strings.diet.kcal}</th><th>${strings.diet.proteinShort}</th><th>${strings.diet.carbsShort}</th><th>${strings.diet.fatShort}</th><th></th></tr></thead><tbody>`;
    for (const f of pageItems) {
      html += `<tr>
        <td style="font-weight:500">${f.name}</td>
        <td>${f.kcal_per_100g}</td>
        <td style="color:var(--success)">${f.protein_per_100g}g</td>
        <td>${f.carbs_per_100g}g</td>
        <td>${f.fat_per_100g}g</td>
        <td><button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-hide-food-id="${f.id}">${strings.diet.hide}</button></td>
      </tr>`;
    }
    html += '</tbody></table>';
    list.innerHTML = html;

    if (totalPages > 1) {
      paginationEl.style.display = 'flex';
      document.getElementById('food-page-info').textContent = `${strings.diet.page} ${page + 1} ${strings.diet.of} ${totalPages}`;
      const prevBtn = document.getElementById('food-prev');
      const nextBtn = document.getElementById('food-next');
      prevBtn.disabled = page <= 0;
      prevBtn.style.opacity = page <= 0 ? '0.5' : '1';
      nextBtn.disabled = page >= totalPages - 1;
      nextBtn.style.opacity = page >= totalPages - 1 ? '0.5' : '1';
      prevBtn.onclick = () => { _foodPage = Math.max(0, _foodPage - 1); loadFoods(); };
      nextBtn.onclick = () => { _foodPage = Math.min(totalPages - 1, _foodPage + 1); loadFoods(); };
    } else {
      paginationEl.style.display = 'none';
    }

    list.querySelectorAll('[data-hide-food-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await safeCall(api.hideFoodItem(parseInt(btn.dataset.hideFoodId)), null);
        loadFoods();
        loadHiddenFoods();
      });
    });
  }

  async function loadHiddenFoods() {
    const el = document.getElementById('hidden-foods');
    el.innerHTML = skeletonRow(3);
    let foods;
    try {
      foods = await api.getFoodItems(true);
    } catch (e) {
      console.error('IPC error:', e);
      renderStateCard(el, { title: strings.diet.hiddenFoodManager, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadHiddenFoods });
      return;
    }
    const hidden = foods.filter(f => f.is_hidden);
    if (hidden.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.diet.noHiddenFoods}</p></div>`;
      return;
    }
    let html = `<table><thead><tr><th>${strings.diet.name}</th><th>${strings.diet.kcal}</th><th>${strings.diet.protein}</th><th>${strings.diet.carbs}</th><th>${strings.diet.fat}</th><th></th></tr></thead><tbody>`;
    for (const f of hidden) {
      html += `<tr>
        <td>${f.name}</td>
        <td>${f.kcal_per_100g}</td>
        <td>${f.protein_per_100g}g</td>
        <td>${f.carbs_per_100g}g</td>
        <td>${f.fat_per_100g}g</td>
        <td><button class="btn btn-primary text-xs" style="padding:4px 8px" data-show-food-id="${f.id}">${strings.diet.reactivate}</button></td>
      </tr>`;
    }
    html += '</tbody></table>';
    el.innerHTML = html;

    el.querySelectorAll('[data-show-food-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await safeCall(api.unhideFoodItem(parseInt(btn.dataset.showFoodId)), null);
        loadFoods();
        loadHiddenFoods();
      });
    });
  }

  await Promise.allSettled([
    loadFoods(),
    loadHiddenFoods(),
    document.getElementById('plan-date').value ? loadDailyPlan(document.getElementById('plan-date').value) : Promise.resolve(),
  ]);
  } finally {
    window._loadingDiet = false;
  }
}
