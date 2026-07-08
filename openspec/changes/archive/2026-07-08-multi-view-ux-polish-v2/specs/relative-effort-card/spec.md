## MODIFIED Requirements

### Requirement: Effort level color coding

The current-week effort number SHALL be color-coded by level: `#E91E8C` when > 70, `#FF6B35` when 40–70, `#9C27B0` when 20–40, `#B39DDB` when < 20. The delta text (trend indicator with arrow and numeric value) SHALL always be rendered in white (`#fff`) regardless of trend direction, to ensure contrast against the card's gradient background.

#### Scenario: Delta text is white on gradient background
- **WHEN** the relative effort card renders with any trend direction (up, down, flat)
- **THEN** the delta text (e.g., "+67 ▲" or "-30 ▼") SHALL be rendered in white (`#fff`)
- **THEN** the delta text SHALL have sufficient contrast against the card gradient background

#### Scenario: High effort is magenta
- **WHEN** current week effort = 79
- **THEN** the "79" SHALL be rendered in `#E91E8C`
- **THEN** the CSS class SHALL be `.effort-level--very-high`

#### Scenario: Moderate effort is morado
- **WHEN** current week effort = 30
- **THEN** the "30" SHALL be rendered in `#9C27B0`
- **THEN** the CSS class SHALL be `.effort-level--moderate`

#### Scenario: Low effort is morado claro
- **WHEN** current week effort = 15
- **THEN** the "15" SHALL be rendered in `#B39DDB`
- **THEN** the CSS class SHALL be `.effort-level--low`
