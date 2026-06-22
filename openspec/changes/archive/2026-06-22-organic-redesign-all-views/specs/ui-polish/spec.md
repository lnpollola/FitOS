# UI Polish

## ADDED Requirements

### Requirement: Eyebrow typography is Fraunces italic, not uppercase-letter-spaced

The system SHALL render card `h3` eyebrows (the small labels above metric values) in Fraunces italic 14px with `text-transform: none` and `letter-spacing: 0` under `body.organic`. The SaaS-default `text-transform: uppercase; letter-spacing: 0.5px` pattern SHALL be removed from every card eyebrow in every view. Labels that distinguish chart axes (`th` in tables) MAY retain uppercase styling because they refer to tabular column headers, not card eyebrows.

#### Scenario: Card eyebrows use Fraunces italic
- **WHEN** any view renders a `.dashboard-card h3`, `.card h3`, `.chart-card h3`, `.mini-chart-card h4`, or `.analytics-kpi-card .kpi-label`
- **THEN** under `body.organic` the eyebrow SHALL use `font-family: var(--font-display)`, `font-style: italic`, `font-weight: 500`, `font-size: 14px`, `text-transform: none`, `letter-spacing: 0`

#### Scenario: Table headers retain uppercase
- **WHEN** the dashboard renders a `<th>` element
- **THEN** `uppercase` and `letter-spacing` SHALL still apply (table headers are column labels, not card eyebrows)

### Requirement: Per-card gradient top-bar template removed

The system SHALL NOT render the `linear-gradient(90deg, var(--accent), var(--success))` 3px top-bar `::before` pseudo-element on any card style across any view. The dashboard hero growth ring IS the signature; the gradient top-bar was the previous template answer and is now obsolete.

#### Scenario: No gradient top-bar on dashboard cards
- **WHEN** the dashboard renders `.dashboard-card`s
- **THEN** no `.dashboard-card::before` SHALL apply a `linear-gradient` background
- **THEN** the `::before` rule SHALL be `display: none` under `body.organic`

#### Scenario: No gradient top-bar on other views' cards
- **WHEN** activity, diet, energy, measurements, training, analytics, or profile renders card components
- **THEN** no `::before` SHALL apply a gradient top bar (the rule SHALL not exist in any per-view `#view-<name>::before` block)

## MODIFIED Requirements

### Requirement: Stable hover states without layout shift

Card and interactive element hover states SHALL use `box-shadow` and `border-color` transitions, not `transform: scale()` or `transform: translateY()`. Hover feedback SHALL NOT cause layout shift or reflow of neighboring elements. Under `body.organic`, hover transitions SHALL use `var(--ease-organic)` timing and a duration between 200ms and 350ms (vs the previous 150ms `ease`).

#### Scenario: Dashboard card hover uses shadow not transform
- **WHEN** a user hovers over a `.dashboard-card`
- **THEN** the card SHALL increase `box-shadow` to `var(--shadow-md)` and optionally darken `border-color`
- **THEN** the card SHALL NOT apply `transform: translateY(-1px)` or any transform that shifts layout

#### Scenario: Hover transitions are organic
- **WHEN** any interactive element has a hover state under `body.organic`
- **THEN** the CSS `transition-duration` SHALL be between 200ms and 350ms
- **THEN** the `transition-timing-function` SHALL be `var(--ease-organic)` (`cubic-bezier(.2, .85, .25, 1)`)

### Requirement: Chart visual polish

Chart.js instances SHALL apply consistent visual polish: themed tooltips (card background, proper text colors), subtle grid lines, hidden points by default with hover-reveal, and legend as interactive chips. Under `body.organic`, chart colors SHALL read the organic palette via `chartColors` (which reads `--accent` etc. via `getComputedStyle`); no hardcoded hex strings SHALL remain in any chart configuration in any view.

#### Scenario: Chart tooltips use card styling
- **WHEN** a user hovers over a chart data point
- **THEN** the tooltip SHALL have `backgroundColor: 'rgba(255,255,255,0.95)'` (or `rgba(251, 247, 238, 0.95)` under `body.organic` matching the paper token), `titleColor` and `bodyColor` using `chartColors.textPrimary`
- **THEN** the tooltip SHALL have `borderRadius: 6` and `padding: 10`

#### Scenario: Grid lines are subtle
- **WHEN** a chart renders grid lines
- **THEN** the grid color SHALL read from `chartColors.grid` (which resolves to `var(--border)` → `#D8D2C4` under organic)
- **THEN** vertical grid lines SHALL be hidden (`display: false` on x grid) unless the chart type requires them

#### Scenario: No hardcoded hex in view chart code
- **WHEN** a developer searches `src/renderer/views/*.js` for hex color patterns (`#[0-9A-Fa-f]{6}`)
- **THEN** zero matches SHALL exist in chart configuration objects (borderColor, backgroundColor, grid color, tick color)