## Why

The app tracks calories, activity, weight, measurements, and training — but lacks a motivational layer. Users have no way to set, visualize, and track progress toward personal goals (e.g., "lose 5 kg in 10 weeks", "run 100 km this month", "train 4 days/week"). Goals are the missing bridge between raw data and personal motivation, completing the fitness tracking loop.

## What Changes

- New **goals configuration system** stored in the `settings` table (key-value JSON)
- New **goals view** (`data-view="goals"`) with sidebar nav item under INICIO, between "Tendencias" and "Perfil"
- Create, edit, archive, and delete goals
- Each goal has: type (weight, distance, frequency, custom), target value, current value, start date, target date, unit, archived status
- Progress rings (donut charts) for active goals on both the goals view and a compact summary on the dashboard
- Countdown timer (days remaining) on each active goal card
- Goal achievement celebration (confetti animation + achievement screen)
- Dashboard summary card: compact row of up to 3 goal rings, clickable to navigate to goals view
- No schema changes: goals live in `settings` table as JSON. No new DB tables.
- No breaking changes. Existing views and IPC handlers are unchanged.

## Capabilities

### New Capabilities
- `goal-crud`: Create, read, update, archive, and delete goals via IPC handlers. Persisted as JSON in the `settings` table under key `goals`.
- `goal-progress-rings`: SVG donut ring rendering for goal completion (progress/ring.js utility). Gap logic mirrors growth-ring.js (gap=0 for N≤14 goals, gap≤0.6° for N>14).
- `goal-countdown`: Days-remaining computation from target date, with visual urgency (amber when <30 days, red when <7 days).
- `goal-celebration`: Confetti animation (Canvas-based, no library) triggered on goal completion with achievement screen overlay.
- `goal-dashboard-card`: Compact dashboard summary showing up to 3 active goal rings in a horizontal row, clickable to navigate to goals view.
- `goals-view`: Full dedicated view for goal management: list of active goals, archived section, create/edit form.

### Modified Capabilities
- `dashboard-health-metrics`: Dashboard layout extended with a compact goals summary row between the Strava panels block and the hero card.
- `spanish-ui`: New strings for goals domain (goal types, units, form labels, celebration text).
- `design-system`: New CSS for goal cards, progress rings, countdown badges, confetti overlay.

## Impact

- **New files**: `src/renderer/views/goals.js`, `src/renderer/utils/goals.js` (business logic: CRUD, progress, countdown), `src/renderer/utils/goal-progress-ring.js` (SVG ring rendering), `src/main/handlers/goals-handlers.js` (IPC handlers)
- **Modified files**: `preload.js` (expose goal API), `ipc-handlers.js` or new handler module, `app.js` (add route), `index.html` (add nav item), `locales/es.js` (goals strings), `styles/cards.css` or `styles/main.css` (goal CSS), `dashboard.js` (add goals summary card)
- **Dependencies**: none new
- **Schema**: no changes (goals in existing `settings` table)
