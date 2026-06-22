## MODIFIED Requirements

### Requirement: Weekly sport summary with session count and duration

The system SHALL display a "Deporte - Tipo" chart showing session count, average calories, and duration per sport type. The chart canvas element SHALL be preserved during skeleton loading states — the system SHALL NOT destroy the `<canvas>` element when injecting skeleton placeholders. A session-count comparison strip SHALL be displayed alongside the chart showing total sessions for the selected range with a period-over-period comparison.

#### Scenario: Chart canvas preserved during skeleton loading
- **WHEN** the activity view initializes or re-imports Apple Health data
- **THEN** the system SHALL NOT overwrite `.chart-container` innerHTML with a skeleton that destroys the `<canvas id="weekly-chart">` element
- **THEN** the `<canvas id="weekly-chart">` element SHALL remain in the DOM
- **THEN** `loadChart()` SHALL find the canvas via `document.getElementById('weekly-chart')` and render the chart

#### Scenario: Chart renders after init
- **WHEN** the activity view loads and sport activity data exists for the selected range
- **THEN** the weekly sport summary chart SHALL render successfully
- **THEN** the chart SHALL display session count, avg kcal, total minutes per sport type

#### Scenario: Duration correctly displays non-zero values
- **WHEN** sport_activities has non-NULL duration_minutes
- **THEN** the chart SHALL display actual duration values
- **THEN** the migration `migrateHealthData` SHALL populate `duration_minutes` from HealthSync workout data

#### Scenario: Sport summary chart shows all metrics
- **WHEN** sport activity data exists
- **THEN** the chart SHALL display session count, avg kcal, total minutes per sport type

#### Scenario: Custom period selection
- **WHEN** user selects a date range via the range selector
- **THEN** the chart SHALL update for the selected range (not just 7 days)

#### Scenario: Session count comparison strip renders
- **WHEN** the weekly sport summary card renders with sport data
- **THEN** a KPI strip SHALL display total sessions for the selected range (7d/15d/1m)
- **THEN** the strip SHALL show a period-over-period comparison (current vs previous window)
- **THEN** the comparison SHALL use an up/down/flat trend arrow
- **THEN** the comparison SHALL use `strings.activity.periodComparison` for the "vs período anterior" label

#### Scenario: Session count comparison with no previous period data
- **WHEN** the selected range has sport data but the previous period has none
- **THEN** the KPI strip SHALL display the current session count without a comparison arrow
- **THEN** no error SHALL be thrown

#### Scenario: Session count comparison with no data
- **WHEN** the selected range has no sport activity data
- **THEN** the KPI strip SHALL NOT render
- **THEN** the chart container SHALL be hidden
