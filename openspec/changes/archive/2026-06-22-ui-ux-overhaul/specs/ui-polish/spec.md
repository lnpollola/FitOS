## ADDED Requirements

### Requirement: Stable hover states without layout shift

Card and interactive element hover states SHALL use `box-shadow` and `border-color` transitions, not `transform: scale()` or `transform: translateY()`. Hover feedback SHALL NOT cause layout shift or reflow of neighboring elements.

#### Scenario: Dashboard card hover uses shadow not transform
- **WHEN** a user hovers over a `.dashboard-card`
- **THEN** the card SHALL increase `box-shadow` to `var(--shadow-md)` and optionally darken `border-color`
- **THEN** the card SHALL NOT apply `transform: translateY(-1px)` or any transform that shifts layout

#### Scenario: Hover transitions are 150-300ms
- **WHEN** any interactive element has a hover state
- **THEN** the CSS `transition-duration` SHALL be between 150ms and 300ms
- **THEN** the transition SHALL use `ease` or `ease-out` timing function

### Requirement: Staggered card entrance animation

When a grid of cards renders (dashboard rows, analytics KPIs), cards SHALL fade in with a staggered `animation-delay` so they appear sequentially rather than all at once. The stagger interval SHALL be 30-50ms per card.

#### Scenario: Dashboard cards stagger on render
- **WHEN** the dashboard renders a row of metric cards
- **THEN** each card SHALL have an `animation-delay` incrementing by 30-50ms (first card 0ms, second 40ms, third 80ms, etc.)
- **THEN** the animation SHALL be `fadeIn` (opacity 0→1) with a short duration (150-200ms)

#### Scenario: Stagger disabled with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** all `animation-delay` values SHALL be set to `0s` (cards appear immediately)

### Requirement: Chart visual polish

Chart.js instances SHALL apply consistent visual polish: themed tooltips (card background, proper text colors), subtle grid lines, hidden points by default with hover-reveal, and legend as interactive chips.

#### Scenario: Chart tooltips use card styling
- **WHEN** a user hovers over a chart data point
- **THEN** the tooltip SHALL have `backgroundColor: 'rgba(255,255,255,0.95)'`, `borderColor: 'var(--border)'`, `titleColor` and `bodyColor` using `chartColors.textPrimary`
- **THEN** the tooltip SHALL have `borderRadius: 6` and `padding: 10`

#### Scenario: Grid lines are subtle
- **WHEN** a chart renders grid lines
- **THEN** the grid color SHALL be `#F1F5F9` (lighter than the current `#E2E8F0`) for horizontal lines
- **THEN** vertical grid lines SHALL be hidden (`display: false` on x grid) unless the chart type requires them

#### Scenario: Points hidden by default, shown on hover
- **WHEN** a line chart renders
- **THEN** `pointRadius` SHALL be `0` by default
- **THEN** `pointHoverRadius` SHALL be `5` (points appear when the user hovers near a data point)

#### Scenario: Legend is interactive
- **WHEN** a chart has multiple datasets
- **THEN** the legend items SHALL be clickable to toggle dataset visibility (Chart.js default behavior, not disabled)

### Requirement: Pre-delivery UI checklist enforcement

Before any view change is considered complete, the view SHALL pass the pre-delivery checklist from `design-system/fitos/MASTER.md`. The checklist SHALL be verified manually or via smoke tests.

#### Scenario: No emojis as icons
- **WHEN** a view change is ready for review
- **THEN** the rendered HTML SHALL contain zero emoji characters in icon positions
- **THEN** all icons SHALL be SVG elements

#### Scenario: cursor-pointer on clickable elements
- **WHEN** a view change is ready for review
- **THEN** all clickable elements (buttons, clickable cards, nav items) SHALL have `cursor: pointer` (via CSS class or rule)

#### Scenario: Focus states visible
- **WHEN** a view change is ready for review
- **THEN** all interactive elements SHALL have a visible `:focus-visible` state

#### Scenario: Responsive at standard widths
- **WHEN** the view is tested at 375px, 768px, 1024px, and 1440px widths
- **THEN** no horizontal scroll SHALL occur
- **THEN** no content SHALL be hidden behind fixed elements
