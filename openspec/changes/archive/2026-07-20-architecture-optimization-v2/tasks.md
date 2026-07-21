## 1. Repository Hygiene & Script Fixes

- [x] 1.1 Fix `scripts/rebuild-for-web.js:7` path resolution: `path.join(__dirname, '..')`
- [x] 1.2 Fix `scripts/rebuild-for-electron.js:7` path resolution: `path.join(__dirname, '..')`
- [x] 1.3 Extract shared Electron-mock bootstrap to `scripts/lib/electron-mock.js` and deduplicate `sync-healthsync.js` + `reset-healthsync.js`
- [x] 1.4 `git rm --cached .current-mode` and add to `.gitignore`
- [x] 1.5 Move stale root docs to `docs/history/`: `Modelo_DietaRes.md`, `Rutinas_Fuerza_GYM.md`, `PersonalPollo.md`, `Newpanels.md`
- [x] 1.6 Remove stale `design-system/` directory (empty `pages/`, unreferenced)
- [x] 1.7 Bump `package.json` version to `0.7.0` and move `lucide` from devDependencies to dependencies
- [x] 1.8 Add `'tests/regression/**/*.test.js'` to `vitest.config.js` include array
- [x] 1.9 Create `tests/smoke/sleep.test.js` following existing smoke-test pattern
- [x] 1.10 Run `npm test` and confirm 299+ tests pass + regression tests execute

## 2. Dead Handler Removal + AGENTS.md

- [x] 2.1 Remove `db:getSportActivities`, `db:saveSportActivity`, `db:saveActivityDay`, `db:importActivityCSV`, `db:getWeeklySportSummary` from `activity-handlers.js`
- [x] 2.2 Remove `db:getSleepData` from `dashboard-handlers.js`
- [x] 2.3 Remove `db:getTrendWeight` from `settings-handlers.js`
- [x] 2.4 Remove `db:getDishesForMeal`, `db:unlinkDish` from `diet-handlers.js`
- [x] 2.5 Remove `db:getExercisesByIds` from `training-handlers.js`
- [x] 2.6 Remove `db:setLastImportTimestamp` from `settings-handlers.js`
- [x] 2.7 Imports in `api-handlers.js`/`ipc-handlers.js` still valid (handler files still exist, just registered fewer channels)
- [x] 2.8 Update `AGENTS.md` to reflect removed handlers and architecture changes
- [x] 2.9 Run `npm test` and confirm all tests pass

## 3. Icon Audit Fix

- [x] 3.1 Add missing imports in `src/renderer/utils/icons.js`: `Info`, `AlertTriangle`, `CheckCircle`, `BadgeCheck`, `Pencil`, `Trash2`, `Archive`, `X`
- [x] 3.2 Register each new icon in `iconRegistry` with its correct string key
- [x] 3.3 Remove dead imports: `Download`, `Upload`, `Menu`, `Zap`, `Lightbulb`, `ScanLine`, `ArrowUpRightFromSquare`, `CircleUser`, `AlertCircle`
- [x] 3.4 Verify each fixed icon renders via `icon('name')` call (goals edit/delete/archive buttons, dashboard info tooltips, strength plateau warnings, PR modal close)
- [x] 3.5 Run `npm test` and confirm all tests pass

## 4. Dead Code Removal

- [x] 4.1 Delete `src/renderer/utils/cache-store.js`
- [x] 4.2 Remove `cacheStore` import and `onDomainChanged` handler from `src/renderer/app.js`
- [x] 4.3 Remove `onDomainChanged` method from `src/preload/preload.js`
- [x] 4.4 Remove `onDomainChanged` no-op from `src/renderer/utils/web-api.js`
- [x] 4.5 Delete `src/renderer/validation.js`
- [x] 4.6 Run `npm test` and confirm all tests pass

## 5. IPC Listener Leak Fix + Data-Changed After Import

