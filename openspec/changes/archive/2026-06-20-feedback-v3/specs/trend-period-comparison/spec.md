# Trend Period Comparison

## Purpose

Period-over-period comparison with trend indicators (arrows, sparklines) across dashboard and activity views.

## Requirements

### ADDED Requirements

### Requirement: Period-over-period comparison for dashboard KPIs

The system SHALL compare current period KPIs against the same length previous period.

#### Scenario: Dashboard KPIs show trend arrows
- **WHEN** the dashboard renders
- **THEN** each KPI card SHALL display a trend arrow comparing current vs previous period
- **THEN** green ▲ for improvement, red ▼ for decline, gray ― for within 5%

#### Scenario: Dashboard trend chart card
- **WHEN** activity data exists
- **THEN** display a line chart with daily kcal trend and 7-day MA overlay

### Requirement: Activity view period-over-period comparison

The system SHALL display total calories per sport type with period comparison.

#### Scenario: Calorie totals with comparison
- **WHEN** the ranking table renders
- **THEN** "Total kcal" column SHALL include a trend arrow comparing vs previous period
- **THEN** clicking toggles between 15d, 1m, 3m windows

#### Scenario: Mini sparklines per sport type
- **WHEN** the ranking table renders
- **THEN** each row SHALL include a mini sparkline (60×18px) for last-7-day kcal trend

### Requirement: Weight variation

The system SHALL display weight variation over the selected period.

#### Scenario: Weight variation on dashboard
- **WHEN** >=2 weight entries exist for the period
- **THEN** show "±N kg" variation with trend arrow

#### Scenario: Insufficient data
- **WHEN** <2 weight entries
- **THEN** display "―" for variation

### Requirement: Steps multi-period comparison

The system SHALL display steps averages for 7d, 15d, 1m with trend arrows.

#### Scenario: Steps period cards
- **WHEN** dashboard renders
- **THEN** three compact cards showing steps for each period with trend arrow
