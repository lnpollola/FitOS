# Dashboard Health Metrics — Delta

## REMOVED Requirements

### Requirement: SpO2 card
**Reason**: No SpO2 data available from current data sources. Apple Watch SpO2 data is sparse and unreliable for the user's setup.
**Migration**: The SpO2 card SHALL be removed from the dashboard DOM. No data migration needed — underlying data is preserved but not displayed.

### Requirement: Blood pressure card (data-dependent)
**Reason**: Apple Watch does not measure blood pressure. The user has no external BP monitor. Card has always shown "-- / --" empty state.
**Migration**: The BP card SHALL be removed from the dashboard DOM. The `blood_pressure` table is preserved for future use if a compatible monitor is added.

### Requirement: Standing hours card
**Reason**: Apple Watch standing hours data is unreliable and not meaningful for the user's goals. Card provides no actionable insight.
**Migration**: The standing hours card SHALL be removed from the dashboard DOM.

## MODIFIED Requirements

### Requirement: Exercise time card

The system SHALL display average exercise minutes per day using the `exercise_time` HealthSync table. The card SHALL include total training hours from `sport_activities` when available.

#### Scenario: Exercise time card renders
- **WHEN** exercise_time data exists for the selected period
- **THEN** the dashboard SHALL display average minutes/day

#### Scenario: Exercise time with training hours
- **WHEN** sport_activities data exists
- **THEN** the card SHALL also display total training hours for the period
- **THEN** "Xh Ym entrenados" SHALL appear as subtitle

### Requirement: Walking distance card

The system SHALL display average walking distance per day using `distance_walking_running`. The card SHALL include km total for the period and a trend sparkline.

#### Scenario: Walking distance renders with km total
- **WHEN** walking distance data exists
- **THEN** the dashboard SHALL display average km/day
- **THEN** the card SHALL display total km for the period as subtitle
- **THEN** when ≥ 2 days of data exist, a sparkline SHALL render

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

#### Scenario: Sleep card empty state
- **WHEN** no sleep data exists for the selected period
- **THEN** the card SHALL display "--" without breaking the layout
- **THEN** the card SHALL NOT render a sparkline

## ADDED Requirements

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

### Requirement: Trend period comparison arrows on all metric microcharts

The system SHALL display trend arrows (▲ green up, ▼ red down, ― gray flat) on every dashboard metric card's microchart, comparing current period average to previous period average. Each card's sparkline SHALL visually encode the period-over-period trend.

#### Scenario: All metric cards show trend comparison
- **WHEN** the dashboard renders with ≥ 2 periods of data
- **THEN** every card with a sparkline (exercise, walking, cycling, sleep, HRV, steps) SHALL show a trend arrow
- **THEN** the arrow SHALL compare current period average to previous period average
- **THEN** change > 5% up SHALL show ▲ in green
- **THEN** change > 5% down SHALL show ▼ in red
- **THEN** change within ±5% SHALL show ― in gray

### Requirement: Dashboard activity summary positioned at top

The system SHALL position the green "Resumen de Actividad" card (`.card-accent`) immediately after the hero card, not at the bottom of the dashboard. Per-sport detail cards SHALL follow the green summary card in the same grid row.

#### Scenario: Activity summary appears after hero
- **WHEN** the dashboard renders with activity data
- **THEN** the `.card-accent` "Resumen de Actividad" SHALL appear in the row immediately after `.card-hero`
- **THEN** per-sport `.dashboard-card` elements SHALL appear after the `.card-accent` in the same grid

#### Scenario: Activity summary absent when no sport data
- **WHEN** the dashboard renders with no sport activity data for the selected period
- **THEN** the green summary card SHALL NOT render
- **THEN** no empty placeholder SHALL appear in its place

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

### Requirement: Growth ring legend matches ring encoding

The system SHALL fix the growth ring legend to match the actual ring encoding. The ring colors arcs by kcal magnitude (not balance surplus/deficit). The legend SHALL either relabel to reflect kcal magnitude tiers OR the ring SHALL be re-encoded to use balance values. The hero value and ring SHALL encode the same metric.

#### Scenario: Legend and ring encode the same metric
- **WHEN** the hero card renders with the growth ring
- **THEN** the legend labels SHALL match what the ring arcs encode
- **THEN** if the ring encodes balance, arcs SHALL be colored moss for surplus and ember for deficit
- **THEN** if the ring encodes kcal magnitude, the legend SHALL say "Alto gasto" / "Bajo gasto" instead of "Excedente" / "Déficit"

### Requirement: Remove duplicate resting HR card

The system SHALL remove the standalone "FC Reposo" card from Row 3. Resting HR SHALL appear only once, in the composite HRV + resting HR card in Row 1. The duplicate `rhrSeries` fetch and render SHALL be eliminated.

#### Scenario: RHR appears once
- **WHEN** the dashboard renders
- **THEN** resting heart rate SHALL appear only in the HRV + RHR composite card
- **THEN** no standalone RHR card SHALL exist in any row

### Requirement: Steps averaging window connected to selected range

The system SHALL compute the 7d/15d/1m step averages from a window consistent with the selected date range. When the user selects "3m", the 7d/15d/1m averages SHALL be computed from the last 30 days of the 3m range (not a hardcoded 30-day window from today).

#### Scenario: Steps averages consistent with selected range
- **WHEN** the user selects a date range (15d, 1m, or 3m)
- **THEN** the 7d/15d/1m step averages SHALL be computed from data within the selected range
- **THEN** the averages SHALL NOT use a hardcoded 30-day window independent of the range selector

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
