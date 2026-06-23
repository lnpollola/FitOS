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

The system SHALL display a horizontal bar chart ranking activity types by total calories, plus a detail table with count, hours, and kcal per type, including trend indicators and Spanish names with icons.

#### Scenario: Ranking chart shows top activities by kcal
- **WHEN** workout data exists for the selected period
- **THEN** the system SHALL display a horizontal bar chart with activity types (in Spanish) on the Y axis and total calories on the X axis, ordered descending
- **THEN** each bar SHALL be colored by activity type and include an icon

#### Scenario: Activity detail table with trends
- **WHEN** workout data exists
- **THEN** the view SHALL display a table below the chart with columns: Tipo (Spanish), Count, Horas, kcal, Tendencia
- **THEN** rows SHALL be ordered by total kcal descending
- **THEN** each row SHALL include a trend arrow (▲/▼/―) comparing the period to the previous period

#### Scenario: Ranking empty state
- **WHEN** no workout data exists
- **THEN** the chart and table containers SHALL display "Sin actividades registradas"

### Requirement: Exercise recognition with icons

The system SHALL recognize sport activity types in the Tendencias view and display them with Spanish names and optional icons.

#### Scenario: Activities displayed with Spanish names
- **WHEN** workout data renders in Tendencias
- **THEN** each activity type SHALL be shown with its Spanish name (cycling → bicicleta, walking → caminata, boxing → boxeo, HIIT → HIIT, running → carrera, football → fútbol, paddle → pádel, swimming → natación, yoga → yoga, strength → fuerza, other → otro)

#### Scenario: Optional sport icons
- **WHEN** an activity type has a defined icon mapping
- **THEN** the system SHALL display an icon next to the activity name (using Unicode/emoji characters)

### Requirement: Activity category rankings

The system SHALL display rankings of sport activities by category with totals and trend indicators.

#### Scenario: Ranking by total calories
- **WHEN** workout data exists for the selected period
- **THEN** the system SHALL display a ranking table sorted by total kcal per activity type in descending order

#### Scenario: Ranking with session counts
- **WHEN** the ranking table renders
- **THEN** each row SHALL show: activity type (Spanish), session count, total hours, total kcal, average kcal/session

### Requirement: Trend indicators for activity data

The system SHALL display trend arrows next to activity totals comparing the current period against the previous period of equal length.

#### Scenario: Upward trend in activity
- **WHEN** total kcal in the current period exceeds the previous period
- **THEN** the system SHALL display a green ▲ next to the total

#### Scenario: Downward trend in activity
- **WHEN** total kcal in the current period is lower than the previous period
- **THEN** the system SHALL display a red ▼ next to the total

### Requirement: Secondary metrics section (collapsible)

The system SHALL provide a collapsible section with full-sized trend charts and KPI summary cards for additional health metrics.

#### Scenario: Collapsible section toggles visibility
- **WHEN** the user clicks the section header
- **THEN** the section SHALL expand or collapse with a smooth transition

#### Scenario: Secondary metrics render with axes and KPIs
- **WHEN** data exists
- **THEN** the section SHALL display full line charts with visible axes for: Resting Heart Rate, VO2 Max, Walking Speed, Walking/Running/Cycling Distance, Exercise Minutes, Flights Climbed
- **THEN** each chart SHALL include Y-axis labels and X-axis date labels
- **THEN** above each chart SHALL be a KPI card showing: current value, period avg, min, max

#### Scenario: Secondary metrics show only available data
- **WHEN** a specific metric has no data for the period
- **THEN** its chart SHALL display "Sin datos" — the section still renders with available metrics

### Requirement: Secondary metrics with axis values

The system SHALL display secondary metrics (resting HR, VO2 max, walking speed, distance, exercise minutes, flights climbed) with visible axis labels, values, and KPI summary cards.

#### Scenario: Secondary metrics chart with axes
- **WHEN** the secondary metrics section renders
- **THEN** each chart SHALL display visible Y-axis values and X-axis date labels

#### Scenario: KPIs for secondary metrics
- **WHEN** data exists for a secondary metric
- **THEN** the system SHALL display a KPI summary card above each chart showing: current value, period average, min, and max

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

### Requirement: Fix _loadingAnalytics race condition

The system SHALL fix the `_loadingAnalytics` guard to properly block concurrent `loadAll()` calls. The flag SHALL be set synchronously before the async `loadAll()` call and cleared in a `finally` block after it completes. Rapid filter-button clicks SHALL NOT spawn multiple parallel `loadAll()` invocations.

#### Scenario: Concurrent loadAll blocked
- **WHEN** `loadAll()` is in progress and the user clicks another range filter
- **THEN** the guard SHALL detect `_loadingAnalytics === true` and return early
- **THEN** no second `loadAll()` SHALL be spawned

