# Personal Records

## Purpose

Detect, rank, and surface personal records (PRs) for standard distances from `sport_activities` so the user sees their best achievements at a glance on the dashboard. Project times across distances via Riegel's formula when no exact-distance run exists, so a 4.87 km run still produces a 5 km PR.

## Requirements

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

### Requirement: Rank PRs by historical best

The system SHALL assign a rank badge to each PR based on the user's historical best for that `(sport_type, distance)`: rank 1 = gold (best ever), rank 2 = silver (2nd best), rank 3 = bronze (3rd best). Ranks are based on **all-time bests**, not recent achievements.

#### Scenario: Top 3 ranks assigned correctly
- **WHEN** the user has historical 5 km times of 24:00, 25:00, 26:00, 27:00 (in any date order)
- **THEN** the 5 km PR SHALL have rank 1 (gold, time = 24:00)
- **THEN** the 2nd-best time (25:00) SHALL have rank 2 (silver)
- **THEN** the 3rd-best time (26:00) SHALL have rank 3 (bronze)

#### Scenario: Recent activity shown in banner
- **WHEN** multiple PRs exist across distances
- **THEN** the banner SHALL display the most-recently-achieved PR by `achieved_at` DESC
- **THEN** the "Ver todos (N)" link SHALL reveal a modal with all PRs sorted by `achieved_at` DESC

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

### Requirement: Time format and locale

Times SHALL be formatted as `mm:ss` for under-1-hour times and `h:mm:ss` for longer times (half marathon, marathon). Distance labels SHALL use Spanish conventions: "1 km", "1 mi", "5 km", "10 km", "Media maratón", "Maratón". Ordinal rank labels SHALL use Spanish ordinals: "1.º", "2.º", "3.º".

#### Scenario: Time under 1 hour formatted as mm:ss
- **WHEN** the PR time is 1812 seconds (30:12)
- **THEN** the display SHALL be "30:12"

#### Scenario: Time over 1 hour formatted as h:mm:ss
- **WHEN** the PR time is 5460 seconds (half marathon)
- **THEN** the display SHALL be "1:31:00"

#### Scenario: Distance labels in Spanish
- **WHEN** the distance is 42.2 km
- **THEN** the label SHALL be "Maratón" (not "Marathon")
- **THEN** the label SHALL NOT be "42.2 km"
