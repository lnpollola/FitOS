## MODIFIED Requirements

### Requirement: Dedicated insights view accessible from sidebar

The system SHALL provide a dedicated `insights` view accessible from the sidebar navigation, positioned in the INICIO section between `dashboard` (Panel) and `analytics` (Tendencias). The view SHALL display 8 distinct sections in a vertical scroll layout: (1) year-in-motion heatmap, (2) day-of-week histogram, (3) sport distribution donut, (4) recovery score composite, (5) strength training insights, (6) weight velocity chart, (7) waist-to-hip ratio card, (8) auto-insight cards. The view SHALL have a date-range selector (90d / 6m / 1y) that gates the time-dependent sections (heatmap, histograms, sport distribution, velocity) but is ignored by the point-in-time sections (recovery, WHR, strength training insights).

#### Scenario: 8 sections render in order
- **WHEN** the insights view loads with data
- **THEN** the 8 sections SHALL render in this order: heatmap, day-of-week, sport distribution, recovery, strength training insights, weight velocity, WHR, auto-insights
- **THEN** each section SHALL be a separate `<section>` with a heading and a card body
- **THEN** the view SHALL scroll vertically as a single page

#### Scenario: Strength training insights section renders
- **WHEN** the insights view loads
- **THEN** a new section titled "Entrenamiento de Fuerza" SHALL render between recovery and weight velocity
- **THEN** the section SHALL contain: personal records panel, plateau detector panel, strength score panel, and weekly tonnage chart panel

#### Scenario: Strength section concurrent loading
- **WHEN** the insights view mounts
- **THEN** the strength section SHALL issue 4 IPC calls concurrently (`db:getStrengthPersonalRecords`, `db:getStrengthPlateau`, `db:getStrengthScore`, `db:getWeeklyTonnage`) via `Promise.allSettled`
- **THEN** the total concurrent calls SHALL be 11 (7 original + 4 strength)

### Requirement: Concurrent IPC loading

The system SHALL issue IPC calls concurrently via `Promise.allSettled`. The total SHALL increase from 7 to 11 with the addition of the 4 strength training insight handlers.

#### Scenario: Strength training IPC calls
- **WHEN** the insights view mounts
- **THEN** the system SHALL issue `db:getStrengthPersonalRecords`, `db:getStrengthPlateau`, `db:getStrengthScore`, and `db:getWeeklyTonnage` concurrently alongside the existing 7 handlers
- **THEN** each strength panel SHALL display its own skeleton loading state during IPC calls

## ADDED Requirements

### Requirement: Strength training insights view-localized empty states

The system SHALL render section-specific empty states for each of the 4 strength panels when data is missing, with CTAs linking to the training view.

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
