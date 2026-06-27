# Dashboard Health Metrics

## Purpose

Expose health metrics from HealthSync and the app database on the dashboard with a logical top-to-bottom flow: hero card (energy balance growth ring), two symmetric rows of health KPI cards, trend charts, and a sports section at the bottom with activity summary accent card and per-sport breakdown cards.

Verified during exploration: `blood_pressure` has 0 records (AW doesn't measure BP), `blood_glucose` table does not exist (AW doesn't measure glucose), no pre-computed HR zones exist. Exercise time (59k rows), walking distance (309k rows), and HRV (12k rows) all have abundant data. Standing hours, SpO2, and BP cards have been removed due to sparse or unreliable data.

## Requirements

### Requirement: Dashboard health metrics card layout

The dashboard SHALL display health metric cards organized in a logical top-to-bottom flow: Hero card (full-width balance with growth ring) at the top, two symmetric rows of health KPI cards (5 + 4), trend charts (kcal daily + weekly balance) in the middle, and a sports section at the bottom with a visual separator. The sports section SHALL include the activity summary accent card and per-sport-type breakdown cards.

#### Scenario: Hero card renders first
- **WHEN** the dashboard renders
- **THEN** the hero card with balance semanal and growth ring SHALL appear at the top spanning full width
- **THEN** no sports or activity content SHALL appear above the hero card

#### Scenario: Health KPIs in two symmetric rows
- **WHEN** the dashboard renders
- **THEN** row 1 SHALL contain 5 cards: Sueño, HRV, RHR, Peso, Pasos
- **THEN** row 2 SHALL contain 4 cards: Ejercicio, Distancia, Calorías Hoy, Próximo Entrenamiento
- **THEN** each card SHALL include a sparkline where data is available

#### Scenario: Trend charts in the middle
- **WHEN** daily data is available
- **THEN** the kcal diarias chart (line + MA7) and balance semanal chart (bars) SHALL render side-by-side below the health KPI rows

#### Scenario: Sports section at the bottom
- **WHEN** the dashboard renders
- **THEN** a visual separator or section label ("DEPORTES") SHALL appear before the sports section
- **THEN** the activity summary accent card SHALL appear first in the sports section
- **THEN** per-sport-type cards SHALL appear below the accent card
- **THEN** no sports content SHALL appear above the trend charts

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

### Requirement: Weight KPI card

The system SHALL display a dedicated Weight card in the health KPIs row showing the latest weight, delta vs previous period, and a sparkline of weight trend.

#### Scenario: Weight card with data
- **WHEN** weight entries exist in the selected date range
- **THEN** the Weight card SHALL display the latest weight in kg with one decimal
- **THEN** a sparkline of weight values SHALL render below the value
- **THEN** the delta vs the earliest value in the period SHALL show as "Δ: -1.2 kg" or "Δ: +0.5 kg"

#### Scenario: Weight card without data
- **WHEN** no weight entries exist
- **THEN** the Weight card SHALL display "--" with "Sin datos de peso" subtitle

### Requirement: Dynamic sparkline colors based on trend

The system SHALL compute the simple linear regression slope of each sparkline's data series and color the line dynamically: moss (positive slope, improving), ember (negative slope, worsening), lichen (flat slope, stable). For inverse metrics where lower is better (RHR, weight), the slope SHALL be negated before color assignment. When fewer than 5 data points exist, the sparkline SHALL default to lichen (stable) without trend computation. The sparkline SHALL also include a dashed reference line at the series mean and a prominent dot at the last data point.

#### Scenario: Improving metric gets moss sparkline
- **WHEN** the sparkline data slope is positive and exceeds the metric-specific threshold
- **THEN** the sparkline stroke SHALL be `var(--moss)`

#### Scenario: Worsening metric gets ember sparkline
- **WHEN** the sparkline data slope is negative and below the metric-specific threshold
- **THEN** the sparkline stroke SHALL be `var(--ember)`

#### Scenario: Stable metric gets lichen sparkline
- **WHEN** the sparkline data slope is within the threshold range
- **THEN** the sparkline stroke SHALL be `var(--lichen)`

#### Scenario: Few points default to lichen
- **WHEN** a sparkline has fewer than 5 data points
- **THEN** the sparkline stroke SHALL be `var(--lichen)` without trend computation

#### Scenario: Reference line at mean
- **WHEN** a sparkline renders with 3+ data points
- **THEN** a dashed horizontal line SHALL be drawn at the y-position of the data mean
- **THEN** the reference line SHALL use `var(--lichen)` at 0.4 opacity

#### Scenario: Last point dot
- **WHEN** a sparkline renders
- **THEN** the last data point SHALL display a filled circle dot (r=2.5) with a white stroke border

### Requirement: Period-over-period comparison on sports cards

The system SHALL compare the current period's sport session count against an equivalent previous period and display the delta on each sport card.