- [x] 5.1 In `preload.js`: change `onDataChanged` to use `removeAllListeners('data-changed')` before `on('data-changed', cb)`
- [x] 5.2 Same fix for `onNavigate`: clean previous listener before adding new one
- [x] 5.3 In `settings-handlers.js`: add `if (notifyDomain) notifyDomain("settings")` after successful import + add `notifyDomain` to register() params
- [x] 5.4 Fix `measurements-handlers.js`: add `notifyDomain` to `register()` parameters (was ReferenceError bug)
- [x] 5.5 Run `npm test` and confirm all tests pass

## 6. LIMIT on Unbounded Queries

- [x] 6.1 Add `LIMIT 365` to `activity-handlers.js:69` (`SELECT * FROM activity_days`)
- [x] 6.2 Add `LIMIT 365` to `measurements-handlers.js:6` (`SELECT * FROM measurement_sets`)
- [x] 6.3 Add `LIMIT 365` to `measurements-handlers.js:38` (`SELECT * FROM weight_entries`)
- [x] 6.4 Run `npm test` and confirm all tests pass

## 7. API Bridge Unification

- [x] 7.1 Create `src/shared/api-channels.js` manifest with all channels, methods, arg counts, and optional platform exclusions
- [x] 7.2 Create `scripts/generate-api-bridge.js` that reads the manifest and outputs `preload.js` + `web-api.js` with manual section markers (`// __MANUAL_START__`/`__MANUAL_END__`)
- [x] 7.3 Mark manual blocks in `preload.js` (event subscriptions: `onNavigate`, `onDataChanged`, `onHealthImportProgress`) and `web-api.js` (event no-ops, `exportData`/`importData` with file picker)
- [x] 7.4 Run generator and verify generated files match existing API surface
- [x] 7.5 Create `tests/unit/api-bridge.test.js` that runs generator in memory and asserts match with checked-in files
- [x] 7.6 Run `npm test` and confirm all tests pass (drift test included)

## 8. Chart Lifecycle Manager

- [x] 8.1 Create `src/renderer/charts/chart-manager.js` with `createChart`, `getChart`, `destroyChart`, `destroyAllCharts` using a `Map` registry
- [x] 8.2 Create `tests/unit/chart-manager.test.js` with mocked Chart constructor covering create/get/destroy/destroyAll and recreate-with-same-id
- [x] 8.3 Migrate `app.js`: replace `destroyAllCharts()` window-key scanning with import from chart-manager
- [x] 8.4 Migrate `analytics.js`: replace 8 `window._*Chart` + `new Chart()` with manager calls
- [x] 8.5 Migrate `activity.js`: replace 1 `window._weeklyChart` with manager call
- [x] 8.6 Migrate `measurements.js`: replace 4 `window._*Chart` with manager calls
- [x] 8.7 Migrate `training.js`: replace 1 `window._progChart` with manager call
- [x] 8.8 Migrate `adaptive.js`: replace 1 `window._recompChart` with manager call
- [x] 8.9 Migrate `insights.js`: replace 2 `window._insights*Chart` with manager calls
- [x] 8.10 Migrate `sleep.js`: replace 2 `window._sleep*Chart` with manager calls
- [x] 8.11 Migrate `panels/strength-insights-panels.js`: replace 1 `window._tonnageChart` with manager call
- [x] 8.12 Remove chart lifecycle section from `AGENTS.md` (window global convention no longer applicable)
- [x] 8.13 Run `npm test` and confirm all tests pass

## 9. Shared Formatters

