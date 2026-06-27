# Dashboard Health Metrics

## Purpose

Expose health metrics from HealthSync and the app database on the dashboard with a logical top-to-bottom flow: hero card (energy balance growth ring), two symmetric rows of health KPI cards, trend charts, and a sports section at the bottom with activity summary accent card and per-sport breakdown cards.

**Phased scope note:** This spec covers the dashboard's health-metrics layer. The Strava-style summary panels were introduced in the `panel-ux-ui-kpis-summarized` change (Phase 1, archived 2026-06-27) and are appended above the hero card without modifying the existing health-metrics grid. Subsequent phases — the `summary-insights-view` change (Phase 2), `strength-training-insights` (Phase 3), and `goals-tracker` (Phase 4) — add their own views and panels, each with their own specs. This spec evolves additively to declare new sections as they are introduced.

## ADDED Requirements

### Requirement: Insights view exists as a navigational companion to the dashboard

The dashboard SHALL navigate to a companion `insights` view (defined in the `insights-view` spec) when the user clicks the "Patrones" nav item in the INICIO sidebar section. The dashboard itself SHALL NOT link to the insights view from any dashboard section — the entry point is exclusively the sidebar nav. The dashboard's existing layout, panels, and behavior SHALL be unchanged by the addition of the insights view.

#### Scenario: Insights view exists in navigation
- **WHEN** the user opens the sidebar
- **THEN** the INICIO section SHALL contain three nav items: Panel, Patrones, Tendencias
- **WHEN** the user clicks "Patrones" from the dashboard
- **THEN** the insights view SHALL activate
- **THEN** the dashboard view SHALL be unmounted (no longer `active-view`)

#### Scenario: Dashboard is unaffected by insights view addition
- **WHEN** the `summary-insights-view` change is merged
- **THEN** the dashboard's layout, panels, and IPC calls SHALL be unchanged
- **THEN** the dashboard SHALL NOT import or reference the insights view
- **THEN** the dashboard SHALL continue to function identically for users who never click "Patrones"
