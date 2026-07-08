## 1. Bug Fixes — Backend

- [x] 1.1 Fix goal progress calculation for weight-type goals in `src/main/handlers/goals-handlers.js`: implement directional formula `(startWeight - current) / (startWeight - target)` for weight loss, `(current - startWeight) / (target - startWeight)` for weight gain. Get startWeight from first `weight_entry` at or before `startDate`. Return `progress_pct: 0` with note if no starting weight available.
- [x] 1.2 Fix recovery score double-inversion in `src/renderer/utils/kpi-derivation.js`: change `0.4 × hrvSub + 0.3 × (100 - rhrSub) + 0.3 × sleepSub` to `0.4 × hrvSub + 0.3 × rhrSub + 0.3 × sleepSub` in `recoveryScore()` function.
- [x] 1.3 Fix personal records sport mixing in `src/main/handlers/strava-panels-handlers.js`: separate PR queries by sport type, add cycling standard distances (10km, 50km, 100km), return sport-grouped records with sport_type field for tab filtering.
- [x] 1.4 Fix dashboard `onDataChanged` callback in `src/renderer/views/dashboard.js`: trigger full `render()` re-render instead of only re-mounting Strava panels, so goals summary, KPIs, hero, and sports sections all refresh.

## 2. Bug Fixes — Frontend CSS

- [x] 2.1 Fix relative effort delta contrast in `src/renderer/styles/cards.css`: add scoped rule `.strava-relative-effort .strava-relative-effort-delta, .strava-relative-effort .trend-up, .strava-relative-effort .trend-down, .strava-relative-effort .trend-flat { color: #fff; }` to ensure white delta text on gradient background.
- [x] 2.2 Fix recovery trend sparkline in `src/renderer/views/insights.js`: ensure the 7-day sparkline renders in chronological order (oldest left, newest right) and is not truncated.

## 3. Dashboard — KPI Card Redesign

- [x] 3.1 Redesign KPI card layout in `src/renderer/views/dashboard.js`: each card shows label + inline sparkline (60×20 px) on top row, main value below, period comparison text with arrows underneath. Remove large Chart.js sparklines from cards.
- [x] 3.2 Remove `#row-trend` section (daily kcal trend chart + weekly balance bar chart) from dashboard.js. Remove associated Chart.js chart creation code and `window._*Chart` globals.
- [x] 3.3 Remove "Calorías Hoy" card from dashboard row 2. Adjust grid to show 3 cards in row 2: Ejercicio, Caminata, Ciclismo.
- [x] 3.4 Add HRV/RHR info tooltips: add info icon (Lucide `info`) next to HRV and RHR labels with hover/click tooltip explaining each metric in Spanish. Add strings to `locales/es.js`.
- [x] 3.5 Add last weight display in hero card: query most recent `weight_entries` record, display value + date + source indicator as compact sub-element within the hero balance card. Show "Sin registros" if no data.

## 4. Dashboard — Energy Breakdown

- [x] 4.1 Add energy breakdown section to hero card in `src/renderer/views/dashboard.js`: compute total sport kcal (sum of `calories` from `sport_activities`), average daily basal kcal (from `kcal_basales` in `health_daily_summary`), render as horizontal stacked bar with labels "Calorías deporte" and "Calorías basales".
- [x] 4.2 Add energy breakdown strings to `src/renderer/locales/es.js`.

## 5. Dashboard — Personal Records Tabs

- [x] 5.1 Add sport tabs (Running / Ciclismo / Fuerza) to PR panel in `src/renderer/views/panels/strava-panels.js`: render tab buttons in header, filter displayed records by active tab, default to sport with most recent PR.
- [x] 5.2 Update PR modal ("Ver todos") to show only PRs for the active sport tab.
- [x] 5.3 Add tab-related strings to `locales/es.js`.

## 6. Dashboard — Combined Streak + Calendar Card

- [x] 6.1 Create `mountStreakCalendar(container)` function in `src/renderer/views/panels/strava-panels.js` that combines streak data (left column, ~30% width) and monthly calendar (right column, ~70% width) into a single card. Remove "Compartir racha" button.
- [x] 6.2 Update `src/renderer/views/dashboard.js` to use `mountStreakCalendar` instead of separate `mountStreak` and `mountMonthlyCalendar`. Remove separate streak and calendar containers.
- [x] 6.3 Add combined card CSS styles to `src/renderer/styles/cards.css`.

## 7. Dashboard — Auto-Insights

- [x] 7.1 Add auto-insights section to dashboard in `src/renderer/views/dashboard.js`: render 3-4 compact insight cards in a 2-column grid between Strava panels and hero card. Call `db:getAutoInsights` within the `Promise.allSettled` batch.
- [x] 7.2 Remove auto-insights section from `src/renderer/views/insights.js`: remove `#section-auto-insights` container and its rendering logic. Update `totalSections` count.
- [x] 7.3 Add compact auto-insight card CSS styles to `src/renderer/styles/cards.css`.

