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

The system SHALL display a composite ranking chart comparing sport types by session count and total calories, with period-over-period comparison (current vs previous period). The chart SHALL replace the previous duration+calories table format as the primary visualization. A ranking table SHALL remain to show detailed per-sport metrics with sparklines, sortable columns, and period comparison arrows.

#### Scenario: Activity ranking chart with Spanish names
- **WHEN** a user views the activity view
- **THEN** the system SHALL display a grouped bar chart with two datasets per sport type: "Sesiones" and "kcal Totales"
- **THEN** sport types SHALL be ordered left-to-right by session count descending
- **THEN** sport types SHALL be displayed in Spanish: cycling → Ciclismo, walking → Caminata, boxing → Boxeo, HIIT → HIIT, running → Carrera, football → Fútbol, paddle → Pádel, swimming → Natación, yoga → Yoga, strength → Fuerza, other → Otro

#### Scenario: Sortable ranking columns
- **WHEN** a user clicks a column header in the ranking table
- **THEN** the table SHALL sort by that column ascending, and clicking again DESC

#### Scenario: Limited to 20 rows
- **WHEN** there are more than 20 sport type rows
- **THEN** the chart SHALL display only the top 20 sport types by session count

#### Scenario: Period comparison in ranking chart
- **WHEN** the ranking chart renders
- **THEN** each sport type SHALL show side-by-side bars for current and previous period
- **THEN** current period bars SHALL use full opacity, previous period SHALL use reduced opacity
- **THEN** a trend arrow SHALL compare current vs previous total sessions
- **THEN** the "kcal Promedio" per session SHALL be displayed for each sport type

#### Scenario: Remove duplicate duration column
- **WHEN** the sport ranking table renders
- **THEN** the duplicate "Duración" column at the end SHALL be removed
- **THEN** columns SHALL be: Tipo, Sesiones, kcal Promedio, kcal Totales
- **THEN** kcal Promedio SHALL be computed as total_kcal / session_count

#### Scenario: Period comparison in ranking table
- **WHEN** the ranking table renders
- **THEN** "Total kcal" column SHALL include a trend arrow comparing vs previous period
- **THEN** clicking toggles between 7d, 15d, 1m windows

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

The system SHALL display a "Deporte - Tipo" chart showing session count, average calories, and duration per sport type. The chart canvas element SHALL be preserved during skeleton loading states. A session-count comparison strip SHALL be displayed alongside the chart showing total sessions, total training hours, and average session duration for the selected range with period-over-period comparisons.

#### Scenario: Chart canvas preserved during skeleton loading
- **WHEN** the activity view initializes or re-imports Apple Health data
- **THEN** the system SHALL NOT overwrite `.chart-container` innerHTML with a skeleton that destroys the `<canvas id="weekly-chart">` element
- **THEN** the `<canvas id="weekly-chart">` element SHALL remain in the DOM

#### Scenario: Session count comparison strip renders
- **WHEN** the weekly sport summary card renders with sport data
- **THEN** a KPI strip SHALL display total sessions for the selected range
- **THEN** the strip SHALL display total training hours for the period
- **THEN** the strip SHALL display average minutes per session
- **THEN** each metric SHALL show a period-over-period comparison arrow

#### Scenario: Custom period selection with functional selector
- **WHEN** user selects 7d, 15d, 1m, or 3m via the range selector
- **THEN** the chart SHALL update for the selected range
- **THEN** the active filter button SHALL have the active class
- **THEN** the 15d, 1m, and 3m buttons SHALL function (not be broken)

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

### Requirement: Trend arrows compare correct periods

The system SHALL fix the trend arrow computation in the ranking table to compare the currently-viewed month against the previous month of the same pagination, not against a period relative to today. When the user paginates to January, trend arrows SHALL compare January vs December, not January vs last-15d-of-June.

#### Scenario: Trend arrows compare month-over-month
- **WHEN** the user paginates to a specific month
- **THEN** trend arrows in the ranking table SHALL compare that month against the immediately previous month
- **THEN** the comparison SHALL NOT use periods relative to today's date

### Requirement: Draw sparklines in ranking table or remove dead canvas

