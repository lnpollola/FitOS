## 1. Database: Cache tables, schema changes, and IPC fixes

- [x] 1.1 Add `activity_summary_7d`, `activity_summary_15d`, `activity_summary_1m` cache table definitions in `src/db/database.js`
- [x] 1.2 Create `populateCache(days)` function that truncates and repopulates a cache table from raw `activity_days`, `sport_activities`, `weight_entries`
- [x] 1.3 Wire cache populate into every write path: `db:saveActivityDay`, `db:saveSportActivity`, `db:saveWeightEntry`, `db:saveMeasurementSet`, Apple Health import completion
- [x] 1.4 Create `db:getSleepAnalysis(from, to)` IPC handler returning total hours, phase breakdown, consistency score, daily series
- [x] 1.5 Update `db:getDashboardMetrics` to read from cache tables, falling back to raw queries
- [x] 1.6 Update `db:getWeeklyBalance` to query cache when available
- [x] 1.7 Add `db:getCyclingDistance(from, to)` IPC handler querying `distance_cycling` from HealthSync tables
- [x] 1.8 Run exercise migration: update `exercise_library` name, muscle_group, equipment, AND movement_pattern columns from English to Spanish, preserving ids and practical_examples
- [x] 1.9 **FIX: `db:saveTrainingSession` return `lastInsertRowid`** instead of `true` — return `{ ok: true, id: <new_id> }`
- [x] 1.10 **FIX: Add upsert path to `db:saveTrainingSession`** — UPDATE if id provided, INSERT otherwise
- [x] 1.11 **FIX: Add upsert path to `db:saveTrainingSet`** — UPDATE if id provided, INSERT otherwise
- [x] 1.12 **FIX: Add upsert path to `db:saveTrainingRoutine`** — UPDATE if id provided, INSERT otherwise
- [x] 1.13 **FIX: Add upsert path to `db:saveMeasurementSet`** — UPDATE if date exists, INSERT otherwise (prevents duplicate date rows)
- [x] 1.14 **FIX: Add upsert path to `db:saveDish`** — UPDATE if id provided, INSERT otherwise (enables dish editing)
- [x] 1.15 **FIX: Add `db:adjustMealGrams({ carbDelta, fatDelta })`** IPC handler that updates `meal_components.default_grams` for carb/fat slots
- [x] 1.16 **FIX: Relax `daily_plan_entries.meal_component_id` FK** to allow NULL (for dish ingredients without a component reference) OR resolve valid component id in add-dish path
- [x] 1.17 Add `db:deleteTrainingSet(id)` IPC handler (if not existing)
- [x] 1.18 Add `db:deleteTrainingRoutine(id)` IPC handler (if not existing)

## 2. Seed data: Spanish exercises, example dishes, and category coverage

- [x] 2.1 Rewrite `src/db/seed-data.js` exercises array with Spanish names, muscle groups, equipment, AND movement patterns (~50 exercises)
- [x] 2.2 Remove exercises requiring gym-only equipment (cable machines, Smith machine, leg press)
- [x] 2.3 Add 3–5 example elaborated dishes to seed data (combinations already present in meal templates)
- [x] 2.4 Seed example `elaborated_dishes` and `dish_ingredients` on fresh DB init
- [x] 2.5 **FIX: Update food category mapping to cover legumes** (lentejas, garbanzos, alubias, habas, soja) — add to Proteínas or new Legumbres category
- [x] 2.6 **FIX: Update food category mapping to cover plant proteins** (tofu, tempeh, seitán) — add to Proteínas category

## 3. Locales: New Spanish strings

