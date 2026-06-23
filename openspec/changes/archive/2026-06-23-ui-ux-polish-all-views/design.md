## Context

The app has 7 functional views after the organic redesign, but data presentation, usability, and performance issues persist. The organic redesign focused on visual aesthetics (typography, palette, microcharts) without addressing structural problems: broken daily plan editing, empty/misleading charts, missing trend indicators, English exercise names, and slow dashboard loads from repeated full-table scans. This design addresses those structural issues while preserving the organic "libreta de campo" aesthetic.

**Current state**: All views render but with gaps — the diet daily plan editor has runaway increment bugs; the dashboard shows cards with no data source (SpO2, BP); measurement tables are unresponsive; training charts are empty; food/dish managers clutter the diet view; exercise names are in English. A deeper audit uncovered 5 critical functional bugs (silent FK violations in add-dish, orphaned training sets from `saveTrainingSession` returning `true`, dead plan buttons on init, "Aplicar Recomendación" not modifying the diet, swap-food duplicating entries), 10+ data-accuracy bugs (misaligned chart labels, trend arrows comparing wrong periods, Navy body-fat requiring hips for males, NaN KPIs, gain shown as loss), and systemic issues (no error states, chart leaks in empty-state paths, loading flags without try/finally, hardcoded strings).

**Constraints**: Single-developer, local-first Electron + SQLite, no external APIs, vanilla JS frontend, all strings in `locales/es.js`, Chart.js for charts, CSS custom properties under `body.organic`.

## Goals / Non-Goals

**Goals:**
- Fix all broken/incomplete UI interactions (daily plan editor, period selectors, table responsiveness)
- Fix 5 critical functional bugs (add-dish FK, swap-food duplicates, session id return, plan buttons, apply recommendation)
- Fix 10+ data-accuracy bugs (trend arrows, chart label alignment, Navy male, NaN KPI, gain-as-loss)
- Add meaningful data visualization where currently missing (ranking charts, trend indicators, sleep breakdown)
- Remove dead widgets (SpO2, BP, standing hours, empty bottom card)
- Translate exercise library to Spanish (names, muscle groups, equipment, movement patterns)
- Create summary cache tables for fast dashboard/analytics loads
- Reorganize view layouts for logical information flow
- Add collapsible sections to declutter diet view
- Add error state cards with retry across all 7 views
- Fix Chart.js destroy-before-recreate in all empty-state paths
- Protect loading flags with try/finally across all views
- Fix analytics race condition, hardcoded colors, and missing empty states

**Non-Goals:**
- New views or data sources
- Real-time sync or cloud integration
- Mobile/tablet support beyond current responsive breakpoints
- New chart library or framework
- Rewriting entire views from scratch

## Decisions

### 1. Performance: Summary cache tables over materialized views or query optimization

**Decision**: Create three cache tables (`activity_summary_7d`, `activity_summary_15d`, `activity_summary_1m`) populated on every data write and on Apple Health import. IPC handlers check cache first, fall back to raw query if cache miss.

**Alternatives considered**:
- SQLite materialized views: Not supported natively; would need triggers on every base table — fragile.
- Query optimization (indexes, CTEs): Already done; the bottleneck is aggregating 6+ joined tables per dashboard load.
- In-memory JS cache: Lost on app restart, adds complexity.

**Rationale**: The cache approach is simple, works with SQLite, and the populate-on-write pattern keeps reads fast (single row fetch for summary). Cache invalidation is automatic — every write truncates and repopulates the relevant cache table. Memory overhead is negligible (3 tables × ~20 rows each).

### 2. Sleep analysis: Compute from existing HealthSync data, not new tables

**Decision**: Extract sleep data from `activity_days.sleep_hours`, `activity_days.sleep_deep`, `activity_days.sleep_rem`, `activity_days.sleep_light` columns already populated by HealthSync import. Compute consistency score as standard deviation of total sleep hours over period. Display deep/REM/light breakdown as stacked horizontal bar.

