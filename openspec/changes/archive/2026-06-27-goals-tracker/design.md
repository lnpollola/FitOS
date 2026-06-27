## Context

The app currently tracks health data (calories, activity, weight, measurements, training) across 8 views but has no concept of user-defined goals. The `settings` table (key-value TEXT) already stores configuration like `weekly_activity_target`, `schema_version`, and `health_last_import`. Goals will use the same mechanism: a single JSON blob under key `goals`.

This avoids schema migrations, keeps the design simple, and aligns with how `weekly_activity_target` is already handled. The downside (no relational queries on individual goals) is acceptable because the goal set is small (3–15 active goals max) and always loaded as a whole.

## Goals / Non-Goals

**Goals:**
- Allow creating, editing, archiving, and deleting user-defined goals
- Render progress donut rings for each active goal
- Display countdown (days remaining) with urgency color coding
- Trigger a celebration animation when a goal reaches 100%
- Add a compact dashboard summary card showing up to 3 active goals
- Persist all goals in the existing `settings` table, key `goals`
- Add `goals` view with full management UI
- IPC handlers: `db:getGoals`, `db:saveGoal`, `db:deleteGoal`, `db:archiveGoal`, `db:getGoalProgress`

**Non-Goals:**
- No push notifications or reminders
- No automatic goal adjustment (e.g., recalculating targets based on TDEE)
- No goal templates or predefined goals (user creates from scratch)
- No historical goal analytics (e.g., "you hit 80% of goals this year")
- No schema changes or new DB tables

## Decisions

### 1. Goals stored as JSON blob in `settings` table
- **Chosen**: Single `goals` key with JSON array `[{ id, type, label, target, current, unit, startDate, targetDate, archived, createdAt, updatedAt }]`
- **Alternatives considered**: New `goals` table with one row per goal. This would allow SQL queries (e.g., "find all active weight goals") but adds schema migration complexity. Given the app's local-first nature and small goal count, the JSON approach is simpler and consistent with existing patterns (`weekly_activity_target`).
- **Trade-off**: No SQL-level filtering. Solved by client-side filtering. Concurrent-write safe via read-modify-write inside `db.transaction()`.

### 2. Goal types as an enum
- **Types**: `weight` (body weight), `distance` (running/cycling km), `frequency` (sessions per week), `custom` (any metric, user provides label + unit)
- **Progress computation**: `current / target × 100`. For `weight` type, progress is inverted: `max(0, min(100, (target - current) / (target - startWeight) × 100))` when losing weight.
- **Rendering**: Same for all types — a donut ring (via `goal-progress-ring.js`) + countdown + label.

### 3. Progress ring SVG utility (`goal-progress-ring.js`)
- Follows same pattern as `growth-ring.js` and `sparkline.js` in `src/renderer/utils/`
- Single arc: `stroke-dasharray` + `stroke-dashoffset` on a circle element
- Color: `var(--success)` (green) at < 100%, `var(--accent)` (amber) at ≥ 100% (overshoot)
- Radius: 36px (same as weekly goal ring on dashboard)
- Gap logic mirrors growth-ring: no gap for single-ring rendering

### 4. Countdown computation
- `daysRemaining = Math.ceil((targetDate - today) / 86400000)`
- Color coding: normal (`var(--moss)`) when > 30 days, amber when 8–30 days, red when ≤ 7 days
- Display: "27 días restantes" or "En curso" when past target date (overdue ignored)

### 5. Confetti celebration (Canvas)
- Pure Canvas 2D, no external library
- Triggered once when `progress >= 100` for a goal and the goal view is active
- Particle system: 150–300 colored rectangles/squares falling with gravity + rotation
- Duration: 2.5 seconds, auto-cleanup
- Overlay screen: "¡Objetivo conseguido!" with goal name, progress ring filled, and close button

### 6. Dashboard summary card
- Compact horizontal row between Strava panels and hero card
- Up to 3 active goal rings at 28px radius each (smaller than full-size)
- Each ring clickable → navigates to goals view
- If > 3 active goals, shows "+N" overflow indicator
- If 0 active goals, shows empty state: "Define tu primer objetivo"

### 7. IPC handler module: `goals-handlers.js`
- Parallel to existing `settings-handlers.js`, `strava-panels-handlers.js`
- All operations read/write the same `goals` JSON key
- Write operations use `db.transaction()` for atomic read-modify-write
- `db:getGoalProgress` queries current data from relevant tables to compute `current` value:
  - `weight` → latest `weight_entries` weight
  - `distance` → sum of relevant `sport_activities.distance_km` since goal start date
  - `frequency` → count of `sport_activities` records in the current ISO week
  - `custom` → user-provided value (no auto-computation)

### 8. No new nav icon
- Use Lucide `target` icon (already used in weekly-goal-ring)
- Nav item placed between "Tendencias" and "Perfil" in the sidebar

## Risks / Trade-offs

- [JSON concurrency] Two tabs could overwrite goals. → Mitigation: single-user Electron app, no multi-tab risk. `db.transaction()` ensures atomicity within a single process.
- [Goal progress staleness] `current` value is only computed when goals view is opened or on data-changed event. → Mitigation: re-compute on `data-changed` event, manual refresh button.
- [Settings table bloat] Goals JSON could grow large with many archived goals. → Mitigation: unlikely to exceed 50 goals; each entry is ~200 bytes, so < 10 KB total. No performance concern.
- [No schema enforcement] JSON blob means no DB-level validation. → Mitigation: validation in the IPC handler and frontend form.

## Open Questions

- Should weight loss goals automatically pull `startWeight` from the goal creation date's nearest `weight_entries` record, or should the user enter it manually? Decision needed during implementation: manual entry with a pre-fill suggestion.
