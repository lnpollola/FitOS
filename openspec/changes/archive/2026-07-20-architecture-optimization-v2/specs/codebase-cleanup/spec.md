# Codebase Cleanup (delta)

## MODIFIED Requirements

### Requirement: Remove 25 unused preload APIs

The system SHALL NOT expose the following 25 preload API methods in `src/preload/preload.js`: `getSleepData`, `getHealthSleep`, `getHealthHRV`, `getHealthBodyMass`, `getHealthHRVWeekly`, `getHealthHeartRateDaily`, `getHealthStats`, `syncHealthToApp`, `getHealthBloodPressure`, `getHealthStandingHours`, `getHealthExerciseTime`, `getHealthWalkingDistance`, `getHealthSpO2Range`, `getExercisesByIds`, `unlinkDish`, `getDishesForMeal`, `setLastImportTimestamp`, `getTrendWeight`, `getSportActivities`, `saveSportActivity`, `saveActivityDay`, `getWeeklySportSummary`, `importActivityCSV`. Additionally, the orphaned backend handlers for these channels (those still registered under `db:*`: `db:getSportActivities`, `db:saveSportActivity`, `db:saveActivityDay`, `db:importActivityCSV`, `db:getWeeklySportSummary`, `db:getSleepData`, `db:getTrendWeight`, `db:getDishesForMeal`, `db:unlinkDish`, `db:getExercisesByIds`, `db:setLastImportTimestamp`) SHALL be removed from `src/main/handlers/`, since no caller exists in preload, web-api, or any view.

#### Scenario: Unused preload APIs removed
- **WHEN** the preload script loads
- **THEN** `window.electronAPI` SHALL NOT contain the 25 listed methods
- **THEN** all other preload APIs SHALL continue to function normally

#### Scenario: Orphaned backend handlers removed
- **WHEN** the backend starts
- **THEN** no handler SHALL be registered for the listed orphaned channels
- **THEN** `npm test` SHALL pass with no reference to the removed handlers in renderer code

## ADDED Requirements

### Requirement: Rebuild scripts resolve project root correctly

The mode-switch rebuild scripts (`scripts/rebuild-for-web.js`, `scripts/rebuild-for-electron.js`) SHALL resolve the project root as one directory above `scripts/`, so `npm rebuild better-sqlite3` executes inside the repository.

#### Scenario: Rebuild runs in repo root
- **WHEN** `npm run rebuild:web` or `npm run rebuild:electron` executes
- **THEN** the working directory SHALL be the repository root (containing `package.json`)
- **THEN** the rebuild SHALL complete without "no package.json" errors

### Requirement: Root directory decluttered

The repository root SHALL contain only current documentation (`README.md`, `AGENTS.md`). Historical design documents (`Modelo_DietaRes.md`, `Rutinas_Fuerza_GYM.md`, `PersonalPollo.md`, `Newpanels.md`) SHALL be moved to `docs/history/`. The stale `design-system/` directory (unreferenced, empty `pages/`) SHALL be removed.

#### Scenario: Root contains only live docs
- **WHEN** the repository root is listed
- **THEN** the only markdown files present SHALL be `README.md` and `AGENTS.md`
- **THEN** the historical documents SHALL exist under `docs/history/`

### Requirement: Machine-local state file untracked

The `.current-mode` file SHALL NOT be tracked in git and SHALL be listed in `.gitignore`, so mode switches do not dirty the working tree.

#### Scenario: Mode switch leaves clean tree
- **WHEN** `npm run switch:web` or `npm run switch:electron` runs
- **THEN** `git status` SHALL NOT show `.current-mode` as modified or untracked

### Requirement: Version and dependency classification aligned

`package.json` SHALL declare the version matching the released product (`0.7.0`), and `lucide` (imported at runtime by `src/renderer/utils/icons.js`) SHALL be listed under `dependencies`, not `devDependencies`.

#### Scenario: Version matches release
- **WHEN** `package.json` is read
- **THEN** `version` SHALL equal the version referenced by `README.md` changelog/badge

#### Scenario: Lucide in dependencies
- **WHEN** `package.json` is read
- **THEN** `lucide` SHALL appear in `dependencies`

### Requirement: Remove orphaned cache-store module

The `src/renderer/utils/cache-store.js` module (6 exported utilities, 30-second TTL, EventTarget-based invalidation) SHALL be removed from the codebase because no module reads cached values. All views call API methods directly without checking cacheStore. The `onDomainChanged` event handler in `app.js` SHALL be removed along with the cacheStore import. The `domain-changed` event SHALL be removed from `preload.js` since it has no senders.

#### Scenario: cache-store removed
- **WHEN** the application starts
- **THEN** `src/renderer/utils/cache-store.js` SHALL NOT exist
- **THEN** `app.js` SHALL NOT import `cache-store`
- **THEN** no view or utility SHALL reference `cacheStore` anywhere
- **THEN** all API calls SHALL continue to work as before (cache was never read)

#### Scenario: onDomainChanged removed
- **WHEN** `app.js` loads
- **THEN** `api.onDomainChanged()` SHALL NOT be called
- **THEN** `preload.js` SHALL NOT export an `onDomainChanged` method
- **THEN** `web-api.js` SHALL NOT define an `onDomainChanged` no-op

### Requirement: Remove unused validation module

The `src/renderer/validation.js` module (52 lines, exports `addFormValidation`) SHALL be removed because no view imports or uses it. Each view performs validation inline.

#### Scenario: validation.js removed
- **WHEN** the source tree is inspected
- **THEN** `src/renderer/validation.js` SHALL NOT exist
- **THEN** no import statement referencing `../validation.js` or `./validation.js` SHALL exist

### Requirement: Fix IPC listener leak

The `onDataChanged` and `onNavigate` listeners in `app.js` SHALL NOT accumulate across view re-initializations. Each time `showView` is called, the previous listener SHALL be removed before adding the new one, using `removeAllListeners('data-changed')` and `removeAllListeners('navigate')` on the IPC channel.

#### Scenario: No duplicate listeners after navigation
- **GIVEN** the user navigates between views 10 times
- **WHEN** `data-changed` fires once
- **THEN** only one listener SHALL execute, not 10

### Requirement: Emit data-changed after IPC import

The IPC import handler in `settings-handlers.js` SHALL emit `notifyDomain("settings")` after a successful import, so the UI does not remain stale.

#### Scenario: UI refreshes after import
- **WHEN** the user triggers an import via IPC
- **THEN** `notifyDomain("settings")` SHALL be called after the import transaction commits
- **THEN** the view SHALL re-render with the imported data

### Requirement: LIMIT on unbounded queries

Queries that return all rows without a LIMIT clause on tables that grow with usage SHALL have a `LIMIT 365` to prevent progressive performance degradation. The UI never displays more than one year of data at a time.

#### Scenario: activity_days limited
- **WHEN** `activity-handlers.js:69` executes `db:getActivityDays`
- **THEN** the SQL query SHALL include `LIMIT 365`

#### Scenario: measurement_sets limited
- **WHEN** `measurements-handlers.js:6` executes `db:getMeasurementSets`
- **THEN** the SQL query SHALL include `LIMIT 365`

#### Scenario: weight_entries limited
- **WHEN** `measurements-handlers.js:38` executes `db:getWeightEntries`
- **THEN** the SQL query SHALL include `LIMIT 365`
