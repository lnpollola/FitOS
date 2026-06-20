const FOOD_ITEMS = [
  // Breads & grains (carbs)
  { name: 'Pan Blanco', kcal_per_100g: 265, protein_per_100g: 9, carbs_per_100g: 49, fat_per_100g: 3.2 },
  { name: 'Pan Integral', kcal_per_100g: 247, protein_per_100g: 13, carbs_per_100g: 41, fat_per_100g: 3.4 },
  { name: 'Tortas de Arroz', kcal_per_100g: 380, protein_per_100g: 8, carbs_per_100g: 80, fat_per_100g: 2.5 },
  { name: 'Tortas de Maíz', kcal_per_100g: 375, protein_per_100g: 7, carbs_per_100g: 80, fat_per_100g: 3 },
  { name: 'Harina de Avena', kcal_per_100g: 389, protein_per_100g: 17, carbs_per_100g: 66, fat_per_100g: 6.9 },
  { name: 'Arroz Blanco', kcal_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3 },
  { name: 'Pasta Integral', kcal_per_100g: 350, protein_per_100g: 14, carbs_per_100g: 65, fat_per_100g: 2.5 },
  { name: 'Pasta de Colores', kcal_per_100g: 350, protein_per_100g: 12, carbs_per_100g: 70, fat_per_100g: 1.5 },
  { name: 'Patata', kcal_per_100g: 77, protein_per_100g: 2, carbs_per_100g: 17, fat_per_100g: 0.1 },
  { name: 'Boniato', kcal_per_100g: 86, protein_per_100g: 1.6, carbs_per_100g: 20, fat_per_100g: 0.1 },
  { name: 'Ñoquis', kcal_per_100g: 130, protein_per_100g: 3, carbs_per_100g: 28, fat_per_100g: 0.5 },
  { name: 'Cuscús', kcal_per_100g: 112, protein_per_100g: 3.8, carbs_per_100g: 23, fat_per_100g: 0.2 },
  { name: 'Quinoa', kcal_per_100g: 120, protein_per_100g: 4.4, carbs_per_100g: 21, fat_per_100g: 1.9 },
  { name: 'Legumbre Cocida', kcal_per_100g: 116, protein_per_100g: 8, carbs_per_100g: 20, fat_per_100g: 0.4 },
  { name: 'Corn Flakes', kcal_per_100g: 357, protein_per_100g: 7, carbs_per_100g: 84, fat_per_100g: 0.4 },
  { name: 'Crema de Arroz', kcal_per_100g: 360, protein_per_100g: 7, carbs_per_100g: 80, fat_per_100g: 0.5 },
  // Proteins
  { name: 'Pechuga de Pollo', kcal_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6 },
  { name: 'Pechuga de Pavo', kcal_per_100g: 135, protein_per_100g: 29, carbs_per_100g: 0, fat_per_100g: 1.5 },
  { name: 'Fiambre de Pavo', kcal_per_100g: 100, protein_per_100g: 20, carbs_per_100g: 1, fat_per_100g: 2 },
  { name: 'Jamón Cocido', kcal_per_100g: 145, protein_per_100g: 20, carbs_per_100g: 1, fat_per_100g: 7 },
  { name: 'Jamón Serrano', kcal_per_100g: 240, protein_per_100g: 30, carbs_per_100g: 0.5, fat_per_100g: 13 },
  { name: 'Lomo Embuchado', kcal_per_100g: 200, protein_per_100g: 30, carbs_per_100g: 0.5, fat_per_100g: 9 },
  { name: 'Pescado Azul (Salmón)', kcal_per_100g: 208, protein_per_100g: 20, carbs_per_100g: 0, fat_per_100g: 13 },
  { name: 'Pescado Blanco (Merluza)', kcal_per_100g: 85, protein_per_100g: 18, carbs_per_100g: 0, fat_per_100g: 0.7 },
  { name: 'Calamar / Sepia', kcal_per_100g: 92, protein_per_100g: 17, carbs_per_100g: 0, fat_per_100g: 1.5 },
  { name: 'Carne Roja Magra', kcal_per_100g: 180, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 8 },
  { name: 'Huevos', kcal_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11 },
  { name: 'Claras de Huevo', kcal_per_100g: 52, protein_per_100g: 11, carbs_per_100g: 0.7, fat_per_100g: 0.2 },
  { name: 'Proteína en Polvo', kcal_per_100g: 380, protein_per_100g: 80, carbs_per_100g: 6, fat_per_100g: 5 },
  // Fats
  { name: 'Aceite de Oliva', kcal_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 },
  { name: 'Aguacate', kcal_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 8.5, fat_per_100g: 15 },
  { name: 'Frutos Secos Variados', kcal_per_100g: 607, protein_per_100g: 20, carbs_per_100g: 20, fat_per_100g: 54 },
  { name: 'Crema de Cacahuete sin Azúcar', kcal_per_100g: 588, protein_per_100g: 25, carbs_per_100g: 20, fat_per_100g: 50 },
  { name: 'Queso Semi', kcal_per_100g: 350, protein_per_100g: 25, carbs_per_100g: 1, fat_per_100g: 28 },
  { name: 'Mozzarella', kcal_per_100g: 280, protein_per_100g: 22, carbs_per_100g: 2, fat_per_100g: 21 },
  // Fruits
  { name: 'Fruta (Manzana)', kcal_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2 },
  { name: 'Plátano', kcal_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fat_per_100g: 0.3 },
  { name: 'Naranja', kcal_per_100g: 47, protein_per_100g: 0.9, carbs_per_100g: 12, fat_per_100g: 0.1 },
  // Vegetables
  { name: 'Verduras Variadas', kcal_per_100g: 25, protein_per_100g: 2, carbs_per_100g: 4, fat_per_100g: 0.3 },
  // Drinks & extras
  { name: 'Bebida Vegetal sin Azúcar', kcal_per_100g: 30, protein_per_100g: 1, carbs_per_100g: 3, fat_per_100g: 1 },
  { name: 'Yogur Natural Desnatado', kcal_per_100g: 55, protein_per_100g: 5, carbs_per_100g: 7, fat_per_100g: 0.2 },
  { name: 'Chocolate Negro 85%', kcal_per_100g: 598, protein_per_100g: 8, carbs_per_100g: 16, fat_per_100g: 55 },
  { name: 'Te Verde', kcal_per_100g: 1, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 },
  { name: 'Café', kcal_per_100g: 1, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 },
];

