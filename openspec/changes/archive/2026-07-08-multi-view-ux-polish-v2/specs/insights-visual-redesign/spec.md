## ADDED Requirements

### Requirement: Dynamic heatmap title based on selected period

The heatmap section title SHALL reflect the currently selected period filter (90d, 6m, 1y). The title SHALL be "Movimiento — últimos 3 meses", "Movimiento — últimos 6 meses", or "Movimiento — último año" instead of the static "Año en movimiento".

#### Scenario: Title changes with period selection
- **WHEN** the user selects the "3m" filter
- **THEN** the heatmap section title SHALL be "Movimiento — últimos 3 meses"
- **WHEN** the user selects "6m"
- **THEN** the title SHALL be "Movimiento — últimos 6 meses"
- **WHEN** the user selects "1y"
- **THEN** the title SHALL be "Movimiento — último año"

### Requirement: Sport distribution compact layout

The sport distribution section SHALL render with the donut chart on the left (max 200px diameter) and metrics on the right. Metrics SHALL include: total sessions, total minutes, per-sport breakdown with colored swatches, session count, and share percentage. The donut SHALL use distinct colors per sport segment.

#### Scenario: Compact donut with metrics sidebar
- **WHEN** the sport distribution section renders
- **THEN** the donut chart SHALL be max 200px in diameter, positioned on the left
- **THEN** the right side SHALL list each sport with: colored swatch, sport name, session count, total minutes, and share percentage
- **THEN** the total hours SHALL remain centered in the donut

#### Scenario: Donut colors are distinct
- **WHEN** the user has 3+ sports
- **THEN** each sport segment SHALL use a distinct color from the palette
- **THEN** no two adjacent segments SHALL use the same color

### Requirement: Typical week enhanced KPIs

The day-of-week section SHALL display additional KPIs below the bar chart: best day name with its average minutes, worst day name, and consistency indicator (standard deviation of daily minutes). The section SHALL use color accents to highlight the best day.

#### Scenario: Enhanced typical week section
- **WHEN** the day-of-week section renders with data
- **THEN** the bar chart SHALL render with the best day highlighted
- **THEN** below the chart, KPIs SHALL show: "Mejor día: Lunes (45 min prom.)", "Peor día: Miércoles (12 min prom.)"
- **THEN** a consistency indicator SHALL show low/medium/high variability

### Requirement: Remove weight velocity and waist-hip ratio sections

The weight velocity section (`#section-velocity`) and waist-to-hip ratio section (`#section-whr`) SHALL be removed from the insights view. The data and IPC handlers SHALL remain available but SHALL NOT be rendered.

#### Scenario: No velocity section
- **WHEN** the insights view renders
- **THEN** no section with id `#section-velocity` SHALL exist in the DOM
- **THEN** no weight velocity chart SHALL render

#### Scenario: No WHR section
- **WHEN** the insights view renders
- **THEN** no section with id `#section-whr` SHALL exist in the DOM
- **THEN** no waist-to-hip ratio card SHALL render

### Requirement: Recovery card explanation and trend fix

The recovery score section SHALL include a tooltip or info text explaining what each signal represents: HRV (variabilidad del ritmo cardíaco — indicador de recuperación del sistema nervioso), RHR (frecuencia cardíaca en reposo — indicador de fatiga general), Sleep (calidad y duración del sueño). The trend sparkline SHALL render correctly using the last 7 daily composite values.

#### Scenario: Recovery signal explanations visible
- **WHEN** the recovery section renders
- **THEN** each sub-meter (HRV, RHR, Sleep) SHALL have a tooltip or info icon explaining what the signal measures
- **THEN** the explanation SHALL be in Spanish

#### Scenario: Recovery trend sparkline renders
- **WHEN** the recovery score has 7+ days of sparkline data
- **THEN** a 7-day sparkline SHALL render below the composite number
- **THEN** the sparkline SHALL show daily composite values in chronological order (oldest to newest, left to right)

### Requirement: Insights visual alignment with organic design system

All insights view sections SHALL use the organic design tokens consistently: `--moss`, `--ember`, `--bone`, `--lichen` palette. Chart.js charts SHALL use `chartColors` from CSS custom properties. Section headers SHALL use Fraunces font. Cards SHALL use `.card` base class with consistent padding and border-radius.

#### Scenario: Consistent organic styling
- **WHEN** the insights view renders
- **THEN** all Chart.js charts SHALL use colors derived from CSS custom properties via `getComputedStyle`
- **THEN** section headers SHALL use `var(--font-display)` (Fraunces)
- **THEN** card backgrounds SHALL use `var(--bg-card)` or `var(--bg-secondary)`
