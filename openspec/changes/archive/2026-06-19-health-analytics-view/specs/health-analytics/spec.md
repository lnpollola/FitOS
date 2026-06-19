# Health Analytics

## Purpose

Visualizar tendencias, KPIs y rankings de los datos recolectados del Apple Watch mediante HealthSync, con filtros temporales configurables y una cuadrícula de gráficos 2x3.

## Requirements

### Requirement: Date range filter

The system SHALL provide a date range filter at the top of the view with quick-access buttons and custom range selection.

#### Scenario: Quick-access buttons set predefined ranges
- **WHEN** the user clicks "7d" / "1m" / "3m" / "Año" button
- **THEN** the view SHALL update all charts and KPIs to show data for the selected range: 7 days, 30 days, 90 days, or current year (Jan 1 to today) respectively

#### Scenario: Custom date range via date inputs
- **WHEN** the user selects custom "Desde" and "Hasta" dates
- **THEN** the view SHALL update all charts and KPIs to show data for that custom range

#### Scenario: Active filter visually indicated
- **WHEN** a date range is selected
- **THEN** the corresponding button SHALL have a visual active state (e.g., accent color, filled style)

### Requirement: KPI summary cards

The system SHALL display 5 summary KPIs for the selected period above the chart grid.

#### Scenario: KPI cards show period averages and totals
- **WHEN** data exists for the selected period
- **THEN** the view SHALL display: pasos promedio/día, energía total (kcal activas + basales), FC media, sueño promedio/noche, HRV promedio

#### Scenario: KPI cards show empty state
- **WHEN** no data exists for the selected period
- **THEN** the KPI card SHALL display "--" or a "sin datos" indicator

### Requirement: Steps trend chart

The system SHALL display a line chart of daily step count with a 7-day moving average overlay.

#### Scenario: Steps chart renders with MA7
- **WHEN** step data exists for the selected period
- **THEN** the system SHALL plot daily steps as a line series AND a 7-day moving average as a dashed line overlay
- **THEN** the chart SHALL show total steps for the period in the legend or annotation

#### Scenario: Steps chart empty state
- **WHEN** no step data exists for the selected period
- **THEN** the chart container SHALL display "Sin datos de pasos para este período"

### Requirement: Heart rate range chart

The system SHALL display a heart rate chart showing daily average, minimum, and maximum values as a range band.

#### Scenario: HR chart shows min/avg/max band
- **WHEN** heart rate data exists for the selected period
- **THEN** the system SHALL plot daily average as a line, with a filled area between daily minimum and maximum values
- **THEN** the legend SHALL label avg, min, and max series

#### Scenario: HR chart handles partial data
- **WHEN** some days have HR data and others do not
- **THEN** the chart SHALL show only days with data (no zero-fill)

### Requirement: Energy stacked bar chart

The system SHALL display a stacked bar chart of daily active and basal (resting) energy burned.

#### Scenario: Energy chart shows stacked composition
- **WHEN** energy data exists for the selected period
- **THEN** the system SHALL plot daily active energy and basal energy as stacked bars with distinct colors
- **THEN** the legend SHALL label "Activas" and "Basales"

#### Scenario: Energy chart total annotation
- **WHEN** energy data exists
- **THEN** the chart SHALL display total energy burned for the period as a subtitle or annotation

### Requirement: HRV trend chart

The system SHALL display a line chart of daily heart rate variability (SDNN) values.

#### Scenario: HRV chart renders daily values
- **WHEN** HRV data exists for the selected period
- **THEN** the system SHALL plot daily HRV as a line chart
- **THEN** the chart SHALL show average, minimum, and maximum HRV for the period

#### Scenario: HRV chart empty state
- **WHEN** no HRV data exists
- **THEN** the chart container SHALL display "Sin datos de HRV"

### Requirement: Sleep trend chart

The system SHALL display a mixed chart of daily sleep hours with a 7-day moving average overlay.

#### Scenario: Sleep chart renders bars with MA7 line
- **WHEN** sleep data exists for the selected period
- **THEN** the system SHALL plot daily sleep hours as bars AND a 7-day moving average as a line overlay
- **THEN** the chart SHALL show average sleep hours for the period

#### Scenario: Sleep chart empty state
- **WHEN** no sleep data exists
- **THEN** the chart container SHALL display "Sin datos de sueño"

### Requirement: Activity ranking chart and table

The system SHALL display a horizontal bar chart ranking activity types by total calories, plus a detail table with count, hours, and distance per type.

#### Scenario: Ranking chart shows top activities by kcal
- **WHEN** workout data exists for the selected period
- **THEN** the system SHALL display a horizontal bar chart with activity types on the Y axis and total calories on the X axis, ordered descending
- **THEN** each bar SHALL be colored by activity type

#### Scenario: Activity detail table
- **WHEN** workout data exists
- **THEN** the view SHALL display a table below the chart with columns: Tipo, Count, Horas, kcal, Distancia (km)
- **THEN** rows SHALL be ordered by total kcal descending

#### Scenario: Ranking empty state
- **WHEN** no workout data exists
- **THEN** the chart and table containers SHALL display "Sin actividades registradas"

### Requirement: Secondary metrics section (collapsible)

The system SHALL provide a collapsible section with trend charts for additional health metrics.

#### Scenario: Collapsible section toggles visibility
- **WHEN** the user clicks the section header
- **THEN** the section SHALL expand or collapse with a smooth transition

#### Scenario: Secondary metrics render as mini line charts
- **WHEN** data exists
- **THEN** the section SHALL display line charts for: Resting Heart Rate, VO2 Max, Walking Speed, Walking/Running Distance, Exercise Minutes, Flights Climbed
- **THEN** each chart SHALL be a simplified line chart (no legend, no grid labels)

#### Scenario: Secondary metrics show only available data
- **WHEN** a specific metric has no data for the period
- **THEN** its chart SHALL display "Sin datos" — the section still renders with available metrics

### Requirement: Data source from HealthSync

The system SHALL query HealthSync database directly for all chart data, using date-range-filtered queries.

#### Scenario: Queries use date range parameters
- **WHEN** the user selects a date range
- **THEN** all IPC queries SHALL pass `from` and `to` date parameters to HealthSync DB queries

#### Scenario: New IPC handlers expose additional metrics
- **WHEN** the view loads
- **THEN** the system SHALL use dedicated IPC handlers for: Resting Heart Rate, VO2 Max, Exercise Time, Walking Speed, Distance (walking/running/cycling), Workout Ranking
- **THEN** these handlers SHALL NOT modify the existing HealthSync DB or app DB

### Requirement: Navigation and view registration

The system SHALL register "Tendencias" as a new view accessible from the sidebar navigation.

#### Scenario: Sidebar shows Tendencias item
- **WHEN** the app loads
- **THEN** the sidebar SHALL display a "Tendencias" navigation item
- **WHEN** the user clicks "Tendencias"
- **THEN** the app SHALL navigate to `#view-analytics` and call the view's `init()` function

#### Scenario: Spanish UI strings
- **WHEN** the view renders
- **THEN** all labels, titles, empty states, and tooltips SHALL use strings from `locales/es.js` under the `analytics` namespace
