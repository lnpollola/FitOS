# Dashboard Health Metrics

## Purpose

Expose additional health metrics from HealthSync not currently shown on the dashboard: standing hours, exercise time, walking distance, HRV + resting HR composite, SpO2, and blood pressure (always empty — requires external monitor).

Verified during exploration: `blood_pressure` has 0 records (AW doesn't measure BP), `blood_glucose` table does not exist (AW doesn't measure glucose), no pre-computed HR zones exist. Standing hours (28k rows), exercise time (59k rows), walking distance (309k rows), SpO2 (20k rows), and HRV (12k rows) all have abundant data.
## Requirements
### Requirement: Exercise time card

The system SHALL display average exercise minutes per day using the `exercise_time` HealthSync table.

#### Scenario: Exercise time card renders
- **WHEN** exercise_time data exists for the selected period
- **THEN** the dashboard SHALL display average minutes/day

#### Scenario: Exercise time compliance
- **WHEN** avg >= 30 minutes/day
- **THEN** green label "Cumple objetivo"
- **WHEN** < 30 minutes/day
- **THEN** yellow label "Por debajo del objetivo"

### Requirement: Standing hours card

The system SHALL display average standing hours per day using the `stand_hours` HealthSync table.

#### Scenario: Standing hours renders
- **WHEN** stand_hours data exists
- **THEN** the dashboard SHALL display average hours/day

#### Scenario: Standing hours compliance
- **WHEN** average >= 8 hours/day
- **THEN** green "Cumple objetivo"
- **WHEN** < 8 hours/day
- **THEN** yellow "Por debajo del objetivo"

### Requirement: Walking distance card

The system SHALL display average walking distance per day using `distance_walking_running`.

#### Scenario: Walking distance renders
- **WHEN** walking distance data exists
- **THEN** the dashboard SHALL display average km/day

### Requirement: SpO2 card

The system SHALL display latest blood oxygen saturation using the `spo2` table.

#### Scenario: SpO2 card renders
- **WHEN** SpO2 data exists
- **THEN** the dashboard SHALL display latest SpO2 percentage

#### Scenario: SpO2 compliance
- **WHEN** latest >= 95%
- **THEN** green "Normal"
- **WHEN** < 95%
- **THEN** yellow "Baja"

### Requirement: HRV + resting HR composite card

The system SHALL display a combined card with HRV (SDNN ms) and resting heart rate (bpm).

#### Scenario: Composite card renders
- **WHEN** HRV and resting HR data exists
- **THEN** show latest HRV, latest resting HR, 7d averages, trend arrow

### Requirement: Blood pressure card (data-dependent)

The system SHALL display a blood pressure card. Note: Apple Watch does not measure blood pressure. Data will come only if the user has an external BP monitor synced to Apple Health.

#### Scenario: Blood pressure card empty state
- **WHEN** no blood pressure data exists (most common case)
- **THEN** the card SHALL display "-- / --" with note "Requiere monitor externo de presión"

#### Scenario: Blood pressure card renders
- **WHEN** blood pressure data exists
- **THEN** the dashboard SHALL display a card showing latest systolic/diastolic values and period average
- **THEN** systolic < 120 AND diastolic < 80 → green "Normal"
- **THEN** systolic < 130 → yellow "Elevada"
- **THEN** systolic >= 130 → red "Alta"

### Requirement: Dashboard health metric IPC handlers

The system SHALL provide IPC handlers for all new health metrics, ideally batched into a single query.

#### Scenario: Batched metrics
- **WHEN** dashboard initializes
- **THEN** the system SHOULD call a single `health:getDashboardMetrics(from, to)` returning all metrics together, rather than 5 separate IPC calls

### Requirement: Sleep card on dashboard

The system SHALL display sleep hours as a health metric card on the dashboard, using data from the app's `activity_days` table. The card SHALL include an inline sparkline of the period's nightly sleep hours when ≥ 2 days of data exist.

#### Scenario: Sleep card renders with data
- **WHEN** the dashboard loads and sleep data exists for the selected period
- **THEN** the system SHALL display a card showing average sleep hours for the period
- **THEN** the card SHALL display a 7-day trailing average
- **THEN** the card SHALL show a trend arrow (▲/▼/―) comparing the current period to the previous period
- **THEN** sleep between 7-9h SHALL show green "Óptimo"; outside that range SHALL show yellow "Ajustar"
- **THEN** when ≥ 2 nights exist the card SHALL render an `<svg class="spark">` between the value and the subtitle

#### Scenario: Sleep card empty state
- **WHEN** no sleep data exists for the selected period
- **THEN** the card SHALL display "--" without breaking the layout
- **THEN** the card SHALL NOT render a sparkline

