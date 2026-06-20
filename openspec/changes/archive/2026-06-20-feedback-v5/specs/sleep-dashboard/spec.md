# Sleep Dashboard

## Purpose

Display sleep metrics on the dashboard using existing data from `activity_days.sleep_hours`, showing average sleep hours for the selected period with trend and compliance indicator.

## ADDED Requirements

### Requirement: Sleep card on dashboard

The system SHALL display a sleep summary card on the dashboard showing average sleep hours for the selected period (7d/15d/1m) from `activity_days.sleep_hours`.

#### Scenario: Sleep card renders with data
- **WHEN** the dashboard loads and sleep data exists for the selected period
- **THEN** the system SHALL display a card showing average sleep hours for the period
- **THEN** the card SHALL display a 7-day trailing average
- **THEN** the card SHALL show a trend arrow (▲/▼/―) comparing the current period to the previous period

#### Scenario: Sleep card empty state
- **WHEN** no sleep data exists for the selected period
- **THEN** the system SHALL display "--" as the value with neutral styling

#### Scenario: Sleep compliance indicator
- **WHEN** average sleep is between 7 and 9 hours (inclusive)
- **THEN** the system SHALL display a green "Óptimo" label
- **WHEN** average sleep is below 7 or above 9 hours
- **THEN** the system SHALL display a yellow "Ajustar" label

### Requirement: IPC handler for sleep data

The system SHALL provide an IPC handler `db:getSleepData(from, to)` that returns sleep hours aggregated by date.

#### Scenario: Sleep data query
- **WHEN** the dashboard requests sleep data for a date range
- **THEN** the system SHALL return an array of `{ date, sleep_hours }` from `activity_days` where `sleep_hours IS NOT NULL`
- **THEN** the system SHALL return a 7-day trailing average as a separate field
- **THEN** failed queries SHALL return `{ ok: false, error: message }` without crashing
