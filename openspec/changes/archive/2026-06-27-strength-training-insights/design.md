## Context

The app already captures strength training data (`training_sets`, `training_sessions`, `exercise_library`) but only surfaces basic session tonnage and a strength maintenance boolean. The Phase 2 `insights` view exists with 7 health/sport sections. This design adds 4 strength panels between recovery and weight velocity, requiring new IPC handlers in the main process and a new frontend panel module.

Current state:
- `training_sets` has `load_kg`, `reps`, `rpe` per set
- `exercise_library` has `bilateral`, `unilateral` columns (v5 schema) — unused today
- `training-handlers.js` has basic CRUD only
- `insights.js` loads 7 sections via 7 IPC calls
- No 1RM, PR, plateau, or strength score computation exists

## Goals / Non-Goals

**Goals:**
- Compute estimated 1RM per set (Epley) and per-exercise PR
- Detect strength plateaus (≥4 weeks without PR)
- Compute per-muscle-group strength score (bilateral-weighted)
- Compute weekly tonnage trend (bar chart, 12-week comparison)
- Surface all 4 in a new strength section within the insights view
- All logic derived from existing tables, no schema changes

**Non-Goals:**
- Not modifying the training view's existing layout or progression chart
- Not adding a separate strength view — these are panels in insights view
- Not computing RPE distribution, set density, or exercise variety (backlog)
- Not adding gym session recording improvements

## Decisions

### Decision 1: Separate handler file for strength insights

New IPC handlers will live in `src/main/handlers/strength-insights-handlers.js` rather than adding to `training-handlers.js`. Rationale: follows the modular handler pattern established by `strava-panels-handlers.js` and `insights-handlers.js`. Keeps training CRUD separate from derived analytics.

**4 new handlers:**
- `db:getStrengthPersonalRecords` — Epley 1RM per set, best PR per exercise, volume PR per session
- `db:getStrengthPlateau` — exercises without new PR in ≥4 weeks
- `db:getStrengthScore` — per-muscle-group aggregate with bilateral weighting
- `db:getWeeklyTonnage` — weekly tonnage sum with 12-week period comparison

### Decision 2: Pure functions in a utility module

`src/renderer/utils/strength-derivation.js` will contain pure, testable functions that mirror the pattern from `kpi-derivation.js`:
- `epley1RM(load, reps)` — returns estimated 1RM
- `computePersonalRecords(setsWithExercises, sessions)` — returns PRs with ranks
- `detectPlateaus(personalRecords, weeks)` — returns plateaued exercises
- `strengthScore(muscleGroups, bodyWeight, exercises)` — returns per-group + composite
- `weeklyTonnage(setsBySession, sessions)` — returns weekly aggregation

Rationale: Pure functions are testable without IPC or database. This follows existing architecture (sparkline.js, kpi-derivation.js).

### Decision 3: Panels in insights view, not standalone view

The 4 strength panels will mount inside the existing insights view as a new `<section id="section-strength">`. Each panel gets a mount function in `src/renderer/views/panels/strength-insights-panels.js`, following the pattern established by `strava-panels.js` for dashboard panels. The insights view controller (`insights.js`) will call all 4 mount functions in parallel with `Promise.allSettled`.

### Decision 4: Epley formula for 1RM estimation

Chose Epley (`load × (1 + reps / 30)`) over Brzycki (`load × 36 / (37 - reps)`) and Lombardi (`load × reps^0.10`). Epley is the most commonly used in strength apps, accurate for reps 1–10 (which covers the vast majority of strength training sets), and mathematically simple. The formula is well-validated for compound barbell lifts (bench, squat, deadlift, overhead press).

Alternatives considered:
- **Brzycki**: More accurate for very high reps (10+) but uncommon in strength training. Math involves division by `(37 - reps)` which risks division by zero at `reps = 37`.
- **Lombardi**: Power-law function, less commonly used, harder for users to intuitively understand.

### Decision 5: Bilateral weighting for strength score

`exercise_library.bilateral = 1` → full 1RM contributed. `unilateral = 1` → 1RM × 2 contributed (to normalize to both sides). Both `bilateral = 0` and `unilateral = 0` → bodyweight exercises → `body_weight_kg × 1.0` contributed. This provides a rough proxy for total strength that normalizes unilateral lifts.

### Decision 6: ISO week alignment for tonnage trend

Weekly tonnage uses ISO weeks (Monday–Sunday), consistent with all other ISO week computations in the app (`kpi-derivation.js`, `strava-panels-handlers.js`). The handler reuses the `isoWeekFromDate` helper.

## Risks / Trade-offs

- **[Accuracy] Epley formula loses accuracy beyond 10 reps** → Acceptable: strength training sets rarely exceed 10 reps. If a user logs 15+ reps, the 1RM estimate may be inflated. The utility will cap at 10 reps for display, using actual recorded reps for volume computation.
- **[Performance] 4 new IPC handlers = 11 concurrent calls on insights view** → All calls are fast SQL aggregations on small datasets (<1000 rows). No risk of timeout. Pattern already proven with 7 concurrent calls in Phase 2.
- **[Edge case] User has bodyweight exercises without body weight set in profile** → Strength score for bodyweight exercises defaults to `null` when `user_profile.weight_kg` is null. The score panel shows "Configura tu peso en el perfil para calcular ejercicios corporales".
- **[Data gap] `exercise_library.bilateral/unilateral` may not be set for all 53 seed exercises** → The seed data migration (v5) added these columns but not all exercises may have values. The handler treats `NULL` as `bilateral = 1` (conservative default). A data migration pass should fill these columns.
