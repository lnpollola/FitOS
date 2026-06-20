# Measurements Revamp

## Purpose

Restructure measurements view with compact card grid, top-5 history, KPI overlays on charts, monthly weight split, and combined chest/neck/shoulders chart.

## ADDED Requirements

### Requirement: Compact chart cards with KPI overlays

Individual metric trend charts SHALL render at compact 140px height with KPI overlay showing current value and delta.

#### Scenario: Compact chart renders with KPI
- **WHEN** a user navigates to the measurements view and metric charts are rendered
- **THEN** each chart card SHALL be 140px height with a KPI overlay showing the latest value and change vs previous measurement

#### Scenario: No delta on single measurement
- **WHEN** only one measurement set exists
- **THEN** the KPI overlay SHALL show only the current value without delta

### Requirement: Top-5 history table

The measurement history table SHALL display only the 5 most recent entries by default, with a "Ver todo" button to expand to all entries.

#### Scenario: History shows top-5 by default
- **WHEN** a user navigates to the measurements view
- **THEN** the history table SHALL show only the 5 most recent measurement sets

#### Scenario: Expand to full history
- **WHEN** a user clicks "Ver todo"
- **THEN** the table SHALL expand to show all measurement sets
- **THEN** the button text SHALL change to "Mostrar menos"

### Requirement: Monthly weight trend split

The weight trend chart SHALL group data points by calendar month, rendering each month as a separate dataset segment with month-over-month KPIs.

#### Scenario: Weight chart grouped by month
- **WHEN** the user has weight entries spanning multiple months
- **THEN** the weight chart SHALL show each calendar month as a distinct segment with monthly average annotation

### Requirement: Combined chest/neck/shoulders chart

The system SHALL render a single multi-line chart for chest, neck, and shoulders metrics with per-metric KPI overlay and trendline.

#### Scenario: Chest/neck/shoulders multi-chart
- **WHEN** the user has measurement data for chest, neck, and shoulders
- **THEN** a combined chart SHALL show three lines (chest, neck, shoulders) with per-metric current value KPI
- **THEN** a trendline SHALL overlay the chart
