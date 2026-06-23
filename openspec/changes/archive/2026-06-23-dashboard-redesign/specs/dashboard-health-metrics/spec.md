## MODIFIED Requirements

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

### Requirement: Unified distance card (walking + cycling)

The system SHALL merge the previously separate walking distance and cycling distance cards into a single "Distancia" KPI card showing both walking and cycling metrics.

#### Scenario: Distance card with both metrics
- **WHEN** both walking and cycling data exist
- **THEN** the card SHALL display total distance in km as the primary value
- **THEN** the subtitle SHALL show walking and cycling breakdown

#### Scenario: Distance card with only walking
- **WHEN** only walking data exists
- **THEN** the card SHALL display walking distance only
- **THEN** cycling SHALL NOT appear in the subtitle

#### Scenario: Distance card with no data
- **WHEN** neither walking nor cycling data exists
- **THEN** the card SHALL display "--" as the value

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
