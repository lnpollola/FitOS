## Context

A thorough codebase exploration revealed bugs and architecture issues beneath the surface of the existing 7 views:

- `energy.js` (71 lines) is dead code — the router maps `data-view="energy"` to `adaptive.js`, not `energy.js`
- `recalcTotals()` in `diet.js` uses `closest('tr')` on a `<div>`-based DOM — silently broken
- `db:getTrendWeight` at ipc-handlers.js orders by `date ASC` instead of `DESC`, returning the oldest 14 weight entries
- 5 tables are missing from export/import, creating data-loss risk for elaborated dishes and workout plans
- `training_routine_days` has no IPC handlers and no UI — completely orphaned
- `calculateBodyFat()`, `SPORT_ICONS`, and `getRangeDates()` are duplicated across 2-3 views each
- `meal_templates` are seeded as empty names with NO `meal_components` or `meal_options` — the PDF data in `Modelo_DietaRes.md` was never loaded into the DB
- 7+ entities lack delete handlers

## Goals / Non-Goals

**Goals:**
- Merge energy.js TDEE breakdown into adaptive.js; delete energy.js
- Fix recalcTotals() DOM selection and element ID references
- Fix db:getTrendWeight ORDER BY direction (DESC instead of ASC)
- Add 5 missing tables to export/import
- Resolve training_routine_days orphan (add handlers or drop table)
- Translate food category labels to Spanish
- Fix profile.js async declaration
- Extract shared utility functions (calculateBodyFat, SPORT_ICONS, getRangeDates) into modules
- Seed meal_components + meal_options from Modelo_DietaRes.md
- Add delete IPC handlers for weight_entries, measurement_sets, training_sessions, training_sets, exercise_library
- Remove dead db:getRecompData handler

**Non-Goals:**
- No new features or capabilities
- No changes to Dashboard health metrics, session layout, or trend charts (feedback-v3)
- No changes to Activity period comparison or duration fix (feedback-v3)
- No diet 5-column template UI, food DB, or auto-generator (feedback-v3)
- No energy balance recomp/adherence/deficit improvements (feedback-v3)

## Decisions

### 1. Merge energy.js into adaptive.js

energy.js contains a clean TDEE breakdown render function showing BMR, sport calories, step NEAT, and TDEE — which adaptive.js does NOT show despite being mapped to the same view. The merge strategy: copy the render logic from energy.js into adaptive.js's `loadStatus()` as a new sub-section in `#current-status`. After merge, delete energy.js. The old energy.js TDEE breakdown becomes a card within the adaptive planning view.

### 2. Fix recalcTotals() DOM selection

Current code at diet.js:605-649 does:
```js
const input = document.querySelector('.gram-input');  // only gets FIRST
const row = input.closest('tr');                      // null — DOM uses divs
const cells = row.children;                            // crashes
```
Fix: use `document.querySelectorAll('.gram-input')` and iterate with `input.closest('.plan-entry')` or parent data attributes. Write results to existing `plan-total-kcal`, `plan-total-protein`, `plan-total-carbs`, `plan-total-fat` IDs.

### 3. Fix db:getTrendWeight ORDER BY

Current: `SELECT ... ORDER BY date ASC LIMIT 14` → oldest entries.
Fix: `ORDER BY date DESC LIMIT 14`. Reverse client-side if chronological needed.

### 4. Fix export/import — 5 missing tables

Add to import-export.js:
- `elaborated_dishes` + `dish_ingredients` + `meal_dish_options` + `workout_plans` + `workout_plan_days`
- Insert in dependency order (dishes → ingredients, plans → plan_days)
- Use `INSERT OR IGNORE` for idempotent re-import

### 5. training_routine_days resolution

Three options (decision needed during implementation):
a) Add IPC handlers + preload + minimal read display in training.js
b) Drop table via migration
c) Leave as-is (documented dead table)

### 6. English category labels

Food filter renders hardcoded English keys. Fix: use `strings.diet.categories` from es.js with Spanish: `panes`, `proteinas`, `grasas`, `frutas`, `verduras`, `bebidas`.

### 7. profile.js async

Change `function init()` to `async function init()` at profile.js:3. Already uses `await`.

### 8. Extract shared utilities

