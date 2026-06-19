## Why

After the initial feedback-v0 implementation (Spanish UI, Apple Health import, elaborated dishes, workout plans) and the health-analytics Tendencias view, real usage has revealed UX friction points across Dashboard, Activity, Measurements, and Tendencias views. Charts render poorly, timelines lack formatting, Health import UX is misleading, and measurements need better defaults and trends. This change addresses all that.

## What Changes

- **Dashboard overhaul**: Add date range selector (7d/15d/1m), remove "calorías de hoy", refactor weekly balance to avg/day, add per-activity kcal cards (pádel, fútbol, HIIT, bicicleta, boxeo), show last data update timestamp
- **Activity view cleanup**: Remove CSV import and manual/sport activity entry entirely (data comes only from Apple Health import); improve Health import UX with last-import timestamp and re-import toggle; format timeline values (steps, active kcal with unit, resting kcal, HR with heart icon, sleep as hh:mm); add activity recognition table with Spanish names and rankings
- **Body measurements**: Default to last measured value in all selectors; use Spanish labels for body parts (currently shown in raw English like "chest", "neck"); format measurement history table; add trend indicators for all body variables
- **Tendencias (Health Analytics)**: Exercise recognition with icons; category rankings; trend arrows and totals; secondary metrics with axis values and KPI summary cards
- **Chart rendering fix**: Charts render oversized vertically and loop continuously because (a) canvas parents lack fixed CSS height, (b) charts are never destroyed on view exit, (c) onDataChanged re-triggers init() in a loop, (d) async race conditions on rapid re-init
- **Sport type display name registry**: Create a unified mapping function from DB sport_type → Spanish display name, used consistently across timeline, charts, and rankings; resolve inconsistency ("Caminata" vs "Caminar"); add missing types (running, swimming, yoga, strength) with icons
- **Missing string fixes**: Add body part names to es.js (pecho, cuello, hombros, bíceps, etc.); add `strings.energy.date` key; fix diet.js placeholder "e.g. Quinoa Burger"

## Capabilities

### New Capabilities
- `dashboard-enhancements`: Dashboard date range selector, per-activity kcal cards, last-update indicator, refactored weekly balance to avg/day, remove current-day calories card

### Modified Capabilities
- `activity-ingestion`: Remove CSV import and manual entry UI; improve Apple Health import UX with last-import state and re-import toggle; format timeline values with icons and units; add activity recognition table with Spanish names and sorting
- `body-measurements`: Default to last measured value; Spanish labels; formatted history table; trend indicators for all measurement variables
- `health-analytics`: Exercise recognition with icons; activity category rankings; trend indicators and totals; secondary metrics with axis values and KPI summary cards

## Impact

- **Frontend**: Dashboard, Activity, Measurements, and Tendencias views all get significant changes
- **Backend**: New or modified IPC handlers for per-activity kcal queries, last-import timestamp, measurement trends
- **Charts**: Chart.js rendering fixes applied globally (responsive sizing)
- **Strings**: New strings for dashboard KPIs, activity recognition, measurement labels, trend indicators
- **Removals**: CSV import UI, manual activity entry form, sport activity manual entry — all removed from Activity view
