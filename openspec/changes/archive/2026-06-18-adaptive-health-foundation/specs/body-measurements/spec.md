## ADDED Requirements

### Requirement: Track body measurements over time

The system SHALL allow the user to record and store body measurements across 10 metrics plus weight, with date and optional notes.

#### Scenario: Record a measurement set

- **WHEN** a user enters a new set of body measurements (date, chest, neck, shoulders, biceps left, biceps right, forearm left, forearm right, waist, hips, thigh left, thigh right, calf left, calf right, weight_kg)
- **THEN** the system SHALL save the measurement set with the given date and display a confirmation

#### Scenario: Edit a previous measurement set

- **WHEN** a user opens an existing measurement record, modifies one or more fields, and saves
- **THEN** the system SHALL update the record and display the updated values

#### Scenario: View measurement history as a table

- **WHEN** a user navigates to the body measurements view
- **THEN** the system SHALL display all measurement sets sorted by date descending, in a table with one row per date

### Requirement: Display measurement trends as charts

The system SHALL display individual trend charts for each body metric over time, allowing the user to see progress in specific areas.

#### Scenario: View individual metric trend

- **WHEN** a user selects a metric (e.g., waist)
- **THEN** the system SHALL display a line chart with that metric's values over time, with dates on the x-axis

#### Scenario: Compare before and after

- **WHEN** a user selects two measurement sets (e.g., first and most recent)
- **THEN** the system SHALL show the deltas per metric (e.g., waist -9.5 cm, chest -4.5 cm)

### Requirement: Estimate body fat percentage

The system SHALL compute an estimated body fat percentage from the measurement data using the Navy circumference method (neck, waist, and hip measurements for the appropriate sex).

#### Scenario: Body fat calculated from measurements

- **WHEN** the user has at least one measurement set with neck, waist, and hip values
- **THEN** the system SHALL compute and display the estimated body fat percentage

#### Scenario: Body fat trend over time

- **WHEN** the user has multiple measurement sets
- **THEN** the system SHALL display estimated body fat percentage as a trend line alongside the weight trend

### Requirement: Track weight separately for trend computation

The system SHALL track weight as part of measurement sets and allow standalone weight entries for more frequent logging (e.g., weekly weigh-ins between measurement sessions).

#### Scenario: Log weight without full measurements

- **WHEN** a user enters only weight and date without the full measurement set
- **THEN** the system SHALL save the weight entry and include it in the weight trend chart

#### Scenario: Weight trend computed as moving average

- **WHEN** a user has 4+ weight entries over 2+ weeks
- **THEN** the system SHALL compute and display a 7-day moving average weight trend alongside individual weigh-ins