#### Scenario: More sessions than previous period
- **WHEN** Running has 8 sessions in the current 15d period and 6 in the previous 15d period
- **THEN** the card subtitle SHALL show "8 ses. ▲ +2 vs anterior"

#### Scenario: Fewer sessions than previous period
- **WHEN** a sport has 4 sessions in the current period and 6 in the previous period
- **THEN** the card subtitle SHALL show "4 ses. ▼ -2 vs anterior"

#### Scenario: Same sessions as previous period
- **WHEN** a sport has 3 sessions in both periods
- **THEN** the card subtitle SHALL show "3 ses. ― vs anterior"

#### Scenario: No previous period data
- **WHEN** the previous period has no data for a sport type
- **THEN** no period-over-period indicator SHALL appear for that sport

### Requirement: Bold text hierarchy in card subtitles

The system SHALL apply `font-weight: 600` and `color: var(--moss-ink)` to `<strong>` elements within `.dashboard-card .subtitle`, distinguishing key numeric values from descriptive label text.

#### Scenario: Strong text in subtitle
- **WHEN** a dashboard card subtitle contains `<strong>` wrapped numbers
- **THEN** the strong text SHALL render in moss-ink with 600 font weight
- **THEN** surrounding descriptive text SHALL remain in lichen at normal weight

#### Scenario: Subtitle without strong text
- **WHEN** a dashboard card subtitle has no `<strong>` elements
- **THEN** the subtitle SHALL render normally in lichen color

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

The system SHALL display trend arrows on every dashboard metric card's microchart, comparing current period average to previous period average.

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

### Requirement: Per-sport metric cards include period-over-period comparison

The system SHALL display period-over-period session count deltas on each per-sport card, comparing the current period against the previous equivalent period.

#### Scenario: Pop indicator on sport cards
- **WHEN** the dashboard renders per-sport cards with data from both periods
- **THEN** each card SHALL show the session count delta ("▲ +2" / "▼ -1" / "―") compared to the previous period

### Requirement: Dashboard health metric IPC handlers

The system SHALL provide IPC handlers for all new health metrics, ideally batched into a single query.

#### Scenario: Batched metrics
- **WHEN** dashboard initializes
- **THEN** the system SHOULD call a single `health:getDashboardMetrics(from, to)` returning all metrics together, rather than 5 separate IPC calls

### Requirement: Remove duplicate resting HR card

The system SHALL remove the standalone "FC Reposo" card from Row 3. Resting HR SHALL appear only once, as its own card in Row 1. The duplicate `rhrSeries` fetch and render SHALL be eliminated.

#### Scenario: RHR appears once
- **WHEN** the dashboard renders
- **THEN** resting heart rate SHALL appear only as a dedicated card in Row 1
- **THEN** no standalone RHR card SHALL exist in any other row

### Requirement: Skeleton count matches card count

The system SHALL render the same number of skeleton placeholders as the number of cards that will be produced. Row 1 SHALL render 8 skeletons (hero + 7 cards), Row 2 SHALL render 4 skeletons (4 cards).

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

The system SHALL arrange dashboard cards so that no large blank spaces appear between sections. The grid rows SHALL be structured to fill without leaving empty tracks. The kcal/día trend chart SHALL be positioned before the sports section.

#### Scenario: No blank grid gaps
- **WHEN** the dashboard renders with health metrics and activity data
- **THEN** the health metric cards SHALL be in grid rows above the trend chart
- **THEN** the trend chart SHALL appear before the sports section
- **THEN** no empty grid tracks SHALL be visible between any cards

#### Scenario: Trend chart before sports
- **WHEN** the dashboard renders with ≥ 2 days of daily data
- **THEN** the kcal/día trend Chart.js chart SHALL appear between health KPI rows and the sports section
- **THEN** the trend chart SHALL span the full width (`grid-column: 1 / -1`)

## ADDED Requirements (2026-06-27 — panel-ux-ui-kpis-summarized)


### Requirement: Strava-style summary panels block

The dashboard SHALL display a new "Strava-style summary panels" block at the top of the view, above the existing hero card. The block SHALL contain, in order: (1) a full-width personal-record banner, (2) a 2-column row with the weekly-goal ring card and the relative-effort card, (3) a full-width training-log bubble chart, and (4) a streak header followed by a monthly activity calendar. The block SHALL be visually distinct from the existing health-metrics grid via a subtle separator (e.g., a labeled section header "RESUMEN" or a horizontal rule). All five panels SHALL render concurrently via `Promise.allSettled` and SHALL show skeleton loading states during the IPC round-trips.

#### Scenario: Strava block renders first
- **WHEN** the dashboard renders
- **THEN** the personal-record banner SHALL appear at the very top of the view, spanning the full content width
- **THEN** the 2-column row (weekly goal + relative effort) SHALL appear directly below the banner
- **THEN** the training-log bubble chart SHALL appear below the 2-column row
- **THEN** the streak header + monthly calendar SHALL appear below the training-log chart
- **THEN** the existing hero card (energy balance growth ring) SHALL appear AFTER the Strava block