**Alternatives considered**:
- New `sleep_sessions` table: HealthSync data is day-aggregated already; no per-session detail available. Not worth the schema change.
- Apple Health Sleep Schedule API: Requires HealthKit entitlement, violates local-first constraint.

**Rationale**: HealthSync already stores sleep stage data per day. The UI just needs to surface it with computed metrics (consistency, breakdown percentages, trend).

### 3. Sport ranking comparison: Chart.js grouped bar chart, not custom SVG

**Decision**: Use Chart.js grouped bar chart with two datasets (session count, total kcal) per sport type, ordered by session count descending. Support period comparison via side-by-side bars (current period vs previous period).

**Alternatives considered**:
- Custom SVG: More organic aesthetic but complex to implement interactive comparison.
- Two separate bar charts: Less effective for comparison; takes more vertical space.
- Table with inline bars: Less visual impact for ranking comparison.

**Rationale**: Chart.js is already in the project. Grouped bars show frequency vs caloric cost at a glance. The organic chart theme applies automatically via `chart-theme.js`.

### 4. Daily plan redesign: Fix increment logic, use auto-save on blur

**Decision**: Fix the gram input handlers to use `input` event with debounce instead of `change` event. Add min/max clamping per food item's defined range. Auto-save on input blur after 500ms debounce. Show running totals per meal and daily aggregate with compliance indicators.

**Alternatives considered**:
- Full form-based approach with explicit save button: More deliberate but slower for daily use.
- Drag-to-adjust sliders: Novel but imprecise for gram-level adjustments.

**Rationale**: The auto-save-on-blur pattern matches the "quick tweak" use case for daily diet planning. Debounce prevents the runaway increment bug (multiple rapid `change` events stacking). Clamping enforces food item boundaries.

### 5. Food categorization: Hardcoded category mapping, not DB column

**Decision**: Map each food item to a category (Carbohidratos, Proteínas, Grasas saludables, Infusiones, Frutas, Verduras, Extras) via a JS mapping object in the diet view, keyed by food item ID. Display category labels as colored pills above food option groups in meal templates.

**Alternatives considered**:
- New `category` column in `food_items`: Requires migration, makes seed data management harder.
- Tag system (many-to-many): Over-engineered for 40-50 food items.

**Rationale**: The food list is small and curated. A JS mapping is sufficient and avoids a DB migration. Categories are display-only, not used in calculations. The mapping can be moved to seed data later if the list grows.

### 6. Exercise translation: Replace seed data, not runtime mapping

**Decision**: Rewrite `seed-data.js` exercise entries with Spanish names and muscle groups. Remove entries that don't apply to available equipment or training style. Update `exercise_library` table via migration that replaces English names.

**Alternatives considered**:
- Runtime translation map in `es.js`: Maintains English in DB, adds indirection for every display.
- Bilingual entries (name_es, name_en columns): Schema complexity for a one-time translation.

**Rationale**: The app is Spanish-only. Storing Spanish names directly avoids translation layers. A one-time migration is simpler than ongoing maintenance of dual columns.

### 7. Collapsible managers: CSS-only toggle with hidden checkbox or details/summary

**Decision**: Use `<details>` / `<summary>` HTML elements for collapsible food manager and elaborated dishes manager sections. Minimize both by default (`open` attribute absent). Style summary with chevron icon via `::marker` or `::before`.

**Alternatives considered**:
- JS toggle with `classList`: More control but unnecessary JS for a simple expand/collapse.
- Accordion component: Overkill for two sections.

**Rationale**: `<details>` provides built-in open/close state, is keyboard-accessible, and requires zero JS. CSS can style the marker and the open state.

### 8. Body measurement form: Grouped fieldsets with icons, not wizard steps

**Decision**: Organize the measurement input form into 4 fieldsets grouped by body part (Cuello y Hombros, Torso, Brazos, Piernas), each with a representative Lucide icon in the legend. All fields visible at once (not stepped wizard). Pre-fill with last known values. Submit saves all fields in one transaction.

