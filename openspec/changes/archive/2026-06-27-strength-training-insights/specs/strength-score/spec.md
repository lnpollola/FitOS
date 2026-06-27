# Strength Score

## Purpose

Compute a per-muscle-group strength score by aggregating estimated 1RM values across exercises, weighted by each exercise's bilateral factor, and surface a single composite strength score for an at-a-glance assessment of total strength.

## Requirements

### Requirement: Per-muscle-group strength score

The system SHALL compute a strength score for each muscle group by aggregating the best estimated 1RM of each exercise belonging to that group. The aggregation SHALL be the sum of estimated 1RMs weighted by a bilateral factor: bilateral exercises (both arms/legs simultaneously, e.g., barbell bench press, squat) SHALL contribute their full 1RM; unilateral exercises (e.g., dumbbell row, single-leg squat) SHALL contribute their 1RM × 2 (to normalize to both sides); bodyweight-only exercises SHALL contribute their 1RM converted to kg-equivalent using the user's body weight as a multiplier.

#### Scenario: Bilateral exercise contribution
- **WHEN** an exercise has `bilateral = 1` and its best estimated 1RM is 80 kg
- **THEN** the exercise SHALL contribute 80 kg to its muscle group score

#### Scenario: Unilateral exercise contribution
- **WHEN** an exercise has `unilateral = 1` and its best estimated 1RM is 40 kg
- **THEN** the exercise SHALL contribute 80 kg to its muscle group score (40 × 2)

#### Scenario: Both bilateral and unilateral false
- **WHEN** an exercise has `bilateral = 0` and `unilateral = 0` (bodyweight)
- **THEN** the exercise SHALL contribute `body_weight_kg × 1.0` to its muscle group score

### Requirement: Composite strength score

The system SHALL compute a single composite strength score as the sum of all per-muscle-group scores divided by the number of muscle groups with at least one scored exercise (average across trained muscle groups). If the user has fewer than 3 muscle groups with data, the composite score SHALL be `null` (insufficient data).

#### Scenario: Composite from multiple groups
- **WHEN** the user has scores: Pecho = 120, Espalda = 140, Pierna = 200, Hombro = 90
- **THEN** the composite strength score SHALL be `(120 + 140 + 200 + 90) / 4 = 137.5`
- **THEN** the score SHALL be rounded to the nearest integer (138)

#### Scenario: Insufficient data for composite
- **WHEN** the user has logged exercises in only 2 muscle groups
- **THEN** the composite strength score SHALL be `null`
- **THEN** the response SHALL indicate `insufficient_muscle_groups: true`

### Requirement: Deliverable strength score object

The IPC handler `db:getStrengthScore` SHALL return an object with: `muscle_groups` (array of { muscle_group, score, exercise_count, top_exercise }), `composite_score` (number or null), `body_weight_kg` (number or null), `insufficient_muscle_groups` (boolean), and `total_muscle_groups` (number).

#### Scenario: Complete response shape
- **WHEN** `db:getStrengthScore` is called with sufficient data
- **THEN** the response SHALL contain `muscle_groups` with entries sorted descending by score
- **THEN** the response SHALL contain `composite_score` as an integer
- **THEN** each muscle group entry SHALL include which exercise contributed the most

### Requirement: Strength score card rendering

The system SHALL render a card with a ring chart showing the composite score in the center (0–300 scale), a list of muscle group bars with scores, and the top exercise per group. The score ring SHALL use the `growthRing` utility from `src/renderer/utils/sparkline.js` adapted for the 0–300 range.

#### Scenario: Score card renders with data
- **WHEN** the strength score card has data
- **THEN** the composite score SHALL appear in the center of the ring
- **THEN** each muscle group SHALL appear as a horizontal bar with its score
- **THEN** the top exercise per group SHALL appear to the right of the bar

#### Scenario: Score card empty state
- **WHEN** the user has no training sets with load and reps
- **THEN** the score card SHALL display "Registra sesiones con peso para ver tu puntuación de fuerza"
