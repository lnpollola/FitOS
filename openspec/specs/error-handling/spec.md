# Error Handling — IPC Calls Resilientes

## Purpose

Every IPC call from the renderer to the main process must handle failures gracefully. Una falla en la DB no debe dejar la vista en blanco ni crashear la app.

## Requirements

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

Every `api.xxx()` call in every view SHALL be wrapped with error handling, either via `safeCall()` or equivalent try/catch. Additionally, views SHALL distinguish between "no data" (empty state) and "error" (error state) in the rendered output, rather than treating both as a silent `'--'` fallback.

#### Scenario: Activity view handles IPC errors
- **WHEN** `api.getActivityDays()`, `api.getSportActivities()`, `api.checkHealthsync()`, or any other IPC call fails in activity.js
- **THEN** the view SHALL render an error-state card with "Reintentar" button for the failed call
- **THEN** no unhandled promise rejection SHALL occur
- **THEN** the view SHALL NOT render `'--'` silently for the failed call

#### Scenario: Diet view handles IPC errors
- **WHEN** any of the ~27 IPC calls in diet.js fails (saveFoodItem, getDishes, getDailyPlan, etc.)
- **THEN** the view SHALL render with available data
- **THEN** save operations SHALL gracefully fail without corrupting UI state
- **THEN** failed reads SHALL show an error-state card with retry, not `'--'`

#### Scenario: Training view handles IPC errors
- **WHEN** any of the ~33 IPC calls in training.js fails
- **THEN** the view SHALL render partially with available data
- **THEN** `Promise.all` SHALL be replaced with `Promise.allSettled` to prevent one failure from blocking all loaders
- **THEN** failed slots SHALL render error-state cards with retry buttons

#### Scenario: Profile view handles IPC errors
- **WHEN** `api.exportData()` or `api.importData()` fails
- **THEN** the promise SHALL be caught (no dangling unhandled rejection)
- **THEN** the user SHALL see an error message with `role="alert"` (not silence)

#### Scenario: Measurements view handles IPC errors
- **WHEN** any of the ~14 IPC calls in measurements.js fails
- **THEN** the view SHALL render partially with available data
- **THEN** failed slots SHALL show error-state cards, not `'--'`

#### Scenario: Adaptive view handles IPC errors
- **WHEN** any of the ~13 IPC calls in adaptive.js fails
- **THEN** the view SHALL render with available data or empty-state cards
- **THEN** failed slots SHALL show error-state cards with retry, not `'--'`

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

### Requirement: Tri-state card rendering (loading / empty / error / data)

Every card that displays async IPC data SHALL render in one of four states: `loading` (skeleton), `empty` (no data available), `error` (IPC failure), or `data` (successful render). The system SHALL provide `src/renderer/utils/state-card.js` to centralize this logic. The `safeCall` wrapper remains as the error-catching layer underneath, but views SHALL NOT silently render `'--'` for error or empty states.

#### Scenario: Loading state shows skeleton
- **WHEN** a card's IPC data has not yet resolved
- **THEN** the card SHALL render a skeleton placeholder (grey block with pulse animation)
- **THEN** the card SHALL NOT show `'--'` or a blank value during loading

#### Scenario: Empty state shows guidance and action
- **WHEN** a card's IPC data resolves successfully but contains zero records (e.g., no weight entries in the period)
- **THEN** the card SHALL render an empty-state message in Spanish (e.g., "Sin datos en este período") and a primary action button (e.g., "Añadir medición" or "Importar actividad")
- **THEN** the card SHALL NOT render `'--'` as the value

#### Scenario: Error state shows message and retry
- **WHEN** a card's IPC call rejects (caught by `safeCall` or `Promise.allSettled`)
- **THEN** the card SHALL render an error-state message in Spanish (e.g., "Error al cargar") with `role="alert"` attribute
- **THEN** the card SHALL display a "Reintentar" button that re-triggers the failed IPC call
- **THEN** the card SHALL NOT render `'--'` silently or hide the error from the user

#### Scenario: Data state renders normally
- **WHEN** a card's IPC data resolves successfully with records
- **THEN** the card SHALL render the data value, subtitle, and compliance indicators as before

#### Scenario: state-card.js utility available
- **WHEN** a view needs to render a card with async data
- **THEN** the view SHALL use `renderStateCard(container, { title, state, valueHtml, subtitle, onRetry })` from `src/renderer/utils/state-card.js`
- **THEN** the `state` parameter SHALL be one of `'loading'`, `'empty'`, `'error'`, `'data'`