- [x] 3.1 Add `strings.sleep` block: phase labels (Profundo, REM, Ligero), consistency labels (Consistente, Irregular, Muy irregular), "Datos de fases no disponibles"
- [x] 3.2 Add `strings.diet.categories`: Carbohidratos, Proteínas, Grasas saludables, Infusiones, Frutas, Verduras, Extras, Legumbres
- [x] 3.3 Add `strings.diet.fixedRecipes`: Media Mañana and Merienda recipe descriptions
- [x] 3.4 Add `strings.diet.gramRange`: "Mín", "Máx" labels
- [x] 3.5 Add `strings.measurements.bodyParts`: Cuello y Hombros, Torso, Brazos, Piernas fieldset labels
- [x] 3.6 Add `strings.training`: Spanish muscle groups, equipment, movement patterns, placeholder chart messages, "Ver Planes" button label
- [x] 3.7 Add `strings.dashboard`: cycling card labels, sleep consistency labels, trend comparison labels
- [x] 3.8 Add `strings.energy`: side-by-side card labels, "Ganando X kg/semana" gain label, "Crea un plan diario" guidance
- [x] 3.9 Add `strings.analytics`: top-level empty state banner text, "Ir a Actividad" CTA, custom date range validation message
- [x] 3.10 Add `strings.diet.dayType`: "Entrenamiento", "Descanso", "Día de entrenamiento", "Día de descanso" toggle labels
- [x] 3.11 Add `strings.diet.applyConfirm`: "¿Sobrescribir valores?" auto-fill confirmation
- [x] 3.12 Add `strings.diet.adjustApplied`: "Avena: 60g → 45g" adjustment confirmation template
- [x] 3.13 Add `strings.states.error` and `strings.states.retry` if not existing (for error state cards)

## 4. CRÍTICOS: Functional bug fixes (dieta, entrenamiento, energía)

- [x] 4.1 **FIX: Diet "Añadir plato" FK violation** — resolve valid `meal_component_id` or use NULL after schema relaxation (diet.js:700)
- [x] 4.2 **FIX: Diet "Cambiar alimento" duplicates entries** — delete old `daily_plan_entries` before inserting new ones (diet.js:663-678)
- [x] 4.3 **FIX: Diet dish edit dead code** — add "Editar" button to dish cards, pre-fill ingredients, use saveDish upsert path (diet.js:168-286)
- [x] 4.4 **FIX: Training saveTrainingSession returns true** — use returned `id` for `saveTrainingSet` calls (training.js:215, ipc-handlers.js:400-404)
- [x] 4.5 **FIX: Training no UI to record sets** — add inline set editor in session list (exercise select, load, reps, RPE, add/delete)
- [x] 4.6 **FIX: Training active plan buttons dead on init** — re-attach `data-use-plan-day` and `data-add-exercise-to-day` listeners in loadActivePlan (training.js:320-357)
- [x] 4.7 **FIX: Energy "Aplicar Recomendación" does nothing** — call `db:adjustMealGrams` to modify meal_components, show confirmation (adaptive.js:363-373)
- [x] 4.8 **FIX: Diet auto-create plan reads wrong DOM element** — read target-pace from settings/IPC instead of `getElementById('target-pace')` (diet.js:490)

## 5. Dashboard: Card changes, repositioning, and data fixes

- [x] 5.1 Remove SpO2 card from dashboard DOM
- [x] 5.2 Remove blood pressure card from dashboard DOM
- [x] 5.3 Remove standing hours card from dashboard DOM
- [x] 5.4 Remove "último peso" card from dashboard DOM
- [x] 5.5 Remove empty bottom card stretching across viewport
- [x] 5.6 Add cycling distance card with km total, sparkline, and trend arrow
- [x] 5.7 Expand sleep card: add sleep phase stacked bar (deep/REM/light), consistency score badge, trend arrow
- [x] 5.8 Add trend period comparison arrows (▲/▼/―) to all metric card sparklines (exercise, walking, cycling, sleep, HRV, steps)
- [x] 5.9 Move activity summary (`.card-accent`) to position immediately after hero card
- [x] 5.10 Add km total and trend sparkline to Caminata sport card
- [x] 5.11 Add km total and trend sparkline to Ciclismo sport card
- [x] 5.12 Add kcal/min metric to Heat/Boxing sport cards
- [x] 5.13 Add km recorridos to Fútbol sport card
- [x] 5.14 Add weekly balance average trend bar chart (bar chart showing how weekly average balance changed over time)
- [x] 5.15 Add total training hours metric to sessions card
- [x] 5.16 **FIX: Growth-ring legend mismatch** — relabel legend to match ring encoding (kcal magnitude) OR re-encode ring to use balance values (dashboard.js:240)
- [x] 5.17 **FIX: Remove duplicate resting HR card** from Row 3 (dashboard.js:320-325)
- [x] 5.18 **FIX: Connect steps averaging window to selected range** (dashboard.js:85-91)
- [x] 5.19 **FIX: Match skeleton count to card count** — Row1: 8 skeletons, Row3: 5 skeletons (dashboard.js:58-59)
- [x] 5.20 **FIX: Fold weight IPC into parallel batch** — remove serialized `getWeightEntries` after Promise.allSettled (dashboard.js:140)
- [x] 5.21 **FIX: Render todayCalories, measurementDelta, nextWorkout** — add small info cards or hero subtitle (dashboard.js:122)
- [x] 5.22 **FIX: Protect _loadingDashboard with try/finally** (dashboard.js:14, :379)

