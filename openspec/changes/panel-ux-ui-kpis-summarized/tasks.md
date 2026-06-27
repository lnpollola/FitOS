# Tasks

## 1. KPI Derivation Utilities

- [ ] 1.1 Create `src/renderer/utils/kpi-derivation.js` with the `paceProjection(d1_km, t1_min, d2_km)` function (Riegel: t2 = t1 × (d2/d1)^1.06)
- [ ] 1.2 Add `projectStandardDistances(activities, sport_type, standardDistances)` returning best projected time per distance bucket (respect 0.8×–1.5× projection window)
- [ ] 1.3 Add `rankRecords(records)` returning each record with `rank: 1|2|3` based on all-time best per (sport_type, distance)
- [ ] 1.4 Add `effortMultiplier(sport_type)` lookup with the 7 sport types (running 1.4, cycling 1.2, swimming 1.5, hiit 1.6, strength 1.3, walking 1.0, other 1.1) plus default
- [ ] 1.5 Add `computeWeeklyEffort(activities, activityDays)` returning integer effort for a week
- [ ] 1.6 Add `isoWeek(date)` helper returning `{ year, week }` using ISO 8601 rules
- [ ] 1.7 Add `computeStreak(activityDates)` returning `{ weeks, totalActivities, isActive, lastBrokenDate }` with current-week grace period
- [ ] 1.8 Add `formatDuration(minutes)` returning "Xh Ym" or "Xm" (e.g., `formatDuration(249) === '4h 9m'`)
- [ ] 1.9 Add `formatDateLong(date)` returning "15 de junio de 2026" (Spanish)
- [ ] 1.10 Add `formatDateShort(date)` returning "15 jun" (Spanish month abbreviations)
- [ ] 1.11 Add `effortLevel(value)` returning one of `very-high` (>70) | `high` (40–70) | `moderate` (20–40) | `low` (<20)

## 2. Locale Strings

- [ ] 2.1 Add `strings.stravaPanels.prBanner.*` (title, rankLabels array, distanceLabels map, empty, viewAll) in `src/renderer/locales/es.js`
- [ ] 2.2 Add `strings.stravaPanels.weeklyGoal.*` (title, progress, empty)
- [ ] 2.3 Add `strings.stravaPanels.relativeEffort.*` (title, currentWeek, previousWeek, level labels, empty)
- [ ] 2.4 Add `strings.stravaPanels.trainingLog.*` (title, days array L-D, durationFormat helper, empty, weekRange template)
- [ ] 2.5 Add `strings.stravaPanels.calendar.*` (months array, today, dayAriaLabel helper, navPrev, navNext)
- [ ] 2.6 Add `strings.stravaPanels.streak.*` (weeks, activities, active, broken, startPrompt, shareSubject, shareBody)

## 3. Icon Additions

- [ ] 3.1 Register Lucide icons `medal`, `flame`, `target`, `share-2`, `chevron-left`, `chevron-right` in `src/renderer/utils/icons.js` (tree-shaken imports)
- [ ] 3.2 Verify `arrow-up`, `arrow-down`, `minus` are already registered (used by effort card)
- [ ] 3.3 Verify `sportIcon()` returns the `activity` icon as fallback for unknown sport types

## 4. IPC Handlers

- [ ] 4.1 Add `db:getPersonalRecords` handler in `src/main/ipc-handlers.js` returning ranked PRs (top 5, sorted by achieved_at DESC) — read sport_activities where distance_km >= 1.0, group by (sport_type, projected_time_to_target_distance), return best per bucket
- [ ] 4.2 Add `db:getWeeklyGoal` handler returning `{ current, target, progress_pct, primary_sport }` for current ISO week — read settings.weekly_activity_target (default 4) and count activities
- [ ] 4.3 Add `db:getRelativeEffort` handler returning `{ current_week: { value, start_date, end_date }, previous_week: { ... }, delta, trend }`
- [ ] 4.4 Add `db:getTrainingLogWeek` handler returning `{ week_start, week_end, total_minutes, total_display, days: [7 entries] }`
- [ ] 4.5 Add `db:getMonthlyCalendar` handler returning `{ month, days: [...], weeks: [...] }` for the requested month (or current if not specified)
- [ ] 4.6 Add `db:getStreak` handler returning `{ weeks, total_activities, is_active, last_broken_date }` from a single `SELECT date FROM sport_activities ORDER BY date` query
- [ ] 4.7 Verify handlers are auto-exposed via the existing `db:*` preload pass-through (no preload changes)

## 5. CSS Classes

- [ ] 5.1 Add `.strava-panel` base class (organic card surface, padding, border-radius) to `src/renderer/styles/main.css`
- [ ] 5.2 Add `.strava-pr-banner` and `.strava-pr-badge--gold|--silver|--bronze` classes (badge colors `#D4A437` / `#A8A8A8` / `#A47148`)
- [ ] 5.3 Add `.strava-weekly-goal` and SVG ring classes (track opacity 0.2, fill var(--success))
- [ ] 5.4 Add `.strava-relative-effort` and `.effort-level--very-high|--high|--moderate|--low` with the 4 hex colors
- [ ] 5.5 Add `.strava-training-log` and `.strava-bubble` (fill var(--success), opacity 0.8)
- [ ] 5.6 Add `.strava-calendar` and `.strava-calendar-day--active|--inactive|--future` plus `.strava-calendar-week-status--completed|--active|--incomplete`
- [ ] 5.7 Add `.strava-streak` and `.strava-streak-share` classes
- [ ] 5.8 Verify all classes are under the `body.organic` selector and use existing tokens (no new custom properties)

