# Activity Ingestion

## Purpose

Import Apple Watch CSV exports with daily metrics and per-sport workout data, normalize into canonical activity-day records and structured sport-activity records.

## Requirements

### Requirement: Import daily activity metrics from Apple Watch CSV export

The system SHALL accept CSV file uploads exported from Apple Watch / Apple Health containing daily metrics and per-sport workout data, and normalize them into canonical activity-day records with sport-specific activity breakdowns.

#### Scenario: Successful CSV import with daily metrics and sport activities
- **WHEN** a user uploads a CSV export containing date, steps, active_calories, resting_calories, heart_rate_avg, sleep_hours, weight_kg, and per-sport workout rows (cycling, boxing, HIIT, walking, football, paddle)
- **THEN** the system SHALL parse all rows, create an activity-day record for each date, and create individual sport-activity records for each workout with calories, duration, and sport type

#### Scenario: Import recognizes known sport types
- **WHEN** a CSV contains workout rows with sport labels (cycling, boxing, HIIT, walking, football, paddle)
- **THEN** the system SHALL map each workout to a canonical sport type and store it as a structured sport-activity record

#### Scenario: Partial import with missing optional fields
- **WHEN** a user uploads a CSV missing optional fields such as sleep_hours or heart_rate_avg
- **THEN** the system SHALL import available fields, set missing optional fields to null, and flag which columns were not found

#### Scenario: Invalid file format rejected
- **WHEN** a user uploads a file with an unsupported format
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

The system SHALL display a scrollable daily timeline of activity metrics with date, step count, calorie burn (total and per-sport breakdown), and weight.

#### Scenario: Timeline shows most recent first
- **WHEN** a user navigates to the activity timeline view
- **THEN** the system SHALL display activity-day records sorted by date descending, with the most recent entry at the top, including a per-sport breakdown of activity calories

#### Scenario: Timeline highlights missing days
- **WHEN** a date in the timeline range has no activity-day record
- **THEN** the system SHALL display that date with a dashed outline or placeholder indicating no data

### Requirement: View sport activity breakdown

The system SHALL display a breakdown of calories burned per sport type over a selected period (day, week, month).

#### Scenario: Weekly sport activity summary
- **WHEN** a user views the weekly activity summary
- **THEN** the system SHALL show a bar chart or table with total calories per sport type for the selected week

## TBD

- CSV export format versioning and migration
- Monthly and custom date range aggregation
- Export activity data as CSV