## 6. Activity: Ranking chart, period selector, and metric fixes

- [x] 6.1 Add total training hours and avg session duration to "sesiones vs período anterior" comparison strip
- [x] 6.2 Replace duration+calories table with Chart.js grouped bar chart (session count + total kcal per sport)
- [x] 6.3 Add period comparison to ranking chart (current vs previous period side-by-side bars)
- [x] 6.4 Fix 15d/1m/3m period selector in "Deporte por tipo" section to work for all options
- [x] 6.5 Remove duplicate "Duración" column from sport table; replace with "kcal/sesión" (avg kcal per session)
- [x] 6.6 Ensure ranking chart uses `getSportDisplayName()` for Spanish sport names
- [x] 6.7 **FIX: Trend arrows compare wrong periods** — compare viewed month vs previous month, not vs today-relative (activity.js:399-411)
- [x] 6.8 **FIX: Draw or remove dead sparkline canvases** in ranking table (activity.js:487)
- [x] 6.9 **FIX: N+1 IPC in timeline** — batch fetch sport activities per month, not per day (activity.js:258-269)
- [x] 6.10 **FIX: O(n²) sparkline computation** — replace filter-in-loop with single forward pass (activity.js:349-362)
- [x] 6.11 **FIX: dayArrow context-aware** — green for decrease in resting HR and resting kcal (activity.js:203-208)
- [x] 6.12 **FIX: Comparison filter resets pagination** — only re-run KPI comparison, not timeline reload (activity.js:188-194)
- [x] 6.13 **FIX: Add empty-state messages** for ranking, comparison strip, and weekly chart (activity.js:384-387, 530-532, 543-545)
- [x] 6.14 **FIX: "Semanal" title vs 7d/15d/1m selector** — change to "Resumen Deportivo" (activity.js:44)
- [x] 6.15 **FIX: Show previous-period numeric value** in session comparison strip (activity.js:524-529)
- [x] 6.16 **FIX: Protect _loadingActivity with try/finally** (activity.js:11-12, :607)
- [x] 6.17 **FIX: Replace ❤️ emoji with `icon('heart')`** (activity.js:330)
- [x] 6.18 **FIX: Remove hardcoded "min" units** — use locale keys (activity.js:446, 484)

## 7. Diet plan: Categorization, daily plan, collapsible managers, and bug fixes

- [x] 7.1 Create food category mapping object (food_item.id → category) in diet view
- [x] 7.2 Render category pill badges (Carbohidratos, Proteínas, Grasas, Infusiones, Legumbres) above food option groups in meal template columns
- [x] 7.3 Style category pills with organic palette colors
- [x] 7.4 Convert Media Mañana and Merienda columns to fixed recipe display (not slot-based)
- [x] 7.5 Clarify gram range indicators with "Mín" and "Máx" labels showing "100–120g" format
- [x] 7.6 Move daily plan section below meal template columns with section header "Plan Diario"
- [x] 7.7 Fix daily plan gram editing: replace `change` event with debounced `input` event (500ms)
- [x] 7.8 Add value clamping to food item min/max range on blur
- [x] 7.9 Fix runaway increment bug (ensure each click produces exactly one increment)
- [x] 7.10 Add per-meal running totals (kcal, protein, carbs, fat) that update in real-time
- [x] 7.11 Add daily aggregate row with compliance indicator vs TDEE deficit target
- [x] 7.12 Add "Generar Plan Diario" button with review-before-save flow
- [x] 7.13 Wrap food manager in collapsible `<details>` with "Gestor de alimentos" summary, collapsed by default
- [x] 7.14 Wrap elaborated dishes manager in collapsible `<details>` with "Gestor de platos" summary, collapsed by default
- [x] 7.15 Display pre-loaded example dishes in elaborated dishes manager when expanded
- [x] 7.16 **FIX: Column totals "0 kcal" on load** — call `updateColumnTotals()` after initial render (diet.js:380)
- [x] 7.17 **FIX: Eliminate duplicate loadFoods/loadHiddenFoods/loadDailyPlan** on init (diet.js:478-482 vs 853-857)
- [x] 7.18 **FIX: Sort daily plan entries by component sort_order** before rendering (diet.js:552, 571)
- [x] 7.19 **FIX: Auto-fill does not overwrite user-entered macros** — check for non-zero values before overwriting (diet.js:146-162)
- [x] 7.20 Add training/rest day toggle in daily plan header ("Entrenamiento" / "Descanso")
- [x] 7.21 Use rest_day_grams when "Descanso" selected for plan generation
- [x] 7.22 Display both gram amounts in meal templates (primary training, muted rest with "—" for zero)
- [x] 7.23 **FIX: Replace hardcoded strings** — "Aún no hay platos creados", "Fecha", "Gramos", "Añadir", table headers, "Total", "Sin alimentos asignados" (diet.js:17, 95, 195, 196, 237, 247, 569, 783, 830)

