## ADDED Requirements

### Requirement: Weight velocity chart shows 28-day rolling kg/week rate

The system SHALL render a Chart.js line chart showing the 28-day rolling weight-delta rate (kg/week) from `weight_entries` over the trailing 180 days. The chart SHALL include a horizontal reference line computed from the user's `target_pace` from `settings` (positive number = magnitude of intended weekly weight change; the chart line is rendered at `y = -target_pace` for loss phases or `y = -target_pace` for gain phases where `target_pace` is negative). The chart SHALL annotate the global minimum weight in the window with a marker and date label (PR weight).

#### Scenario: Velocity line renders with reference band
- **WHEN** the user has at least 2 `weight_entries` rows in the trailing 180 days, separated by 28+ days
- **THEN** the line chart SHALL show 28-day rolling velocity at each day in the window
- **THEN** a horizontal reference line SHALL appear at the user's `target_pace_reference_velocity` from `settings` (e.g., "-0.5 kg/sem" for a user in a loss phase)
- **THEN** the area between the velocity line and the reference line SHALL be shaded with `var(--moss-mist)` at 20% opacity when velocity < target (faster loss than target) and `var(--ember)` at 20% opacity when velocity > target (slower loss, gain, or off-target)
- **THEN** the y-axis SHALL be labeled "kg/semana" with values from -2.0 to +2.0

#### Scenario: PR weight annotated
- **WHEN** the velocity chart renders with at least 2 weight entries
- **THEN** the global minimum weight in the window SHALL be annotated with a circular marker on the line
- **THEN** the marker SHALL have a label showing the weight value and date (e.g., "PR 72.3 kg — 15 mar")

#### Scenario: Velocity chart with insufficient data
- **WHEN** the user has 0 or 1 `weight_entries` rows
- **THEN** the chart SHALL render in the empty state with: "Registra tu peso regularmente para ver tu velocidad de cambio"

#### Scenario: Velocity chart with sparse data
- **WHEN** the user has 2+ weight entries but no two entries are 28+ days apart
- **THEN** the chart SHALL render the weight line (not velocity) with a note: "Necesitas al menos 28 días entre pesajes para calcular velocidad"
- **THEN** no reference line SHALL be drawn

### Requirement: Date range selector controls velocity window

The velocity chart SHALL respect the date-range selector (90d / 6m / 1y), defaulting to 6m. The IPC handler SHALL accept a `fromIso` and `toIso` parameter and return velocity data for that range.

#### Scenario: 90d range
- **WHEN** the user selects "90d"
- **THEN** the velocity chart SHALL show the trailing 90 days
- **THEN** the IPC handler SHALL receive `from = now - 90d`, `to = now`

#### Scenario: 6m range
- **WHEN** the user selects "6m"
- **THEN** the velocity chart SHALL show the trailing 180 days
- **THEN** the IPC handler SHALL receive `from = now - 180d`, `to = now`

#### Scenario: 1y range
- **WHEN** the user selects "1y"
- **THEN** the velocity chart SHALL show the trailing 365 days
- **THEN** the IPC handler SHALL receive `from = now - 365d`, `to = now`

### Requirement: IPC handler returns per-day velocity data

The system SHALL provide `db:getWeightVelocity(fromIso, toIso)` in `src/main/handlers/insights-handlers.js` that returns `{ points: [{ date, weight_kg, velocity_kg_per_week }], target_pace_reference_velocity: number, target_pace_magnitude: number, pr_weight: { weight_kg, date } | null, pr_insufficient_window: bool }`. The handler SHALL compute the 28-day rolling delta client-side in JavaScript (not SQL) since SQLite lacks window functions in all builds. The handler SHALL read `target_pace` from `settings` as a positive magnitude, return it verbatim as `target_pace_magnitude` for display, and compute `target_pace_reference_velocity = -target_pace_magnitude` for the chart's reference line.

#### Scenario: Handler returns velocity points
- **WHEN** `db:getWeightVelocity('2025-12-22', '2026-06-22')` is called
- **THEN** `points` SHALL contain one entry per day in the range
- **THEN** entries where no weight was recorded 28 days prior SHALL have `velocity_kg_per_week: null`
- **THEN** entries where weight was recorded 28 days prior SHALL have `velocity_kg_per_week = (current - prior) / 4`

#### Scenario: Handler returns PR weight
- **WHEN** the user has 2+ weight entries
- **THEN** `pr_weight` SHALL contain the minimum `weight_kg` and its `date`
- **WHEN** the user has < 2 weight entries
- **THEN** `pr_weight` SHALL be null

#### Scenario: Surplus-phase user
- **WHEN** the user has set `target_pace` to a negative value in settings (e.g., `-0.3`, meaning "gain 0.3 kg/week" — a bulk/gain phase)
- **THEN** the reference line SHALL appear at `y = -(-0.3) = +0.3` (positive y-value, indicating the user is intentionally gaining)
- **THEN** the chart SHALL NOT assume the user is always in a loss phase
