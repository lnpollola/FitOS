## 1. Spanish UI — String Constants & Translation

- [x] 1.1 Create `src/renderer/locales/es.js` with all UI strings exported as a flat object
- [x] 1.2 Refactor `src/renderer/views/` — replace all hardcoded English strings with `strings.*` imports
- [x] 1.3 Refactor `src/renderer/index.html` and sidebar nav labels to use Spanish
- [x] 1.4 Update chart labels, tooltips, axis titles in all views to Spanish
- [x] 1.5 Update error messages and validation text to Spanish
- [x] 1.6 Verify no English strings remain in renderer (grep audit)

## 2. Database — Elaborated Dishes, Dish-Meal Links & Workout Plans

- [x] 2.1 Add `elaborated_dishes` table (id, name, description, total_kcal, total_protein, total_carbs, total_fat, servings, created_at)
- [x] 2.2 Add `dish_ingredients` table (dish_id FK → elaborated_dishes, food_item_id FK → food_items, grams) with CASCADE DELETE on dish_id
- [x] 2.3 Add `meal_dish_options` table (meal_template_id FK → meal_templates, dish_id FK → elaborated_dishes, sort_order) — links dishes at meal level
- [x] 2.4 Add `workout_plans` table (id, name, min_sessions INT, max_sessions INT, created_at)
- [x] 2.5 Add `workout_plan_days` table (id, plan_id FK, day_number, focus_area, exercise_ids TEXT)
- [x] 2.6 Add `practical_examples TEXT` column to `exercise_library` table
- [x] 2.7 Expand `sport_activities.sport_type` to support all HealthSync activity types (running, cycling, walking, swimming, yoga, HIIT, strength, football, paddle, boxing, other)
- [x] 2.8 Add seed data for flexible split plans (2x–6x/week) with exercises from library
- [x] 2.9 Add IPC handlers for elaborated dishes CRUD (saveDish, getDishes, getDishIngredients, deleteDish)
- [x] 2.10 Add IPC handlers for meal_dish_options (linkDishToMeal, getDishesForMeal, unlinkDish)
- [x] 2.11 Add IPC handlers for workout plans (getWorkoutPlans, getPlanDays, activatePlan, complementDay)
- [x] 2.12 Expose new IPC methods in preload.js

## 3. Apple Health XML Import (HealthSync CLI)

- [x] 3.1 Download/install `healthsync` binary via curl script or bundled release
- [x] 3.2 Create `db:importAppleHealthXML` IPC handler that spawns `healthsync parse exportar.xml` via child_process.execFile
- [x] 3.3 Create migration script that reads `~/.healthsync/healthsync.db` and maps tables → app schema (steps, active_energy, basal_energy, resting_heart_rate, sleep, body_mass, workouts)
- [x] 3.4 Implement real-time progress parsing from healthsync stdout
- [x] 3.5 Handle duplicate detection — INSERT OR IGNORE, report skipped counts
- [x] 3.6 Add import button "Importar desde Apple Health" on activity view with progress bar
- [x] 3.7 Show import completion summary (records created, skipped, errors)
- [x] 3.8 Ensure historical data is never modified after import

## 4. Activities Page Redesign — Card Layout & Multi-Select

- [x] 4.1 Redesign activity view with card-based layout for sport sessions
- [x] 4.2 Create pre-defined session card templates per sport type (cycling, boxing, HIIT, walking, football, paddle)
- [x] 4.3 Add multi-select checkboxes on sport session cards
- [x] 4.4 Implement batch creation of sport-activity records from multi-selected cards
- [x] 4.5 Preserve existing CSV import and manual entry functionality alongside new card UI

## 5. Diet Page — Elaborated Dishes & Friendlier UI

- [x] 5.1 Add dish card component showing name, total macros, expandable ingredient list
- [x] 5.2 Wire dish cards into diet view at meal level (franja), linked via meal_dish_options
- [x] 5.3 When a dish is selected for a meal, replace individual component slot picks with dish macros
- [x] 5.4 Add dish manager UI (create, edit, delete, link to meal) with cascade delete
- [x] 5.5 Redesign food item browser with category filters, search bar, card layout
- [x] 5.6 Add smart defaults for new food form based on selected category

## 6. Daily Plan Redesign — Pre-Loaded Meal Cards

- [x] 6.1 Redesign daily plan view with pre-loaded cards for each of 5 meals
- [x] 6.2 Show swap/option selection UI within each meal card
- [x] 6.3 Display elaborated dishes as options within meal cards
- [x] 6.4 Preserve gram adjustment and real-time macro recalculation in new layout
- [x] 6.5 Ensure daily plan auto-creates with template defaults when first opened for a date

## 7. Training Plans — Flexible Frequency Splits

- [x] 7.1 Add frequency selector UI (2–6 días) in training view
- [x] 7.2 Implement split auto-generation based on chosen frequency (2x→Upper/Lower, 3x→Push/Pull/Legs, etc.)
- [x] 7.3 Show day-by-day cards with muscle group focus, equipment, and practical examples
- [x] 7.4 Implement "Usar este plan" to activate a plan as current routine
- [x] 7.5 Implement "Agregar ejercicio" to complement a day with filtered exercise library
- [x] 7.6 Pre-fill session logging flow with plan's day exercises
- [x] 7.7 Preserve existing custom routine creation alongside generated plans

## 8. Documentation — README Translation

- [x] 8.1 Translate README.md to Spanish, covering project description, setup, architecture
