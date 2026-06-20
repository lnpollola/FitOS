## 1. Bug Fixes

- [ ] 1.1 Fix typo in import XML path: `apple-healt-export` → `apple-health-export` in `activity.js:132` and locale key `importReference`
- [ ] 1.2 Fix typo `duration_min` → `duration_minutes` in `activity.js:252` (sport type map)
- [ ] 1.3 Fix memory leak in `adaptive.js:261`: store chart instance on `window._energyChart` so `destroyAllCharts()` can clean it
- [ ] 1.4 Fix IPC listener leak in `activity.js:117-122`: save reference to `onHealthImportProgress` callback and call `api.removeHealthImportProgressListener` on view cleanup
- [ ] 1.5 Fix duplicate `getWeightStats` call in `dashboard.js:57,60-61`: remove first unused call from `Promise.all`
- [ ] 1.6 Fix steps averages in `dashboard.js:162-164`: compute `steps7d`, `steps15d`, `steps1m` over correct sub-ranges instead of full range

## 2. Hardcoded Strings — Activity View

- [ ] 2.1 Add new locale keys to `locales/es.js` for: month names array, navigation buttons (prev/next month), install/progress button texts
- [ ] 2.2 Replace hardcoded month names array in `activity.js:361` with locale key reference
- [ ] 2.3 Replace hardcoded navigation button texts (`‹ Mes ant.` / `Mes sig. ›`) in `activity.js:235,237,260,262` with locale keys
- [ ] 2.4 Replace hardcoded install button texts (`Instalar HealthSync` / `Instalando...`) in `activity.js:17,110,114` with locale keys
- [ ] 2.5 Replace hardcoded import progress text (`Importando datos de Apple Health...`) in `activity.js:135` with locale key
- [ ] 2.6 Fix `formatSleep()` in `activity.js:182-187` to use existing `strings.activity.sleepFormat` locale key instead of hardcoded `${h}h ${m}m`

## 3. Hardcoded Strings — Dashboard View

- [ ] 3.1 Add new locale keys to `locales/es.js` for dashboard unit suffixes (`kg`, `ms`, `bpm`, `h`, `km`, `min`, `%`)
- [ ] 3.2 Replace hardcoded units in `dashboard.js:93,99,111,112,117,125,133,170,178` with locale key references

## 4. Error Handling — IPC Calls

- [ ] 4.1 Add try/catch or `.catch()` to all unprotected IPC calls in `activity.js` (10+ calls)
- [ ] 4.2 Add try/catch or `.catch()` to all unprotected IPC calls in `dashboard.js` (5+ calls)

## 5. Sleep Data — IPC Handler

- [ ] 5.1 Add `db:getSleepData(from, to)` handler in `ipc-handlers.js` that queries `activity_days.sleep_hours` with date range, returns array + 7d trailing average
- [ ] 5.2 Add `getSleepData` bridge method in `preload.js`

## 6. Sleep Card — Dashboard

- [ ] 6.1 Add sleep locale keys to `locales/es.js` (`sleepAvg`, `sleepLabel`, `sleepOptimal`, `sleepAdjust`, `sleepTitle`)
- [ ] 6.2 Add sleep card rendering in `dashboard.js`: average hours + 7d trailing average + trend arrow + compliance indicator (green "Óptimo" / yellow "Ajustar")
- [ ] 6.3 Handle empty state: show "--" when no sleep data exists

## 7. Final Verification

- [ ] 7.1 Run build — verify passes
- [ ] 7.2 Verify all 6 bugs are fixed (check each by code review)
- [ ] 7.3 Verify hardcoded strings replaced in activity.js and dashboard.js
- [ ] 7.4 Verify sleep card renders on dashboard with data and empty state
- [ ] 7.5 Verify error handling prevents silent failures on IPC errors
- [ ] 7.6 Check no untranslated strings in modified views
