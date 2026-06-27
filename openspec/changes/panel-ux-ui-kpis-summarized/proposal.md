## Why

FitOS currently exposes a **data-dense** dashboard: flat grids of cards with raw metrics. Although the cards show real numbers (kcal, peso, HRV, etc.), the user lacks **summary visualizations that convey achievement, momentum, and consistency at a glance** — the way Strava, Apple Fitness, and Garmin Connect do. The user has provided a detailed spec (`Newpanels.md`) describing six Strava-style panels: personal-record banner, weekly-goal ring, relative-effort comparison, weekly training-log bubble chart, monthly activity calendar with sport icons, and consecutive-week streak counter. These panels transform raw numbers into a narrative ("you ran 5 km in 30:12, your 2nd best — 61-week streak alive, 4 activities this week, 79 effort vs 12 last week") that motivates consistent training. The infrastructure already exists (sport_activities, weight_entries, dietary targets, training_sessions); this change is **mostly a new visualization layer** plus the derived-KPI calculations needed to feed it.

## What Changes

- **Personal-Record (PR) banner**: horizontal list item with badge rank (1/2/3 → gold/silver/bronze), label like "2.º tiempo más rápido en 5 km", date, and time. Computes best times per standard distance (400m, 1km, 1mi, 5km, 10km, 21.1km, 42.2km) from `sport_activities` (running/cycling) using pace → projected time per distance. Highlights the most recent or most impressive record.
- **Weekly-Goals ring card**: square card with donut chart (12–16px stroke) showing `current / target` for the current ISO week. The center of the ring shows the primary sport icon (SVG). Target defaults to 4 activities/week; configurable in settings. Color: green fill on dark gray track.
- **Relative-Effort comparison card**: shows current-week effort number (large) + date range, and previous-week effort number (smaller) + date range. Effort = Σ (sport kcal × intensity multiplier per sport_type) + steps_kcal (NEAT). Color by level: magenta >70, naranja 40–70, morado 20–40, claro <20. Chevron → to drill into weekly detail.
- **Training-Log bubble chart**: 7-column bubble chart (L-D) where each day's circle is sized proportionally to total training minutes that day. Smallest ≈ 8px, largest ≈ 28px. Label visible only if duration ≥ 60 min. Week total in the header.
- **Monthly activity calendar**: 7×N grid for the current month. Each day cell shows either a sport icon (when `has_activity`) on a white circle, or the day number on a dark circle. Right-side column: per-week status (✓ completed week / 🔥+N active streak / ◯ incomplete). Includes month navigation (←/→) and "Hoy" jump.
- **Streak header**: two big numbers — `N Semanas` (consecutive weeks with ≥1 activity) and `M Actividades` (total activities in the streak). Share button (mailto: link with streak text). Visible above the calendar.
- **IPC additions**: 4 new handlers (`db:getPersonalRecords`, `db:getWeeklyGoal`, `db:getRelativeEffort`, `db:getTrainingLogWeek`, `db:getMonthlyCalendar`, `db:getStreak`) that compute derived KPIs from existing tables. No new tables.
- **Renderer additions**: new `src/renderer/views/panels/strava-panels.js` module exporting `mountPersonalRecord(container)`, `mountWeeklyGoal(container)`, `mountRelativeEffort(container)`, `mountTrainingLog(container)`, `mountMonthlyCalendar(container)`. New `src/renderer/utils/kpi-derivation.js` (shared) for pace projection, effort formula, streak calculation. New CSS classes in `main.css` under `.strava-panel-*` (extending organic aesthetic tokens).
- **Dashboard integration**: above-the-fold Strava panels block at the top of `dashboard.js` (PR banner full-width → 2-col grid: weekly-goal + relative-effort → training-log full-width → streak header + monthly calendar). Existing health-metrics grid moves down to keep current functionality. Date-range selector continues to gate metrics that depend on a window.
- **Locales**: new keys under `strings.stravaPanels.*` (PR banner, weekly goal, relative effort, training log, monthly calendar, streak). All in Spanish.
- **Tests**: unit tests for pace projection (5 km from 1 km PR), streak calculation (consecutive ISO weeks, broken streak), effort formula per sport_type. Smoke tests for each panel rendering with seed data. Target: existing 52 tests + ~10 new tests = 62/62 passing.
- **No breaking changes**: new handlers are additive; new view module is additive; existing dashboard cards remain in their current positions below the new panels. No DB schema changes.

