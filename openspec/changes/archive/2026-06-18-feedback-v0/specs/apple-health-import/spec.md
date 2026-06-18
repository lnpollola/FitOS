# Apple Health Import

## Purpose

Import Apple Health XML export data using the HealthSync CLI binary to populate activity, workout, measurement, and sleep records from the existing `apple-healt-export/exportar.xml` file.

## Requirements

### Requirement: Import via HealthSync CLI binary

The system SHALL use the `healthsync` Go CLI binary to parse the Apple Health XML export into a temporary SQLite database, then migrate the data into the application's health-data.db.

#### Scenario: One-time historical import flow
- **WHEN** a user triggers the initial import from `apple-healt-export/exportar.xml`
- **THEN** the system SHALL execute `healthsync parse exportar.xml` via child_process, wait for completion, then run a migration script that reads healthsync.db and inserts records into `activity_days`, `sport_activities`, `weight_entries`, and `measurement_sets`

#### Scenario: Progress displayed during parse
- **WHEN** healthsync is parsing the XML
- **THEN** the system SHALL display a real-time progress indicator with record count and rate

#### Scenario: Duplicate records are skipped
- **WHEN** a migrated record matches an existing record by date and type
- **THEN** the system SHALL skip the duplicate and report the count of skipped records

### Requirement: HealthSync to app schema mapping

The system SHALL map HealthSync tables to the application's existing schema:

| HealthSync table | App table / columns | Aggregation |
|---|---|---|
| `steps` | `activity_days.steps` | SUM(value) by date |
| `active_energy` | `activity_days.active_calories` | SUM(value) by date |
| `basal_energy` | `activity_days.resting_calories` | SUM(value) by date |
| `resting_heart_rate` | `activity_days.heart_rate_avg` | AVG(value) by date |
| `sleep` | `activity_days.sleep_hours` | SUM(duration) where value LIKE '%Asleep%' by date |
| `body_mass` | `weight_entries.weight_kg` | individual records |
| `workouts` | `sport_activities` | individual records with activity_type mapped |

#### Scenario: Workout activity_type mapped to sport_type
- **WHEN** a Workout record has `activity_type = "HKWorkoutActivityTypeCycling"`
- **THEN** the system SHALL map it to sport type "cycling" and insert into `sport_activities`

#### Scenario: Unknown activity_type logged
- **WHEN** a Workout record has an `activity_type` not in the mapping table
- **THEN** the system SHALL insert it with sport_type "other" and log the original type for review

#### Scenario: Body measurements extracted
- **WHEN** the XML contains body mass and other measurements
- **THEN** the system SHALL create weight_entries or measurement_set records with the available metrics

### Requirement: Future data entry via frontend

After the one-time historical import, the system SHALL provide a frontend form for manually adding new daily metrics, sport activities, and weight entries.

#### Scenario: Manual entry for new data
- **WHEN** a user has new health data after the historical import
- **THEN** the system SHALL allow adding individual records via the existing manual entry forms