### Requirement: IPC handler for sleep data

The system SHALL provide an IPC handler `db:getSleepData(from, to)` that returns sleep hours aggregated by date from `activity_days`.

#### Scenario: Sleep data query
- **WHEN** the dashboard requests sleep data for a date range
- **THEN** the system SHALL return an array of `{ date, sleep_hours }` from `activity_days` where `sleep_hours IS NOT NULL`
- **THEN** the system SHALL return a 7-day trailing average as a separate field
- **THEN** failed queries SHALL return `{ ok: false, error: message }` without crashing

### Requirement: Health metrics IPC error resilience

The system SHALL handle IPC failures in health metric cards gracefully, displaying "--" or a neutral fallback without crashing the dashboard.

#### Scenario: Failed IPC calls show fallback
- **WHEN** an IPC call for any health metric fails (network error, DB locked, etc.)
- **THEN** the card SHALL display "--" for the affected metric
- **THEN** the dashboard SHALL continue rendering unaffected metrics

### Requirement: Dashboard hero card with growth ring signature

The system SHALL render exactly one `.card-hero` element at the top of `#view-dashboard` (Row 1, full row span) showing the weekly average energy balance as a large Fraunces number with a `kcal` italic unit, a descriptive subtitle, and a legend. The hero SHALL contain an SVG growth ring (`utils/growth-ring.js`) on the left showing one arc per day in the selected period; the ring radius SHALL grow with day index (tree-ring metaphor) and the stroke width SHALL scale with the day's energy balance normalized across the period. The ring SHALL encode the same metric as the headline (energy balance), NOT step count. The ring SHALL be the dashboard's only signature element. The legend SHALL use balance-relative labels ("Excedente" for surplus days, "Déficit" for deficit days) instead of step-activity labels.

#### Scenario: Hero renders with valid data
- **WHEN** the dashboard loads and `avgBalance` is not null and `ringValues.length >= 1`
- **THEN** `.card-hero` SHALL render with `grid-template-columns: minmax(170px, 220px) 1fr`
- **THEN** the hero text SHALL show the balance number in Fraunces ≥ 40px
- **THEN** the growth ring SVG SHALL appear in the left column encoding daily energy balance values
- **THEN** the legend SHALL list "Excedente" (moss dot) and "Déficit" (ember dot)