## 8. Energy balance: Side-by-side, recomposition, and bug fixes

- [x] 8.1 Restructure energy view to render "Estado Actual" and "Desglose TDEE" as two side-by-side cards
- [x] 8.2 Ensure both cards have equal height using CSS grid or flexbox
- [x] 8.3 Update recomposition detection to use only last 4 measurement sets (not all-time)
- [x] 8.4 Update recomposition logic: weight stagnant (±0.5 kg) + waist/hips decrease ≥ 1 cm → "Recomposición detectada"
- [x] 8.5 Add weight vs waist chart for recomposition visualization using last 4 measurements
- [x] 8.6 **FIX: "Aplicar Recomendación" modifies diet** — call `db:adjustMealGrams`, show confirmation (adaptive.js:363-373)
- [x] 8.7 **FIX: Weight gain shown as loss rate** — distinguish gain vs loss with sign-aware label (adaptive.js:143, 167)
- [x] 8.8 **FIX: Guard currentDeficit when no daily plan** — show guidance when planned_intake is 0 (adaptive.js:323)
- [x] 8.9 **FIX: Recomp chart responsive** — use maintainAspectRatio: false with .chart-container (adaptive.js:258, 298)
- [x] 8.10 **FIX: Chart destroy before empty-state** — move destroy guard to top of loadRecomp (adaptive.js:265)
- [x] 8.11 **FIX: Guard JSON.parse in loadHistory** — wrap in try/catch (adaptive.js:441)
- [x] 8.12 **FIX: loadDeficitImpact per-slot deduplication** — sum only selected/default template per slot (adaptive.js:399-403)
- [x] 8.13 **FIX: Remove hardcoded "mediciones" string** in recomp summary (adaptive.js:251)
- [x] 8.14 **FIX: Add error state cards with retry** to all 6 load functions in adaptive.js

## 9. Body measurements: Form, responsive table, evolution chart, and bug fixes

- [x] 9.1 Redesign measurement input form into 4 fieldsets: Cuello y Hombros, Torso, Brazos, Piernas
- [x] 9.2 Add Lucide icons to each fieldset legend via `icon()` utility
- [x] 9.3 Ensure all 13 metrics + weight have input fields (add any missing)
- [x] 9.4 Pre-fill all inputs with last known values
- [x] 9.5 Make measurement history table responsive with horizontal scroll and sticky first column (date)
- [x] 9.6 Add per-metric trend arrows (▲/▼/―) to each cell in history table comparing to previous row
- [x] 9.7 Fix "Ver todo" button functionality at all viewport widths
- [x] 9.8 Replace chest/neck/shoulders multi-line chart with evolution chart (waist, chest, hips trend lines with current value + delta KPI)
- [x] 9.9 Add "Más datos necesarios para ver tendencia" placeholder when only 1 measurement set exists
- [x] 9.10 **FIX: Navy body-fat not requiring hips for males** — check sex before requiring hips_cm (measurements.js:175, 419)
- [x] 9.11 **FIX: Chart labels aligned with data points** — filter labels and data together (measurements.js:366-367, 480, 485)
- [x] 9.12 **FIX: Remove dead getProfile() call in loadHistory** (measurements.js:200)
- [x] 9.13 **FIX: Empty-state text for hidden charts** — add strings.states.noData below hidden chart headings (measurements.js:244, 410, 429, 465)
- [x] 9.14 **FIX: Remove hardcoded delete confirm fallback** (measurements.js:228)
- [x] 9.15 **FIX: Add error state cards with retry** to all load functions in measurements.js

