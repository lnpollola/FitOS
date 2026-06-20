## 1. Fix Hardcoded Strings in Activity View

- [x] 1.1 Add new locale keys to `locales/es.js` for HealthSync status messages and import error
- [x] 1.2 Replace hardcoded timeline table headers in `activity.js:265` with locale key references
- [x] 1.3 Replace hardcoded HealthSync status messages (`'HealthSync no instalado'`, `'HealthSync disponible'`) with locale keys
- [x] 1.4 Replace hardcoded import error message with locale key

## 2. Measurements — Compact Chart Cards with KPI Overlays

- [x] 2.1 Reduce individual metric chart height from 200px to 140px in `measurements.js`
- [x] 2.2 Add KPI overlay rendering (current value + delta) positioned absolutely on each chart card
- [x] 2.3 Handle single-measurement case (show value without delta)
- [x] 2.4 Add new measurement UI strings to `locales/es.js`

## 3. Measurements — Top-5 History Table

- [x] 3.1 Limit history table to 5 most recent entries by default
- [x] 3.2 Add "Ver todo" / "Mostrar menos" toggle button
- [x] 3.3 Add toggle strings to `locales/es.js`

## 4. Measurements — Monthly Weight Trend Split

- [x] 4.1 Group weight chart data by calendar month segments
- [x] 4.2 Add month-over-month KPI display (avg weight per month, delta from previous month)

## 5. Measurements — Chest/Neck/Shoulders Combined Chart

- [x] 5.1 Add combined multi-line chart card for chest, neck, shoulders metrics
- [x] 5.2 Render per-metric KPI overlay (current value for each)
- [x] 5.3 Add trendline overlay to combined chart

## 6. Measurements — Before/After Formatting

- [x] 6.1 Extract shared delta formatting logic into a helper function
- [x] 6.2 Apply consistent color-coding to before/after comparison table
- [x] 6.3 Ensure before/after table renders on all screen sizes

## 7. Final Verification

- [x] 7.1 Run build — verify passes
- [x] 7.2 Verify hardcoded strings replaced in activity view
- [x] 7.3 Verify compact chart cards render with KPIs
- [x] 7.4 Verify top-5 history with expand toggle
- [x] 7.5 Verify monthly weight chart split
- [x] 7.6 Verify chest/neck/shoulders combined chart
- [x] 7.7 Verify before/after formatting
- [x] 7.8 Check no untranslated strings in modified views
