# Handler Error Handling

## Purpose

Estandarizar el manejo de errores en todos los handlers IPC mediante un wrapper compartido, eliminando la proliferación de try/catch ad-hoc y asegurando que todos los handlers devuelvan respuestas estructuradas y consistentes.

## Requirements

### Requirement: Consistent error wrapping for all IPC handlers

All IPC handler modules under `src/main/handlers/` SHALL wrap their handler implementations in a shared `safeHandle(ipc, channel, handler)` function that catches thrown errors and returns a structured `{ ok, data/error }` response. Handlers SHALL NOT rely solely on `ipcMain.handle`'s default error propagation or on raw try/catch blocks with ad-hoc formats.

#### Scenario: safeHandle wraps all channels
- **WHEN** any handler module registers with `safeHandle`
- **THEN** the registered callback SHALL be wrapped in try/catch
- **THEN** on success: the handler's return value SHALL be passed through
- **THEN** on error: SHALL return `{ ok: false, error: <message> }`
- **THEN** the error SHALL be logged to `console.error` with the channel name prefix

#### Scenario: Existing handlers migrate to safeHandle
- **WHEN** all 13 handler modules finish migration
- **THEN** no handler module SHALL contain a bare `try {`/`catch` block for IPC handler wrapping
- **THEN** health-handlers 26 individual try/catch blocks SHALL be replaced by 26 safeHandle calls

### Requirement: Handler function signatures standardized

Every handler module's `register()` function SHALL accept the same parameter signature: `(ipc, getDb, getHS, notifyDomain)`. Unused parameters SHALL remain in the signature for consistency.

#### Scenario: All registers accept 4 params
- **WHEN** any `register()` function is called
- **THEN** the function SHALL accept `(ipc, getDb, getHS, notifyDomain)` as parameters
- **THEN** unused parameters SHALL NOT be prefixed with underscore

### Requirement: Measurements handler bug fixed

`src/main/handlers/measurements-handlers.js` SHALL declare `notifyDomain` as a named parameter so the references in `saveMeasurementSet` and `saveWeightEntry` handlers do not throw ReferenceError.

#### Scenario: notifyDomain accessible
- **GIVEN** `register()` is called with 4 arguments
- **WHEN** `saveMeasurementSet` or `saveWeightEntry` handler executes
- **THEN** `notifyDomain` SHALL be the 4th argument, not undefined
- **THEN** calling `notifyDomain("measurements")` SHALL NOT throw
