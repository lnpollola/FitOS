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

### Requirement: Remove 25 unused preload APIs

The system SHALL NOT expose the following 25 preload API methods in `src/preload/preload.js`: `getSleepData`, `getHealthSleep`, `getHealthHRV`, `getHealthBodyMass`, `getHealthHRVWeekly`, `getHealthHeartRateDaily`, `getHealthStats`, `syncHealthToApp`, `getHealthBloodPressure`, `getHealthStandingHours`, `getHealthExerciseTime`, `getHealthWalkingDistance`, `getHealthSpO2Range`, `getExercisesByIds`, `unlinkDish`, `getDishesForMeal`, `setLastImportTimestamp`, `getTrendWeight`, `getSportActivities`, `saveSportActivity`, `saveActivityDay`, `getWeeklySportSummary`, `importActivityCSV`. Backend handlers SHALL remain intact.

#### Scenario: Unused preload APIs removed
- **WHEN** the preload script loads
- **THEN** `window.electronAPI` SHALL NOT contain the 25 listed methods
- **THEN** all other preload APIs SHALL continue to function normally

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
