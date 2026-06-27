## ADDED Requirements

### Requirement: Dashboard goals summary card layout

The dashboard SHALL include a compact goals summary card between the Strava-style summary panels block and the hero card (energy balance growth ring). The card SHALL display up to 3 active goal progress rings in a horizontal row. If no active goals exist, the card SHALL display an empty state with "Define tu primer objetivo".

#### Scenario: Goals card between Strava and hero
- **WHEN** the dashboard renders
- **THEN** the goals summary card SHALL appear between the Strava panels (streak + monthly calendar) and the hero card (energy balance growth ring)
- **THEN** the card SHALL span full width (`grid-column: 1 / -1`)

#### Scenario: Goals card shows progress rings
- **WHEN** the user has active goals
- **THEN** each active goal SHALL render as a 56×56 px progress ring
- **THEN** clicking a ring SHALL navigate to the goals view

#### Scenario: Empty goals card
- **WHEN** the user has no active goals
- **THEN** the card SHALL display "Define tu primer objetivo" with a `target` icon
- **THEN** the card SHALL be clickable to navigate to goals view

### Requirement: Goals card loading in dashboard batch

The system SHALL fetch goals data as part of the dashboard's parallel `Promise.allSettled` batch alongside health metrics and Strava panels.

#### Scenario: Goals fetched in batch
- **WHEN** the dashboard mounts
- **THEN** `db:getGoals` SHALL be called within the dashboard's parallel data fetch
- **THEN** the goals card SHALL render concurrently with other dashboard panels
