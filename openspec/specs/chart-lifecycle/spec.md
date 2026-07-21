# Chart Lifecycle

## Purpose

Centralizar la gestión de instancias de Chart.js en un registry con ciclo de vida controlado, eliminando el patrón frágil de variables globales `window._*Chart` y su limpieza mediante escaneo de `Object.keys(window)`.

## Requirements

### Requirement: Centralized chart registry

The system SHALL manage all Chart.js instances through a module `src/renderer/charts/chart-manager.js` exposing `createChart(id, ctx, config)`, `getChart(id)`, `destroyChart(id)`, and `destroyAllCharts()`. Views SHALL NOT store chart instances on `window` globals, and chart lookup SHALL NOT rely on naming conventions over `window` keys.

#### Scenario: Create registers instance
- **WHEN** a view calls `createChart('weekly', ctx, config)`
- **THEN** the chart SHALL be stored in the registry under `weekly`
- **THEN** `getChart('weekly')` SHALL return the same instance

#### Scenario: Create with existing id destroys previous
- **GIVEN** a chart registered under `weekly`
- **WHEN** `createChart('weekly', ctx, newConfig)` is called again
- **THEN** the previous instance SHALL be destroyed before creating the new one
- **THEN** the registry SHALL hold only the new instance

#### Scenario: No window chart globals remain
- **WHEN** any view renders charts
- **THEN** no property matching `_*Chart` SHALL be assigned on `window` by application code

### Requirement: Destroy all charts on navigation

The router SHALL call `destroyAllCharts()` from the chart manager before initializing a new view, replacing the current `window`-key scanning logic in `app.js`.

#### Scenario: Navigation cleans registry
- **GIVEN** view A registered charts `steps` and `hr`
- **WHEN** the user navigates to view B
- **THEN** `destroyAllCharts()` SHALL destroy both instances
- **THEN** the registry SHALL be empty

#### Scenario: Destroy is idempotent
- **WHEN** `destroyAllCharts()` is called twice in a row
- **THEN** no error SHALL be thrown
- **THEN** the registry SHALL remain empty

### Requirement: Chart manager unit tests

The chart manager SHALL have unit tests covering create/get/destroy/destroyAll and the recreate-with-same-id path, using a mocked Chart constructor.

#### Scenario: Tests pass without canvas
- **WHEN** `npm test` runs in the jsdom environment
- **THEN** all chart-manager tests SHALL pass without a real canvas context