## 8. Dashboard — Data Refresh Fix

- [x] 8.1 Update `onDataChanged` callback in `src/renderer/views/dashboard.js` to call `render()` for full dashboard re-render instead of only re-mounting Strava panels. Ensure `_loadingDashboard` guard prevents concurrent renders.

## 9. Insights — Visual Redesign

- [x] 9.1 Update heatmap title to be dynamic based on selected period filter in `src/renderer/views/insights.js`: "Movimiento — últimos 3 meses" / "últimos 6 meses" / "último año".
- [x] 9.2 Redesign sport distribution layout: reduce donut to max 200px diameter on left, move metrics (sessions, minutes, share per sport) to right side. Use distinct colors per sport segment.
- [x] 9.3 Enhance day-of-week section: add KPIs below bar chart (best day, worst day, consistency indicator). Highlight best day with accent color.
- [x] 9.4 Remove weight velocity section (`#section-velocity`) and waist-to-hip ratio section (`#section-whr`) from `src/renderer/views/insights.js`. Keep IPC handlers available but don't render.
- [x] 9.5 Add recovery signal explanation tooltips to sub-meters in `src/renderer/views/insights.js`: HRV, RHR, Sleep each get info icon with Spanish explanation tooltip.
- [x] 9.6 Ensure all insights Chart.js charts use `chartColors` from CSS custom properties for consistent organic styling. Apply Fraunces font to section headers.
- [x] 9.7 Add dynamic title and tooltip strings to `locales/es.js`.

## 10. Analytics — Period-Aware Charts

- [x] 10.1 Move trend arrows next to KPI values in `src/renderer/views/analytics.js`: change layout so arrow appears on same line as value (flexbox row), not below on separate line.
- [x] 10.2 Implement period-aware data aggregation for all charts: create utility function that aggregates daily data into weekly (for 1m) or monthly (for 3m) buckets. Apply to all 6 main charts and 7 secondary mini-charts.
- [x] 10.3 Update X-axis labels for all charts: 7d → day names, 1m → ISO week labels, 3m → month names. Ensure ascending chronological order L→R.
- [x] 10.4 Add energy context KPIs above energy chart: average daily active kcal, average daily basal kcal, active/basal ratio percentage.
- [x] 10.5 Add aggregation utility functions to `src/renderer/utils/kpi-derivation.js` or a new `src/renderer/utils/period-aggregation.js`.

## 11. Goals — View Redesign

- [x] 11.1 Redesign goal cards layout in `src/renderer/views/goals.js`: horizontal layout with progress ring (72px) on left, details on right (label, progress value with unit, countdown, percentage bar). Arrange in responsive grid (2-3 columns desktop, 1 mobile).
- [x] 11.2 Update goal card CSS in `src/renderer/styles/cards.css` for horizontal layout and responsive grid.
- [x] 11.3 Update goal progress display to show directional info: "93.0 → 90.0 kg" format with correct percentage from fixed backend calculation.

## 12. Locale Strings

- [x] 12.1 Add all new strings to `src/renderer/locales/es.js`: HRV/RHR tooltips, energy breakdown labels, dynamic heatmap titles, recovery signal explanations, PR tab labels, combined streak+calendar labels, auto-insights dashboard section title, goal progress directional format.

## 13. Tests

- [x] 13.1 Add unit tests for goal progress directional calculation: weight loss, weight gain, no starting weight, distance (unchanged), frequency (unchanged).
- [x] 13.2 Add unit tests for recovery score fix: verify composite no longer double-inverts RHR. Test with known z-scores.
- [x] 13.3 Add unit tests for period aggregation utility: daily→weekly, daily→monthly bucketing.
- [x] 13.4 Update smoke tests for dashboard: verify goals card re-renders on data change, no "Calorías Hoy" card, no trend chart row, auto-insights section present.
- [x] 13.5 Update smoke tests for insights: verify no velocity/WHR sections, no auto-insights section, dynamic title changes.
- [x] 13.6 Run full test suite and verify all tests pass.

## 14. Verification

- [x] 14.1 Run `npm run dev` and verify dashboard: goals card updates, energy breakdown visible, last weight shown, KPI cards have inline sparklines, no "Calorías Hoy", no trend charts, PR tabs work, effort delta white, combined streak+calendar renders, auto-insights present.
- [x] 14.2 Run `npm run dev` and verify insights: dynamic title, compact donut, enhanced DOW, recovery tooltips, no velocity/WHR/auto-insights.
- [x] 14.3 Run `npm run dev` and verify analytics: arrows next to values, charts react to period, energy context KPIs.
- [x] 14.4 Run `npm run dev` and verify goals: horizontal card layout, correct progress percentage for weight loss goal.
- [x] 14.5 Run lint/typecheck if available.
