## ADDED Requirements

### Requirement: Dashboard goals summary card

The system SHALL render a compact goals summary row on the dashboard, positioned between the Strava panels block and the hero card (energy balance growth ring). The card SHALL show up to 3 active (non-archived, < 100% or still ongoing) goal progress rings in a horizontal row, each at 28 px radius (56×56 px SVG). Each ring SHALL be clickable (`cursor: pointer`) and navigate to the goals view on click.

#### Scenario: Three active goals on dashboard
- **WHEN** the user has 3 active goals with varying progress
- **THEN** three progress rings SHALL render horizontally in the summary card
- **THEN** each ring SHALL be 56×56 px (28 px radius)
- **THEN** below each ring, a short label (max 20 chars truncated) SHALL display the goal label
- **THEN** clicking any ring SHALL navigate to the goals view

#### Scenario: More than 3 active goals
- **WHEN** the user has 5 active goals
- **THEN** only the first 3 goals SHALL be shown as rings
- **THEN** a "+2 más" overflow indicator SHALL appear as the 4th slot
- **THEN** clicking "+2 más" SHALL also navigate to the goals view

#### Scenario: One active goal
- **WHEN** the user has 1 active goal
- **THEN** a single progress ring SHALL render (centered or left-aligned)
- **THEN** the card layout SHALL not break or show empty ring slots

#### Scenario: Zero active goals (empty state)
- **WHEN** the user has no active goals (all archived, none created, or all completed)
- **THEN** the summary card SHALL display "Define tu primer objetivo" with a Lucide `target` icon and a clickable area that navigates to the goals view
- **THEN** the card SHALL NOT render empty ring placeholders

### Requirement: Dashboard goals card click navigation

The system SHALL navigate to the `goals` view when any goal ring or the "+N más" overflow indicator is clicked. Navigation SHALL use `api.navigate('goals')` to activate the goals view.

#### Scenario: Click ring navigates
- **WHEN** the user clicks a goal ring on the dashboard
- **THEN** the application SHALL navigate to the goals view
- **THEN** the goal clicked SHALL be scrolled into view on the goals page

#### Scenario: Keyboard activation
- **WHEN** a goal ring has focus and the user presses Enter
- **THEN** the application SHALL navigate to the goals view

### Requirement: Dashboard goals card IPC loading

The system SHALL issue `db:getGoals` and `db:getGoalProgress` for each active goal during the dashboard's initial data loading phase. The goals card SHALL be part of the `Promise.allSettled` batch alongside other dashboard panels.

#### Scenario: Goals loaded in dashboard batch
- **WHEN** the dashboard loads
- **THEN** `db:getGoals` SHALL be called within the dashboard's batch
- **THEN** progress for each active goal SHALL be computed
- **THEN** the goals card SHALL render with data

#### Scenario: Goals card error state
- **WHEN** `db:getGoals` fails
- **THEN** the goals card SHALL display "--" or an error state
- **THEN** the dashboard SHALL continue rendering normally