const EXERCISES = [
  // Warmup / mobility
  { name: 'Cat Camel', muscle_group: 'Spine', equipment: 'Bodyweight', movement_pattern: 'Spine Mobility' },
  { name: 'Bird Dog', muscle_group: 'Core', equipment: 'Bodyweight', movement_pattern: 'Core Anti-Rotation' },
  { name: 'Hip Stretch', muscle_group: 'Hips', equipment: 'Bodyweight', movement_pattern: 'Hip Mobility' },
  { name: 'Estiramiento Dorsal y Pecho', muscle_group: 'Back/Chest', equipment: 'Bodyweight', movement_pattern: 'Upper Body Mobility' },
  { name: 'Movilidad Peso Muerto Unilateral', muscle_group: 'Hamstrings', equipment: 'Bodyweight', movement_pattern: 'Hip Hinge' },
  { name: 'Elevaciones Laterales con Elástico', muscle_group: 'Shoulders', equipment: 'Band', movement_pattern: 'Lateral Raise' },
  // Lower body
  { name: 'Aductor en Máquina Sentado', muscle_group: 'Adductors', equipment: 'Machine', movement_pattern: 'Hip Adduction' },
  { name: 'Abductor en Máquina Sentado', muscle_group: 'Abductors', equipment: 'Machine', movement_pattern: 'Hip Abduction' },
  { name: 'Femoral Tumbado', muscle_group: 'Hamstrings', equipment: 'Machine', movement_pattern: 'Knee Flexion' },
  { name: 'Femoral Sentado', muscle_group: 'Hamstrings', equipment: 'Machine', movement_pattern: 'Knee Flexion' },
  { name: 'Sentadilla en Multipower', muscle_group: 'Quads/Glutes', equipment: 'Smith Machine', movement_pattern: 'Squat' },
  { name: 'Sentadilla Hack', muscle_group: 'Quads', equipment: 'Machine', movement_pattern: 'Squat' },
  { name: 'Prensa de 45 Grados', muscle_group: 'Quads', equipment: 'Machine', movement_pattern: 'Squat' },
  { name: 'Peso Muerto Rumano (RDL)', muscle_group: 'Hamstrings/Glutes', equipment: 'Barbell', movement_pattern: 'Hip Hinge' },
  { name: 'Peso Muerto Unilateral', muscle_group: 'Hamstrings/Glutes', equipment: 'Dumbbell', movement_pattern: 'Hip Hinge' },
  { name: 'Curl Femoral', muscle_group: 'Hamstrings', equipment: 'Machine', movement_pattern: 'Knee Flexion' },
  { name: 'Elevación de Talones Sentado', muscle_group: 'Calves', equipment: 'Machine', movement_pattern: 'Ankle Plantarflexion' },
  { name: 'Elevación de Talones de Pie', muscle_group: 'Calves', equipment: 'Barbell', movement_pattern: 'Ankle Plantarflexion' },
  { name: 'Extensiones de Cuádriceps', muscle_group: 'Quads', equipment: 'Machine', movement_pattern: 'Knee Extension' },
  { name: 'Zancada Búlgara', muscle_group: 'Quads/Glutes', equipment: 'Dumbbell', movement_pattern: 'Squat' },
  { name: 'Hip Thrust', muscle_group: 'Glutes', equipment: 'Barbell', movement_pattern: 'Hip Hinge' },
  // Upper body - Push
  { name: 'Press Plano con Mancuernas', muscle_group: 'Chest', equipment: 'Dumbbell', movement_pattern: 'Horizontal Push' },
  { name: 'Press Inclinado con Mancuernas', muscle_group: 'Chest', equipment: 'Dumbbell', movement_pattern: 'Horizontal Push' },
  { name: 'Press Banca con Barra', muscle_group: 'Chest', equipment: 'Barbell', movement_pattern: 'Horizontal Push' },
  { name: 'Aperturas en Máquina', muscle_group: 'Chest', equipment: 'Machine', movement_pattern: 'Horizontal Fly' },
  { name: 'Press Militar con Barra', muscle_group: 'Shoulders', equipment: 'Barbell', movement_pattern: 'Vertical Push' },
  { name: 'Press Arnold', muscle_group: 'Shoulders', equipment: 'Dumbbell', movement_pattern: 'Vertical Push' },
  { name: 'Elevaciones Laterales', muscle_group: 'Shoulders', equipment: 'Dumbbell', movement_pattern: 'Lateral Raise' },
  { name: 'Elevaciones Frontales', muscle_group: 'Shoulders', equipment: 'Dumbbell', movement_pattern: 'Front Raise' },
  { name: 'Fondos en Paralelas', muscle_group: 'Chest/Triceps', equipment: 'Bodyweight', movement_pattern: 'Vertical Push' },
  // Upper body - Pull
  { name: 'Dominadas', muscle_group: 'Back', equipment: 'Bodyweight', movement_pattern: 'Vertical Pull' },
  { name: 'Jalón al Pecho', muscle_group: 'Back', equipment: 'Cable', movement_pattern: 'Vertical Pull' },
  { name: 'Remo con Barra', muscle_group: 'Back', equipment: 'Barbell', movement_pattern: 'Horizontal Pull' },
  { name: 'Remo en Máquina', muscle_group: 'Back', equipment: 'Machine', movement_pattern: 'Horizontal Pull' },
  { name: 'Remo en Polea Baja', muscle_group: 'Back', equipment: 'Cable', movement_pattern: 'Horizontal Pull' },
  { name: 'Face Pull', muscle_group: 'Shoulders/Rear Delts', equipment: 'Cable', movement_pattern: 'Horizontal Pull' },
  { name: 'Peso Muerto', muscle_group: 'Back/Hamstrings', equipment: 'Barbell', movement_pattern: 'Hip Hinge' },
  // Arms
  { name: 'Curl de Bíceps con Barra', muscle_group: 'Biceps', equipment: 'Barbell', movement_pattern: 'Elbow Flexion' },
  { name: 'Curl de Bíceps con Mancuerna', muscle_group: 'Biceps', equipment: 'Dumbbell', movement_pattern: 'Elbow Flexion' },
  { name: 'Curl Martillo', muscle_group: 'Biceps', equipment: 'Dumbbell', movement_pattern: 'Elbow Flexion' },
  { name: 'Extensión de Tríceps en Polea', muscle_group: 'Triceps', equipment: 'Cable', movement_pattern: 'Elbow Extension' },
  { name: 'Press Francés', muscle_group: 'Triceps', equipment: 'Barbell', movement_pattern: 'Elbow Extension' },
  { name: 'Fondo en Banco', muscle_group: 'Triceps', equipment: 'Bench', movement_pattern: 'Elbow Extension' },
  // Core
  { name: 'Plancha', muscle_group: 'Core', equipment: 'Bodyweight', movement_pattern: 'Core Anti-Extension' },
  { name: 'Plancha Lateral', muscle_group: 'Core', equipment: 'Bodyweight', movement_pattern: 'Core Anti-Lateral Flexion' },
  { name: 'Elevación de Piernas', muscle_group: 'Core', equipment: 'Bodyweight', movement_pattern: 'Core Flexion' },
  { name: 'Russian Twist', muscle_group: 'Core', equipment: 'Bodyweight', movement_pattern: 'Core Rotation' },
  { name: 'Ab Wheel Rollout', muscle_group: 'Core', equipment: 'Wheel', movement_pattern: 'Core Anti-Extension' },
  { name: 'Encogimiento (Crunch)', muscle_group: 'Core', equipment: 'Bodyweight', movement_pattern: 'Core Flexion' },
  { name: 'Pallof Press', muscle_group: 'Core', equipment: 'Cable', movement_pattern: 'Core Anti-Rotation' },
  // Cardio / HIIT
  { name: 'Burpees', muscle_group: 'Full Body', equipment: 'Bodyweight', movement_pattern: 'Explosive' },
  { name: 'Saltos de Cuerda', muscle_group: 'Calves/Full Body', equipment: 'Rope', movement_pattern: 'Plyometric' },
  { name: 'Box Jumps', muscle_group: 'Quads/Glutes', equipment: 'Box', movement_pattern: 'Plyometric' },
  { name: 'Kettlebell Swing', muscle_group: 'Glutes/Hamstrings', equipment: 'Kettlebell', movement_pattern: 'Hip Hinge' },
];

