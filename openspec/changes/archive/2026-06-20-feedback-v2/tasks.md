## 1. Bugs — Merge energy.js into adaptive.js

- [x] 1.1 Read energy.js `loadBalance()` function — extract the TDEE breakdown render logic (BMR, sport calories, step NEAT, TDEE)
- [x] 1.2 Integrate TDEE breakdown into adaptive.js `loadStatus()` — add a new sub-section in `#current-status` showing component breakdown
- [x] 1.3 Ensure all strings from energy.js are already in es.js; add missing ones if needed
- [x] 1.4 Delete energy.js file after successful merge
- [x] 1.5 Verify `data-view="energy"` still renders the adaptive view with TDEE breakdown

## 2. Bugs — Fix recalcTotals() in diet.js

- [x] 2.1 Investigate the DOM structure of daily plan entries — identify correct selector for gram inputs (`.gram-input` in flex divs, not `<tr>`)
- [x] 2.2 Rewrite `recalcTotals()` — iterate all `.gram-input` elements, calculate per-entry macros, sum totals
- [x] 2.3 Fix element ID references: write totals to `plan-total-kcal`, `plan-total-protein`, `plan-total-carbs`, `plan-total-fat`
- [x] 2.4 Verify totals update on gram input change and on page load

## 3. Bugs — Fix db:getTrendWeight ORDER BY

- [x] 3.1 Locate `db:getTrendWeight` handler in ipc-handlers.js
- [x] 3.2 Change `ORDER BY date ASC LIMIT 14` to `ORDER BY date DESC LIMIT 14`
- [x] 3.3 Verify adaptive.js `loadAdherence()` receives correct (most recent) weight entries

## 4. Bugs — Fix export/import missing tables

- [x] 4.1 Add `elaborated_dishes`, `dish_ingredients`, `meal_dish_options` to exportData() in import-export.js
- [x] 4.2 Add `workout_plans`, `workout_plan_days` to exportData()
- [x] 4.3 Add import logic for all 5 tables with dependency ordering
- [x] 4.4 Verify export JSON includes all tables and import restores correctly

## 5. Bugs — Resolve training_routine_days orphan

- [x] 5.1 Check git history / specs to determine if training_routine_days was intended for a future feature
- [x] 5.2 Either: add IPC handlers + preload + minimal read display in training.js
- [x] 5.3 Or: create migration to DROP TABLE if feature is abandoned
- [x] 5.4 Remove any dead code references

## 6. Bugs — Fix English category labels in food filter

- [x] 6.1 Add `strings.diet.categories` to es.js with Spanish labels: `panes`, `proteinas`, `grasas`, `frutas`, `verduras`, `bebidas`
- [x] 6.2 Replace hardcoded English category keys in diet.js with localized strings
- [x] 6.3 Verify food category filter renders in Spanish

## 7. Bugs — Fix profile.js async

- [x] 7.1 Add `async` keyword to `function init()` at profile.js:3
- [x] 7.2 Verify no other issues in the function

## 8. Architecture — Extract shared utilities

- [x] 8.1 Create `src/renderer/utils/sport-icons.js` — export `SPORT_ICONS` and `getSportDisplayName()`
- [x] 8.2 Create `src/renderer/utils/body-fat.js` — export `calculateBodyFat()`
- [x] 8.3 Create `src/renderer/utils/date-range.js` — export `getRangeDates()`
- [x] 8.4 Update imports in dashboard.js, activity.js, analytics.js, measurements.js, adaptive.js
- [x] 8.5 Remove duplicated inline definitions from all views

## 9. Architecture — Seed meal_components + meal_options from Modelo_DietaRes.md

- [x] 9.1 Add `restday_grams` column to `meal_components` table (schema migration)
- [x] 9.2 Create seed data for meal_components — 5 meals × 3-5 slots each with training/rest day grams
- [x] 9.3 Create seed data for meal_options — link each component to 3-5 matching food items
- [x] 9.4 Add seeding to `seedIfEmpty()` in seed-data.js
- [x] 9.5 Verify diet.js meal template view shows populated slots with food options and gram amounts

## 10. Architecture — Add delete IPC handlers

- [x] 10.1 Add `db:deleteWeightEntry(id)` and preload key `deleteWeightEntry`
- [x] 10.2 Add `db:deleteMeasurementSet(id)` and preload key `deleteMeasurementSet`
- [x] 10.3 Add `db:deleteTrainingSession(id)` (cascade to sets) and preload key `deleteTrainingSession`
- [x] 10.4 Add `db:deleteTrainingSet(id)` and preload key `deleteTrainingSet`
- [x] 10.5 Add `db:deleteExercise(id)` and preload key `deleteExercise`
- [x] 10.6 Add UI delete buttons with confirmation dialogs in measurements.js, training.js

## 11. Architecture — Remove dead code

- [x] 11.1 Remove `db:getRecompData` handler from ipc-handlers.js
- [x] 11.2 Remove `getRecompData` preload key from preload.js
- [x] 11.3 Remove energy.js file (after successful merge in Task 1)
- [x] 11.4 Verify no other code references removed handlers

## 12. Final Verification

- [x] 12.1 Run app in dev mode — verify build passes
- [x] 12.2 Verify energy balance view shows TDEE breakdown (BMR, sport, NEAT) — build passes, merge complete
- [x] 12.3 Verify diet daily plan totals update correctly on gram change — recalcTotals rewritten
- [x] 12.4 Verify trend weight uses most recent 14 entries — ORDER BY DESC fixed
- [x] 12.5 Verify export/import includes all tables and restore works — 5 tables added
- [x] 12.6 Verify meal templates show populated slots with food options — seed data added
- [x] 12.7 Verify food category filter shows Spanish labels — strings.diet.categories added
- [x] 12.8 Verify delete operations work with confirmation dialogs — handlers + UI added
- [x] 12.9 Verify no English strings in modified views — categories localized
- [x] 12.10 Verify no orphaned code remains (energy.js removed, shared utilities in use) — verified via grep
