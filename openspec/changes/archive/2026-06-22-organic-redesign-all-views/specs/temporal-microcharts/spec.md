# Temporal Microcharts

## ADDED Requirements

### Requirement: Sparkline renderer module

The system SHALL provide `src/renderer/utils/sparkline.js` exporting a `sparkline(values, options)` function that returns an SVG string (or empty string when fewer than 2 data points are supplied). The renderer SHALL NOT depend on Chart.js, D3, or any other charting library.

#### Scenario: Module exports sparkline
- **WHEN** a view imports the module
- **THEN** the named export `sparkline` SHALL be a function `(values: Array<number|null>, options?: object) => string`

#### Scenario: Empty input returns empty string
- **WHEN** `sparkline([])` or `sparkline([42])` is called
- **THEN** the function SHALL return `''`
- **THEN** the function SHALL NOT throw

### Requirement: Smooth Catmull-Rom-to-Bezier path

The renderer SHALL draw the line as a cubic Bezier path computed from a Catmull-Rom-style spline over the points, so the microchart reads as a continuous organic curve rather than a series of straight segments. The path SHALL be placed in a `<path class="line">` element inside the returned SVG.

#### Scenario: Three points produce Bezier curve
- **WHEN** `sparkline([1, 2, 3])` is called
- **THEN** the returned SVG SHALL contain exactly one `<path class="line">` element
- **THEN** the `d` attribute SHALL start with `M ` and contain at least one `C ` cubic Bezier command
- **THEN** the `d` attribute SHALL NOT contain only `L` line-to commands

### Requirement: Area fill and end dot

The renderer SHALL also emit a `<path class="area">` element (closed to the bottom of the viewBox, filled with the stroke color at low opacity) and a `<circle class="dot">` element marking the most recent data point. The two paths and the dot SHALL be siblings inside the returned `<svg class="spark">` root.

#### Scenario: Area and dot siblings
- **WHEN** any valid `sparkline(values)` call returns
- **THEN** the SVG root SHALL contain exactly one `<path class="area">`, one `<path class="line">`, and one `<circle class="dot">`
- **THEN** all three SHALL be direct children of the `<svg>` root

### Requirement: Inline CSS variable stroke color

The renderer SHALL accept a `stroke` option (default `'var(--moss)'`) and apply it as inline `style="stroke:..."` on the line path and inline `style="fill:..."` on the area path. The renderer SHALL NOT hardcode hex colors. This allows the sparkline to inherit the organic palette (or the original slate+teal fallback) automatically via CSS cascade.

#### Scenario: Default stroke is moss
- **WHEN** `sparkline([1, 2, 3])` is called without options
- **THEN** the `<path class="line">` SHALL have `style="stroke:var(--moss)"`
- **THEN** the `<path class="area">` SHALL have `style="fill:var(--moss)"`

#### Scenario: Custom stroke override
- **WHEN** `sparkline([1, 2, 3], { stroke: 'var(--ember)' })` is called
- **THEN** the line `style` SHALL be `stroke:var(--ember)`
- **THEN** the area `style` SHALL be `fill:var(--ember)`

### Requirement: Configurable dimensions

The renderer SHALL accept `width` (default 120) and `height` (default 36) options. The returned SVG SHALL have `viewBox="0 0 {width} {height}"` and `preserveAspectRatio="none"` so the chart can stretch to fill its container via CSS without distortion when the container width is unconstrained.

#### Scenario: Default viewBox
- **WHEN** `sparkline([1, 2, 3])` is called without dimension options
- **THEN** the SVG `viewBox` SHALL be `"0 0 120 36"`

#### Scenario: Custom dimensions
- **WHEN** `sparkline(values, { width: 200, height: 50 })` is called
- **THEN** the SVG `viewBox` SHALL be `"0 0 200 50"`

### Requirement: Null tolerance

The renderer SHALL tolerate `null` / `undefined` values in the series by treating them as `0` for placement purposes. The renderer SHALL NOT throw on mixed-null input.

#### Scenario: Null values handled
- **WHEN** `sparkline([1, null, 3, undefined, 5])` is called
- **THEN** the function SHALL return a valid SVG string with 5 placed points
- **THEN** the function SHALL NOT throw

### Requirement: No animation

The renderer SHALL NOT emit any `<animate>` elements, CSS animations, or `transition` declarations on the sparkline. Sparklines are static visualizations; motion is provided by view-level reveal animations if any, not by the sparkline itself.

#### Scenario: No animation elements
- **WHEN** any `sparkline(values)` returns an SVG
- **THEN** the SVG SHALL NOT contain `<animate>`, `<animateTransform>`, or `<set>` elements
- **THEN** the SVG SHALL NOT include inline `style` declarations containing `animation` or `transition` keywords

### Requirement: CSS styling hooks

The system SHALL provide CSS rules scoped to `.spark` (root SVG), `.spark .line`, `.spark .area`, and `.spark .dot` in `src/renderer/styles/main.css` under `body.organic` so the sparkline picks up the organic palette by default. Views SHALL NOT need to add their own CSS to render a sparkline.

#### Scenario: Spark inherits organic palette
- **WHEN** `body.organic` is active and a sparkline is rendered
- **THEN** `.spark .line` SHALL have `stroke-width: 1.6; stroke-linecap: round` (with the color coming from the inline `style="stroke:var(--moss)"`)
- **THEN** `.spark .area` SHALL have `opacity: 0.14`
- **THEN** `.spark .dot` SHALL have `fill: var(--moss-ink); stroke: var(--paper); stroke-width: 1.4`