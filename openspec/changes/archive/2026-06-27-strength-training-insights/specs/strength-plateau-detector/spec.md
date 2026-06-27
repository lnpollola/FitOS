# Strength Plateau Detector

## Purpose

Identify exercises where the user has not achieved a new estimated 1RM PR in 4 or more weeks, and surface them as actionable alert cards so the user can adjust their training.

## Requirements

### Requirement: Detect exercises without recent PR

The system SHALL identify exercises where the most recent estimated 1RM PR was achieved 4 or more weeks ago, AND the user has logged at least 2 sessions for that exercise in the last 8 weeks (active exercise). For each plateaued exercise, the system SHALL return: exercise name, muscle group, current PR value, date of current PR, weeks since PR, and total sets logged since the last PR.

#### Scenario: Active exercise in plateau
- **WHEN** an exercise's best estimated 1RM was achieved 5 weeks ago
- **WHEN** the user has logged that exercise in 3 of the last 8 weeks
- **THEN** the exercise SHALL be flagged as plateaued
- **THEN** the response SHALL include "5 semanas sin PR" as the plateau duration

#### Scenario: Recently improved exercise not flagged
- **WHEN** an exercise's best estimated 1RM was achieved 1 week ago
- **THEN** the exercise SHALL NOT be flagged as plateaued

#### Scenario: Inactive exercise not flagged
- **WHEN** an exercise's best PR was set 12 weeks ago but the user has not logged it in the last 8 weeks
- **THEN** the exercise SHALL NOT be flagged as plateaued (the user may have stopped doing it)

### Requirement: Plateau severity levels

Each plateau SHALL be classified into a severity level based on weeks since last PR: "warning" (4–7 weeks), "alert" (8–11 weeks), and "critical" (12+ weeks). These SHALL drive the styling of the alert card (e.g., amber, orange, red).

#### Scenario: Warning plateau
- **WHEN** an exercise has not improved in 5 weeks
- **THEN** the plateau severity SHALL be "warning"

#### Scenario: Alert plateau
- **WHEN** an exercise has not improved in 10 weeks
- **THEN** the plateau severity SHALL be "alert"

#### Scenario: Critical plateau
- **WHEN** an exercise has not improved in 15 weeks
- **THEN** the plateau severity SHALL be "critical"

### Requirement: Plateau card rendering

The system SHALL render each plateaued exercise as a card: exercise name, muscle group icon, current PR value and date, weeks-since-PR badge, severity chip, total sets since PR, and a "Ver progresión" button that navigates to the exercise selector in the training view. Multiple plateau cards SHALL be rendered in a grid layout. If no plateaus are detected, the section SHALL display an empty state message "Sin mesetas detectadas — buen progreso".

#### Scenario: Single plateau card
- **WHEN** one exercise is plateaued at warning severity
- **THEN** the card SHALL show the exercise name, "5 semanas", severity badge "warning", current PR "80.0 kg", and "Ver progresión" button

#### Scenario: No plateaus empty state
- **WHEN** all active exercises have improved within the last 4 weeks
- **THEN** the plateau section SHALL show "Sin mesetas detectadas — buen progreso" with a green check icon
