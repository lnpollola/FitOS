## MODIFIED Requirements

### Requirement: Analytics KPI cards with adjacent trend arrows

The analytics view SHALL display KPI cards at the top with trend arrows positioned immediately to the right of the numeric value on the same line. The arrow SHALL use color coding: green (`var(--success)`) for improvement, red (`var(--danger)`) for worsening, gray (`var(--text-secondary)`) for stable. The arrow SHALL NOT appear on a separate line below the value.

#### Scenario: KPI card with adjacent arrow
- **WHEN** an analytics KPI card renders with trend data
- **THEN** the value and arrow SHALL be on the same line (e.g., flexbox row: "7,432 ▲")
- **THEN** the arrow SHALL NOT wrap to a new line

#### Scenario: KPI card without trend data
- **WHEN** previous period data is unavailable
- **THEN** the value SHALL render without an arrow
- **THEN** no empty space SHALL appear where the arrow would be

### Requirement: Analytics charts period-aware rendering

All Chart.js charts in the analytics view SHALL aggregate data according to the selected period and render X-axis labels in ascending chronological order from left to right. The aggregation logic SHALL be:
- 7d: daily data points, labels = day names (Lun, Mar, Mié...)
- 1m: weekly data points (ISO weeks), labels = "Sem 1", "Sem 2"...
- 3m: monthly data points, labels = month names (Abr, May, Jun)

This SHALL apply to all 6 main charts (steps, HR, energy, HRV, sleep, activities) and all 7 secondary mini-charts (RHR, VO2 Max, exercise time, walking speed, flights climbed, walking distance, cycling distance).

#### Scenario: 7d period renders daily data
- **WHEN** the user selects "7d"
- **THEN** all charts SHALL show 7 data points with day labels
- **THEN** data SHALL be ordered chronologically left to right

#### Scenario: 1m period renders weekly aggregates
- **WHEN** the user selects "1m"
- **THEN** all charts SHALL show 4-5 weekly data points
- **THEN** each data point SHALL be the sum (or average, as appropriate) for that ISO week

#### Scenario: 3m period renders monthly aggregates
- **WHEN** the user selects "3m"
- **THEN** all charts SHALL show 3 monthly data points
- **THEN** each data point SHALL be the sum (or average) for that month

#### Scenario: Secondary charts follow period
- **WHEN** the user selects a period
- **THEN** all 7 secondary mini-charts SHALL also aggregate to the same period
- **THEN** X-axis labels SHALL match the period selection

### Requirement: Energy chart with context KPIs

The energy chart section SHALL display intermediate KPI values between the chart title and the chart canvas, showing average daily active kcal, average daily basal kcal, and the active-to-basal ratio as a percentage.

#### Scenario: Energy context KPIs render
- **WHEN** the energy chart renders with data
- **THEN** a row of 3 KPI values SHALL appear above the chart
- **THEN** values SHALL be: "Activa: X kcal/día", "Basal: Y kcal/día", "Ratio: Z%"
