## Context

The app has 7 views + Tendencias (health-analytics). Real usage revealed: charts render oversized vertically, Activity view has unused CSV/manual entry UI, timeline lacks formatting, measurements need defaults and trends, dashboard needs activity-specific KPIs.

## Goals / Non-Goals

**Goals:**
- Restructure Dashboard with date selector, per-activity kcal cards, avg/day balance, last-update indicator
- Remove CSV import, manual entry, and sport activity entry from Activity view
- Improve Apple Health import UX with last-import timestamp and re-import toggle
- Format timeline with icons, units, hh:mm for sleep, activity recognition table
- Default measurements to last measured value, Spanish labels, formatted history, trends
- Fix Chart.js responsive sizing across all views
- Enhance Tendencias with exercise recognition, rankings, improved secondary metrics
- Add IPC handlers for per-activity kcal aggregation, last-import tracking, measurement trends

**Non-Goals:**
- No new database tables (all data already in activity_days, sport_activities, measurement_sets)
- No new external dependencies
- No changes to Energy, Training, or Profile views (diet.js gets a small placeholder fix only)
- No Apple Health re-architecting (HealthSync stays as-is)

## Decisions

1. **Activity view: remove CSV/manual entry UI entirely, keep HealthSync as sole data source**
   Rationale: User confirmed all data comes from Apple Health import only. Removing CSV/manual entry reduces code surface and UX clutter. The `db:importAppleHealthXML` handler stays; the CSV import handler can be deprecated but not removed from backend (data may exist).

2. **Dashboard date range: client-side filter over existing IPC data**
   Instead of new backend endpoints, the Dashboard will query full available data on init and filter client-side for 7d/15d/1m ranges. This avoids new IPC handlers for time-windowed aggregation and works with existing `db:getActivityDays` and `db:getSportActivities`.

3. **Per-activity kcal cards: aggregation from sport_activities table**
   A new IPC handler `db:getActivityKcalByType` will GROUP BY sport_type and SUM kcal for the filtered period. This is a simple query on the existing `sport_activities` table with a date range WHERE clause.

4. **Timeline formatting: purely frontend string formatting**
   Steps → toLocaleString() with comma separators. Active kcal → Math.round() + " kcal/activ". Resting kcal → same + " kcal/repo". HR → ❤️ prefix. Sleep → hours and minutes conversion (`${h}h ${m}m`). All handled in the view's render function.

5. **Activity recognition table: new frontend table from sport_activities data**
   No new backend needed. The existing `db:getSportActivities` IPC returns all workouts. The view will group by sport_type, compute counts and avg kcal, render a sortable ranking table. Sport types mapped to Spanish names (cycling → bicicleta, walking → caminata, etc.).

6. **Measurement defaults: last value via IPC query**
   A new lightweight handler `db:getLatestMeasurementSet` returns the most recent measurement set. The measurement form's init function loads these as placeholder/default values.

7. **Chart responsive fix — multiple root causes**
   Investigation revealed four compounding problems:

   a. **Missing CSS height constraint on chart parents** — activity, measurements, and training views put `<canvas>` directly inside `.card` elements with no explicit height. Analytics uses `.chart-container { height: 200px }` which is why it works. Fix: add `.chart-container { position: relative; height: 250px; }` class and wrap all chart canvases in it.

   b. **Charts never destroyed on view exit** — when switching from activity to measurements, `_weeklyChart`, `_progChart`, `_weightChart`, `_measChart`, `_bfChart`, plus all 12 analytics charts remain alive in Chart.js's internal registry with active ResizeObservers. Each resize event fires all of them, including hidden ones. Fix: add a `destroyAllCharts()` function in `app.js` that iterates known `window._*Chart` keys and calls `.destroy()` before navigating to a new view.

   c. **onDataChanged re-triggers showView in a loop** — line 40 of `app.js` re-invokes `showView()` on any data change event. If save operations emit multiple events, this causes rapid re-initialization. Fix: debounce `showView()` calls from `onDataChanged` (e.g., 300ms coalesce) or guard with a flag.

   d. **Async race conditions on rapid re-init** — `init()` is async. If called twice before the first completes, two `loadChart()` calls can race: both pass the `if (window._chart) destroy()` guard before either creates, then both create new Chart instances. The second overwrites the ref, the first is orphaned. Fix: use a guard flag (`_loading`) in each view's init.

8. **Health import UX: store last-import metadata in settings table**
   After a successful import, store `{ key: 'health_last_import', value: ISO timestamp }` in the settings table. The Activity view reads this on init to show last-import time and enable re-import toggle.

9. **Trend arrows: computed frontend from date-range data**
   For each metric (steps, sleep, activity kcal), compare first-half vs second-half average within the selected period. If upward → green ▲, downward → red ▼, flat → gray ―.

10. **Sport type display name registry — unified mapping function**
    Currently there are two separate mappings with inconsistencies: `SESSION_TEMPLATES` in activity.js (`walking → "Caminata"`) vs `strings.activity.*` in es.js (`walking → "Caminar"`). The timeline (line 303) and weekly chart (line 326) bypass both and display raw English DB values. Fix: create a single `getSportDisplayName(type)` helper that reads from a unified object in es.js (e.g., `strings.activity.sportNames`), used everywhere. Resolve `"Caminata"` vs `"Caminar"` by choosing one (prefer `"Caminata"` as the timeline label, keep `"Caminar"` for the verb form).

11. **Body part name keys in es.js**
    Measurements view currently generates labels via `metric.replace(/_/g, ' ')` producing English names like "chest (cm)", "neck (cm)". Add keys `strings.measurements.chest`, `.neck`, `.shoulders`, `.bicepsLeft`, `.bicepsRight`, `.forearmLeft`, `.forearmRight`, `.waist`, `.hips`, `.thighLeft`, `.thighRight`, `.calfLeft`, `.calfRight` in es.js. Create a `getMeasurementLabel(key)` function that maps DB column names to these keys.

12. **Fix missing and untranslated strings**
    - Add `strings.energy.date = 'Fecha'` to es.js (referenced but missing)
    - Fix diet.js line 50 placeholder: `"e.g. Quinoa Burger"` → `"p.ej. Hamburguesa de Quinoa"` and move to `strings.diet.foodPlaceholder`

## Risks / Trade-offs

- **Dashboard date filter is client-side only** → Large date ranges with 1yr+ data could be slow. Mitigation: limit default to 90 days, add lazy-load if needed.
- **Removing CSV/manual entry IPC handlers** → Existing data in DB is unaffected, but handlers remain for backward compat. They won't be exposed in preload.js anymore.
- **Chart fix may need per-view tuning** → Not all chart containers have same layout. Mitigation: use a shared CSS class `.chart-container { height: 300px; }` and override per-view if needed.
- **Sport type mapping inconsistency** → Two existing mappings with conflicting values ("Caminata" vs "Caminar"). Mitigation: unify in es.js with `sportNames` object; pick "Caminata" for the display noun, keep "Caminar" for the verb.
- **Charts destroyed on view exit** → `destroyAllCharts()` in app.js must know all possible chart key names. Mitigation: use a consistent `window._<view>Chart` naming convention across all views, or register all charts in a single array `window._allCharts = []` that each view pushes to.
- **Last-import stored in settings** → Simple key-value, but no history of multiple imports. Mitigation: sufficient for v1; can add import_history table later.
- **Body part names are many** → 13 metric keys for L/R variants. Mitigation: generate the es.js keys programmatically via a helper loop rather than hand-typing each one.
