# Insights View

## Purpose

Provide a dedicated insights view accessible from the sidebar with 7 distinct sections in a vertical scroll layout: year-in-motion heatmap, day-of-week histogram, sport distribution donut, recovery score composite, weight velocity chart, waist-to-hip ratio card, and auto-insight cards.

## Requirements

### Requirement: Dedicated insights view accessible from sidebar

The system SHALL provide a dedicated `insights` view accessible from the sidebar navigation, positioned in the INICIO section between `dashboard` (Panel) and `analytics` (Tendencias). The view SHALL display 7 distinct sections in a vertical scroll layout: (1) year-in-motion heatmap, (2) day-of-week histogram, (3) sport distribution donut, (4) recovery score composite, (5) weight velocity chart, (6) waist-to-hip ratio card, (7) auto-insight cards. The view SHALL have a date-range selector (90d / 6m / 1y) that gates the time-dependent sections (heatmap, histograms, sport distribution, velocity) but is ignored by the point-in-time sections (recovery, WHR).

#### Scenario: Insights view accessible from sidebar
- **WHEN** the user clicks the "Patrones" nav item in the sidebar
- **THEN** the insights view SHALL activate and render
- **THEN** the `insights` nav item SHALL be marked with `aria-current="page"`
- **THEN** the INICIO section SHALL remain expanded

#### Scenario: View title and date-range selector
- **WHEN** the insights view loads
- **THEN** a view title "Patrones" SHALL appear at the top (Fraunces 28px italic, var(--ink))
- **THEN** a date-range selector with 3 buttons (90d / 6m / 1y) SHALL appear below the title
- **THEN** the default selection SHALL be 90d
- **THEN** clicking a button SHALL make it active and re-render the time-dependent sections

#### Scenario: 7 sections render in order
- **WHEN** the insights view loads with data
- **THEN** the 7 sections SHALL render in this order: heatmap, day-of-week, sport distribution, recovery, weight velocity, WHR, auto-insights
- **THEN** each section SHALL be a separate `<section>` with a heading and a card body
- **THEN** the view SHALL scroll vertically as a single page

#### Scenario: Concurrent IPC loading
- **WHEN** the insights view mounts
- **THEN** the system SHALL issue 7 IPC calls concurrently via `Promise.allSettled`
- **THEN** each section SHALL display a skeleton loading state during its own IPC
- **THEN** sections SHALL stream in as their IPC calls resolve

#### Scenario: No data state
- **WHEN** the user has no data in any table
- **THEN** all 7 sections SHALL render their empty states
- **THEN** a global banner SHALL appear at the top: "Importa datos de Apple Health o registra actividades para desbloquear los patrones"

### Requirement: View-localized empty states per section

The system SHALL render section-specific empty states when the underlying data is missing, with a CTA that links to the relevant view (activity, measurements, sleep, profile). Each empty state SHALL use `renderStateCard(container, { state: 'empty', title, description, actionLabel, actionHandler })` and SHALL NOT block the rendering of other sections.

#### Scenario: Heatmap empty
- **WHEN** the user has zero `sport_activities` rows
- **THEN** the heatmap section SHALL show: "Importa datos de actividad para ver tu año en movimiento" with a "Ir a Actividad" button

#### Scenario: Day-of-week empty
- **WHEN** the user has < 2 weeks of activity
- **THEN** the day-of-week section SHALL show: "Necesitas al menos 2 semanas de datos para identificar tu día favorito"

#### Scenario: Sport distribution empty
- **WHEN** the user has zero `sport_activities` in the trailing 90 days
- **THEN** the sport distribution section SHALL show: "No hay actividades en los últimos 90 días"

#### Scenario: Recovery score empty
- **WHEN** the user has < 30 days of HRV, RHR, and sleep data
- **THEN** the recovery section SHALL show: "Necesitas al menos 30 días de datos de HRV, RHR y sueño para calcular tu línea base personal"
- **THEN** a progress indicator SHALL appear: "Faltan N días para tu primera puntuación"

