# Dashboard Enhancements

## Purpose

Enhance the dashboard with session-first activity layout, weekly balance breakdown (basal vs activity + diet target), weight variation, steps period indicators, HRV composite, and trend chart.

## Requirements

### ADDED Requirements

### Requirement: Session-first activity layout

The system SHALL display activity cards with session count as the primary metric.

#### Scenario: Session count cards render first
- **WHEN** sport activity data exists
- **THEN** display a summary card with total sessions + total kcal
- **THEN** per-sport cards follow, ordered by session count descending
- **THEN** each card shows: icon, name, sessions, total kcal, avg kcal/session

#### Scenario: Additional categories
- **WHEN** sport activity data exists
- **THEN** show total sport hours, avg kcal/session, unique sport types

### Requirement: Weekly balance with breakdown

The system SHALL display weekly balance as avg/day with basal vs activity breakdown and diet target.

#### Scenario: Weekly balance shows breakdown
- **WHEN** dashboard renders
- **THEN** show (consumed - burned) / days, with basal (BMR) and activity (sport+NEAT) components
- **THEN** show diet target as reference line

### Requirement: Weight variation with trend

#### Scenario: Weight card shows variation
- **WHEN** >=2 weight entries
- **THEN** show latest weight, ±variation, trend arrow

### Requirement: Steps multi-period indicators

#### Scenario: Three compact period cards
- **WHEN** dashboard renders
- **THEN** show "7d: NNNN", "15d: NNNN", "1m: NNNN" with trend arrows

### Requirement: HRV + resting HR composite

#### Scenario: Composite card renders
- **WHEN** HRV and HR data exists
- **THEN** show latest HRV, latest resting HR, 7d averages, trend arrow

### Requirement: Dashboard trend chart card

#### Scenario: Trend chart renders
- **WHEN** activity data exists
- **THEN** display a Chart.js line chart with daily kcal + 7-day MA

### Requirement: Date range selector

#### Scenario: Quick-access buttons
- **WHEN** user clicks "7d" / "15d" / "1m"
- **THEN** all KPIs update for selected range

### Requirement: Remove current-day calories card

#### Scenario: Not displayed
- **WHEN** dashboard renders
- **THEN** no "calorías de hoy" card shown

### Requirement: Last update timestamp

#### Scenario: Last update shown
- **WHEN** import data exists
- **THEN** display "Última actualización: {date} {time}"
