# Weekly Goal Ring

## Purpose

Visualize the user's progress toward a weekly activity goal as a donut ring chart on the dashboard. The ring fills proportionally to `current / target` for the current ISO week, with the primary sport icon at the center. Defaults to 4 activities per week; configurable in settings.

## ADDED Requirements

### Requirement: Default weekly activity target

The system SHALL define a default weekly activity target of 4 activities per ISO week. The target SHALL be stored in the `settings` table under the key `weekly_activity_target` (JSON value: integer). If the key is absent, the system SHALL fall back to the default of 4.

#### Scenario: Default target is 4
- **WHEN** the `settings` table has no row for `weekly_activity_target`
- **THEN** the system SHALL use 4 as the target

#### Scenario: User-configured target respected
- **WHEN** the user sets `weekly_activity_target` to 6 in settings
- **THEN** the ring SHALL compute `progress_pct` against 6, not 4
- **THEN** the target SHALL persist across application restarts

### Requirement: Current-week activity count

The system SHALL count distinct `sport_activities` records whose `date` falls within the current ISO week (Monday 00:00 local through Sunday 23:59 local). Multiple activities on the same day SHALL count as separate activities.

#### Scenario: Activities within the week counted
- **WHEN** the user has 3 activities on Mon, 1 on Wed, 1 on Sat of the current ISO week
- **THEN** `current` SHALL equal 5
- **THEN** `progress_pct` SHALL equal 5 / target × 100

#### Scenario: Activities outside the week not counted
- **WHEN** the user has 2 activities on the previous Sunday (last week)
- **THEN** those activities SHALL NOT contribute to the current week count
- **THEN** `current` SHALL reflect only current-week activities

#### Scenario: Cross-week boundary (Sunday to Monday)
- **WHEN** the user logs an activity on Sunday at 23:30 and another on Monday at 00:30
- **THEN** the Sunday activity SHALL count toward the previous ISO week
- **THEN** the Monday activity SHALL count toward the new ISO week

### Requirement: Ring chart rendering

The system SHALL render the weekly goal as a donut ring chart with stroke width 12–16 px. The track (background) SHALL be `var(--text-secondary)` at 20% opacity (dark gray). The fill SHALL be `var(--success)` (green) from 0° to `progress_pct × 3.6°`, starting at 12 o'clock and moving clockwise. The center of the ring SHALL display the primary sport icon (SVG, 32 px) of the most-frequent sport type in the current week, with the fallback to the Lucide `target` icon when no activities exist.

#### Scenario: Ring fills proportionally
- **WHEN** `current = 2` and `target = 4` (50%)
- **THEN** the fill arc SHALL span 180° (half the ring)
- **THEN** the fill color SHALL be `var(--success)` (green)

#### Scenario: Ring clamps at 100%
- **WHEN** `current = 6` and `target = 4` (150%)
- **THEN** the fill arc SHALL span 360° (full ring, clamped)
- **THEN** the displayed value SHALL read "6/4" with a small "(150%)" suffix or "Superado" badge

#### Scenario: Center icon is primary sport
- **WHEN** the user has 3 running and 2 cycling activities this week
- **THEN** the center icon SHALL be the running icon (most-frequent)
- **THEN** `sportIcon('running', 32)` SHALL be rendered

### Requirement: Goal-card text and progress label

The card SHALL display the title "Objetivo semanal" and the progress text "X/N actividades" below the ring. The card SHALL be keyboard-focusable (`tabindex="0"`) and respond to Enter/Space by navigating to the activity view filtered to the current week.

#### Scenario: Text labels in Spanish
- **WHEN** the card renders
- **THEN** the title SHALL be "Objetivo semanal"
- **THEN** the progress text SHALL be "1/4 actividades" (with proper pluralization: "1/4 actividad" when `current = 1` is not used; "1/4 actividades" is correct Spanish per the design spec)

#### Scenario: Empty state shows target icon
- **WHEN** the user has 0 activities this week
- **THEN** the center icon SHALL be the Lucide `target` icon
- **THEN** the progress text SHALL be "0/4 actividades"
- **THEN** the ring SHALL be empty (0° fill)

#### Scenario: Keyboard activation
- **WHEN** the card has focus and the user presses Enter
- **THEN** the application SHALL navigate to the `activity` view
- **THEN** the activity view SHALL pre-filter to the current ISO week
