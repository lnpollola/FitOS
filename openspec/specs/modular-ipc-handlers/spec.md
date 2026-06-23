# Modular IPC Handlers

## Purpose

Organize IPC handlers into domain-specific files under `src/main/handlers/` with a central registry in `ipc-handlers.js`, improving maintainability and reducing file size.

## Requirements

### Requirement: IPC handlers organized by domain

The system SHALL organize IPC handlers into separate files by domain under `src/main/handlers/`. Each module SHALL export a `register(ipcMain, getDb)` function that registers its handlers. The main `ipc-handlers.js` SHALL import and delegate to domain modules rather than contain handlers inline.

#### Scenario: Profile handlers in dedicated file
- **WHEN** the application starts
- **THEN** `src/main/handlers/profile-handlers.js` SHALL register `db:getProfile` and `db:saveProfile` handlers
- **THEN** the file SHALL export a `register` function

#### Scenario: Activity handlers in dedicated file
- **WHEN** the application starts
- **THEN** `src/main/handlers/activity-handlers.js` SHALL register all activity-related handlers including `db:getActivityDays`, `db:saveActivityDay`, `db:getSportActivities`, `db:saveSportActivity`, `db:importActivityCSV`, `db:getWeeklySportSummary`, `db:getActivityKcalByType`, `db:getSportSummaryByRange`, `db:getActivityComparison`, `db:getWeightStats`, `db:searchFoodItems`

#### Scenario: Diet handlers in dedicated file
- **WHEN** the application starts
- **THEN** `src/main/handlers/diet-handlers.js` SHALL register all diet-related handlers including `db:getFoodItems`, `db:saveFoodItem`, food hiding, meal templates, daily plans, elaborated dishes, and dish-meal linking

#### Scenario: Training handlers in dedicated file
- **WHEN** the application starts
- **THEN** `src/main/handlers/training-handlers.js` SHALL register all training-related handlers including exercise library, training sessions, training sets, training routines, workout plans

#### Scenario: Health handlers in dedicated file
- **WHEN** the application starts
- **THEN** `src/main/handlers/health-handlers.js` SHALL register all `health:*` and health-related `db:*` handlers including `db:getSleepData`, `db:getSleepAnalysis`, `db:getCyclingDistance`, `db:getDashboardData`

#### Scenario: Main ipc-handlers delegates to modules
- **WHEN** `registerIpcHandlers(mainWindow)` is called
- **THEN** the function SHALL import each domain module and call its `register()` function
- **THEN** the function SHALL NOT contain any handler logic inline

#### Scenario: Existing IPC contracts unaffected
- **WHEN** any handler is invoked by its existing channel name (e.g., `db:getProfile`)
- **THEN** the handler SHALL respond with the same data structure as before the split
- **THEN** no change SHALL be required in `preload.js` or renderer views
