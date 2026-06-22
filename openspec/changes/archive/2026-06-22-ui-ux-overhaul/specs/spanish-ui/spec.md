## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: All frontend strings translated to Spanish

The system SHALL display all UI text — navigation labels, view titles, form labels, button text, chart labels, tooltips, error messages, confirmation dialogs, empty-state placeholders, loading-state text, and error-state text — in Spanish.

#### Scenario: Navigation sidebar in Spanish
- **WHEN** a user opens the application
- **THEN** the navigation sidebar SHALL show: Panel, Actividad, Plan de Dieta, Balance Energético, Mediciones Corporales, Entrenamiento de Fuerza, Tendencias, Perfil y Ajustes

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
