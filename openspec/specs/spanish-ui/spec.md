# Spanish UI

## Purpose

Translate all user-facing frontend strings to Spanish while keeping backend/main process code in English. The README.md is also translated to Spanish.

## Requirements

### Requirement: All frontend strings translated to Spanish

The system SHALL display all UI text — navigation labels, view titles, form labels, button text, chart labels, tooltips, error messages, confirmation dialogs, empty-state placeholders, loading-state text, and error-state text — in Spanish.

#### Scenario: Navigation sidebar in Spanish
- **WHEN** a user opens the application
- **THEN** the navigation sidebar SHALL show: Panel de Control, Actividad, Plan de Dieta, Balance Energético, Mediciones Corporales, Entrenamiento de Fuerza, Perfil y Configuración

#### Scenario: View titles in Spanish
- **WHEN** a user navigates to any view
- **THEN** the view title SHALL be in Spanish (e.g., "Plan de Dieta" instead of "Diet Plan")

#### Scenario: Chart labels in Spanish
- **WHEN** a chart is rendered
- **THEN** axis labels, legends, and tooltips SHALL use Spanish terms (e.g., "Fecha" for date, "Calorías" for calories)

#### Scenario: Error messages in Spanish
- **WHEN** the system displays an error or validation message
- **THEN** the message text SHALL be in Spanish
- **THEN** error-state card messages SHALL reference `strings.states.*` locale keys

#### Scenario: Loading and empty states in Spanish
- **WHEN** the system displays a loading skeleton's screen-reader text or an empty-state message
- **THEN** the text SHALL be in Spanish and SHALL reference `strings.states.*` locale keys

#### Scenario: Activity timeline headers use locale keys
- **WHEN** a user views the activity timeline table
- **THEN** the column headers SHALL use locale keys: `strings.activity.date` for date, `strings.activity.steps` for steps, `strings.activity.activeCalories` for active kcal, `strings.activity.restingCalories` for resting kcal, `strings.activity.avgHeartRate` for heart rate, `strings.activity.sleepHours` for sleep

#### Scenario: HealthSync status messages use locale keys
- **WHEN** HealthSync is not installed
- **THEN** the install button label SHALL use a locale key (not hardcoded "HealthSync no instalado")
- **THEN** the status text SHALL use a locale key (not hardcoded "HealthSync disponible")

#### Scenario: Import error message uses locale key
- **WHEN** the Apple Health import fails because HealthSync is missing
- **THEN** the error message SHALL reference a locale key instead of hardcoded "HealthSync no encontrado. Instálalo primero."

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

#### Scenario: Strings imported from locales module
- **WHEN** a view file renders text
- **THEN** it SHALL reference `strings.viewTitle` or equivalent key from the locales module

#### Scenario: New locale keys added
- **WHEN** a view requires new strings
- **THEN** those strings SHALL be added to the appropriate domain in `strings` (`strings.activity`, `strings.dashboard`, `strings.diet`, `strings.training`, `strings.profile`, `strings.measurements`, `strings.adaptive`, etc.)
- **THEN** no `|| 'fallback'` pattern SHALL exist where the key is defined in the locale

### Requirement: README translated to Spanish

The README.md file SHALL be rewritten in Spanish, covering project description, setup instructions, and architecture overview.

#### Scenario: README in Spanish
- **WHEN** a developer opens README.md
- **THEN** all sections SHALL be written in Spanish

### Requirement: Spanish strings for loading, empty, and error states

The system SHALL provide Spanish locale keys for all loading-state, empty-state, and error-state text displayed by the tri-state card system and skeleton placeholders. These keys SHALL live under a new `strings.states` domain in `src/renderer/locales/es.js`.

#### Scenario: Loading state strings in Spanish
- **WHEN** a card is in loading state (skeleton)
- **THEN** any loading text (e.g., screen-reader-only "Cargando...") SHALL reference `strings.states.loading`

#### Scenario: Empty state strings in Spanish
- **WHEN** a card is in empty state (no data)
- **THEN** the empty message SHALL reference locale keys like `strings.states.noData`, `strings.states.noDataPeriod`
- **THEN** the action button text SHALL reference keys like `strings.states.addMeasurement`, `strings.states.importActivity`

#### Scenario: Error state strings in Spanish
- **WHEN** a card is in error state (IPC failure)
- **THEN** the error message SHALL reference `strings.states.errorLoading`
- **THEN** the retry button text SHALL reference `strings.states.retry`

#### Scenario: State strings centralized in locales module
- **WHEN** a developer opens `src/renderer/locales/es.js`
- **THEN** a `states` domain SHALL exist under `strings` with keys: `loading`, `noData`, `noDataPeriod`, `errorLoading`, `retry`, `addMeasurement`, `importActivity`, `addFood`, `addTrainingSession`
- **THEN** no view SHALL hardcode Spanish text for these states (all via locale keys)
