# Activity Ingestion (Delta)

## ADDED Requirements

### Requirement: Import Apple Health XML export

The system SHALL support importing activity data from Apple Health XML export files in addition to CSV files, using the HealthSync library.

#### Scenario: Apple Health XML import triggers
- **WHEN** a user clicks "Importar desde Apple Health" button
- **THEN** the system SHALL read `apple-healt-export/exportar.xml`, parse it via HealthSync, and insert activity-day records

### Requirement: Expanded sport types for HealthSync workouts

The system SHALL expand the sport type mapping to accommodate all HKWorkoutActivityType values from HealthSync, beyond the current set (cycling, boxing, HIIT, walking, football, paddle).

#### Scenario: New sport types created from HealthSync
- **WHEN** a Workout record with HKWorkoutActivityTypeRunning is imported
- **THEN** the system SHALL insert a sport_activity with sport_type "running"

#### Scenario: Unknown activity_type fallback
- **WHEN** a Workout record has an unrecognized activity_type
- **THEN** the system SHALL insert it with sport_type "other" and log the original type

### Requirement: Card-based activity view with pre-defined sessions

The system SHALL display sport activities as pre-defined session cards grouped by sport type, with checkboxes for multi-select instead of a single-row table.

#### Scenario: Sport activity cards
- **WHEN** a user views the activity page
- **THEN** the system SHALL show sport types as cards with session templates (pre-defined duration, calorie ranges based on historical data) and multi-select checkboxes

#### Scenario: Multi-select sport logging
- **WHEN** a user checks multiple sport type cards and confirms
- **THEN** the system SHALL create sport-activity records for each selected sport type with pre-filled default values that the user can adjust before saving
