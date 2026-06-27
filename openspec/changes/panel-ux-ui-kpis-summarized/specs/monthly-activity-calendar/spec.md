# Monthly Activity Calendar

## Purpose

Display a 7-column monthly grid on the dashboard showing the distribution of activities across the current month, with sport-specific icons per day and a per-week status column. Support month navigation (←/→) and a "Hoy" jump button. Each day cell is keyboard-focusable and navigates to the activity view filtered to that day.

## ADDED Requirements

### Requirement: Month grid layout

The system SHALL render a 7-column grid for the current month in `[Mon, Tue, Wed, Thu, Fri, Sat, Sun]` order, with 5 or 6 rows depending on the month. Each cell SHALL represent one day and SHALL contain either: (a) a white circle with the sport-type SVG icon (when `has_activity`), or (b) a dark circle with the day number (when no activity). Future days of the current month SHALL be rendered as ghosted cells (50% opacity, no hover, no click). Days outside the current month (overflow) SHALL NOT be rendered.

#### Scenario: Current month renders correctly
- **WHEN** the current month is June 2026
- **THEN** the grid SHALL have 5 rows × 7 columns = 30 cells for June 1–30
- **THEN** the first row SHALL start with June 1 (Monday) and end with June 7 (Sunday)
- **THEN** the order SHALL be Monday → Sunday (ISO week order)

#### Scenario: 6-row month
- **WHEN** the current month has 30+ days starting on Mon–Thu (e.g., October 2026: Oct 1 = Thursday, 31 days)
- **THEN** the grid SHALL have 6 rows
- **THEN** the first 4 cells of the last row SHALL be empty (Oct 26–29 outside the month? — actually within: Oct 26, 27, 28, 29 visible)
- **THEN** the last 3 cells of the last row SHALL be the first 3 days of November — but those SHALL NOT be rendered

#### Scenario: Future days ghosted
- **WHEN** today is June 15 and the grid includes June 16–30
- **THEN** June 16–30 SHALL be rendered with 50% opacity
- **THEN** clicking a future day SHALL be a no-op
- **THEN** hovering a future day SHALL NOT show a hover effect

### Requirement: Sport icon per active day

For each day with one or more `sport_activities` records, the system SHALL display the sport-type icon from `sportIcon(primarySportType, 14)` where `primarySportType` is the most-frequent sport type that day. A small white dot in the upper-right of the circle SHALL indicate multiple activities (more than 1 record on that day).

#### Scenario: Single activity day
- **WHEN** June 15 has 1 running activity
- **THEN** the cell SHALL show a white circle with the running icon (footprints) at 14 px
- **THEN** no white dot SHALL appear (single activity)

#### Scenario: Multi-activity day
- **WHEN** June 15 has 2 running + 1 cycling activities
- **THEN** the cell SHALL show a white circle with the running icon (most frequent)
- **THEN** a small white dot SHALL appear in the upper-right (multiple activities)
- **THEN** the `aria-label` SHALL include "3 actividades"

#### Scenario: Unknown sport type falls back
- **WHEN** the primary sport type is not mapped in `sport-icons.js`
- **THEN** the cell SHALL show the generic `activity` icon as fallback
- **THEN** no error SHALL be thrown

### Requirement: Per-week status column

A right-side column (after the 7 day columns) SHALL display the status of each row's ISO week. States: (a) completed = orange circle with white check, (b) current + active streak = orange circle with flame icon and streak count, (c) incomplete = gray circle. A week is "completed" if it has ≥ 1 activity and is in the past. The "current + active streak" state applies only to the current ISO week and only if the user has an active streak (≥ 1 activity this week or last week).

#### Scenario: Past completed week shows check
- **WHEN** the grid shows week 1 (June 1–7) which has 5 activities and is in the past
- **THEN** the week column cell SHALL show an orange circle with a white check icon
- **THEN** the check icon SHALL be the Lucide `check` icon at 12 px

#### Scenario: Current week with active streak shows flame
- **WHEN** the grid shows the current ISO week (June 22–28) and the user has a 61-week active streak
- **THEN** the week column cell SHALL show an orange circle with a flame icon and "61" text
- **THEN** the flame SHALL be the Lucide `flame` icon at 12 px

#### Scenario: Incomplete week shows gray circle
- **WHEN** the grid shows a past week with 0 activities
- **THEN** the week column cell SHALL show a gray (var(--text-secondary) at 30% opacity) circle
- **THEN** no icon SHALL be rendered inside

### Requirement: Month navigation

The calendar header SHALL include the current month label (e.g., "Junio 2026" in Spanish), a left chevron button (previous month), a right chevron button (next month), and a "Hoy" button that returns to the current month. The left chevron SHALL be disabled when viewing any month before the user's first recorded activity month. The right chevron SHALL allow up to 12 months into the future.

#### Scenario: Navigate to previous month
- **WHEN** the user clicks the left chevron while viewing June 2026
- **THEN** the grid SHALL re-render for May 2026
- **THEN** the month label SHALL become "Mayo 2026"
- **THEN** the data SHALL reflect May's activities

#### Scenario: Today button returns to current month
- **WHEN** the user clicks "Hoy" while viewing March 2025
- **THEN** the grid SHALL re-render for the current month (e.g., June 2026)
- **THEN** the month label SHALL update accordingly

#### Scenario: Left chevron disabled at first activity
- **WHEN** the user navigates to their first recorded activity month
- **THEN** the left chevron SHALL have `disabled` attribute
- **THEN** the left chevron SHALL be visually disabled (40% opacity)

### Requirement: Day cell interaction

Each day cell SHALL be a `<button>` (focusable) with `aria-label="DD de MMMM, N actividades, [sport_type]"` for active days or `aria-label="DD de MMMM, sin actividad"` for inactive days. Clicking a cell SHALL navigate to the activity view filtered to that day.

#### Scenario: Click active day cell
- **WHEN** the user clicks June 15 (which has 3 running activities)
- **THEN** the application SHALL navigate to the activity view
- **THEN** the activity view SHALL pre-filter to 2026-06-15

#### Scenario: Click inactive day cell
- **WHEN** the user clicks June 10 (no activities)
- **THEN** the application SHALL navigate to the activity view
- **THEN** the activity view SHALL show empty state for 2026-06-10 (no data, not an error)

#### Scenario: Keyboard activation
- **WHEN** a day cell has focus and the user presses Enter or Space
- **THEN** the same navigation as a click SHALL occur
- **THEN** focus SHALL be preserved (the cell remains focused after view change)
