import { strings } from '../locales/es.js';

export function init() {
  const container = document.getElementById('view-diet');
  container.innerHTML = `
    <h2 style="margin-bottom:20px">${strings.diet.title}</h2>
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
      <form id="food-form" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="form-group" style="grid-column:span 2">
          <label>${strings.diet.foodName}</label>
          <input type="text" name="name" required />
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
        <div style="grid-column:span 2">
          <button type="submit" class="btn btn-primary">${strings.diet.addFoodItem}</button>
        </div>
      </form>
      <h3>${strings.diet.learnNewFood}</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">${strings.diet.learnNewFoodDesc}</p>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input type="text" id="learn-food-name" placeholder="e.g. Quinoa Burger" style="flex:1;padding:8px 12px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary)" />
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
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <select id="food-category-filter" style="padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary)">
          <option value="">${strings.diet.categoryFilter || 'Todas las categorías'}</option>
          <option value="breads">Pan/Cereales</option>
          <option value="proteins">Proteínas</option>
          <option value="fats">Grasas</option>
          <option value="fruits">Frutas</option>
          <option value="vegetables">Verduras</option>
          <option value="drinks">Bebidas</option>
        </select>
        <input type="text" id="food-search" placeholder="${strings.diet.search || 'Buscar...'}" style="flex:1;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary)" />
      </div>
      <div id="food-list"><div class="empty-state"><p>${strings.diet.noFoodItems}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.diet.hiddenFoodManager}</h2>
      <div id="hidden-foods"><div class="empty-state"><p>${strings.diet.noHiddenFoods}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.diet.dailyPlan}</h2>
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" id="plan-date" />
      </div>
      <button class="btn btn-secondary" id="btn-auto-create-plan" style="margin-bottom:12px">Auto-crear desde plantillas</button>
      <div id="daily-plan-meals"><div class="empty-state"><p>${strings.diet.selectDate}</p></div></div>
      <div id="daily-plan-totals" style="display:none;margin-top:12px;padding:12px;background:var(--bg-secondary);border-radius:8px">
        <strong>${strings.diet.total}:</strong>
        <span id="plan-total-kcal" style="color:#e94560">0 kcal</span> |
        <span id="plan-total-protein" style="color:#4ecdc4">P: 0g</span> |
        <span id="plan-total-carbs">C: 0g</span> |
        <span id="plan-total-fat">G: 0g</span>
      </div>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) return;

  // Food category filter
  const CATEGORY_KEYWORDS = {
    breads: ['pan', 'arroz', 'pasta', 'avena', 'cuscús', 'quinoa', 'patata', 'boniato', 'ñoqui', 'torta', 'harina', 'crumb', 'cereal', 'corn flakes', 'crema de arroz'],
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

  function getSmartDefaults(category) {
    switch (category) {
      case 'breads': return { kcal: 130, protein: 3, carbs: 28, fat: 0.3 };
      case 'proteins': return { kcal: 165, protein: 31, carbs: 0, fat: 3.6 };
      case 'fats': return { kcal: 500, protein: 8, carbs: 5, fat: 50 };
      case 'fruits': return { kcal: 60, protein: 0.5, carbs: 14, fat: 0.2 };
      case 'vegetables': return { kcal: 30, protein: 2, carbs: 4, fat: 0.3 };
      case 'drinks': return { kcal: 55, protein: 5, carbs: 7, fat: 0.2 };
      default: return null;
    }
  }

  document.getElementById('food-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.kcal_per_100g = parseFloat(data.kcal_per_100g);
    data.protein_per_100g = parseFloat(data.protein_per_100g);
    data.carbs_per_100g = parseFloat(data.carbs_per_100g);
    data.fat_per_100g = parseFloat(data.fat_per_100g);
    await api.saveFoodItem(data);
    e.target.reset();
    loadFoods();
    loadHiddenFoods();
  });

  // Smart defaults on name input
  document.querySelector('#food-form input[name="name"]').addEventListener('blur', (e) => {
    const name = e.target.value.trim();
    if (!name) return;
    const cat = getFoodCategory(name);
    const defaults = getSmartDefaults(cat);
    if (defaults) {
      const form = e.target.closest('form');
      form.querySelector('input[name="kcal_per_100g"]').value = defaults.kcal;
      form.querySelector('input[name="protein_per_100g"]').value = defaults.protein;
      form.querySelector('input[name="carbs_per_100g"]').value = defaults.carbs;
      form.querySelector('input[name="fat_per_100g"]').value = defaults.fat;
    }
  });

  document.getElementById('food-category-filter').addEventListener('change', () => loadFoods());
  document.getElementById('food-search').addEventListener('input', () => loadFoods());

  // Dish manager
  const dishFormContainer = document.getElementById('dish-form-container');
  const dishEditContainer = document.getElementById('dish-edit-container');

  function showDishForm(editDish) {
    dishFormContainer.style.display = 'block';
    dishFormContainer.innerHTML = `
      <h3>${editDish ? strings.diet.editDish : strings.diet.createDish}</h3>
      <form id="dish-form" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group" style="grid-column:span 2">
          <label>${strings.diet.name}</label>
          <input type="text" id="dish-name" value="${editDish ? editDish.name : ''}" required />
        </div>
        <div class="form-group" style="grid-column:span 2">
          <label>${strings.diet.description}</label>
          <input type="text" id="dish-desc" value="${editDish ? (editDish.description || '') : ''}" />
        </div>
        <div class="form-group">
          <label>${strings.diet.servings}</label>
          <input type="number" id="dish-servings" value="${editDish ? editDish.servings : 1}" min="1" step="0.5" />
        </div>
        <div style="grid-column:span 2;display:flex;gap:8px">
          <button type="submit" class="btn btn-primary">${editDish ? strings.general.save : strings.diet.confirmSave}</button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-dish">${strings.general.cancel}</button>
        </div>
      </form>
      <div id="dish-ingredients-section" style="margin-top:12px">
        <h4>${strings.diet.ingredients}</h4>
        <div id="dish-ingredients-list"></div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <select id="ingredient-food-select" style="flex:1;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary)"></select>
          <input type="number" id="ingredient-grams" placeholder="Gramos" style="width:80px;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary)" />
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

    // Load food items for ingredient select
    const foodSelect = document.getElementById('ingredient-food-select');
    api.getFoodItems(false).then(foods => {
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
      const dishId = await api.saveDish({
        name,
        description: document.getElementById('dish-desc').value,
        total_kcal: totalKcal,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fat: totalFat,
        servings,
      });
      for (const ing of ingredients) {
        await api.saveDishIngredient({ dish_id: dishId, food_item_id: ing.food_item_id, grams: ing.grams });
      }
      dishFormContainer.style.display = 'none';
      loadDishes();
    });
  }

  document.getElementById('btn-show-dish-form').addEventListener('click', () => {
    showDishForm(null);
  });

  async function loadDishes() {
    const dishes = await api.getDishes();
    const el = document.getElementById('dish-list');
    if (!dishes || dishes.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>Aún no hay platos creados</p></div>`;
      return;
    }
    let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">';
    for (const d of dishes) {
      const ingredients = await api.getDishIngredients(d.id);
      const ingList = ingredients.map(i => `${i.food_name} (${i.grams}g)`).join(', ');
      html += `
        <div class="dish-card" style="border:1px solid var(--border-color);border-radius:8px;padding:12px;background:var(--bg-secondary)">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <strong>${d.name}</strong>
            <button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-delete-dish="${d.id}">✕</button>
          </div>
          ${d.description ? `<div style="font-size:12px;color:var(--text-secondary);margin:4px 0">${d.description}</div>` : ''}
          <div style="font-size:13px;margin-top:6px">
            <span style="color:#e94560">${(d.total_kcal || 0).toFixed(0)} kcal</span> |
            <span style="color:#4ecdc4">P: ${(d.total_protein || 0).toFixed(1)}g</span> |
            <span>C: ${(d.total_carbs || 0).toFixed(1)}g</span> |
            <span>G: ${(d.total_fat || 0).toFixed(1)}g</span>
          </div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${d.servings} ración(es)</div>
          <details style="font-size:12px;margin-top:6px">
            <summary style="cursor:pointer;color:var(--text-secondary)">${strings.diet.ingredients}</summary>
            <p style="margin-top:4px;color:var(--text-secondary)">${ingList || 'Ninguno'}</p>
          </details>
        </div>
      `;
    }
    html += '</div>';
    el.innerHTML = html;

    el.querySelectorAll('[data-delete-dish]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await api.deleteDish(parseInt(btn.dataset.deleteDish));
        loadDishes();
      });
    });
  }

  loadDishes();

  document.getElementById('plan-date').addEventListener('change', async (e) => {
    loadDailyPlan(e.target.value);
  });

  document.getElementById('plan-date').valueAsDate = new Date();
  const todayStr = new Date().toISOString().split('T')[0];

  // Auto-create daily plan from templates
  document.getElementById('btn-auto-create-plan').addEventListener('click', async () => {
    const date = document.getElementById('plan-date').value;
    if (!date) return;
    let plan = await api.getDailyPlan(date);
    if (plan && plan.length > 0) {
      loadDailyPlan(date);
      return;
    }
    const templates = await api.getMealTemplates();
    if (!templates || templates.length === 0) return;
    for (const tmpl of templates) {
      for (const comp of tmpl.components || []) {
        await api.saveDailyPlanEntry({
          date,
          meal_component_id: comp.id,
          food_item_id: comp.food_item_id,
          grams: comp.default_grams,
        });
      }
    }
    loadDailyPlan(date);
  });

  document.getElementById('btn-suggest').addEventListener('click', () => {
    const name = document.getElementById('learn-food-name').value.trim();
    if (!name) return;
    const suggestion = suggestMacros(name);
    document.getElementById('suggest-kcal').value = suggestion.kcal;
    document.getElementById('suggest-protein').value = suggestion.protein;
    document.getElementById('suggest-carbs').value = suggestion.carbs;
    document.getElementById('suggest-fat').value = suggestion.fat;
    document.getElementById('learn-suggestion').style.display = 'block';
  });

  document.getElementById('btn-confirm-learn').addEventListener('click', async () => {
    const name = document.getElementById('learn-food-name').value.trim();
    if (!name) return;
    await api.saveFoodItem({
      name,
      kcal_per_100g: parseFloat(document.getElementById('suggest-kcal').value) || 0,
      protein_per_100g: parseFloat(document.getElementById('suggest-protein').value) || 0,
      carbs_per_100g: parseFloat(document.getElementById('suggest-carbs').value) || 0,
      fat_per_100g: parseFloat(document.getElementById('suggest-fat').value) || 0,
    });
    document.getElementById('learn-food-name').value = '';
    document.getElementById('learn-suggestion').style.display = 'none';
    loadFoods();
    loadHiddenFoods();
  });

  function suggestMacros(name) {
    const lower = name.toLowerCase();
    if (lower.includes('chicken') || lower.includes('pollo') || lower.includes('pavo') || lower.includes('turkey') || lower.includes('fish') || lower.includes('pescado') || lower.includes('merluza') || lower.includes('salmón') || lower.includes('salmon') || lower.includes('atún') || lower.includes('tuna')) {
      return { kcal: 165, protein: 31, carbs: 0, fat: 3.6 };
    }
    if (lower.includes('rice') || lower.includes('arroz') || lower.includes('pasta') || lower.includes('bread') || lower.includes('pan') || lower.includes('avena') || lower.includes('oat') || lower.includes('quinoa') || lower.includes('cuscús') || lower.includes('couscous') || lower.includes('patata') || lower.includes('potato') || lower.includes('boniato')) {
      return { kcal: 130, protein: 3, carbs: 28, fat: 0.3 };
    }
    if (lower.includes('aceite') || lower.includes('oil') || lower.includes('aguacate') || lower.includes('avocado') || lower.includes('fruto seco') || lower.includes('nut') || lower.includes('cacahuete') || lower.includes('peanut') || lower.includes('almendra') || lower.includes('almond') || lower.includes('queso') || lower.includes('cheese')) {
      return { kcal: 500, protein: 8, carbs: 5, fat: 50 };
    }
    if (lower.includes('huevo') || lower.includes('egg') || lower.includes('clara')) {
      return { kcal: 155, protein: 13, carbs: 1, fat: 11 };
    }
    if (lower.includes('verdura') || lower.includes('vegetable') || lower.includes('ensalada') || lower.includes('salad') || lower.includes('brocoli') || lower.includes('broccoli') || lower.includes('espinaca') || lower.includes('spinach')) {
      return { kcal: 30, protein: 2, carbs: 4, fat: 0.3 };
    }
    if (lower.includes('fruta') || lower.includes('fruit') || lower.includes('manzana') || lower.includes('apple') || lower.includes('platano') || lower.includes('banana') || lower.includes('naranja') || lower.includes('orange')) {
      return { kcal: 60, protein: 0.5, carbs: 14, fat: 0.2 };
    }
    if (lower.includes('leche') || lower.includes('milk') || lower.includes('yogur') || lower.includes('yogurt') || lower.includes('bebida vegetal')) {
      return { kcal: 55, protein: 5, carbs: 7, fat: 0.2 };
    }
    if (lower.includes('chocolate') || lower.includes('proteína') || lower.includes('protein')) {
      return { kcal: 380, protein: 30, carbs: 20, fat: 20 };
    }
    return { kcal: 200, protein: 10, carbs: 20, fat: 8 };
  }

  async function loadDailyPlan(date) {
    const plan = await api.getDailyPlan(date);
    const templates = await api.getMealTemplates();
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
        <div class="meal-card" style="border:1px solid var(--border-color);border-radius:8px;padding:12px;margin-bottom:10px;background:var(--bg-secondary)">
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
                  <input type="number" value="${entry.grams}" step="5" min="0" data-entry-id="${entry.id}" class="gram-input meal-gram-input" style="width:60px;padding:2px 6px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary);font-size:12px" />
                  <span style="font-size:12px;width:50px;text-align:right;color:#e94560">${kcal.toFixed(0)}</span>
                  <span style="font-size:11px;color:var(--text-secondary);width:80px;text-align:right">P:${protein.toFixed(1)} C:${carbs.toFixed(1)} G:${fat.toFixed(1)}</span>
                  <button class="btn btn-secondary" style="padding:2px 6px;font-size:11px" data-hide-food-id="${entry.food_item_id}">${strings.diet.hide}</button>
                </div>
              `;
            }).join('')}
          </div>
          <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
            <select class="swap-food-select" data-meal-template-id="${tmpl.id}" data-meal-component-id="" style="font-size:12px;padding:3px 6px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary);max-width:150px">
              <option value="">${strings.diet.suggest || 'Cambiar alimento...'}</option>
            </select>
            <select class="dish-option-select" data-meal-template-id="${tmpl.id}" style="font-size:12px;padding:3px 6px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary);max-width:150px">
              <option value="">${strings.diet.linkToMeal || 'Añadir plato...'}</option>
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
      document.getElementById('plan-total-protein').textContent = `P: ${totalProtein.toFixed(1)}g`;
      document.getElementById('plan-total-carbs').textContent = `C: ${totalCarbs.toFixed(1)}g`;
      document.getElementById('plan-total-fat').textContent = `G: ${totalFat.toFixed(1)}g`;

      // Recalc per-meal totals
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
          if (el) el.textContent = `${mKcal.toFixed(0)} kcal | P:${mProt.toFixed(1)} C:${mCarb.toFixed(1)} G:${mFat.toFixed(1)}`;
        }
      }
    } else {
      totalsContainer.style.display = 'none';
    }

    // Wire gram inputs
    mealsContainer.querySelectorAll('.gram-input').forEach(input => {
      input.addEventListener('change', () => {
        if (window._gramUpdateTimeout) clearTimeout(window._gramUpdateTimeout);
        window._gramUpdateTimeout = setTimeout(() => recalcTotals(), 300);
      });
    });

    // Wire hide buttons
    mealsContainer.querySelectorAll('[data-hide-food-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await api.hideFoodItem(parseInt(btn.dataset.hideFoodId));
        loadFoods();
        loadHiddenFoods();
      });
    });

    // Wire swap selects
    const allFoods = await api.getFoodItems(false);
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
            await api.saveDailyPlanEntry({
              date,
              meal_component_id: entry.meal_component_id,
              food_item_id: foodId,
              grams: entry.grams,
            });
          }
          select.value = '';
          loadDailyPlan(date);
        });
      }
    });

    // Wire dish option selects
    const allDishes = await api.getDishes();
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
          await api.linkDishToMeal({ meal_template_id: mealId, dish_id: dishId, sort_order: 0 });
          const dishIngredients = await api.getDishIngredients(dishId);
          for (const ing of dishIngredients) {
            await api.saveDailyPlanEntry({
              date,
              meal_component_id: 0,
              food_item_id: ing.food_item_id,
              grams: ing.grams,
            });
          }
          select.value = '';
          loadDailyPlan(date);
        });
      }
    });
  }

  function recalcTotals() {
    let totalKcal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    document.querySelectorAll('.gram-input').forEach(input => {
      const grams = parseFloat(input.value) || 0;
      const row = input.closest('tr');
      const cells = row.querySelectorAll('td');
      const kcalText = cells[2].textContent;
      const proteinText = cells[3].textContent;
      const carbsText = cells[4].textContent;
      const fatText = cells[5].textContent;
      const origKcal = parseFloat(kcalText);
      const origProtein = parseFloat(proteinText);
      const origCarbs = parseFloat(carbsText);
      const origFat = parseFloat(fatText);
      const prevKcal = cells[2].dataset.origKcal ? parseFloat(cells[2].dataset.origKcal) : origKcal;
      const prevProtein = cells[3].dataset.origProtein ? parseFloat(cells[3].dataset.origProtein) : origProtein;
      const prevCarbs = cells[4].dataset.origCarbs ? parseFloat(cells[4].dataset.origCarbs) : origCarbs;
      const prevFat = cells[5].dataset.origFat ? parseFloat(cells[5].dataset.origFat) : origFat;
      const prevGrams = cells[1].dataset.origGrams ? parseFloat(cells[1].dataset.origGrams) : parseFloat(input.defaultValue);
      if (!cells[2].dataset.origKcal) {
        cells[2].dataset.origKcal = origKcal;
        cells[3].dataset.origProtein = origProtein;
        cells[4].dataset.origCarbs = origCarbs;
        cells[5].dataset.origFat = origFat;
        cells[1].dataset.origGrams = input.defaultValue;
      }
      const ratio = prevGrams > 0 ? grams / prevGrams : 0;
      const newKcal = prevKcal * ratio;
      const newProtein = prevProtein * ratio;
      const newCarbs = prevCarbs * ratio;
      const newFat = prevFat * ratio;
      cells[2].textContent = newKcal.toFixed(0);
      cells[3].textContent = `${newProtein.toFixed(1)}g`;
      cells[4].textContent = `${newCarbs.toFixed(1)}g`;
      cells[5].textContent = `${newFat.toFixed(1)}g`;
      totalKcal += newKcal;
      totalProtein += newProtein;
      totalCarbs += newCarbs;
      totalFat += newFat;
    });
    document.getElementById('total-kcal').textContent = totalKcal.toFixed(0);
    document.getElementById('total-protein').textContent = `${totalProtein.toFixed(1)}g`;
    document.getElementById('total-carbs').textContent = `${totalCarbs.toFixed(1)}g`;
    document.getElementById('total-fat').textContent = `${totalFat.toFixed(1)}g`;
  }

  async function loadFoods() {
    const foods = await api.getFoodItems(false);
    const category = document.getElementById('food-category-filter').value;
    const search = document.getElementById('food-search').value.toLowerCase();
    const list = document.getElementById('food-list');
    if (!foods || foods.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>${strings.diet.noFoodItems}</p></div>`;
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
      return;
    }
    let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">';
    for (const f of filtered) {
      html += `
        <div style="border:1px solid var(--border-color);border-radius:8px;padding:10px;background:var(--bg-secondary)">
          <div style="font-weight:500;margin-bottom:4px">${f.name}</div>
          <div style="font-size:12px;color:var(--text-secondary)">
            <span style="color:#e94560">${f.kcal_per_100g} kcal</span>
          </div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">
            P: ${f.protein_per_100g}g | C: ${f.carbs_per_100g}g | G: ${f.fat_per_100g}g
          </div>
          <button class="btn btn-secondary" style="padding:2px 6px;font-size:11px;margin-top:6px" data-hide-food-id="${f.id}">${strings.diet.hide}</button>
        </div>
      `;
    }
    html += '</div>';
    list.innerHTML = html;

    list.querySelectorAll('[data-hide-food-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await api.hideFoodItem(parseInt(btn.dataset.hideFoodId));
        loadFoods();
        loadHiddenFoods();
      });
    });
  }

  async function loadHiddenFoods() {
    const foods = await api.getFoodItems(true);
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
        await api.unhideFoodItem(parseInt(btn.dataset.showFoodId));
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
