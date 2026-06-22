# Dashboard Health Metrics

## ADDED Requirements

### Requirement: Dashboard hero card with growth ring signature

The system SHALL render exactly one `.card-hero` element at the top of `#view-dashboard` (Row 1, full row span) showing the weekly average energy balance as a large Fraunces number with a `kcal` italic unit, a descriptive subtitle, and a legend. The hero SHALL contain an SVG growth ring (`utils/growth-ring.js`) on the left showing one arc per day in the selected period; the ring radius SHALL grow with day index (tree-ring metaphor) and the stroke width SHALL scale with the day's step count normalized across the period. The ring SHALL be the dashboard's only signature element.

#### Scenario: Hero renders with valid data
- **WHEN** the dashboard loads and `avgBalance` is not null and `ringValues.length >= 1`
- **THEN** `.card-hero` SHALL render with `grid-template-columns: minmax(170px, 220px) 1fr`
- **THEN** the hero text SHALL show the balance number in Fraunces ≥ 40px
- **THEN** the legend SHALL list "Activo" (moss dot) and "Bajo" (ember dot)
- **THEN** the growth ring SVG SHALL appear in the left column

#### Scenario: Hero collapses when no ring data
- **WHEN** the dashboard loads and `ringValues.length === 0`
- **THEN** `.card-hero` SHALL render with `grid-template-columns: 1fr`
- **THEN** the hero SHALL NOT include an empty left column or a placeholder ring
- **THEN** the hero SHALL NOT render the legend (legend refers to ring arcs that don't exist)
- **THEN** `row-activity` (sessions summary + per-sport cards) SHALL render immediately below `.card-hero` with no empty card slot between them

### Requirement: Growth ring renders as a visually complete disc for low day counts

The system SHALL provide `src/renderer/utils/growth-ring.js` exporting `growthRing(values)` returning an SVG string. For `N ≤ 14` days, arcs SHALL tile edge-to-edge with `gap = 0` so the ring reads as a complete disc; only the stroke-width variance reveals the day boundaries. For `N > 14` days, a `gap ≤ 0.6°` SHALL be permitted so individual days remain distinguishable. The renderer SHALL NOT leave a visible wedge at the 12 o'clock origin for any N ≥ 1.

#### Scenario: Low day count closes the ring
- **WHEN** `growthRing([5000, 7000, 4500, 8000, 6000, 9000, 5200])` (N = 7) is called
- **THEN** the SVG SHALL render a complete ring with no gap at the 12 o'clock origin
- **THEN** the sum of all arc sweep angles SHALL equal 360°
- **THEN** each arc SHALL connect to the start of the next with no visible gap

#### Scenario: High day count keeps small inter-day gaps
- **WHEN** `growthRing(values)` with `values.length === 30`
- **THEN** a small `gap ≤ 0.6°` between adjacent arcs SHALL be permitted
- **THEN** the sum of all arc sweeps plus all gaps SHALL equal 360°

#### Scenario: Single day still renders
- **WHEN** `growthRing([5000])` (N = 1) is called
- **THEN** the SVG SHALL render a complete circle (one arc with sweep = 360°)
- **THEN** the SVG SHALL NOT be empty

### Requirement: Health metric cards render inline sparklines when series available

The system SHALL render a `sparkline()` (from `src/renderer/utils/sparkline.js`) inside each dashboard `.dashboard-card` whose metric has 2 or more time-series data points in the selected period. Cards without a series (e.g. blood pressure, sessions summary) SHALL render without a sparkline and without any empty `<svg>` placeholder. The sparkline SHALL appear between the metric value and the subtitle.

#### Scenario: Weight card shows sparkline
- **WHEN** the dashboard renders and the selected period has ≥ 2 weight entries
- **THEN** the latest-weight `.dashboard-card` SHALL contain an `<svg class="spark">` element between the `.value` and the `.subtitle`

#### Scenario: HRV / RHR composite shows sparkline
- **WHEN** HRV data exists for ≥ 2 days in the period
- **THEN** the HRV composite `.dashboard-card` SHALL contain an `<svg class="spark">` element

#### Scenario: Steps card collapses three sub-period cards into one
- **WHEN** the dashboard renders Row 2 (steps + extras)
- **THEN** exactly one `.dashboard-card` SHALL render steps, with a sparkline of the full-period daily steps series
- **THEN** the same card subtitle SHALL include the 7d, 15d, and 1m averages
- **THEN** the renderer SHALL NOT render separate cards for "7d", "15d", and "1m" steps as in the pre-spike design

#### Scenario: No empty SVG placeholder when series absent
- **WHEN** a card's metric series has < 2 data points
- **THEN** the card SHALL NOT contain an `<svg class="spark">` element
- **THEN** the card SHALL NOT contain any empty `<svg>` placeholder

## MODIFIED Requirements

### Requirement: Sleep card on dashboard

The system SHALL display sleep hours as a health metric card on the dashboard, using data from the app's `activity_days` table. The card SHALL include an inline sparkline of the period's nightly sleep hours when ≥ 2 days of data exist.

#### Scenario: Sleep card renders with data
- **WHEN** the dashboard loads and sleep data exists for the selected period
- **THEN** the system SHALL display a card showing average sleep hours for the period
- **THEN** the card SHALL display a 7-day trailing average
- **THEN** the card SHALL show a trend arrow (▲/▼/―) comparing the current period to the previous period
- **THEN** sleep between 7-9h SHALL show green "Óptimo"; outside that range SHALL show yellow "Ajustar"
- **THEN** when ≥ 2 nights exist the card SHALL render an `<svg class="spark">` between the value and the subtitle

#### Scenario: Sleep card empty state
- **WHEN** no sleep data exists for the selected period
- **THEN** the card SHALL display "--" without breaking the layout
- **THEN** the card SHALL NOT render a sparkline