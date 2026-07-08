# Analytics Period Charts

## Purpose

Improve the analytics view with trend arrows adjacent to KPI values, period-aware chart aggregation (daily/weekly/monthly), and energy chart context KPIs.

## Requirements

### Requirement: Analytics KPI trend arrows adjacent to values

Each analytics KPI card SHALL display the trend arrow (▲/▼/―) immediately to the right of the numeric value, on the same line. The arrow SHALL NOT appear below the value on a separate line.

#### Scenario: Arrow next to value
- **WHEN** an analytics KPI card renders with trend data
- **THEN** the trend arrow SHALL appear on the same line as the value (e.g., "7,432 ▲")
- **THEN** the arrow color SHALL indicate direction: green for improvement, red for worsening, gray for stable

#### Scenario: No trend data
- **WHEN** previous period data is unavailable
- **THEN** no arrow SHALL appear
- **THEN** the value SHALL render normally without extra spacing

### Requirement: Charts react to selected period with ascending L→R order

All Chart.js charts in the analytics view (main grid and secondary metrics) SHALL render X-axis labels corresponding to the selected period: 7d → 7 individual day labels (Lun 30, Mar 1, ...), 1m → 4 ISO week labels (Sem 1, Sem 2, ...), 3m → 3 month labels (Abr, May, Jun). Data SHALL be aggregated accordingly and displayed in ascending chronological order from left to right.

#### Scenario: 7-day period shows daily data
- **WHEN** the user selects "7d"
- **THEN** each chart X-axis SHALL show 7 day labels in chronological order
- **THEN** data points SHALL be daily aggregates

#### Scenario: 1-month period shows weekly data
- **WHEN** the user selects "1m"
- **THEN** each chart X-axis SHALL show 4 ISO week labels
- **THEN** data points SHALL be weekly aggregates

#### Scenario: 3-month period shows monthly data
- **WHEN** the user selects "3m"
- **THEN** each chart X-axis SHALL show 3 month labels
- **THEN** data points SHALL be monthly aggregates

#### Scenario: Secondary metrics follow same period
- **WHEN** the user selects a period
- **THEN** all 7 secondary metric mini-charts SHALL also react to the same period
- **THEN** X-axis labels SHALL match the period selection

### Requirement: Energy chart context KPI

The energy active/basal chart SHALL include an intermediate KPI element between the chart title and the chart area showing: average daily active kcal, average daily basal kcal, and the active/basal ratio. This provides context for interpreting the stacked bar chart.

#### Scenario: Energy context KPI renders
- **WHEN** the energy chart section renders with data
- **THEN** a KPI row SHALL appear above the chart showing: "Activa: 450 kcal/día | Basal: 1,800 kcal/día | Ratio: 25%"
- **THEN** values SHALL be computed from the selected period's data