The system SHALL either draw the mini sparklines in the ranking table `spk-type-*` canvases or remove the dead canvas elements. If drawn, each row's sparkline SHALL show last-7-day kcal trend for that sport type. If removed, no empty `<canvas>` elements SHALL remain in the DOM.

#### Scenario: Sparklines drawn or removed
- **WHEN** the ranking table renders
- **THEN** each row's `spk-type-*` canvas SHALL either have a drawn sparkline OR be removed from the DOM
- **THEN** no blank/empty canvas elements SHALL be visible

### Requirement: Fix N+1 IPC and O(n²) sparkline computation in timeline

The system SHALL replace the per-day `getSportActivities(d.date)` N+1 IPC calls with a single batch fetch for the entire month. The O(n²) sparkline computation (filtering `allDays` per day × 6 metrics) SHALL be replaced with a single forward pass computing cumulative arrays.

#### Scenario: Single batch fetch for sport activities
- **WHEN** the timeline renders a month
- **THEN** the system SHALL fetch all sport activities for the month in a single IPC call
- **THEN** no per-day IPC round-trips SHALL occur

#### Scenario: Linear sparkline computation
- **WHEN** sparklines are computed for the timeline
- **THEN** the computation SHALL use a single forward pass (O(n))
- **THEN** no `filter()` calls inside per-day loops SHALL occur

### Requirement: dayArrow context-aware for metrics where up is bad

The system SHALL make the `dayArrow` function context-aware: for resting heart rate and resting calories, a decrease SHALL be green (improvement) and an increase SHALL be red (regression). For steps, active calories, and sleep, an increase SHALL remain green.

#### Scenario: Resting HR decrease is green
- **WHEN** resting heart rate decreases from one day to the next
- **THEN** the trend arrow SHALL be green ▼ (improvement)

#### Scenario: Resting HR increase is red
- **WHEN** resting heart rate increases from one day to the next
- **THEN** the trend arrow SHALL be red ▲ (regression)

### Requirement: Comparison filter does not reset timeline pagination

The system SHALL ensure that clicking a 15d/1m/3m comparison filter only re-runs the sport KPI comparison, not the timeline month reload. The `monthOffset` SHALL be preserved when comparison filters change.

#### Scenario: Pagination preserved on filter change
- **WHEN** the user has paginated to a specific month and clicks a comparison filter
- **THEN** the timeline SHALL remain on the same month
- **THEN** only the ranking/KPI comparison SHALL update

### Requirement: Empty states for ranking, comparison strip, and weekly chart

The system SHALL render empty-state messages (using the `.empty-state` pattern) for the ranking card, session-comparison strip, and weekly chart when no sport data exists, instead of hiding the sections silently.

#### Scenario: Ranking empty state
- **WHEN** no sport types exist for the period
- **THEN** the ranking card SHALL display "Sin actividad deportiva en este período" instead of being hidden

#### Scenario: Weekly chart empty state
- **WHEN** no sport summary data exists
- **THEN** the weekly chart card SHALL display an empty-state message instead of blank space

### Requirement: Weekly summary title consistent with selector

The system SHALL update the "Resumen Deportivo Semanal" title to reflect the actual selector behavior. Since the selector offers 7d/15d/1m, the title SHALL be "Resumen Deportivo" (not "Semanal") or the selector SHALL be fixed to only offer weekly views.

#### Scenario: Title matches selector
- **WHEN** the weekly sport summary card renders
- **THEN** the title SHALL NOT say "Semanal" if the selector offers non-weekly ranges
- **THEN** the title SHALL be "Resumen Deportivo" or the selector SHALL be limited to weekly ranges

### Requirement: Session comparison shows previous period value

The system SHALL display the previous-period session count value alongside the trend arrow in the session comparison strip, not just the arrow. The user SHALL see both the current value and the previous value for context.

#### Scenario: Previous value shown
- **WHEN** the session comparison strip renders with previous period data
- **THEN** the strip SHALL display the previous period's session count number
- **THEN** the trend arrow SHALL be accompanied by the numeric delta (e.g., "12 → 15 ▲")

## TBD

- Monthly and custom date range aggregation
- Export activity data as CSV
