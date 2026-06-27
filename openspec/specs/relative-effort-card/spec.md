# Relative Effort Card

## Purpose

Compare the user's training effort between the current ISO week and the previous ISO week. Effort is a derived metric: `Σ (sport_kcal × intensity_multiplier) + steps_kcal`, where each sport_type has a fixed intensity multiplier. The card surfaces whether the user is training harder, easier, or about the same as last week.

## Requirements

### Requirement: Effort formula

The system SHALL compute weekly effort as the sum of `sport_kcal × intensity_multiplier` for every `sport_activities` record in the week, plus the sum of `active_kcal` from `activity_days` (steps-derived NEAT). Intensity multipliers per `sport_type`: `running` = 1.4, `cycling` = 1.2, `swimming` = 1.5, `hiit` = 1.6, `strength` = 1.3, `walking` = 1.0, `other` = 1.1. The result SHALL be a non-negative integer (rounded down).

#### Scenario: Effort from running only
- **WHEN** the user has 3 running activities this week totaling 1500 kcal
- **THEN** effort from sport SHALL be 1500 × 1.4 = 2100
- **THEN** if NEAT is 0, total effort SHALL be 2100

#### Scenario: Effort combines sport and NEAT
- **WHEN** the user has 1000 sport-kcal (running, multiplier 1.4 → 1400) and 2000 NEAT kcal from steps
- **THEN** total effort SHALL be 1400 + 2000 = 3400

#### Scenario: Different sport types weighted differently
- **WHEN** the user has 1000 kcal from yoga (multiplier 1.0) and 1000 kcal from running (multiplier 1.4) in the same week
- **THEN** yoga contributes 1000 and running contributes 1400
- **THEN** total effort SHALL be 2400

#### Scenario: Unknown sport type uses default multiplier
- **WHEN** a `sport_activities` record has `sport_type = 'climbing'` (not in the table)
- **THEN** the multiplier SHALL be 1.1 (the "other" default)
- **THEN** the activity SHALL still contribute to weekly effort

### Requirement: Week-over-week comparison

The system SHALL compute effort for the current ISO week and the previous ISO week. The card SHALL display both values with their date ranges and the absolute delta (current - previous) plus a trend indicator (up/down/flat).

#### Scenario: Two-week comparison
- **WHEN** current week effort = 79 and previous week effort = 12
- **THEN** the card SHALL display "79" prominently with date range "23 jun – 29 jun 2026"
- **THEN** the card SHALL display "12" smaller with date range "16 jun – 22 jun 2026"
- **THEN** the delta SHALL be +67 with an up arrow

#### Scenario: Flat trend
- **WHEN** current week effort = 50 and previous week effort = 50
- **THEN** the delta SHALL be 0
- **THEN** the trend indicator SHALL be a flat line (Lucide `minus` icon, 12 px)

#### Scenario: Down trend
- **WHEN** current week effort = 30 and previous week effort = 60
- **THEN** the delta SHALL be -30 with a down arrow (Lucide `arrow-down` icon, 12 px)

### Requirement: Effort level color coding

The current-week effort number SHALL be color-coded by level: magenta (`#E91E8C`) when > 70, naranja (`#FF6B35`) when 40–70, morado (`#9C27B0`) when 20–40, morado claro (`#B39DDB`) when < 20. The previous-week number SHALL always be `var(--text-secondary)`.

#### Scenario: High effort is magenta
- **WHEN** current week effort = 79
- **THEN** the "79" SHALL be rendered in magenta (`#E91E8C`)
- **THEN** the CSS class SHALL be `.effort-level--very-high`

#### Scenario: Moderate effort is morado
- **WHEN** current week effort = 30
- **THEN** the "30" SHALL be rendered in morado (`#9C27B0`)
- **THEN** the CSS class SHALL be `.effort-level--moderate`

#### Scenario: Low effort is morado claro
- **WHEN** current week effort = 15
- **THEN** the "15" SHALL be rendered in morado claro (`#B39DDB`)
- **THEN** the CSS class SHALL be `.effort-level--low`

### Requirement: Card interaction

The card SHALL be clickable (chevron `>` on the right edge, full card clickable area) and SHALL navigate to a future "weekly detail" view (out of scope for this change). For v1, the click SHALL be a no-op with `cursor: pointer` and `aria-label="Ver detalle semanal"` to indicate future intent.

#### Scenario: Card click placeholder
- **WHEN** the user clicks the card
- **THEN** the card SHALL NOT trigger any navigation
- **THEN** the cursor SHALL change to `pointer`
- **THEN** the card SHALL be keyboard-focusable with `aria-label="Ver detalle semanal"`

#### Scenario: Empty state
- **WHEN** both weeks have 0 effort
- **THEN** the card SHALL display "Sin actividad esta semana" and "Sin actividad la semana pasada"
- **THEN** both values SHALL be 0
- **THEN** the delta SHALL be 0 (flat)
