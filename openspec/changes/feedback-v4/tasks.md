## 1. Fix Hardcoded Strings in Activity View

- [ ] 1.1 Add new locale keys to `locales/es.js` for HealthSync status messages and import error
- [ ] 1.2 Replace hardcoded timeline table headers in `activity.js:265` with locale key references
- [ ] 1.3 Replace hardcoded HealthSync status messages (`'HealthSync no instalado'`, `'HealthSync disponible'`) with locale keys
- [ ] 1.4 Replace hardcoded import error message with locale key

## 2. Measurements — Compact Chart Cards with KPI Overlays

- [ ] 2.1 Reduce individual metric chart height from 200px to 140px in `measurements.js`
- [ ] 2.2 Add KPI overlay rendering (current value + delta) positioned absolutely on each chart card
- [ ] 2.3 Handle single-measurement case (show value without delta)
- [ ] 2.4 Add new measurement UI strings to `locales/es.js`

## 3. Measurements — Top-5 History Table

- [ ] 3.1 Limit history table to 5 most recent entries by default
- [ ] 3.2 Add "Ver todo" / "Mostrar menos" toggle button
- [ ] 3.3 Add toggle strings to `locales/es.js`

## 4. Measurements — Monthly Weight Trend Split

- [ ] 4.1 Group weight chart data by calendar month segments
- [ ] 4.2 Add month-over-month KPI display (avg weight per month, delta from previous month)

## 5. Measurements — Chest/Neck/Shoulders Combined Chart

- [ ] 5.1 Add combined multi-line chart card for chest, neck, shoulders metrics
- [ ] 5.2 Render per-metric KPI overlay (current value for each)
- [ ] 5.3 Add trendline overlay to combined chart

## 6. Measurements — Before/After Formatting

- [ ] 6.1 Extract shared delta formatting logic into a helper function
- [ ] 6.2 Apply consistent color-coding to before/after comparison table
- [ ] 6.3 Ensure before/after table renders on all screen sizes

## 7. Final Verification

- [ ] 7.1 Run build — verify passes
- [ ] 7.2 Verify hardcoded strings replaced in activity view
- [ ] 7.3 Verify compact chart cards render with KPIs
- [ ] 7.4 Verify top-5 history with expand toggle
- [ ] 7.5 Verify monthly weight chart split
- [ ] 7.6 Verify chest/neck/shoulders combined chart
- [ ] 7.7 Verify before/after formatting
- [ ] 7.8 Check no untranslated strings in modified views
