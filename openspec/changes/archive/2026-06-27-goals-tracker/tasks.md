## 1. Setup

- [x] 1.1 Create `src/main/handlers/goals-handlers.js` — IPC handlers module skeleton
- [x] 1.2 Register goals handlers in `src/main/ipc-handlers.js` (call `require('./handlers/goals-handlers').register(...)`)
- [x] 1.3 Add `goals` methods to `src/preload/preload.js` — expose `db:getGoals`, `db:saveGoal`, `db:deleteGoal`, `db:archiveGoal`, `db:getGoalProgress`
- [x] 1.4 Add nav item in `src/renderer/index.html` between "Tendencias" and "Perfil" with `data-view="goals"` and `target` icon
- [x] 1.5 Add route for `goals` view in `src/renderer/app.js` router
- [x] 1.6 Add `#view-goals` container element in `src/renderer/index.html`
- [x] 1.7 Create `src/renderer/views/goals.js` — view skeleton exporting `init()`

## 2. Backend: IPC Handlers

- [x] 2.1 Implement `db:getGoals` — read goals JSON array from `settings` key `goals`, return `[]` if absent
- [x] 2.2 Implement `db:saveGoal(goal)` — atomic read-modify-write via `db.transaction()`, validate goal fields, return `{ ok, goal|error }`
- [x] 2.3 Implement `db:deleteGoal(id)` — atomic read-remove-write, return `{ ok }` or `{ ok: false, error }`
- [x] 2.4 Implement `db:archiveGoal(id)` — atomic set `archived: true`, set `archivedAt`, return `{ ok }`
- [x] 2.5 Implement `db:getGoalProgress(goalId)` — compute current value per type (weight→weight_entries, distance→sport_activities, frequency→current-week count, custom→stored current)
- [x] 2.6 Add goal validation function shared between create and update (type enum, label length, target positive, dates valid)

## 3. Frontend: Utilities

- [x] 3.1 Create `src/renderer/utils/goal-progress-ring.js` — export `goalProgressRing(progress_pct, options)` returning SVG string with configurable size/strokeWidth/colors
- [x] 3.2 Create `src/renderer/utils/goals.js` — export helper functions: `computeProgress(current, target)`, `computeDaysRemaining(targetDate)`, `sortGoalsByDeadline(goals)`, `getActiveGoals(goals)`, `getCompletedGoals(goals)`
- [x] 3.3 Create `src/renderer/utils/confetti.js` — export `triggerConfetti(canvas, duration)` Canvas-based particle animation with gravity, rotation, color palette, auto-cleanup

## 4. Frontend: Goals View

- [x] 4.1 Implement goals view `init()` — fetch goals via `api.getGoals()`, compute progress via `api.getGoalProgress()`, render sections
- [x] 4.2 Implement active goals list rendering — cards with progress ring, label, value/target, countdown, action buttons
- [x] 4.3 Implement completed goals section — separate section below active, achievement badges, full green rings
- [x] 4.4 Implement archived goals collapsible section — toggle expand/collapse, show archivedAt date
- [x] 4.5 Implement empty state — "Aún no tienes objetivos" with target icon and "Crear objetivo" button
- [x] 4.6 Implement goal creation modal form — type dropdown, label input, target value, unit, start/target dates, validation, save
- [x] 4.7 Implement goal edit modal — pre-fill form from existing goal, save updates
- [x] 4.8 Implement delete confirmation dialog — "¿Eliminar objetivo?" with Cancelar/Eliminar
- [x] 4.9 Implement archive action — call `api.archiveGoal(id)`, re-render list
- [x] 4.10 Wire `data-changed` event listener to re-compute progress for all goals
- [x] 4.11 Add loading skeleton states during initial fetch

## 5. Frontend: Celebration

- [x] 5.1 Implement `checkNewlyCompleted` — compare previous progress snapshot with current, detect newly ≥100% goals
- [x] 5.2 Implement celebration overlay rendering — "¡Objetivo conseguido!", goal label, full progress ring, "Cerrar" button
- [x] 5.3 Integrate confetti canvas animation on celebration overlay mount
- [x] 5.4 Implement sequential display for multiple newly completed goals
- [x] 5.5 Persist completion state (set flag in goal object or use local storage) to prevent re-trigger on revisit
- [x] 5.6 Add achievement badge (Lucide `badge-check`) rendering for all completed goals

## 6. Frontend: Dashboard Integration

- [x] 6.1 Add goals summary card to dashboard layout — container between Strava panels and hero card
- [x] 6.2 Implement goals summary rendering — up to 3 progress rings at 56×56 px, truncated labels, click navigation
- [x] 6.3 Implement "+N más" overflow indicator when > 3 active goals
- [x] 6.4 Implement empty state for dashboard goals card — "Define tu primer objetivo"
- [x] 6.5 Add `db:getGoals` to dashboard's parallel `Promise.allSettled` data fetch batch
- [x] 6.6 Add skeleton loading state for goals summary card during fetch

## 7. Strings and CSS

- [x] 7.1 Add `strings.goals.*` locale keys to `src/renderer/locales/es.js` — all labels, buttons, empty states, celebration text, confirmation dialogs
- [x] 7.2 Add goal card CSS (`.goal-card`, `.goal-card--active`, `.goal-card--completed`) in `src/renderer/styles/cards.css`
- [x] 7.3 Add countdown urgency CSS (`.countdown--normal`, `.countdown--approaching`, `.countdown--urgent`)
- [x] 7.4 Add celebration overlay CSS (`.celebration-overlay`, `.celebration-content`, `.celebration-canvas`)
- [x] 7.5 Add dashboard goals summary CSS (`.goals-summary`, `.goal-ring-mini`, `.goals-summary-empty`)
- [x] 7.6 Add form modal CSS for goal creation/edit

## 8. Tests

- [x] 8.1 Write unit tests for `goal-progress-ring.js` — SVG output, progress fill, overshoot color, zero progress
- [x] 8.2 Write unit tests for `goals.js` helpers — `computeProgress`, `computeDaysRemaining`, `sortGoalsByDeadline`, filtering functions
- [x] 8.3 Write unit tests for `confetti.js` — canvas element creation, particle count, animation frame lifecycle
- [x] 8.4 Write smoke tests for goals view — container renders, nav item exists, empty state shows, create modal opens
- [x] 8.5 Write smoke tests for dashboard goals card — goals summary renders, zero-state renders, click navigation
- [x] 8.6 Run full test suite and verify no regressions
