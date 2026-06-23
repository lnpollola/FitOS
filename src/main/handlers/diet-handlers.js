const { refreshCaches } = require('../../db/database');

function register(ipcMain, getDb, getHS) {
  ipcMain.handle('db:getFoodItems', (_event, includeHidden) => {
    const db = getDb();
    if (includeHidden) return db.prepare('SELECT * FROM food_items ORDER BY name').all();
    return db.prepare('SELECT * FROM food_items WHERE is_hidden = 0 ORDER BY name').all();
  });

  ipcMain.handle('db:saveFoodItem', (_event, item) => {
    const db = getDb();
    db.prepare(`
      INSERT INTO food_items (name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
      VALUES (@name, @kcal_per_100g, @protein_per_100g, @carbs_per_100g, @fat_per_100g)
    `).run(item);
    return true;
  });

  ipcMain.handle('db:hideFoodItem', (_event, id) => {
    const db = getDb();
    db.prepare('UPDATE food_items SET is_hidden = 1 WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('db:unhideFoodItem', (_event, id) => {
    const db = getDb();
    db.prepare('UPDATE food_items SET is_hidden = 0 WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('db:searchFoodItems', (_event, query) => {
    const db = getDb();
    if (!query || query.trim().length < 2) return [];
    return db.prepare(`
      SELECT id, name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g
      FROM food_items WHERE is_hidden = 0 AND name LIKE ? ORDER BY name LIMIT 5
    `).all(`%${query.trim()}%`);
  });

  ipcMain.handle('db:getMealTemplates', () => {
    const db = getDb();
    const templates = db.prepare('SELECT * FROM meal_templates ORDER BY slot_order').all();
    for (const t of templates) {
      t.components = db.prepare(`
        SELECT mc.*, fi.name as food_name, fi.kcal_per_100g, fi.protein_per_100g, fi.carbs_per_100g, fi.fat_per_100g
        FROM meal_components mc JOIN food_items fi ON mc.food_item_id = fi.id
        WHERE mc.meal_template_id = ? ORDER BY mc.sort_order
      `).all(t.id);
      for (const c of t.components) {
        c.options = db.prepare(`
          SELECT mo.*, fi.name as food_name, fi.kcal_per_100g, fi.protein_per_100g, fi.carbs_per_100g, fi.fat_per_100g
          FROM meal_options mo JOIN food_items fi ON mo.food_item_id = fi.id
          WHERE mo.meal_component_id = ? AND mo.is_active = 1
        `).all(c.id);
      }
    }
    return templates;
  });

  ipcMain.handle('db:getDailyPlan', (_event, date) => {
    const db = getDb();
    return db.prepare(`
      SELECT dpe.*, fi.name as food_name, fi.kcal_per_100g, fi.protein_per_100g, fi.carbs_per_100g, fi.fat_per_100g
      FROM daily_plan_entries dpe
      JOIN daily_plans dp ON dpe.daily_plan_id = dp.id
      JOIN food_items fi ON dpe.food_item_id = fi.id
      WHERE dp.date = ?
    `).all(date);
  });

  ipcMain.handle('db:saveDailyPlanEntry', (_event, entry) => {
    const db = getDb();
    let plan = db.prepare('SELECT id FROM daily_plans WHERE date = ?').get(entry.date);
    if (!plan) {
      const result = db.prepare('INSERT INTO daily_plans (date) VALUES (?)').run(entry.date);
      plan = { id: result.lastInsertRowid };
    }
    db.prepare('INSERT INTO daily_plan_entries (daily_plan_id, meal_component_id, food_item_id, grams) VALUES (?, ?, ?, ?)').run(plan.id, entry.meal_component_id, entry.food_item_id, entry.grams);
    return true;
  });

  ipcMain.handle('db:updateDailyPlanEntry', (_event, id, grams) => {
    const db = getDb();
    db.prepare('UPDATE daily_plan_entries SET grams = ? WHERE id = ?').run(grams, id);
    return true;
  });

  ipcMain.handle('db:deleteDailyPlanEntries', (_event, date) => {
    const db = getDb();
    const plan = db.prepare('SELECT id FROM daily_plans WHERE date = ?').get(date);
    if (plan) {
      db.prepare('DELETE FROM daily_plan_entries WHERE daily_plan_id = ?').run(plan.id);
      db.prepare('DELETE FROM daily_plans WHERE id = ?').run(plan.id);
    }
    return true;
  });

  ipcMain.handle('db:deleteDailyPlanEntry', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM daily_plan_entries WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('db:saveDish', (_event, dish) => {
    const db = getDb();
    if (dish.id) {
      db.prepare(`
        UPDATE elaborated_dishes SET name = @name, description = @description, total_kcal = @total_kcal,
        total_protein = @total_protein, total_carbs = @total_carbs, total_fat = @total_fat, servings = @servings
        WHERE id = @id
      `).run(dish);
      db.prepare('DELETE FROM dish_ingredients WHERE dish_id = ?').run(dish.id);
      return dish.id;
    }
    const result = db.prepare(`
      INSERT INTO elaborated_dishes (name, description, total_kcal, total_protein, total_carbs, total_fat, servings)
      VALUES (@name, @description, @total_kcal, @total_protein, @total_carbs, @total_fat, @servings)
    `).run(dish);
    return result.lastInsertRowid;
  });

  ipcMain.handle('db:getDishes', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM elaborated_dishes ORDER BY name').all();
  });

  ipcMain.handle('db:getDishIngredients', (_event, dishId) => {
    const db = getDb();
    return db.prepare(`
      SELECT di.*, fi.name as food_name, fi.kcal_per_100g, fi.protein_per_100g, fi.carbs_per_100g, fi.fat_per_100g
      FROM dish_ingredients di JOIN food_items fi ON di.food_item_id = fi.id
      WHERE di.dish_id = ?
    `).all(dishId);
  });

  ipcMain.handle('db:deleteDish', (_event, dishId) => {
    const db = getDb();
    db.prepare('DELETE FROM elaborated_dishes WHERE id = ?').run(dishId);
    return true;
  });

  ipcMain.handle('db:saveDishIngredient', (_event, ingredient) => {
    const db = getDb();
    db.prepare('INSERT INTO dish_ingredients (dish_id, food_item_id, grams) VALUES (@dish_id, @food_item_id, @grams)').run(ingredient);
    return true;
  });

  ipcMain.handle('db:linkDishToMeal', (_event, link) => {
    const db = getDb();
    db.prepare('INSERT INTO meal_dish_options (meal_template_id, dish_id, sort_order) VALUES (@meal_template_id, @dish_id, @sort_order)').run(link);
    return true;
  });

  ipcMain.handle('db:getDishesForMeal', (_event, mealTemplateId) => {
    const db = getDb();
    return db.prepare(`
      SELECT mdo.*, ed.name as dish_name, ed.total_kcal, ed.total_protein, ed.total_carbs, ed.total_fat
      FROM meal_dish_options mdo JOIN elaborated_dishes ed ON mdo.dish_id = ed.id
      WHERE mdo.meal_template_id = ? ORDER BY mdo.sort_order
    `).all(mealTemplateId);
  });

  ipcMain.handle('db:unlinkDish', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM meal_dish_options WHERE id = ?').run(id);
    return true;
  });
}

module.exports = { register };
