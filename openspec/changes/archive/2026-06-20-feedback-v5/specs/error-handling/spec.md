# Error Handling — IPC Calls Resilientes

## Purpose

Every IPC call from the renderer to the main process must handle failures gracefully. Actualmente ~99 de ~120 calls carecen de try/catch. Una falla en la DB no debe dejar la vista en blanco ni crashear la app.

## ADDED Requirements

### Requirement: IPC error handling wrapper

The system SHALL provide a reusable utility function for safe IPC calls that catches errors and returns a configurable fallback value.

#### Scenario: safeCall catches errors
- **GIVEN** a view calls `safeCall(api.someMethod(), [])`
- **WHEN** the IPC call throws or rejects
- **THEN** `safeCall` SHALL log the error to console
- **THEN** `safeCall` SHALL return the fallback value (`[]`)
- **THEN** the view SHALL render using the fallback

#### Scenario: safeCall returns data on success
- **GIVEN** a view calls `safeCall(api.getProfile(), null)`
- **WHEN** the IPC call succeeds
- **THEN** `safeCall` SHALL return the resolved data

### Requirement: Every IPC call wrapped

Every `api.xxx()` call in every view SHALL be wrapped with error handling, either via `safeCall()` or equivalent try/catch.

#### Scenario: Activity view handles IPC errors
- **WHEN** `api.getActivityDays()`, `api.getSportActivities()`, `api.checkHealthsync()`, or any other IPC call fails in activity.js
- **THEN** the view SHALL render with available data or empty state
- **THEN** no unhandled promise rejection SHALL occur

#### Scenario: Diet view handles IPC errors
- **WHEN** any of the 27 IPC calls in diet.js fails (saveFoodItem, getDishes, getDailyPlan, etc.)
- **THEN** the view SHALL render with available data
- **THEN** save operations SHALL gracefully fail without corrupting UI state

#### Scenario: Training view handles IPC errors
- **WHEN** any of the 33 IPC calls in training.js fails
- **THEN** the view SHALL render partially with available data
- **THEN** `Promise.all` on line 650 SHALL be replaced with `Promise.allSettled` to prevent one failure from blocking all loaders

#### Scenario: Profile view handles IPC errors
- **WHEN** `api.exportData()` or `api.importData()` fails
- **THEN** the promise SHALL be caught (no dangling unhandled rejection)
- **THEN** the user SHALL see an error message (not silence)

#### Scenario: Measurements view handles IPC errors
- **WHEN** any of the 14 IPC calls in measurements.js fails
- **THEN** the view SHALL render partially with available data

#### Scenario: Adaptive view handles IPC errors
- **WHEN** any of the 13 IPC calls in adaptive.js fails
- **THEN** the view SHALL render with available data or empty state

### Requirement: Chart.js destroy-before-recreate

Every view that creates Chart.js instances SHALL destroy the previous instance before creating a new one, preventing DOM event listener leaks.

#### Scenario: Analytics charts cleanup on re-render
- **WHEN** the user changes the date filter in analytics.js
- **THEN** each of the 8 chart renderers SHALL destroy the old chart instance before creating a new one
- **THEN** `window._stepsChart.destroy()` etc. SHALL be called before reassignment

#### Scenario: Adaptive recomp chart cleanup
- **WHEN** `loadRecomp()` is called more than once in adaptive.js
- **THEN** the previous chart instance SHALL be destroyed before creating a new one
- **THEN** the instance SHALL be stored as `window._recompChart`

### Requirement: Loading flags always released

Views using `window._loading*` flags MUST release them even when initialization fails.

#### Scenario: Training init error releases flag
- **WHEN** `init()` in training.js throws at any point
- **THEN** `window._loadingTraining` SHALL be set to `false` (via try/finally)
- **THEN** the user SHALL be able to retry navigation to the view

#### Scenario: Measurements init error releases flag
- **WHEN** `init()` in measurements.js throws at any point
- **THEN** `window._loadingMeasurements` SHALL be set to `false` (via try/finally)
- **THEN** the user SHALL be able to retry navigation to the view
