# Year In Motion Heatmap

## Purpose

Render a year-in-motion SVG heatmap as a 53-week × 7-day grid showing total daily training minutes from sport activities, with a 6-step discrete color scale and ISO week ordering.

## Requirements

### Requirement: Year-in-motion heatmap renders 53 weeks of training minutes

The system SHALL render a year-in-motion heatmap as a 53-week × 7-day SVG grid showing total daily training minutes from `sport_activities` for the trailing 365 days. Each cell SHALL be colored on a 6-step discrete scale (`moss-0` → `moss-5`) based on total minutes for that day, with `moss-0` (no fill) for days with no activity. The grid SHALL use ISO week ordering (Monday → Sunday, columns left → right). Future days of the current week SHALL be rendered with `moss-0` at 50% opacity. The 6 bucket thresholds SHALL be: 0 min → `moss-0`, 1–14 min → `moss-1`, 15–29 min → `moss-2`, 30–59 min → `moss-3`, 60–89 min → `moss-4`, 90+ min → `moss-5`.

#### Scenario: Heatmap renders with 6-step color scale
- **WHEN** the user has sport_activities data spanning the trailing 365 days
- **THEN** the system SHALL query `sport_activities` grouped by `date` and `SUM(duration_minutes)`
- **THEN** each day SHALL be assigned to a bucket: 0 min → `moss-0`, 1–14 min → `moss-1`, 15–29 min → `moss-2`, 30–59 min → `moss-3`, 60–89 min → `moss-4`, 90+ min → `moss-5`
- **THEN** the SVG SHALL contain up to 371 `<rect>` elements (53 weeks × 7 days)
- **THEN** the rendering SHALL complete in < 100 ms

#### Scenario: Heatmap tooltip on hover
- **WHEN** the user hovers over a heatmap cell
- **THEN** a native `<title>` tooltip SHALL appear showing the date and total minutes for that day (e.g., "15 de jun — 45 min")
- **THEN** the tooltip SHALL disappear when the cursor leaves the cell

#### Scenario: Heatmap with no data
- **WHEN** the user has zero `sport_activities` rows in the trailing 365 days
- **THEN** the heatmap SHALL render in the empty state with the message: "Sin actividades deportivas registradas. Si haces entrenamiento de fuerza, los patrones de pesas llegan en una próxima versión."
- **THEN** a CTA button labeled "Ir a Actividad" SHALL navigate to the `activity` view
- **THEN** the SVG grid SHALL NOT be rendered (skipped entirely)

#### Scenario: Heatmap with only strength training data
- **WHEN** the user has zero `sport_activities` rows but ≥ 1 `training_sessions` row in the trailing 365 days
- **THEN** the heatmap SHALL render in the empty state (the same as above)
- **THEN** the message SHALL acknowledge that the user has training data, but explain that sport-activities heatmap is the current scope and strength patterns are planned for a future release (Phase 3, `strength-training-insights`)
- **THEN** the message SHALL NOT link to the `training` view (out of scope for this empty state)

#### Scenario: Heatmap with sparse data
- **WHEN** the user has fewer than 7 days of activity in the trailing 365 days
- **THEN** the heatmap SHALL render with mostly `moss-0` cells and a few colored cells
- **THEN** a small caption SHALL appear above the heatmap: "Patrón parcial (N días con actividad)"

#### Scenario: Date range selector controls heatmap window
- **WHEN** the user selects "6m" from the date range selector
- **THEN** the heatmap SHALL re-render with the trailing 180 days only (26 weeks × 7 days = 182 cells max)
- **WHEN** the user selects "1y"
- **THEN** the heatmap SHALL re-render with the trailing 365 days (53 weeks × 7 days = 371 cells max)
- **WHEN** the user selects "90d"
- **THEN** the heatmap SHALL re-render with the trailing 90 days (13 weeks × 7 days = 91 cells max)

### Requirement: Heatmap cell color tokens are local to the insights view

The system SHALL define 6 heatmap color tokens (`.insights-heatmap-cell--moss-0` through `--moss-5`) as CSS custom properties local to the `.insights-heatmap` container, using the existing `var(--moss-mist)`, `var(--moss)`, and `var(--moss-ink)` tokens. The 6 tokens SHALL NOT be added to `:root` or `body.organic` — they are scoped to the heatmap render only.

#### Scenario: Heatmap tokens are scoped
- **WHEN** the insights view is not active
- **THEN** the `.insights-heatmap-cell--moss-*` classes SHALL have no visible effect on any other view
- **WHEN** the insights view IS active
- **THEN** the heatmap cells SHALL inherit the moss-1 through moss-5 colors via the parent container

### Requirement: IPC handler returns daily minutes for the heatmap

The system SHALL provide `db:getYearInMotion(fromIso, toIso)` in `src/main/handlers/insights-handlers.js` that returns an array of `{ date, minutes }` rows for all days in the `[fromIso, toIso]` range, including days with zero activity (returned as `{ date, minutes: 0 }`). The handler SHALL be a single SQL query: `SELECT date, SUM(duration_minutes) AS minutes FROM sport_activities WHERE date BETWEEN ? AND ? GROUP BY date`.

#### Scenario: Handler returns complete range
- **WHEN** `db:getYearInMotion('2025-06-22', '2026-06-22')` is called
- **THEN** the handler SHALL return 365 rows (one per day in the range)
- **THEN** days with no activity SHALL have `minutes: 0`
- **THEN** days with activity SHALL have `minutes` equal to `SUM(duration_minutes)` for that day

#### Scenario: Handler caps at 1 year
- **WHEN** `db:getYearInMotion` is called with a range > 366 days
- **THEN** the handler SHALL clamp the `from` date to `to - 365 days` and return at most 365 rows
- **THEN** the handler SHALL log a warning "Heatmap range exceeds 1 year, clamping"
