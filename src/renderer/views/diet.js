import { strings } from '../locales/es.js';
import { safeCall } from '../utils/safe-call.js';

export async function init() {
  if (window._loadingDiet) return;
  window._loadingDiet = true;
  const container = document.getElementById('view-diet');
  container.innerHTML = `
    <h2 class="view-title">${strings.diet.title}</h2>
    <div class="card">
      <h2>${strings.diet.mealTemplates}</h2>
      <div id="meal-templates"><div class="empty-state"><p>${strings.diet.noMealTemplates}</p><div class="sub">${strings.diet.noMealTemplatesSub}</div></div></div>
    </div>
    <div class="card" id="dish-manager-card">
      <h2>${strings.diet.dishManager}</h2>
      <div id="dish-list"><div class="empty-state"><p>Aún no hay platos creados</p></div></div>
      <div style="margin-top:12px">
        <button class="btn btn-primary" id="btn-show-dish-form">${strings.diet.createDish}</button>
      </div>
      <div id="dish-form-container" style="display:none;margin-top:12px"></div>
      <div id="dish-edit-container" style="display:none;margin-top:12px"></div>
    </div>
    <div class="card">
      <h2>${strings.diet.foodItemManager}</h2>
      <form id="food-form" class="form-row" style="margin-bottom:16px">
         <div class="form-group form-row-full">
          <label>${strings.diet.foodName}</label>
          <input type="text" name="name" required />
          <div id="food-search-results" style="font-size:12px;color:var(--text-secondary);margin-top:4px"></div>
        </div>
        <div class="form-group">
          <label>${strings.diet.kcalPer100g}</label>
          <input type="number" name="kcal_per_100g" min="0" step="0.1" required />
        </div>
        <div class="form-group">
          <label>${strings.diet.proteinPer100g}</label>
          <input type="number" name="protein_per_100g" min="0" step="0.1" required />
        </div>
        <div class="form-group">
          <label>${strings.diet.carbsPer100g}</label>
          <input type="number" name="carbs_per_100g" min="0" step="0.1" required />
        </div>
        <div class="form-group">
          <label>${strings.diet.fatPer100g}</label>
          <input type="number" name="fat_per_100g" min="0" step="0.1" required />
        </div>
        <div class="form-row-full">
          <button type="submit" class="btn btn-primary">${strings.diet.addFoodItem}</button>
        </div>
      </form>
      <h3>${strings.diet.learnNewFood}</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">${strings.diet.learnNewFoodDesc}</p>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input type="text" id="learn-food-name" placeholder="${strings.diet.foodPlaceholder}" class="form-group" style="flex:1;margin-bottom:0" />
        <button class="btn btn-secondary" id="btn-suggest">${strings.diet.suggest}</button>
      </div>
      <div id="learn-suggestion" style="display:none">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div class="form-group"><label>${strings.diet.estimatedKcal}</label><input type="number" id="suggest-kcal" step="0.1" /></div>
          <div class="form-group"><label>${strings.diet.estimatedProtein}</label><input type="number" id="suggest-protein" step="0.1" /></div>
          <div class="form-group"><label>${strings.diet.estimatedCarbs}</label><input type="number" id="suggest-carbs" step="0.1" /></div>
          <div class="form-group"><label>${strings.diet.estimatedFat}</label><input type="number" id="suggest-fat" step="0.1" /></div>
        </div>
        <button class="btn btn-primary" id="btn-confirm-learn">${strings.diet.confirmSave}</button>
      </div>
      <h3>${strings.diet.foodDatabase}</h3>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <div id="food-category-pills" style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="filter-btn active" data-cat="">${strings.diet.categoryFilter || 'Todas'}</button>
          <button class="filter-btn" data-cat="breads">${strings.diet.categories?.breads || 'Pan'}</button>
          <button class="filter-btn" data-cat="proteins">${strings.diet.categories.proteins}</button>
          <button class="filter-btn" data-cat="fats">${strings.diet.categories?.fats || 'Gras'}</button>
          <button class="filter-btn" data-cat="fruits">${strings.diet.categories?.fruits || 'Frut'}</button>
          <button class="filter-btn" data-cat="vegetables">${strings.diet.categories?.vegetables || 'Verdu'}</button>
          <button class="filter-btn" data-cat="drinks">${strings.diet.categories?.drinks || 'Bebi'}</button>
        </div>
        <input type="text" id="food-search" placeholder="${strings.diet.search || 'Buscar...'}" style="flex:1;padding:6px 10px;min-width:150px" />
      </div>
      <div id="food-list"><div class="empty-state"><p>${strings.diet.noFoodItems}</p></div></div>
      <div id="food-pagination" style="display:none;margin-top:8px;display:flex;align-items:center;gap:12px;justify-content:center">
        <button class="btn btn-secondary" id="food-prev" style="padding:4px 10px;font-size:12px">${strings.diet.prevPage}</button>
        <span id="food-page-info" style="font-size:13px;color:var(--text-secondary)"></span>
        <button class="btn btn-secondary" id="food-next" style="padding:4px 10px;font-size:12px">${strings.diet.nextPage}</button>
      </div>
    </div>
    <div class="card">
      <h2>${strings.diet.hiddenFoodManager}</h2>
      <div id="hidden-foods"><div class="empty-state"><p>${strings.diet.noHiddenFoods}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.diet.dailyPlan}</h2>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
        <div class="form-group" style="margin-bottom:0">
          <label>Fecha</label>
          <input type="date" id="plan-date" />
        </div>
        <button class="btn btn-secondary" id="btn-auto-create-plan" style="margin-top:16px">${strings.diet.generateAutoPlan}</button>
      </div>
      <div id="daily-plan-meals"><div class="empty-state"><p>${strings.diet.selectDate}</p></div></div>
      <div id="daily-plan-totals" style="display:none;margin-top:12px;padding:14px 16px;background:var(--bg-tertiary);border-radius:var(--radius)">
        <strong>${strings.diet.total}:</strong>
        <span id="plan-total-kcal" style="color:var(--danger)">0 kcal</span> |
        <span id="plan-total-protein" style="color:var(--accent)">P: 0g</span> |
        <span id="plan-total-carbs">C: 0g</span> |
        <span id="plan-total-fat">G: 0g</span>
      </div>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) return;

  const CATEGORY_KEYWORDS = {
    breads: ['pan', 'arroz', 'pasta', 'avena', 'cuscús', 'quinoa', 'patata', 'boniato', 'ñoqui', 'torta', 'harina', 'crumb', 'cereal', 'corn flakes', 'crema de arroz', 'legumbre'],
    proteins: ['pollo', 'pavo', 'jamón', 'lomo', 'pescado', 'salmón', 'merluza', 'calamar', 'sepia', 'carne', 'huevo', 'clara', 'proteína', 'atún', 'tuna', 'chicken', 'fish', 'turkey', 'beef', 'egg'],
    fats: ['aceite', 'aguacate', 'fruto seco', 'cacahuete', 'almendra', 'queso', 'mozzarella', 'oil', 'avocado', 'nut', 'peanut', 'cheese', 'chocolate'],
    fruits: ['manzana', 'plátano', 'naranja', 'fruta', 'apple', 'banana', 'orange'],
    vegetables: ['verdura', 'ensalada', 'brocoli', 'espinaca', 'vegetable', 'salad'],
    drinks: ['leche', 'bebida', 'yogur', 'te', 'café', 'milk', 'yogurt', 'tea', 'coffee'],
  };

  function getFoodCategory(name) {
    const lower = name.toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(k => lower.includes(k))) return cat;
    }
    return null;
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

  // Auto-fill from db:searchFoodItems
  document.querySelector('#food-form input[name="name"]').addEventListener('blur', async (e) => {
    const name = e.target.value.trim();
    const resultsEl = document.getElementById('food-search-results');
    if (!name || name.length < 2) { resultsEl.textContent = ''; return; }
    const matches = await api.searchFoodItems(name).catch(() => []);
    if (matches && matches.length > 0) {
      const best = matches[0];
      const form = e.target.closest('form');
      form.querySelector('input[name="kcal_per_100g"]').value = best.kcal_per_100g;
      form.querySelector('input[name="protein_per_100g"]').value = best.protein_per_100g;
      form.querySelector('input[name="carbs_per_100g"]').value = best.carbs_per_100g;
      form.querySelector('input[name="fat_per_100g"]').value = best.fat_per_100g;
      resultsEl.innerHTML = `✓ ${strings.diet.suggest}: <strong>${best.name}</strong> (${best.kcal_per_100g} kcal)`;
    } else {
      resultsEl.textContent = strings.diet.noMatch + ' — ' + strings.diet.noMatchSub;
    }
  });

  // Dish manager
  const dishFormContainer = document.getElementById('dish-form-container');
  const dishEditContainer = document.getElementById('dish-edit-container');

  function showDishForm(editDish) {
    dishFormContainer.style.display = 'block';
    dishFormContainer.innerHTML = `
      <h3>${editDish ? strings.diet.editDish : strings.diet.createDish}</h3>
      <form id="dish-form" class="form-row">
         <div class="form-group form-row-full">
          <label>${strings.diet.name}</label>
          <input type="text" id="dish-name" value="${editDish ? editDish.name : ''}" required />
        </div>
         <div class="form-group form-row-full">
          <label>${strings.diet.description}</label>
          <input type="text" id="dish-desc" value="${editDish ? (editDish.description || '') : ''}" />
        </div>
        <div class="form-group">
          <label>${strings.diet.servings}</label>
          <input type="number" id="dish-servings" value="${editDish ? editDish.servings : 1}" min="1" step="0.5" />
        </div>
        <div class="form-row-full" style="display:flex;gap:8px">
          <button type="submit" class="btn btn-primary">${editDish ? strings.general.save : strings.diet.confirmSave}</button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-dish">${strings.general.cancel}</button>
        </div>
      </form>
      <div id="dish-ingredients-section" style="margin-top:12px">
        <h4>${strings.diet.ingredients}</h4>
        <div id="dish-ingredients-list"></div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <select id="ingredient-food-select" style="flex:1;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)"></select>
          <input type="number" id="ingredient-grams" placeholder="Gramos" style="width:80px;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)" />
          <button class="btn btn-secondary" id="btn-add-ingredient">Añadir</button>
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
      let html = '<table><thead><tr><th>Alimento</th><th>Gramos</th><th>kcal</th><th>Prot</th><th>Carb</th><th>Grasa</th><th></th></tr></thead><tbody>';
      ingredients.forEach((ing, i) => {
        const factor = ing.grams / 100;
        const kcal = ing.kcal_per_100g * factor;
        const protein = ing.protein_per_100g * factor;
        const carbs = ing.carbs_per_100g * factor;
        const fat = ing.fat_per_100g * factor;
        totalKcal += kcal; totalProtein += protein; totalCarbs += carbs; totalFat += fat;
        html += `<tr><td>${ing.food_name}</td><td>${ing.grams}g</td><td>${kcal.toFixed(0)}</td><td>${protein.toFixed(1)}g</td><td>${carbs.toFixed(1)}g</td><td>${fat.toFixed(1)}g</td><td><button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-remove-ingredient="${i}">✕</button></td></tr>`;
      });
      html += `</tbody><tfoot><tr style="font-weight:bold"><td>Total</td><td></td><td>${totalKcal.toFixed(0)}</td><td>${totalProtein.toFixed(1)}g</td><td>${totalCarbs.toFixed(1)}g</td><td>${totalFat.toFixed(1)}g</td><td></td></tr></tfoot></table>`;
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
    const dishes = await safeCall(api.getDishes(), []);
    const el = document.getElementById('dish-list');
    if (!dishes || dishes.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>Aún no hay platos creados</p></div>`;
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
            <button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-delete-dish="${d.id}">✕</button>
          </div>
          ${d.description ? `<div style="font-size:12px;color:var(--text-secondary);margin:4px 0">${d.description}</div>` : ''}
          <div style="font-size:13px;margin-top:6px">
            <span class="data-value">${(d.total_kcal || 0).toFixed(0)} kcal</span> |
            <span style="color:var(--success)">${strings.diet.proteinShort}: ${(d.total_protein || 0).toFixed(1)}g</span> |
            <span>${strings.diet.carbsShort}: ${(d.total_carbs || 0).toFixed(1)}g</span> |
            <span>${strings.diet.fatShort}: ${(d.total_fat || 0).toFixed(1)}g</span>
          </div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${d.servings} ración(es)</div>
          <details style="font-size:12px;margin-top:6px">
            <summary style="cursor:pointer;color:var(--text-secondary)">${strings.diet.ingredients}</summary>
            <p style="margin-top:4px;color:var(--text-secondary)">${ingList || strings.diet.none}</p>
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
  }

  loadDishes();

  // --- 5-Column Meal Template UI ---
  async function loadMealTemplates() {
    const el = document.getElementById('meal-templates');
    const templates = await safeCall(api.getMealTemplates(), []);
    if (!templates || templates.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.diet.noMealTemplates}</p><div class="sub">${strings.diet.noMealTemplatesSub}</div></div>`;
      return;
    }

    const date = document.getElementById('plan-date').value;

    let html = `<div class="meal-columns" style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;overflow-x:auto">`;
    for (const tmpl of templates) {
      html += `<div class="meal-column" style="border:1px solid var(--border);border-radius:8px;padding:10px;background:var(--bg-secondary);min-width:180px">
        <h3 style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--accent)">${tmpl.name}</h3>`;
      for (const comp of tmpl.components || []) {
        const trainLabel = comp.default_grams > 0 ? `${comp.default_grams}g` : '—';
        const restLabel = comp.restday_grams != null && comp.restday_grams > 0 ? `${comp.restday_grams}g` : '—';
        html += `<div style="font-size:12px;margin-bottom:6px;padding:6px;border-radius:4px;background:var(--bg-primary)">
          <div style="font-weight:500;margin-bottom:2px">${comp.food_name}</div>
          <div style="color:var(--text-secondary);font-size:11px">
            ${comp.kcal_per_100g} kcal/100g · ${comp.default_grams}g ${strings.diet.trainingDay}
            ${comp.restday_grams != null ? `· ${comp.restday_grams}g ${strings.diet.restDay}` : ''}
          </div>
          <div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">`;
        for (const opt of comp.options || []) {
          html += `<button class="btn btn-secondary food-option-btn" style="padding:2px 6px;font-size:10px" data-comp-id="${comp.id}" data-food-id="${opt.food_item_id}" data-kcal="${opt.kcal_per_100g}" data-protein="${opt.protein_per_100g}" data-carbs="${opt.carbs_per_100g}" data-fat="${opt.fat_per_100g}" data-name="${opt.food_name}" data-grams="${comp.default_grams}">${opt.food_name}</button>`;
        }
        html += `</div>
        </div>`;
      }
      html += `<div class="meal-column-total" style="font-size:12px;font-weight:600;text-align:center;margin-top:8px;padding:6px;background:var(--bg-tertiary);border-radius:4px">
        <span id="col-total-${tmpl.id}">0 kcal</span>
      </div>`;
      html += `</div>`;
    }
    html += `</div>
      <div style="margin-top:12px;text-align:center">
        <button class="btn btn-primary" id="btn-use-5meals">${strings.diet.use5meals}</button>
      </div>`;

    el.innerHTML = html;

    // Track selected options per component
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
        // Update column total
        updateColumnTotals();
      });
    });

    function updateColumnTotals() {
      const totals = {};
      for (const tmpl of templates) {
        let kcal = 0;
        for (const comp of tmpl.components || []) {
          const sel = selections[comp.id];
          if (sel) {
            kcal += (sel.grams / 100) * sel.kcal_per_100g;
          } else {
            kcal += (comp.default_grams / 100) * comp.kcal_per_100g;
          }
        }
        totals[tmpl.id] = Math.round(kcal);
        const el2 = document.getElementById(`col-total-${tmpl.id}`);
        if (el2) el2.textContent = `${Math.round(kcal)} kcal`;
      }
      return totals;
    }

    document.getElementById('btn-use-5meals').addEventListener('click', async () => {
      if (!date) return;
      const totals = updateColumnTotals();
      // Create daily plan from selections
      await safeCall(api.deleteDailyPlanEntries(date), null);
      for (const tmpl of templates) {
        for (const comp of tmpl.components || []) {
          const sel = selections[comp.id];
          const foodId = sel ? sel.food_item_id : comp.food_item_id;
          const grams = sel ? sel.grams : comp.default_grams;
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

  // Pagination state
  let _foodPage = 0;
  const PAGE_SIZE = 20;

  document.getElementById('plan-date').addEventListener('change', async (e) => {
    loadDailyPlan(e.target.value);
  });

  document.getElementById('plan-date').valueAsDate = new Date();
  const todayStr = new Date().toISOString().split('T')[0];

  // Category pill filters
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

  await Promise.all([
    loadFoods(),
    loadHiddenFoods(),
    document.getElementById('plan-date').value ? loadDailyPlan(document.getElementById('plan-date').value) : Promise.resolve(),
  ]);
  window._loadingDiet = false;

  // Auto-create daily plan from templates
  document.getElementById('btn-auto-create-plan').addEventListener('click', async () => {
    const date = document.getElementById('plan-date').value;
    if (!date) return;
    const balance = await api.getEnergyBalance(date).catch(() => null);
    const targetKcal = balance ? balance.tdee - (parseFloat(document.getElementById('target-pace')?.value || 0.5) * 7700 / 7) : null;
    if (!targetKcal || targetKcal <= 0) {
      alert(strings.diet.setTargetFirst);
      return;
    }

    const templates = await safeCall(api.getMealTemplates(), []);
    if (!templates || templates.length === 0) return;

    // Compute meal ratios from seed data
    let totalSeedKcal = 0;
    const mealKcal = {};
    for (const tmpl of templates) {
      let kcal = 0;
      for (const comp of tmpl.components || []) {
        kcal += (comp.default_grams / 100) * comp.kcal_per_100g;
      }
      mealKcal[tmpl.id] = kcal;
      totalSeedKcal += kcal;
    }

    // Distribute target calories by ratio
    for (const tmpl of templates) {
      const ratio = totalSeedKcal > 0 ? mealKcal[tmpl.id] / totalSeedKcal : 1 / templates.length;
      const mealTarget = Math.round(targetKcal * ratio);

      // Pick the food option that best matches the meal's macro profile
      for (const comp of tmpl.components || []) {
        const optionGrams = comp.options && comp.options.length > 0 ? comp.options[0] : null;
        const foodId = optionGrams ? optionGrams.food_item_id : comp.food_item_id;
        const foodKcal = optionGrams ? optionGrams.kcal_per_100g : comp.kcal_per_100g;
        // Scale grams to hit the meal target proportionally
        const compRatio = mealKcal[tmpl.id] > 0 ? (comp.default_grams * comp.kcal_per_100g / 100) / mealKcal[tmpl.id] : 1 / (tmpl.components?.length || 1);
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

  async function loadDailyPlan(date) {
    const plan = await safeCall(api.getDailyPlan(date), []);
    const templates = await safeCall(api.getMealTemplates(), []);
    const mealsContainer = document.getElementById('daily-plan-meals');
    const totalsContainer = document.getElementById('daily-plan-totals');

    const entriesByMeal = {};
    for (const entry of plan || []) {
      const comp = templates ? templates.flatMap(t => t.components || []).find(c => c.id === entry.meal_component_id) : null;
      const mealId = comp ? comp.meal_template_id : 'unknown';
      if (!entriesByMeal[mealId]) entriesByMeal[mealId] = [];
      entriesByMeal[mealId].push({ ...entry, meal_component_id_for_sort: comp?.sort_order || 0 });
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
            ${entries.length > 0 ? `<span id="meal-total-${tmpl.id}" style="font-size:12px;color:var(--text-secondary)"></span>` : ''}
          </div>
          ${entries.length === 0 ? `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">Sin alimentos asignados</div>` : ''}
          <div id="meal-entries-${tmpl.id}">
            ${entries.map((entry, idx) => {
              const factor = entry.grams / 100;
              const kcal = entry.kcal_per_100g * factor;
              const protein = entry.protein_per_100g * factor;
              const carbs = entry.carbs_per_100g * factor;
              const fat = entry.fat_per_100g * factor;
              totalKcal += kcal; totalProtein += protein; totalCarbs += carbs; totalFat += fat;
              return `
                <div class="meal-entry" style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                  <span style="flex:1;font-size:13px">${entry.food_name}</span>
                   <input type="number" value="${entry.grams}" step="5" min="0" data-entry-id="${entry.id}" data-meal-id="${tmpl.id}" data-kcal="${entry.kcal_per_100g}" data-protein="${entry.protein_per_100g}" data-carbs="${entry.carbs_per_100g}" data-fat="${entry.fat_per_100g}" class="gram-input meal-gram-input" style="width:60px;padding:2px 6px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);font-size:12px" />
                   <span class="data-value" style="font-size:12px;width:50px;text-align:right">${kcal.toFixed(0)}</span>
                  <span style="font-size:11px;color:var(--text-secondary);width:80px;text-align:right">${strings.diet.proteinShort}:${protein.toFixed(1)} ${strings.diet.carbsShort}:${carbs.toFixed(1)} ${strings.diet.fatShort}:${fat.toFixed(1)}</span>
                  <button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-hide-food-id="${entry.food_item_id}">${strings.diet.hide}</button>
                </div>
              `;
            }).join('')}
          </div>
          <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
            <select class="swap-food-select" data-meal-template-id="${tmpl.id}" data-meal-component-id="" style="font-size:12px;padding:3px 6px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);max-width:150px">
              <option value="">${strings.diet.changeFood}</option>
            </select>
            <select class="dish-option-select" data-meal-template-id="${tmpl.id}" style="font-size:12px;padding:3px 6px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);max-width:150px">
              <option value="">${strings.diet.addDish}</option>
            </select>
          </div>
        </div>`;
    }

    if (!hasEntries) {
      html = `<div class="empty-state"><p>${strings.diet.noPlanForDate}</p></div>`;
    }

    mealsContainer.innerHTML = html;

    if (hasEntries) {
      totalsContainer.style.display = 'block';
      document.getElementById('plan-total-kcal').textContent = `${totalKcal.toFixed(0)} kcal`;
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
    } else {
      totalsContainer.style.display = 'none';
    }

    mealsContainer.querySelectorAll('.gram-input').forEach(input => {
      input.addEventListener('change', () => {
        if (window._gramUpdateTimeout) clearTimeout(window._gramUpdateTimeout);
        window._gramUpdateTimeout = setTimeout(() => recalcTotals(), 300);
        const entryId = parseInt(input.dataset.entryId);
        if (entryId) {
          safeCall(api.updateDailyPlanEntry(entryId, parseFloat(input.value) || 0), null);
        }
      });
    });

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
          opt.textContent = `${d.name} (${(d.total_kcal || 0).toFixed(0)} kcal)`;
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
              meal_component_id: 0,
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
    document.getElementById('plan-total-kcal').textContent = `${totalKcal.toFixed(0)} kcal`;
    document.getElementById('plan-total-protein').textContent = `P: ${totalProtein.toFixed(1)}g`;
    document.getElementById('plan-total-carbs').textContent = `C: ${totalCarbs.toFixed(1)}g`;
    document.getElementById('plan-total-fat').textContent = `G: ${totalFat.toFixed(1)}g`;
    for (const [mealId, mt] of Object.entries(mealTotals)) {
      const el = document.getElementById(`meal-total-${mealId}`);
      if (el) {
        el.textContent = `${mt.kcal.toFixed(0)} ${strings.diet.kcal} | ${strings.diet.proteinShort}:${mt.protein.toFixed(1)} ${strings.diet.carbsShort}:${mt.carbs.toFixed(1)} ${strings.diet.fatShort}:${mt.fat.toFixed(1)}`;
      }
    }
  }

  async function loadFoods() {
    const foods = await safeCall(api.getFoodItems(false), []);
    const activeCat = document.querySelector('#food-category-pills .filter-btn.active');
    const category = activeCat ? activeCat.dataset.cat : '';
    const search = document.getElementById('food-search').value.toLowerCase();
    const list = document.getElementById('food-list');
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

    let html = '<table style="width:100%"><thead><tr><th>Nombre</th><th>kcal</th><th>P</th><th>C</th><th>G</th><th></th></tr></thead><tbody>';
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
    const foods = await safeCall(api.getFoodItems(true), []);
    const hidden = foods.filter(f => f.is_hidden);
    const el = document.getElementById('hidden-foods');
    if (hidden.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.diet.noHiddenFoods}</p></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Nombre</th><th>kcal</th><th>Proteína</th><th>Carbos</th><th>Grasa</th><th></th></tr></thead><tbody>';
    for (const f of hidden) {
      html += `<tr>
        <td>${f.name}</td>
        <td>${f.kcal_per_100g}</td>
        <td>${f.protein_per_100g}g</td>
        <td>${f.carbs_per_100g}g</td>
        <td>${f.fat_per_100g}g</td>
        <td><button class="btn btn-primary" style="padding:4px 8px;font-size:12px" data-show-food-id="${f.id}">${strings.diet.reactivate}</button></td>
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

  loadFoods();
  loadHiddenFoods();
  if (document.getElementById('plan-date').value) {
    loadDailyPlan(document.getElementById('plan-date').value);
  }
}
