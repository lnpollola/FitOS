## 1. Bug Fixes

### Original v5 Bugs
- [x] 1.1 Fix typo in import XML path: `apple-healt-export` → `apple-health-export` in `activity.js:132` and locale key `es.js:100`
- [x] 1.2 Fix typo `duration_min` → `duration_minutes` in `activity.js:252`
- [x] 1.3 Fix memory leak in `adaptive.js:261`: store chart instance on `window._energyChart` so `destroyAllCharts()` can clean it
- [x] 1.4 Fix IPC listener leak in `activity.js:117-122`:
  - Save callback reference to a variable
  - Add `removeHealthImportProgressListener` in `preload.js`
  - Call it on view cleanup
  - Add cleanup pattern in `app.js` (call view cleanup on navigation if available)
- [x] 1.5 Fix duplicate `getWeightStats` call in `dashboard.js:57` (first call in Promise.all is unused; remove it)
- [x] 1.6 Fix steps averages in `dashboard.js:162-164`: use `dailyData.slice(-7)`, `dailyData.slice(-15)`, and full array for 7d, 15d, 1m averages respectively

### Audit Discovered Bugs
- [x] 1.7 Fix empty if-block in `diet.js:427-431`: implement actual deletion of existing plan entries before recreating, or remove the empty block
- [x] 1.8 Fix grams not persisted in `diet.js:629-634`: add `api.saveDailyPlanEntry()` call in the grams change handler to persist the modification
- [x] 1.9 Fix wrong session reference in `training.js:218`: use the `session` object returned by `api.saveTrainingSession()` on line 211 instead of assuming `sessions[0]` is the new one
- [x] 1.10 Fix dangling promises in `profile.js:106-107`: add `.catch(() => null)` to `api.exportData()` and `api.importData()` calls
- [x] 1.11 Fix wrong confirm dialog message in `measurements.js:220`: replace `strings.importExport.confirmImport` with correct locale key for measurement deletion
- [x] 1.12 Fix `||` vs `??` in `adaptive.js:81`: use `??` instead of `||` for `balance?.tdee` fallback
- [x] 1.13 Fix actual loss rate in `adaptive.js:137`: compute rate using last 14 days' data instead of all-time first/last weight entry

## 2. IPC Error Handling (safeCall wrapper)

- [x] 2.1 Create `src/renderer/utils/safe-call.js` with:
  ```js
  export async function safeCall(promise, fallback = null) {
    try { return await promise; }
    catch (e) { console.error('IPC error:', e); return fallback; }
  }
  ```
- [x] 2.2 Add error handling to ALL IPC calls in `activity.js` (9 protected calls needed — all except `getActivityComparison` which already has `.catch()`)
- [x] 2.3 Add error handling to ALL unprotected IPC calls in `dashboard.js` (1 call: `api.getDashboardData()` on line 53)
- [x] 2.4 Add error handling to ALL unprotected IPC calls in `diet.js` (25 calls listed in audit)
- [x] 2.5 Add error handling to ALL IPC calls in `training.js` (33 calls)
- [x] 2.6 Add error handling to ALL IPC calls in `profile.js` (4 calls)
- [x] 2.7 Add error handling to ALL IPC calls in `measurements.js` (14 calls)
- [x] 2.8 Add error handling to ALL IPC calls in `adaptive.js` (13 calls)

## 3. Chart.js Memory Leaks

- [x] 3.1 Fix chart cleanup in `activity.js`: destroy existing `window._weeklyChart` before creating new one
- [x] 3.2 Fix chart cleanup in `dashboard.js`: destroy existing `window._dashTrendChart` before creating new one
- [x] 3.3 Fix chart cleanup in `analytics.js`: destroy before recreating ALL 8 charts (steps, HR, energy, HRV, sleep, activity ranking, mini charts × 2)
- [x] 3.4 Fix chart cleanup in `adaptive.js`: store chart as `window._recompChart` and destroy before recreating

## 4. Loading Flags Fix

- [x] 4.1 Fix `_loadingTraining` flag in `training.js`: wrap entire `init()` body in `try/finally` to guarantee flag is released
- [x] 4.2 Fix `_loadingMeasurements` flag in `measurements.js`: wrap entire `init()` body in `try/finally` to guarantee flag is released

## 5. Localización Completa

### Activity View
- [x] 5.1 Add new locale keys to `es.js` for: month names array, navigation buttons (prev/next month), install/progress button texts, sleep format
- [x] 5.2 Replace hardcoded month names array in `activity.js:361` with locale key reference
- [x] 5.3 Replace hardcoded navigation button texts (`‹ Mes ant.` / `Mes sig. ›`) in `activity.js:235,237,260,262` with locale keys
- [x] 5.4 Replace hardcoded install button texts (`Instalar HealthSync` / `Instalando...`) in `activity.js:17,110,114` with locale keys
- [x] 5.5 Replace hardcoded import progress text (`Importando datos de Apple Health...`) in `activity.js:135` with locale key
- [x] 5.6 Fix `formatSleep()` in `activity.js:182-187` to use existing `strings.activity.sleepFormat` key

### Dashboard View
- [x] 5.7 Add new locale keys to `es.js` for dashboard unit suffixes (`kg`, `ms`, `bpm`, `h`, `km`, `min`, `%`) and sleep card strings
- [x] 5.8 Replace hardcoded units in `dashboard.js:93,99,111,112,117,125,133,170,178` with locale key references

