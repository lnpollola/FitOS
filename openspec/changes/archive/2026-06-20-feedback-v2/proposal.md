## Why

Real usage after feedback-v0 and feedback-v1, plus a thorough codebase exploration, revealed bugs and architecture issues beneath the surface: orphaned code, broken DOM selectors, incorrect database queries, incomplete export/import, missing CRUD operations, duplicated logic, and unpopulated meal template data from the PDF.

## What Changes

### Part 1 — Bugs

- **Merge orphaned energy.js into adaptive.js**: `energy.js` has the BMR + sport + NEAT TDEE breakdown that `adaptive.js` lacks. The router maps `data-view="energy"` to `adaptive.js`, making `energy.js` dead code. Merge the TDEE breakdown display into `adaptive.js` and delete `energy.js`.
- **Fix recalcTotals() in diet.js**: The function selects DOM elements with `closest('tr')` but the daily plan uses `<div>` layout — silently broken. Rewrite selectors and fix element ID references.
- **Fix db:getTrendWeight ORDER BY**: Uses `ORDER BY date ASC` returning the oldest 14 entries instead of the most recent.
- **Fix export/import missing 5 tables**: `elaborated_dishes`, `dish_ingredients`, `meal_dish_options`, `workout_plans`, `workout_plan_days` are omitted from backup/restore, causing data loss.
- **Resolve training_routine_days orphan**: Table exists with no IPC handlers or UI. Either add minimal support or drop via migration.
- **Fix English category labels**: Food filter shows "breads/grains", "proteins" etc. in English instead of Spanish.
- **Fix profile.js async**: `init()` uses `await` without `async` keyword.

### Part 2 — Architecture

- **Extract shared utilities**: `calculateBodyFat()`, `SPORT_ICONS`, and `getRangeDates()` are duplicated across views. Extract into shared modules.
- **Seed meal_components + meal_options from Modelo_DietaRes.md**: The PDF extraction specifies exact gram amounts per slot. Populate these into the DB so meal templates are functional.
- **Add delete IPC handlers**: Implement delete for `weight_entries`, `measurement_sets`, `training_sessions`, `training_sets`, `exercise_library`.
- **Remove dead code**: `db:getRecompData` handler is registered and exposed but never called. Remove it.

## Capabilities

### New Capabilities
(None — feedback-v3 adds new capabilities)

### Modified Capabilities
- `energy-balance`: Merge energy.js TDEE breakdown into adaptive.js; delete energy.js; remove dead db:getRecompData handler
- `diet-plan-management`: Seed meal_components + meal_options from Modelo_DietaRes.md; fix recalcTotals(); fix English category labels; add delete handlers
- `desktop-app`: Fix export/import (add 5 missing tables); fix profile.js async; extract shared utilities; resolve training_routine_days orphan
- `activity-ingestion`: Fix db:getTrendWeight ORDER BY

## Impact

- **Frontend**: Diet view gets populated meal templates (was empty shells). Energy balance view gets TDEE breakdown. Food category labels in Spanish. Delete buttons with confirmation in measurements/training.
- **Backend**: New delete IPC handlers. Removed dead db:getRecompData. Fixed export/import data model. Fixed getTrendWeight query.
- **Database**: `meal_components` and `meal_options` tables populated from PDF data. Potential migration for training_routine_days.
- **Utilities**: Three new shared modules replacing duplicated code.
- **Removals**: energy.js file deleted. db:getRecompData handler removed.
