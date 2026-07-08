# Insights View

## Purpose

Provide a dedicated insights view accessible from the sidebar with 5 distinct sections in a vertical scroll layout: heatmap with dynamic title, day-of-week pattern with enhanced KPIs, sport distribution donut with compact layout, recovery score composite with signal explanations, and strength training insights.

## Requirements

### Requirement: Dedicated insights view accessible from sidebar

The system SHALL provide a dedicated `insights` view accessible from the sidebar navigation, positioned in the INICIO section between `dashboard` (Panel) and `analytics` (Tendencias). The view SHALL display 5 distinct sections in a vertical scroll layout: (1) heatmap with dynamic title, (2) day-of-week pattern with enhanced KPIs, (3) sport distribution donut with compact layout, (4) recovery score composite with signal explanations, (5) strength training insights. The view SHALL have a period filter (90d / 6m / 1y) that gates the time-dependent sections (heatmap, day-of-week) but is ignored by the point-in-time sections (recovery, strength training insights).

#### Scenario: Insights view accessible from sidebar
- **WHEN** the user clicks the "Patrones" nav item in the sidebar
- **THEN** the insights view SHALL activate and render
- **THEN** the `insights` nav item SHALL be marked with `aria-current="page"`
- **THEN** the INICIO section SHALL remain expanded

#### Scenario: View title and period filter
- **WHEN** the insights view loads
- **THEN** a view title "Patrones" SHALL appear at the top (Fraunces 28px italic, var(--ink))
- **THEN** a period filter with 3 buttons (3m / 6m / 1y) SHALL appear below the title
- **THEN** the default selection SHALL be 3m
- **THEN** clicking a button SHALL make it active and re-render the time-dependent sections

#### Scenario: 5 sections render in order
- **WHEN** the insights view loads with data
- **THEN** the 5 sections SHALL render in this order: heatmap, day-of-week, sport distribution, recovery, strength
- **THEN** each section SHALL be a separate `<section>` with a heading and a card body
- **THEN** the view SHALL scroll vertically as a single page

#### Scenario: Strength training insights section renders
- **WHEN** the insights view loads
- **THEN** a section titled "Entrenamiento de Fuerza" SHALL render after recovery
- **THEN** the section SHALL contain: personal records panel, plateau detector panel, strength score panel, and weekly tonnage chart panel

#### Scenario: Concurrent IPC loading
- **WHEN** the insights view mounts
- **THEN** the system SHALL issue IPC calls concurrently via `Promise.allSettled`
- **THEN** each section SHALL display a skeleton loading state during its own IPC
- **THEN** sections SHALL stream in as their IPC calls resolve

#### Scenario: No data state
- **WHEN** the user has no data in any table
- **THEN** all sections SHALL render their empty states
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
- **WHEN** the user has < 30 days of HRV or RHR data
- **THEN** the recovery section SHALL show: "Necesitas al menos 30 días de datos de HRV y RHR para calcular tu línea base personal"
- **THEN** a progress indicator SHALL appear: "Faltan N días para tu primera puntuación"

#### Scenario: Personal records empty
- **WHEN** the user has no training sets with load and reps
- **THEN** the PR panel SHALL show: "Registra sesiones de entrenamiento para ver tus mejores marcas"

#### Scenario: Plateau detector empty
- **WHEN** no plateaus are detected
- **THEN** the plateau panel SHALL show: "Sin mesetas — buen progreso"

#### Scenario: Strength score empty
- **WHEN** the user has < 3 muscle groups with sufficient data
- **THEN** the score panel SHALL show: "Entrena al menos 3 grupos musculares para ver tu puntuación de fuerza"

#### Scenario: Weekly tonnage empty
- **WHEN** the user has < 4 weeks of training data
- **THEN** the tonnage panel SHALL show: "Necesitas al menos 4 semanas de entrenamiento para ver la tendencia de volumen"

### Requirement: Error handling per section

The system SHALL use `safeCall()` from `src/renderer/utils/safe-call.js` for all IPC calls. If a call fails, the corresponding section SHALL render the error state via `renderStateCard(container, { state: 'error', onRetry })`. A single section failure SHALL NOT prevent the other sections from rendering.

#### Scenario: Single section error
- **WHEN** `db:getRecoveryScore` throws an error
- **THEN** the recovery section SHALL display the error state with a "Reintentar" button
- **THEN** the other sections SHALL render with their data
- **THEN** the rest of the view (loading state) SHALL continue normally

#### Scenario: Error retry
- **WHEN** the user clicks the "Reintentar" button on an error state
- **THEN** the section SHALL re-issue its IPC call
- **THEN** the section SHALL display the loading skeleton during the retry

### Requirement: Data change event triggers re-render

The system SHALL subscribe to `electronAPI.onDataChanged()` in `views/insights.js`. When the event fires, the view SHALL re-issue IPC calls and re-render the affected sections.

#### Scenario: Activity added
- **WHEN** the user adds a new `sport_activities` row from the activity view
- **THEN** the `data-changed` event SHALL fire
- **THEN** the insights view SHALL re-fetch the heatmap, day-of-week, and sport distribution data
- **THEN** the recovery score section SHALL NOT re-fetch (no new data affects it in real-time)

### Requirement: Point-in-time sections display their fixed time window explicitly

The system SHALL render a visible time-window label on each point-in-time section (recovery score, strength training insights) that clarifies the section does NOT respond to the period filter at the top of the view. The label SHALL appear in muted typography (Source Sans 3 italic, var(--lichen), 11px) directly above or below the section title. The label text SHALL read: "Basado en los últimos 7 días" for the recovery section and "Todos los datos históricos" for the strength training insights section.

#### Scenario: Recovery section shows fixed-window label
- **WHEN** the user interacts with the period filter
- **THEN** the heatmap and day-of-week sections SHALL respond (re-render with the new range)
- **THEN** the recovery section SHALL NOT change its data
- **THEN** the recovery section SHALL display the label "Basado en los últimos 7 días" in muted italic text

#### Scenario: Strength training insights section shows fixed-window label
- **WHEN** the user views the insights page
- **THEN** the strength training insights section SHALL display the label "Todos los datos históricos" in muted italic text
- **THEN** the label SHALL clarify that strength panels always use all-time data regardless of the period filter

#### Scenario: Time-dependent sections do not show fixed-window label
- **WHEN** the user views the heatmap or day-of-week sections
- **THEN** those sections SHALL NOT show a fixed-window label (they have their own "Últimos 90 días / 6 meses / 1 año" label per the period filter)
