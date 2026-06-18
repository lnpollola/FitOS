# Predefined Workout Plans

## Purpose

Add structured training plans with flexible frequency (2–6 sessions per week) organized by muscle group, with auto-generated splits based on the user's chosen frequency.

## Requirements

### Requirement: Flexible frequency plan selection

The system SHALL allow users to choose how many days per week they want to train (2–6), and auto-suggest an appropriate muscle group split for that frequency.

#### Scenario: User selects 4 days/week
- **WHEN** a user selects 4 sessions per week
- **THEN** the system SHALL suggest the split: Upper / Lower / Upper / Lower with focus areas for each day

#### Scenario: Split suggestion by frequency

The system SHALL suggest these default splits:

| Frequency | Split |
|---|---|
| 2x | Superior / Inferior |
| 3x | Empuje / Jalón / Piernas |
| 4x | Superior / Inferior / Superior / Inferior |
| 5x | Empuje / Jalón / Piernas / Superior / Inferior |
| 6x | Empuje / Jalón / Piernas / Superior / Inferior / Cuerpo Completo |

### Requirement: Workout plans database model

The system SHALL store workout plans in a `workout_plans` table, with each plan's days in `workout_plan_days` referencing exercises from the exercise library.

#### Scenario: Create a workout plan
- **WHEN** a user saves a new workout plan with a chosen frequency and customized day structure
- **THEN** the system SHALL create the plan record and day records, each with exercises assigned

### Requirement: Day structure with focus, equipment, and examples

Each workout plan day SHALL specify a primary muscle group focus, list prescribed exercises with equipment recommendations, and show practical examples.

#### Scenario: Day focus with machine recommendations
- **WHEN** a user views a plan day
- **THEN** the system SHALL show the muscle group focus (e.g., "Empuje — Pecho, Hombros, Tríceps") and each exercise with its equipment field and a practical example note

### Requirement: Complement exercises per day

The system SHALL allow users to add extra exercises to any plan day beyond the prescribed ones.

#### Scenario: Add exercise to day
- **WHEN** a user clicks "Agregar ejercicio" on a plan day
- **THEN** the system SHALL show the exercise library filtered by the day's muscle group focus, and add the selected exercise to that day

### Requirement: Select and start a workout plan

The system SHALL allow users to browse plans, adjust frequency, see the day-by-day breakdown, and activate one.

#### Scenario: Plan selection card
- **WHEN** a user opens the training view
- **THEN** the system SHALL display a frequency selector (2–6 días) and show the resulting split with day cards

#### Scenario: Activate a plan
- **WHEN** a user clicks "Usar este plan" on a plan card
- **THEN** the system SHALL set that plan as the active routine and pre-fill the session logging flow with the plan's day structure
