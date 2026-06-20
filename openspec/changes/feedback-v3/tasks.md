## 1. Dashboard — New Health Metric Cards (HealthSync)

- [ ] 1.1 Add `health:getBloodPressure(from, to)` IPC handler — query HealthSync DB for systolic/diastolic with date range
- [ ] 1.2 Add `health:getBloodGlucose(from, to)` IPC handler — query HealthSync DB for glucose with date range
- [ ] 1.3 Add `health:getTimeInZones(from, to)` IPC handler — query HealthSync DB for HR zone duration
- [ ] 1.4 Add `health:getWalkingDistance(from, to)` IPC handler — query HealthSync DB for walking distance
- [ ] 1.5 Add `health:getStandingHours(from, to)` IPC handler — query HealthSync DB for standing hours
- [ ] 1.6 Add `health:getHrvStats(from, to)` IPC handler — query HealthSync DB for HRV stats with date range
- [ ] 1.7 Expose all new HealthSync IPC handlers in preload.js
- [ ] 1.8 Render blood pressure card with compliance indicator
- [ ] 1.9 Render blood glucose card with compliance indicator
- [ ] 1.10 Render time in zones card with zone breakdown and compliance
- [ ] 1.11 Render walking distance card with avg km/day
- [ ] 1.12 Render standing hours card with compliance indicator
- [ ] 1.13 Render compliance summary section
- [ ] 1.14 Add all new dashboard health metric strings to locales/es.js

## 2. Dashboard — Session-First Layout & Trend Chart

- [ ] 2.1 Restructure activity section: summary card (total sessions + total kcal) first, per-sport cards by session count desc
- [ ] 2.2 Add additional activity category cards: total sport hours, avg kcal/session, unique types
- [ ] 2.3 Add trend chart card (line chart with 7-day MA overlay) positioned right of main KPI grid
- [ ] 2.4 Ensure color differentiation via shared SPORT_ICONS utility

## 3. Dashboard — Weekly Balance, Weight, Steps & Resting HR

- [ ] 3.1 Split weekly balance card into basal (BMR) vs activity (sport+NEAT) with diet target reference
- [ ] 3.2 Add weight variation display: "±N kg" with trend arrow
- [ ] 3.3 Replace single steps card with three compact multi-period cards (7d/15d/1m) with trend arrows
- [ ] 3.4 Replace resting HR card with HRV + resting HR composite with trend
- [ ] 3.5 Add date range selector wiring if not already present
- [ ] 3.6 Add all new dashboard KPI strings to locales/es.js

## 4. Activity View — Weekly Sport Summary Fix & Period Selection

- [ ] 4.1 Investigate zero-duration bug: verify SQL column aliases, COALESCE, HealthSync duration_minutes data type
- [ ] 4.2 Fix `db:getWeeklySportSummary` — add COALESCE, ensure column names match frontend expectations
- [ ] 4.3 Add `db:getSportSummaryByRange(from, to)` — GROUP BY sport_type with count, avg_kcal, total_duration
- [ ] 4.4 Update sport summary chart to display session count, avg kcal, duration per sport type
- [ ] 4.5 Add date range selector to activity view for sport summary (not just hardcoded 7 days)

## 5. Activity View — Period Comparison & Ranking Table

- [ ] 5.1 Add `db:getActivityComparison(from, to)` IPC — current period + previous same-length period stats
- [ ] 5.2 Add period trend arrows to Total kcal column (toggle 15d/1m/3m)
- [ ] 5.3 Add mini sparkline canvas (60×18px) per sport type row for last-7-day kcal trend
- [ ] 5.4 Add duration column to ranking table
- [ ] 5.5 Expose new IPC handlers in preload.js
- [ ] 5.6 Add new activity strings to locales/es.js

## 6. Diet — 5-Column Meal Template UI

- [ ] 6.1 Create 5-column CSS grid layout for meal templates (Desayuno, Media Mañana, Comida, Merienda, Cena)
- [ ] 6.2 Query seeded meal_components + meal_options for each template
- [ ] 6.3 Render each column: meal name, slot types with training/rest day grams, clickable food options
- [ ] 6.4 Add "Usar estas 5 comidas" button to create daily_plan from selected options
- [ ] 6.5 Add all new diet template strings to locales/es.js

## 7. Diet — Curated Local Food DB with Auto-Fill

- [ ] 7.1 Create `src/renderer/data/food-db.json` with ~150 common Spanish foods (kcal, protein, carbs, fat per 100g, category)
- [ ] 7.2 Add auto-fill logic on food name blur: search curated DB, if match found populate macro fields
- [ ] 7.3 Handle partial name matches and no-match cases

## 8. Diet — Compact Food Display & Pagination

- [ ] 8.1 Replace food table with paginated version (20 items/page) with prev/next buttons and page counter
- [ ] 8.2 Add category pill filters (Pan/Prot/Gras/Frut/Verdu/Bebi) at top of food browser
- [ ] 8.3 Compact row format: name + kcal + P + C + F per 100g in single line
- [ ] 8.4 Add pagination and filter strings to locales/es.js

## 9. Diet — Daily Plan Auto-Generator

- [ ] 9.1 Add "Generar Plan Automático" button to daily plan section
- [ ] 9.2 Implement algorithm: read target kcal from energy balance, distribute across 5 meals, pick foods, compute grams
- [ ] 9.3 Create daily_plan_entries from generated plan
- [ ] 9.4 Handle missing energy balance target (prompt user to set deficit first)

## 10. Energy Balance — Recomp Detection & Adherence

- [ ] 10.1 Improve recomp detection card: show missing data guidance when <4 sets or missing metrics
- [ ] 10.2 Add weight vs waist line chart to recomp card when data is sufficient
- [ ] 10.3 Replace adherence text with visual gauge/progress bar
- [ ] 10.4 Add consistency score and specific recommendations
- [ ] 10.5 Add deficit impact display: compare current intake vs PDF baseline
- [ ] 10.6 Add all new energy balance strings to locales/es.js

## 11. Final Verification

- [ ] 11.1 Run app in dev mode — verify build passes
- [ ] 11.2 Verify all dashboard health metric cards render (data or empty state)
- [ ] 11.3 Verify session-first layout with trend chart
- [ ] 11.4 Verify weekly balance breakdown, weight variation, steps periods, HRV card
- [ ] 11.5 Verify activity chart shows correct non-zero duration
- [ ] 11.6 Verify activity period comparison arrows and sparklines
- [ ] 11.7 Verify 5-column meal template UI with selectable options
- [ ] 11.8 Verify auto-fill on food name entry
- [ ] 11.9 Verify pagination and category filters in food browser
- [ ] 11.10 Verify daily plan auto-generator creates entries
- [ ] 11.11 Verify recomp detection and adherence gauge in energy balance
- [ ] 11.12 Check no untranslated strings in modified views
