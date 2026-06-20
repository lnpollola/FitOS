# Dashboard Enhancements

## Purpose

Enhance the dashboard with session-first activity layout, weekly balance breakdown (basal vs activity + diet target), weight variation, steps period indicators, HRV composite, trend chart, and date range selector.

## Requirements

### Requirement: Dashboard date range selector

The system SHALL provide a date range selector at the top of the dashboard with quick-access buttons for 7 days, 15 days, and 1 month.

#### Scenario: Quick-access buttons set predefined ranges
- **WHEN** the user clicks "7d" / "15d" / "1m" button
- **THEN** the dashboard SHALL update all KPIs and cards to show data for the selected range

#### Scenario: Active filter visually indicated
- **WHEN** a date range is selected
- **THEN** the corresponding button SHALL have a visual active state (accent color, filled style)

### Requirement: Session-first activity layout

The system SHALL display activity cards with session count as the primary metric, ordered by session count descending.

#### Scenario: Session count cards render first
- **WHEN** sport activity data exists
- **THEN** display a summary card with total sessions + total kcal
- **THEN** per-sport cards follow, ordered by session count descending
- **THEN** each card shows: icon, name, sessions, total kcal, avg kcal/session

#### Scenario: Additional category cards
- **WHEN** sport activity data exists
- **THEN** show total sport hours, avg kcal/session, unique sport types

#### Scenario: Activity cards show zero state
- **WHEN** no sport activity data exists for the selected period
- **THEN** the dashboard SHALL display activity cards with "--" for kcal values and "0" for session count

### Requirement: Weekly balance with breakdown

The system SHALL display weekly balance as avg/day with basal vs activity breakdown and diet target.

#### Scenario: Weekly balance shows breakdown
- **WHEN** the dashboard renders
- **THEN** the weekly balance card SHALL show (consumed - burned) / days, with basal (BMR) and activity (sport+NEAT) components
- **THEN** show diet target as reference line

#### Scenario: Insufficient data
- **WHEN** fewer than 5 days have data
- **THEN** display a warning that the week is incomplete

### Requirement: Weight variation with trend

The system SHALL display the latest weight with variation and trend arrow.

#### Scenario: Weight card shows variation
- **WHEN** >=2 weight entries exist
- **THEN** show latest weight, ±variation, trend arrow

#### Scenario: Insufficient data
- **WHEN** <2 weight entries
- **THEN** display "―" for variation

### Requirement: Steps multi-period indicators

The system SHALL display three compact steps period cards with trend arrows.

#### Scenario: Steps period cards
- **WHEN** dashboard renders
- **THEN** show "7d: NNNN", "15d: NNNN", "1m: NNNN" with trend arrows

### Requirement: HRV + resting HR composite

The system SHALL display a combined card with HRV (SDNN ms) and resting heart rate (bpm).

#### Scenario: Composite card renders
- **WHEN** HRV and resting HR data exists
- **THEN** show latest HRV, latest resting HR, 7d averages, trend arrow

### Requirement: Dashboard trend chart card

The system SHALL display a line chart with daily kcal trend and 7-day moving average.

#### Scenario: Trend chart renders
- **WHEN** activity data exists
- **THEN** display a Chart.js line chart with daily kcal + 7-day MA

### Requirement: Remove current-day calories card

The system SHALL NOT display the "calorías de hoy" card.

#### Scenario: Current-day calories not displayed
- **WHEN** the dashboard renders
- **THEN** the dashboard SHALL NOT display a card showing current-day calorie data

### Requirement: Last data update timestamp

The system SHALL display the timestamp of the last data import/update on the dashboard.

#### Scenario: Last update shown
- **WHEN** the dashboard renders and import data exists
- **THEN** the dashboard SHALL display "Última actualización: {date} {time}"

#### Scenario: No import data
- **WHEN** no data has ever been imported
- **THEN** the dashboard SHALL display "Sin datos importados"