**Alternatives considered**:
- Wizard/steps: Slower for experienced users who know all their measurements.
- Single flat form: Works but lacks visual organization for 10+ fields.

**Rationale**: The fieldset approach groups logically while keeping all fields accessible. Icons provide visual anchors without adding interaction steps. Pre-fill reduces data entry for repeat measurements.

### 9. Training session logging: Return lastInsertRowid, add inline set editor

**Decision**: Update `db:saveTrainingSession` to return `{ ok: true, id: lastInsertRowid }`. Add an inline set editor in the session list: clicking a session expands to show its sets with add/delete set rows. Both `saveTrainingSession` and `saveTrainingSet` get upsert paths (update if id provided, insert otherwise).

**Alternatives considered**:
- Separate "edit session" modal: More steps, slower workflow.
- Pre-generate all sets on session create: Inflexible if the user deviates from the plan.

**Rationale**: Inline editing is the fastest path for logging a workout. Returning the real id is a one-line fix that unblocks the entire set-linking pipeline. Upsert paths prevent duplicate sessions/sets on re-save.

### 10. "Aplicar Recomendación": Modify meal_components gram amounts directly

**Decision**: When the user clicks "Aplicar Recomendación", the handler SHALL call `db:adjustMealGrams({ carbDelta, fatDelta })` which updates `meal_components.default_grams` for carb and fat slots across all meal templates. A confirmation message SHALL list what changed per food item.

**Alternatives considered**:
- Create a new daily plan with adjusted grams: Requires plan regeneration logic; heavier.
- Store adjustments as a diff layer applied at render time: Adds complexity to every diet render.

**Rationale**: Modifying `meal_components` directly is the simplest path — the next daily plan generation will use the updated grams. The adjustment is reversible (user can manually change grams back). A confirmation message provides audit trail.

### 11. Error states: Use existing state-card.js, destroy charts before empty-state

**Decision**: Import `renderStateCard` from `state-card.js` in all 7 views. Replace silent `safeCall` fallbacks with error-state cards when `ok: false`. Move all Chart.js `destroy()` calls to the TOP of render functions (before empty-data early-return). Wrap all `init()` functions in try/finally to release loading flags.

**Alternatives considered**:
- Toast notifications for errors: Transient, user can miss them; no retry button.
- Global error boundary: Overkill for a vanilla JS app without framework.

**Rationale**: `state-card.js` already exists with loading/empty/error/data states and a retry callback. The pattern is documented in AGENTS.md and used in training/measurements (partially). Standardizing across all views is low-risk and high-consistency. The destroy-before-empty-state fix is a one-line move per chart function.

### 12. Analytics fixes: Debounce + guard + chartColorWithAlpha

**Decision**: Fix `_loadingAnalytics` by setting the flag synchronously before `await loadAll()` and clearing it in `finally`. Replace all hardcoded colors with `chartColorWithAlpha()` calls. Add NaN guards (check filtered count, not just array length). Add top-level empty-state banner when no HealthSync data. Validate custom date range (from ≤ to).

**Alternatives considered**:
- Request cancellation via AbortController: Electron IPC doesn't support cancellation natively.
- Memoization across overlapping ranges: Adds cache invalidation complexity.

**Rationale**: The flag + finally fix is the minimal change to prevent the race. `chartColorWithAlpha` is already imported by 4 other views. NaN guards are one-line checks. The empty-state banner reuses existing navigation infrastructure.

### 13. Diet day type toggle: Session-level state, not DB column

**Decision**: Store the selected day type (training/rest) as a JS variable in the diet view for the session. Use it to select `default_grams` or `restday_grams` when generating a daily plan. Show both gram amounts in meal templates (primary for training, muted for rest). Do NOT add a DB column to `daily_plans` — the day type is a generation-time selector, not a persisted plan attribute.

