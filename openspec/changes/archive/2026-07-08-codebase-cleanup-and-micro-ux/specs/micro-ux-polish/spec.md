## ADDED Requirements

### Requirement: Sparkline min/max tooltips on dashboard KPI cards

Each dashboard KPI card sparkline SHALL display a native browser tooltip (via `title` attribute on the SVG element) showing the minimum and maximum values of the data series. Format: "Min: X | Max: Y" where values are formatted with the same units as the card's main value.

#### Scenario: Sparkline tooltip with data
- **WHEN** a dashboard KPI card renders with a sparkline of 7+ data points
- **THEN** the SVG element SHALL have a `title` attribute showing "Min: X | Max: Y"
- **THEN** hovering over the sparkline SHALL display the tooltip natively

#### Scenario: Sparkline tooltip with insufficient data
- **WHEN** a sparkline has fewer than 2 data points
- **THEN** no sparkline SHALL render (existing behavior)
- **THEN** no tooltip SHALL be needed

### Requirement: Keyboard navigation on PR sport tabs

The PR panel sport tabs (Running / Ciclismo / Fuerza) SHALL be keyboard-navigable. The tab container SHALL have `role="tablist"`, each tab SHALL have `role="tab"` and `aria-selected="true/false"`. Arrow keys (Left/Right) SHALL move focus between tabs. Enter/Space SHALL activate the focused tab.

#### Scenario: Arrow key navigation
- **WHEN** the PR panel renders with tabs
- **THEN** pressing ArrowRight on the "Running" tab SHALL focus "Ciclismo"
- **THEN** pressing ArrowRight on "Ciclismo" SHALL focus "Fuerza"
- **THEN** pressing ArrowRight on "Fuerza" SHALL wrap to "Running"
- **THEN** pressing ArrowLeft SHALL navigate in reverse

#### Scenario: Enter activates tab
- **WHEN** a tab is focused via keyboard
- **WHEN** the user presses Enter or Space
- **THEN** the focused tab SHALL become active and PRs SHALL filter accordingly

### Requirement: Recovery score progress bar when baseline incomplete

When the recovery score has incomplete baseline (< 30 days), the empty state SHALL display a visual progress bar showing how many days of data are available out of the required 30. Format: a horizontal bar with fill width proportional to `daysAvailable / 30`, plus text "X de 30 días de datos".

#### Scenario: Progress bar shows partial data
- **WHEN** the recovery score has 15 days of data
- **THEN** a progress bar SHALL render at 50% width
- **THEN** text SHALL show "15 de 30 días de datos"

#### Scenario: Progress bar at 0 days
- **WHEN** the recovery score has 0 days of data
- **THEN** the progress bar SHALL render at 0% width (empty)
- **THEN** text SHALL show "0 de 30 días de datos"

### Requirement: Realistic skeleton for combined streak+calendar card

The combined streak+calendar card SHALL display a skeleton loading state that reflects the 30/70 two-column layout: a narrow skeleton block on the left (~30% width) for streak data and a wider skeleton block on the right (~70% width) for the calendar grid.

#### Scenario: Skeleton matches layout
- **WHEN** the combined streak+calendar card is loading
- **THEN** the skeleton SHALL show two blocks: left ~30% width, right ~70% width
- **THEN** the right block SHALL have a grid-like skeleton pattern (suggesting calendar cells)

### Requirement: Smooth period transition in analytics charts

When the user changes the period filter (7d/1m/3m) in the analytics view, charts SHALL fade out and back in with a CSS opacity transition (200ms ease). The transition SHALL apply to all chart containers in the view.

#### Scenario: Chart fade transition on period change
- **WHEN** the user clicks a different period filter button
- **THEN** all chart containers SHALL transition opacity from 1 to 0 over 200ms
- **THEN** charts SHALL be recreated
- **THEN** chart containers SHALL transition opacity from 0 to 1 over 200ms
