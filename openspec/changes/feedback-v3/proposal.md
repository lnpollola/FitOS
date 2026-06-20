## Why

After fixing architecture and bugs in feedback-v2, the app is stable. The next layer of improvements targets real usage gaps: the dashboard lacks actionable health metrics and comparative context, the diet view needs pre-built meal columns from the PDF with a curated food DB and auto-generated daily plans, and the energy balance view needs clearer recomp detection and deficit impact display.

## What Changes

- **Dashboard — new health metric cards**: Add blood pressure, blood glucose, time in zones, walking distance, standing hours, and compliance indicators using HealthSync data
- **Dashboard — session-first layout**: Reorder activity cards to show session count first with color differentiation; add per-type activity categories with trend chart card
- **Dashboard — weekly balance breakdown**: Split total into basal vs activity calories; show target calories from diet plan
- **Dashboard — weight trend**: Add approximate weight variation over selected period with trend indicator
- **Dashboard — steps with period indicators**: Show steps avg for 7d/15d/1m with trend arrows; replace single "Pasos Promedio" card
- **Dashboard — resting HR metric**: Replace generic FC en Reposo with HRV + resting HR composite including trends
- **Activity view — weekly sport summary chart fix**: Fix "Deporte - Tipo" chart to show session count, avg kcal, duration, types (currently shows zero duration); investigate DB/query variable bug
- **Activity view — period comparison**: Add period-over-period comparison for total calories column with trend arrows and mini sparkline
- **Diet — 5-column meal templates from PDF**: Visual columns for each meal with slot options, selectable to create a day plan; compact food display with pagination; curated local food DB with auto-fill on name entry
- **Daily plan — auto-generation based on energy balance target**: Generate 5 meals adjusted to the deficit/maintenance/surplus goal
- **Energy balance — recomp detection, adherence clarity, deficit impact**: Show recomp status clearly, make adherence evaluation user-friendly, display how deficit impacts based on the PDF diet baseline

## Capabilities

### New Capabilities
- `dashboard-health-metrics`: Health metric cards on dashboard using HealthSync data (blood pressure, glucose, time in zones, walking distance, standing hours, compliance indicators)
- `trend-period-comparison`: Period-over-period comparison with trend arrows and sparklines across dashboard and activity views
- `curated-food-db`: Local curated food database with auto-fill on name entry
- `daily-plan-auto-generator`: Auto-generate 5-meal daily plan based on energy balance target

### Modified Capabilities
- `dashboard-enhancements`: Session-first layout, per-type activity categories with trend chart, weight variation, steps period indicators, HRV composite, weekly balance breakdown with basal/activity split and diet target
- `activity-ingestion`: Fix weekly sport summary chart zero-duration bug; add period-over-period calorie comparison with trends
- `diet-plan-management`: 5-column meal template UI from PDF with slot selection; compact food display with pagination and category filters; daily plan auto-generator
- `energy-balance`: Recomp detection visibility; adherence evaluation clarity; deficit impact display vs PDF baseline

## Impact

- **Frontend**: Dashboard gets significant rework (new cards, reordered layout, trend charts). Diet view gets 5-column template UI, paginated food display, auto-generate daily plan. Energy balance view gets clearer recomp/adherence/deficit display.
- **Backend**: New IPC handlers for health metric aggregation from HealthSync, period-over-period comparisons, weekly balance breakdown, curated food DB lookup, daily plan generation.
- **HealthSync queries**: New or extended queries for blood pressure, glucose, time in zones, walking distance, standing hours
- **Strings**: New locale strings for all new metrics, trend indicators, diet template UI, energy balance improvements.