**Alternatives considered**:
- New `day_type` column in `daily_plans`: Requires migration; the day type is only relevant at generation time, not for historical plans.
- Separate rest-day templates: Doubles the template management burden.

**Rationale**: The rest-day grams already exist in `meal_components.restday_grams`. The toggle just selects which column to read at plan-generation time. No schema change needed. Both amounts are shown in templates for transparency.

## Risks / Trade-offs

- **[Cache staleness]**: If a cache populate step fails silently, reads fall back to raw query — slightly slower but never wrong. Risk: Low. Mitigation: Cache populate wrapped in same transaction as the write; if write fails, cache is untouched.
- **[Exercise migration data loss]**: Replacing English names could lose custom exercises if they don't match the migration mapping. Risk: Medium. Mitigation: Migration preserves `id` and `practical_examples` columns; only updates `name`, `muscle_group`, `equipment`, and `movement_pattern` for matching English entries. Unknown entries are flagged for manual review.
- **[Sleep data gaps]**: Not all HealthSync exports include sleep stages (deep/REM/light). Risk: Medium. Mitigation: Sleep card degrades gracefully — if stage data is null, show only total hours with note "datos de fases no disponibles".
- **[Daily plan debounce UX]**: 500ms debounce may feel laggy on fast typists. Risk: Low. Mitigation: Show subtle saving indicator (opacity change on value) during debounce window.
- **[Collapsible state persistence]**: `<details>` state resets on view re-render. Risk: Low. Mitigation: Acceptable — diet view re-renders are infrequent (only on data change via IPC event).
- **[Apply recommendation irreversibility]**: Modifying `meal_components.default_grams` directly changes the template, not just one daily plan. Risk: Medium. Mitigation: Confirmation message lists all changes; user can manually revert grams. Consider storing a "pre-adjustment" snapshot in settings for one-click undo.
- **[Training set editor scope creep]**: Adding inline set editing expands the training view significantly. Risk: Medium. Mitigation: Keep the editor minimal — add/delete set rows only, no drag-reorder, no superset grouping. Complex features can follow.
- **[Analytics race fix changing timing]**: The try/finally guard changes when `_loadingAnalytics` is cleared, which could affect rapid range-switching UX. Risk: Low. Mitigation: The guard blocks concurrent loads, which is the desired behavior — rapid clicks are ignored, not queued.

## Migration Plan

1. **DB migration**: Add 3 cache tables. Add schema version check. Run exercise name/equipment/movement_pattern translation migration. Add upsert paths to saveTrainingSession, saveTrainingSet, saveMeasurementSet, saveDish, saveTrainingRoutine.
2. **Seed data**: Rewrite `seed-data.js` exercises with Spanish names + equipment + patterns. Add elaborated dish examples. Update food category mapping for legumes/plant proteins.
3. **IPC handlers**: Fix saveTrainingSession return value. Add adjustMealGrams handler. Add getCyclingDistance, getSleepAnalysis handlers. Make getDashboardMetrics cache-aware.
4. **Frontend**: All 8 views updated. Import state-card.js in all views. Fix chart destroy ordering. Wrap init() in try/finally. Replace hardcoded strings and colors.
5. **CSS**: Add side-by-side, collapsible, responsive table, body-part form, error state, day type toggle styles.
6. **Rollback**: Cache tables are additive — dropping them returns to raw queries. Exercise names can be reverted by restoring old seed data. IPC handler changes are backward-compatible (new return fields are additive). No data loss risk.

## Open Questions

- Should the 15d/1m/3m selector in "deporte por tipo" be fixed at 7d or properly implemented for all periods? → Fixed at 7d for initial implementation, full period support can follow.
- Should cache tables be populated on a schedule (e.g., every hour) or on every write? → On every write (simple, no scheduler needed).
- Which exercises should be removed from the library? → Any exercise requiring equipment not commonly available in a home gym (e.g., cable machines, Smith machine, leg press machine) — to be determined during implementation review.
