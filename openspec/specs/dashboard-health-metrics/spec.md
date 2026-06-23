# Dashboard Health Metrics

## Purpose

Expose additional health metrics from HealthSync not currently shown on the dashboard: exercise time, walking distance, HRV + resting HR composite, sleep analysis, cycling distance, and per-sport activity breakdown. The dashboard SHALL display a hero card with energy balance growth ring at the top, followed by an activity summary, health metric cards with inline sparklines and trend comparison arrows, and a kcal/día trend chart at the bottom.

Verified during exploration: `blood_pressure` has 0 records (AW doesn't measure BP), `blood_glucose` table does not exist (AW doesn't measure glucose), no pre-computed HR zones exist. Exercise time (59k rows), walking distance (309k rows), and HRV (12k rows) all have abundant data. Standing hours, SpO2, and BP cards have been removed due to sparse or unreliable data.

## Requirements

### Requirement: Exercise time card

The system SHALL display average exercise minutes per day using the `exercise_time` HealthSync table. The card SHALL include total training hours from `sport_activities` when available.

#### Scenario: Exercise time card renders
- **WHEN** exercise_time data exists for the selected period
- **THEN** the dashboard SHALL display average minutes/day

#### Scenario: Exercise time with training hours
- **WHEN** sport_activities data exists
- **THEN** the card SHALL also display total training hours for the period
- **THEN** "Xh Ym entrenados" SHALL appear as subtitle

#### Scenario: Exercise time compliance
- **WHEN** avg >= 30 minutes/day
- **THEN** green label "Cumple objetivo"
- **WHEN** < 30 minutes/day
- **THEN** yellow label "Por debajo del objetivo"

### Requirement: Walking distance card

The system SHALL display average walking distance per day using `distance_walking_running`. The card SHALL include km total for the period and a trend sparkline.

#### Scenario: Walking distance renders with km total
- **WHEN** walking distance data exists
- **THEN** the dashboard SHALL display average km/day
- **THEN** the card SHALL display total km for the period as subtitle
- **THEN** when ≥ 2 days of data exist, a sparkline SHALL render

### Requirement: HRV + resting HR composite card

The system SHALL display a combined card with HRV (SDNN ms) and resting heart rate (bpm).

#### Scenario: Composite card renders
- **WHEN** HRV and resting HR data exists
- **THEN** show latest HRV, latest resting HR, 7d averages, trend arrow

### Requirement: Cycling distance card

The system SHALL display a cycling distance card on the dashboard showing average and total km for the selected period using `distance_cycling` from HealthSync.

#### Scenario: Cycling distance card renders
- **WHEN** cycling distance data exists for the selected period
- **THEN** the dashboard SHALL display average km/day
- **THEN** the card SHALL display total km for the period as subtitle
- **THEN** when ≥ 2 days of data exist, a sparkline SHALL render

#### Scenario: Cycling distance card empty state
- **WHEN** no cycling distance data exists
- **THEN** the card SHALL display "--" with note "Sin datos de ciclismo"

### Requirement: Dashboard health metric IPC handlers

The system SHALL provide IPC handlers for all new health metrics, ideally batched into a single query.

#### Scenario: Batched metrics
- **WHEN** dashboard initializes
- **THEN** the system SHOULD call a single `health:getDashboardMetrics(from, to)` returning all metrics together, rather than 5 separate IPC calls

### Requirement: Sleep card on dashboard

The system SHALL display sleep hours as a health metric card on the dashboard, using data from the app's `activity_days` table. The card SHALL include an inline sparkline of the period's nightly sleep hours when ≥ 2 days of data exist. The card SHALL include sleep phase breakdown (deep/REM/light) and a consistency score when phase data is available.

#### Scenario: Sleep card renders with data
- **WHEN** the dashboard loads and sleep data exists for the selected period
- **THEN** the system SHALL display a card showing average sleep hours for the period
- **THEN** the card SHALL display a 7-day trailing average
- **THEN** the card SHALL show a trend arrow (▲/▼/―) comparing the current period to the previous period
- **THEN** sleep between 7-9h SHALL show green "Óptimo"; outside that range SHALL show yellow "Ajustar"
- **THEN** when ≥ 2 nights exist the card SHALL render an `<svg class="spark">` between the value and the subtitle
- **THEN** when sleep phase data (deep/REM/light) is available, a stacked bar SHALL show phase proportions
- **THEN** a consistency score SHALL be displayed as a percentage badge

