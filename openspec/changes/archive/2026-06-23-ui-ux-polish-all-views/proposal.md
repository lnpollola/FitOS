## Why

The organic redesign completed in `organic-redesign-all-views` established the visual foundation, but the 8 views still have structural, usability, and data-display issues that prevent effective daily use. Metric cards show irrelevant data (SPO2, blood pressure with no sources), tables lack trend indicators, the daily diet plan editor is broken, exercise names remain in English, charts are placeholder-only, and load times are slow due to repeated full-table queries. A deeper code audit also uncovered **5 critical functional bugs** (silent FK violations, orphaned training sets, dead plan buttons, non-applying recommendations, duplicated food swaps) and **30+ data-accuracy and performance gaps** the user did not surface in initial feedback. This change fixes all of those — making every view functional, correct, informative, and fast.

## What Changes

### Panel (Dashboard)
- Add bar chart showing weekly balance average trend progression over time
- Sessions card: add total training hours/time metric
- Remove "último peso" card (redundant with measurements view)
- Remove "horas de pie" card (Apple Watch data unreliable)
- Remove SpO2 card (no data source)
- Remove presión arterial card (no data source)
- Keep HRV reposo card, keep distancia caminando card
- Add distancia en bicicleta card
- Expand sleep card with exhaustive analysis (deep/REM/light breakdown, consistency, trends)
- Remove empty bottom card stretching across viewport
- Move activity summary section to top (between date selector and first chart rows)
- Add km total + trend chart to Caminata and Ciclismo cards
- Add calorías por tiempo to Heat/Fútbol cards
- Add km recorridos to Fútbol card
- Improve all microcharts with period comparison arrows and clearer numeric labels

### Actividad
- Add complementary metrics to "sesiones vs periodo anterior" row (beyond session count)
- Replace duration+calories table with composite ranking chart (most frequent vs most calories, comparable between periods)
- Fix broken 15d/1m/3m selector in "deporte por tipo" section (or make it fixed 7d)
- Remove duplicate "duración" column, replace with avg kcal/session or intensity metric
- **Fix trend arrows comparing wrong periods** (currently compares viewed month vs today-relative period)
- **Draw or remove dead sparkline canvases** in ranking table (currently blank 60×18 canvases)
- **Fix N+1 IPC + O(n²) sparkline computation** in timeline (31 sequential calls per month)
- **Fix dayArrow showing green for metrics where increase is bad** (resting HR, resting kcal)
- **Comparison filter no longer resets timeline pagination**
- **Add empty-state messages** for ranking, comparison strip, and weekly chart (currently hidden silently)
- **Fix "Semanal" title vs 7d/15d/1m selector** inconsistency
- **Show previous-period numeric value** alongside trend arrow in session comparison

