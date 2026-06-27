# Goal Progress Rings

## Purpose

Provide a reusable SVG donut ring utility for visualizing goal completion progress. The ring fills proportionally to `current / target × 100`, supports overshoot (≥100%) with color change, and renders percentage text in the center using Fraunces font.

## Requirements

### Requirement: Progress ring SVG utility

The system SHALL export `goalProgressRing(progress_pct, options)` from `src/renderer/utils/goal-progress-ring.js` returning an SVG string. The function SHALL accept `progress_pct` (0–100+) and optional `options` object with `{ size, strokeWidth, trackColor, fillColor, overshootColor }` defaults.

#### Scenario: Default size ring renders
- **WHEN** `goalProgressRing(75)` is called with no options
- **THEN** the SVG SHALL be 72×72 px (36 px radius)
- **THEN** the stroke width SHALL default to 8 px
- **THEN** the ring SHALL fill to 75% (270° arc) starting at 12 o'clock clockwise

#### Scenario: Full completion ring renders full circle
- **WHEN** `goalProgressRing(100)` is called
- **THEN** the fill arc SHALL span 360° (complete circle)
- **THEN** the fill color SHALL be `var(--success)` (green)

#### Scenario: Overshoot renders accent color
- **WHEN** `goalProgressRing(120)` is called (120% progress)
- **THEN** the fill arc SHALL span 360° (clamped)
- **THEN** the fill color SHALL be `var(--accent)` (amber) indicating overshoot
- **THEN** the displayed percentage SHALL read "120%"

#### Scenario: Custom size option
- **WHEN** `goalProgressRing(50, { size: 56 })` is called
- **THEN** the SVG SHALL be 56×56 px (28 px radius)
- **THEN** the stroke width SHALL scale proportionally (6 px default for 56 px)

#### Scenario: Zero progress renders empty ring
- **WHEN** `goalProgressRing(0)` is called
- **THEN** the fill arc SHALL span 0° (empty ring)
- **THEN** the track SHALL be visible at 20% opacity

### Requirement: Progress ring renders progress text in center

The system SHALL render `progress_pct` as text in the center of the ring, using the Fraunces font at the appropriate size for the ring dimensions. The text SHALL be "XX%" format, or "XX/YY" for goal views when space permits.

#### Scenario: Percentage in center
- **WHEN** a goal progress ring renders at 72×72 px
- **THEN** the center SHALL display "75%" in Fraunces font
- **THEN** the font size SHALL be approximately 18 px

#### Scenario: Long percentage truncated
- **WHEN** progress is 100%
- **THEN** the center SHALL display "100%" (no truncation needed up to 3 digits)
