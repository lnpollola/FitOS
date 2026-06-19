## ADDED Requirements

### Requirement: Default to last measured value

The system SHALL pre-fill all measurement selectors and inputs with the last recorded value for each metric when the user opens the measurement form.

#### Scenario: New measurement form pre-fills
- **WHEN** a user opens the body measurement form and previous measurement data exists
- **THEN** all metric input fields SHALL show the most recent value for each metric as the default/placeholder

#### Scenario: No previous measurements
- **WHEN** no measurement data exists
- **THEN** all inputs SHALL be empty with placeholder text

### Requirement: Spanish labels for all measurement metrics

The system SHALL display all measurement metric labels and categories in Spanish, using string keys from locales/es.js instead of programmatic key generation.

#### Scenario: Labels displayed in Spanish via string keys
- **WHEN** the body measurements view renders
- **THEN** all metric labels SHALL use translated keys from `strings.measurements`: chest → Pecho, neck → Cuello, shoulders → Hombros, bicepsLeft → Bíceps Izq, bicepsRight → Bíceps Der, forearmLeft → Antebrazo Izq, forearmRight → Antebrazo Der, waist → Cintura, hips → Cadera, thighLeft → Muslo Izq, thighRight → Muslo Der, calfLeft → Pantorrilla Izq, calfRight → Pantorrilla Der, weight → Peso
- **THEN** chart dataset labels SHALL use these same translated keys instead of `metric.replace(/_/g, ' ')`
- **THEN** the comparison table (`before/after/delta`) SHALL use these keys instead of raw metric names

#### Scenario: Missing metric key does not break UI
- **WHEN** a metric key exists in the database but has no corresponding string key in es.js
- **THEN** the view SHALL fall back to a formatted version of the key name

### Requirement: Formatted measurement history table

The system SHALL display the measurement history in a formatted table with proper alignment, units, and readable layout.

#### Scenario: History table renders with formatting
- **WHEN** a user views the measurement history
- **THEN** the table SHALL display each measurement set as a row with date, all metrics in columns, values formatted with 1 decimal place and units (cm, kg, %)

### Requirement: Trend charts for all body measurement variables

The system SHALL display individual trend charts for each body measurement variable, not just a selectable subset.

#### Scenario: All metrics have trend charts
- **WHEN** a user navigates to the measurements view
- **THEN** the system SHALL display line charts for each of: chest, neck, shoulders, biceps (L/R), forearm (L/R), waist, hips, thigh (L/R), calf (L/R), weight, and estimated body fat percentage

#### Scenario: Chart renders with responsive sizing
- **WHEN** a measurement trend chart renders
- **THEN** the chart SHALL have a fixed height container (e.g., 300px) and use responsive width

## MODIFIED Requirements

### Requirement: View measurement history as a table

The system SHALL display all measurement sets sorted by date descending, in a formatted table with clear column headers in Spanish, values with 1 decimal precision, and units displayed.

#### Scenario: History table renders with formatting
- **WHEN** a user navigates to the body measurements view
- **THEN** the system SHALL display all measurement sets sorted by date descending
- **THEN** each value SHALL be formatted with 1 decimal place and the unit (cm or kg) in the column header
- **THEN** column headers SHALL be in Spanish
- **THEN** the table SHALL use alternating row colors for readability
