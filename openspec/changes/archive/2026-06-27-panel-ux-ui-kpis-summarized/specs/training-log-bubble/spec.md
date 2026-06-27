# Training Log Bubble Chart

## Purpose

Render a 7-day bubble chart on the dashboard showing the distribution of training minutes across the current ISO week. Each day's circle is sized proportionally to total training minutes that day, with labels for long sessions. The chart gives a quick "shape of the week" overview.

## ADDED Requirements

### Requirement: Daily duration aggregation

The system SHALL aggregate training duration per day-of-week for the current ISO week. For each day (Monday through Sunday), the system SHALL sum `duration_min` across all `sport_activities` records whose `date` falls on that day. The result SHALL be an array of 7 values in `[Mon, Tue, Wed, Thu, Fri, Sat, Sun]` order.

#### Scenario: Multiple activities per day summed
- **WHEN** the user has a 30 min run on Mon morning and a 60 min strength session on Mon evening
- **THEN** Monday's total SHALL be 90 min
- **THEN** the bubble for Monday SHALL be sized to 90 min

#### Scenario: Day with no activities
- **WHEN** Tuesday has no activities
- **THEN** Tuesday's total SHALL be 0
- **THEN** no bubble SHALL be rendered for Tuesday (or a faint placeholder dot)

#### Scenario: Cross-day activities split correctly
- **WHEN** a 120 min activity starts on Sunday at 23:00 and ends on Monday at 01:00
- **THEN** the activity SHALL be attributed to Sunday (its start date)
- **THEN** Monday's total SHALL NOT include the 60 min from Sunday evening

### Requirement: Bubble radius scaling

The system SHALL compute bubble radii via linear scaling: `radius = MIN_RADIUS + (duration / max_duration) × (MAX_RADIUS - MIN_RADIUS)`, where `MIN_RADIUS = 8 px` and `MAX_RADIUS = 28 px`. When `max_duration = 0` (no activities in the week), no bubbles SHALL be rendered. The bubble color SHALL be `var(--success)` (green) at 80% opacity.

#### Scenario: Single activity day
- **WHEN** the week has only one 90 min activity on Thursday
- **THEN** Thursday's bubble SHALL have `radius = 28 px` (max)
- **THEN** other days SHALL have no bubbles

#### Scenario: Two activities of different durations
- **WHEN** Thursday has 90 min and Tuesday has 30 min
- **THEN** Thursday's bubble SHALL be 28 px and Tuesday's SHALL be 8 + (30/90) × 20 = 14.67 → rounded to 15 px
- **THEN** the visual size difference SHALL be evident (Thursday's bubble ~2x the diameter)

#### Scenario: Empty week
- **WHEN** no activities exist in the current ISO week
- **THEN** no bubbles SHALL be rendered
- **THEN** the chart SHALL show the empty-state message "Sin entrenamientos esta semana"

### Requirement: Day-of-week labels and labels for long sessions

The system SHALL render the day-of-week label (L, M, X, J, V, S, D in Spanish) above each bubble column. The day header SHALL be in Source Sans 3 at 12 px. For bubbles where `duration_min >= 60`, a duration label (e.g., "1h 30m") SHALL be rendered below the bubble in JetBrains Mono at 11 px.

#### Scenario: Short session no label
- **WHEN** Tuesday has 25 min
- **THEN** no duration label SHALL be rendered below the bubble (under 60 min)

#### Scenario: Long session with label
- **WHEN** Thursday has 249 min
- **THEN** the label "4h 9m" SHALL be rendered below Thursday's bubble
- **THEN** the label SHALL use Spanish time format (e.g., "1h 30m", not "1:30")

#### Scenario: All day headers in Spanish
- **WHEN** the chart renders
- **THEN** the day labels SHALL be: L (lunes), M (martes), X (miércoles), J (jueves), V (viernes), S (sábado), D (domingo)
- **THEN** the order SHALL be Monday → Sunday (ISO week order)

### Requirement: Week total header

The chart SHALL display a header with the date range "DD MMM – DD MMM, YYYY" (Spanish month abbreviations) and the total weekly duration formatted as "Xh Ym" (e.g., "4h 9m"). The total SHALL match the sum of all daily durations.

#### Scenario: Header with total
- **WHEN** the week total is 249 min
- **THEN** the header SHALL read "22 jun – 28 jun 2026" and "4h 9m"
- **THEN** the date range SHALL use the Spanish month abbreviation (jun, not Jun.)

#### Scenario: Zero total
- **WHEN** the week total is 0 min
- **THEN** the header SHALL read "Sin entrenamientos esta semana" instead of the date range + total
- **THEN** the chart area SHALL show only the day-of-week labels, no bubbles

### Requirement: Chart interaction

The chart SHALL be clickable per bubble; clicking a day's bubble SHALL navigate to the activity view filtered to that day. Each bubble SHALL be a `<button>` with `aria-label="Jueves, 4h 9m de entrenamiento"`. The chart container SHALL be wrapped in `<section role="region" aria-label="Registro de entrenamiento semanal">`.

#### Scenario: Bubble keyboard activation
- **WHEN** a bubble has focus and the user presses Enter
- **THEN** the application SHALL navigate to the activity view
- **THEN** the activity view SHALL pre-filter to the bubble's date

#### Scenario: Bubble aria-label
- **WHEN** Thursday's bubble represents 4h 9m of training
- **THEN** the bubble's `aria-label` SHALL be "Jueves 25 de junio, 4 horas 9 minutos de entrenamiento"