#### Scenario: Flag cleared after error
- **WHEN** `loadAll()` throws an exception
- **THEN** the `finally` block SHALL set `_loadingAnalytics = false`
- **THEN** subsequent range clicks SHALL be able to trigger `loadAll()` again

### Requirement: Fix NaN bpm KPI when days exist but lack heart rate data

The system SHALL guard against division by zero in the `avgHr` KPI computation. When `daily.length > 0` but no days have `hr_media`, the KPI SHALL display "--" instead of "NaN bpm".

#### Scenario: NaN prevented when HR data missing
- **WHEN** `daily.filter(d => d.hr_media).length === 0` but `daily.length > 0`
- **THEN** the avgHr KPI SHALL display "-- bpm" (not "NaN bpm")
- **THEN** the computation SHALL check the filtered count, not just `daily.length`

### Requirement: Theme-aware chart colors via chartColorWithAlpha

The system SHALL replace all hardcoded chart fill/background/tooltip colors in `analytics.js` with `chartColorWithAlpha()` calls from `chart-theme.js`. No hardcoded hex or rgba color values SHALL remain in the view. The `ACTIVITY_COLORS` array SHALL be derived from CSS custom properties.

#### Scenario: No hardcoded colors
- **WHEN** analytics.js renders any chart
- **THEN** all fill, background, and tooltip colors SHALL come from `chartColors` or `chartColorWithAlpha()`
- **THEN** no hardcoded `'rgba(...)'` or `'#...'` color strings SHALL be present in the source

#### Scenario: Organic theme consistency
- **WHEN** `body.organic` is active
- **THEN** analytics charts SHALL use the same moss/bone/ember palette as other views
- **THEN** fills and borders SHALL be visually consistent (no teal/indigo mismatch)

### Requirement: Chart destroy-before-recreate in all analytics render functions

The system SHALL move all `if (window._*Chart) ...destroy()` calls to the TOP of each chart render function, before the empty-data early-return. This applies to all 6 main charts, `renderMiniChart`, and `renderMiniDistanceChart`.

#### Scenario: Chart destroyed before empty-state
- **WHEN** any analytics chart render function is called with empty data
- **THEN** the function SHALL destroy the existing chart instance first
- **THEN** the function SHALL render the empty-state message and return

### Requirement: Top-level empty state when Apple Health never imported

The system SHALL display a top-level empty state banner in the analytics view when no HealthSync data has been imported. The banner SHALL explain that Apple Health import is required and include a CTA button to navigate to the Activity view.

#### Scenario: No Apple Health data banner
- **WHEN** all health metric IPC calls return empty or `{ ok: false }`
- **THEN** a banner SHALL appear at the top of the analytics view
- **THEN** the banner SHALL display "Importa tus datos de Apple Health para ver tendencias"
- **THEN** the banner SHALL include a button "Ir a Actividad" that navigates to the activity view

### Requirement: KPI cards with trend indicators

The system SHALL add period-over-period trend arrows to the 5 analytics KPI cards (avg steps, total energy, avg HR, avg sleep, avg HRV), consistent with the dashboard's pattern. The previous-period data (already fetched for the ranking table) SHALL be reused to compute deltas.

#### Scenario: KPI trend arrow renders
- **WHEN** a KPI card renders with current and previous period data
- **THEN** the card SHALL display a trend arrow (▲/▼/―) comparing current vs previous
- **THEN** the arrow SHALL use the same color coding as dashboard (green up, red down, gray flat)

### Requirement: Walking and cycling distance mini-cards with KPI stats

The system SHALL add current/avg/min/max KPI stats to the walking and cycling distance mini-cards, consistent with the other 5 secondary metric cards.

#### Scenario: Distance cards show stats
- **WHEN** the secondary metrics grid renders
- **THEN** the walking distance card SHALL show current, avg, min, and max km values
- **THEN** the cycling distance card SHALL show current, avg, min, and max km values

### Requirement: Custom date range validation

The system SHALL validate that `from <= to` in the custom date range selector. If the user enters a reversed range, a validation message SHALL appear and `loadAll()` SHALL NOT be called.

#### Scenario: Reversed range rejected
- **WHEN** the user sets `from` to a date later than `to` and clicks apply
- **THEN** the system SHALL display "La fecha de inicio debe ser anterior a la fecha final"
- **THEN** `loadAll()` SHALL NOT be called

### Requirement: Debounced custom date apply

The system SHALL debounce the custom date range apply button to prevent rapid multi-fire. A 300ms debounce SHALL be applied.

#### Scenario: Rapid clicks debounced
- **WHEN** the user clicks the apply button rapidly multiple times
- **THEN** only the last click SHALL trigger `loadAll()`
- **THEN** intermediate clicks SHALL be ignored
