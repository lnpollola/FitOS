## Why

Fix hardcoded strings identified during feedback-v3 final verification and implement deferred measurements view improvements from v3 scope.

## What Changes

- Replace hardcoded Spanish strings in activity view with locale key references
- Restructure measurements view: compact card grid, top-5 history, KPIs on charts, weight trend split by months, chest/neck/shoulders chart trends with trendline and KPIs, before/after formatting improvements
- Add any additional HealthSync metrics not covered in v3 (if feasible)

## Capabilities

### New Capabilities
- `measurements-revamp`: Compact card grid layout, top-5 history entries, KPI overlays on chart.js charts, monthly weight trend split, chest/neck/shoulders multi-chart with trendline and KPIs, improved before/after formatting

### Modified Capabilities
- `spanish-ui`: Replace hardcoded Spanish strings in activity view table headers and HealthSync status messages with locale keys
- `body-measurements`: Measurements view layout and visualization overhaul

## Impact

- `src/renderer/views/activity.js`: Replace hardcoded strings with `strings.activity.*` references
- `src/renderer/views/measurements.js`: Full restructure — grid layout, top-5 history, chart KPIs, monthly weight split, multi-chart, before/after improvements
- `src/renderer/locales/es.js`: Add new measurement view strings if needed
- `src/renderer/styles/main.css`: Add new grid/chart overlay styles for measurements
