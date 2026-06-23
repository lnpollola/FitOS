# Strength Training — Delta

## MODIFIED Requirements

### Requirement: Define training routines

The system SHALL allow users to create named training routines organized by day of the week, with each day containing a list of exercises. The routine management section SHALL be positioned near the frequency selector at the top of the training view.

#### Scenario: Routine section positioned near frequency
- **WHEN** the training view renders
- **THEN** the routine management section SHALL appear immediately after the workout plan frequency selector
- **THEN** the routine section SHALL NOT appear below the session logging or chart sections

### Requirement: Log workout sessions with sets, reps, and load

The system SHALL allow users to log individual workout sessions, recording each set's exercise name, load, reps, and set number. The session registration section SHALL be positioned above the progression charts, immediately after the routine section.

#### Scenario: Session registration positioned high
- **WHEN** the training view renders
- **THEN** the session registration section SHALL appear after the routine management section
- **THEN** it SHALL appear before the progression charts and strength maintenance sections

### Requirement: Track strength progression over time

The system SHALL display historical load, volume, and rep-max data per exercise across all logged sessions. Empty chart sections (approval delta, maintenance) SHALL render placeholder content explaining what they will show when data becomes available, or SHALL be hidden if no data can ever populate them.

#### Scenario: Placeholder states for empty charts
- **WHEN** no training session data exists
- **THEN** the progression chart section SHALL display a placeholder with text "Registra sesiones para ver tu progresión"
- **THEN** the strength maintenance section SHALL display "Registra al menos 2 semanas de entrenamiento para ver el estado de mantenimiento"

#### Scenario: Empty charts hidden when permanently empty
- **WHEN** a chart section has no applicable data source (not just missing data)
- **THEN** the section SHALL be hidden rather than showing a perpetual empty state

## ADDED Requirements

### Requirement: Spanish exercise names and muscle groups

The system SHALL store and display all exercise names and muscle group labels in Spanish. The exercise library SHALL be migrated from English to Spanish names. Exercises requiring gym-only equipment SHALL be excluded.

#### Scenario: Exercise library in Spanish
- **WHEN** the training view renders the exercise library or session logging
- **THEN** all exercise names SHALL be in Spanish
- **THEN** all muscle group labels SHALL be in Spanish
- **THEN** exercises like "Press de banca", "Sentadilla", "Peso muerto", "Dominadas", "Curl de bíceps" SHALL be present
- **THEN** exercises requiring cable machines, Smith machine, or leg press SHALL be absent

#### Scenario: Spanish muscle groups in seed data
- **WHEN** the app initializes with an empty exercise library
- **THEN** seeded muscle groups SHALL include: Pecho, Espalda, Pierna, Hombro, Bíceps, Tríceps, Abdominal, Glúteo, Full Body

### Requirement: Training view layout reorganization

The system SHALL organize the training view in this vertical order: (1) workout plan frequency selector, (2) routine management, (3) session registration, (4) progression charts, (5) strength maintenance indicators.

#### Scenario: Training view sections in correct order
- **WHEN** the training view renders
- **THEN** sections SHALL appear in order: Frecuencia → Rutina → Registrar Sesión → Progresión → Mantenimiento
- **THEN** no section SHALL appear out of this order

### Requirement: Translate muscle_group, equipment, and movement_pattern to Spanish

The system SHALL translate not only exercise names but also `muscle_group`, `equipment`, and `movement_pattern` fields in the exercise library to Spanish. These fields are displayed in the exercise table, plan-day cards, and filter dropdowns.

#### Scenario: All exercise fields in Spanish
- **WHEN** the exercise library or plan-day cards render
- **THEN** muscle_group SHALL be in Spanish (Pecho, Espalda, Pierna, Hombro, Bíceps, Tríceps, Abdominal, Glúteo)
- **THEN** equipment SHALL be in Spanish (Barra, Mancuernas, Peso Corporal, Bandas Elásticas)
- **THEN** movement_pattern SHALL be in Spanish (Empuje Horizontal, Empuje Vertical, Tirón Horizontal, Tirón Vertical, Sentadilla, Peso Muerto, Unilateral)

### Requirement: Replace emoji MUSCLE_ICONS with Lucide icons

The system SHALL replace the emoji-based `MUSCLE_ICONS` map with Lucide SVG icons from the `utils/icons.js` utility. No emoji characters SHALL be used for muscle group icons. The icons SHALL be semantically appropriate (not arbitrary emoji).

#### Scenario: Lucide icons for muscle groups
- **WHEN** the training view renders muscle group icons
- **THEN** all icons SHALL be Lucide SVGs via `icon(name, size)`
- **THEN** no emoji characters SHALL appear in muscle group labels or icons
- **THEN** abdominal SHALL NOT use a brain emoji; dorsal SHALL NOT use an eagle emoji

### Requirement: loadStrengthStatus refreshes after session create

The system SHALL call `loadStrengthStatus()` after every session creation (both manual log and "use plan day"), not only after session deletion. This ensures the strength maintenance card is always current.

#### Scenario: Strength status refreshes on create
- **WHEN** the user creates a new session (manual or via plan day)
- **THEN** `loadStrengthStatus()` SHALL be called after the session is saved
- **THEN** the strength maintenance card SHALL reflect the new session

### Requirement: Fix confusing "Frecuencia" button label

The system SHALL use a descriptive label for the "Generar/Ver Planes" button (currently labeled "Frecuencia" which is confusing for a button). The button SHALL use `strings.training.generatePlans` or similar, and the section heading SHALL use "Planes de Entrenamiento" instead of "Frecuencia".

#### Scenario: Button label descriptive
- **WHEN** the training view renders
- **THEN** the generate-plan button SHALL be labeled "Ver Planes" or "Generar Plan", not "Frecuencia"
- **THEN** the section heading SHALL be "Planes de Entrenamiento" or "Frecuencia" as a heading only, not a button label