const WORKOUT_PLANS = [
  {
    name: '2x Superior/Inferior',
    min_sessions: 2, max_sessions: 2,
    days: [
      { day_number: 1, focus_area: 'Superior — Pecho, Hombros, Tríceps', exercise_ids: '79,80,83,85,97,100' },
      { day_number: 2, focus_area: 'Inferior — Cuádriceps, Isquios, Glúteos', exercise_ids: '67,69,70,73,75,105' },
    ]
  },
  {
    name: '3x Empuje/Tracción/Piernas',
    min_sessions: 3, max_sessions: 3,
    days: [
      { day_number: 1, focus_area: 'Empuje — Pecho, Hombros, Tríceps', exercise_ids: '79,81,83,85,100,101' },
      { day_number: 2, focus_area: 'Tracción — Espalda, Bíceps, Delts Posteriores', exercise_ids: '89,90,91,94,97,98' },
      { day_number: 3, focus_area: 'Piernas — Cuádriceps, Isquios, Glúteos, Gemelos', exercise_ids: '67,69,70,71,73,74' },
    ]
  },
  {
    name: '4x Superior/Inferior (2x cada uno)',
    min_sessions: 4, max_sessions: 4,
    days: [
      { day_number: 1, focus_area: 'Superior — Empuje (Pecho, Hombros, Tríceps)', exercise_ids: '79,80,83,85,100,102' },
      { day_number: 2, focus_area: 'Inferior — Cuádriceps, Glúteos, Gemelos', exercise_ids: '67,69,75,76,73,112' },
      { day_number: 3, focus_area: 'Superior — Tracción (Espalda, Bíceps, Delts)', exercise_ids: '89,91,92,94,97,99' },
      { day_number: 4, focus_area: 'Inferior — Isquios, Glúteos, Core', exercise_ids: '70,71,77,104,106,114' },
    ]
  },
  {
    name: '5x Push/Pull/Legs/Upper/Lower',
    min_sessions: 5, max_sessions: 5,
    days: [
      { day_number: 1, focus_area: 'Empuje — Pecho, Hombros, Tríceps', exercise_ids: '81,82,83,85,100,101' },
      { day_number: 2, focus_area: 'Tracción — Espalda, Bíceps', exercise_ids: '89,90,91,93,97,98' },
      { day_number: 3, focus_area: 'Piernas — Cuádriceps, Isquios, Glúteos', exercise_ids: '67,69,70,71,76,77' },
      { day_number: 4, focus_area: 'Superior — Espalda, Hombros, Bíceps, Tríceps', exercise_ids: '79,84,85,94,99,102' },
      { day_number: 5, focus_area: 'Inferior — Isquios, Glúteos, Gemelos, Core', exercise_ids: '70,73,74,77,104,114' },
    ]
  },
  {
    name: '6x Push/Pull/Legs/Upper/Lower/Full Body',
    min_sessions: 6, max_sessions: 6,
    days: [
      { day_number: 1, focus_area: 'Empuje — Pecho, Hombros, Tríceps', exercise_ids: '79,81,83,85,100,101' },
      { day_number: 2, focus_area: 'Tracción — Espalda, Bíceps', exercise_ids: '89,90,91,94,97,98' },
      { day_number: 3, focus_area: 'Piernas — Cuádriceps, Isquios, Glúteos', exercise_ids: '67,69,70,71,76,77' },
      { day_number: 4, focus_area: 'Superior completo', exercise_ids: '79,83,85,89,91,97,100' },
      { day_number: 5, focus_area: 'Inferior completo', exercise_ids: '67,70,71,73,74,105' },
      { day_number: 6, focus_area: 'Cuerpo completo — ejercicios compuestos', exercise_ids: '79,81,89,91,69,77,112,114' },
    ]
  },
];