## 10. Strength training: Spanish, layout, session logging, and bug fixes

- [x] 10.1 Reorder training view sections: Frecuencia → Rutina → Registrar Sesión → Progresión → Mantenimiento
- [x] 10.2 Add placeholder content for progression chart when no sessions exist: "Registra sesiones para ver tu progresión"
- [x] 10.3 Add placeholder content for strength maintenance when < 2 weeks: "Registra al menos 2 semanas de entrenamiento"
- [x] 10.4 Hide permanently-empty chart sections (those with no applicable data source)
- [x] 10.5 Update exercise library display to use Spanish names from DB (post-migration)
- [x] 10.6 Update muscle group filter labels to Spanish
- [x] 10.7 **FIX: Use returned session id for saveTrainingSet calls** (training.js:215, 220, 223)
- [x] 10.8 **ADD: Inline set editor in session list** — exercise select, load, reps, RPE, add/delete per set
- [x] 10.9 **FIX: Re-attach plan button listeners in loadActivePlan** (training.js:320-357)
- [x] 10.10 **ADD: Routine CRUD** — edit name button, delete with confirm, add/remove exercises per day
- [x] 10.11 **FIX: Translate muscle_group, equipment, movement_pattern** in display (training.js:459, 189, 264, 345, 429, 436)
- [x] 10.12 **FIX: Replace emoji MUSCLE_ICONS with Lucide SVGs** (training.js:359-381) — no 🧠 for abs, no 🦅 for dorsal
- [x] 10.13 **FIX: Refresh loadStrengthStatus after session create** (training.js:125-134 vs 234-237)
- [x] 10.14 **FIX: Button label "Frecuencia" → "Ver Planes"** (training.js:15, 28)
- [x] 10.15 **FIX: Remove hardcoded "Planes disponibles:" and "Plan activo:"** — use locale keys (training.js:159, 354)
- [x] 10.16 **FIX: Add error state cards with retry** to loadSessions, loadProgression, loadDeltas, loadStrengthStatus, loadActivePlan

## 11. Analytics: Race condition, colors, empty states, and KPI fixes

- [x] 11.1 **FIX: _loadingAnalytics race condition** — set flag before await, clear in finally (analytics.js:746-747)
- [x] 11.2 **FIX: NaN bpm KPI** — guard against zero filtered count (analytics.js:193, 200)
- [x] 11.3 **FIX: Replace hardcoded chart colors with chartColorWithAlpha** — remove ACTIVITY_COLORS hex array, remove all rgba/#[hex] literals (analytics.js:15-18, 260, 318, 432, 479, etc.)
- [x] 11.4 **FIX: Chart destroy-before-recreate** — move destroy calls to top of all 8 render functions (analytics.js:250, 309, 376, 424, 470, 527, 669, 719)
- [x] 11.5 **ADD: Top-level empty state banner** when no Apple Health data imported (analytics.js)
- [x] 11.6 **ADD: KPI trend indicators** — period-over-period arrows on 5 KPI cards (analytics.js:197-211)
- [x] 11.7 **FIX: Walking/cycling distance mini-cards with KPI stats** — add current/avg/min/max (analytics.js:648-657)
- [x] 11.8 **FIX: Custom date range validation** — reject reversed ranges with message (analytics.js:117-125)
- [x] 11.9 **FIX: Debounce custom date apply button** — 300ms debounce (analytics.js)
- [x] 11.10 **FIX: Remove dead getTrend function** (analytics.js:134-141)
- [x] 11.11 **FIX: renderMiniDistanceChart valueKey param** — use `d[valueKey]` not hardcoded `d.km` (analytics.js:716)

## 12. Transversal: Error states, chart leaks, loading flags, strings

