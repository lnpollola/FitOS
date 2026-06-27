## Why

The app already captures detailed strength training data — 53 seeded exercises, sets with load/reps/RPE, and 5 workout plans — but only surfaces tonnage per session and a basic strength maintenance boolean. Users doing strength training cannot see estimated 1RM progression, personal records by exercise, volume PRs, plateau detection, or a strength score. This is the most common request from strength athletes and the next logical step in the training feature set.

## What Changes

- **Estimated 1RM per exercise set** using the Epley formula (`load × (1 + reps / 30)`)
- **Personal records per exercise**: best estimated 1RM all-time, with rank indicator (1st/2nd/3rd)
- **Volume PR per session**: highest tonnage session all-time, with exercise breakdown
- **Plateau detector**: exercises with no new 1RM PR in ≥4 weeks, surfaced as an alert card
- **Strength score per muscle group**: aggregated estimated 1RM weighted by bilateral factor
- **Tonnage weekly trend**: total tonnage per ISO week, as a Chart.js bar chart
- **New section in Insights view**: all strength KPIs rendered below existing health metrics, with a section heading

No breaking changes. No schema changes. All derived from existing `training_sets`, `training_sessions`, and `exercise_library` tables.

## Capabilities

### New Capabilities
- `strength-personal-records`: Estimated 1RM per exercise (Epley), best-ever PR detection with rank, volume PR per session
- `strength-plateau-detector`: Exercises with no 1RM improvement in ≥4 weeks, surfaced as actionable alert
- `strength-score`: Per-muscle-group strength score computed from bilateral-weighted 1RM estimates, with overall composite
- `strength-weekly-tonnage`: Weekly tonnage bar chart with period-over-period comparison

### Modified Capabilities
- `strength-training`: extend requirement about progression tracking to include section in insights view; add requirement for 1RM estimation as a derived metric displayed alongside existing progression data
- `summary-insights-view`: add a new strength section to the insights view layout between recovery and weight velocity

## Impact

- **New IPC handlers**: `db:getStrengthPersonalRecords`, `db:getStrengthPlateau`, `db:getStrengthScore`, `db:getWeeklyTonnage`
- **New preload API methods**: matching the 4 new handlers
- **New renderer module**: `src/renderer/views/panels/strength-insights-panels.js` for mount functions and HTML templates
- **New utility additions**: `src/renderer/utils/strength-derivation.js` for pure functions (epley1RM, detectPlateau, strengthScore)
- **Modified views**: `insights.js` gets a new `<section>` block
- **New locale strings**: `strings.strengthInsights.*` in `src/renderer/locales/es.js`
- **New CSS**: `.strength-*` classes in `src/renderer/styles/cards.css`
- **New tests**: unit tests for `strength-derivation.js`, smoke tests for the panels module
- **No new dependencies, no schema changes**