## Capabilities

### New Capabilities

- `personal-records`: Detect and rank personal records (best times) for standard distances from `sport_activities` records. Project times across distances using pace (min/km). Display most-recent or highest-ranked record as a banner with badge rank, distance label, time display, and date.
- `weekly-goal-ring`: Visualize weekly activity-goal progress (default 4 activities) as a donut ring chart with the primary sport icon at the center. Persist target in `settings` table (key `weekly_activity_target`).
- `relative-effort-card`: Compute and compare per-week training effort (sport-kcal × intensity multiplier + NEAT from steps) between the current ISO week and the previous one. Color the value by effort level (magenta/naranja/morado/claro).
- `training-log-bubble`: Render a 7-day bubble chart of training minutes per day with proportional radii and labels for long sessions. Show total weekly duration in the header.
- `monthly-activity-calendar`: Display a 7×N monthly grid with per-day sport icons (or day number) and a right-side per-week status column. Support month navigation and "Hoy" jump.
- `streak-tracker`: Calculate and display consecutive weeks with at least one recorded activity, plus the total activity count within the active streak. Provide a shareable summary via `mailto:`.

### Modified Capabilities

- `dashboard-health-metrics`: Add a new top-of-dashboard "Strava-style summary panels" block (PR banner → 2-col grid → training log → streak + calendar) above the existing hero card. Existing health KPI rows, trend charts, and sports section remain in their current order.
- `organic-aesthetic`: Extend the design system with `.strava-panel-*` classes (ring chart, bubble, calendar cell, streak chip) using the existing moss/bone/ember tokens. Reuse `growthRing()` and `sparkline()` utilities where possible (PR banner → use growth ring for badge; effort delta → sparkline).
- `spanish-ui`: Add new locale namespace `strings.stravaPanels` (PR banner, weekly goal, relative effort, training log, monthly calendar, streak, share, empty states, "Sin récords", "Sin meta configurada").
- `iconography`: Add Lucide icon mappings for `medal`, `flame`, `target`, `share-2`, `chevron-left`, `chevron-right` (calendar nav) — tree-shaken additions only.

## Impact

- **Frontend renderer** (`src/renderer/`):
  - New: `views/panels/strava-panels.js` (~400 lines, 5 mount functions + 1 calendar controller)
  - New: `utils/kpi-derivation.js` (~150 lines, pace projection, effort formula, streak calc)
  - Modified: `views/dashboard.js` (insert Strava-panels block at top, keep existing layout below)
  - Modified: `app.js` (lazy import of strava-panels module)
- **Styles** (`src/renderer/styles/main.css`): new `.strava-panel-*` classes (~150 lines), reusing organic-aesthetic tokens. No new CSS custom properties required.
- **IPC** (`src/main/ipc-handlers.js`): 6 new handlers (`db:getPersonalRecords`, `db:getWeeklyGoal`, `db:getRelativeEffort`, `db:getTrainingLogWeek`, `db:getMonthlyCalendar`, `db:getStreak`). No new preload exposure — auto-available via existing `db:*` pass-through.
- **DB** (`src/db/`): zero schema changes. Reads `sport_activities`, `activity_days`, `user_profile`, `settings`. One new `settings` key: `weekly_activity_target` (default 4).
- **Preload** (`src/preload/preload.js`): no changes (handlers are auto-exposed).
- **Locales** (`src/renderer/locales/es.js`): new `strings.stravaPanels` namespace (~30 keys).
- **Dependencies**: zero new npm packages. Lucide icons added as needed (already a devDependency).
- **Tests** (`tests/`): new `tests/unit/kpi-derivation.test.js` (pace projection, effort formula, streak calc, week-bounded math). New `tests/smoke/strava-panels.test.js` (5 panels render with seed data, calendar shows month grid, streak shows 0 when no activities). Existing 52 tests must still pass.
- **Performance**: 5 panels + calendar render at most ~50 DOM nodes per panel. Bubble chart and calendar are pure SVG/CSS — no extra Chart.js instances. KPI derivation is pure SQL + JS; estimated < 50 ms per panel.
- **No breaking changes**: all additions are additive. Existing dashboard cards, date-range selector, and all other views continue to function identically.
