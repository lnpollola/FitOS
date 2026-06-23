# Sleep Analysis

## ADDED Requirements

### Requirement: Expanded sleep card with phase breakdown

The system SHALL display a sleep card on the dashboard that includes total sleep hours, a breakdown of sleep phases (deep, REM, light), a sleep consistency score, and a 7d/15d trend chart. The data SHALL be sourced from `activity_days` columns `sleep_hours`, `sleep_deep`, `sleep_rem`, `sleep_light` populated by HealthSync import.

#### Scenario: Sleep card with full phase data
- **WHEN** sleep phase data (deep, REM, light) exists for the selected period
- **THEN** the card SHALL display a stacked horizontal bar showing deep/REM/light proportions
- **THEN** the card SHALL display average hours per phase as labeled segments
- **THEN** the card SHALL display total average sleep hours prominently

#### Scenario: Sleep card with partial phase data
- **WHEN** only `sleep_hours` exists but phase columns are NULL
- **THEN** the card SHALL display total hours only with note "Datos de fases no disponibles"
- **THEN** the card SHALL NOT render an empty stacked bar

#### Scenario: Sleep consistency score
- **WHEN** ≥ 7 days of sleep data exist
- **THEN** the system SHALL compute a consistency score as 100 − (std_dev(sleep_hours) × 20)
- **THEN** consistency ≥ 80 SHALL display green "Consistente"
- **THEN** consistency 60–79 SHALL display yellow "Irregular"
- **THEN** consistency < 60 SHALL display amber "Muy irregular"

#### Scenario: Sleep trend sparkline
- **WHEN** ≥ 2 nights of sleep data exist in the period
- **THEN** the card SHALL render a sparkline of nightly sleep hours
- **THEN** the sparkline SHALL show period-over-period trend arrow

### Requirement: Sleep data IPC handler

The system SHALL provide an IPC handler `db:getSleepAnalysis(from, to)` that returns aggregated sleep data including phases, averages, and consistency score.

#### Scenario: Sleep analysis query
- **WHEN** the dashboard requests sleep analysis for a date range
- **THEN** the handler SHALL return `{ totalAvg, deepAvg, remAvg, lightAvg, consistency, dailySeries: [{ date, total, deep, rem, light }], trendArrow }`
- **THEN** NULL phase values SHALL be returned as null (not 0) so the UI can distinguish missing data
- **THEN** failed queries SHALL return `{ ok: false, error: message }`
