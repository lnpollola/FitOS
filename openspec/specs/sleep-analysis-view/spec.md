# Sleep Analysis View

## Purpose

Provide a dedicated sleep analysis view with KPIs (averages, consistency, trend), phase breakdown charts (deep, REM, light), and a sleep duration timeline, using data from the `activity_days` table populated via HealthSync Apple Health import.

## Requirements

### Requirement: Dedicated sleep analysis view

The system SHALL provide a dedicated sleep analysis view accessible from the sidebar navigation, displaying sleep KPIs, phase breakdown charts, and a sleep duration timeline using data from the `activity_days` table.

#### Scenario: Sleep view accessible from sidebar
- **WHEN** the user clicks the "Sueño" nav item in the sidebar
- **THEN** the sleep analysis view SHALL activate and render

#### Scenario: Sleep KPIs displayed
- **WHEN** the sleep view loads with at least 7 days of sleep data
- **THEN** the system SHALL display KPI cards for: promedio de sueño (7d), consistencia (CV), tendencia (mejorando/empeorando/estable)
- **THEN** each KPI card SHALL use the organic design tokens (Fraunces for values, Source Sans 3 for labels)

#### Scenario: No sleep data
- **WHEN** the sleep view loads and no sleep data exists
- **THEN** the system SHALL display an empty state with instructions to import data via Apple Health or CSV

### Requirement: Sleep phase breakdown charts

The system SHALL render charts showing the distribution of sleep phases (deep, REM, light) over time, using a stacked bar chart with the organic color palette.

#### Scenario: Phase chart with data
- **WHEN** the user has sleep phase data (deep, REM, light) for at least 3 days
- **THEN** the system SHALL render a stacked bar chart with one stack per phase
- **THEN** the chart SHALL use the organic palette: deep in moss, REM in ember, light in bone-toned accent
- **THEN** the chart SHALL display date labels on the x-axis and hours on the y-axis

#### Scenario: Phase chart without phase data
- **WHEN** sleep hours exist but phase data (deep, REM, light) is NULL for all days
- **THEN** the system SHALL hide the phase chart and display "Datos de fases no disponibles — requiere importación desde Apple Health"

### Requirement: Sleep duration timeline

The system SHALL render a timeline chart of total sleep hours per night over the available date range, with a 7-day moving average overlay.

#### Scenario: Timeline with moving average
- **WHEN** the user has 7+ days of sleep data
- **THEN** the system SHALL render a line chart of sleep hours per night
- **THEN** the system SHALL overlay a 7-day moving average line in a contrasting organic color
- **THEN** the chart SHALL be destroy-before-recreate to prevent Chart.js canvas conflicts

#### Scenario: Timeline with fewer than 7 days
- **WHEN** the user has fewer than 7 days of sleep data
- **THEN** the system SHALL render the line chart without a moving average
- **THEN** the chart SHALL display all available data points

### Requirement: Sleep consistency metric

The system SHALL compute and display a sleep consistency metric using the coefficient of variation (CV = stddev / mean × 100) of sleep hours over the available data.

#### Scenario: Consistent sleep
- **WHEN** the CV is less than 10%
- **THEN** the system SHALL display "Consistente" with a green compliance indicator

#### Scenario: Irregular sleep
- **WHEN** the CV is between 10% and 20%
- **THEN** the system SHALL display "Irregular" with a yellow warning indicator

#### Scenario: Very irregular sleep
- **WHEN** the CV exceeds 20%
- **THEN** the system SHALL display "Muy irregular" with a red warning indicator

### Requirement: Sleep trend indicator

The system SHALL compute a sleep trend by comparing the mean of the first half of the data against the mean of the second half, and display a directional indicator.

#### Scenario: Improving trend
- **WHEN** the second-half mean exceeds the first-half mean by more than 5%
- **THEN** the system SHALL display "Mejorando" with an upward green arrow

#### Scenario: Worsening trend
- **WHEN** the second-half mean is below the first-half mean by more than 5%
- **THEN** the system SHALL display "Empeorando" with a downward red arrow

#### Scenario: Stable trend
- **WHEN** the difference between halves is within 5%
- **THEN** the system SHALL display "Estable" with a neutral dash indicator

### Requirement: Sleep view respects organic design system

The system SHALL render the sleep view using the global organic design tokens (`body.organic`), with Fraunces for headings and KPI values, Source Sans 3 for body text, and the moss/bone/ember color palette.

#### Scenario: Organic tokens applied
- **WHEN** the sleep view renders
- **THEN** all fonts SHALL use Fraunces (headings, KPI values) and Source Sans 3 (labels, body)
- **THEN** cards SHALL use the organic card styling with moss accent borders
- **THEN** chart colors SHALL use the organic chart theme

### Requirement: Sleep view IPC handlers

The system SHALL use the existing `db:getSleepAnalysis` IPC handler to fetch sleep data, computing averages, consistency, and trends server-side. Phase breakdown data SHALL be queried from `activity_days` fields `sleep_deep`, `sleep_rem`, `sleep_light`.

#### Scenario: Data fetched via existing handler
- **WHEN** the sleep view initializes
- **THEN** the system SHALL call `db:getSleepAnalysis` with the appropriate date range
- **THEN** the handler SHALL return totalAvg, deepAvg, remAvg, lightAvg, consistency, and trendArrow
- **THEN** the view SHALL NOT require new IPC handlers
