# Dashboard Health Metrics

## Purpose

Expose additional health metrics from HealthSync not currently shown on the dashboard: standing hours, exercise time, walking distance, HRV + resting HR composite, SpO2, and blood pressure (always empty — requires external monitor).

Verified during exploration: `blood_pressure` has 0 records (AW doesn't measure BP), `blood_glucose` table does not exist (AW doesn't measure glucose), no pre-computed HR zones exist. Standing hours (28k rows), exercise time (59k rows), walking distance (309k rows), SpO2 (20k rows), and HRV (12k rows) all have abundant data.

## Requirements

### Requirement: Exercise time card

The system SHALL display average exercise minutes per day using the `exercise_time` HealthSync table.

#### Scenario: Exercise time card renders
- **WHEN** exercise_time data exists for the selected period
- **THEN** the dashboard SHALL display average minutes/day

#### Scenario: Exercise time compliance
- **WHEN** avg >= 30 minutes/day
- **THEN** green label "Cumple objetivo"
- **WHEN** < 30 minutes/day
- **THEN** yellow label "Por debajo del objetivo"

### Requirement: Standing hours card

The system SHALL display average standing hours per day using the `stand_hours` HealthSync table.

#### Scenario: Standing hours renders
- **WHEN** stand_hours data exists
- **THEN** the dashboard SHALL display average hours/day

#### Scenario: Standing hours compliance
- **WHEN** average >= 8 hours/day
- **THEN** green "Cumple objetivo"
- **WHEN** < 8 hours/day
- **THEN** yellow "Por debajo del objetivo"

### Requirement: Walking distance card

The system SHALL display average walking distance per day using `distance_walking_running`.

#### Scenario: Walking distance renders
- **WHEN** walking distance data exists
- **THEN** the dashboard SHALL display average km/day

### Requirement: SpO2 card

The system SHALL display latest blood oxygen saturation using the `spo2` table.

#### Scenario: SpO2 card renders
- **WHEN** SpO2 data exists
- **THEN** the dashboard SHALL display latest SpO2 percentage

#### Scenario: SpO2 compliance
- **WHEN** latest >= 95%
- **THEN** green "Normal"
- **WHEN** < 95%
- **THEN** yellow "Baja"

### Requirement: HRV + resting HR composite card

The system SHALL display a combined card with HRV (SDNN ms) and resting heart rate (bpm).

#### Scenario: Composite card renders
- **WHEN** HRV and resting HR data exists
- **THEN** show latest HRV, latest resting HR, 7d averages, trend arrow

### Requirement: Blood pressure card (data-dependent)

The system SHALL display a blood pressure card. Note: Apple Watch does not measure blood pressure. Data will come only if the user has an external BP monitor synced to Apple Health.

#### Scenario: Blood pressure card empty state
- **WHEN** no blood pressure data exists (most common case)
- **THEN** the card SHALL display "-- / --" with note "Requiere monitor externo de presión"

#### Scenario: Blood pressure card renders
- **WHEN** blood pressure data exists
- **THEN** the dashboard SHALL display a card showing latest systolic/diastolic values and period average
- **THEN** systolic < 120 AND diastolic < 80 → green "Normal"
- **THEN** systolic < 130 → yellow "Elevada"
- **THEN** systolic >= 130 → red "Alta"

### Requirement: Dashboard health metric IPC handlers

The system SHALL provide IPC handlers for all new health metrics, ideally batched into a single query.

#### Scenario: Batched metrics
- **WHEN** dashboard initializes
- **THEN** the system SHOULD call a single `health:getDashboardMetrics(from, to)` returning all metrics together, rather than 5 separate IPC calls
