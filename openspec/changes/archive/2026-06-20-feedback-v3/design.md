## Context

feedback-v2 fixed critical architecture issues (orphaned energy merged into adaptive.js, broken recalcTotals, export/import data loss, populated meal_components and meal_options from the PDF, shared utilities extracted, delete handlers added). The app is now stable. This change (feedback-v3) adds the feature layer: richer dashboard, complete diet workflow, and clearer energy balance.

HealthSync data reality was verified during exploration: `blood_glucose` table does not exist (Apple Watch doesn't measure glucose), `blood_pressure` has 0 records (requires external monitor), and no pre-computed heart rate zones exist. Standing hours, exercise time, HRV, resting HR, walking distance, and SpO2 all have abundant data.

## Goals / Non-Goals

**Goals:**
- Restructure Dashboard layout: session-first, compact KPI grid, trend chart card
- Add HealthSync metric cards with real data: standing hours, exercise time, walking distance, HRV, SpO2, resting HR
- Add blood pressure card (always empty state — AW limitation)
- Split weekly balance into basal vs activity components; show diet target
- Add weight variation with trend indicator over selected period
- Replace single steps card with 7d/15d/1m period indicators and trend arrows
- Replace generic "FC en Reposo" with HRV + resting HR composite with trend
- Fix weekly sport summary chart zero-duration bug in Activity view
- Add period-over-period calorie comparison with trend arrows in Activity view
- Add 5-column meal template UI from PDF with slot selection
- Add compact food display with pagination and category filters
- Extend food seed data from 46 to ~150 items; auto-fill on name entry searches food_items table
- Add daily plan auto-generator based on energy balance target (macro ratios computed from seed data)
- Improve energy balance: recomp detection visibility, adherence clarity, deficit impact vs PDF baseline

**Non-Goals:**
- No new database tables in the app DB (all metrics from HealthSync; diet data uses existing tables)
- No changes to Training or Profile views
- No changes to HealthSync CLI or import process
- No blood glucose or heart rate zone metrics (unavailable in HealthSync)
- No measurements view improvements (deferred to v4)

## Decisions

### 1. Dashboard layout: session-first KPI grid + compact metric cards

```
┌──────────────────────────────────────────────────────────────────┐
│ [7d][15d][1m]                                              ⏱️   │
├──────────────────────────────────────────────────────────────────┤
│ Row 1: 6 metric cards (salient health data)                     │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐│
│ │Sesiones│ │Balance │ │ Peso   │ │  HRV   │ │StandHrs│ │Dist  ││
│ │ 12     │ │+120/día│ │78.5kg  │ │ 45ms   │ │ 9.2h   │ │4.2km ││
│ │4500kcal│ │bas/act │ │+0.3kg ▲│ │ 52bpm  │ │ ✓Cumpl │ │ /día ││
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └──────┘│
│ Row 2: Steps multi-period (inline mini-cards)                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                         │
│ │ Pasos 7d │ │Pasos 15d │ │Pasos 1m  │                         │
│ │ 8,452 ▲ │ │ 8,102 ▲ │ │ 7,894 ― │                         │
│ └──────────┘ └──────────┘ └──────────┘                         │
│ Row 3: Trend chart (full width)                                 │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ 📈 kcal diarias + MA 7d + cumplimiento badges               ││
│ └──────────────────────────────────────────────────────────────┘│
│ Row 4: Activity per-sport (session-first, ordered descending)   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                         │
│ │ Carrera  │ │ Ciclismo │ │  Yoga    │                         │
│ │ 8 sesns  │ │ 4 sesns  │ │ 2 sesns  │                         │
│ └──────────┘ └──────────┘ └──────────┘                         │
└──────────────────────────────────────────────────────────────────┘
```

Use CSS grid with explicit template areas. Minimum viewport 1200px (Electron default). Responsive fallback to 2-column at <1000px.

### 2. Dashboard health metrics: HealthSync IPC handlers, not app DB

HealthSync tables verified during exploration:

| Metric | HealthSync Table | Rows | Decision |
|--------|-----------------|------|----------|
| Standing hours | `stand_hours` | 28,815 | ✅ Query avg value, compliance at >=8h/day |
| Exercise time | `exercise_time` | 59,522 | ✅ Query avg min/day, compliance at >=30min |
| Walking distance | `distance_walking_running` | 309,942 | ✅ Query avg km/day |
| SpO2 | `spo2` | 20,674 | ✅ Query latest SpO2, compliance >=95% |
| HRV | `hrv` | 12,914 | ✅ Already has handler; add to composite card |
| Resting HR | `resting_heart_rate` | 1,349 | ✅ Already has handler; add to composite card |
| Blood pressure | `blood_pressure` | **0** | ⚠️ Card always shows empty state. AW doesn't measure BP |
| Blood glucose | *(table doesn't exist)* | — | ❌ **Removed from scope**. AW doesn't measure glucose |
| HR zones | *(no pre-computed table)* | — | ❌ **Removed from scope**. Would require runtime computation |

New IPC handlers: `health:getStandingHours(from, to)`, `health:getExerciseTime(from, to)`,
`health:getWalkingDistance(from, to)`, `health:getSpO2Range(from, to)`.

BP handler `health:getBloodPressure(from, to)` returns empty set. Card shows "-- / --" with note "Requiere monitor externo de presión".

Compliance thresholds hardcoded in frontend (standing >=8h, exercise >=30min, SpO2 >=95%).

### 3. Weekly balance breakdown: compute from existing data sources

Basal = BMR from profile. Activity = sport + NEAT. Diet target = sum of daily_plan_entries. 
Three values computed from `db:getDashboardData`. Split `weekBalance` into `{ basalTotal, activityTotal, dietTarget }`, render as segmented display.

### 4. Weight variation: new IPC db:getWeightStats

`db:getWeightStats(from, to)` returns `{ first, last, min, max, avg, trend }`. 
Dashboard shows `last - first` as variation with linear regression slope for trend.

### 5. Steps multi-period: three inline mini-cards

Replace single `dailySteps` card with three compact inline cards (7d, 15d, 1m). 
Each queries steps average from HealthSync. Arrow compares against previous same-length period.

### 6. HRV + resting HR composite

Replace "FC en Reposo" with card showing: latest HRV (SDNN), latest resting HR (bpm), 
7d averages, trend arrow. Uses existing `health:getHeartRateDaily` and existing `health:getHRVRange`.

### 7. Weekly sport summary zero-duration fix

Inspect `db:getWeeklySportSummary` handler: SQL already has `COALESCE(SUM(duration_minutes), 0)`. 
Root cause is likely that `sport_activities` data doesn't have duration_minutes populated from HealthSync 
import. Fix: add duration to `migrateHealthData` in apple-health-import.js. Also verify column names match 
frontend expectations — chart currently reads `total_duration` but frontend may not display it.

Add `db:getSportSummaryByRange(from, to)` supporting arbitrary periods with session count, avg kcal, total duration.

### 8. Period comparison: new IPC with offset aggregation

`db:getActivityComparison(from, to)` returns current period stats AND previous same-length period stats. 
Frontend renders arrows + sparklines in ranking table.

### 9. 5-column meal template UI

After feedback-v2 seeded `meal_components` + `meal_options`, the data exists. 
Create a new UI section showing 5 columns (Desayuno, Media Mañana, Comida, Merienda, Cena), 
each column showing slot breakdown with food options. User can select options per slot and click 
"Usar estas 5 comidas" to create a daily plan. Rendered as a CSS grid with `grid-template-columns: repeat(5, 1fr)`.

### 10. Extended food seed data (no separate JSON DB)

Instead of creating a separate `food-db.json`, **extend the existing seed data** in `seed-data.js` 
from 46 to ~150 items. Source the additional items from a curated list of common Spanish foods 
using standard nutritional values (BEDCA, USDA references). Auto-fill on food name entry searches 
the `food_items` table via a new IPC `db:searchFoodItems(query)` that returns top-5 matches. 
This avoids data duplication, keeps the food DB in SQLite (queryable, editable via UI), 
and is bundled with the app.

### 11. Compact food display with pagination

Current food list renders all items in a card grid. Replace with a paginated table (20 per page), 
category pills at the top for quick filtering, and compact rows showing name + kcal + macros per 100g 
in a single line. Category filter uses existing `CATEGORY_KEYWORDS` logic.

### 12. Daily plan auto-generator

New algorithm: 
(a) Get target daily calories from energy balance (deficit/maintenance/surplus goal). 
(b) Allocate calories across 5 meals using **ratios computed from seed data** (meal_components.default_grams × food_items.kcal_per_100g). 
(c) For each meal slot, pick a food option and compute grams to hit the meal's macro target. 
(d) Create `daily_plan_entries`. Exposed as "Generar Plan Automático" button.

Ratios are not hardcoded — they're computed dynamically from the existing seed data on first run. 
The algorithm is a greedy heuristic, not a nutritional optimizer. Always show for review before saving.

### 13. Energy balance — recomp detection visibility

The recomp detection logic already exists in adaptive.js `loadRecomp()` but silently returns if data 
is insufficient. Add a message showing what data is missing ("Se necesitan 4+ mediciones con cintura, 
cuello y cadera"). When data is sufficient, render the recomp card prominently. 
Add a small Chart.js line chart showing weight vs waist over time.

### 14. Energy balance — adherence clarity

Replace the simple "on track / needs adjustment" text with a visual gauge or progress bar. 
Show: current loss rate vs target, consistency score (how many weeks within 0.2 kg), 
and specific recommendations ("Aumentar déficit en 150 kcal/día" or "Mantener ritmo actual").

### 15. Energy balance — deficit impact vs PDF baseline

Compare the current actual intake against the PDF baseline (the seeded meal_components default_grams). 
Show "Tu dieta actual: X kcal vs PDF base: Y kcal — Diferencia: Z kcal". 
Helps the user understand how their actual eating compares to the original plan.

## Risks / Trade-offs

- **HealthSync DB queries for 5 new metrics** → 5 new IPC calls on dashboard init. 
  Mitigation: batch into a single `health:getDashboardMetrics(from, to)` handler returning all metrics in one query.
- **Blood pressure always empty** → Card shows "-- / --". Some users may find it useless. 
  Mitigation: if 0 records, show "Requiere monitor externo" note; consider hiding if user has no connected monitor.
- **Auto-generator produces imperfect plans** → The algorithm is a heuristic, not a nutritionist. 
  Mitigation: always show the generated plan for review before saving; allow manual tweaks.
- **Chart performance with 6+ charts on dashboard** → Destroy charts on navigation (already handled by 
  `destroyAllCharts()`). Use `requestAnimationFrame` for staggered renders.
- **5-column layout breaks on narrow screens** → Minimum 1200px viewport assumed (Electron app, fixed 1200x800 window). 
  Add `@media` fallback to 3-column + scroll if needed.
- **Recomp detection requires 4+ measurements** → Many users may not have this data. 
  Show clear empty state with guidance on what to track.
- **Seed data expansion is manual** → 104 new food entries with accurate macros. Must be sourced carefully 
  from BEDCA/USDA references to ensure reasonable accuracy.

## Deferred to v4

- Measurements view: grid resize (smaller cards), top-5 history only, KPIs rendered directly on charts, 
  weight trend split by months, "before/after" formatting improvements, chest/neck/shoulders chart trends
