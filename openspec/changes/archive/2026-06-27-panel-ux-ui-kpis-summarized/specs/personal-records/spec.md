# Personal Records

## Purpose

Detect, rank, and surface personal records (PRs) for standard distances from `sport_activities` so the user sees their best achievements at a glance on the dashboard. Project times across distances via Riegel's formula when no exact-distance run exists, so a 4.87 km run still produces a 5 km PR.

## ADDED Requirements

### Requirement: Detect best times per standard distance

The system SHALL compute the best (minimum) time per `(sport_type, distance_bucket)` from `sport_activities` records where `distance_km >= 1.0`. Standard distances: 1 km, 1 mi (1.609 km), 5 km, 10 km, 21.1 km (half marathon), 42.2 km (marathon). Sport types in scope: `running`, `cycling`. For each `(sport_type, distance)`, the system SHALL project source activity times to the target distance using Riegel's formula `t2 = t1 × (d2 / d1)^1.06` and select the minimum projected time as the PR.

#### Scenario: Exact-distance PR detected
- **WHEN** the user has a `running` activity of 5.00 km in 25:00
- **THEN** the 5 km PR for `running` SHALL be 25:00 with rank 1 (gold)
- **THEN** the `achieved_at` date SHALL equal the activity's date

#### Scenario: PR projected from nearby distance
- **WHEN** the user has a `running` activity of 4.87 km in 24:00 (pace ≈ 4:55 /km) and no 5.00 km run exists
- **THEN** the 5 km PR SHALL be projected to ~25:24 (24 × (5/4.87)^1.06)
- **THEN** the projection source activity SHALL be returned in the payload as `source_activity_id`

#### Scenario: Source activity outside projection window is rejected
- **WHEN** a `running` activity has `distance_km = 0.5` and the target distance is 42.2 km
- **THEN** the activity SHALL NOT contribute to the marathon PR
- **THEN** the projection window SHALL be `[0.8 × target, 1.5 × target]` (e.g., 33.76–63.30 km for marathon)

#### Scenario: Best of multiple activities selected
- **WHEN** the user has three 5 km runs (25:00, 26:30, 24:15) and one 4.95 km run (24:00)
- **THEN** the 5 km PR SHALL be 24:15 (the actual 5 km run), not 24:00 (the projected 4.95 km)
- **THEN** the rank SHALL be 1 (gold)

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

### Requirement: PR banner rendering

The system SHALL render the personal-record banner as a horizontal list item with a badge icon (gold/silver/bronze), a label (e.g., "2.º tiempo más rápido en 5 km"), the time value, and the date. The banner SHALL use `role="article"` with `aria-label` summarizing the record. The Lucide `medal` icon SHALL be used for the badge, recolored to gold (`#D4A437`), silver (`#A8A8A8`), or bronze (`#A47148`) per rank.

#### Scenario: Banner renders with gold badge
- **WHEN** the most-recent PR is rank 1 (gold) for 5 km running
- **THEN** the banner SHALL show the gold `medal` icon, the label "Tiempo más rápido en 5 km", the time "24:15", and the date "15 de jun de 2026"
- **THEN** the badge SHALL be the only gold-colored element on the dashboard

#### Scenario: Banner empty state
- **WHEN** the user has no `running` or `cycling` activities with `distance_km >= 1.0`
- **THEN** the banner SHALL render in the empty state with the message "Registra tu primera carrera o ruta en bicicleta para desbloquear récords" and a "Ir a Actividad" button
- **THEN** the button SHALL navigate to the `activity` view via `electronAPI.navigate('activity')`

#### Scenario: Banner loading state
- **WHEN** the IPC call to `db:getPersonalRecords` is in flight
- **THEN** the banner SHALL render a skeleton placeholder via `renderStateCard(container, { state: 'loading' })`

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
