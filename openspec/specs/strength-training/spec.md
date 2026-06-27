# Strength Training

## Purpose

Define training routines organized by day, log workout sessions with sets/reps/load, track progression over time, and associate with fat-loss phase.

## Requirements

### Requirement: Define training routines

The system SHALL allow users to create named training routines organized by day of the week, with each day containing a list of exercises. The routine management section SHALL be positioned near the frequency selector at the top of the training view. The system SHALL support full CRUD: create, edit name, delete, and add/remove exercises per routine day. `saveTrainingRoutine` SHALL support upsert — update if `id` is provided, insert otherwise.

#### Scenario: Create a routine
- **WHEN** a user creates a new routine named "Upper / Lower Split" and assigns exercises to Monday, Wednesday, and Friday
- **THEN** the system SHALL save the routine with the specified day-to-exercise mapping

#### Scenario: Edit a routine
- **WHEN** a user opens an existing routine, adds a new exercise day or modifies an existing one, and saves
- **THEN** the system SHALL update the routine with the changes

#### Scenario: Edit routine name
- **WHEN** the user clicks "Editar" on a routine in the list
- **THEN** the routine form SHALL pre-fill with the routine's current name
- **THEN** saving SHALL update the routine name via `db:saveTrainingRoutine` (upsert path)

#### Scenario: Delete routine
- **WHEN** the user clicks "Eliminar" on a routine
- **THEN** a confirmation dialog SHALL appear
- **THEN** confirming SHALL call `db:deleteTrainingRoutine(id)`
- **THEN** the routine SHALL be removed from the list

#### Scenario: Add exercises to routine day
- **WHEN** the user expands a routine to view its days
- **THEN** each day SHALL show its assigned exercises with an "Añadir ejercicio" button
- **WHEN** the user clicks "Añadir ejercicio"
- **THEN** an exercise selector SHALL appear filtered by the day's muscle group focus
- **THEN** selecting an exercise SHALL add it to the routine day

#### Scenario: Update existing routine (upsert)
- **WHEN** `db:saveTrainingRoutine({ id, name })` is called with an id
- **THEN** the handler SHALL UPDATE the existing row

#### Scenario: Routine section positioned near frequency
- **WHEN** the training view renders
- **THEN** the routine management section SHALL appear immediately after the workout plan frequency selector
- **THEN** the routine section SHALL NOT appear below the session logging or chart sections

### Requirement: Log workout sessions with sets, reps, and load

The system SHALL allow users to log individual workout sessions, recording each set's exercise name, load, reps, and set number. The session registration section SHALL be positioned above the progression charts, immediately after the routine section. The `db:saveTrainingSession` handler SHALL return the real session id. The system SHALL support upsert for both sessions and sets.

#### Scenario: Log a complete session
- **WHEN** a user starts a workout session for a routine day, completes 3 sets of bench press at 60 kg for 8 reps, and saves
- **THEN** the system SHALL record the session with 3 sets, each with the specified load, reps, and a timestamp

#### Scenario: Partial session with remaining sets
- **WHEN** a user logs 2 out of 3 planned sets and marks the session as complete
- **THEN** the system SHALL save the completed sets and note that 1 set was skipped

#### Scenario: Session registration positioned high
- **WHEN** the training view renders
- **THEN** the session registration section SHALL appear after the routine management section
- **THEN** it SHALL appear before the progression charts and strength maintenance sections

#### Scenario: Session created returns id
- **WHEN** a training session is saved via `db:saveTrainingSession({ date, routine_id, notes })`
- **THEN** the handler SHALL return `{ ok: true, id: <new_session_id> }`
- **THEN** the returned id SHALL match `lastInsertRowid` of the inserted row

#### Scenario: Sets linked to session id
- **WHEN** sets are saved via `db:saveTrainingSet({ session_id, ... })` using the id returned by `saveTrainingSession`
- **THEN** the set SHALL be inserted with a valid `session_id` foreign key
- **THEN** `getTrainingSets(sessionId)` SHALL return the linked sets

#### Scenario: Add a set to a session
- **WHEN** the user selects a session from the session list (or creates a new one)
- **THEN** a "Añadir serie" form SHALL appear with exercise select, load input, reps input, RPE input, and "Añadir" button
- **WHEN** the user fills the fields and clicks "Añadir"
- **THEN** the system SHALL call `db:saveTrainingSet` with the active session id
- **THEN** the set SHALL appear in the session's set list below

#### Scenario: Set list per session
- **WHEN** a session is selected from the session list
- **THEN** all sets linked to that session SHALL be displayed in a table: Ejercicio, Peso (kg), Reps, RPE
- **THEN** each set SHALL have a delete button to remove it

#### Scenario: Delete a set
- **WHEN** the user clicks delete on a set row
- **THEN** the system SHALL call `db:deleteTrainingSet(id)`
- **THEN** the set SHALL be removed from the list
- **THEN** the progression chart SHALL refresh

#### Scenario: Update existing session (upsert)
- **WHEN** `db:saveTrainingSession({ id, date, routine_id, notes })` is called with an id
- **THEN** the handler SHALL UPDATE the existing row, not INSERT a new one

#### Scenario: Update existing set (upsert)
- **WHEN** `db:saveTrainingSet({ id, session_id, exercise_id, load, reps, rpe })` is called with an id
- **THEN** the handler SHALL UPDATE the existing row

### Requirement: Track strength progression over time

The system SHALL display historical load, volume, and rep-max data per exercise across all logged sessions. Empty chart sections SHALL render placeholder content explaining what they will show when data becomes available, or SHALL be hidden if no data can ever populate them. The system SHALL also compute estimated 1RM per set using the Epley formula (`load × (1 + reps / 30)`) and display it alongside the existing progression view in the training view. The estimated 1RM and volume SHALL be surfaced in the new strength training insights section within the insights view.

