# Spanish UI

## Purpose

Translate all user-facing frontend strings to Spanish while keeping backend/main process code in English. The README.md is also translated to Spanish.

## Requirements

### Requirement: All frontend strings translated to Spanish

The system SHALL display all UI text — navigation labels, view titles, form labels, button text, chart labels, tooltips, error messages, confirmation dialogs, and empty-state placeholders — in Spanish.

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

### Requirement: Spanish string constants module

The system SHALL export all UI strings from a single ES module at `src/renderer/locales/es.js` that every view imports, instead of hardcoding strings in each view.

#### Scenario: Strings imported from locales module
- **WHEN** a view file renders text
- **THEN** it SHALL reference `strings.viewTitle` or equivalent key from the locales module

### Requirement: README translated to Spanish

The README.md file SHALL be rewritten in Spanish, covering project description, setup instructions, and architecture overview.

#### Scenario: README in Spanish
- **WHEN** a developer opens README.md
- **THEN** all sections SHALL be written in Spanish
