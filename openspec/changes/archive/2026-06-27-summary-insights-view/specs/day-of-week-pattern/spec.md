## ADDED Requirements

### Requirement: Day-of-week pattern shows total minutes and sessions per weekday

The system SHALL compute and display total training minutes and session count for each weekday (Monday through Sunday) from `sport_activities`, based on the date in the active date range (90d / 6m / 1y). The system SHALL render a 7-bar Chart.js histogram with weekday labels in Spanish (L, M, X, J, V, S, D) and SHALL highlight the user's "best day" (weekday with the most total minutes) with a small badge above the corresponding bar.

#### Scenario: Histogram renders with all 7 days
- **WHEN** the user has `sport_activities` rows in the active date range
- **THEN** the histogram SHALL render 7 bars (one per weekday)
- **THEN** each bar's height SHALL be proportional to total minutes for that weekday
- **THEN** the y-axis SHALL show minutes (not sessions)
- **THEN** each bar SHALL have a tooltip showing weekday, total minutes, and session count (e.g., "Lunes — 245 min, 4 sesiones")

#### Scenario: Best day is highlighted
- **WHEN** the histogram renders
- **THEN** the bar with the highest total minutes SHALL be visually distinguished (filled with `var(--moss-ink)` instead of `var(--moss)`)
- **THEN** a small "Tu mejor día" badge SHALL appear above the highlighted bar

#### Scenario: Histogram with insufficient data
- **WHEN** the user has fewer than 2 weeks of activity in the date range
- **THEN** the histogram SHALL be hidden and the empty state SHALL render: "Necesitas al menos 2 semanas de datos para identificar tu día favorito"

#### Scenario: Histogram with partial pattern
- **WHEN** the user has 2–4 weeks of activity in the date range
- **THEN** the histogram SHALL render with a caveat caption: "Patrón parcial (X semanas de datos)"

### Requirement: IPC handler returns per-weekday aggregates

The system SHALL provide `db:getDayOfWeekStats(fromIso, toIso)` in `src/main/handlers/insights-handlers.js` that returns an array of 7 entries (one per weekday, 0=Monday, 6=Sunday) with `{ weekday, minutes, sessions, weekday_label }`. The handler SHALL use `strftime('%w', date)` in SQLite to extract the day of week, with Monday=0 convention via `(CAST(strftime('%w', date) AS INT) + 6) % 7`.

#### Scenario: Handler returns 7 entries
- **WHEN** `db:getDayOfWeekStats('2025-09-22', '2025-12-22')` is called
- **THEN** the handler SHALL return exactly 7 rows
- **THEN** weekday 0 = Monday, weekday 6 = Sunday
- **THEN** `weekday_label` SHALL be in Spanish: `L`, `M`, `X`, `J`, `V`, `S`, `D`
- **THEN** `minutes` and `sessions` SHALL be 0 for weekdays with no activity in the range