#### Scenario: Hero collapses when no ring data
- **WHEN** the dashboard loads and `ringValues.length === 0`
- **THEN** `.card-hero` SHALL render with `grid-template-columns: 1fr`
- **THEN** the hero SHALL NOT include an empty left column or a placeholder ring
- **THEN** the hero SHALL NOT render the legend (legend refers to ring arcs that don't exist)
- **THEN** the activity summary row SHALL render immediately below `.card-hero` with no empty card slot between them

### Requirement: Growth ring renders as a visually complete disc for low day counts

The system SHALL provide `src/renderer/utils/growth-ring.js` exporting `growthRing(values)` returning an SVG string. For `N ≤ 14` days, arcs SHALL tile edge-to-edge with `gap = 0` so the ring reads as a complete disc; only the stroke-width variance reveals the day boundaries. For `N > 14` days, a `gap ≤ 0.6°` SHALL be permitted so individual days remain distinguishable. The renderer SHALL NOT leave a visible wedge at the 12 o'clock origin for any N ≥ 1.

#### Scenario: Low day count closes the ring
- **WHEN** `growthRing([5000, 7000, 4500, 8000, 6000, 9000, 5200])` (N = 7) is called
- **THEN** the SVG SHALL render a complete ring with no gap at the 12 o'clock origin
- **THEN** the sum of all arc sweep angles SHALL equal 360°
- **THEN** each arc SHALL connect to the start of the next with no visible gap

#### Scenario: High day count keeps small inter-day gaps
- **WHEN** `growthRing(values)` with `values.length === 30`
- **THEN** a small `gap ≤ 0.6°` between adjacent arcs SHALL be permitted
- **THEN** the sum of all arc sweeps plus all gaps SHALL equal 360°

#### Scenario: Single day still renders
- **WHEN** `growthRing([5000])` (N = 1) is called
- **THEN** the SVG SHALL render a complete circle (one arc with sweep = 360°)
- **THEN** the SVG SHALL NOT be empty

### Requirement: Health metric cards render inline sparklines when series available

The system SHALL render a `sparkline()` (from `src/renderer/utils/sparkline.js`) inside each dashboard `.dashboard-card` whose metric has 2 or more time-series data points in the selected period. Cards without a series (e.g. blood pressure, sessions summary) SHALL render without a sparkline and without any empty `<svg>` placeholder. The sparkline SHALL appear between the metric value and the subtitle.

#### Scenario: Weight card shows sparkline
- **WHEN** the dashboard renders and the selected period has ≥ 2 weight entries
- **THEN** the latest-weight `.dashboard-card` SHALL contain an `<svg class="spark">` element between the `.value` and the `.subtitle`

#### Scenario: HRV / RHR composite shows sparkline
- **WHEN** HRV data exists for ≥ 2 days in the period
- **THEN** the HRV composite `.dashboard-card` SHALL contain an `<svg class="spark">` element

#### Scenario: Steps card shows three independent period averages
- **WHEN** the dashboard renders the steps card
- **THEN** the card subtitle SHALL include the 7d, 15d, and 1m step averages
- **THEN** the 7d average SHALL be computed from the last 7 days of a 30-day daily summary fetch
- **THEN** the 15d average SHALL be computed from the last 15 days of the same 30-day fetch
- **THEN** the 1m average SHALL be computed from the full 30-day fetch
- **THEN** the three averages SHALL be independent of the selected chart date range
- **THEN** the renderer SHALL NOT render separate cards for "7d", "15d", and "1m" steps

#### Scenario: No empty SVG placeholder when series absent
- **WHEN** a card's metric series has < 2 data points
- **THEN** the card SHALL NOT contain an `<svg class="spark">` element
- **THEN** the card SHALL NOT contain any empty `<svg>` placeholder

### Requirement: Dashboard date range selector with 15d/1m/3m options

The system SHALL provide a fixed date range selector on the dashboard with exactly three options: "Últimos 15 días" (15d), "Último mes" (1m, 30 days), and "Últimos 3 meses" (3m, 90 days). The default range SHALL be 15d. The selector SHALL control the chart date range and all metric cards except the steps card's period averages (which are always computed from a 30-day window).

#### Scenario: Default range is 15d
- **WHEN** the dashboard loads for the first time
- **THEN** the selected range SHALL be 15d
- **THEN** the 15d filter button SHALL have the active class

#### Scenario: User selects 1m
- **WHEN** the user clicks the "Último mes" filter button
- **THEN** the dashboard SHALL re-render with data for the last 30 days
- **THEN** the 1m filter button SHALL have the active class

#### Scenario: User selects 3m
- **WHEN** the user clicks the "Últimos 3 meses" filter button
- **THEN** the dashboard SHALL re-render with data for the last 90 days
- **THEN** the 3m filter button SHALL have the active class

#### Scenario: 3m mapping in date-range utility
- **WHEN** `getRangeDates('3m')` is called
- **THEN** the function SHALL return a `from` date 90 days before today

### Requirement: Dashboard activity summary positioned at top

The system SHALL position the green "Resumen de Actividad" card (`.card-accent`) immediately after the hero card, not at the bottom of the dashboard. Per-sport detail cards SHALL follow the green summary card in the same grid row. The green summary SHALL remain full-width (`grid-column: 1 / -1`).

#### Scenario: Activity summary appears after hero
- **WHEN** the dashboard renders with activity data
- **THEN** the `.card-accent` "Resumen de Actividad" SHALL appear in the row immediately after `.card-hero`
- **THEN** per-sport `.dashboard-card` elements SHALL appear after the `.card-accent` in the same grid

#### Scenario: Activity summary absent when no sport data
- **WHEN** the dashboard renders with no sport activity data for the selected period
- **THEN** the green summary card SHALL NOT render
- **THEN** no empty placeholder SHALL appear in its place

### Requirement: Dashboard card layout eliminates blank grid gaps

The system SHALL arrange dashboard cards so that no large blank spaces appear between sections. The grid rows SHALL be structured to fill without leaving empty tracks. The kcal/día trend chart SHALL be positioned as the last row of the dashboard (full width), not between the health metric cards and the activity summary.

#### Scenario: No blank space between blood pressure and activity summary
- **WHEN** the dashboard renders with blood pressure and activity data
- **THEN** the health metric cards (steps, exercise, RHR, SpO2, BP) SHALL be in a grid row above the trend chart
- **THEN** the trend chart SHALL be the last row
- **THEN** no empty grid tracks SHALL be visible between the BP card and the trend chart

#### Scenario: Trend chart at bottom
- **WHEN** the dashboard renders with ≥ 2 days of daily data
- **THEN** the kcal/día trend Chart.js chart SHALL appear as the last visual element on the dashboard
- **THEN** the trend chart SHALL span the full width (`grid-column: 1 / -1`)

