# Spanish UI — Hardcoded String Fix

## Purpose

Replace remaining hardcoded Spanish strings in `activity.js` with references to the locale keys module.

## MODIFIED Requirements

### Requirement: All frontend strings translated to Spanish

The system SHALL display all UI text — navigation labels, view titles, form labels, button text, chart labels, tooltips, error messages, confirmation dialogs, and empty-state placeholders — in Spanish.

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
