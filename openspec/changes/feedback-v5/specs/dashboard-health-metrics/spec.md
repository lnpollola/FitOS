# Dashboard Health Metrics — Sleep Card

## Purpose

Add sleep tracking from `activity_days.sleep_hours` to the dashboard health metrics row.

## ADDED Requirements

### Requirement: Sleep card on dashboard

The system SHALL display sleep hours as a health metric card on the dashboard, using data from the app's `activity_days` table rather than HealthSync.

#### Scenario: Sleep card renders in health metrics row
- **WHEN** the dashboard loads and sleep data exists for the selected period
- **THEN** the system SHALL display a sleep card alongside existing health metrics (standing hours, exercise time, SpO2, HRV+RHR, walking distance)
- **THEN** the card SHALL show average sleep hours for the period and a 7-day trailing average

#### Scenario: Sleep card empty state
- **WHEN** no sleep data exists for the selected period
- **THEN** the card SHALL display "--" without breaking the layout