#### Scenario: Sleep card with full phase data
- **WHEN** sleep phase data (deep, REM, light) exists for the selected period
- **THEN** the card SHALL display a stacked horizontal bar showing deep/REM/light proportions
- **THEN** the card SHALL display average hours per phase as labeled segments
- **THEN** the card SHALL display total average sleep hours prominently

#### Scenario: Sleep card with partial phase data
- **WHEN** only `sleep_hours` exists but phase columns are NULL
- **THEN** the card SHALL display total hours only with note "Datos de fases no disponibles"
- **THEN** the card SHALL NOT render an empty stacked bar

#### Scenario: Sleep consistency score
- **WHEN** ≥ 7 days of sleep data exist
- **THEN** the system SHALL compute a consistency score as 100 − (std_dev(sleep_hours) × 20)
- **THEN** consistency ≥ 80 SHALL display green "Consistente"
- **THEN** consistency 60–79 SHALL display yellow "Irregular"
- **THEN** consistency < 60 SHALL display amber "Muy irregular"

#### Scenario: Sleep card empty state
- **WHEN** no sleep data exists for the selected period
- **THEN** the card SHALL display "--" without breaking the layout
- **THEN** the card SHALL NOT render a sparkline

### Requirement: IPC handler for sleep data

The system SHALL provide an IPC handler `db:getSleepAnalysis(from, to)` that returns aggregated sleep data including phases, averages, and consistency score.

#### Scenario: Sleep analysis query
- **WHEN** the dashboard requests sleep analysis for a date range
- **THEN** the handler SHALL return `{ totalAvg, deepAvg, remAvg, lightAvg, consistency, dailySeries: [{ date, total, deep, rem, light }], trendArrow }`
- **THEN** NULL phase values SHALL be returned as null (not 0) so the UI can distinguish missing data
- **THEN** failed queries SHALL return `{ ok: false, error: message }`

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

### Requirement: Growth ring legend matches ring encoding

The system SHALL fix the growth ring legend to match the actual ring encoding. The ring colors arcs by kcal magnitude (not balance surplus/deficit). The legend SHALL either relabel to reflect kcal magnitude tiers OR the ring SHALL be re-encoded to use balance values. The hero value and ring SHALL encode the same metric.

#### Scenario: Legend and ring encode the same metric
- **WHEN** the hero card renders with the growth ring
- **THEN** the legend labels SHALL match what the ring arcs encode
- **THEN** if the ring encodes balance, arcs SHALL be colored moss for surplus and ember for deficit
- **THEN** if the ring encodes kcal magnitude, the legend SHALL say "Alto gasto" / "Bajo gasto" instead of "Excedente" / "Déficit"

### Requirement: Health metric cards render inline sparklines when series available

The system SHALL render a `sparkline()` (from `src/renderer/utils/sparkline.js`) inside each dashboard `.dashboard-card` whose metric has 2 or more time-series data points in the selected period. Cards without a series SHALL render without a sparkline and without any empty `<svg>` placeholder. The sparkline SHALL appear between the metric value and the subtitle.

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

### Requirement: Trend period comparison arrows on all metric microcharts

The system SHALL display trend arrows on every dashboard metric card's microchart, comparing current period average to previous period average. Each card's sparkline SHALL visually encode the period-over-period trend.

#### Scenario: All metric cards show trend comparison
- **WHEN** the dashboard renders with ≥ 2 periods of data
- **THEN** every card with a sparkline (exercise, walking, cycling, sleep, HRV, steps) SHALL show a trend arrow
- **THEN** the arrow SHALL compare current period average to previous period average
- **THEN** change > 5% up SHALL show ▲ in green
- **THEN** change > 5% down SHALL show ▼ in red
- **THEN** change within ±5% SHALL show ― in gray

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

### Requirement: Steps averaging window connected to selected range

The system SHALL compute the 7d/15d/1m step averages from a window consistent with the selected date range. When the user selects "3m", the 7d/15d/1m averages SHALL be computed from the last 30 days of the 3m range (not a hardcoded 30-day window from today).

#### Scenario: Steps averages consistent with selected range
- **WHEN** the user selects a date range (15d, 1m, or 3m)
- **THEN** the 7d/15d/1m step averages SHALL be computed from data within the selected range
- **THEN** the averages SHALL NOT use a hardcoded 30-day window independent of the range selector

