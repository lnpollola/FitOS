# Analytics Fixes

## ADDED Requirements

### Requirement: Fix _loadingAnalytics race condition

The system SHALL fix the `_loadingAnalytics` guard to properly block concurrent `loadAll()` calls. The flag SHALL be set synchronously before the async `loadAll()` call and cleared in a `finally` block after it completes. Rapid filter-button clicks SHALL NOT spawn multiple parallel `loadAll()` invocations.

#### Scenario: Concurrent loadAll blocked
- **WHEN** `loadAll()` is in progress and the user clicks another range filter
- **THEN** the guard SHALL detect `_loadingAnalytics === true` and return early
- **THEN** no second `loadAll()` SHALL be spawned

#### Scenario: Flag cleared after error
- **WHEN** `loadAll()` throws an exception
- **THEN** the `finally` block SHALL set `_loadingAnalytics = false`
- **THEN** subsequent range clicks SHALL be able to trigger `loadAll()` again

### Requirement: Fix NaN bpm KPI when days exist but lack heart rate data

The system SHALL guard against division by zero in the `avgHr` KPI computation. When `daily.length > 0` but no days have `hr_media`, the KPI SHALL display "--" instead of "NaN bpm".

#### Scenario: NaN prevented when HR data missing
- **WHEN** `daily.filter(d => d.hr_media).length === 0` but `daily.length > 0`
- **THEN** the avgHr KPI SHALL display "-- bpm" (not "NaN bpm")
- **THEN** the computation SHALL check the filtered count, not just `daily.length`

### Requirement: Theme-aware chart colors via chartColorWithAlpha

The system SHALL replace all hardcoded chart fill/background/tooltip colors in `analytics.js` with `chartColorWithAlpha()` calls from `chart-theme.js`. No hardcoded hex or rgba color values SHALL remain in the view. The `ACTIVITY_COLORS` array SHALL be derived from CSS custom properties.

#### Scenario: No hardcoded colors
- **WHEN** analytics.js renders any chart
- **THEN** all fill, background, and tooltip colors SHALL come from `chartColors` or `chartColorWithAlpha()`
- **THEN** no hardcoded `'rgba(...)'` or `'#...'` color strings SHALL be present in the source

#### Scenario: Organic theme consistency
- **WHEN** `body.organic` is active
- **THEN** analytics charts SHALL use the same moss/bone/ember palette as other views
- **THEN** fills and borders SHALL be visually consistent (no teal/indigo mismatch)

### Requirement: Chart destroy-before-recreate in all analytics render functions

The system SHALL move all `if (window._*Chart) ...destroy()` calls to the TOP of each chart render function, before the empty-data early-return. This applies to all 6 main charts, `renderMiniChart`, and `renderMiniDistanceChart`.

#### Scenario: Chart destroyed before empty-state
- **WHEN** any analytics chart render function is called with empty data
- **THEN** the function SHALL destroy the existing chart instance first
- **THEN** the function SHALL render the empty-state message and return

### Requirement: Top-level empty state when Apple Health never imported

The system SHALL display a top-level empty state banner in the analytics view when no HealthSync data has been imported. The banner SHALL explain that Apple Health import is required and include a CTA button to navigate to the Activity view.

#### Scenario: No Apple Health data banner
- **WHEN** all health metric IPC calls return empty or `{ ok: false }`
- **THEN** a banner SHALL appear at the top of the analytics view
- **THEN** the banner SHALL display "Importa tus datos de Apple Health para ver tendencias"
- **THEN** the banner SHALL include a button "Ir a Actividad" that navigates to the activity view

### Requirement: KPI cards with trend indicators

The system SHALL add period-over-period trend arrows to the 5 analytics KPI cards (avg steps, total energy, avg HR, avg sleep, avg HRV), consistent with the dashboard's pattern. The previous-period data (already fetched for the ranking table) SHALL be reused to compute deltas.

#### Scenario: KPI trend arrow renders
- **WHEN** a KPI card renders with current and previous period data
- **THEN** the card SHALL display a trend arrow (▲/▼/―) comparing current vs previous
- **THEN** the arrow SHALL use the same color coding as dashboard (green up, red down, gray flat)

### Requirement: Walking and cycling distance mini-cards with KPI stats

The system SHALL add current/avg/min/max KPI stats to the walking and cycling distance mini-cards, consistent with the other 5 secondary metric cards.

#### Scenario: Distance cards show stats
- **WHEN** the secondary metrics grid renders
- **THEN** the walking distance card SHALL show current, avg, min, and max km values
- **THEN** the cycling distance card SHALL show current, avg, min, and max km values

### Requirement: Custom date range validation

The system SHALL validate that `from <= to` in the custom date range selector. If the user enters a reversed range, a validation message SHALL appear and `loadAll()` SHALL NOT be called.

#### Scenario: Reversed range rejected
- **WHEN** the user sets `from` to a date later than `to` and clicks apply
- **THEN** the system SHALL display "La fecha de inicio debe ser anterior a la fecha final"
- **THEN** `loadAll()` SHALL NOT be called

### Requirement: Debounced custom date apply

The system SHALL debounce the custom date range apply button to prevent rapid multi-fire. A 300ms debounce SHALL be applied.

#### Scenario: Rapid clicks debounced
- **WHEN** the user clicks the apply button rapidly multiple times
- **THEN** only the last click SHALL trigger `loadAll()`
- **THEN** intermediate clicks SHALL be ignored