## 6. Panel Module Scaffolding

- [ ] 6.1 Create `src/renderer/views/panels/strava-panels.js` with imports (strings, icons, sport-icons, chart-theme, kpi-derivation, state-card, safe-call)
- [ ] 6.2 Export `mountPersonalRecord(container)` returning a destroy() cleanup function
- [ ] 6.3 Export `mountWeeklyGoal(container)` returning destroy()
- [ ] 6.4 Export `mountRelativeEffort(container)` returning destroy()
- [ ] 6.5 Export `mountTrainingLog(container)` returning destroy()
- [ ] 6.6 Export `mountStreak(container)` returning destroy()
- [ ] 6.7 Export `mountMonthlyCalendar(container)` returning destroy() — separate because it owns the month-navigation state

## 7. Personal Record Panel

- [ ] 7.1 Render initial HTML shell with `.strava-pr-banner` class and a `renderStateCard(state: 'loading')` skeleton
- [ ] 7.2 Fetch `db:getPersonalRecords` via `safeCall`, show error state on failure with retry
- [ ] 7.3 On success: pick the most-recent PR (achieved_at DESC), render badge (medal icon + rank class), label, time, date
- [ ] 7.4 On empty: render empty state with "Ir a Actividad" button calling `electronAPI.navigate('activity')`
- [ ] 7.5 Add "Ver todos (N)" link that opens a modal listing all 5 PRs (modal is a simple `<dialog>` element)
- [ ] 7.6 Format time per spec (mm:ss under 1h, h:mm:ss over 1h), distance labels in Spanish, ordinals 1.º/2.º/3.º

## 8. Weekly Goal Ring Panel

- [ ] 8.1 Render initial HTML shell with `.strava-weekly-goal` class and skeleton
- [ ] 8.2 Fetch `db:getWeeklyGoal` via safeCall
- [ ] 8.3 On success: render SVG ring (track + fill arcs) and center sport icon
- [ ] 8.4 Implement ring math: arc length = (progress_pct / 100) × circumference, with 360° starting at 12 o'clock
- [ ] 8.5 Render progress text "X/N actividades" using `strings.stravaPanels.weeklyGoal.progress`
- [ ] 8.6 Make the card focusable (`tabindex="0"`) and respond to Enter/Space via `electronAPI.navigate('activity')`
- [ ] 8.7 Handle empty week: center icon = `target` Lucide icon, progress text "0/N actividades"

## 9. Relative Effort Panel

- [ ] 9.1 Render initial HTML shell with `.strava-relative-effort` and skeleton
- [ ] 9.2 Fetch `db:getRelativeEffort` via safeCall
- [ ] 9.3 On success: render current-week value (large, color-coded by level) and previous-week value (small, secondary)
- [ ] 9.4 Compute effort level class via `effortLevel(value)` and apply `.effort-level--very-high|--high|--moderate|--low`
- [ ] 9.5 Render date ranges formatted via `formatDateShort()` (e.g., "23 jun – 29 jun 2026")
- [ ] 9.6 Render trend indicator (arrow-up/arrow-down/minus) with delta value
- [ ] 9.7 Add chevron `>` on the right edge and `aria-label="Ver detalle semanal"` (no-op click for v1)

## 10. Training Log Bubble Panel

- [ ] 10.1 Render initial HTML shell with `.strava-training-log` and skeleton
- [ ] 10.2 Fetch `db:getTrainingLogWeek` via safeCall
- [ ] 10.3 On success: render 7 columns (L-D) with day labels
- [ ] 10.4 For each day, compute bubble radius via `MIN_RADIUS + (duration / max) × (MAX_RADIUS - MIN_RADIUS)` (8 px → 28 px)
- [ ] 10.5 Render each bubble as a `<button>` with `aria-label` including day name, date, and duration
- [ ] 10.6 For duration >= 60 min, render a duration label below the bubble using `formatDuration()`
- [ ] 10.7 Render header with week range and total using `formatDateShort()` and `formatDuration()`
- [ ] 10.8 Handle empty week: hide all bubbles, show "Sin entrenamientos esta semana" instead of header
- [ ] 10.9 Wire bubble click → `electronAPI.navigate('activity')` with date filter

## 11. Monthly Calendar Panel

