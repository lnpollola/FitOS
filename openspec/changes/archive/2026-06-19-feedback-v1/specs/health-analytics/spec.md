## ADDED Requirements

### Requirement: Exercise recognition with icons

The system SHALL recognize sport activity types in the Tendencias view and display them with Spanish names and optional icons.

#### Scenario: Activities displayed with Spanish names
- **WHEN** workout data renders in Tendencias
- **THEN** each activity type SHALL be shown with its Spanish name (cycling → bicicleta, walking → caminata, boxing → boxeo, HIIT → HIIT, running → carrera, football → fútbol, paddle → pádel, swimming → natación, yoga → yoga, strength → fuerza, other → otro)

#### Scenario: Optional sport icons
- **WHEN** an activity type has a defined icon mapping
- **THEN** the system SHALL display an icon next to the activity name (using Unicode/emoji characters)

### Requirement: Activity category rankings

The system SHALL display rankings of sport activities by category with totals and trend indicators.

#### Scenario: Ranking by total calories
- **WHEN** workout data exists for the selected period
- **THEN** the system SHALL display a ranking table sorted by total kcal per activity type in descending order

#### Scenario: Ranking with session counts
- **WHEN** the ranking table renders
- **THEN** each row SHALL show: activity type (Spanish), session count, total hours, total kcal, average kcal/session

### Requirement: Trend indicators for activity data

The system SHALL display trend arrows next to activity totals comparing the current period against the previous period of equal length.

#### Scenario: Upward trend in activity
- **WHEN** total kcal in the current period exceeds the previous period
- **THEN** the system SHALL display a green ▲ next to the total

#### Scenario: Downward trend in activity
- **WHEN** total kcal in the current period is lower than the previous period
- **THEN** the system SHALL display a red ▼ next to the total

### Requirement: Secondary metrics with axis values

The system SHALL display secondary metrics (resting HR, VO2 max, walking speed, distance, exercise minutes, flights climbed) with visible axis labels, values, and KPI summary cards.

#### Scenario: Secondary metrics chart with axes
- **WHEN** the secondary metrics section renders
- **THEN** each chart SHALL display visible Y-axis values and X-axis date labels

#### Scenario: KPIs for secondary metrics
- **WHEN** data exists for a secondary metric
- **THEN** the system SHALL display a KPI summary card above each chart showing: current value, period average, min, and max

## MODIFIED Requirements

### Requirement: Activity ranking chart and table

The system SHALL display a horizontal bar chart ranking activity types by total calories, plus a detail table with count, hours, and kcal per type, including trend indicators and Spanish names with icons.

#### Scenario: Ranking chart shows top activities by kcal
- **WHEN** workout data exists for the selected period
- **THEN** the system SHALL display a horizontal bar chart with activity types (in Spanish) on the Y axis and total calories on the X axis, ordered descending
- **THEN** each bar SHALL be colored by activity type and include an icon

#### Scenario: Activity detail table with trends
- **WHEN** workout data exists
- **THEN** the view SHALL display a table below the chart with columns: Tipo (Spanish), Count, Horas, kcal, Tendencia
- **THEN** rows SHALL be ordered by total kcal descending
- **THEN** each row SHALL include a trend arrow (▲/▼/―) comparing the period to the previous period

### Requirement: Secondary metrics section (collapsible)

The system SHALL provide a collapsible section with full-sized trend charts and KPI summary cards for additional health metrics.

#### Scenario: Collapsible section toggles visibility
- **WHEN** the user clicks the section header
- **THEN** the section SHALL expand or collapse with a smooth transition

#### Scenario: Secondary metrics render with axes and KPIs
- **WHEN** data exists
- **THEN** the section SHALL display full line charts with visible axes for: Resting Heart Rate, VO2 Max, Walking Speed, Walking/Running/ Cycling Distance, Exercise Minutes, Flights Climbed
- **THEN** each chart SHALL include Y-axis labels and X-axis date labels
- **THEN** above each chart SHALL be a KPI card showing: current value, period avg, min, max
