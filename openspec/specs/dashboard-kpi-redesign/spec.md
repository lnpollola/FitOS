# Dashboard KPI Redesign

## Purpose

Redesign dashboard KPI cards with inline sparkline layout, remove the trend chart row and "Calorías Hoy" card, and display last weight in the hero balance card.

## Requirements

### Requirement: KPI card inline sparkline layout

Each dashboard KPI card SHALL render with a compact inline layout: (1) top row with the metric label on the left and a small sparkline (60×20 px SVG) on the right, (2) the main value displayed prominently below, (3) a comparison block underneath with period-over-period arrows and numeric deltas. The sparkline SHALL use the existing `sparkline()` utility with Catmull-Rom interpolation.

#### Scenario: KPI card with sparkline and comparison
- **WHEN** a dashboard KPI card renders with available data
- **THEN** the top row SHALL contain the label (e.g., "Sueño") on the left and a 60×20 px sparkline on the right
- **THEN** the main value SHALL appear below in Fraunces ≥ 28px
- **THEN** the comparison block SHALL show the current period value, an arrow (▲/▼/―), and the delta vs previous period
- **THEN** the comparison text SHALL be positioned directly below the main value

#### Scenario: KPI card without enough data for sparkline
- **WHEN** a metric has fewer than 2 data points
- **THEN** the top row SHALL show only the label without a sparkline
- **THEN** no empty SVG placeholder SHALL render

### Requirement: Remove trend chart row from dashboard

The system SHALL remove the `#row-trend` section containing the Chart.js daily kcal trend and weekly balance trend charts. Trend information SHALL be conveyed via inline sparklines and text comparisons on each KPI card.

#### Scenario: No trend chart row
- **WHEN** the dashboard renders
- **THEN** no Chart.js line or bar chart SHALL appear between the KPI rows and the sports section
- **THEN** the `#row-trend` container SHALL NOT exist in the DOM

### Requirement: Remove "Calorías Hoy" card

The system SHALL NOT render the "Calorías Hoy" card in the dashboard KPI rows. The card SHALL be removed entirely from the layout.

#### Scenario: No calorías hoy card
- **WHEN** the dashboard renders
- **THEN** no card with the label "Calorías Hoy" SHALL appear in any KPI row
- **THEN** the remaining cards SHALL fill the grid without leaving an empty slot

### Requirement: Last weight displayed in balance weekly card

The system SHALL display the most recent weight entry (from `weight_entries` table) as a compact sub-element within the hero balance card. The weight SHALL show the value in kg with one decimal, the date, and a source indicator ("Apple Watch" or "Manual"). If no weight entries exist, the sub-element SHALL show "Sin registros".

#### Scenario: Last weight shown in hero card
- **WHEN** the dashboard renders and weight entries exist
- **THEN** the hero card SHALL display the most recent weight value (e.g., "93.2 kg") with its date
- **THEN** the weight display SHALL be visually compact (smaller font, muted color)

#### Scenario: No weight entries
- **WHEN** no weight entries exist
- **THEN** the hero card SHALL display "Sin registros de peso" in the weight sub-element