#### Scenario: Weight velocity empty
- **WHEN** the user has < 2 weight entries
- **THEN** the weight velocity section SHALL show: "Registra tu peso regularmente para ver tu velocidad de cambio"

#### Scenario: WHR empty
- **WHEN** the user has no measurement_sets with both waist and hips
- **THEN** the WHR section SHALL show: "Registra medidas corporales (cintura y cadera) para ver tu WHR"
- **THEN** a "Ir a Mediciones" button SHALL navigate to the measurements view

#### Scenario: Auto-insights empty
- **WHEN** `generateAutoInsights()` returns an empty array
- **THEN** the auto-insights section SHALL show: "Sin insights esta semana — sigue registrando actividades para descubrirlos"

### Requirement: Error handling per section

The system SHALL use `safeCall()` from `src/renderer/utils/safe-call.js` for all 7 IPC calls. If a call fails, the corresponding section SHALL render the error state via `renderStateCard(container, { state: 'error', onRetry })`. A single section failure SHALL NOT prevent the other 6 sections from rendering.

#### Scenario: Single section error
- **WHEN** `db:getRecoveryScore` throws an error
- **THEN** the recovery section SHALL display the error state with a "Reintentar" button
- **THEN** the other 6 sections SHALL render with their data
- **THEN** the rest of the view (loading state) SHALL continue normally

#### Scenario: Error retry
- **WHEN** the user clicks the "Reintentar" button on an error state
- **THEN** the section SHALL re-issue its IPC call
- **THEN** the section SHALL display the loading skeleton during the retry

### Requirement: Data change event triggers re-render

The system SHALL subscribe to `electronAPI.onDataChanged()` in `views/insights.js`. When the event fires, the view SHALL re-issue all 7 IPC calls and re-render the affected sections.

#### Scenario: Activity added
- **WHEN** the user adds a new `sport_activities` row from the activity view
- **THEN** the `data-changed` event SHALL fire
- **THEN** the insights view SHALL re-fetch the heatmap, day-of-week, sport distribution, and auto-insights data
- **THEN** the recovery score, WHR, and weight velocity sections SHALL NOT re-fetch (no new data affects them in real-time)

#### Scenario: Weight added
- **WHEN** the user adds a new `weight_entries` row
- **THEN** the weight velocity section SHALL re-fetch
- **THEN** the auto-insights section SHALL re-fetch (weight direction match insight depends on velocity)

### Requirement: Point-in-time sections display their fixed time window explicitly

The system SHALL render a visible time-window label on each point-in-time section (recovery score, WHR) that clarifies the section does NOT respond to the date-range selector at the top of the view. The label SHALL appear in muted typography (Source Sans 3 italic, var(--lichen), 11px) directly above or below the section title. The label text SHALL be sourced from `strings.insights.fixedWindowLabels.{recovery, whr}` and SHALL read: "Basado en los últimos 7 días" for the recovery section, and "Última medición" for the WHR section.

#### Scenario: Recovery section shows fixed-window label
- **WHEN** the user selects "1y" from the date-range selector
- **THEN** the heatmap, day-of-week, sport distribution, and weight velocity sections SHALL respond (re-render with the new range)
- **THEN** the recovery section SHALL NOT change its data
- **THEN** the recovery section SHALL display the label "Basado en los últimos 7 días" in muted italic text

#### Scenario: WHR section shows fixed-window label
- **WHEN** the user views the insights page
- **THEN** the WHR section SHALL display the label "Última medición" in muted italic text
- **THEN** the label SHALL clarify that the WHR reflects the most recent `measurement_sets` row, not a windowed aggregation

#### Scenario: Time-dependent sections do not show fixed-window label
- **WHEN** the user views the heatmap, day-of-week, sport distribution, or weight velocity sections
- **THEN** those sections SHALL NOT show a fixed-window label (they have their own "Últimos 90 días / 6 meses / 1 año" label per the date-range selector)