### Diet View
- [x] 5.9 Add new locale keys to `es.js` for: food database table headers (Nombre, Gramos, kcal, P, C, G), form labels (Fecha, Añadir), macro prefixes (P:, C:, G:), empty states, separators
- [x] 5.10 Replace hardcoded table headers in `diet.js:235,775,821` with locale key references
- [x] 5.11 Replace hardcoded macro labels in `diet.js:101-104,310-314,581,606-608,622,733-735,739` with locale key references
- [x] 5.12 Replace hardcoded form labels and buttons in `diet.js:93,194,294,317,556,588,591` with locale key references

### Training View
- [x] 5.13 Add missing locale keys to `es.js`: `training.all`, `general.sort`, `training.exercises`, plus keys for table headers, confirm dialogs, button texts
- [x] 5.14 Replace hardcoded strings in `training.js:24,146,155,158,177,251,253,340,353,458,465,501,517,519,526,598-600,609` with locale key references
- [x] 5.15 Remove redundant `|| '...'` fallbacks in `training.js` where locale key already exists

### Profile View
- [x] 5.16 Add new locale keys to `es.js` for: `profile.availableMetrics`, `profile.availableMetricsDesc`, plus health metric names from unusedMetrics array
- [x] 5.17 Replace hardcoded unusedMetrics array in `profile.js:60-68` with locale key references

### Adaptive View
- [x] 5.18 Add new locale keys to `es.js` for: table headers (Fecha, Ritmo, Déficit Objetivo, Déficit Actual, Brecha)
- [x] 5.19 Replace hardcoded table headers in `adaptive.js:428` with locale key references
- [x] 5.20 Replace hardcoded `kg/sem` in `adaptive.js:432` with `strings.adaptive.kgPerWeek`

### Measurements View
- [x] 5.21 Replace hardcoded `'Fecha'` in `measurements.js:188` with `strings.measurements.date`
- [x] 5.22 Fix confirm dialog message in `measurements.js:220` (use correct locale key instead of `strings.importExport.confirmImport`)

## 6. Sleep Card

- [x] 6.1 Add `db:getSleepData(from, to)` handler in `ipc-handlers.js` that queries `activity_days.sleep_hours` with date range, returns `{ ok, data: [{ date, sleep_hours }], avg7d }`
- [x] 6.2 Add `getSleepData` bridge method in `preload.js`
- [x] 6.3 Add sleep locale keys to `es.js` (`sleepAvg`, `sleepLabel`, `sleepOptimal`, `sleepAdjust`, `sleepTitle`)
- [x] 6.4 Add sleep card rendering in `dashboard.js`: average hours + 7d trailing average + trend arrow + compliance indicator
- [x] 6.5 Handle empty state: show "--" when no sleep data exists

## 7. BMR Duplication Fix

- [x] 7.1 Replace duplicated Mifflin-St Jeor BMR calculation in `adaptive.js:73-77` with an IPC call `db:calculateBMR(profile)` or use a shared imported function

## 8. Automated Tests

- [x] 8.1 Install vitest + jsdom: `npm install -D vitest jsdom`
- [x] 8.2 Create `vitest.config.js` with Vite-compatible config, jsdom environment
- [x] 8.3 Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts to `package.json`
- [x] 8.4 Create `tests/` directory structure

### Smoke Tests
- [x] 8.5 Write smoke test for `activity.js`: mock `window.electronAPI`, call `init()`, verify no crash
- [x] 8.6 Write smoke test for `dashboard.js`: mock electronAPI, call `init()`, verify no crash
- [x] 8.7 Write smoke test for `diet.js`: mock electronAPI, call `init()`, verify no crash
- [x] 8.8 Write smoke test for `training.js`: mock electronAPI, call `init()`, verify no crash
- [x] 8.9 Write smoke test for `profile.js`: mock electronAPI, call `init()`, verify no crash
- [x] 8.10 Write smoke test for `measurements.js`: mock electronAPI, call `init()`, verify no crash
- [x] 8.11 Write smoke test for `adaptive.js`: mock electronAPI, call `init()`, verify no crash
- [x] 8.12 Write smoke test for `analytics.js`: mock electronAPI, call `init()`, verify no crash

### Regression Tests
- [x] 8.13 Write regression test for `safeCall()` utility: verify it catches errors and returns fallback
- [x] 8.14 Write regression test for BMR calculation fix (adaptive.js): verify it uses correct formula
- [x] 8.15 Write regression test for loading flags: verify flag is always released after init() even on error
- [x] 8.16 Write regression test for sleep data IPC handler: verify query returns correct structure

### Unit Tests
- [x] 8.17 Write unit tests for `locales/es.js` utility functions: `getSportDisplayName()`, `getMeasurementLabel()`

## 9. Final Verification

- [x] 9.1 Run `npm test` — all tests pass
- [x] 9.2 Run `npm run dev:web` — app loads without errors in browser console
- [x] 9.3 Verify all 6 original bugs are fixed (code review each)
- [x] 9.4 Verify all audit-discovered bugs are fixed (code review each)
- [x] 9.5 Verify hardcoded strings replaced in all 8 views
- [x] 9.6 Verify sleep card renders on dashboard with data and empty state
- [x] 9.7 Verify error handling prevents silent failures on IPC errors
- [x] 9.8 Verify Chart.js destroy pattern is applied in all 4 files (activity, dashboard, analytics, adaptive)
- [x] 9.9 Verify `_loading*` flags are released on error in training.js and measurements.js
- [x] 9.10 Check no untranslated strings in any view
