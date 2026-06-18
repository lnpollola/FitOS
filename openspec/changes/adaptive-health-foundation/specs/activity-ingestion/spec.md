## ADDED Requirements

### Requirement: Import daily activity metrics from file upload

The system SHALL accept CSV or JSON file uploads containing wearable/health-dashboard daily metrics and normalize them into a canonical activity-day record.

#### Scenario: Successful CSV import with all fields

- **WHEN** a user uploads a well-formed CSV containing date, steps, active_calories, heart_rate_avg, sleep_hours, and weight_kg columns
- **THEN** the system SHALL parse all rows, create activity-day records, and display a success summary showing date range and record count

#### Scenario: Partial import with missing optional fields

- **WHEN** a user uploads a CSV missing optional fields such as sleep_hours or heart_rate_avg
- **THEN** the system SHALL import available fields, set missing optional fields to null, and flag which columns were not found

#### Scenario: Invalid file format rejected

- **WHEN** a user uploads a file with an unsupported format (e.g., .xlsx or .png)
- **THEN** the system SHALL reject the upload and display an error message listing supported formats

### Requirement: Manual entry of daily metrics

The system SHALL allow users to manually enter or edit daily metrics (steps, active calories, resting calories, heart rate, sleep, weight) through a form when file import is not available.

#### Scenario: Create new activity-day entry

- **WHEN** a user opens the activity entry form, populates fields, and saves
- **THEN** the system SHALL create a new activity-day record with the current date as default and a timestamp

#### Scenario: Edit existing activity-day entry

- **WHEN** a user opens an existing activity-day record, modifies one or more fields, and saves
- **THEN** the system SHALL update the record and display the updated values

### Requirement: View activity history as a timeline

The system SHALL display a scrollable daily timeline of activity metrics with date, step count, calorie burn, and weight.

#### Scenario: Timeline shows most recent first

- **WHEN** a user navigates to the activity timeline view
- **THEN** the system SHALL display activity-day records sorted by date descending, with the most recent entry at the top

#### Scenario: Timeline highlights missing days

- **WHEN** a date in the timeline range has no activity-day record
- **THEN** the system SHALL display that date with a dashed outline or placeholder indicating no data
