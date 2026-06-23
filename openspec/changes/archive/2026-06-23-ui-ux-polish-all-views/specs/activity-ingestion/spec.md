# Activity Ingestion — Delta

## MODIFIED Requirements

### Requirement: View sport activity breakdown

The system SHALL display a composite ranking chart comparing sport types by session count and total calories, with period-over-period comparison (current vs previous period). The chart SHALL replace the previous duration+calories table format.

#### Scenario: Activity ranking chart with Spanish names
- **WHEN** a user views the activity view
- **THEN** the system SHALL display a grouped bar chart with columns: Tipo (Spanish name), Sesiones, kcal Totales
- **THEN** sport types SHALL be displayed in Spanish: cycling → Ciclismo, walking → Caminata, boxing → Boxeo, HIIT → HIIT, running → Carrera, football → Fútbol, paddle → Pádel, swimming → Natación, yoga → Yoga, strength → Fuerza, other → Otro

#### Scenario: Period comparison in ranking chart
- **WHEN** the ranking chart renders
- **THEN** each sport type SHALL show side-by-side bars for current and previous period
- **THEN** "Total kcal" SHALL include a trend arrow comparing vs previous period
- **THEN** the "kcal Promedio" per session SHALL be displayed for each sport type

#### Scenario: Remove duplicate duration column
- **WHEN** the sport table renders
- **THEN** the duplicate "Duración" column at the end SHALL be removed
- **THEN** the third column SHALL be "kcal/sesión" (average kcal per session)
- **THEN** the original "Duración (min)" column from position 3 SHALL become "kcal Promedio"

#### Scenario: Limited to 20 rows
- **WHEN** there are more than 20 sport type rows
- **THEN** the chart SHALL display only the top 20 sport types by session count

#### Scenario: Period comparison in ranking table
- **WHEN** the ranking table renders
- **THEN** "Total kcal" column SHALL include a trend arrow comparing vs previous period
- **THEN** clicking toggles between 7d, 15d, 1m windows

#### Scenario: Mini sparkline per sport type
- **WHEN** the ranking table renders
- **THEN** each row SHALL include a mini sparkline (60×18px) for last-7-day kcal trend

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

## ADDED Requirements

### Requirement: Composite ranking chart (frequency vs calories)

The system SHALL render a Chart.js grouped bar chart for sport type ranking that compares session count and total calories per sport type. Bars SHALL be ordered by session count descending.

#### Scenario: Grouped bars render with two datasets
- **WHEN** sport activity data exists for the period
- **THEN** a grouped bar chart SHALL render with "Sesiones" and "kcal Totales" datasets
- **THEN** each sport type SHALL have two adjacent bars (one per dataset)
- **THEN** sport types SHALL be ordered left-to-right by session count descending

#### Scenario: Period comparison via side-by-side groups
- **WHEN** previous period data exists
- **THEN** each sport type SHALL show two bar groups: current period and previous period
- **THEN** current period bars SHALL use full opacity, previous period SHALL use reduced opacity

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
