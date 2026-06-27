# Sport Distribution Donut

## Purpose

Render a Chart.js doughnut chart showing the share of total training minutes per sport type over the trailing 90 days, with total hours in the center and a color-coded legend.

## Requirements

### Requirement: Sport distribution donut shows share of total minutes per sport

The system SHALL render a Chart.js doughnut chart showing the share of total training minutes per `sport_type` over the trailing 90 days. The center of the donut SHALL display the total hours as a large number with a "Total" label below. The legend SHALL list each sport with minutes, sessions, and percentage. If the user has more than 6 distinct sport types in the window, the smallest 3 SHALL be aggregated into "Otros" with the breakdown available in a tooltip.

#### Scenario: Donut renders with sport breakdown
- **WHEN** the user has 2–6 distinct sport types in the trailing 90 days
- **THEN** the doughnut SHALL show one slice per sport type
- **THEN** the center label SHALL show total hours (rounded to nearest integer)
- **THEN** the legend SHALL list each sport with: sport name (Spanish), minutes, sessions, and percentage
- **THEN** the largest sport SHALL be the first slice (12 o'clock position)

#### Scenario: Donut aggregates small sports
- **WHEN** the user has 7+ distinct sport types in the trailing 90 days
- **THEN** the 3 smallest sports SHALL be aggregated into a single "Otros" slice
- **THEN** the "Otros" slice tooltip SHALL list the aggregated sports and their individual shares
- **THEN** the legend SHALL show "Otros (X deportes)" as a single entry

#### Scenario: Donut empty state
- **WHEN** the user has zero `sport_activities` rows in the trailing 90 days
- **THEN** the donut SHALL render in the empty state with: "No hay actividades en los últimos 90 días"

#### Scenario: Donut color palette
- **WHEN** the donut renders
- **THEN** each slice SHALL use a color from the organic-aesthetic palette: `var(--moss)`, `var(--moss-ink)`, `var(--moss-mist)` (for the largest 3), and `var(--lichen)`, `var(--smoke)`, `var(--ember)` for subsequent slices
- **THEN** the slice order SHALL be sorted by minutes descending

### Requirement: IPC handler returns per-sport aggregates for the trailing 90 days

The system SHALL provide `db:getSportDistribution()` in `src/main/handlers/insights-handlers.js` that returns an array of `{ sport_type, sport_label, minutes, sessions, share_pct }` for all sport types with activity in the trailing 90 days, sorted by `minutes` descending. The handler SHALL compute `share_pct` as `(minutes / total_minutes) * 100`, rounded to 1 decimal.

#### Scenario: Handler returns sorted distribution
- **WHEN** `db:getSportDistribution()` is called
- **THEN** the handler SHALL return one row per `sport_type` with activity in the last 90 days
- **THEN** rows SHALL be sorted by `minutes` descending
- **THEN** `sport_label` SHALL be the Spanish display name from `getSportDisplayName()`
- **THEN** `share_pct` SHALL sum to 100.0 (±0.1 rounding tolerance)

#### Scenario: Handler excludes sports with no activity
- **WHEN** the user has `sport_activities` rows for `running` and `cycling` only
- **THEN** the handler SHALL return exactly 2 rows
- **THEN** other sport types (e.g., `swimming`, `HIIT`) SHALL NOT appear with `minutes: 0`