- [ ] 11.1 Render initial HTML shell with `.strava-calendar` and skeleton
- [ ] 11.2 Render header with month label, left/right chevron buttons, "Hoy" button
- [ ] 11.3 Render 7-column grid (5 or 6 rows) in ISO order (Mon-Sun)
- [ ] 11.4 Fetch `db:getMonthlyCalendar` via safeCall (passing current month as parameter)
- [ ] 11.5 For each day cell: render sport icon (if has_activity) on white circle, or day number on dark circle
- [ ] 11.6 Add small white dot to active days with multiple activities
- [ ] 11.7 Render right-side week status column with check / flame / gray circle per spec
- [ ] 11.8 Future days: ghost with 50% opacity, no click, no hover
- [ ] 11.9 Wire day cell click → `electronAPI.navigate('activity', { date })` with date param
- [ ] 11.10 Wire left/right chevron → re-fetch with prev/next month (clamp left at first activity month, allow right up to 12 months future)
- [ ] 11.11 Wire "Hoy" button → re-fetch with current month
- [ ] 11.12 Wire day cell keyboard activation (Enter/Space)

## 12. Streak Panel

- [ ] 12.1 Render initial HTML shell with `.strava-streak` and skeleton
- [ ] 12.2 Fetch `db:getStreak` via safeCall
- [ ] 12.3 On success: render two large numbers (Fraunces 36 px) "N Semanas" and "M Actividades" plus the share button
- [ ] 12.4 On broken streak (weeks = 0): render "Sin racha activa" in place of the two metrics, disable share button
- [ ] 12.5 On never-started: render "Inicia tu primera semana de actividad" CTA
- [ ] 12.6 Wire share button → open `mailto:` with subject and body templates, URL-encoded
- [ ] 12.7 Add `aria-label` to share button and to the active/broken states

## 13. Dashboard Integration

- [ ] 13.1 In `src/renderer/views/dashboard.js`, add a "RESUMEN" section header above the hero card
- [ ] 13.2 Import all 5 mount functions + the calendar controller from `views/panels/strava-panels.js`
- [ ] 13.3 Create 5 placeholder containers in the dashboard HTML for the panels
- [ ] 13.4 Call all 5 mount functions concurrently via `Promise.allSettled` so the panels stream in independently
- [ ] 13.5 Ensure existing health-metrics grid, trend charts, and sports section render unchanged below the Strava block
- [ ] 13.6 Subscribe to `electronAPI.onDataChanged()` to re-fetch all 5 panels when any data changes
- [ ] 13.7 Verify Chart.js instances are destroyed before re-create on re-render (existing pattern, no new chart instances added)
- [ ] 13.8 Add subtle "Esta semana" / "Este mes" labels to each panel per spec

## 14. Unit Tests

- [ ] 14.1 Create `tests/unit/kpi-derivation.test.js`
- [ ] 14.2 Test `paceProjection` (5 km from 1 km PR, projection window enforcement)
- [ ] 14.3 Test `rankRecords` (top 3 ranks assigned correctly, ties broken by date)
- [ ] 14.4 Test `effortMultiplier` for all 7 sport types + default
- [ ] 14.5 Test `computeWeeklyEffort` (sum of sport_kcal × multiplier + NEAT)
- [ ] 14.6 Test `isoWeek` (Mon-Sun boundary, year boundary edge cases)
- [ ] 14.7 Test `computeStreak` (active streak, current-week grace period, broken streak, never-started)
- [ ] 14.8 Test `formatDuration` (Xh Ym format, Xm under 1h)
- [ ] 14.9 Test `formatDateLong` and `formatDateShort` (Spanish month names)
- [ ] 14.10 Test `effortLevel` thresholds (>70, 40-70, 20-40, <20)

## 15. Smoke Tests

- [ ] 15.1 Create `tests/smoke/strava-panels.test.js`
- [ ] 15.2 Test PR banner renders with seed data (1 running + 1 cycling activity)
- [ ] 15.3 Test weekly goal ring renders with the correct progress pct
- [ ] 15.4 Test relative effort card shows current and previous week values
- [ ] 15.5 Test training log renders 7 day columns with bubble sizes proportional
- [ ] 15.6 Test monthly calendar renders 30-31 day cells with sport icons for active days
- [ ] 15.7 Test streak shows "0 semanas" with empty state when no activities
- [ ] 15.8 Test that the dashboard renders all 5 panels + the existing health-metrics grid (no regressions)

## 16. Verification

- [ ] 16.1 Run `npm test` and confirm all tests pass (62/62 expected)
- [ ] 16.2 Run `npm run dev` and visually verify each panel with sample data
- [ ] 16.3 Verify the empty state for each panel (delete seed data temporarily, re-add)
- [ ] 16.4 Verify keyboard navigation on all interactive elements (chevrons, day cells, bubbles, share button, weekly goal card)
- [ ] 16.5 Verify the date-range selector still gates only the existing health-metrics grid, not the Strava panels
- [ ] 16.6 Verify data-change events trigger panel re-renders without full view reload
- [ ] 16.7 Run `npm run build` and confirm `app.asar` size delta is < 100 KB (no new deps)
- [ ] 16.8 Verify no inline styles introduced in the new panels (all styling via `.strava-panel-*` classes)
- [ ] 16.9 Verify all new UI strings live in `strings.stravaPanels.*` (no hardcoded Spanish in templates)
- [ ] 16.10 Update `AGENTS.md` "Sesión" section to archive this change after implementation
