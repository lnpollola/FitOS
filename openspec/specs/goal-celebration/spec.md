# Goal Celebration

## Purpose

Celebrate goal achievement with a confetti animation and congratulatory overlay. When a goal reaches 100% completion, the user sees an animated confetti burst and an achievement screen with the goal name and a full green progress ring.

## Requirements

### Requirement: Achievement celebration overlay

The system SHALL detect when a goal reaches `progress_pct >= 100` for the first time. When the user navigates to the goals view or when goal progress is recomputed, any goal that newly reached 100% SHALL trigger a celebration overlay. The overlay SHALL display the goal name, the progress ring (full, green), and a congratulatory message "¡Objetivo conseguido!". Below the message, a "Cerrar" button SHALL dismiss the overlay.

#### Scenario: Celebration triggers on first completion
- **WHEN** a goal's progress reaches 100% for the first time
- **THEN** the celebration overlay SHALL render on top of the goals view
- **THEN** the overlay SHALL display "¡Objetivo conseguido!" in Fraunces 24 px
- **THEN** the overlay SHALL display the goal's label
- **THEN** the overlay SHALL include a full green progress ring
- **THEN** the overlay SHALL include a "Cerrar" button

#### Scenario: Celebration does not re-trigger
- **WHEN** a goal has already been ≥ 100% in a previous session
- **THEN** the celebration overlay SHALL NOT trigger when the goals view is revisited
- **THEN** the goal SHALL display a small achievement badge (Lucide `badge-check` icon) to indicate completion

#### Scenario: Multiple goals complete
- **WHEN** two goals both reached 100% since the last view
- **THEN** the celebration overlay SHALL show one goal at a time
- **THEN** after dismissing the first, the second SHALL appear
- **THEN** the user SHALL dismiss each goal individually

### Requirement: Confetti particle animation

The celebration overlay SHALL include a Canvas-based confetti animation. The animation SHALL:
- Spawn 150–300 particles (colored rectangles) at random x-positions from the top
- Each particle SHALL have a random color from a curated palette (`#4CAF50`, `#FFC107`, `#FF5722`, `#2196F3`, `#E91E63`, `#9C27B0`)
- Particles SHALL fall with gravity-like acceleration and slight rotation
- Duration: 2.5 seconds, then auto-fade
- Particles SHALL be rendered on a `<canvas>` element positioned absolute within the overlay

#### Scenario: Confetti renders on celebration
- **WHEN** the celebration overlay appears
- **THEN** a `<canvas>` element SHALL be present within the overlay
- **THEN** the canvas SHALL cover the full overlay area
- **THEN** particles SHALL be visible and animating

#### Scenario: Confetti auto-cleans
- **WHEN** 2.5 seconds have passed since the overlay appeared
- **THEN** the confetti SHALL self-clean (stop animating, canvas may remain as static)
- **THEN** no memory leak SHALL occur (animation frame SHALL be canceled)

### Requirement: Achievement badge on completed goals

Goals that have reached 100% progress (even if not newly completed) SHALL display a small achievement badge: the Lucide `badge-check` icon (16 px) in `var(--success)` color, positioned next to the goal label.

#### Scenario: Badge shows on completed goal
- **WHEN** a goal has `progress_pct >= 100`
- **THEN** the goal card SHALL display a `badge-check` icon next to the label
- **THEN** the icon SHALL be 16 px in `var(--success)` green

#### Scenario: No badge on incomplete goal
- **WHEN** a goal has `progress_pct < 100`
- **THEN** no badge icon SHALL be shown
