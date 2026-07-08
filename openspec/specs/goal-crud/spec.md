# Goal CRUD

## Purpose

Provide create, read, update, archive, and delete operations for user-defined goals. Goals are stored as a JSON array in the `settings` table under the key `goals`, avoiding schema changes while supporting all CRUD operations via atomic read-modify-write transactions.

## Requirements

### Requirement: Goal data model

The system SHALL store goals as a JSON array in the `settings` table under the key `goals`. Each goal SHALL be an object with the following fields:
- `id` (string): UUID v4, auto-generated on creation
- `type` (string): one of `weight`, `distance`, `frequency`, `custom`
- `label` (string): user-defined name (e.g., "Bajar a 75 kg", "Correr 100 km en julio")
- `target` (number): target value to reach
- `current` (number): current value (auto-computed for most types, user-set for `custom`)
- `unit` (string): unit label (e.g., "kg", "km", "sesiones/sem")
- `startDate` (string): ISO date when goal tracking began
- `targetDate` (string): ISO date when goal should be achieved
- `archived` (boolean): whether the goal is archived (hidden from active list)
- `archivedAt` (string|null): ISO date of archiving, null if not archived
- `createdAt` (string): ISO date of creation
- `updatedAt` (string): ISO date of last update

#### Scenario: Complete goal object
- **WHEN** a new goal is created
- **THEN** the goal SHALL contain all required fields
- **THEN** `id` SHALL be a UUID v4 string
- **THEN** `archived` SHALL default to false
- **THEN** `archivedAt` SHALL default to null
- **THEN** `createdAt` and `updatedAt` SHALL be set to the current ISO date

### Requirement: IPC `db:getGoals`

The system SHALL provide an IPC handler `db:getGoals` that returns the full goals array from the `settings` table key `goals`. If no goals exist, it SHALL return an empty array.

#### Scenario: Get goals returns array
- **WHEN** `db:getGoals` is called
- **THEN** the handler SHALL return an array of goal objects
- **THEN** if no rows exist for key `goals`, the handler SHALL return `[]`

#### Scenario: Get goals with archived
- **WHEN** the goals array contains both active and archived goals
- **THEN** the handler SHALL return all goals including archived (filtering is client-side)

### Requirement: IPC `db:saveGoal`

The system SHALL provide an IPC handler `db:saveGoal(goal)` that atomically reads the goals array, either adds the goal (if `id` is new) or replaces the matching goal (if `id` exists), sets `updatedAt` to the current ISO date, and writes back to the `settings` table. The operation SHALL use `db.transaction()` for atomic read-modify-write.

#### Scenario: Create new goal
- **WHEN** `db:saveGoal` is called with a goal object whose `id` does not exist in the current goals array
- **THEN** the goal SHALL be appended to the array
- **THEN** `updatedAt` SHALL be set to the current ISO date
- **THEN** `createdAt` SHALL be preserved (set on creation)
- **THEN** the handler SHALL return `{ ok: true, goal }`

#### Scenario: Update existing goal
- **WHEN** `db:saveGoal` is called with a goal object whose `id` exists in the current goals array
- **THEN** the existing goal SHALL be replaced entirely by the new goal object
- **THEN** `updatedAt` SHALL be set to the current ISO date
- **THEN** `createdAt` SHALL be preserved from the original
- **THEN** the handler SHALL return `{ ok: true, goal }`

#### Scenario: Empty goals array
- **WHEN** `db:saveGoal` is called and no goals key exists in settings
- **THEN** the handler SHALL create a new array containing the goal
- **THEN** the handler SHALL return `{ ok: true, goal }`

### Requirement: IPC `db:deleteGoal`

The system SHALL provide an IPC handler `db:deleteGoal(id)` that atomically reads the goals array, finds the goal with matching `id`, removes it, and writes the updated array back to settings.

#### Scenario: Delete existing goal
- **WHEN** `db:deleteGoal` is called with an existing goal id
- **THEN** the goal SHALL be removed from the array
- **THEN** the handler SHALL return `{ ok: true }`

#### Scenario: Delete non-existent goal
- **WHEN** `db:deleteGoal` is called with a non-existent id
- **THEN** the handler SHALL return `{ ok: false, error: 'Goal not found' }`