function seedIfEmpty(db) {

  const foodCount = db.prepare('SELECT COUNT(*) as count FROM food_items').get().count;
  if (foodCount === 0) {
    const insertFood = db.prepare(
      'INSERT INTO food_items (name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES (?, ?, ?, ?, ?)'
    );
    const mealSlots = [
      { name: 'Desayuno', slot_order: 1 },
      { name: 'Media Mañana', slot_order: 2 },
      { name: 'Comida', slot_order: 3 },
      { name: 'Merienda', slot_order: 4 },
      { name: 'Cena', slot_order: 5 },
    ];

    const transaction = db.transaction(() => {
      for (const food of FOOD_ITEMS) {
        insertFood.run(food.name, food.kcal_per_100g, food.protein_per_100g, food.carbs_per_100g, food.fat_per_100g);
      }
      for (const meal of mealSlots) {
        db.prepare('INSERT INTO meal_templates (name, slot_order) VALUES (?, ?)').run(meal.name, meal.slot_order);
      }
    });
    transaction();
    console.log(`Seeded ${FOOD_ITEMS.length} food items and ${mealSlots.length} meal templates`);
  }

  const exerciseCount = db.prepare('SELECT COUNT(*) as count FROM exercise_library').get().count;
  if (exerciseCount === 0) {
    const insertExercise = db.prepare(
      'INSERT INTO exercise_library (name, muscle_group, equipment, movement_pattern) VALUES (?, ?, ?, ?)'
    );
    const transaction = db.transaction(() => {
      for (const ex of EXERCISES) {
        insertExercise.run(ex.name, ex.muscle_group, ex.equipment, ex.movement_pattern);
      }
    });
    transaction();
    console.log(`Seeded ${EXERCISES.length} exercises`);
  }

  const plansCount = db.prepare('SELECT COUNT(*) as count FROM workout_plans').get().count;
  if (plansCount === 0) {
    const insertPlan = db.prepare('INSERT INTO workout_plans (name, min_sessions, max_sessions) VALUES (?, ?, ?)');
    const insertDay = db.prepare('INSERT INTO workout_plan_days (plan_id, day_number, focus_area, exercise_ids) VALUES (?, ?, ?, ?)');
    const transaction = db.transaction(() => {
      for (const plan of WORKOUT_PLANS) {
        const result = insertPlan.run(plan.name, plan.min_sessions, plan.max_sessions);
        const planId = result.lastInsertRowid;
        for (const day of plan.days) {
          insertDay.run(planId, day.day_number, day.focus_area, day.exercise_ids);
        }
      }
    });
    transaction();
    console.log(`Seeded ${WORKOUT_PLANS.length} workout plans`);
  }

  const compCount = db.prepare('SELECT COUNT(*) as count FROM meal_components').get().count;
  if (compCount === 0) {
    const insertComp = db.prepare('INSERT INTO meal_components (meal_template_id, food_item_id, default_grams, restday_grams, sort_order) VALUES (?, ?, ?, ?, ?)');
    const insertOption = db.prepare('INSERT INTO meal_options (meal_component_id, food_item_id) VALUES (?, ?)');
    const transaction = db.transaction(() => {
      for (const comp of MEAL_COMPONENTS) {
        const result = insertComp.run(comp.meal_template_id, comp.food_item_id, comp.default_grams, comp.restday_grams, comp.sort_order);
        const compId = result.lastInsertRowid;
        for (const optId of comp.options) {
          insertOption.run(compId, optId);
        }
      }
    });
    transaction();
    console.log(`Seeded ${MEAL_COMPONENTS.length} meal components with options`);
  }
}

