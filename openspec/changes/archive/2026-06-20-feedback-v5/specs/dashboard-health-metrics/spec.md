# Dashboard Health Metrics — Sleep Card + Error Handling

## Purpose

Add sleep tracking from `activity_days.sleep_hours` to the dashboard health metrics row, and ensure all health metric cards handle IPC errors gracefully.

## ADDED Requirements

### Requirement: Sleep card on dashboard

The system SHALL display sleep hours as a health metric card on the dashboard, using data from the app's `activity_days` table rather than HealthSync.

#### Scenario: Sleep card renders in health metrics row
- **WHEN** the dashboard loads and sleep data exists for the selected period
- **THEN** the system SHALL display a sleep card alongside existing health metrics (standing hours, exercise time, SpO2, HRV+RHR, walking distance)
- **THEN** the card SHALL show average sleep hours for the period and a 7-day trailing average
- **THEN** the card SHALL show a trend arrow (▲/▼/―) comparing the current period to the previous period
- **THEN** sleep between 7-9h SHALL show green "Óptimo"; outside that range SHALL show yellow "Ajustar"

#### Scenario: Sleep card empty state
- **WHEN** no sleep data exists for the selected period
- **THEN** the card SHALL display "--" without breaking the layout

### Requirement: Health metrics IPC error resilience

The system SHALL handle IPC failures in health metric cards gracefully, displaying "--" or a neutral fallback without crashing the dashboard.

#### Scenario: Failed IPC calls show fallback
- **WHEN** an IPC call for any health metric fails (network error, DB locked, etc.)
- **THEN** the card SHALL display "--" for the affected metric
- **THEN** the dashboard SHALL continue rendering unaffected metrics
