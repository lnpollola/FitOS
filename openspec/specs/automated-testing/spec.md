# Automated Testing — Suite de Validación Post-Sesión

## Purpose

Establecer infraestructura de tests automatizados que permita al usuario ejecutar `npm test` después de cada sesión de desarrollo para verificar que la app sigue estable. Cubre tests de humo (cada view carga sin crash), tests de regresión (bugs fixeados no reaparecen), y tests unitarios (utilidades compartidas).

## Requirements

### Requirement: Test runner setup

The project SHALL use Vitest as the test runner, configured to work with the existing Vite setup and jsdom for DOM environment tests.

#### Scenario: Vitest configured
- **GIVEN** the project has Vite configured
- **WHEN** `npm test` is executed
- **THEN** Vitest SHALL run in CI mode (`vitest run`)
- **THEN** all test files under `tests/` SHALL be discovered and executed
- **WHEN** `npm run test:watch` is executed
- **THEN** Vitest SHALL run in watch mode

### Requirement: Smoke tests for all views

Each of the 8 views SHALL have a smoke test that verifies `init()` completes without throwing when `window.electronAPI` is properly mocked.

#### Scenario: Activity view smoke test
- **GIVEN** `window.electronAPI` is mocked with all required methods returning resolved promises
- **WHEN** `init()` from `activity.js` is called
- **THEN** no exception SHALL be thrown
- **THEN** the view container SHALL have innerHTML set after init

#### Scenario: Dashboard view smoke test
- **GIVEN** `window.electronAPI` is mocked with all required methods
- **WHEN** `init()` from `dashboard.js` is called
- **THEN** no exception SHALL be thrown

#### Scenario: Diet view smoke test
- **GIVEN** `window.electronAPI` is mocked with all required methods
- **WHEN** `init()` from `diet.js` is called
- **THEN** no exception SHALL be thrown

#### Scenario: Training view smoke test
- **GIVEN** `window.electronAPI` is mocked with all required methods
- **WHEN** `init()` from `training.js` is called
- **THEN** no exception SHALL be thrown

#### Scenario: Profile view smoke test
- **GIVEN** `window.electronAPI` is mocked with all required methods
- **WHEN** `init()` from `profile.js` is called
- **THEN** no exception SHALL be thrown

#### Scenario: Measurements view smoke test
- **GIVEN** `window.electronAPI` is mocked with all required methods
- **WHEN** `init()` from `measurements.js` is called
- **THEN** no exception SHALL be thrown

#### Scenario: Adaptive view smoke test
- **GIVEN** `window.electronAPI` is mocked with all required methods
- **WHEN** `init()` from `adaptive.js` is called
- **THEN** no exception SHALL be thrown

#### Scenario: Analytics view smoke test
- **GIVEN** `window.electronAPI` is mocked with all required methods
- **WHEN** `init()` from `analytics.js` is called
- **THEN** no exception SHALL be thrown

### Requirement: Regression tests for fixed bugs

Each bug fixed in a given change SHALL have a regression test that verifies the correct behavior.

#### Scenario: safeCall utility tested
- **WHEN** `safeCall()` is invoked with a promise that rejects
- **THEN** it SHALL return the fallback value
- **WHEN** `safeCall()` is invoked with a promise that resolves
- **THEN** it SHALL return the resolved value

#### Scenario: Loading flag always released
- **GIVEN** a view's `init()` function that sets `window._loadingXxx = true`
- **WHEN** `init()` throws an error
- **THEN** `window._loadingXxx` SHALL be `false` after the call

#### Scenario: BMR calculation is correct
- **WHEN** Mifflin-St Jeor formula is applied for a male (75kg, 180cm, 30y)
- **THEN** the result SHALL be 1681.25 kcal
- **WHEN** applied for a female (60kg, 165cm, 30y)
- **THEN** the result SHALL be 1355 kcal

### Requirement: Unit tests for utility functions

Shared utility functions SHALL have unit tests.

#### Scenario: getSportDisplayName
- **WHEN** called with `'running'`
- **THEN** it SHALL return `'Carrera'`
- **WHEN** called with `'unknown_type'`
- **THEN** it SHALL return `'Otro'`

#### Scenario: getMeasurementLabel
- **WHEN** called with `'chest_cm'`
- **THEN** it SHALL return `'Pecho'`
- **WHEN** called with `'unknown_metric'`
- **THEN** it SHALL return the sanitized key as fallback
