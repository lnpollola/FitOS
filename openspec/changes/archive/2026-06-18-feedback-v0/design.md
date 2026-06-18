## Context

The app is an Electron + vanilla JS + SQLite desktop app with 7 views, English-only UI, CSV-based activity import, and free-form exercise library. User feedback requests: Spanish UI, Apple Health XML import, elaborated dishes with ingredients, pre-loaded daily plan cards, and structured workout plans.

## Goals / Non-Goals

**Goals:**
- Translate all UI strings to Spanish while keeping backend (main process, IPC, DB) in English
- Integrate HealthSync library to parse Apple Health XML (exportar.xml)
- Add elaborated_dishes + dish_ingredients tables with card-based UI
- Add workout_plans table for 2/3/4x/week structured plans by muscle group
- Redesign activity, diet, daily-plan, and training views per feedback

**Non-Goals:**
- No backend i18n — IPC channel names, DB column names, error logs stay in English
- No cloud sync or HealthKit native API
- No AI meal recognition or barcode scanning
- No multi-user support

## Decisions

1. **i18n approach: String constants file (ES modules)**
   Instead of a full i18n framework, create `src/renderer/locales/es.js` exporting a flat `strings` object. All view files import `strings` and reference `strings.dashboard.title` etc. This is minimal-weight, keeps zero dependencies, and is trivially auditable.

2. **Health XML import via HealthSync CLI binary**
   HealthSync is a standalone Go CLI (`healthsync`), not an npm package. Approach:
   - **One-time historical import**: Electron spawns `healthsync parse exportar.xml` via `child_process.execFile`, which streams-parses the 14M-line XML into `~/.healthsync/healthsync.db` (~30s, constant memory).
   - **Migration script**: A Node.js script reads healthsync.db (SQLite via better-sqlite3) and maps its tables to our app schema: `steps` → `activity_days.steps`, `active_energy` → `activity_days.active_calories`, `resting_heart_rate` → `activity_days.heart_rate_avg`, `sleep` → `activity_days.sleep_hours`, `body_mass` → `weight_entries`, `workouts` → `sport_activities` (with activity_type mapping), etc.
   - **Future data**: A frontend upload form for new manual entries or incremental healthsync re-runs. Historical data is never modified after import.
   - Idempotent: HealthSync uses `INSERT OR IGNORE` with UNIQUE constraints.

3. **Elaborated dishes at meal level (franja), not slot level**
   New tables:
   - `elaborated_dishes` (id, name, description, total_kcal, total_protein, total_carbs, total_fat, servings, created_at)
   - `dish_ingredients` (dish_id FK, food_item_id FK, grams) — cascade delete on dish removal
   - `meal_dish_options` (meal_template_id FK, dish_id FK, sort_order) — links a dish to a meal franja
   A dish spans multiple meal components (e.g., carb + protein together). When selected, it replaces the individual component selections for that meal. The dish's macros are the sum of its ingredients computed on save. Delete a dish → cascade deletes its `dish_ingredients` and `meal_dish_options` links.

4. **Workout plans with flexible frequency and auto-split generation**
   New tables:
   - `workout_plans` (id, name, min_sessions, max_sessions, created_at)
   - `workout_plan_days` (plan_id FK, day_number, focus_area, exercise_ids TEXT)
   - Add `practical_examples TEXT` column to `exercise_library` for form tips and machine setup notes.
   User picks a frequency (2–6 days/week). The system auto-suggests a split based on the chosen frequency:
   - 2x: Upper / Lower
   - 3x: Push / Pull / Legs
   - 4x: Upper / Lower / Upper / Lower
   - 5x: Push / Pull / Legs / Upper / Lower
   - 6x: Push / Pull / Legs / Upper / Lower / Full Body
   Each day shows focus area (e.g., "Empuje — Pecho, Hombros, Tríceps"), prescribed exercises, machine recommendations, and practical examples. User can complement by adding extra exercises per day.

5. **UI pattern: card-based views**
   Activity, diet, daily-plan, and exercise views shift from table/list layouts to card-based layouts. Cards are pre-loaded with default content (session cards for sports, dish cards for meals, plan cards for training). Multi-select toggles via checkboxes on cards.

## Risks / Trade-offs

- **HealthSync binary dependency**: Requires Go binary on PATH or bundled. → Mitigation: auto-install via curl script in setup, or bundle for each platform.
- **XML parsing performance**: exportar.xml is 14M+ lines. HealthSync handles it in ~30s with streaming. → Mitigation: show progress bar via healthsync's output parsing.
- **UI rewrite scope**: 4 views getting significant redesign risks feature creep. → Mitigation: strict card-layout pattern; any non-card feature goes to follow-up change.
- **Translation completeness**: Missing a string leaks English. → Mitigation: create a QA script that greps for untranslated English strings in renderer JS.
- **Database migration**: Existing users have data without new tables. → Mitigation: use `IF NOT EXISTS` in CREATE statements; seed data on first launch if empty.
- **Sport type mapping**: HealthSync uses HKWorkoutActivityType values (Running, Walking, Cycling, etc.) that may not match existing sport_types. → Mitigation: expand sport_types enum or add translation map.
