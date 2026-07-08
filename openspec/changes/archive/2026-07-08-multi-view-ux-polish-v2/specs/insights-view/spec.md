## MODIFIED Requirements

### Requirement: Insights view sections

The insights view SHALL display the following sections in order: (1) heatmap with dynamic title, (2) day-of-week pattern with enhanced KPIs, (3) sport distribution with compact donut layout, (4) recovery score with signal explanations. The weight velocity section and waist-to-hip ratio section SHALL NOT be rendered. The auto-insights section SHALL NOT be rendered (moved to dashboard). The strength training section SHALL remain unchanged.

#### Scenario: Sections rendered in order
- **WHEN** the insights view renders
- **THEN** the sections SHALL appear in order: heatmap, day-of-week, sport distribution, recovery, strength
- **THEN** no weight velocity section SHALL exist
- **THEN** no waist-to-hip ratio section SHALL exist
- **THEN** no auto-insights section SHALL exist

#### Scenario: Dynamic heatmap title
- **WHEN** the user selects a period filter (90d, 6m, 1y)
- **THEN** the heatmap title SHALL reflect the selected period (see `insights-visual-redesign` spec)

#### Scenario: Global empty banner
- **WHEN** all sections have no data
- **THEN** a global empty banner SHALL appear with appropriate message

### Requirement: Insights view filter and data flow

The insights view SHALL support period filters (90d, 6m, 1y) that control the date range for heatmap, day-of-week, and sport distribution sections. The recovery score and strength sections SHALL NOT be affected by the period filter (they use their own fixed windows).

#### Scenario: Filter affects heatmap and distribution
- **WHEN** the user selects "3m" filter
- **THEN** the heatmap SHALL show the last 90 days
- **THEN** the day-of-week chart SHALL use last 90 days of data
- **THEN** the sport distribution SHALL use all-time data (unchanged by filter)
