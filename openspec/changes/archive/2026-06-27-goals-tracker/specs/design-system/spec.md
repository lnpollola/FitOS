## ADDED Requirements

### Requirement: Goal card CSS component

The system SHALL provide CSS classes for goal cards in `src/renderer/styles/cards.css` under a `.goal-card` block. Goal cards SHALL follow the organic card pattern: Fraunces font for the progress value, Source Sans 3 for labels, rounded corners, shadow elevation.

#### Scenario: Goal card base class
- **WHEN** a goal card renders
- **THEN** the card SHALL use `.goal-card` class
- **THEN** the card SHALL have `.card` base styles (rounded corners, shadow, padding)
- **THEN** the progress value SHALL use Fraunces font at 24–36 px depending on card size

#### Scenario: Goal card color variants
- **WHEN** a goal is < 100% progress
- **THEN** the progress ring SHALL use `var(--success)` (green)
- **WHEN** a goal is ≥ 100% progress (overshoot)
- **THEN** the progress ring SHALL use `var(--accent)` (amber)

### Requirement: Countdown badge CSS

The system SHALL provide CSS classes for the countdown text with urgency color variants: `.countdown--normal`, `.countdown--approaching`, `.countdown--urgent`.

#### Scenario: Countdown urgency classes
- **WHEN** `daysRemaining > 30`
- **THEN** `.countdown--normal` SHALL use `var(--moss)` color
- **WHEN** `daysRemaining` is 8–30
- **THEN** `.countdown--approaching` SHALL use `var(--ember)` at 70% opacity
- **WHEN** `daysRemaining ≤ 7`
- **THEN** `.countdown--urgent` SHALL use `var(--danger)` color

### Requirement: Confetti overlay CSS

The system SHALL provide CSS for the achievement celebration overlay: `.celebration-overlay` (fixed position, full screen, centered content, z-index above all content), `.celebration-canvas` (absolute positioned canvas covering the overlay), `.celebration-content` (centered card with goal info).

#### Scenario: Celebration overlay positioning
- **WHEN** the celebration overlay renders
- **THEN** `.celebration-overlay` SHALL use `position: fixed; inset: 0; z-index: var(--z-100)`
- **THEN** the overlay background SHALL be `rgba(0,0,0,0.6)`
- **THEN** `.celebration-content` SHALL be centered vertically and horizontally

### Requirement: Dashboard goals summary card CSS

The system SHALL provide CSS for the compact dashboard goals summary: `.goals-summary` container using Flexbox with `gap: var(--space-4)`, `.goal-ring-mini` for 56×56 px ring containers.

#### Scenario: Dashboard goals summary layout
- **WHEN** the dashboard goals summary card renders
- **THEN** `.goals-summary` SHALL use `display: flex; gap: var(--space-4); justify-content: center`
- **THEN** each `.goal-ring-mini` SHALL be 56×56 px with centered text below
- **THEN** `.goals-summary-empty` SHALL use centered text with the `target` icon at 24 px
