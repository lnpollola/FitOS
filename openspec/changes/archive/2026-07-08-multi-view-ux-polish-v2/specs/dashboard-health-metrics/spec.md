## MODIFIED Requirements

### Requirement: Dashboard health metrics card layout

The dashboard SHALL display health metric cards organized in a logical top-to-bottom flow: Strava-style summary panels at the top, auto-insights section, goals summary, hero card (full-width balance with growth ring and energy breakdown), two symmetric rows of health KPI cards (5 + 3, since "Calorías Hoy" is removed) with inline sparklines and period comparisons, and a sports section at the bottom. The sports section SHALL include the activity summary accent card and per-sport-type breakdown cards. The combined streak+calendar card SHALL appear after the sports section.

#### Scenario: Hero card renders first after goals
- **WHEN** the dashboard renders
- **THEN** the Strava panels block SHALL appear at the top
- **THEN** the auto-insights section SHALL appear below Strava panels
- **THEN** the goals summary SHALL appear below auto-insights
- **THEN** the hero card with balance semanal, growth ring, energy breakdown, and last weight SHALL appear below goals
- **THEN** no sports or activity content SHALL appear above the hero card

#### Scenario: Health KPIs in two rows without Calorías Hoy
- **WHEN** the dashboard renders
- **THEN** row 1 SHALL contain 5 cards: Sueño, HRV, RHR, Peso, Pasos
- **THEN** row 2 SHALL contain 3 cards: Ejercicio, Caminata, Ciclismo
- **THEN** each card SHALL include an inline sparkline (60×20 px) next to the label and period comparisons below the value

#### Scenario: No trend chart row
- **WHEN** the dashboard renders
- **THEN** no Chart.js trend charts SHALL appear between the KPI rows and the sports section

#### Scenario: Sports section followed by combined streak+calendar
- **WHEN** the dashboard renders
- **THEN** the sports section SHALL appear after the KPI rows
- **THEN** the combined streak+calendar card SHALL appear after the sports section

### Requirement: HRV + resting HR composite card

The system SHALL display separate cards for HRV (SDNN ms) and resting heart rate (bpm). Each card SHALL include an info icon (Lucide `info`) that, on hover or click, displays a tooltip explaining what the metric means. HRV tooltip: "Variabilidad del ritmo cardíaco. Indica la recuperación de tu sistema nervioso. Valores más altos = mejor recuperación." RHR tooltip: "Frecuencia cardíaca en reposo. Indica tu nivel de fatiga general. Valores más bajos = mejor condición."

#### Scenario: HRV card with info tooltip
- **WHEN** the HRV card renders
- **THEN** an info icon SHALL appear next to the label
- **WHEN** the user hovers over or clicks the info icon
- **THEN** a tooltip SHALL display the HRV explanation in Spanish

#### Scenario: RHR card with info tooltip
- **WHEN** the RHR card renders
- **THEN** an info icon SHALL appear next to the label
- **WHEN** the user hovers over or clicks the info icon
- **THEN** a tooltip SHALL display the RHR explanation in Spanish

### Requirement: Dashboard goals summary card refreshes on data change

The dashboard SHALL re-render the goals summary card when a `data-changed` event is received. The `onDataChanged` callback SHALL trigger a full re-render of the dashboard (including goals, KPIs, hero, sports, and Strava panels), not just the Strava panels.

#### Scenario: Goals update after data change
- **WHEN** the user creates or modifies a goal in the goals view
- **WHEN** the `data-changed` event fires
- **THEN** the dashboard goals summary card SHALL reflect the updated goals
- **THEN** all other dashboard sections SHALL also refresh

## ADDED Requirements

### Requirement: Last weight in hero card

The hero card SHALL display the most recent weight entry as a compact sub-element. See `dashboard-kpi-redesign` spec for details.
