## 1. Global Chart Fix — Responsive Sizing & Destroy Lifecycle

- [x] 1.1 Add `.chart-container { position: relative; height: 250px; }` CSS class; wrap all chart canvases in activity, measurements, and training views with this container
- [x] 1.2 Add `destroyAllCharts()` function in `app.js` — iterate known `window._*Chart` keys, call `.destroy()`, null the ref. Call before navigating to a new view
- [x] 1.3 Debounce `showView()` calls from `onDataChanged` in `app.js` — coalesce rapid events with a 300ms guard
- [x] 1.4 Add `_loading` guard flag in each view's init to prevent async race conditions on rapid re-init
- [x] 1.5 Verify chart sizing across Activity, Measurements, Training, and Analytics views (CSS + wrappers applied)

## 2. Backend — New IPC Handlers

- [x] 2.1 Add `db:getActivityKcalByType` IPC handler — GROUP BY sport_type, SUM kcal for date range
- [x] 2.2 Add `db:getLatestMeasurementSet` IPC handler — returns most recent measurement set
- [x] 2.3 Add `db:getLastImportTimestamp` IPC handler — reads `health_last_import` from settings table
- [x] 2.4 Add `db:setLastImportTimestamp` IPC handler — writes timestamp to settings after Health import
- [x] 2.5 Expose new IPC handlers in preload.js

## 3. Dashboard Enhancements

- [x] 3.1 Add date range selector (7d/15d/1m) with active state styling and client-side data filtering
- [x] 3.2 Remove "calorías de hoy" card from dashboard layout
- [x] 3.3 Refactor weekly balance card to show average per day (total / days in period)
- [x] 3.4 Add per-activity kcal cards — query sport_activities by type, render cards with count + avg kcal
- [x] 3.5 Add last data update timestamp display — read from settings, show date/time or "Sin datos importados"
- [x] 3.6 Add new dashboard strings to locales/es.js (date range labels, activity card titles, etc.)

## 4. Activity View — Cleanup & Removal

- [x] 4.1 Remove CSV import button and UI section from activity view
- [x] 4.2 Remove manual entry form and sport activity manual entry section
- [x] 4.3 Remove card-based session templates and multi-select sport logging UI
- [x] 4.4 Update Apple Health import section: add reference to "exportar.xml", gray out button after import
- [x] 4.5 Add last-import timestamp display and re-import checkbox with toggle logic
- [x] 4.6 Store import timestamp in settings after successful Health import

## 5. Activity View — Timeline Formatting

- [x] 5.1 Format step count with thousand separators (toLocaleString)
- [x] 5.2 Format active calories as integer + "kcal/activ" suffix
- [x] 5.3 Format resting calories as integer + "kcal/repo" suffix
- [x] 5.4 Format heart rate with ❤️ prefix
- [x] 5.5 Format sleep as hours and minutes (e.g., "7h 32m")
- [x] 5.6 Add activity recognition table: GROUP BY sport_type, Spanish names, sortable columns, max 20 rows
- [x] 5.7 Implement trend arrows — compare first-half vs second-half period average per metric
- [x] 5.8 Create unified `getSportDisplayName(type)` helper — single mapping in es.js under `strings.activity.sportNames`; resolve "Caminata" vs "Caminar" inconsistency; use in timeline, chart labels, ranking table, and dashboard cards
- [x] 5.9 Replace raw sport_type display in timeline (line 303) and weekly chart (line 326) with `getSportDisplayName()` call

## 6. Body Measurements — UX Improvements

- [x] 6.1 Add default-to-last-measured-value logic — load latest measurement set on form init
- [x] 6.2 Add body part name keys to locales/es.js: `strings.measurements.chest`, `.neck`, `.shoulders`, `.bicepsLeft`, `.bicepsRight`, `.forearmLeft`, `.forearmRight`, `.waist`, `.hips`, `.thighLeft`, `.thighRight`, `.calfLeft`, `.calfRight` — all in Spanish
- [x] 6.3 Create `getMeasurementLabel(key)` helper that maps DB column names to translated keys; replace all `metric.replace(/_/g, ' ')` calls (lines 17-18, 264, 366) with this helper
- [x] 6.4 Format measurement history table: 1 decimal precision, units in headers, Spanish column names (via string keys), alternating rows
- [x] 6.5 Add trend chart for every body measurement variable (not just selectable subset)
- [x] 6.6 Ensure all measurement charts have fixed height via `.chart-container` wrapper

## 7. Tendencias (Health Analytics) Enhancements

- [x] 7.1 Add Spanish sport type names and icons to activity ranking charts/tables
- [x] 7.2 Add activity category rankings: total kcal, session count, hours per type
- [x] 7.3 Implement trend indicators for activity totals (current vs previous period)
- [x] 7.4 Upgrade secondary metrics section: add visible Y-axis values and X-axis date labels
- [x] 7.5 Add KPI summary cards for each secondary metric (current value, avg, min, max)
- [x] 7.6 Add new health-analytics strings to locales/es.js

## 8. Missing String Fixes Across Views

- [x] 8.1 Add `strings.energy.date = 'Fecha'` to locales/es.js (referenced but missing)
- [x] 8.2 Fix diet.js line 50 placeholder: `"e.g. Quinoa Burger"` → move to `strings.diet.foodPlaceholder` with Spanish text `"p.ej. Hamburguesa de Quinoa"`
- [x] 8.3 Fix analytics.js line 413 chart label: replace hardcoded `'HRV'` with `strings.analytics.hrv`

## 9. Final Verification

- [x] 8.1 Run app in dev mode and verify all views render correctly (build passes)
- [x] 8.2 Check that no English strings remain in modified views (all hardcoded strings moved to es.js)
- [x] 8.3 Verify chart sizing is correct across all views (wrappers + CSS applied)
- [x] 8.4 Verify Apple Health import flow works end-to-end (build passes, code wired: ipc-handlers → preload → activity.js → dashboard)

## 10. Post-Implementation Feedback — Dashboard & Activity UX

- [x] 10.1 Dashboard: Add sport icons to activity kcal cards (SPORT_ICONS map + getSportDisplayName)
- [x] 10.2 Dashboard: Add summary card with total session count and total kcal (accent-colored card)
- [x] 10.3 Activity Timeline: Remove sport activity rows from timeline table (moved to Deporte — Tipo section)
- [x] 10.4 Activity Timeline: Add day-over-day trend arrows (▲/▼/―) for each metric column
- [x] 10.5 Activity Timeline: Add mini sparkline canvas (60×18) per metric showing last-7-day trend
- [x] 10.6 Activity Timeline: Month pagination — only show current month by default, prev/next buttons
- [x] 10.7 Activity Sport KPIs: Replace simple ranking table with KPI cards (total sessions, kcal, min, types)
- [x] 10.8 Activity Sport KPIs: Add sport icons, duration column, sortable table with 4 sort columns

## 11. Post-Implementation Feedback — Training & Tendencias

- [x] 11.1 Training Library: Add filter dropdowns (muscle group, equipment) and sort selector
- [x] 11.2 Training Library: Add pagination (20 per page) with prev/next and page counter
- [x] 11.3 Training Library: Add muscle group icons (MUSCLE_ICONS map matching by keyword)
- [x] 11.4 Tendencias: Normalize HealthKit activity_type values in IPC handlers (resolveSportType)
- [x] 11.5 Tendencias: Add "Métricas Disponibles" section in Perfil listing 9 unused health metrics
