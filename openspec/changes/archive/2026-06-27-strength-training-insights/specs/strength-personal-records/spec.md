# Strength Personal Records

## Purpose

Compute, rank, and surface personal records (PRs) for strength training: estimated 1RM per exercise via the Epley formula, best-ever 1RM per exercise with rank, and volume PR per session.

## Requirements

### Requirement: Estimate 1RM per set using Epley formula

The system SHALL compute an estimated 1RM for each `training_sets` row where both `load_kg` and `reps` are non-null and `reps >= 1`. The formula SHALL be: `estimated_1rm = load_kg × (1 + reps / 30)`. For sets with `reps = 1`, the estimated 1RM SHALL equal `load_kg` (the actual single-rep max). Results SHALL be rounded to 1 decimal place.

#### Scenario: Epley formula for multi-rep set
- **WHEN** a set has `load_kg = 60` and `reps = 8`
- **THEN** the estimated 1RM SHALL be `60 × (1 + 8/30) = 60 × 1.267 = 76.0`
- **THEN** the result SHALL be returned as `76.0`

#### Scenario: Single-rep set equals load
- **WHEN** a set has `load_kg = 80` and `reps = 1`
- **THEN** the estimated 1RM SHALL be `80.0`

#### Scenario: Null values skipped
- **WHEN** a set has `load_kg = null` or `reps = null`
- **THEN** the system SHALL NOT compute an estimated 1RM for that set
- **THEN** the set SHALL be excluded from all PR computations

### Requirement: Best 1RM PR per exercise

The system SHALL track the all-time best (maximum) estimated 1RM for each `exercise_id` across all logged sessions. For each exercise, the system SHALL return: the best estimated 1RM value, the date it was achieved, the session ID, and what rank it holds (1 = all-time best, 2 = second best, 3 = third best). Only the top 3 per exercise SHALL be ranked; older PRs SHALL have `rank = null`.

#### Scenario: Best 1RM detected
- **WHEN** the user has 4 bench press sessions over 3 months with est. 1RMs of 70, 75, 80, and 78
- **THEN** the best 1RM PR for bench press SHALL be `80.0` with rank 1
- **THEN** the PR date SHALL correspond to the session where 80 was achieved

#### Scenario: PR ranking across time
- **WHEN** the user's bench press est. 1RMs are [65, 72, 68, 80, 78, 75] in chronological order
- **THEN** rank 1 SHALL be `80.0`
- **THEN** rank 2 SHALL be `78.0`
- **THEN** rank 3 SHALL be `75.0`

#### Scenario: Exercise with only one set
- **WHEN** the user has logged exactly one set for an exercise
- **THEN** that set SHALL be the best 1RM PR with rank 1
- **THEN** `total_sets` SHALL equal 1

### Requirement: Volume PR per session

The system SHALL compute the total tonnage (volume) per session as `Σ (load_kg × reps)` across all sets in that session. The highest-volume session of all time SHALL be returned as the volume PR, with its date, total tonnage, total number of sets, and number of exercises.

#### Scenario: Highest-volume session detected
- **WHEN** the user has sessions with volumes 2500 kg, 3100 kg, and 2800 kg
- **THEN** the volume PR SHALL be `3100 kg` with the corresponding date
- **THEN** the response SHALL include the session's set count and exercise count

#### Scenario: Top 3 volume PRs
- **WHEN** the user has 5+ sessions with varying volumes
- **THEN** the response SHALL contain the top 3 highest-volume sessions with rank (1/2/3)
- **THEN** sessions with lower volume SHALL NOT be included

### Requirement: PR by exercise selector

The system SHALL allow the user to filter personal records by muscle group via a dropdown. When a muscle group is selected, only exercises matching that muscle group SHALL appear in the PR list. The dropdown SHALL be populated from `DISTINCT muscle_group` in `exercise_library`.

#### Scenario: Filter PRs by muscle group
- **WHEN** the user selects "Pecho" from the muscle group filter
- **THEN** only exercises with `muscle_group = 'Pecho'` SHALL appear in the PR list
- **THEN** exercises from other muscle groups SHALL be hidden