### Requirement: Per-sport metric cards with trend charts

The system SHALL display per-sport detail cards (Caminata, Ciclismo, Fútbol, etc.) with sport-specific metrics: km traveled for walking/cycling/football, calories per minute for HIIT/boxing. Each card SHALL include a trend sparkline comparing the sport's metric over the period.

#### Scenario: Walking card shows km and trend
- **WHEN** the walking sport card renders
- **THEN** the card SHALL display total km walked in the period
- **THEN** a trend sparkline SHALL show km per day over the period
- **THEN** a period comparison arrow SHALL be shown

#### Scenario: Heat/Boxing card shows kcal per minute
- **WHEN** a HIIT or boxing sport card renders
- **THEN** the card SHALL display total kcal and average kcal per minute
- **THEN** a trend sparkline SHALL show kcal per session over the period

#### Scenario: Football card shows km traveled
- **WHEN** the football sport card renders
- **THEN** the card SHALL display total km traveled in the period (from sport_activities distance data)
- **THEN** a trend sparkline SHALL show km per session over the period

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

### Requirement: Remove duplicate resting HR card

The system SHALL remove the standalone "FC Reposo" card from Row 3. Resting HR SHALL appear only once, in the composite HRV + resting HR card in Row 1. The duplicate `rhrSeries` fetch and render SHALL be eliminated.

#### Scenario: RHR appears once
- **WHEN** the dashboard renders
- **THEN** resting heart rate SHALL appear only in the HRV + RHR composite card
- **THEN** no standalone RHR card SHALL exist in any row

### Requirement: Skeleton count matches card count

The system SHALL render the same number of skeleton placeholders as the number of cards that will be produced. Row 1 SHALL render 8 skeletons (hero + 7 cards), Row 3 SHALL render 5 skeletons (5 cards after removals).

#### Scenario: No reflow on loading to content transition
- **WHEN** the dashboard transitions from skeleton to rendered content
- **THEN** the number of skeleton placeholders SHALL equal the number of rendered cards per row
- **THEN** no visible grid reflow or jump SHALL occur

### Requirement: Fold weight IPC into batch

The system SHALL fold the sequential `getWeightEntries` call into the parallel `Promise.allSettled` batch, or fold the weight sparkline data into `getWeightStats` which is already in the batch. No serialized IPC call SHALL follow the parallel batch.

#### Scenario: No serialized post-batch IPC
- **WHEN** the dashboard renders
- **THEN** all IPC calls SHALL be in a single `Promise.allSettled` batch
- **THEN** no `await` IPC call SHALL appear after the batch resolves

### Requirement: Render todayCalories, measurementDelta, nextWorkout

The system SHALL render the three dashboard data fields that are currently fetched but discarded: `todayCalories` (today's planned intake), `measurementDelta` (waist delta from latest measurements), and `nextWorkout` (next training session info). These SHALL appear as small info cards or in the hero subtitle area.

#### Scenario: Today calories displayed
- **WHEN** the dashboard renders with diet plan data
- **THEN** today's planned calorie intake SHALL be displayed

#### Scenario: Measurement delta displayed
- **WHEN** the dashboard renders with measurement data
- **THEN** the latest waist delta (cm change vs previous) SHALL be displayed

#### Scenario: Next workout displayed
- **WHEN** the dashboard renders with training routine data
- **THEN** the next scheduled training session (day name + focus) SHALL be displayed

### Requirement: Dashboard card layout eliminates blank grid gaps

The system SHALL arrange dashboard cards so that no large blank spaces appear between sections. The grid rows SHALL be structured to fill without leaving empty tracks. The kcal/día trend chart SHALL be positioned as the last row of the dashboard (full width), not between the health metric cards and the activity summary.

#### Scenario: No blank grid gaps
- **WHEN** the dashboard renders with health metrics and activity data
- **THEN** the health metric cards SHALL be in a grid row above the trend chart
- **THEN** the trend chart SHALL be the last row
- **THEN** no empty grid tracks SHALL be visible between any cards

#### Scenario: Trend chart at bottom
- **WHEN** the dashboard renders with ≥ 2 days of daily data
- **THEN** the kcal/día trend Chart.js chart SHALL appear as the last visual element on the dashboard
- **THEN** the trend chart SHALL span the full width (`grid-column: 1 / -1`)
