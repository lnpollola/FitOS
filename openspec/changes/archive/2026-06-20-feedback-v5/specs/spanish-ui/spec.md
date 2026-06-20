# Spanish UI — Localización Completa (8 Vistas)

## Purpose

Replace ALL remaining hardcoded Spanish strings across all 8 views with references to the locale keys module at `src/renderer/locales/es.js`. El scope original solo cubría activity.js y dashboard.js; ahora se extiende a diet.js, training.js, profile.js, measurements.js, adaptive.js, y analytics.js.

## MODIFIED Requirements

### Requirement: All frontend strings translated to Spanish via locale module

The system SHALL display all UI text — navigation labels, view titles, form labels, button text, chart labels, tooltips, error messages, confirmation dialogs, empty-state placeholders, and unit suffixes — using keys from the `strings` object in `locales/es.js`. No hardcoded Spanish string literals SHALL appear in view files.

#### Scenario: Activity view strings use locale keys
- **WHEN** a user views the activity timeline
- **THEN** month names, navigation buttons, install button text, import progress, and sleep format SHALL use locale keys
- **THEN** the typo `apple-healt-export` SHALL be corrected to `apple-health-export` in both the code and locale key

#### Scenario: Dashboard strings use locale keys
- **WHEN** the dashboard renders metric values
- **THEN** unit suffixes (kg, ms, bpm, h, km, min, %) SHALL reference locale keys

#### Scenario: Diet view strings use locale keys
- **WHEN** a user views the diet plan
- **THEN** table headers (Nombre, Gramos, kcal, P, C, G), form labels (Fecha, Añadir), macro prefixes (P:, C:, G:), empty states, and separators SHALL use locale keys
- **THEN** the redundant fallback `|| 'Todas'` pattern SHALL be removed where keys already exist

#### Scenario: Training view strings use locale keys
- **WHEN** a user views the training view
- **THEN** button texts (Generar Plan, Eliminar), labels (días/semana, Plan activo), confirm dialogs, table headers (Nombre, Creado, Fecha, Rutina, Notas), and progress comparison labels SHALL use locale keys
- **THEN** the redundant `|| '...'` fallback pattern SHALL be removed where keys already exist

#### Scenario: Profile view strings use locale keys
- **WHEN** a user views the profile
- **THEN** the "Available Metrics" section with health metric names and descriptions SHALL use locale keys (not hardcoded Spanish/English strings)

#### Scenario: Adaptive view strings use locale keys
- **WHEN** a user views the adaptive planning view
- **THEN** table headers (Fecha, Ritmo, Déficit Objetivo, Déficit Actual, Brecha) and unit (kg/sem) SHALL use locale keys

#### Scenario: Measurements view strings use locale keys
- **WHEN** a user views measurements
- **THEN** the column header "Fecha" SHALL use `strings.measurements.date`
- **THEN** the deletion confirm dialog SHALL use the correct measurement-specific key (not the import/export key)

### Requirement: Spanish string constants module

The system SHALL export all UI strings from a single ES module at `src/renderer/locales/es.js` that every view imports, instead of hardcoding strings in each view.

#### Scenario: New locale keys added
- **WHEN** a view requires new strings
- **THEN** those strings SHALL be added to the appropriate domain in `strings` (`strings.activity`, `strings.dashboard`, `strings.diet`, `strings.training`, `strings.profile`, `strings.measurements`, `strings.adaptive`, etc.)
- **THEN** no `|| 'fallback'` pattern SHALL exist where the key is defined in the locale
