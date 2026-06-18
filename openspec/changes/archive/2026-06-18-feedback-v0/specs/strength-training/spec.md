# Strength Training (Delta)

## ADDED Requirements

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