### Plan de Dieta
- Add food category labels above option groups (Carbohidratos, Proteínas, Grasas saludables, Infusiones)
- Pre-load example elaborated dishes into dish manager from seed data
- Clarify min/max gram indicators with descriptive labels
- Move daily plan section directly below meal templates (not at bottom)
- Redesign daily plan editor: fix frozen/runaway increment bugs, make gram editing reliable
- Make food manager collapsible, minimized by default
- Make elaborated dishes manager collapsible, minimized by default
- Clarify mid-morning and snack as fixed recipes (batido proteico con fruta/avena)
- **Fix "Añadir plato" silently failing** (FK violation: passes `meal_component_id: 0`)
- **Fix "Cambiar alimento" duplicating entries** (doesn't delete old rows before inserting new)
- **Fix dish edit being dead code** (no edit button, ingredients reset to empty, saveDish is INSERT-only)
- **Fix column totals showing "0 kcal" on load** (updateColumnTotals only called on click)
- **Eliminate duplicate loadFoods/loadHiddenFoods/loadDailyPlan** calls on init
- **Sort daily plan entries by component sort_order** (currently in DB insertion order)
- **Fix food categories missing legumes and plant proteins** (tofu, tempeh, seitán, lentejas invisible under filters)
- **Fix auto-fill overwriting user-entered macros** without confirmation
- **Fix auto-create plan always using 0.5 kg/week** (reads target-pace from wrong DOM element)
- **Add training/rest day toggle** with rest_day_grams support in daily plan

### Balance Energético
- Layout "estado actual" and "desglose TDEE" as side-by-side cards for comparison
- Use last 4 measurements (not all-time) for recomposition detection
- **Fix "Aplicar Recomendación" not modifying the diet** (currently only saves metadata to settings)
- **Fix weight gain displayed as loss rate** (Math.abs hides the sign)
- **Guard currentDeficit when no daily plan exists** (currently shows absurd -2200 kcal deficit)
- **Make recomp chart responsive** (currently fixed 280×180, only non-responsive chart in app)
- **Fix chart leak in empty-state paths** (destroy guard after early-return)
- **Guard JSON.parse in adjustment history** (malformed setting crashes the view)
- **Fix loadDeficitImpact summing all templates per slot** (inflates PDF baseline)

### Mediciones Corporales
- Add any missing measurement types to the input form
- Redesign input form grouped by body part (cuello/hombros, torso, brazos, piernas) with visual icons
- Replace unresponsive history table with responsive layout showing per-metric trend arrows
- Replace chest/neck/shoulders multi-line chart with meaningful evolution/tendency visualization
- **Fix Navy body-fat requiring hips for males** (male formula uses only neck + waist)
- **Fix chart labels misaligned with data points** (labels not filtered when data nulls are dropped)
- **Implement upsert in saveMeasurementSet** (duplicate dates corrupt before/after comparison)
- **Remove dead getProfile() call in loadHistory** (wasted IPC every render)
- **Add empty-state text for hidden charts** (headings leave blank space)

### Entrenamiento de Fuerza
- Translate all exercise names and muscle groups to Spanish; remove nonsensical entries
- Move training routine section closer to frequency selector
- Move session registration section higher in the view
- Replace empty approval/deltas/maintenance charts with placeholder graphics explaining what they'll show, or remove them
- **Fix saveTrainingSession returning `true` instead of the session id** (sets are orphaned with `session_id = NULL`)
- **Add UI to record sets (load/reps/RPE) within a session** (currently no way to log sets for manual sessions)
- **Fix active plan buttons being dead on init** (listeners not re-attached when plan loads on view init)
- **Add routine CRUD: edit name, delete, add/remove exercises per day** (currently only create works)
- **Translate muscle_group, equipment, and movement_pattern to Spanish** (not just exercise names)
- **Replace emoji MUSCLE_ICONS with Lucide SVG icons** (🧠 for abs, 🦅 for dorsal are nonsensical)
- **Refresh loadStrengthStatus after session create** (currently only refreshes on delete)
- **Fix confusing "Frecuencia" button label** (should say "Ver Planes" or "Generar Plan")

### Performance
- Create summarized cache tables for 7d, 15d, and 1m aggregations to avoid repeated full-table scans
- Update IPC handlers to query cache tables when available, falling back to raw queries

### Transversal (all views)
- **Add error state cards with retry** via `state-card.js` in all 7 views (currently IPC failures silently show "--" identical to empty state)
- **Fix Chart.js destroy-before-recreate** in empty-state paths across adaptive, analytics, and measurements (chart instances leak when data becomes empty)
- **Protect loading flags with try/finally** in dashboard, activity, and analytics (views can get permanently stuck blank if render throws)
- **Remove hardcoded strings** across all views (kcal, min, ❤️ emoji, table headers, fallbacks with `|| 'texto'`)
- **Fix dashboard growth-ring legend mismatch** (says "Excedente/Déficit" but encodes kcal magnitude)
- **Remove duplicate resting HR card** on dashboard (appears in composite AND standalone)
- **Connect steps averaging window to selected range** (currently hardcoded 30d independent of filter)
- **Match skeleton count to card count** on dashboard (prevents visible reflow)
- **Fold weight IPC into parallel batch** (currently serialized after Promise.allSettled)
- **Render fetched-but-discarded dashboard data** (todayCalories, measurementDelta, nextWorkout)

### Analytics (Health Analytics view)
- **Fix _loadingAnalytics race condition** (flag cleared before loadAll completes, rapid clicks multiply queries)
- **Fix "NaN bpm" KPI** when days exist but lack heart rate data
- **Replace hardcoded chart colors with chartColorWithAlpha** (fills are teal/indigo, borders are organic — mismatch)
- **Add top-level empty state** when Apple Health was never imported
- **Add KPI trend indicators** (consistent with dashboard)
- **Add KPI stats to walking/cycling distance mini-cards** (currently only title + canvas)
- **Validate custom date range** (reversed range silently produces empty charts)
- **Debounce custom date apply button**

## Capabilities

### New Capabilities

- `sleep-analysis`: Expanded sleep metrics card with deep/REM/light breakdown, sleep consistency score, and 7d/15d trends sourced from HealthSync sleep data
- `sport-ranking-comparison`: Composite bar/ranking chart comparing sport types by frequency vs calories, supporting period comparison (current vs previous)
- `food-categorization`: Category labels (Carbohidratos, Proteínas, Grasas saludables, Infusiones) displayed above food option groups in meal templates
- `collapsible-managers`: Collapsible toggle sections for food manager and elaborated dishes manager, minimized by default with expand/collapse chevron
- `daily-plan-redesign`: Redesigned daily plan editor placed below meal templates, with reliable gram editing, auto-sum validation, and clear visual feedback
- `body-measurement-form`: Body-part-grouped measurement input form (cuello/hombros, torso, brazos, piernas) with representative icons and pre-filled last-known values
- `spanish-exercises`: Complete Spanish translation of exercise library names, muscle groups, equipment, and movement patterns; removal of irrelevant/nonsensical entries
- `performance-caching`: Summary cache tables (`activity_summary_7d`, `activity_summary_15d`, `activity_summary_1m`) populated on data import and daily writes, with IPC handlers preferring cache over raw queries
- `training-session-logging`: Fix saveTrainingSession to return real id; add UI to record sets (load/reps/RPE) within sessions; fix active plan buttons; add routine CRUD (edit/delete/add exercises)
- `view-error-states`: Error state cards with retry via state-card.js in all 7 views; Chart.js destroy-before-recreate in empty-state paths; loading flags protected by try/finally
- `analytics-fixes`: Fix _loadingAnalytics race condition, NaN bpm KPI, hardcoded colors, chart leaks, missing top-level empty state, KPI trend indicators, custom date range validation
- `diet-day-type-toggle`: Training/rest day toggle in daily plan with rest_day_grams support; both gram amounts visible in meal templates

### Modified Capabilities

- `dashboard-health-metrics`: Remove SpO2, blood pressure, standing hours, and weight cards; add cycling distance card; expand sleep card; move activity summary to top; add trend arrows; fix growth-ring legend; remove duplicate RHR; connect steps to selected range; match skeleton count; fold weight IPC; render todayCalories/measurementDelta/nextWorkout
- `activity-ingestion`: Add ranking comparison chart; fix period selector; remove duplicate duration column; fix trend arrows comparing wrong periods; draw/remove dead sparklines; fix N+1 and O(n²); fix dayArrow context; fix comparison filter resetting pagination; add empty states; fix title; show previous-period value
- `diet-plan-management`: Food categorization; collapsible managers; redesigned daily plan; pre-loaded dishes; fix add-dish FK; fix swap duplicates; fix dish edit; fix column totals; eliminate duplicate loads; sort entries; fix category coverage; fix auto-fill; fix auto-create target; training/rest toggle
- `energy-balance`: Side-by-side cards; recomposition from last 4; fix apply recommendation; fix gain-as-loss; guard currentDeficit; responsive recomp chart; fix chart leak; guard JSON.parse; fix deficit impact dedup
- `body-measurements`: Body-part form; responsive trend table; evolution chart; fix Navy male; fix label alignment; upsert; remove dead getProfile; empty-state text for hidden charts
- `strength-training`: Spanish names/groups/equipment/patterns; layout reorder; placeholder states; fix session id; sets UI; fix plan buttons; routine CRUD; replace emoji icons; refresh strength status; fix button label

## Impact

- **Views**: dashboard.js, activity.js, diet.js, adaptive.js, measurements.js, training.js, analytics.js (all 8 views modified)
- **DB**: New cache tables in database.js; migration for schema update; new IPC handlers for cache queries; upsert paths for saveTrainingSession, saveTrainingSet, saveMeasurementSet, saveDish, saveTrainingRoutine; exercise name/equipment/movement_pattern migration
- **Locales**: es.js expanded with new strings for sleep analysis, food categories, measurement body parts, Spanish exercise names/equipment/patterns, error states, analytics, day type toggle
- **Seed data**: exercise_library rewritten with Spanish names + equipment + patterns; elaborated dishes seeded with examples; food category mapping covering legumes and plant proteins
- **CSS**: main.css updated for side-by-side layouts, collapsible sections, responsive trend table, body-part form grid, error state cards, day type toggle
- **Utils**: state-card.js imported in all 7 views; chart-theme.js chartColorWithAlpha used in analytics; trend arrow utility extracted for reuse
- **IPC handlers**: saveTrainingSession returns id; saveDish upsert; saveTrainingRoutine upsert; saveMeasurementSet upsert; getCyclingDistance; getSleepAnalysis; cache-aware getDashboardMetrics/getWeeklyBalance
- **Tests**: Smoke tests updated for all 8 views; unit tests for cache queries, trend computation, sleep consistency, recomposition, gram clamping, food categories, Navy male formula, session id return, upsert paths