function seedStats() {
  const db = require('./database').getHealthsyncDb();
  const tables = ['heart_rate','steps','body_mass','workouts','sleep','hrv'];
  const stats = {};
  for (const table of tables) {
    try {
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      stats[table] = row.count;
    } catch {
      stats[table] = 0;
    }
  }
  console.table(stats);
  return stats;
}

const MEAL_COMPONENTS = [
  // Desayuno (meal_template_id=1)
  { meal_template_id: 1, food_item_id: 1, default_grams: 100, restday_grams: 70, sort_order: 1, options: [2, 5, 3, 4] },
  { meal_template_id: 1, food_item_id: 20, default_grams: 120, restday_grams: 50, sort_order: 2, options: [19, 21, 22, 28] },
  { meal_template_id: 1, food_item_id: 30, default_grams: 10, restday_grams: 10, sort_order: 3, options: [31, 32, 33] },
  { meal_template_id: 1, food_item_id: 43, default_grams: 0, restday_grams: 0, sort_order: 4, options: [44, 40] },
  // Media Mañana (meal_template_id=2)
  { meal_template_id: 2, food_item_id: 5, default_grams: 30, restday_grams: 30, sort_order: 1, options: [] },
  { meal_template_id: 2, food_item_id: 29, default_grams: 10, restday_grams: 10, sort_order: 2, options: [] },
  { meal_template_id: 2, food_item_id: 32, default_grams: 15, restday_grams: 15, sort_order: 3, options: [] },
  { meal_template_id: 2, food_item_id: 40, default_grams: 300, restday_grams: 300, sort_order: 4, options: [] },
  // Comida (meal_template_id=3)
  { meal_template_id: 3, food_item_id: 6, default_grams: 60, restday_grams: 60, sort_order: 1, options: [7, 13, 9, 10, 14] },
  { meal_template_id: 3, food_item_id: 17, default_grams: 150, restday_grams: 150, sort_order: 2, options: [18, 23, 24, 27, 26] },
  { meal_template_id: 3, food_item_id: 39, default_grams: 0, restday_grams: 0, sort_order: 3, options: [] },
  { meal_template_id: 3, food_item_id: 36, default_grams: 150, restday_grams: 150, sort_order: 4, options: [37, 38] },
  { meal_template_id: 3, food_item_id: 30, default_grams: 10, restday_grams: 10, sort_order: 5, options: [31] },
  // Merienda (meal_template_id=4)
  { meal_template_id: 4, food_item_id: 16, default_grams: 50, restday_grams: 30, sort_order: 1, options: [5, 15] },
  { meal_template_id: 4, food_item_id: 29, default_grams: 20, restday_grams: 20, sort_order: 2, options: [20, 19] },
  { meal_template_id: 4, food_item_id: 32, default_grams: 15, restday_grams: 20, sort_order: 3, options: [31] },
  { meal_template_id: 4, food_item_id: 36, default_grams: 120, restday_grams: 120, sort_order: 4, options: [37, 38] },
  // Cena (meal_template_id=5)
  { meal_template_id: 5, food_item_id: 9, default_grams: 200, restday_grams: 80, sort_order: 1, options: [10, 7, 1] },
  { meal_template_id: 5, food_item_id: 17, default_grams: 150, restday_grams: 150, sort_order: 2, options: [18, 24, 27, 26] },
  { meal_template_id: 5, food_item_id: 39, default_grams: 0, restday_grams: 0, sort_order: 3, options: [] },
  { meal_template_id: 5, food_item_id: 30, default_grams: 10, restday_grams: 10, sort_order: 4, options: [31, 34] },
  { meal_template_id: 5, food_item_id: 41, default_grams: 0, restday_grams: 0, sort_order: 5, options: [42] },
];

module.exports = { seedIfEmpty, seedStats };
