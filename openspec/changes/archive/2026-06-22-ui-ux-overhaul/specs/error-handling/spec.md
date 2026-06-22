## ADDED Requirements

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

## MODIFIED Requirements

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
