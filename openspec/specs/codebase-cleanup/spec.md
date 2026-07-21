# Codebase Cleanup

## Purpose

Remove dead code, unused functions, duplicated CSS, orphaned modules, and unnecessary preload APIs from the codebase to reduce maintenance surface area.

## Requirements

### Requirement: Remove dead `mountWeeklyGoal` chain

The system SHALL NOT contain the `mountWeeklyGoal` function in `src/renderer/views/panels/strava-panels.js`, the `getWeeklyGoal` preload API in `src/preload/preload.js`, or the `db:getWeeklyGoal` IPC handler in `src/main/handlers/strava-panels-handlers.js`. Associated CSS classes (`.strava-weekly-goal`, `.strava-ring-wrap`, `.strava-ring-track`, `.strava-ring-fill`, `.strava-ring-center`, `.strava-weekly-progress`, `.strava-weekly-meta`) SHALL be removed from `cards.css`.

#### Scenario: mountWeeklyGoal removed
- **WHEN** the codebase is built
- **THEN** `mountWeeklyGoal` SHALL NOT be exported from `strava-panels.js`
- **THEN** no reference to `getWeeklyGoal` SHALL exist in `preload.js`
- **THEN** no handler for `db:getWeeklyGoal` SHALL exist in `strava-panels-handlers.js`

### Requirement: Remove unused preload APIs and orphaned backend handlers

The system SHALL NOT expose the following 25 preload API methods in `src/preload/preload.js`: `getSleepData`, `getHealthSleep`, `getHealthHRV`, `getHealthBodyMass`, `getHealthHRVWeekly`, `getHealthHeartRateDaily`, `getHealthStats`, `syncHealthToApp`, `getHealthBloodPressure`, `getHealthStandingHours`, `getHealthExerciseTime`, `getHealthWalkingDistance`, `getHealthSpO2Range`, `getExercisesByIds`, `unlinkDish`, `getDishesForMeal`, `setLastImportTimestamp`, `getTrendWeight`, `getSportActivities`, `saveSportActivity`, `saveActivityDay`, `getWeeklySportSummary`, `importActivityCSV`. Additionally, the orphaned backend handlers (`db:getSportActivities`, `db:saveSportActivity`, `db:saveActivityDay`, `db:importActivityCSV`, `db:getWeeklySportSummary`, `db:getSleepData`, `db:getTrendWeight`, `db:getDishesForMeal`, `db:unlinkDish`, `db:getExercisesByIds`, `db:setLastImportTimestamp`) SHALL be removed from `src/main/handlers/`, since no caller exists in preload, web-api, or any view.

#### Scenario: Unused preload APIs removed
- **WHEN** the preload script loads
- **THEN** `window.electronAPI` SHALL NOT contain the 25 listed methods
- **THEN** all other preload APIs SHALL continue to function normally

#### Scenario: Orphaned backend handlers removed
- **WHEN** the backend starts
- **THEN** no handler SHALL be registered for the listed orphaned channels
- **THEN** `npm test` SHALL pass with no reference to the removed handlers in renderer code

### Requirement: Remove duplicated CSS between cards.css and utilities.css

The system SHALL NOT contain duplicate CSS class definitions between `src/renderer/styles/cards.css` and `src/renderer/styles/utilities.css`. The following classes SHALL be removed from `utilities.css` (keeping the `cards.css` versions): `.card-accent`, `.compliance-ok`, `.compliance-warn`, `.metric-trend`, `.metric-value-sm`, `.trend-up`, `.trend-down`, `.trend-flat`, `.chart-container`, `.analytics-filters`, `.filter-btn`, `.filter-btn--active`, `.filter-btn:hover`, `.filter-divider`, `.filter-date-input`, `.analytics-kpis`, `.analytics-kpi-card`, `.analytics-grid`, `.chart-card`, `.chart-card-title`, `.chart-card-subtitle`, `.chart-container` (inside chart-card), `.secondary-section`, `.secondary-toggle`, `.secondary-content`, `.secondary-metrics-grid`, `.mini-chart-card`.

#### Scenario: No CSS duplication
- **WHEN** both CSS files are loaded
- **THEN** the listed classes SHALL only be defined in `cards.css`
- **THEN** no visual regression SHALL occur

### Requirement: Remove unused CSS classes

The system SHALL NOT contain the following unused CSS classes: `.strava-streak-broken` (cards.css), `.strava-row-2` (cards.css), `.strava-row-full` (cards.css), `.metric-value-sm` (cards.css), `.insights-view` (main.css).

#### Scenario: Unused classes removed
- **WHEN** CSS files are loaded
- **THEN** the listed classes SHALL NOT appear in any CSS file

### Requirement: Remove `strength-derivation.js` and its test

The system SHALL NOT contain `src/renderer/utils/strength-derivation.js` or `tests/unit/strength-derivation.test.js`. The strength insights functionality SHALL continue to work via backend IPC handlers.

