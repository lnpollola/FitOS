# Strength Weekly Tonnage

## Purpose

Render a weekly bar chart of total training tonnage per ISO week, with period-over-period comparison, so the user can track volume trends over time.

## Requirements

### Requirement: Compute weekly tonnage

The system SHALL compute total tonnage (volume) per ISO week by summing `Σ (load_kg × reps)` across all `training_sets` for sessions within that week. Weeks with zero sessions SHALL NOT appear in the result set. The result SHALL be ordered chronologically by ISO week.

#### Scenario: Weekly aggregation
- **WHEN** the user has sessions in weeks 2026-W23 (5000 kg), 2026-W24 (6200 kg), 2026-W25 (0 kg), 2026-W26 (5800 kg)
- **THEN** the result SHALL contain 3 entries (empty weeks skipped): W23 → 5000, W24 → 6200, W26 → 5800
- **THEN** entries SHALL be ordered by week ascending

#### Scenario: Same exercise across weeks
- **WHEN** the user does bench press in multiple sessions across different weeks
- **THEN** each week SHALL independently sum tonnage from all sets in that week's sessions
- **THEN** exercises SHALL NOT be identified per-week; only the total volume matters

### Requirement: Period-over-period comparison

The system SHALL return the current trailing 12 weeks of data and the immediate preceding 12-week period, so the UI can show a "vs last 12 weeks" comparison. The comparison SHALL be: total tonnage current 12 weeks vs total tonnage previous 12 weeks, as an absolute difference and a percentage change.

#### Scenario: 12-week comparison
- **WHEN** the current 12 weeks total 68000 kg and the previous 12 weeks total 62000 kg
- **THEN** the response SHALL include `delta_kg = 6000` and `delta_pct = 9.7`
- **THEN** the direction SHALL be "up"

#### Scenario: Less volume than previous period
- **WHEN** the current 12 weeks total 55000 kg and the previous 12 weeks total 60000 kg
- **THEN** the response SHALL include `delta_kg = -5000` and `delta_pct = -8.3`
- **THEN** the direction SHALL be "down"

### Requirement: Weekly tonnage chart rendering

The system SHALL render a Chart.js bar chart with one bar per ISO week, bars colored by `var(--accent)` with slightly different alpha for the current vs previous 12-week period. The chart SHALL have a horizontal dashed line at the 12-week average tonnage. The period-over-period summary SHALL appear below the chart as a small stats row.

#### Scenario: Chart renders with data
- **WHEN** the user has 8+ weeks of training data
- **THEN** the bar chart SHALL show up to 24 weeks (12 current + 12 previous) as bars
- **THEN** the last 12 weeks SHALL have a different color tint than the prior 12 weeks
- **THEN** a dashed line SHALL mark the 12-week rolling average

#### Scenario: Insufficient data
- **WHEN** the user has fewer than 4 weeks of training data
- **THEN** the chart section SHALL display "Registra al menos 4 semanas de entrenamiento para ver tu tendencia de volumen"
- **THEN** the period-over-period comparison SHALL be hidden

#### Scenario: Empty state
- **WHEN** the user has no training data
- **THEN** the section SHALL display "Registra tus primeras sesiones de entrenamiento para ver la tendencia de volumen semanal"
