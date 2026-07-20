# Automated Testing (delta)

## MODIFIED Requirements

### Requirement: Test runner setup

The project SHALL use Vitest as the test runner, configured to work with the existing Vite setup and jsdom for DOM environment tests. The `vitest.config.js` SHALL include test files under `tests/unit/`, `tests/smoke/`, AND `tests/regression/`.

#### Scenario: Vitest configured
- **GIVEN** the project has Vite configured
- **WHEN** `npm test` is executed
- **THEN** Vitest SHALL run in CI mode (`vitest run`)
- **THEN** all test files under `tests/unit/`, `tests/smoke/`, and `tests/regression/` SHALL be discovered and executed
- **WHEN** `npm run test:watch` is executed
- **THEN** Vitest SHALL run in watch mode

### Requirement: Smoke tests for all views

Each of the 11 views (dashboard, activity, diet, energy/adaptive, measurements, training, analytics, insights, profile, sleep, goals) SHALL have a smoke test that verifies `init()` completes without throwing when `window.electronAPI` is properly mocked.

#### Scenario: Sleep view smoke test
- **GIVEN** `window.electronAPI` is mocked with all required methods returning resolved promises
- **WHEN** `init()` from `sleep.js` is called
- **THEN** no exception SHALL be thrown
- **THEN** the view container SHALL have innerHTML set after init
