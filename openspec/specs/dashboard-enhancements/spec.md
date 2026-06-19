# Dashboard Enhancements

## Purpose

Enhance the dashboard view with configurable date range filtering, per-activity calorie cards, average daily balance display, and last-update timestamp.

## Requirements

### Requirement: Dashboard date range selector

The system SHALL provide a date range selector at the top of the dashboard with quick-access buttons for 7 days, 15 days, and 1 month.

#### Scenario: Quick-access buttons set predefined ranges
- **WHEN** the user clicks "7d" / "15d" / "1m" button
- **THEN** the dashboard SHALL update all KPIs and cards to show data for the selected range

#### Scenario: Active filter visually indicated
- **WHEN** a date range is selected
- **THEN** the corresponding button SHALL have a visual active state (accent color, filled style)

### Requirement: Per-activity kcal cards on dashboard

The system SHALL display individual cards for each sport activity type (pádel, fútbol, HIIT, bicicleta, boxeo) showing the count of sessions and average kcal burned per session in the selected period.

#### Scenario: Activity cards render with data
- **WHEN** sport activity data exists for the selected period
- **THEN** the dashboard SHALL display a card per activity type with: activity name (Spanish), session count, and average kcal/session

#### Scenario: Activity cards show zero state
- **WHEN** no sport activity data exists for the selected period
- **THEN** the dashboard SHALL display activity cards with "--" for kcal values and "0" for session count

### Requirement: Weekly balance as average per day

The system SHALL display the weekly calorie balance as an average per day instead of a cumulative total.

#### Scenario: Weekly balance shows avg/day
- **WHEN** the dashboard renders
- **THEN** the weekly balance card SHALL show (calories consumed - calories burned) / number of days in the period

### Requirement: Remove current-day calories card

The system SHALL remove the "calorías de hoy" card from the dashboard.

#### Scenario: Current-day calories not displayed
- **WHEN** the dashboard renders
- **THEN** the dashboard SHALL NOT display a card showing current-day calorie data

### Requirement: Last data update timestamp

The system SHALL display the timestamp of the last data import/update on the dashboard.

#### Scenario: Last update shown
- **WHEN** the dashboard renders and import data exists
- **THEN** the dashboard SHALL display "Última actualización: {date} {time}" at the top or bottom of the dashboard

#### Scenario: No import data
- **WHEN** no data has ever been imported
- **THEN** the dashboard SHALL display "Sin datos importados"
