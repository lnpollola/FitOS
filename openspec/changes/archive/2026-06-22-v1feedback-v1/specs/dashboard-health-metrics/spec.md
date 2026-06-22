## MODIFIED Requirements

### Requirement: Dashboard hero card with growth ring signature

The system SHALL render exactly one `.card-hero` element at the top of `#view-dashboard` (Row 1, full row span) showing the weekly average energy balance as a large Fraunces number with a `kcal` italic unit, a descriptive subtitle, and a legend. The hero SHALL contain an SVG growth ring (`utils/growth-ring.js`) on the left showing one arc per day in the selected period; the ring radius SHALL grow with day index (tree-ring metaphor) and the stroke width SHALL scale with the day's energy balance normalized across the period. The ring SHALL encode the same metric as the headline (energy balance), NOT step count. The ring SHALL be the dashboard's only signature element. The legend SHALL use balance-relative labels ("Excedente" for surplus days, "Déficit" for deficit days) instead of step-activity labels.

#### Scenario: Hero renders with valid data
- **WHEN** the dashboard loads and `avgBalance` is not null and `ringValues.length >= 1`
- **THEN** `.card-hero` SHALL render with `grid-template-columns: minmax(170px, 220px) 1fr`
- **THEN** the hero text SHALL show the balance number in Fraunces ≥ 40px
- **THEN** the growth ring SVG SHALL appear in the left column encoding daily energy balance values
- **THEN** the legend SHALL list "Excedente" (moss dot) and "Déficit" (ember dot)

#### Scenario: Hero collapses when no ring data
- **WHEN** the dashboard loads and `ringValues.length === 0`
- **THEN** `.card-hero` SHALL render with `grid-template-columns: 1fr`
- **THEN** the hero SHALL NOT include an empty left column or a placeholder ring
- **THEN** the hero SHALL NOT render the legend
- **THEN** the activity summary row SHALL render immediately below `.card-hero` with no empty card slot between them

### Requirement: Health metric cards render inline sparklines when series available

The system SHALL render a `sparkline()` (from `src/renderer/utils/sparkline.js`) inside each dashboard `.dashboard-card` whose metric has 2 or more time-series data points in the selected period. Cards without a series (e.g. blood pressure, sessions summary) SHALL render without a sparkline and without any empty `<svg>` placeholder. The sparkline SHALL appear between the metric value and the subtitle.

#### Scenario: Weight card shows sparkline
- **WHEN** the dashboard renders and the selected period has ≥ 2 weight entries
- **THEN** the latest-weight `.dashboard-card` SHALL contain an `<svg class="spark">` element between the `.value` and the `.subtitle`

#### Scenario: HRV / RHR composite shows sparkline
- **WHEN** HRV data exists for ≥ 2 days in the period
- **THEN** the HRV composite `.dashboard-card` SHALL contain an `<svg class="spark">` element

#### Scenario: Steps card shows three independent period averages
- **WHEN** the dashboard renders the steps card
- **THEN** the card subtitle SHALL include the 7d, 15d, and 1m step averages
- **THEN** the 7d average SHALL be computed from the last 7 days of a 30-day daily summary fetch
- **THEN** the 15d average SHALL be computed from the last 15 days of the same 30-day fetch
- **THEN** the 1m average SHALL be computed from the full 30-day fetch
- **THEN** the three averages SHALL be independent of the selected chart date range
- **THEN** the renderer SHALL NOT render separate cards for "7d", "15d", and "1m" steps

#### Scenario: No empty SVG placeholder when series absent
- **WHEN** a card's metric series has < 2 data points
- **THEN** the card SHALL NOT contain an `<svg class="spark">` element
- **THEN** the card SHALL NOT contain any empty `<svg>` placeholder

## ADDED Requirements

### Requirement: Dashboard date range selector with 15d/1m/3m options

The system SHALL provide a fixed date range selector on the dashboard with exactly three options: "Últimos 15 días" (15d), "Último mes" (1m, 30 days), and "Últimos 3 meses" (3m, 90 days). The default range SHALL be 15d. The selector SHALL control the chart date range and all metric cards except the steps card's period averages (which are always computed from a 30-day window).

#### Scenario: Default range is 15d
- **WHEN** the dashboard loads for the first time
- **THEN** the selected range SHALL be 15d
- **THEN** the 15d filter button SHALL have the active class

#### Scenario: User selects 1m
- **WHEN** the user clicks the "Último mes" filter button
- **THEN** the dashboard SHALL re-render with data for the last 30 days
- **THEN** the 1m filter button SHALL have the active class

#### Scenario: User selects 3m
- **WHEN** the user clicks the "Últimos 3 meses" filter button
- **THEN** the dashboard SHALL re-render with data for the last 90 days
- **THEN** the 3m filter button SHALL have the active class

#### Scenario: 3m mapping in date-range utility
- **WHEN** `getRangeDates('3m')` is called
- **THEN** the function SHALL return a `from` date 90 days before today

### Requirement: Dashboard activity summary positioned at top

The system SHALL position the green "Resumen de Actividad" card (`.card-accent`) immediately after the hero card, not at the bottom of the dashboard. Per-sport detail cards SHALL follow the green summary card in the same grid row. The green summary SHALL remain full-width (`grid-column: 1 / -1`).

#### Scenario: Activity summary appears after hero
- **WHEN** the dashboard renders with activity data
- **THEN** the `.card-accent` "Resumen de Actividad" SHALL appear in the row immediately after `.card-hero`
- **THEN** per-sport `.dashboard-card` elements SHALL appear after the `.card-accent` in the same grid

#### Scenario: Activity summary absent when no sport data
- **WHEN** the dashboard renders with no sport activity data for the selected period
- **THEN** the green summary card SHALL NOT render
- **THEN** no empty placeholder SHALL appear in its place

### Requirement: Dashboard card layout eliminates blank grid gaps

The system SHALL arrange dashboard cards so that no large blank spaces appear between sections. The grid rows SHALL be structured to fill without leaving empty tracks. The kcal/día trend chart SHALL be positioned as the last row of the dashboard (full width), not between the health metric cards and the activity summary.

#### Scenario: No blank space between blood pressure and activity summary
- **WHEN** the dashboard renders with blood pressure and activity data
- **THEN** the health metric cards (steps, exercise, RHR, SpO2, BP) SHALL be in a grid row above the trend chart
- **THEN** the trend chart SHALL be the last row
- **THEN** no empty grid tracks SHALL be visible between the BP card and the trend chart

#### Scenario: Trend chart at bottom
- **WHEN** the dashboard renders with ≥ 2 days of daily data
- **THEN** the kcal/día trend Chart.js chart SHALL appear as the last visual element on the dashboard
- **THEN** the trend chart SHALL span the full width (`grid-column: 1 / -1`)
