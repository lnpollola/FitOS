# View Error States

## ADDED Requirements

### Requirement: Error state cards with retry in all views

The system SHALL use the `renderStateCard` utility from `state-card.js` with the `error` state (including a retry button) in all 7 views when an IPC call fails. The error state SHALL be visually distinct from the empty state (no data) and SHALL include `role="alert"` for screen reader announcement.

#### Scenario: Dashboard IPC failure shows error card
- **WHEN** any dashboard IPC call fails (DB locked, handler throw)
- **THEN** the affected card SHALL render an error state via `renderStateCard` with `state: 'error'`
- **THEN** the error card SHALL display `strings.states.error` as the title
- **THEN** the error card SHALL include a "Reintentar" button that re-calls the failed IPC

#### Scenario: Activity IPC failure shows error card
- **WHEN** any activity view IPC call fails
- **THEN** the affected section (timeline, ranking, or summary) SHALL render an error state with retry button

#### Scenario: Diet IPC failure shows error card
- **WHEN** any diet view IPC call fails (loadFoods, loadDailyPlan, loadDishes)
- **THEN** the affected section SHALL render an error state with retry button

#### Scenario: Energy/Adaptive IPC failure shows error card
- **WHEN** any adaptive.js IPC call fails (loadStatus, loadAdherence, loadRecomp, loadAdjustments, loadDeficitImpact, loadHistory)
- **THEN** the affected card SHALL render an error state with retry button

#### Scenario: Measurements IPC failure shows error card
- **WHEN** any measurements IPC call fails (loadHistory, loadCharts, loadBodyFat, loadComparison)
- **THEN** the affected section SHALL render an error state with retry button

#### Scenario: Training IPC failure shows error card
- **WHEN** any training IPC call fails (loadSessions, loadProgression, loadDeltas, loadStrengthStatus, loadActivePlan)
- **THEN** the affected section SHALL render an error state with retry button

#### Scenario: Analytics IPC failure shows error card
- **WHEN** any analytics IPC call fails (any of the 13 parallel calls)
- **THEN** the affected chart or KPI SHALL render an error state with retry button

### Requirement: Distinguish empty state from error state

The system SHALL visually and semantically distinguish "no data exists" (empty state with guidance) from "load failed" (error state with retry). Empty states SHALL use `state: 'empty'` with `strings.states.empty`; error states SHALL use `state: 'error'` with `strings.states.error` and `role="alert"`.

#### Scenario: Empty vs error distinction
- **WHEN** an IPC call returns `{ ok: true, data: [] }` (no data)
- **THEN** the section SHALL render the empty state with guidance text
- **WHEN** an IPC call returns `{ ok: false, error: message }` or throws
- **THEN** the section SHALL render the error state with retry button

### Requirement: Chart.js destroy-before-recreate in empty-state paths

The system SHALL call `chart.destroy()` BEFORE the early-return in empty-state branches, not after. The destroy guard SHALL be the first statement in every chart render function, before any data-presence check.

#### Scenario: Chart destroyed before empty-state return
- **WHEN** a chart render function is called and data is empty
- **THEN** the function SHALL first destroy any existing chart instance (`if (window._*Chart) window._*Chart.destroy()`)
- **THEN** the function SHALL set the chart instance to null
- **THEN** the function SHALL render the empty-state message and return

#### Scenario: No chart instance leak on range change
- **WHEN** the user changes a date range and the new range has no data for a previously-rendered chart
- **THEN** the old chart instance SHALL be destroyed before the empty-state renders
- **THEN** no orphaned Chart.js instances SHALL remain bound to detached canvases

### Requirement: Loading flags protected by try/finally

The system SHALL wrap all view `init()` and render functions in `try/finally` blocks where a loading flag is set. The `finally` block SHALL always reset the loading flag to `false`, ensuring the view remains navigable even if an exception is thrown.

#### Scenario: Dashboard loading flag released on error
- **WHEN** `dashboard.js init()` sets `window._loadingDashboard = true` and `render()` throws
- **THEN** the `finally` block SHALL set `window._loadingDashboard = false`
- **THEN** subsequent navigations to the dashboard SHALL not short-circuit

#### Scenario: Activity loading flag released on error
- **WHEN** `activity.js init()` sets `window._loadingActivity = true` and the main body throws
- **THEN** the `finally` block SHALL set `window._loadingActivity = false`

#### Scenario: Analytics loading flag with proper concurrency guard
- **WHEN** `analytics.js` sets `window._loadingAnalytics = true`
- **THEN** the flag SHALL be set BEFORE calling `loadAll()` and cleared in a `finally` block AFTER `await loadAll()` completes
- **THEN** concurrent `loadAll()` calls SHALL be blocked by the guard
- **THEN** rapid filter-button clicks SHALL NOT spawn multiple parallel `loadAll()` calls
