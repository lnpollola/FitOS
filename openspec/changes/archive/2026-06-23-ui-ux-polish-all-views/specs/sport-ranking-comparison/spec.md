# Sport Ranking Comparison

## ADDED Requirements

### Requirement: Composite ranking chart comparing frequency and calories

The system SHALL replace the sport duration+calories table in the activity view with a grouped bar chart that compares sport types by session count and total calories, supporting period-over-period comparison (current vs previous period).

#### Scenario: Ranking chart renders grouped bars
- **WHEN** the activity view renders with sport data
- **THEN** the system SHALL display a Chart.js grouped bar chart with two datasets per sport type: session count and total kcal
- **THEN** sport types SHALL be ordered by session count descending
- **THEN** the chart SHALL use Spanish sport names from `getSportDisplayName()`

#### Scenario: Period comparison in ranking chart
- **WHEN** the chart renders with ≥ 2 weeks of data
- **THEN** each sport type SHALL show side-by-side bars for current period and previous period
- **THEN** a trend arrow (▲/▼/―) SHALL appear next to each sport name comparing current vs previous total sessions

#### Scenario: Ranking chart empty state
- **WHEN** no sport activity data exists for the period
- **THEN** the chart container SHALL be hidden
- **THEN** an empty state message SHALL display: "Sin actividad deportiva en este período"

### Requirement: Fix broken period selector in sport type breakdown

The system SHALL fix the 15d/1m/3m period selector in the "Deporte por tipo" section. The selector default SHALL be 7 days with the selector working for all options.

#### Scenario: Period selector functional
- **WHEN** user clicks "15 días", "1 mes", or "3 meses"
- **THEN** the sport type breakdown SHALL re-render with data for the selected period
- **THEN** the active filter button SHALL have the active class

#### Scenario: Default period is 7 days
- **WHEN** the activity view loads
- **THEN** the "Deporte por tipo" section SHALL default to 7 days

### Requirement: Remove duplicate duration column in sport table

The system SHALL remove the redundant "Duración" (last column) from the sport ranking table and replace it with an average kcal per session metric.

#### Scenario: Sport table columns
- **WHEN** the sport ranking table renders
- **THEN** columns SHALL be: Tipo, Sesiones, kcal Promedio, kcal Totales
- **THEN** the table SHALL NOT include a duplicate "Duración" column
- **THEN** the "kcal Promedio" column SHALL be computed as total_kcal / session_count

### Requirement: Additional metrics in sessions comparison row

The system SHALL display additional complementary metrics alongside the "sesiones vs período anterior" row: total training time and average session duration.

#### Scenario: Sessions comparison with time metrics
- **WHEN** the weekly sport summary card renders
- **THEN** the comparison strip SHALL include total hours trained in the period
- **THEN** the strip SHALL include average minutes per session
- **THEN** both metrics SHALL show period-over-period comparison arrows