Create three modules:
- `src/renderer/utils/sport-icons.js` — exports `SPORT_ICONS`, `getSportDisplayName()`
- `src/renderer/utils/body-fat.js` — exports `calculateBodyFat()`
- `src/renderer/utils/date-range.js` — exports `getRangeDates()`
All pure functions. Import in dashboard.js, activity.js, analytics.js, measurements.js, adaptive.js.

### 9. Seed meal_components + meal_options from Modelo_DietaRes.md

The PDF extraction defines exact slot structures never loaded into DB:
- For each meal template, create `meal_components` with `food_item_id`, `default_grams` (training day), `sort_order`
- Need a `restday_grams` column (schema migration) for rest day amounts
- Create `meal_options` linking components to matching seed foods (e.g., breakfast carb → pan_blanco, pan_integral, tortas_arroz, harina_avena)
- Add to `seedIfEmpty()` in seed-data.js
- See Appendix A for full mapping

### 10. Add delete IPC handlers

| Table | Handler | preload key |
|---|---|---|
| `weight_entries` | `db:deleteWeightEntry(id)` | `deleteWeightEntry` |
| `measurement_sets` | `db:deleteMeasurementSet(id)` | `deleteMeasurementSet` |
| `training_sessions` | `db:deleteTrainingSession(id)` (cascade sets) | `deleteTrainingSession` |
| `training_sets` | `db:deleteTrainingSet(id)` | `deleteTrainingSet` |
| `exercise_library` | `db:deleteExercise(id)` | `deleteExercise` |

All use `DELETE FROM table WHERE id = ?`. Add `confirm()` dialog in UI before delete.

### 11. Remove dead db:getRecompData

Handler registered and exposed but never called. Remove from ipc-handlers.js and preload.js.

## Risks / Trade-offs

- **energy.js merge**: The render function expects a specific DOM structure. Mitigation: test each card independently before deleting energy.js.
- **Seeding meal components**: Currently diet view shows empty templates. After seeding, slots appear with food options. Test for regressions.
- **Delete handlers**: Hard DELETE without undo. Mitigation: add `confirm()` dialog.
- **Export/import change**: Old backups lack the 5 new tables. Mitigation: backward-compatible import (tables optional, INSERT OR IGNORE).
- **training_routine_days**: Decision needed. If we keep it, need IPC + preload + UI. If we drop, need migration.

## Appendix A — Meal Component Seed Mapping from Modelo_DietaRes.md

```
DESAYUNO (meal_template_id=1)
  carb_slot (sort=1): weekday=100g, restday=70g → pan_blanco, pan_integral, harina_avena, tortas_arroz, tortas_maiz
  protein_slot (sort=2): weekday=120g, restday=50g → jamon_cocido, fiambre_pavo, fiambre_pollo, jamon_serrano, lomo_embuchado, claras_huevo
  fat_slot (sort=3): weekday=10g, restday=10g → aceite_oliva, aguacate, frutos_secos, crema_cacahuete
  extra_slot (sort=4): no grams → te_verde, cafe, bebida_vegetal

MEDIA MAÑANA (meal_template_id=2)
  carb_slot: 30g/30g → harina_avena
  protein_slot: 10g/10g → proteina_polvo
  fat_slot: 15g/15g → frutos_secos
  extra_slot: 300ml/300ml → bebida_vegetal

COMIDA (meal_template_id=3)
  carb_slot: 60g/60g → arroz_blanco, pasta_integral, quinoa, patata, boniato, legumbres
  protein_slot: 150g/150g → pechuga_pollo, pechuga_pavo, pescado_azul, pescado_blanco, huevos, carne_roja
  vegetable_slot: free → verduras_variadas
  fruit_slot: 1 piece → manzana, platano, naranja
  fat_slot: 10g/10g → aceite_oliva, aguacate

MERIENDA (meal_template_id=4)
  carb_slot: 50g/30g → crema_arroz, harina_avena, corn_flakes
  protein_slot: 20g/20g → proteina_polvo, jamon_cocido, fiambre_pavo
  fat_slot: 15g/20g → frutos_secos, aguacate
  fruit_slot: 100-150g → manzana, platano, naranja

CENA (meal_template_id=5)
  carb_slot: 200g/60-100g → patata, boniato, pasta, pan
  protein_slot: 150g/150g → similar to comida
  vegetable_slot: free → verduras_variadas
  fat_slot: 10g/10g → aceite_oliva, aguacate, queso
  extra_slot: optional → yogur_natural, chocolate_85
```
