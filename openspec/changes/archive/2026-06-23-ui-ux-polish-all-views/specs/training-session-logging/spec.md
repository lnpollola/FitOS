# Training Session Logging

## ADDED Requirements

### Requirement: saveTrainingSession returns the real session id

The system SHALL update the `db:saveTrainingSession` IPC handler to return the `lastInsertRowid` (the new session's numeric id), not `true`. Sets linked to a session SHALL use this id as `session_id` foreign key.

#### Scenario: Session created returns id
- **WHEN** a training session is saved via `db:saveTrainingSession({ date, routine_id, notes })`
- **THEN** the handler SHALL return `{ ok: true, id: <new_session_id> }`
- **THEN** the returned id SHALL match `lastInsertRowid` of the inserted row

#### Scenario: Sets linked to session id
- **WHEN** sets are saved via `db:saveTrainingSet({ session_id, ... })` using the id returned by `saveTrainingSession`
- **THEN** the set SHALL be inserted with a valid `session_id` foreign key
- **THEN** `getTrainingSets(sessionId)` SHALL return the linked sets

### Requirement: UI to record sets within a session

The system SHALL provide a UI within the session logging section to add sets to a session. Each set row SHALL include exercise (select from library), load (kg), reps, and optional RPE (1-10). Sets SHALL be saved immediately on add and listed below the session form.

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

### Requirement: Routine management UI

The system SHALL provide full CRUD for training routines: create, edit name, delete, and add/remove exercises per routine day. The routine list SHALL render edit and delete buttons alongside each routine.

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

### Requirement: saveTrainingSession and saveTrainingSet upsert paths

The system SHALL support upsert for both sessions and sets. `saveTrainingSession` SHALL update if an `id` is provided, insert otherwise. `saveTrainingSet` SHALL update if an `id` is provided, insert otherwise. `saveTrainingRoutine` SHALL update if an `id` is provided.

#### Scenario: Update existing session
- **WHEN** `db:saveTrainingSession({ id, date, routine_id, notes })` is called with an id
- **THEN** the handler SHALL UPDATE the existing row, not INSERT a new one

#### Scenario: Update existing routine
- **WHEN** `db:saveTrainingRoutine({ id, name })` is called with an id
- **THEN** the handler SHALL UPDATE the existing row
