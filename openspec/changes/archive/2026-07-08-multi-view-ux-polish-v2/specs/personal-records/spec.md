## MODIFIED Requirements

### Requirement: Detect best times per standard distance

The system SHALL compute the best (minimum) time per `(sport_type, distance_bucket)` from `sport_activities` records where `distance_km >= 1.0`. Standard distances for running: 1 km, 5 km, 10 km, 21.1 km (media maratón), 42.2 km (maratón). Standard distances for cycling: 10 km, 50 km, 100 km. Sport types in scope: `running`, `cycling`. For each `(sport_type, distance)`, the system SHALL project source activity times to the target distance using Riegel's formula `t2 = t1 × (d2 / d1)^1.06` and select the minimum projected time as the PR.

#### Scenario: Exact-distance PR detected
- **WHEN** the user has a `running` activity of 5.00 km in 25:00
- **THEN** the 5 km PR for `running` SHALL be 25:00 with rank 1 (gold)

#### Scenario: PR projected from nearby distance
- **WHEN** the user has a `running` activity of 4.87 km in 24:00 and no 5.00 km run exists
- **THEN** the 5 km PR SHALL be projected to ~25:24

#### Scenario: Cycling standard distances
- **WHEN** the user has cycling activities of 15 km, 55 km, and 110 km
- **THEN** the system SHALL compute PRs for 10 km (from 15 km), 50 km (from 55 km), and 100 km (from 110 km)

### Requirement: PR banner rendering with sport tabs

The system SHALL render the personal-record panel with sport tabs (Running / Ciclismo / Fuerza) in the header. The banner SHALL display PRs filtered by the selected sport tab. Each tab SHALL show the best PR for that sport's standard distances. The "Ver todos" modal SHALL show all PRs for the active sport tab only.

#### Scenario: Tab-based PR display
- **WHEN** the PR panel renders
- **THEN** tabs SHALL appear: "Running", "Ciclismo", "Fuerza"
- **THEN** the default active tab SHALL be the sport with the most recent PR
- **THEN** clicking a tab SHALL filter the displayed PRs to that sport only

#### Scenario: Running tab shows running PRs only
- **WHEN** the "Running" tab is active
- **THEN** only running PRs (5 km, 10 km, media maratón, maratón) SHALL be displayed
- **THEN** no cycling records SHALL appear

#### Scenario: Cycling tab shows cycling PRs only
- **WHEN** the "Ciclismo" tab is active
- **THEN** only cycling PRs (10 km, 50 km, 100 km, recorrido más largo) SHALL be displayed
- **THEN** no running records SHALL appear

#### Scenario: No mixed sport records
- **WHEN** any tab is active
- **THEN** the displayed records SHALL all belong to the same sport type
- **THEN** no record from a different sport SHALL appear in the list
