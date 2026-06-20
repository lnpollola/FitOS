# Activity Ingestion

## Purpose

Fix weekly sport summary chart zero-duration bug and add period-over-period comparison with trend arrows and sparklines.

## Requirements

### ADDED Requirements

### Requirement: Weekly sport summary with session count and duration

The system SHALL display a "Deporte - Tipo" chart showing session count, average calories, and duration per sport type.

#### Scenario: Duration correctly displays non-zero values
- **WHEN** sport_activities has non-NULL duration_minutes
- **THEN** the chart SHALL display actual duration values
- **THEN** the IPC handler SHALL use COALESCE(duration_minutes, 0) and verify column aliases

#### Scenario: Sport summary chart shows all metrics
- **WHEN** sport activity data exists
- **THEN** the chart SHALL display session count, avg kcal, total minutes per sport type

#### Scenario: Custom period selection
- **WHEN** user selects a date range
- **THEN** the chart SHALL update for the selected range (not just 7 days)

### Requirement: Period comparison in ranking table

The system SHALL display period-over-period comparison in the ranking table.

#### Scenario: Total kcal with period comparison
- **WHEN** ranking table renders
- **THEN** "Total kcal" column includes trend arrow comparing vs previous period
- **THEN** clicking toggles between 15d, 1m, 3m

#### Scenario: Mini sparkline per sport type
- **WHEN** ranking table renders
- **THEN** each row includes a 60×18px sparkline for last-7-day kcal trend
