# Activity Ingestion

## Purpose

Import Apple Health XML exports via HealthSync, normalize into canonical activity-day records and structured sport-activity records. Display activity history as a formatted timeline with trend indicators, sport activity rankings, and unified Spanish sport type names.

## Requirements

### Requirement: Import Apple Health XML export

The system SHALL support importing activity data from Apple Health XML export files using the HealthSync library. After initial import, the system SHALL display the last import timestamp and allow re-importing updated data via a checkbox toggle.

#### Scenario: Apple Health XML import triggers
- **WHEN** a user clicks "Importar desde Apple Health" button
- **THEN** the system SHALL read the Health XML export file, parse it via HealthSync, and insert activity-day records
- **THEN** the button label SHALL reference the expected file name "exportar.xml"

#### Scenario: Last import timestamp displayed
- **WHEN** a previous import exists and the Activity view loads
- **THEN** the system SHALL display "Última importación: {date} {time}" and show the import button as disabled/grayed

#### Scenario: Re-import with confirmation checkbox
- **WHEN** a previous import exists
- **THEN** the system SHALL display a checkbox labeled "Cargar información actualizada"
- **WHEN** the user checks the box
- **THEN** the import button SHALL become enabled and the user can trigger a re-import

### Requirement: View activity history as a timeline

The system SHALL display a scrollable daily timeline of activity metrics with formatted values: steps with comma separators, active kcal as integer with "kcal/activ" unit, resting kcal as integer with "kcal/repo", heart rate with a heart icon prefix, and sleep duration as hours and minutes.

#### Scenario: Timeline shows most recent first with formatted values
- **WHEN** a user navigates to the activity timeline view
- **THEN** the system SHALL display activity-day records sorted by date descending
- **THEN** steps SHALL be formatted with thousand separators (e.g., "8,542")
- **THEN** active calories SHALL be shown as integer with "kcal/activ" suffix
- **THEN** resting calories SHALL be shown as integer with "kcal/repo" suffix
- **THEN** heart rate SHALL be prefixed with ❤️ and shown as integer bpm
- **THEN** sleep SHALL be displayed as hours and minutes (e.g., "7h 32m")

#### Scenario: Timeline highlights missing days
- **WHEN** a date in the timeline range has no activity-day record
- **THEN** the system SHALL display that date with a dashed outline or placeholder indicating no data

### Requirement: View sport activity breakdown

The system SHALL display a ranking table of sport activities with Spanish names, session counts, and average calories per session. The table SHALL support sorting by any column and SHALL show a maximum of 20 rows with scroll for the rest.

#### Scenario: Activity ranking table with Spanish names
- **WHEN** a user views the activity timeline
- **THEN** the system SHALL display a ranking table with columns: Tipo (Spanish name), Count, kcal Promedio, Total kcal
- **THEN** sport types SHALL be displayed in Spanish: cycling → bicicleta, walking → caminata, boxing → boxeo, HIIT → HIIT, running → carrera, football → fútbol, paddle → pádel, swimming → natación, yoga → yoga, strength → fuerza, other → otro

#### Scenario: Sortable ranking columns
- **WHEN** a user clicks a column header
- **THEN** the table SHALL sort by that column ascending, and clicking again DESC

#### Scenario: Limited to 20 rows
- **WHEN** there are more than 20 days of data
- **THEN** the timeline table SHALL display only 20 rows by default with the rest accessible via scroll

#### Scenario: Duration column added to ranking table
- **WHEN** sport_activities has non-NULL duration_minutes
- **THEN** the ranking table SHALL show total duration per sport type
- **THEN** the IPC handler SHALL use COALESCE(duration_minutes, 0) and verify column aliases match frontend keys

#### Scenario: Period comparison in ranking table
- **WHEN** the ranking table renders
- **THEN** "Total kcal" column SHALL include a trend arrow comparing vs previous period
- **THEN** clicking toggles between 15d, 1m, 3m windows

#### Scenario: Mini sparkline per sport type
- **WHEN** the ranking table renders
- **THEN** each row SHALL include a mini sparkline (60×18px) for last-7-day kcal trend

### Requirement: Expanded sport types for HealthSync workouts

The system SHALL expand the sport type mapping to accommodate all HKWorkoutActivityType values from HealthSync, beyond the current set (cycling, boxing, HIIT, walking, football, paddle).

