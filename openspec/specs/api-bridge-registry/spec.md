# API Bridge Registry

## Purpose

Unificar la definición de canales IPC en un solo archivo manifiesto, generando automáticamente los bridges de Electron (`preload.js`) y Web (`web-api.js`) para eliminar la deriva manual entre plataformas.

## Requirements

### Requirement: Single source of truth for API channels

The system SHALL define the catalog of IPC/API channels in one manifest file `src/shared/api-channels.js` (CommonJS), listing every channel with its exposed method name. Both API bridges (`src/preload/preload.js` for Electron and `src/renderer/utils/web-api.js` for Web mode) SHALL be generated from this manifest by a script `scripts/generate-api-bridge.js`. Hand-edited channel entries SHALL NOT be added directly to generated sections of either file.

#### Scenario: Adding a new channel touches one file
- **GIVEN** a new backend handler `db:getFoo` exists
- **WHEN** a developer adds `{ channel: 'db:getFoo', method: 'getFoo' }` to `src/shared/api-channels.js` and runs the generator
- **THEN** `preload.js` SHALL expose `getFoo` invoking `db:getFoo`
- **THEN** `web-api.js` SHALL expose `getFoo` calling `db:getFoo` via fetch
- **THEN** no other bridge file SHALL require manual edits

#### Scenario: Generated files carry generation header
- **WHEN** the generator runs
- **THEN** both output files SHALL start with a header comment identifying them as generated from `src/shared/api-channels.js`

### Requirement: Manual blocks preserved in generated bridges

The generator SHALL preserve hand-written sections of `preload.js` and `web-api.js` enclosed in explicit marker comments (event subscriptions like `onNavigate`/`onDataChanged`, and web-only helpers like `exportData`/`importData` with the file picker).

#### Scenario: Manual sections survive regeneration
- **GIVEN** `preload.js` contains a manual section with event subscriptions
- **WHEN** the generator runs after adding a channel
- **THEN** the manual section SHALL remain byte-identical
- **THEN** only the generated channel entries SHALL change

### Requirement: Drift detection test

The system SHALL include a unit test that runs the generator in memory and asserts the checked-in `preload.js` and `web-api.js` match the generated output. The test SHALL fail if any of the two files drifts from the manifest.

#### Scenario: Test fails on manual edit
- **GIVEN** a developer adds a method directly to `web-api.js` without updating the manifest
- **WHEN** `npm test` runs
- **THEN** the drift test SHALL fail, identifying the divergent file

#### Scenario: Test passes after regeneration
- **GIVEN** the manifest was updated and the generator was run
- **WHEN** `npm test` runs
- **THEN** the drift test SHALL pass

### Requirement: No channel drift between bridges

Every channel invocable in Electron mode SHALL be invocable in Web mode (and vice versa), except explicitly excluded platform-only operations. The manifest SHALL mark any such exclusion explicitly with a `platforms` field.

#### Scenario: Channel parity verified
- **WHEN** the drift test runs
- **THEN** the set of generated methods in `preload.js` and `web-api.js` SHALL be identical except manifest-declared platform exclusions
