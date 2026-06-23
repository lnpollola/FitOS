## MODIFIED Requirements

### Requirement: Top-5 history table

The measurement history table SHALL display the 10 most recent entries per page with pagination controls (Anterior/Siguiente and page counter), ordered by date descending (most recent first). Each metric cell SHALL show a trend arrow comparing to the previous row. The table SHALL be responsive with horizontal scroll when needed and sticky first column.

#### Scenario: History shows 10 most recent with trend arrows
- **WHEN** a user navigates to the measurements view
- **THEN** the history table SHALL show the 10 most recent measurement sets, ordered by date descending
- **THEN** each metric cell SHALL display a small ▲/▼/― arrow based on comparison to the immediately previous entry's value

#### Scenario: Trend arrow thresholds
- **WHEN** comparing two sequential measurement values
- **THEN** increase > 0.5 cm SHALL show ▲ (orange/red for waist, green for biceps — context-dependent, neutral gray for most)
- **THEN** decrease > 0.5 cm SHALL show ▼
- **THEN** change ≤ 0.5 cm SHALL show ―

#### Scenario: Pagination controls
- **WHEN** there are more than 10 measurement sets
- **THEN** pagination controls SHALL appear below the table with "Anterior", "Siguiente", and a page counter like "Página 1 de 3"
- **THEN** clicking "Siguiente" SHALL show the next 10 entries
- **THEN** clicking "Anterior" SHALL show the previous 10 entries
- **THEN** the "Anterior" button SHALL be disabled on page 1
- **THEN** the "Siguiente" button SHALL be disabled on the last page

#### Scenario: Fewer than 10 entries
- **WHEN** there are 10 or fewer measurement sets
- **THEN** pagination controls SHALL be hidden
- **THEN** all entries SHALL be displayed

### Requirement: View measurement history as a responsive table

The system SHALL display measurement sets in a responsive table that scrolls horizontally when the viewport is too narrow, with a sticky date column that remains visible during horizontal scroll. The table SHALL NOT show permanent horizontal and vertical scrollbars; scrollbars SHALL only appear when content overflows.

#### Scenario: Responsive table adapts to viewport
- **WHEN** the viewport width is below 900px
- **THEN** the table SHALL enable horizontal scroll with sticky first column (date)
- **THEN** scrollbars SHALL only appear on hover/scroll, not permanently

#### Scenario: Table container sizing
- **WHEN** the history table renders
- **THEN** the table container SHALL use `overflow-x: auto` with `max-width: 100%`
- **THEN** the table SHALL NOT overflow its parent container causing layout shifts
- **THEN** the date column SHALL remain fixed (sticky) during horizontal scroll

### Requirement: Track body measurements over time

The system SHALL allow the user to record and store body measurements across 13 metrics plus weight, with date and optional notes. The input form SHALL be organized into 4 fieldsets grouped by body part (Cuello y Hombros, Torso, Brazos, Piernas), each with a representative icon. The form SHALL correctly pre-fill the weight input field with the most recent weight value.

#### Scenario: New measurement form pre-fills weight correctly
- **WHEN** a user opens the body measurement form and previous measurement data exists
- **THEN** all metric input fields SHALL show the most recent value for each metric as the default/placeholder
- **THEN** the weight input field SHALL show the most recent weight_kg value
- **THEN** the weight value SHALL NOT be assigned to an incorrect DOM element

#### Scenario: No previous measurements
- **WHEN** no measurement data exists
- **THEN** all inputs SHALL be empty with placeholder text

## ADDED Requirements

### Requirement: Average weight displays correct unit

The system SHALL display the average weight metric in the monthly weight summary table with the correct unit label ("kg") using `strings.general.unitKg`, never showing "undefined" as the unit.

#### Scenario: Average weight with correct unit
- **WHEN** the monthly weight summary table renders
- **THEN** the "Peso medio" row SHALL display the average value followed by "kg"
- **THEN** "undefined" SHALL never appear as the unit label

#### Scenario: Average weight computed correctly
- **WHEN** the user has weight entries for a given month
- **THEN** the average SHALL be computed as the arithmetic mean of all weight values in that month
- **THEN** the value SHALL be displayed with one decimal place

### Requirement: Measurement sets ordered by date descending

The system SHALL return measurement sets ordered by date in descending order (most recent first) from the `db:getMeasurementSets` handler, so the history table and before/after comparison use the correct chronological order.

#### Scenario: Handler returns newest first
- **WHEN** `db:getMeasurementSets` is called
- **THEN** the returned array SHALL have the most recent date at index 0
- **THEN** older entries SHALL follow in descending date order

#### Scenario: History table shows newest first
- **WHEN** the history table renders page 1
- **THEN** the first row SHALL be the most recent measurement set
- **THEN** subsequent rows SHALL be progressively older
