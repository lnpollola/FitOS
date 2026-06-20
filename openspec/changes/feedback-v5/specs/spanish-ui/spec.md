# Spanish UI — Dashboard & Activity Hardcoded Strings

## Purpose

Replace remaining hardcoded Spanish strings in `activity.js` and `dashboard.js` with references to the locale keys module.

## MODIFIED Requirements

### Requirement: All frontend strings translated to Spanish

The system SHALL display all UI text — navigation labels, view titles, form labels, button text, chart labels, tooltips, error messages, confirmation dialogs, and empty-state placeholders — in Spanish.

#### Scenario: Activity navigation buttons use locale keys
- **WHEN** a user views the activity timeline
- **THEN** the month navigation buttons SHALL use locale keys instead of hardcoded "‹ Mes ant." / "Mes sig. ›"
- **THEN** the month names array SHALL use locale keys instead of hardcoded "Enero"..."Diciembre"

#### Scenario: Activity HealthSync install button uses locale key
- **WHEN** HealthSync is not installed
- **THEN** the install button text SHALL use a locale key (not hardcoded "Instalar HealthSync")
- **THEN** the installing progress text SHALL use a locale key (not hardcoded "Instalando...")

#### Scenario: Activity import progress uses locale key
- **WHEN** an Apple Health import is in progress
- **THEN** the progress text SHALL reference a locale key instead of hardcoded "Importando datos de Apple Health..."

#### Scenario: Activity sleep format uses locale key
- **WHEN** sleep hours are displayed in the timeline or elsewhere
- **THEN** the "h" and "m" suffixes SHALL use the existing `strings.activity.sleepFormat` key instead of hardcoded `${h}h ${m}m`

#### Scenario: Dashboard units use locale keys
- **WHEN** the dashboard renders metric values
- **THEN** unit suffixes (kg, ms, bpm, h, km, min, %) SHALL reference locale keys instead of hardcoded strings

#### Scenario: Dashboard error states use locale keys
- **WHEN** an IPC call fails on the dashboard
- **THEN** the fallback display SHALL use a locale key (not hardcoded "--" or empty)

### Requirement: Spanish string constants module

The system SHALL export all UI strings from a single ES module at `src/renderer/locales/es.js` that every view imports, instead of hardcoding strings in each view.

#### Scenario: New dashboard strings in locale module
- **WHEN** the dashboard view renders
- **THEN** all new strings introduced for sleep card and error states SHALL be defined in `strings.dashboard` in `locales/es.js`

#### Scenario: New activity strings in locale module
- **WHEN** the activity view renders
- **THEN** all replacement strings (months, navigation, buttons) SHALL be defined in `strings.activity` in `locales/es.js`
