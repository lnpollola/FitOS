## ADDED Requirements

### Requirement: Auto-insights displayed on dashboard

The dashboard SHALL render an auto-insights section containing 3-4 compact insight cards in a multi-column grid layout (2×2 grid). Each insight card SHALL be smaller than the current insights view cards, showing: severity icon, insight text, and severity chip. The section SHALL appear between the Strava panels block and the hero card.

#### Scenario: Auto-insights render on dashboard
- **WHEN** the dashboard loads and auto-insight data is available
- **THEN** a section with 3-4 insight cards SHALL render in a 2-column grid
- **THEN** each card SHALL show: severity icon (Lucide), insight text (truncated to 2 lines), and severity chip
- **THEN** cards SHALL be compact (smaller padding, smaller font than insights view)

#### Scenario: Auto-insights removed from insights view
- **WHEN** the insights view (Patrones) renders
- **THEN** no auto-insights section SHALL appear
- **THEN** the `#section-auto-insights` container SHALL NOT exist in the insights view DOM

#### Scenario: Auto-insights data loading
- **WHEN** the dashboard mounts
- **THEN** `db:getAutoInsights` SHALL be called within the dashboard's `Promise.allSettled` batch
- **THEN** IPC failure SHALL NOT break the dashboard; the section SHALL render empty

#### Scenario: Minimum insight count
- **WHEN** fewer than 3 insights are generated
- **THEN** the section SHALL display only the available insights (1-2)
- **THEN** the grid SHALL NOT show empty placeholder cards
