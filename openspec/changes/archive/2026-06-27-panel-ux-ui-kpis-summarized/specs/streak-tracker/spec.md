# Streak Tracker

## Purpose

Calculate and display the user's consecutive-week activity streak on the dashboard. The streak counter is a motivational anchor: "61 weeks in a row, 585 activities total." Provide a shareable summary via `mailto:` so the user can brag.

## ADDED Requirements

### Requirement: Consecutive ISO weeks count

The system SHALL compute the streak as the number of consecutive ISO weeks ending at the current week that contain ≥ 1 `sport_activities` record. The streak SHALL be a non-negative integer. The week at the boundary (current week) SHALL count toward the streak even if it has 0 activities, **provided** the previous week has ≥ 1 activity (grace period for the current incomplete week).

#### Scenario: Active streak across multiple weeks
- **WHEN** the user has ≥ 1 activity in every ISO week from 2025-W18 through 2026-W26 (61 weeks) and 0 activities in 2026-W27 (future)
- **THEN** the streak SHALL be 61 weeks
- **THEN** the streak SHALL be marked as "active"

#### Scenario: Current week empty, streak still alive
- **WHEN** the streak would be 60 weeks (last 60 ISO weeks all have activities) and the current week has 0 activities
- **THEN** the streak SHALL STILL be 60 (grace period)
- **THEN** a "Continúa esta semana" prompt SHALL appear in the UI

#### Scenario: Broken streak
- **WHEN** the previous ISO week had 0 activities AND the current ISO week has 0 activities
- **THEN** the streak SHALL be 0 (broken)
- **THEN** the UI SHALL display "Sin racha activa" with the last broken date
- **THEN** the last broken date SHALL be the most recent week with activities before the current gap

#### Scenario: No activities ever
- **WHEN** the user has 0 `sport_activities` records
- **THEN** the streak SHALL be 0
- **THEN** the UI SHALL display "Inicia tu primera semana de actividad"

### Requirement: Total activities in streak

The system SHALL compute the total number of `sport_activities` records within the active streak's date range (streak start week through current week, inclusive). The total SHALL be a non-negative integer.

#### Scenario: Total matches activity count in streak window
- **WHEN** the active streak spans 61 weeks (2025-W18 through 2026-W26) and contains 585 activity records
- **THEN** the displayed total SHALL be 585
- **THEN** the total SHALL include activities in both the current week and all prior streak weeks

#### Scenario: Zero activities in streak window
- **WHEN** the streak is 0 (broken or never started)
- **THEN** the total SHALL be 0
- **THEN** the UI SHALL NOT show a separate total (only the broken/initial state)

### Requirement: Streak header rendering

The system SHALL render the streak header as two large metrics side-by-side: "N Semanas" (consecutive weeks) and "M Actividades" (total in streak). A share button (Lucide `share-2` icon) SHALL be present. The numbers SHALL be displayed in Fraunces at 36 px. The labels SHALL be in Source Sans 3 at 12 px, italic eyebrow style (per organic-aesthetic spec).

#### Scenario: Active streak renders
- **WHEN** the streak is 61 weeks with 585 activities
- **THEN** the header SHALL display "61 Semanas" and "585 Actividades"
- **THEN** the share button SHALL be enabled

#### Scenario: Broken streak renders
- **WHEN** the streak is 0
- **THEN** the header SHALL display "Sin racha activa" in place of the two metrics
- **THEN** the share button SHALL be disabled with `aria-label="Compartir no disponible"`

### Requirement: Share via mailto

The share button SHALL open the user's default mail client via a `mailto:` link with a pre-filled subject and body. Subject: "Mi racha de actividad en FitOS". Body: "Llevo {N} semanas consecutivas de actividad en FitOS, con {M} entrenamientos en total. ¡Vamos!" Variables `{N}` and `{M}` SHALL be replaced with the current streak values.

#### Scenario: Mailto link generated
- **WHEN** the streak is 61 and total is 585
- **THEN** the mailto link SHALL be: `mailto:?subject=Mi%20racha%20de%20actividad%20en%20FitOS&body=Llevo%2061%20semanas%20consecutivas%20de%20actividad%20en%20FitOS%2C%20con%20585%20entrenamientos%20en%20total.%20%C2%A1Vamos!`
- **THEN** clicking the share button SHALL open the mail client

#### Scenario: Share disabled on broken streak
- **WHEN** the streak is 0
- **THEN** the share button SHALL have `aria-disabled="true"` and SHALL NOT trigger any action on click

### Requirement: Performance

The streak calculation SHALL be O(n) where n = number of `sport_activities` records. The system SHALL NOT perform a per-record database query; the calculation SHALL be done in memory after a single bulk fetch (`SELECT date FROM sport_activities ORDER BY date`).

#### Scenario: Single bulk fetch
- **WHEN** `db:getStreak` is called
- **THEN** the system SHALL issue exactly one SQL query: `SELECT date FROM sport_activities ORDER BY date`
- **THEN** the calculation SHALL iterate the in-memory array

#### Scenario: Calculation under 50 ms
- **WHEN** the user has 10,000 activity records
- **THEN** the streak calculation SHALL complete in under 50 ms on a mid-range laptop
- **THEN** the IPC round-trip SHALL be under 100 ms total