- [x] 12.1 **Import `renderStateCard` from state-card.js** in dashboard.js, activity.js, diet.js, adaptive.js, measurements.js, training.js, analytics.js
- [x] 12.2 **Replace silent safeCall fallbacks with error-state cards** when `ok: false` in all 7 views
- [x] 12.3 **Move Chart.js destroy() to top of all render functions** across adaptive, analytics, measurements (before empty-data early-return)
- [x] 12.4 **Wrap init() in try/finally** for dashboard, activity, analytics to release loading flags on error
- [x] 12.5 **Extract trend arrow utility** to `src/renderer/utils/trend-arrow.js` — `getTrendArrow(current, previous, threshold)` returning {arrow, class}
- [x] 12.6 **Barrido de strings hardcodeados** — replace all `|| 'texto'` fallbacks, hardcoded "kcal", "min", emoji, table headers with locale keys across all views
- [x] 12.7 **Fix SpO2 sparkline ordering bug** — normalize all HealthSync metric queries to ASC order (ipc-handlers.js:1215) [moot if SpO2 card removed, but prevents future landmines]

## 13. CSS: New components and layout utilities

- [x] 13.1 Add side-by-side card layout utility (`.card-row`, `.card-half`)
- [x] 13.2 Add collapsible `<details>` / `<summary>` styles with chevron icon
- [x] 13.3 Add category pill styles (`.category-pill`, per-category color variants including Legumbres)
- [x] 13.4 Add body-part fieldset grid styles (`.measurement-fieldset`, 2-column inside fieldset)
- [x] 13.5 Add responsive measurement table styles (`.table-responsive`, sticky column, horizontal scroll)
- [x] 13.6 Add trend arrow styles in table cells (`.trend-up`, `.trend-down`, `.trend-flat`)
- [x] 13.7 Add sleep phase stacked bar styles (`.sleep-phases`)
- [x] 13.8 Add daily plan running-total styles (`.meal-total`, `.daily-aggregate`)
- [x] 13.9 Add compliance indicator styles (`.compliance-ok`, `.compliance-warn`)
- [x] 13.10 Add fixed recipe display styles (`.fixed-recipe`)
- [x] 13.11 Add day type toggle styles (`.day-type-toggle`, `.day-type-active`)
- [x] 13.12 Add error state card styles (`.state-error`, `.retry-button`)
- [x] 13.13 Add training set editor styles (`.set-editor`, `.set-row`, `.set-add-form`)
- [x] 13.14 Add analytics empty-state banner styles (`.empty-banner`, `.empty-cta`)
- [x] 13.15 Remove any styles specific to now-deleted cards (SpO2, BP, standing hours, bottom empty card)

## 14. Tests

- [x] 14.1 Add unit test for sleep consistency score computation
- [x] 14.2 Add unit test for cache table populate/query round-trip
- [x] 14.3 Add unit test for recomposition detection with last 4 measurements
- [x] 14.4 Add unit test for food category mapping (including legumes and plant proteins)
- [x] 14.5 Add unit test for trend arrow computation (period comparison + context-aware for resting metrics)
- [x] 14.6 Add unit test for daily plan gram clamping
- [x] 14.7 Add unit test for saveTrainingSession returning real id
- [x] 14.8 Add unit test for saveMeasurementSet upsert (same date updates, not duplicates)
- [x] 14.9 Add unit test for Navy body-fat male without hips
- [x] 14.10 Add unit test for chart label/data alignment (no misaligned plots)
- [x] 14.11 Update dashboard smoke test: verify new cards render, removed cards absent, no duplicate RHR
- [x] 14.12 Update activity smoke test: verify ranking chart renders, period selector works, no dead canvases
- [x] 14.13 Update diet smoke test: verify collapsible managers, fixed recipes, daily plan, add-dish works, swap no duplicates
- [x] 14.14 Update energy smoke test: verify side-by-side layout, apply recommendation modifies plan
- [x] 14.15 Update measurements smoke test: verify body-part form, responsive table, Navy male without hips
- [x] 14.16 Update training smoke test: verify Spanish names, layout order, set editor, plan buttons work
- [x] 14.17 Add analytics smoke test: verify no race condition, no NaN KPI, theme-aware colors, empty-state banner
- [x] 14.18 Run full test suite (`npm test`) and verify all tests pass