- [x] 9.1 Create `src/renderer/utils/formatters.js` with `formatNumber`, `formatDateShort`, `formatDateLong`, `formatDateRange`, `formatDuration`, `formatKcal`, `escapeHtml`
- [x] 9.2 Re-export existing formatters from `kpi-derivation.js` via `formatters.js`
- [x] 9.3 Create `tests/unit/formatters.test.js` covering all exported functions with edge cases
- [x] 9.4 Migrate `activity.js`: replace 8 `toLocaleDateString`/`toLocaleString` with shared formatters
- [x] 9.5 Migrate `dashboard.js`: replace 10 inline locale calls with shared formatters
- [x] 9.6 Migrate `measurements.js`: replace inline + `formatDelta` local helper with shared formatters
- [x] 9.7 Migrate `analytics.js`: replace 2 inline locale calls with shared formatters
- [x] 9.8 Migrate `panels/strength-insights-panels.js`: replace 5 inline locale calls with shared formatters
- [x] 9.9 Migrate `panels/strava-panels.js`: replace `formatPrTime`/`formatPrValue` local helpers with shared formatters
- [x] 9.10 Migrate `goals.js`: replace local `escapeHtml` with shared formatter
- [x] 9.11 Update `kpi-derivation.test.js` if needed (re-exports should passthrough)
- [x] 9.12 Run `npm test` and confirm all tests pass

## 10. CSS Deduplication

- [x] 10.1 Inventory all 72 duplicated class names across the 7 CSS files, noting which definition wins by `main.css` import order
- [x] 10.2 Remove duplicate definitions from non-canonical files per domain rule (cards→cards.css, forms→forms.css, etc.)
- [x] 10.3 For identical duplicates: remove all but the domain-file copy
- [x] 10.4 For conflicting duplicates: retain the winning rule (by current import order) in the correct domain file
- [x] 10.5 Create `tests/unit/css-uniqueness.test.js` that parses `styles/*.css` and fails on cross-file duplicate class definitions
- [x] 10.6 Manual visual verification: load each view and check no rendering regression
- [x] 10.7 Run `npm test` and confirm all tests pass

## 11. Router Lazy Loading

- [x] 11.1 Convert view registry in `app.js` from static imports to loader functions using `import()`
- [x] 11.2 Update `showView()` to async: await loader before calling `init()`
- [x] 11.3 Add guard for rapid navigation during loading (flag to discard stale resolves)
- [x] 11.4 Add try/catch with error state rendering (`renderStateCard` with retry) on import failure
- [x] 11.5 Verify dashboard lazy loads on first call (not at module parse time)
- [x] 11.6 Create `tests/unit/router-lazy.test.js` for loader map and stale-load guard
- [x] 11.7 Run `npm test` and confirm all tests pass

## 12. safeHandle Wrapper + Handler Standardization

- [x] 12.1 Create `src/main/utils/safe-handler.js` (CJS) with `safeHandle(ipc, channel, handler)` function
- [x] 12.2 Create `tests/unit/safe-handler.test.js` covering success, error, and error logging
- [x] 12.3 Fix `measurements-handlers.js`: add `notifyDomain` to `register()` parameters
- [x] 12.4 Migrate `profile-handlers.js`: wrap handlers with safeHandle
- [x] 12.5 Migrate `measurements-handlers.js`: wrap handlers with safeHandle
- [x] 12.6 Migrate `energy-handlers.js`: wrap handlers with safeHandle
- [x] 12.7 Migrate `dashboard-handlers.js`: wrap handlers with safeHandle
- [x] 12.8 Migrate `settings-handlers.js`: wrap handlers with safeHandle
- [x] 12.9 Migrate `goals-handlers.js`: wrap handlers with safeHandle
- [x] 12.10 Migrate `activity-handlers.js`: wrap handlers with safeHandle
- [x] 12.11 Migrate `diet-handlers.js`: wrap handlers with safeHandle
- [x] 12.12 Migrate `training-handlers.js`: wrap handlers with safeHandle
- [x] 12.13 Migrate `health-handlers.js`: replace 26 individual try/catch blocks with safeHandle
- [x] 12.14 Migrate `strava-panels-handlers.js`: wrap handlers with safeHandle
- [x] 12.15 Migrate `insights-handlers.js`: wrap handlers with safeHandle
- [x] 12.16 Migrate `strength-insights-handlers.js`: wrap handlers with safeHandle
- [x] 12.17 Standardize all `register()` signatures to `(ipc, getDb, getHS, notifyDomain)` removing underscore prefixes
- [x] 12.18 Run `npm test` and confirm all tests pass