### Requirement: IPC `db:archiveGoal`

The system SHALL provide an IPC handler `db:archiveGoal(id)` that atomically reads the goals array, finds the goal with matching `id`, sets `archived` to true and `archivedAt` to the current ISO date, and writes back.

#### Scenario: Archive existing goal
- **WHEN** `db:archiveGoal` is called with an existing goal id
- **THEN** the goal's `archived` field SHALL be true
- **THEN** `archivedAt` SHALL be set to the current ISO date
- **THEN** the handler SHALL return `{ ok: true }`

#### Scenario: Archive already archived goal
- **WHEN** `db:archiveGoal` is called with a goal that is already archived
- **THEN** the handler SHALL still succeed (idempotent)
- **THEN** the handler SHALL return `{ ok: true }`

### Requirement: Goal validation

The system SHALL validate goal objects before saving. Validation rules:
- `type` SHALL be one of `weight`, `distance`, `frequency`, `custom`
- `label` SHALL be a non-empty string of at most 100 characters
- `target` SHALL be a positive number
- `current` SHALL be a non-negative number
- `unit` SHALL be a non-empty string of at most 30 characters
- `startDate` SHALL be a valid ISO date string
- `targetDate` SHALL be a valid ISO date string

#### Scenario: Valid goal passes
- **WHEN** a goal passes all validation rules
- **THEN** `db:saveGoal` SHALL save the goal and return `{ ok: true, goal }`

#### Scenario: Invalid type rejected
- **WHEN** a goal has `type: 'invalid'`
- **THEN** `db:saveGoal` SHALL return `{ ok: false, error: 'Invalid goal type' }`

#### Scenario: Empty label rejected
- **WHEN** a goal has an empty label string
- **THEN** `db:saveGoal` SHALL return `{ ok: false, error: 'Label is required' }`

### Requirement: Goal progress calculation supports directional goals

The system SHALL calculate progress percentage based on the goal type and direction. For `weight` type goals, the system SHALL determine direction by comparing `startWeight` (first weight entry at or before `startDate`) against `target`:
- If `target < startWeight` (weight loss): `progress = (startWeight - current) / (startWeight - target) × 100`
- If `target > startWeight` (weight gain): `progress = (current - startWeight) / (target - startWeight) × 100`

For `distance` and `frequency` types, the existing accumulation formula SHALL remain: `progress = current / target × 100`.

Progress SHALL be clamped to `[0, 100]`. If no `startWeight` can be determined (no weight entries near startDate), the system SHALL return `progress_pct: 0` with a note "Sin datos de peso iniciales".

#### Scenario: Weight loss goal progress
- **WHEN** a weight loss goal has startWeight = 95 kg, target = 90 kg, current = 93 kg
- **THEN** progress SHALL be `(95 - 93) / (95 - 90) × 100 = 40%`

#### Scenario: Weight loss goal completed
- **WHEN** a weight loss goal has startWeight = 95 kg, target = 90 kg, current = 89 kg
- **THEN** progress SHALL be clamped to 100%

#### Scenario: Weight loss goal no progress
- **WHEN** a weight loss goal has startWeight = 95 kg, target = 90 kg, current = 95 kg
- **THEN** progress SHALL be 0%

#### Scenario: Weight gain goal progress
- **WHEN** a weight gain goal has startWeight = 60 kg, target = 65 kg, current = 62 kg
- **THEN** progress SHALL be `(62 - 60) / (65 - 60) × 100 = 40%`

#### Scenario: No starting weight available
- **WHEN** a weight goal has no weight entries at or before startDate
- **THEN** the system SHALL return `{ ok: true, current: 0, target: 90, progress_pct: 0 }`
- **THEN** the UI SHALL display "Sin datos de peso iniciales" as the progress subtitle

#### Scenario: Distance goal unchanged
- **WHEN** a distance goal has target = 100 km and current = 45 km
- **THEN** progress SHALL be `45 / 100 × 100 = 45%`

#### Scenario: Frequency goal unchanged
- **WHEN** a frequency goal has target = 4 sessions/week and current = 3
- **THEN** progress SHALL be `3 / 4 × 100 = 75%`
