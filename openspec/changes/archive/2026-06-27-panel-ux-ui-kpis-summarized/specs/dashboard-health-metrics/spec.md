# Dashboard Health Metrics

## Purpose

Expose health metrics from HealthSync and the app database on the dashboard with a logical top-to-bottom flow: hero card (energy balance growth ring), two symmetric rows of health KPI cards, trend charts, and a sports section at the bottom with activity summary accent card and per-sport breakdown cards.

**Phased scope note:** This spec covers the dashboard's health-metrics layer. The Strava-style summary panels are introduced in the `panel-ux-ui-kpis-summarized` change (Phase 1) and are appended above the hero card without modifying the existing health-metrics grid. Subsequent phases — the `summary-insights-view` change (Phase 2), `strength-training-insights` (Phase 3), and `goals-tracker` (Phase 4) — will add their own views and panels, each with their own specs. This spec evolves additively to declare new sections as they are introduced.

## ADDED Requirements

### Requirement: Strava-style summary panels block

The dashboard SHALL display a new "Strava-style summary panels" block at the top of the view, above the existing hero card. The block SHALL contain, in order: (1) a full-width personal-record banner, (2) a 2-column row with the weekly-goal ring card and the relative-effort card, (3) a full-width training-log bubble chart, and (4) a streak header followed by a monthly activity calendar. The block SHALL be visually distinct from the existing health-metrics grid via a subtle separator (e.g., a labeled section header "RESUMEN" or a horizontal rule). All five panels SHALL render concurrently via `Promise.allSettled` and SHALL show skeleton loading states during the IPC round-trips.

#### Scenario: Strava block renders first
- **WHEN** the dashboard renders
- **THEN** the personal-record banner SHALL appear at the very top of the view, spanning the full content width
- **THEN** the 2-column row (weekly goal + relative effort) SHALL appear directly below the banner
- **THEN** the training-log bubble chart SHALL appear below the 2-column row
- **THEN** the streak header + monthly calendar SHALL appear below the training-log chart
- **THEN** the existing hero card (energy balance growth ring) SHALL appear AFTER the Strava block

#### Scenario: Concurrent IPC loading
- **WHEN** the dashboard mounts
- **THEN** the system SHALL issue 6 IPC calls concurrently: `db:getPersonalRecords`, `db:getWeeklyGoal`, `db:getRelativeEffort`, `db:getTrainingLogWeek`, `db:getMonthlyCalendar`, `db:getStreak`
- **THEN** each panel SHALL display a skeleton loading state during its IPC call
- **THEN** panels SHALL stream in as their IPC calls resolve (not block on all-settled)

#### Scenario: Date range selector does not gate Strava panels
- **WHEN** the user changes the date range selector (7d / 15d / 1m)
- **THEN** the existing health-metrics grid SHALL update to reflect the new range
- **THEN** the Strava panels SHALL NOT change (they always show current week / current month)
- **THEN** a subtle "Esta semana" / "Este mes" label SHALL be present on each panel to clarify the time window

#### Scenario: Panel re-render on data change
- **WHEN** the user adds a new `sport_activities` record from any view
- **THEN** the dashboard SHALL receive a `data-changed` event
- **THEN** the Strava panels SHALL re-fetch their data and re-render
- **THEN** the change SHALL be visible without a full view reload

### Requirement: Strava block error handling

If any of the 6 IPC calls in the Strava block fails, the corresponding panel SHALL render the error state via `renderStateCard(container, { state: 'error', onRetry })`. The other 5 panels SHALL continue to render normally. A single panel failure SHALL NOT prevent the rest of the dashboard from rendering.

#### Scenario: Single panel error
- **WHEN** `db:getPersonalRecords` throws an error
- **THEN** the PR banner SHALL display the error state with a "Reintentar" button
- **THEN** the other 5 panels SHALL render with their data
- **THEN** the rest of the dashboard (health metrics, sports) SHALL render normally

#### Scenario: All panels error
- **WHEN** all 6 IPC calls fail (e.g., DB connection lost)
- **THEN** each panel SHALL display its error state
- **THEN** the existing health-metrics grid SHALL also display error states
- **THEN** the user SHALL see consistent "Reintentar" affordances across the dashboard
