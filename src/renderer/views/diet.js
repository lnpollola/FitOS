export function init() {
  const container = document.getElementById('view-diet');
  container.innerHTML = `
    <h2 style="margin-bottom:20px">Diet Plan</h2>
    <div class="card">
      <h2>Meal Templates</h2>
      <div id="meal-templates"><div class="empty-state"><p>No meal templates defined</p><div class="sub">Meal structure will appear here</div></div></div>
    </div>
    <div class="card">
      <h2>Food Item Manager</h2>
      <form id="food-form" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="form-group" style="grid-column:span 2">
          <label>Food Name</label>
          <input type="text" name="name" required />
        </div>
        <div class="form-group">
          <label>kcal / 100g</label>
          <input type="number" name="kcal_per_100g" min="0" step="0.1" required />
        </div>
        <div class="form-group">
          <label>Protein / 100g</label>
          <input type="number" name="protein_per_100g" min="0" step="0.1" required />
        </div>
        <div class="form-group">
          <label>Carbs / 100g</label>
          <input type="number" name="carbs_per_100g" min="0" step="0.1" required />
        </div>
        <div class="form-group">
          <label>Fat / 100g</label>
          <input type="number" name="fat_per_100g" min="0" step="0.1" required />
        </div>
        <div style="grid-column:span 2">
          <button type="submit" class="btn btn-primary">Add Food Item</button>
        </div>
      </form>
      <h3>Learn New Food</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">Enter a food name and we'll suggest estimated macros based on similar foods.</p>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input type="text" id="learn-food-name" placeholder="e.g. Quinoa Burger" style="flex:1;padding:8px 12px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary)" />
        <button class="btn btn-secondary" id="btn-suggest">Suggest</button>
      </div>
      <div id="learn-suggestion" style="display:none">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div class="form-group"><label>Estimated kcal / 100g</label><input type="number" id="suggest-kcal" step="0.1" /></div>
          <div class="form-group"><label>Estimated Protein / 100g</label><input type="number" id="suggest-protein" step="0.1" /></div>
          <div class="form-group"><label>Estimated Carbs / 100g</label><input type="number" id="suggest-carbs" step="0.1" /></div>
          <div class="form-group"><label>Estimated Fat / 100g</label><input type="number" id="suggest-fat" step="0.1" /></div>
        </div>
        <button class="btn btn-primary" id="btn-confirm-learn">Confirm & Save</button>
      </div>
      <h3>Food Database</h3>
      <div id="food-list"><div class="empty-state"><p>No food items yet</p></div></div>
    </div>
    <div class="card">
      <h2>Hidden Food Manager</h2>
      <div id="hidden-foods"><div class="empty-state"><p>No hidden foods</p></div></div>
    </div>
    <div class="card">
      <h2>Daily Plan</h2>
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="plan-date" />
      </div>
      <div id="daily-plan-summary"><div class="empty-state"><p>Select a date to view the plan</p></div></div>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) return;

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

  document.getElementById('plan-date').addEventListener('change', async (e) => {
    loadDailyPlan(e.target.value);
  });

  document.getElementById('plan-date').valueAsDate = new Date();

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
    const summary = document.getElementById('daily-plan-summary');
    if (!plan || plan.length === 0) {
      summary.innerHTML = `<div class="empty-state"><p>No plan for this date</p></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Food</th><th>Grams</th><th>kcal</th><th>Protein</th><th>Carbs</th><th>Fat</th><th></th></tr></thead><tbody>';
    let totalKcal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    for (const entry of plan) {
      const factor = entry.grams / 100;
      const kcal = entry.kcal_per_100g * factor;
      const protein = entry.protein_per_100g * factor;
      const carbs = entry.carbs_per_100g * factor;
      const fat = entry.fat_per_100g * factor;
      totalKcal += kcal; totalProtein += protein; totalCarbs += carbs; totalFat += fat;
      html += `<tr>
        <td>${entry.food_name}</td>
        <td><input type="number" value="${entry.grams}" step="5" min="0" data-entry-id="${entry.id}" class="gram-input" style="width:70px;padding:4px 8px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary)" /></td>
        <td>${kcal.toFixed(0)}</td>
        <td>${protein.toFixed(1)}g</td>
        <td>${carbs.toFixed(1)}g</td>
        <td>${fat.toFixed(1)}g</td>
        <td><button class="btn btn-secondary" style="padding:4px 8px;font-size:12px" data-hide-food-id="${entry.food_item_id}">Hide</button></td>
      </tr>`;
    }
    html += `</tbody><tfoot><tr style="font-weight:bold"><td>Total</td><td></td><td id="total-kcal">${totalKcal.toFixed(0)}</td><td id="total-protein">${totalProtein.toFixed(1)}g</td><td id="total-carbs">${totalCarbs.toFixed(1)}g</td><td id="total-fat">${totalFat.toFixed(1)}g</td><td></td></tr></tfoot></table>`;
    summary.innerHTML = html;

    summary.querySelectorAll('.gram-input').forEach(input => {
      input.addEventListener('change', async (e) => {
        const entryId = parseInt(e.target.dataset.entryId);
        const newGrams = parseFloat(e.target.value) || 0;
        if (window._gramUpdateTimeout) clearTimeout(window._gramUpdateTimeout);
        window._gramUpdateTimeout = setTimeout(() => {
          recalcTotals();
        }, 300);
      });
    });

    summary.querySelectorAll('[data-hide-food-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await api.hideFoodItem(parseInt(btn.dataset.hideFoodId));
        loadFoods();
        loadHiddenFoods();
      });
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
    const list = document.getElementById('food-list');
    if (!foods || foods.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>No food items yet</p></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Name</th><th>kcal</th><th>Protein</th><th>Carbs</th><th>Fat</th><th></th></tr></thead><tbody>';
    for (const f of foods) {
      html += `<tr>
        <td>${f.name}</td>
        <td>${f.kcal_per_100g}</td>
        <td>${f.protein_per_100g}g</td>
        <td>${f.carbs_per_100g}g</td>
        <td>${f.fat_per_100g}g</td>
        <td><button class="btn btn-secondary" style="padding:4px 8px;font-size:12px" data-hide-food-id="${f.id}">Hide</button></td>
      </tr>`;
    }
    html += '</tbody></table>';
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
      el.innerHTML = `<div class="empty-state"><p>No hidden foods</p></div>`;
      return;
    }
    let html = '<table><thead><tr><th>Name</th><th>kcal</th><th>Protein</th><th>Carbs</th><th>Fat</th><th></th></tr></thead><tbody>';
    for (const f of hidden) {
      html += `<tr>
        <td>${f.name}</td>
        <td>${f.kcal_per_100g}</td>
        <td>${f.protein_per_100g}g</td>
        <td>${f.carbs_per_100g}g</td>
        <td>${f.fat_per_100g}g</td>
        <td><button class="btn btn-primary" style="padding:4px 8px;font-size:12px" data-show-food-id="${f.id}">Reactivate</button></td>
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