#### Scenario: View exercise progression chart
- **WHEN** a user selects an exercise (e.g., bench press) in the progression view
- **THEN** the system SHALL display a chart of estimated 1RM or top set load over time with session dates on the x-axis

#### Scenario: Compare last session to previous
- **WHEN** a user views a completed session
- **THEN** the system SHALL show delta indicators (▲/▼) next to each exercise comparing load and volume to the most recent previous session for that exercise

#### Scenario: Placeholder states for empty charts
- **WHEN** no training session data exists
- **THEN** the progression chart section SHALL display a placeholder with text "Registra sesiones para ver tu progresión"
- **THEN** the strength maintenance section SHALL display "Registra al menos 2 semanas de entrenamiento para ver el estado de mantenimiento"

#### Scenario: Empty charts hidden when permanently empty
- **WHEN** a chart section has no applicable data source (not just missing data)
- **THEN** the section SHALL be hidden rather than showing a perpetual empty state

#### Scenario: Estimated 1RM shown in training view set list
- **WHEN** a user views the sets of a training session
- **THEN** each set row SHALL display the estimated 1RM (Epley) in a dedicated column after RPE
- **THEN** the 1RM column header SHALL read "1RM est."

### Requirement: Auto-associate training with fat-loss objective

The system SHALL display a strength training summary alongside the user's current calorie target and weight trend, indicating whether strength is being maintained during the fat-loss phase.

#### Scenario: Strength maintenance indicator
- **WHEN** a user is in an active fat-loss phase and has logged training sessions in the last 14 days
- **THEN** the system SHALL display a strength maintenance status (on track / slight decline / decline) based on volume trend

### Requirement: Flexible frequency workout plans

The system SHALL provide workout plans with user-selectable frequency of 2–6 sessions per week, with auto-generated splits organized by muscle group focus.

#### Scenario: Select frequency and view split
- **WHEN** a user selects 4 sessions per week
- **THEN** the system SHALL display the split "Superior / Inferior / Superior / Inferior" with day cards

#### Scenario: Start workout from plan
- **WHEN** a user selects a plan day and clicks "Comenzar sesión"
- **THEN** the system SHALL pre-fill the session logging view with the day's exercises from that plan

### Requirement: Muscle group focused day structure

Each workout plan day SHALL specify a primary muscle group focus and list exercises with equipment recommendations and practical examples.

#### Scenario: Day focus with examples
- **WHEN** a user views a plan day
- **THEN** the system SHALL show the muscle group focus, prescribed exercises with equipment, and a practical example note per exercise

### Requirement: Complement exercises per day

The system SHALL allow users to add extra exercises to any plan day beyond the prescribed set.

#### Scenario: Add complementary exercise
- **WHEN** a user is viewing a plan day
- **THEN** the system SHALL allow selecting additional exercises from the library filtered by the day's focus area

### Requirement: Spanish exercise names and muscle groups

The system SHALL store and display all exercise names and muscle group labels in Spanish. The exercise library SHALL be migrated from English to Spanish names. Exercises requiring equipment not commonly available in a home gym SHALL be removed. The seed data SHALL be updated to seed exercises with Spanish names and muscle groups, removing English entries.

#### Scenario: Exercise library in Spanish
- **WHEN** the training view renders the exercise library or session logging
- **THEN** all exercise names SHALL be in Spanish (e.g., "Press de banca" not "Bench Press", "Sentadilla" not "Squat")
- **THEN** all muscle group labels SHALL be in Spanish (e.g., "Pecho" not "Chest")
- **THEN** exercises requiring cable machines, Smith machine, leg press machine, or other commercial gym equipment SHALL be excluded
- **THEN** exercises executable with barbell, dumbbell, bodyweight, or resistance bands SHALL remain

#### Scenario: Migration preserves custom data
- **WHEN** the migration updates English exercise names to Spanish
- **THEN** exercise `id` and `practical_examples` columns SHALL be preserved
- **THEN** only `name` and `muscle_group` columns SHALL be updated for matching entries
- **THEN** any exercise not matching the English-to-Spanish mapping SHALL be flagged for manual review

#### Scenario: Seed data seeded in Spanish
- **WHEN** the app initializes with an empty `exercise_library` table
- **THEN** the system SHALL seed ~50 exercises with Spanish names and muscle groups
- **THEN** seeded muscle groups SHALL include: Pecho, Espalda, Pierna, Hombro, Bíceps, Tríceps, Abdominal, Glúteo, Full Body
- **THEN** no English exercise names SHALL be present in the library

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

### Requirement: Active plan buttons functional

The system SHALL ensure that "Usar plan del día" and "Añadir Ejercicio" buttons on plan-day cards are functional when an active plan is loaded on view init, not just when generated via the button.

#### Scenario: Buttons work on init load
- **WHEN** the training view loads with an active plan
- **THEN** `data-use-plan-day` buttons SHALL have click listeners attached
- **THEN** clicking "Usar" SHALL pre-fill the session logging form with that day's exercises
- **THEN** `data-add-exercise-to-day` buttons SHALL have click listeners attached
- **THEN** clicking "Añadir Ejercicio" SHALL open the exercise selector filtered by the day's focus

#### Scenario: Use plan day pre-fills session
- **WHEN** the user clicks "Usar" on a plan day
- **THEN** the session form SHALL be populated with the day's exercises as pre-loaded set rows
- **THEN** each set row SHALL default to the exercise's prescribed equipment and empty load/reps
- **THEN** the user SHALL fill in load and reps and save
