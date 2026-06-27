## ADDED Requirements

### Requirement: Days-remaining computation

The system SHALL compute `daysRemaining` for a goal as `Math.ceil((targetDate - today) / 86400000)` where both dates are at 00:00:00 local time. The result SHALL be a non-negative integer. If `targetDate` is in the past, `daysRemaining` SHALL be 0 and the goal SHALL display "En curso" (overdue) instead of a countdown.

#### Scenario: Future target date
- **WHEN** today is 2026-06-27 and `targetDate` is 2026-09-15 (80 days in the future)
- **THEN** `daysRemaining` SHALL be 80
- **THEN** the countdown SHALL display "80 días restantes"

#### Scenario: Target date is today
- **WHEN** today is 2026-09-15 and `targetDate` is 2026-09-15
- **THEN** `daysRemaining` SHALL be 0
- **THEN** the countdown SHALL display "¡Último día!"

#### Scenario: Past target date
- **WHEN** today is 2026-10-01 and `targetDate` is 2026-09-15
- **THEN** `daysRemaining` SHALL be 0
- **THEN** the countdown SHALL display "En curso" instead of "X días restantes"

#### Scenario: One day remaining
- **WHEN** `daysRemaining` is 1
- **THEN** the countdown SHALL display "1 día restante" (singular form)

### Requirement: Countdown urgency color coding

The system SHALL apply color styling to the countdown label based on `daysRemaining`:
- `> 30` days: normal text color (`var(--moss)`)
- `8–30` days: amber (`var(--ember)` at 70% opacity)
- `1–7` days: red (`var(--danger)`)
- `0` days (past or today): red (`var(--danger)`, bold) with "¡Último día!" or "En curso"

#### Scenario: Normal countdown
- **WHEN** `daysRemaining` is 80
- **THEN** the countdown SHALL be in normal text color (`var(--moss)`)

#### Scenario: Approaching deadline
- **WHEN** `daysRemaining` is 14
- **THEN** the countdown SHALL be in amber (`var(--ember)` at 70% opacity)

#### Scenario: Urgent countdown
- **WHEN** `daysRemaining` is 3
- **THEN** the countdown SHALL be in red (`var(--danger)`)
