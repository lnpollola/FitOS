## Why

After fixing architecture and bugs in feedback-v2, the app is stable. The next layer of improvements targets real usage gaps: the dashboard lacks actionable health metrics and comparative context, the diet view needs pre-built meal columns from the PDF with a curated food DB and auto-generated daily plans, and the energy balance view needs clearer recomp detection and deficit impact display.

HealthSync data reality: blood glucose and heart rate zones are not available (Apple Watch doesn't measure glucose; zones would need runtime computation from HR). Blood pressure table exists but has zero records — users would need an external monitor. Standing hours, exercise time, HRV, walking distance, SpO2, and resting HR all have abundant data.

## What Changes

- **Dashboard — layout restructured**: Session count first with color differentiation; per-type activity categories with trend chart card; three-column metric grid
- **Dashboard — new health metric cards**: Standing hours, exercise time, walking distance, HRV + resting HR composite, SpO2 (data-backed). Blood pressure shown but always empty (no AW data). Compliance indicators where applicable
- **Dashboard — weekly balance breakdown**: Split total into basal vs activity calories; show target calories from diet plan
- **Dashboard — weight trend**: Weight variation over selected period with trend indicator
- **Dashboard — steps with period indicators**: Steps avg for 7d/15d/1m with trend arrows
- **Dashboard — resting HR + HRV composite**: Combined card with trend
- **Activity view — weekly sport summary chart fix**: Fix zero-duration bug (COALESCE + column alias)
- **Activity view — period comparison**: Period-over-period comparison for total calories column with trend arrows and mini sparkline per sport type
- **Diet — 5-column meal templates from PDF**: Visual columns for each meal with slot options, selectable to create a day plan
- **Diet — compact food display with pagination**: 20 items/page, category pill filters, compact row format
- **Diet — extended food seed data**: Expand seed food items from 46 to ~150 from a curated list; auto-fill on name entry searches the existing food_items table (no separate JSON DB)
- **Daily plan — auto-generation based on energy balance target**: Generate 5 meals adjusted to deficit/maintenance/surplus goal using macro ratios computed from seed data
- **Energy balance — recomp detection, adherence clarity, deficit impact**: Recomp status with missing-data guidance, adherence visual gauge, deficit comparison vs PDF baseline

## Capabilities

### New Capabilities
- `dashboard-health-metrics`: Health metric cards on dashboard using HealthSync data (standing hours, exercise time, walking distance, HRV, SpO2, resting HR). BP available but data-dependent (external monitor required)
- `trend-period-comparison`: Period-over-period comparison with trend arrows and sparklines across dashboard and activity views
- `daily-plan-auto-generator`: Auto-generate 5-meal daily plan based on energy balance target using seed-computed macro ratios

### Modified Capabilities
- `dashboard-enhancements`: Session-first layout, per-type activity categories with trend chart, weight variation, steps period indicators, HRV composite, weekly balance breakdown with basal/activity split and diet target
- `activity-ingestion`: Fix weekly sport summary chart zero-duration bug; add period-over-period calorie comparison with trends
- `diet-plan-management`: 5-column meal template UI from PDF with slot selection; compact food display with pagination and category filters; extended food seed data (~150 items); auto-fill from food_items table; daily plan auto-generator
- `energy-balance`: Recomp detection visibility; adherence evaluation clarity; deficit impact display vs PDF baseline

### Deferred to v4
- Measurements view: grid resize, top-5 history formatting, KPIs on charts, month-split weight trend

## Impact

- **Frontend**: Dashboard gets significant rework (new cards, reordered layout, trend charts). Diet view gets 5-column template UI, paginated food display, auto-generate daily plan. Energy balance view gets clearer recomp/adherence/deficit display.
- **Backend**: New IPC handlers for health metric aggregation from HealthSync, period-over-period comparisons, weekly balance breakdown, weight stats, daily plan generation.
- **HealthSync queries**: New queries for standing hours, exercise time, walking distance, SpO2. BP handler returns empty. No glucose or zone queries needed.
- **Food seed data**: Extended from 46 to ~150 items in seed-data.js. No separate JSON file.
- **Strings**: New locale strings for all new metrics, trend indicators, diet template UI, energy balance improvements.
