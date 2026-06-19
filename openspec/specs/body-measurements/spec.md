# Body Measurements

## Purpose

Track 10 body metrics plus weight, display trend charts, compute estimated body fat percentage (Navy circumference method), and support comparison views.

## Requirements

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
- **THEN** the system SHALL display all measurement sets sorted by date descending
- **THEN** each value SHALL be formatted with 1 decimal place and the unit (cm or kg) in the column header
- **THEN** column headers SHALL be in Spanish
- **THEN** the table SHALL use alternating row colors for readability

#### Scenario: New measurement form pre-fills with last values
- **WHEN** a user opens the body measurement form and previous measurement data exists
- **THEN** all metric input fields SHALL show the most recent value for each metric as the default/placeholder

#### Scenario: No previous measurements
- **WHEN** no measurement data exists
- **THEN** all inputs SHALL be empty with placeholder text

### Requirement: Display measurement trends as charts

The system SHALL display individual trend charts for each body metric over time, allowing the user to see progress in specific areas.

#### Scenario: All metrics have trend charts
- **WHEN** a user navigates to the measurements view
- **THEN** the system SHALL display line charts for each of: chest, neck, shoulders, biceps (L/R), forearm (L/R), waist, hips, thigh (L/R), calf (L/R), weight, and estimated body fat percentage

#### Scenario: Chart renders with responsive sizing
- **WHEN** a measurement trend chart renders
- **THEN** the chart SHALL have a fixed height container (e.g., 300px) and use responsive width

#### Scenario: Compare before and after
- **WHEN** a user selects two measurement sets (e.g., first and most recent)
- **THEN** the system SHALL show the deltas per metric (e.g., waist -9.5 cm, chest -4.5 cm)

### Requirement: Spanish labels for all measurement metrics

The system SHALL display all measurement metric labels and categories in Spanish, using string keys from locales/es.js instead of programmatic key generation.

#### Scenario: Labels displayed in Spanish via string keys
- **WHEN** the body measurements view renders
- **THEN** all metric labels SHALL use translated keys from `strings.measurements`: chest → Pecho, neck → Cuello, shoulders → Hombros, bicepsLeft → Bíceps Izq, bicepsRight → Bíceps Der, forearmLeft → Antebrazo Izq, forearmRight → Antebrazo Der, waist → Cintura, hips → Cadera, thighLeft → Muslo Izq, thighRight → Muslo Der, calfLeft → Pantorrilla Izq, calfRight → Pantorrilla Der, weight → Peso
- **THEN** chart dataset labels SHALL use these same translated keys instead of `metric.replace(/_/g, ' ')`
- **THEN** the comparison table (before/after/delta) SHALL use these keys instead of raw metric names

#### Scenario: Missing metric key does not break UI
- **WHEN** a metric key exists in the database but has no corresponding string key in es.js
- **THEN** the view SHALL fall back to a formatted version of the key name

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
