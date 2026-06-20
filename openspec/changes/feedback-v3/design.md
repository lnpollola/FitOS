## Context

feedback-v2 fixed critical architecture issues (orphaned energy.js merged into adaptive.js, broken recalcTotals, export/import data loss, populated meal_components from the PDF, shared utilities extracted, delete handlers added). The app is now stable. This change (feedback-v3) adds the feature layer: richer dashboard, complete diet workflow, and clearer energy balance.

## Goals / Non-Goals

**Goals:**
- Add HealthSync metric cards to Dashboard: blood pressure, blood glucose, time in zones, walking distance, standing hours, compliance indicators
- Restructure Dashboard activity section: session count first, per-type categories with trend chart card
- Split weekly balance into basal vs activity components; show diet target
- Add weight variation with trend indicator over selected period
- Replace single steps card with 7d/15d/1m period indicators and trend arrows
- Replace generic "FC en Reposo" with HRV + resting HR composite
- Fix weekly sport summary chart zero-duration bug in Activity view
- Add period-over-period calorie comparison with trend arrows in Activity view
- Add 5-column meal template UI from PDF with slot selection
- Add compact food display with pagination and category filters
- Add curated local food DB with auto-fill on name entry
- Add daily plan auto-generator based on energy balance target
- Improve energy balance: recomp detection visibility, adherence clarity, deficit impact vs PDF baseline

**Non-Goals:**
- No new database tables in the app DB (all metrics from HealthSync; diet data uses existing tables)
- No changes to Training or Profile views
- No changes to the HealthSync CLI or import process

## Decisions

1. **Dashboard health metrics: HealthSync IPC handlers, not app DB**
   HealthSync DB already stores blood pressure, glucose, time in zones, walking distance, standing hours. New IPC handlers `health:getBloodPressure`, `health:getBloodGlucose`, `health:getTimeInZones`, `health:getWalkingDistance`, `health:getStandingHours` query HealthSync DB with date range filters. No app DB schema changes needed. Compliance thresholds hardcoded in frontend.

2. **Dashboard layout restructure: flex grid with explicit ordering**
   Use CSS `order` property to place session count card first. Preserve color differentiation via shared `SPORT_ICONS` utility (extracted in feedback-v2). Add trend chart card rendered with Chart.js (line chart, 200px height, 7-day MA).

3. **Weekly balance breakdown: compute from existing data sources**
   Basal = BMR from profile. Activity = sport + NEAT. Diet target = sum of daily_plan_entries. Three values computed from `db:getDashboardData`. Split `weekBalance` into `{ basalTotal, activityTotal, dietTarget }`, render as segmented display.

4. **Weight variation: new IPC db:getWeightStats**
   `db:getWeightStats(from, to)` returns `{ first, last, min, max, avg, trend }`. Dashboard shows `last - first` as variation with linear regression slope for trend.

5. **Steps multi-period: three mini-cards**
   Replace single `dailySteps` card with three compact cards (7d, 15d, 1m). Each queries steps average from HealthSync. Arrow compares against previous same-length period.

6. **HRV + resting HR composite**
   Replace "FC en Reposo" with card showing: latest HRV (SDNN), latest resting HR (bpm), 7d averages, trend arrow. Uses existing `health:getHeartRateDaily` and new `health:getHrvStats`.

7. **Weekly sport summary zero-duration fix**
   Inspect `db:getWeeklySportSummary` handler: verify SQL column aliases match frontend expected keys. Add `COALESCE(duration_minutes, 0)` to prevent NULL → 0. Add `db:getSportSummaryByRange(from, to)` supporting arbitrary periods.

8. **Period comparison: new IPC with offset aggregation**
   `db:getActivityComparison(from, to)` returns current period stats AND previous same-length period stats. Frontend renders arrows + sparklines.

9. **5-column meal template UI**
   After feedback-v2 seeded `meal_components` + `meal_options`, the data exists. Create a new UI section showing 5 columns (Desayuno, Media Mañana, Comida, Merienda, Cena), each column showing slot breakdown with food options. User can select options per slot and click "Usar estas 5 comidas" to create a daily plan. Rendered as a CSS grid with `grid-template-columns: repeat(5, 1fr)`.

10. **Curated local food DB**
    Create a curated JSON file `src/renderer/data/food-db.json` with ~150 common Spanish foods (name, kcal, protein, carbs, fat per 100g, category). On food name entry in diet.js, search the curated DB for matches. If found, auto-fill the macro fields. No external API calls needed. The data is bundled with the app.

11. **Compact food display with pagination**
    Current food list renders all items in a table. Replace with a paginated table (20 per page), category pills/tabs at the top for quick filtering, and compact rows showing name + kcal + macros per 100g in a single line.

12. **Daily plan auto-generator**
    New algorithm: (a) get target daily calories from energy balance (deficit goal). (b) allocate calories across 5 meals using the PDF ratios. (c) for each meal slot, pick a food option and compute grams to hit the meal's macro target. (d) create `daily_plan_entries`. Exposed as "Generar Plan Automático" button in the daily plan section.

13. **Energy balance — recomp detection visibility**
    The recomp detection logic already exists in adaptive.js `loadRecomp()` but silently returns if data is insufficient. Add a message showing what data is missing ("Se necesitan 4+ mediciones con cintura, cuello y cadera"). When data is sufficient, render the recomp card prominently. Add a small Chart.js line chart showing weight vs waist over time.

14. **Energy balance — adherence clarity**
    Replace the simple "on track / needs adjustment" text with a visual gauge or progress bar. Show: current loss rate vs target, consistency score (how many weeks within 0.2 kg), and specific recommendations ("Aumentar déficit en 150 kcal/día" or "Mantener ritmo actual").

15. **Energy balance — deficit impact vs PDF baseline**
    Compare the current actual intake against the PDF baseline (the seeded meal_components default_grams). Show "Tu dieta actual: X kcal vs PDF base: Y kcal — Diferencia: Z kcal". Helps the user understand how their actual eating compares to the original plan.

## Risks / Trade-offs

- **HealthSync DB queries for 5 new metrics** → 5 new IPC calls on dashboard init. Mitigation: batch into a single `health:getDashboardMetrics(from, to)` handler returning all metrics in one query.
- **Food DB size** → 150 items is manageable as a JSON file (~10KB). If it grows beyond 500 items, consider moving to SQLite.
- **Auto-generator produces imperfect plans** → The algorithm is a heuristic, not a nutritionist. Mitigation: always show the generated plan for review before saving; allow manual tweaks.
- **Chart performance with 6+ charts on dashboard** → Destroy charts on navigation (already handled by `destroyAllCharts()`). Use `requestAnimationFrame` for staggered renders.
- **5-column layout breaks on narrow screens** → Minimum 1200px viewport assumed (Electron app, fixed 1200x800 window). Add `@media` fallback to 3-column + scroll if needed.
- **Recomp detection requires 4+ measurements** → Many users may not have this data. Show clear empty state with guidance on what to track.