#### Scenario: File removed, functionality intact
- **WHEN** the codebase is built
- **THEN** `src/renderer/utils/strength-derivation.js` SHALL NOT exist
- **THEN** `tests/unit/strength-derivation.test.js` SHALL NOT exist
- **THEN** the insights view strength section SHALL continue to render correctly via IPC

### Requirement: Rebuild scripts resolve project root correctly

The mode-switch rebuild scripts (`scripts/rebuild-for-web.js`, `scripts/rebuild-for-electron.js`) SHALL resolve the project root as one directory above `scripts/`, so `npm rebuild better-sqlite3` executes inside the repository.

#### Scenario: Rebuild runs in repo root
- **WHEN** `npm run rebuild:web` or `npm run rebuild:electron` executes
- **THEN** the working directory SHALL be the repository root (containing `package.json`)
- **THEN** the rebuild SHALL complete without "no package.json" errors

### Requirement: Root directory decluttered

The repository root SHALL contain only current documentation (`README.md`, `AGENTS.md`). Historical design documents SHALL be moved to `docs/history/`. The stale `design-system/` directory (unreferenced, empty `pages/`) SHALL be removed.

#### Scenario: Root contains only live docs
- **WHEN** the repository root is listed
- **THEN** the only markdown files present SHALL be `README.md` and `AGENTS.md`
- **THEN** the historical documents SHALL exist under `docs/history/`

### Requirement: Machine-local state file untracked

The `.current-mode` file SHALL NOT be tracked in git and SHALL be listed in `.gitignore`.

#### Scenario: Mode switch leaves clean tree
- **WHEN** `npm run switch:web` or `npm run switch:electron` runs
- **THEN** `git status` SHALL NOT show `.current-mode` as modified or untracked

### Requirement: Version and dependency classification aligned

`package.json` SHALL declare the version matching the released product (`0.7.0`), and `lucide` SHALL be listed under `dependencies`, not `devDependencies`.

#### Scenario: Version matches release
- **WHEN** `package.json` is read
- **THEN** `version` SHALL equal the version referenced by `README.md`

#### Scenario: Lucide in dependencies
- **WHEN** `package.json` is read
- **THEN** `lucide` SHALL appear in `dependencies`

### Requirement: Remove orphaned cache-store module

`src/renderer/utils/cache-store.js` SHALL be removed because no module reads cached values. The `onDomainChanged` event handler in `app.js` SHALL be removed along with the cacheStore import. The `domain-changed` event SHALL be removed from `preload.js`.

#### Scenario: cache-store removed
- **WHEN** the application starts
- **THEN** `src/renderer/utils/cache-store.js` SHALL NOT exist
- **THEN** `app.js` SHALL NOT import `cache-store`
- **THEN** no view or utility SHALL reference `cacheStore`

#### Scenario: onDomainChanged removed
- **WHEN** `app.js` loads
- **THEN** `api.onDomainChanged()` SHALL NOT be called
- **THEN** `preload.js` SHALL NOT export an `onDomainChanged` method

### Requirement: Remove unused validation module

`src/renderer/validation.js` SHALL be removed because no view imports or uses it.

#### Scenario: validation.js removed
- **WHEN** the source tree is inspected
- **THEN** `src/renderer/validation.js` SHALL NOT exist
- **THEN** no import statement referencing `./validation.js` SHALL exist

### Requirement: Fix IPC listener leak

The `onDataChanged` and `onNavigate` listeners SHALL NOT accumulate across view re-initializations. Each time `showView` is called, the previous listener SHALL be removed before adding the new one, using `removeAllListeners`.

#### Scenario: No duplicate listeners after navigation
- **GIVEN** the user navigates between views 10 times
- **WHEN** `data-changed` fires once
- **THEN** only one listener SHALL execute, not 10

### Requirement: Emit data-changed after IPC import

The IPC import handler SHALL emit `notifyDomain("settings")` after a successful import.

#### Scenario: UI refreshes after import
- **WHEN** the user triggers an import via IPC
- **THEN** `notifyDomain("settings")` SHALL be called after the import transaction commits
- **THEN** the view SHALL re-render with the imported data

### Requirement: LIMIT on unbounded queries

Queries that return all rows without a LIMIT clause on tables that grow with usage SHALL have a `LIMIT 365`.

#### Scenario: activity_days limited
- **WHEN** `activity-handlers.js` executes `db:getActivityDays`
- **THEN** the SQL query SHALL include `LIMIT 365`

#### Scenario: measurement_sets limited
- **WHEN** `measurements-handlers.js` executes `db:getMeasurementSets`
- **THEN** the SQL query SHALL include `LIMIT 365`

#### Scenario: weight_entries limited
- **WHEN** `measurements-handlers.js` executes `db:getWeightEntries`
- **THEN** the SQL query SHALL include `LIMIT 365`