#### Scenario: Concurrent IPC loading
- **WHEN** the dashboard mounts
- **THEN** the system SHALL issue 6 IPC calls concurrently: `db:getPersonalRecords`, `db:getWeeklyGoal`, `db:getRelativeEffort`, `db:getTrainingLogWeek`, `db:getMonthlyCalendar`, `db:getStreak`
- **THEN** each panel SHALL display a skeleton loading state during its IPC call
- **THEN** panels SHALL stream in as their IPC calls resolve (not block on all-settled)

#### Scenario: Date range selector does not gate Strava panels
- **WHEN** the user changes the date range selector (7d / 15d / 1m)
- **THEN** the existing health-metrics grid SHALL update to reflect the new range
- **THEN** the Strava panels SHALL NOT change (they always show current week / current month)
- **THEN** a subtle "Esta semana" / "Este mes" label SHALL be present on each panel to clarify the time window

#### Scenario: Panel re-render on data change
- **WHEN** the user adds a new `sport_activities` record from any view
- **THEN** the dashboard SHALL receive a `data-changed` event
- **THEN** the Strava panels SHALL re-fetch their data and re-render
- **THEN** the change SHALL be visible without a full view reload

### Requirement: Strava block error handling

If any of the 6 IPC calls in the Strava block fails, the corresponding panel SHALL render the error state via `renderStateCard(container, { state: 'error', onRetry })`. The other 5 panels SHALL continue to render normally. A single panel failure SHALL NOT prevent the rest of the dashboard from rendering.

#### Scenario: Single panel error
- **WHEN** `db:getPersonalRecords` throws an error
- **THEN** the PR banner SHALL display the error state with a "Reintentar" button
- **THEN** the other 5 panels SHALL render with their data
- **THEN** the rest of the dashboard (health metrics, sports) SHALL render normally

#### Scenario: All panels error
- **WHEN** all 6 IPC calls fail (e.g., DB connection lost)
- **THEN** each panel SHALL display its error state
- **THEN** the existing health-metrics grid SHALL also display error states
- **THEN** the user SHALL see consistent "Reintentar" affordances across the dashboard

## ADDED Requirements (2026-06-27 — summary-insights-view)


### Requirement: Insights view exists as a navigational companion to the dashboard

The dashboard SHALL navigate to a companion `insights` view (defined in the `insights-view` spec) when the user clicks the "Patrones" nav item in the INICIO sidebar section. The dashboard itself SHALL NOT link to the insights view from any dashboard section — the entry point is exclusively the sidebar nav. The dashboard's existing layout, panels, and behavior SHALL be unchanged by the addition of the insights view.

#### Scenario: Insights view exists in navigation
- **WHEN** the user opens the sidebar
- **THEN** the INICIO section SHALL contain three nav items: Panel, Patrones, Tendencias
- **WHEN** the user clicks "Patrones" from the dashboard
- **THEN** the insights view SHALL activate
- **THEN** the dashboard view SHALL be unmounted (no longer `active-view`)

#### Scenario: Dashboard is unaffected by insights view addition
- **WHEN** the `summary-insights-view` change is merged
- **THEN** the dashboard's layout, panels, and IPC calls SHALL be unchanged
- **THEN** the dashboard SHALL NOT import or reference the insights view
- **THEN** the dashboard SHALL continue to function identically for users who never click "Patrones"

## ADDED Requirements (2026-06-27 — goals-tracker)

### Requirement: Dashboard goals summary card

The dashboard SHALL render a compact goals summary row between the Strava-style summary panels block and the hero card (energy balance growth ring). The card SHALL show up to 3 active goal progress rings in a horizontal row, each at 28 px radius (56×56 px SVG), with a short truncated label below each ring. Each ring SHALL be clickable and navigate to the goals view. The goals card SHALL be loaded within the dashboard's `Promise.allSettled` batch.

#### Scenario: Goals summary between Strava panels and hero card
- **WHEN** the dashboard renders with active goals
- **THEN** the goals summary card SHALL appear between the Strava summary panels block and the hero card
- **THEN** up to 3 progress rings SHALL render horizontally at 56×56 px each
- **THEN** more than 3 goals SHALL display a "+N más" overflow indicator
- **THEN** clicking any ring or "+N más" SHALL navigate to the goals view

#### Scenario: Goals summary empty state
- **WHEN** the user has no active goals
- **THEN** the summary card SHALL display "Define tu primer objetivo" with a Lucide `target` icon
- **THEN** the empty state SHALL be clickable to navigate to the goals view

#### Scenario: Goals loaded in dashboard batch
- **WHEN** the dashboard loads
- **THEN** `db:getGoals` and `db:getGoalProgress` for active goals SHALL be called within the batch
- **THEN** IPC failures SHALL display a fallback without breaking the dashboard
