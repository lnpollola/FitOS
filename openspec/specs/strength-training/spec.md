# Strength Training

## Purpose

Define training routines organized by day, log workout sessions with sets/reps/load, track progression over time, and associate with fat-loss phase.

## Requirements

### Requirement: Define training routines

The system SHALL allow users to create named training routines organized by day of the week, with each day containing a list of exercises.

#### Scenario: Create a routine
- **WHEN** a user creates a new routine named "Upper / Lower Split" and assigns exercises to Monday, Wednesday, and Friday
- **THEN** the system SHALL save the routine with the specified day-to-exercise mapping

#### Scenario: Edit a routine
- **WHEN** a user opens an existing routine, adds a new exercise day or modifies an existing one, and saves
- **THEN** the system SHALL update the routine with the changes

### Requirement: Log workout sessions with sets, reps, and load

The system SHALL allow users to log individual workout sessions, recording each set's exercise name, machine/equipment, load, reps, and set number.

#### Scenario: Log a complete session
- **WHEN** a user starts a workout session for a routine day, completes 3 sets of bench press at 60 kg for 8 reps, and saves
- **THEN** the system SHALL record the session with 3 sets, each with the specified load, reps, and a timestamp

#### Scenario: Partial session with remaining sets
- **WHEN** a user logs 2 out of 3 planned sets and marks the session as complete
- **THEN** the system SHALL save the completed sets and note that 1 set was skipped

### Requirement: Track strength progression over time

The system SHALL display historical load, volume, and rep-max data per exercise across all logged sessions.

#### Scenario: View exercise progression chart
- **WHEN** a user selects an exercise (e.g., bench press) in the progression view
- **THEN** the system SHALL display a chart of estimated 1RM or top set load over time with session dates on the x-axis

#### Scenario: Compare last session to previous
- **WHEN** a user views a completed session
- **THEN** the system SHALL show delta indicators (▲/▼) next to each exercise comparing load and volume to the most recent previous session for that exercise

### Requirement: Auto-associate training with fat-loss objective

The system SHALL display a strength training summary alongside the user's current calorie target and weight trend, indicating whether strength is being maintained during the fat-loss phase.

#### Scenario: Strength maintenance indicator
- **WHEN** a user is in an active fat-loss phase and has logged training sessions in the last 14 days
- **THEN** the system SHALL display a strength maintenance status (on track / slight decline / decline) based on volume trend
