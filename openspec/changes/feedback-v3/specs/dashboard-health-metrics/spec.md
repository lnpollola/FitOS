# Dashboard Health Metrics

## Purpose

Expose additional health metrics from HealthSync not currently shown on the dashboard: blood pressure, blood glucose, time in zones, walking distance, standing hours, and compliance indicators.

## Requirements

### ADDED Requirements

### Requirement: Blood pressure card

The system SHALL display systolic and diastolic blood pressure with a compliance indicator.

#### Scenario: Blood pressure card renders with latest values
- **WHEN** blood pressure data exists for the selected period
- **THEN** the dashboard SHALL display a card showing latest systolic/diastolic values and period average

#### Scenario: Blood pressure compliance indicator
- **WHEN** systolic < 120 AND diastolic < 80
- **THEN** the indicator SHALL show green "Normal"
- **WHEN** systolic < 130
- **THEN** the indicator SHALL show yellow "Elevada"
- **WHEN** systolic >= 130
- **THEN** the indicator SHALL show red "Alta"

#### Scenario: Blood pressure empty state
- **WHEN** no blood pressure data exists
- **THEN** the card SHALL display "-- / --" with "Sin datos de presión"

### Requirement: Blood glucose card

The system SHALL display blood glucose level with a compliance indicator.

#### Scenario: Blood glucose card renders
- **WHEN** blood glucose data exists
- **THEN** the dashboard SHALL display a card showing latest glucose value in mg/dL

#### Scenario: Glucose compliance indicator
- **WHEN** glucose is between 70-100 mg/dL fasting
- **THEN** the indicator SHALL show green "Normal"
- **WHEN** glucose is between 100-125 mg/dL
- **THEN** the indicator SHALL show yellow "Elevada"
- **WHEN** glucose >= 126 mg/dL
- **THEN** the indicator SHALL show red "Alta"

#### Scenario: Blood glucose empty state
- **WHEN** no glucose data exists
- **THEN** the card SHALL display "-- mg/dL"

### Requirement: Time in zones card

The system SHALL display time spent in each heart rate zone.

#### Scenario: Time in zones renders
- **WHEN** time in zones data exists
- **THEN** the dashboard SHALL display total minutes in each zone

#### Scenario: Zone compliance indicator
- **WHEN** total time in zones 2-5 exceeds 150 minutes/week
- **THEN** the indicator SHALL show green "Cumple objetivo"
- **WHEN** below 150 minutes
- **THEN** the indicator SHALL show yellow "Por debajo del objetivo"

### Requirement: Walking distance card

The system SHALL display average walking distance per day.

#### Scenario: Walking distance renders
- **WHEN** walking distance data exists
- **THEN** the dashboard SHALL display average km/day

### Requirement: Standing hours card

The system SHALL display average standing hours per day with compliance.

#### Scenario: Standing hours renders
- **WHEN** standing hours data exists
- **THEN** the dashboard SHALL display average hours/day

#### Scenario: Standing hours compliance
- **WHEN** average >= 8 hours/day
- **THEN** green "Cumple objetivo"
- **WHEN** < 8 hours/day
- **THEN** yellow "Por debajo del objetivo"

### Requirement: Compliance summary section

The system SHALL display a compliance summary across all health metrics.

#### Scenario: Compliance summary renders
- **WHEN** at least one metric has data
- **THEN** display a summary with green check / red X per metric
