## 1. Dashboard — New Health Metric Cards (HealthSync)

- [x] 1.1 Add `health:getBloodPressure(from, to)` IPC handler — query HealthSync blood_pressure table (WILL BE EMPTY — AW doesn't measure BP; card shows "-- / --")
- [x] 1.2 Add `health:getStandingHours(from, to)` IPC handler — query HealthSync stand_hours avg/day
- [x] 1.3 Add `health:getExerciseTime(from, to)` IPC handler — query HealthSync exercise_time avg min/day
- [x] 1.4 Add `health:getWalkingDistance(from, to)` IPC handler — query HealthSync distance_walking_running avg km/day
- [x] 1.5 Add `health:getSpO2Range(from, to)` IPC handler — query HealthSync spo2 table for latest SpO2
- [x] 1.6 Add batched `health:getDashboardMetrics(from, to)` handler returning all health metrics in one call
- [x] 1.7 Expose all new HealthSync IPC handlers in preload.js
- [x] 1.8 Render blood pressure card (always empty state: "-- / --" + note "Requiere monitor externo")
- [x] 1.9 Render standing hours card with compliance indicator
- [x] 1.10 Render exercise time card with compliance indicator
- [x] 1.11 Render walking distance card with avg km/day
- [x] 1.12 Render SpO2 card with compliance indicator
- [x] 1.13 Add all new dashboard health metric strings to locales/es.js

**Note**: blood_glucose and heart rate zones are NOT in scope. AW doesn't measure glucose. No pre-computed HR zone table exists in HealthSync.

## 2. Dashboard — Session-First Layout & Trend Chart

- [x] 2.1 Restructure activity section: summary card (total sessions + total kcal) first, per-sport cards by session count desc
- [x] 2.2 Add additional activity category cards: total sport hours, avg kcal/session, unique types
- [x] 2.3 Add trend chart card (line chart with 7-day MA overlay) positioned right of main KPI grid
- [x] 2.4 Ensure color differentiation via shared SPORT_ICONS utility
- [x] 2.5 Restructure dashboard grid: Row 1 = 6 metric cards, Row 2 = 3 steps period cards, Row 3 = trend chart, Row 4 = activity per-sport

## 3. Dashboard — Weekly Balance, Weight, Steps & Resting HR + HRV

- [x] 3.1 Split weekly balance card into basal (BMR) vs activity (sport+NEAT) with diet target reference
- [x] 3.2 Add `db:getWeightStats(from, to)` IPC handler returning { first, last, min, max, avg, trend }
- [x] 3.3 Add weight variation display: "±N kg" with trend arrow
- [x] 3.4 Replace single steps card with three compact multi-period cards (7d/15d/1m) with trend arrows
- [x] 3.5 Replace resting HR card with HRV + resting HR composite with trend (uses existing health:getHeartRateDaily + health:getHRVRange)
- [x] 3.6 Add date range selector wiring (7d/15d/1m) to dashboard render loop
- [x] 3.7 Add all new dashboard KPI strings to locales/es.js

## 4. Activity View — Weekly Sport Summary Fix & Period Selection

- [x] 4.1 Investigate zero-duration bug: verify HealthSync import populates duration_minutes in sport_activities; check migrateHealthData for missing duration mapping
- [x] 4.2 Fix `migrateHealthData` to populate `duration_minutes` from HealthSync workout data
- [x] 4.3 Add `db:getSportSummaryByRange(from, to)` — GROUP BY sport_type with count, avg_kcal, total_duration (COALESCE)
- [x] 4.4 Update sport summary chart to display session count, avg kcal, duration per sport type
- [x] 4.5 Add date range selector to activity view for sport summary

## 5. Activity View — Period Comparison & Ranking Table

- [x] 5.1 Add `db:getActivityComparison(from, to)` IPC — current period + previous same-length period stats
- [x] 5.2 Add period trend arrows to Total kcal column (toggle 15d/1m/3m)
- [x] 5.3 Add mini sparkline canvas (60×18px) per sport type row for last-7-day kcal trend
- [x] 5.4 Add duration column to ranking table
- [x] 5.5 Expose new IPC handlers in preload.js
- [x] 5.6 Add new activity strings to locales/es.js

## 6. Diet — 5-Column Meal Template UI

- [x] 6.1 Create 5-column CSS grid layout for meal templates (Desayuno, Media Mañana, Comida, Merienda, Cena)
- [x] 6.2 Query seeded meal_components + meal_options for each template
- [x] 6.3 Render each column: meal name, slot types with training/rest day grams, clickable food options
- [x] 6.4 Add "Usar estas 5 comidas" button to create daily_plan from selected options
- [x] 6.5 Add all new diet template strings to locales/es.js

## 7. Diet — Extended Food Seed Data & Auto-Fill

- [x] 7.1 Extend `FOOD_ITEMS` in seed-data.js from 46 to ~150 items sourced from BEDCA/USDA references (categories: breads, proteins, fats, fruits, vegetables, drinks, dairy, legumes, sauces/condiments)
- [x] 7.2 Add `db:searchFoodItems(query)` IPC handler — returns top-5 matches by name LIKE
- [x] 7.3 Add auto-fill logic on food name blur: call db:searchFoodItems, if match found populate macro fields
- [x] 7.4 Handle partial name matches and no-match cases ("Sin coincidencias — completa los macros manualmente")

**Note**: No separate JSON food DB. All food data lives in SQLite food_items table. The existing app DB seed is extended.

## 8. Diet — Compact Food Display & Pagination

- [x] 8.1 Replace food card grid with paginated table (20 items/page) with prev/next buttons and page counter
- [x] 8.2 Add category pill filters (Pan/Prot/Gras/Frut/Verdu/Bebi) at top of food browser
- [x] 8.3 Compact row format: name + kcal + P + C + F per 100g in single line
- [x] 8.4 Add pagination and filter strings to locales/es.js

## 9. Diet — Daily Plan Auto-Generator

- [x] 9.1 Add "Generar Plan Automático" button to daily plan section
- [x] 9.2 Implement algorithm: read target kcal from energy balance, compute meal ratios from seed data (aggregate meal_components.default_grams × food_items.kcal_per_100g per meal_template_id), distribute across 5 meals, pick foods, compute grams
- [x] 9.3 Create daily_plan_entries from generated plan (display for review, not auto-save)
- [x] 9.4 Handle missing energy balance target (prompt user to set deficit first)

## 10. Energy Balance — Recomp Detection & Adherence

- [x] 10.1 Improve recomp detection card: show missing data guidance when <4 sets or missing metrics
- [x] 10.2 Add weight vs waist line chart to recomp card when data is sufficient
- [x] 10.3 Replace adherence text with visual gauge/progress bar
- [x] 10.4 Add consistency score and specific recommendations
- [x] 10.5 Add deficit impact display: compare current intake vs PDF baseline (computed from seed meal_components.default_grams)
- [x] 10.6 Add all new energy balance strings to locales/es.js

## 11. Final Verification

- [ ] 11.1 Run app in dev mode — verify build passes
- [ ] 11.2 Verify all dashboard health metric cards render (standing hours, exercise time, walking distance, SpO2, HRV+RHR, BP empty state)
- [ ] 11.3 Verify session-first layout with trend chart
- [ ] 11.4 Verify weekly balance breakdown, weight variation, steps periods, HRV card
- [ ] 11.5 Verify activity chart shows correct non-zero duration
- [ ] 11.6 Verify activity period comparison arrows and sparklines
- [ ] 11.7 Verify 5-column meal template UI with selectable options
- [ ] 11.8 Verify auto-fill on food name entry (searches food_items, not JSON)
- [ ] 11.9 Verify pagination and category filters in food browser
- [ ] 11.10 Verify daily plan auto-generator creates entries
- [ ] 11.11 Verify recomp detection and adherence gauge in energy balance
- [ ] 11.12 Check no untranslated strings in modified views

## Deferred to v4

- Measurements view: grid smaller cards, top-5 history only, KPIs rendered directly on charts, weight trend split by months, chest/neck/shoulders chart trends with trendline and KPIs, before/after formatting improvements
- Any additional HealthSync metrics not in v3 scope