#### Scenario: New sport types created from HealthSync
- **WHEN** a Workout record with HKWorkoutActivityTypeRunning is imported
- **THEN** the system SHALL insert a sport_activity with sport_type "running"

#### Scenario: Unknown activity_type fallback
- **WHEN** a Workout record has an unrecognized activity_type
- **THEN** the system SHALL insert it with sport_type "other" and log the original type

### Requirement: Weekly sport summary with session count, duration, and period comparison

The system SHALL display a "Deporte - Tipo" chart showing session count, average calories, and duration per sport type. The chart canvas element SHALL be preserved during skeleton loading states — the system SHALL NOT destroy the `<canvas>` element when injecting skeleton placeholders. A session-count comparison strip SHALL be displayed alongside the chart showing total sessions for the selected range with a period-over-period comparison.

#### Scenario: Chart canvas preserved during skeleton loading
- **WHEN** the activity view initializes or re-imports Apple Health data
- **THEN** the system SHALL NOT overwrite `.chart-container` innerHTML with a skeleton that destroys the `<canvas id="weekly-chart">` element
- **THEN** the `<canvas id="weekly-chart">` element SHALL remain in the DOM
- **THEN** `loadChart()` SHALL find the canvas via `document.getElementById('weekly-chart')` and render the chart

#### Scenario: Duration correctly displays non-zero values
- **WHEN** sport_activities has non-NULL duration_minutes
- **THEN** the chart SHALL display actual duration values
- **THEN** the migration `migrateHealthData` SHALL populate `duration_minutes` from HealthSync workout data

#### Scenario: Sport summary chart shows all metrics
- **WHEN** sport activity data exists
- **THEN** the chart SHALL display session count, avg kcal, total minutes per sport type

#### Scenario: Custom period selection
- **WHEN** user selects a date range via the range selector
- **THEN** the chart SHALL update for the selected range (not just 7 days)

#### Scenario: Session count comparison strip renders
- **WHEN** the weekly sport summary card renders with sport data
- **THEN** a KPI strip SHALL display total sessions for the selected range (7d/15d/1m)
- **THEN** the strip SHALL show a period-over-period comparison (current vs previous window)
- **THEN** the comparison SHALL use an up/down/flat trend arrow
- **THEN** the comparison SHALL use `strings.activity.periodComparison` for the "vs período anterior" label

#### Scenario: Session count comparison with no previous period data
- **WHEN** the selected range has sport data but the previous period has none
- **THEN** the KPI strip SHALL display the current session count without a comparison arrow
- **THEN** no error SHALL be thrown

#### Scenario: Session count comparison with no data
- **WHEN** the selected range has no sport activity data
- **THEN** the KPI strip SHALL NOT render
- **THEN** the chart container SHALL be hidden

### Requirement: Unified sport type display name registry

The system SHALL provide a single, unified mapping from DB sport_type values to Spanish display names, used consistently across all views (timeline, charts, rankings, dashboard cards).

#### Scenario: Unified mapping exists
- **WHEN** any view renders a sport type name
- **THEN** the system SHALL use a single helper function `getSportDisplayName(type)` that maps each sport_type to its canonical Spanish name: running → Carrera, cycling → Ciclismo, walking → Caminata, swimming → Natación, yoga → Yoga, HIIT → HIIT, strength → Fuerza, football → Fútbol, paddle → Pádel, boxing → Boxeo, other → Otro

#### Scenario: Resolve "Caminata" vs "Caminar" inconsistency
- **WHEN** the unified mapping is created
- **THEN** the system SHALL use "Caminata" as the display noun for walking activity type (consistent with SESSION_TEMPLATES)
- **THEN** the string "Caminar" SHALL be kept only for verb-form contexts (e.g., button labels)

### Requirement: Trend arrows for timeline metrics

The system SHALL display trend indicators (red/green arrows) for activity metrics comparing the first half to the second half of the selected period.

#### Scenario: Upward trend in steps shows green arrow
- **WHEN** the average steps in the second half of the period exceeds the first half
- **THEN** the system SHALL display a green ▲ next to the steps value

#### Scenario: Downward trend shows red arrow
- **WHEN** the average in the second half is lower than the first half
- **THEN** the system SHALL display a red ▼ next to the value

#### Scenario: Flat trend shows gray dash
- **WHEN** the change is within 5% of the first half average
- **THEN** the system SHALL display a gray ― next to the value

## TBD

- Monthly and custom date range aggregation
- Export activity data as CSV
