# Shared Formatters

## Purpose

Centralizar el formateo de números, fechas, duraciones y valores en un módulo compartido, eliminando ~27 inline `toLocaleString`/`toLocaleDateString` esparcidos por las vistas y previniendo duplicación de helpers de formateo.

## Requirements

### Requirement: Canonical formatter module

The system SHALL provide a single module `src/renderer/utils/formatters.js` exporting the shared formatting functions: `formatNumber`, `formatDateShort`, `formatDateLong`, `formatDateRange`, `formatDuration`, `formatKcal`, and `escapeHtml`. Views SHALL import formatting helpers from this module instead of defining local equivalents or calling `toLocaleDateString`/`toLocaleString` inline.

#### Scenario: No inline locale formatting in views
- **WHEN** the views under `src/renderer/views/` are inspected
- **THEN** no view SHALL call `toLocaleDateString` or `toLocaleString` directly for display formatting
- **THEN** all display date/number formatting SHALL go through the shared module

#### Scenario: No duplicated local formatter helpers
- **WHEN** the views are inspected
- **THEN** no view SHALL define its own `escapeHtml`, `formatDate*`, `formatNumber`, or `formatDuration` local functions

### Requirement: Backward-compatible re-exports

`src/renderer/utils/kpi-derivation.js` SHALL continue to export the formatting functions it currently defines, re-exporting them from `formatters.js` so existing imports and tests keep working.

#### Scenario: Existing kpi-derivation imports keep working
- **GIVEN** a module importing `formatDateShort` from `kpi-derivation.js`
- **WHEN** the formatters module is introduced
- **THEN** the import SHALL resolve to the same implementation from `formatters.js`
- **THEN** all existing `kpi-derivation` unit tests SHALL pass unchanged

### Requirement: Formatter unit tests

The formatters module SHALL have unit tests covering locale-stable output for each exported function, including edge cases (null/undefined input, zero, negative durations).

#### Scenario: Tests cover edge cases
- **WHEN** `npm test` runs
- **THEN** formatter tests SHALL assert behavior for null, undefined, zero, and typical values
