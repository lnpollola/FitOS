# Body Measurements — Delta

## MODIFIED Requirements

### Requirement: Track body measurements over time

The system SHALL allow the user to record and store body measurements across 13 metrics plus weight, with date and optional notes. The input form SHALL be organized into 4 fieldsets grouped by body part (Cuello y Hombros, Torso, Brazos, Piernas), each with a representative icon.

#### Scenario: Record a measurement set via body-part form
- **WHEN** a user opens the measurement form
- **THEN** the form SHALL display 4 fieldsets with icons: Cuello y Hombros, Torso, Brazos, Piernas
- **THEN** each fieldset SHALL contain its corresponding metric input fields pre-filled with last known values

#### Scenario: View measurement history as a responsive table
- **WHEN** a user navigates to the body measurements view
- **THEN** the system SHALL display measurement sets in a responsive table that scrolls horizontally only when needed
- **THEN** each row SHALL show per-metric trend arrows (▲/▼/―) comparing to the previous measurement
- **THEN** column headers SHALL be in Spanish and sticky on horizontal scroll

#### Scenario: Responsive table adapts to viewport
- **WHEN** the viewport width is below 900px
- **THEN** the table SHALL enable horizontal scroll with sticky first column (date)
- **THEN** the "Ver todo" button SHALL be fully functional at all widths

### Requirement: Display measurement trends as charts

The system SHALL replace the combined chest/neck/shoulders multi-line chart with an evolution chart that consolidates key torso metrics (chest, waist, hips) into a single meaningful visualization showing body shape change over time.

#### Scenario: Evolution chart replaces chest/neck/shoulders
- **WHEN** the measurements view renders
- **THEN** a consolidated evolution chart SHALL replace the previous chest+neck+shoulders chart
- **THEN** the chart SHALL display waist, chest, and hips as trend lines
- **THEN** each line SHALL show current value and delta vs first measurement as KPI overlay
- **THEN** neck and shoulders SHALL remain as individual compact trend charts

#### Scenario: Evolution chart with no data
- **WHEN** only 1 measurement set exists
- **THEN** the evolution chart SHALL display a single point per metric with "Más datos necesarios para ver tendencia"

### Requirement: Top-5 history table

The measurement history table SHALL display only the 5 most recent entries by default, with a "Ver todo" button to expand. Each metric cell SHALL show a trend arrow comparing to the previous row.

#### Scenario: History shows top-5 with trend arrows
- **WHEN** a user navigates to the measurements view
- **THEN** the history table SHALL show the 5 most recent measurement sets
- **THEN** each metric cell SHALL display a small ▲/▼/― arrow based on comparison to the immediately previous entry's value

#### Scenario: Trend arrow thresholds
- **WHEN** comparing two sequential measurement values
- **THEN** increase > 0.5 cm SHALL show ▲ (orange/red for waist, green for biceps — context-dependent, neutral gray for most)
- **THEN** decrease > 0.5 cm SHALL show ▼
- **THEN** change ≤ 0.5 cm SHALL show ―

## ADDED Requirements

### Requirement: All measurement metrics present in form

The system SHALL ensure all 13 metrics plus weight have corresponding input fields in the measurement form. Any missing metrics SHALL be added.

#### Scenario: Complete metric coverage
- **WHEN** the measurement form renders
- **THEN** inputs SHALL exist for: chest, neck, shoulders, biceps_left, biceps_right, forearm_left, forearm_right, waist, hips, thigh_left, thigh_right, calf_left, calf_right, weight_kg
- **THEN** no metric defined in the schema SHALL be missing from the form

### Requirement: Navy body-fat does not require hips for males

The system SHALL not require `hips_cm` for the Navy body-fat calculation when the user's sex is male. The male formula uses only neck and waist. The female formula uses neck, waist, and hips.

#### Scenario: Male body-fat without hips
- **WHEN** the user's sex is male and `neck_cm` and `waist_cm` exist but `hips_cm` is null
- **THEN** the system SHALL compute body fat using the male Navy formula
- **THEN** the estimate SHALL NOT show as unavailable due to missing hips

#### Scenario: Female body-fat requires hips
- **WHEN** the user's sex is female and `hips_cm` is null
- **THEN** the system SHALL display "Falta medición de cadera para estimar grasa corporal"

### Requirement: Chart labels aligned with data points

The system SHALL align chart labels with data points by filtering labels and data together. When a metric has null values, both the label and the data point for that date SHALL be excluded from the chart, or the data SHALL use `null` (sparse) with the label retained. The current implementation filters data but not labels, causing misaligned plots.

#### Scenario: Labels and data aligned
- **WHEN** a measurement chart renders with a metric that has null gaps
- **THEN** each data point SHALL be plotted at its correct date on the x-axis
- **THEN** labels and data arrays SHALL have the same length (both filtered, or both unfiltered with nulls)

### Requirement: Upsert on saveMeasurementSet

The system SHALL implement upsert for `saveMeasurementSet`: if a measurement set with the same date already exists, the handler SHALL update it rather than insert a duplicate. This prevents date collisions from corrupting the before/after comparison.

#### Scenario: Same date updates existing
- **WHEN** `db:saveMeasurementSet({ date, ... })` is called and a row with that date exists
- **THEN** the handler SHALL UPDATE the existing row
- **THEN** no duplicate rows with the same date SHALL be created

### Requirement: Remove dead getProfile call from loadHistory

The system SHALL remove the unused `api.getProfile()` call inside `loadHistory` that fetches profile data but never uses it. This eliminates a wasted IPC round-trip on every history render and "Ver todo" toggle.

#### Scenario: No wasted IPC in loadHistory
- **WHEN** `loadHistory` is called
- **THEN** `api.getProfile()` SHALL NOT be called within that function

### Requirement: Empty-state text for hidden charts

The system SHALL display an empty-state message (`strings.states.noData`) below any chart `<h2>` heading when the chart is hidden due to insufficient data. No heading SHALL have empty blank space below it.

#### Scenario: Hidden chart shows message
- **WHEN** a chart is hidden due to insufficient data
- **THEN** the chart's `<h2>` heading SHALL be followed by a `strings.states.noData` message
- **THEN** no blank space SHALL appear between the heading and the next section
