# FitOS KPIs Inventory

> **Purpose.** Living reference of every metric (KPI) the app can compute, what raw data feeds it, where it's currently exposed, and what's available but not yet wired up. Use this to identify underused data, plan features, and avoid re-deriving the same value twice.
>
> **Last updated.** 27 Jun 2026 — drafted during the `panel-ux-ui-kpis-summarized` exploration.
>
> **Status legend.**
> - **Live** — computed and rendered in a view today.
> - **In this change** — added by `panel-ux-ui-kpis-summarized` (Phase 1).
> - **Phase 2** — planned for `summary-insights-view` (next change).
> - **Phase 3** — planned for `strength-training-insights` (later).
> - **Phase 4** — planned for `goals-tracker` (later).
> - **Backlog** — viable from existing data, no change scheduled yet.

---

## 1. Raw data sources

### 1.1 App database (`src/db/database.js`)

| Table | Columns | Notes |
|---|---|---|
| `user_profile` | age, sex, height_cm, weight_kg, activity_baseline | Single row, id=1 |
| `activity_days` | date, steps, active_calories, resting_calories, heart_rate_avg, sleep_hours, sleep_deep, sleep_rem, sleep_light, weight_kg | One row per day, upserted on `date` |
| `sport_activities` | date, sport_type, calories, duration_minutes, distance_km, created_at | Schema v5 added `distance_km` |
| `weight_entries` | date, weight_kg | Manual weigh-ins |
| `measurement_sets` | date, chest/neck/shoulders/biceps_L/biceps_R/forearms_L/forearms_R/waist/hips/thighs_L/thighs_R/calves_L/calves_R/weight_kg | 13 body measurements |
| `training_sessions` | date, routine_id, notes | One per session |
| `training_sets` | session_id, exercise_id, set_number, load_kg, reps, rpe | Sets per session |
| `exercise_library` | name, muscle_group, equipment, movement_pattern, category, difficulty, intensity, secondary_muscles, bilateral, unilateral, explosive, practical_examples | 53 seed exercises |
| `training_routines` | name | Templates |
| `workout_plans` | name, min_sessions, max_sessions, type, style, level, goal, estimated_duration_min | 5 strength + 12 HIIT/WOD/METCON/HYBRID seeds |
| `workout_plan_days` | plan_id, day_number, focus_area, exercise_ids, prescribed_reps, scaling_beginner, scaling_advanced | Plan details |
| `food_items` | name, kcal/protein/carbs/fat_per_100g, fiber_per_100g, category, is_hidden | 198 seed foods |
| `meal_templates` / `meal_components` / `meal_options` / `daily_plans` / `daily_plan_entries` | grams + food references | Diet plan structure |
| `elaborated_dishes` / `dish_ingredients` / `meal_dish_options` | Composite recipes | Diet plan structure |
| `settings` | key, value | User-configurable (currently `schema_version`, `seed_version`, `seed_template_version`, `target_pace`, `weekly_activity_target` is added in this change) |
| `activity_summary_cache` | pre-aggregated day × period | Internal, not used directly by views |

### 1.2 HealthSync database (`~/.healthsync/healthsync.db`)

Read-only. Updated by external HealthSync CLI that parses Apple Health XML exports.

| Table | Sample metric | Density (per user) |
|---|---|---|
| `steps` | Daily step count | ~365 rows/yr |
| `heart_rate` | Continuous HR samples | ~2000+ rows/day (high volume) |
| `resting_heart_rate` | Daily RHR | ~365 rows/yr |
| `hrv` | SDNN samples | ~12k/yr (deduplicated nightly) |
| `vo2_max` | Cardio fitness | sparse |
| `active_energy` / `basal_energy` | Daily kcal | ~365/yr each |
| `workouts` | Apple Health workouts (activity_type, duration, kcal, distance) | ~50-200/yr |
| `distance_walking_running` / `distance_cycling` | Daily km | ~365/yr each |
| `walking_speed` | Speed km/h | ~365/yr |
| `flights_climbed` | Daily flights | ~365/yr |
| `spo2` | Blood oxygen % | sparse |
| `blood_pressure` | Systolic/diastolic | very sparse (AW doesn't measure) |
| `stand_hours` | Standing hours | ~365/yr |
| `exercise_time` | Daily exercise minutes | ~365/yr |
| `sleep` | Per-stage sleep (Asleep/Core/Deep/REM/Awake) | ~365/yr |
| `body_mass` | Body mass from AW | sparse |

---

## 2. Sport / Activity KPIs

| KPI | Formula | Data | Status | Where shown |
|---|---|---|---|---|
| Sessions this period | `COUNT(*) FROM sport_activities` | sport_activities | Live | Dashboard, activity view |
| Total kcal by sport | `SUM(calories) GROUP BY sport_type` | sport_activities | Live | Dashboard sports section |
| Total duration by sport | `SUM(duration_minutes) GROUP BY sport_type` | sport_activities | Live | Dashboard, activity view |
| Total distance by sport | `SUM(distance_km) GROUP BY sport_type` | sport_activities | Live | Activity view, comparison |
| Avg kcal/session | `AVG(calories) GROUP BY sport_type` | sport_activities | Live | Dashboard, activity view |
| Sport hours total | `SUM(duration_minutes)/60` | sport_activities | Live | Dashboard, activity view |
| Period-over-period delta | Current vs previous period, % | sport_activities | Live | Activity comparison card |
| Active days count | `COUNT(DISTINCT date)` | sport_activities | Live | Activity comparison card |
| Activity count (current week) | `COUNT(*) WHERE date ∈ current ISO week` | sport_activities | **In this change** | Weekly goal ring |
| **Personal record per distance** | Riegel projection `t2 = t1 × (d2/d1)^1.06`, min per (sport, distance) | sport_activities | **In this change** | PR banner |
| **Rank per record** | 1/2/3 by all-time best per (sport, distance) | sport_activities | **In this change** | PR banner badge |
| **Relative effort this week vs last** | `Σ (sport_kcal × intensity_multiplier) + steps×0.04` | sport_activities, activity_days | **In this change** | Relative effort card |
| **Streak (consecutive ISO weeks with ≥1 activity)** | Set lookup, walk backwards from current week | sport_activities | **In this change** | Streak header |
| **Total activities in streak** | `COUNT(*) WHERE date ∈ streak window` | sport_activities | **In this change** | Streak header |
| **Primary sport icon for the week** | `sport_type` with most minutes in current week | sport_activities | **In this change** | Weekly goal ring center |
| **Daily training minutes** | `SUM(duration_minutes) GROUP BY date` for the 7 days of current ISO week | sport_activities | **In this change** | Training log bubble chart |
| **Year-in-motion heatmap** | 365 days × minutes per day | sport_activities | Phase 2 | New insights view |
| **Sport distribution donut** | `% of total minutes per sport_type` | sport_activities | Phase 2 | Insights view |
| **Time-of-day heatmap (7×24)** | `COUNT(*) GROUP BY dow, hour` (needs session start time, currently date-only) | sport_activities | Backlog | Insights view (data limitation) |
| **Day-of-week histogram** | `COUNT(*) GROUP BY strftime('%w', date)` | sport_activities | Phase 2 | Insights view |
| **Sport diversity score** | `1 - Σ (share²) per sport` (Herfindahl inverted) | sport_activities | Backlog | Insights view |
| **Rest day detection** | Gaps ≥ 2 days between activities | sport_activities | Backlog | Insights view |
| **Sport lifetime stats** | Total sessions, total weeks active, current streak | sport_activities | Live | Activity view |
| **Most-improved sport** | Δ in avg pace or distance vs prior period | sport_activities | Backlog | Insights view |

---

## 3. Steps / NEAT KPIs

| KPI | Formula | Data | Status | Where shown |
|---|---|---|---|---|
| Daily avg steps | `AVG(steps)` over period | activity_days | Live | Dashboard |
| Steps period cards (7d/15d/1m) | `AVG(steps)` per window | activity_days | Live | Dashboard |
| NEAT kcal | `steps × 0.04` | activity_days | Live | Energy balance (internal) |
| Steps trend line | Daily steps + MA7 | activity_days | Live | Analytics chart |
| **Steps per sport (when active)** | `steps` on days with sport activities | activity_days + sport_activities | Backlog | Insights view |
| **Steps vs sport steps** | Compare watch steps to running/cycling km-derived steps | activity_days + sport_activities | Backlog | Activity view |

---

## 4. Sleep KPIs

| KPI | Formula | Data | Status | Where shown |
|---|---|---|---|---|
| Avg sleep hours | `AVG(sleep_hours)` | activity_days | Live | Dashboard sleep card |
| Sleep consistency | `100 - stdDev × 20` (capped 0–100) | activity_days | Live | Sleep view |
| Sleep phase breakdown (deep/REM/light) | `AVG(sleep_deep/rem/light)` | activity_days | Live | Sleep view |
| Sleep trend (first-half vs second-half) | `Δ% between halves` | activity_days | Live | Sleep view trend arrow |
| 7-day trailing avg | `AVG(sleep_hours) over last 7 days` | activity_days | Live | Dashboard sleep card |
| **Sleep debt** | `max(0, target_hours × N - sum(sleep_hours))` over 7 days | activity_days | Phase 2 | Insights view |
| **Sleep stage quality score** | Weighted `(deep% × 2 + REM% × 1.5 + light% × 0.5) / 8` | activity_days | Backlog | Insights view |
| **Sleep vs next-day performance** | `corr(sleep_hours[t-1], sport_kcal[t])` | activity_days + sport_activities | Backlog | Insights view |
| **Bedtime consistency** | stdDev of sleep onset time | HealthSync sleep | Backlog | Insights view (needs onset time, currently only durations) |

---

## 5. Heart KPIs (HR / HRV / RHR / SpO2)

| KPI | Formula | Data | Status | Where shown |
|---|---|---|---|---|
| Avg heart rate | `AVG(value) GROUP BY date` | HealthSync heart_rate | Live | Dashboard, analytics |
| HR min/max range | `MIN/MAX GROUP BY date` | HealthSync heart_rate | Live | Analytics chart |
| Avg RHR | `AVG(resting_heart_rate)` | HealthSync resting_heart_rate | Live | Dashboard composite card |
| Avg HRV | `AVG(hrv)` | HealthSync hrv | Live | Dashboard composite card |
| HRV weekly trend | `AVG(hrv) GROUP BY week` | HealthSync hrv | Live | Analytics mini chart |
| VO2 max trend | `AVG(vo2_max) GROUP BY date` | HealthSync vo2_max | Live | Analytics mini chart |
| SpO2 trend | `AVG(spo2) GROUP BY date` | HealthSync spo2 | Live | Analytics secondary |
| **HRV baseline (30d)** | `AVG(hrv) over last 30 days` | HealthSync hrv | Phase 2 | Recovery score |
| **HRV deviation** | `(current - baseline) / baseline × 100` | HealthSync hrv | Phase 2 | Recovery score |
| **RHR baseline (30d)** | `AVG(resting_heart_rate) over last 30 days` | HealthSync resting_heart_rate | Phase 2 | Recovery score |
| **RHR deviation** | `(baseline - current) / baseline × 100` (negative = elevated) | HealthSync resting_heart_rate | Phase 2 | Recovery score |
| **Cardio fitness age** | `age × (VO2max_actual / VO2max_predicted_for_age)` | HealthSync vo2_max + user_profile | Phase 2 | Insights view (gated on data) |
| **HR reserve %** | `(HRmax - HRrest) / (220-age - HRrest) × 100` | HealthSync heart_rate + user_profile | Backlog | Insights view |
| **Overtraining signal** | Composite: RHR ↑ + HRV ↓ + sleep ↓ over last 5d | HealthSync + activity_days | Backlog | Insights view |
| **Walking speed trend** | `AVG(walking_speed)` | HealthSync walking_speed | Live | Analytics secondary |

---

## 6. Body composition KPIs

| KPI | Formula | Data | Status | Where shown |
|---|---|---|---|---|
| Latest weight | `SELECT weight_kg ORDER BY date DESC LIMIT 1` | weight_entries | Live | Dashboard, measurements |
| Weight trend (Δ vs prior) | `latest - previous` | weight_entries | Live | Dashboard, measurements |
| Weight stats (min/max/avg/first/last) | aggregate over period | weight_entries | Live | Measurements chart |
| Body measurements (13 sites) | individual values | measurement_sets | Live | Measurements view |
| Body fat % (Navy method) | `86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76` (men) | measurement_sets + user_profile | Live | Measurements view |
| **Weight velocity (kg/week, 28d rolling)** | `(latest - 28d_ago) / 4` | weight_entries | Phase 2 | Insights view |
| **Waist-to-hip ratio (WHR)** | `waist_cm / hips_cm` | measurement_sets | Phase 2 | Insights view |
| **WHR zone (OMS)** | Hombres: <0.90 bajo, 0.90–0.99 moderado, ≥1.00 alto. Mujeres: <0.80 bajo, 0.80–0.84 moderado, ≥0.85 alto | measurement_sets | Phase 2 | Insights view |
| **Limb asymmetry** | `biceps_R - biceps_L`, `thighs_R - thighs_L` (sign + magnitude) | measurement_sets | Backlog | Insights view |
| **PR weight (lowest ever)** | `MIN(weight_kg) over all time` | weight_entries | Phase 2 | Insights view |
| **Projected goal date** | If losing X kg/week, when reach target | weight_entries | Phase 4 | Goals view |
| **Weight variability (stdDev)** | `stdDev(weight_kg) over last 30 days` | weight_entries | Backlog | Insights view |

---

## 7. Strength training KPIs

| KPI | Formula | Data | Status | Where shown |
|---|---|---|---|---|
| Session count | `COUNT(*) FROM training_sessions` | training_sessions | Live | Training view |
| Tonnage per session | `Σ (load_kg × reps)` | training_sets | Live | Training view (session list) |
| Tonnage delta (session-over-session) | `current_tonnage - previous_tonnage` | training_sets | Live | Training view |
| Progression chart per exercise | `AVG(load_kg × reps) GROUP BY date per exercise` | training_sets | Live | Training view |
| Session notes | text | training_sessions | Live | Training view |
| Routines list | name | training_routines | Live | Training view |
| **Estimated 1RM per exercise (Epley)** | `load × (1 + reps / 30)` | training_sets | Phase 3 | Insights view |
| **PR per exercise (best 1RM)** | `MAX(estimated_1RM) GROUP BY exercise_id` | training_sets | Phase 3 | Insights view |
| **Volume PR per session** | `MAX(Σ tonnage) over all sessions` | training_sets | Phase 3 | Insights view |
| **Plateau detector** | Exercises with no new 1RM PR in ≥ 4 weeks | training_sets | Phase 3 | Insights view |
| **Strength score per muscle group** | `Σ(estimated_1RM × bilateral_factor) GROUP BY muscle_group` | training_sets + exercise_library | Phase 3 | Insights view |
| **Tonnage weekly trend** | `Σ(tonnage) GROUP BY week` | training_sets | Phase 3 | Insights view |
| **RPE distribution** | Histogram of RPE values | training_sets | Backlog | Insights view |
| **Set density** | `sets / session_duration_min` | training_sets + training_sessions | Backlog | Insights view |
| **Exercise variety per session** | `COUNT(DISTINCT exercise_id) per session` | training_sets | Backlog | Insights view |

---

## 8. Diet KPIs

| KPI | Formula | Data | Status | Where shown |
|---|---|---|---|---|
| Daily planned kcal | `Σ (grams / 100 × kcal_per_100g)` for the day | daily_plan_entries + food_items | Live | Dashboard, diet view |
| Daily planned macros (P/C/F) | `Σ (grams / 100 × macro_per_100g)` | daily_plan_entries + food_items | Live | Diet view |
| Meal template components | grams per food per meal | meal_components + food_items | Live | Diet view |
| Daily plan entries | per-day meal plan | daily_plan_entries | Live | Diet view |
| Dish macros | `Σ(ingredient_grams × macro_per_100g)` | dish_ingredients + food_items + elaborated_dishes | Live | Diet view |
| BMR (Mifflin-St Jeor) | `10×weight + 6.25×height - 5×age + sex_offset` | user_profile | Live | Energy balance |
| TDEE | `BMR + sport_kcal + NEAT` | user_profile + sport_activities + activity_days | Live | Energy balance, dashboard |
| Net balance | `consumed - burned` per day | daily_plan_entries + TDEE | Live | Energy balance, dashboard |
| Weekly balance | `AVG(net_balance) over last 7 days` | derived | Live | Dashboard hero card |
| Diet target pace | `kg/week from settings` | settings | Live | Adaptive view (target_pace) |
| **Macro adherence %** | `% of days where actual P/C/F within ±10% of target` | daily_plan_entries | Backlog (needs actual intake) | Insights view |
| **Caloric accuracy** | `AVG(|actual - target|)` | daily_plan_entries | Backlog (needs actual intake) | Insights view |
| **Meal timing pattern** | Histogram of meal hour | daily_plan_entries | Backlog (needs timestamps) | Insights view |
| **Top protein sources** | `Σ protein GROUP BY food_item ORDER BY DESC LIMIT 5` | daily_plan_entries + food_items | Backlog | Diet view |
| **Fiber per day** | `Σ(grams/100 × fiber_per_100g)` | daily_plan_entries + food_items | Backlog | Diet view |
| **Dish usage frequency** | `COUNT(*) GROUP BY dish_id` | meal_dish_options | Backlog | Diet view |

---

## 9. Recovery / Composite KPIs

| KPI | Formula | Data | Status | Where shown |
|---|---|---|---|---|
| Sleep composite score | weighted sum of total + phases + consistency | activity_days | Live | Sleep view |
| HRV + RHR composite | latest + 7d avg + trend | HealthSync hrv, resting_heart_rate | Live | Dashboard |
| Adherence evaluation | match between plan and execution | daily_plan_entries + energy | Live | Adaptive view |
| Recomposition detection | weight stable + measurements improving | weight_entries + measurement_sets | Live | Adaptive view |
| **Recovery score (HRV + RHR + sleep)** | `norm(HRV) × 0.4 + norm(RHR) × 0.3 + norm(sleep) × 0.3` (each 0-100 vs personal baseline) | HealthSync + activity_days | Phase 2 | Insights view |
| **Stress index (RHR - HRV z-score)** | `(RHR - baseline_RHR) / stdDev_RHR - (HRV - baseline_HRV) / stdDev_HRV` | HealthSync | Backlog | Insights view |
| **Overtraining flag** | Composite: RHR ↑ ≥ 5% AND HRV ↓ ≥ 10% AND sleep ↓ ≥ 1h, sustained 3+ days | HealthSync + activity_days | Backlog | Insights view |
| **Body battery (Garmin-style)** | HRV + RHR + sleep + activity load composite | HealthSync + activity_days + sport_activities | Backlog | Insights view |
| **Auto-generated insight cards** | Heuristic text generators ("Tu mejor semana en 3 meses", "HRV 15% sobre tu promedio") | multi-table | Phase 2 | Insights view |

---

## 10. Energy balance KPIs

| KPI | Formula | Data | Status | Where shown |
|---|---|---|---|---|
| Daily kcal consumed | sum of meal entries | daily_plan_entries | Live | Energy view, diet view |
| Daily kcal burned | BMR + sport + NEAT | user_profile + sport_activities + activity_days | Live | Energy view |
| Daily net | consumed - burned | derived | Live | Energy view |
| Weekly balance | sum of daily net | derived | Live | Energy view, dashboard |
| TDEE breakdown (BMR/sport/NEAT) | components | derived | Live | Energy view, adaptive view |
| Surplus/deficit classification | sign(net) | derived | Live | Energy view |
| Diet target | from settings (target_pace) | settings | Live | Adaptive view |
| Adjust meal grams (carb/fat delta) | modify daily plan | daily_plan_entries | Live | Energy view |
| **Maintenance calories** | TDEE averaged over a maintenance period | user_profile + activity_days | Live | Adaptive view (already computed) |
| **Deficit impact projection** | `(target_pace × 7700) / daily_deficit → weeks to goal` | energy + settings | Live | Adaptive view |

---

## 11. Coverage map — what's already exploited vs. what isn't

### Well-exploited data
- `sport_activities.calories`, `duration_minutes` — shown across many views
- `activity_days.steps`, `active_calories`, `resting_calories` — dashboard + analytics
- `weight_entries` — dashboard + measurements + energy
- `measurement_sets` (per site) — measurements view
- `daily_plan_entries.grams` — diet + energy
- `training_sessions` + `training_sets.load_kg/reps` — training view (basic)
- `hrv` + `resting_heart_rate` — dashboard composite
- `sleep_hours` + phases — sleep view
- `vo2_max` — analytics mini chart
- `workouts` (HealthSync) — activity view

### Under-exploited data (good Phase 2/3 candidates)
- `sport_activities.distance_km` — only used in 1 query, can power PR detection, pace trends, "best run ever"
- `activity_days.sleep_deep/rem/light` — only sleep view, can feed quality scores
- `training_sets.rpe` — captured but not used in derived metrics
- `exercise_library.secondary_muscles`, `bilateral`, `unilateral` — captured but not used
- `vo2_max` — surface only in secondary, can drive "cardio age"
- `walking_speed` — only in secondary, can drive "cadence proxy" or "form drift"
- `flights_climbed` — only in secondary, can be a stair-climb trend
- `spO2` — captured but not surfaced in main dashboard
- `body_mass` (HealthSync) — separate from weight_entries, may cause double-counting if not deduplicated
- `measurement_sets` 13 sites — shown individually, not as ratios/asymmetry/WHR
- `food_items.fiber_per_100g`, `category` — captured, not used in diet view
- `elaborated_dishes.servings` — captured, not used to scale macros
- `workout_plans.type`, `style`, `level`, `goal` — captured, not used in filtering

### Data we don't have (would need user input or new source)
- Body composition (DEXA, InBody, calipers) — only Navy method from measurements
- Subjective wellness / mood — no data source
- Hydration — no data source
- Menstrual cycle / hormonal context — no data source
- Strength endurance / grip strength — no data source
- Photos (body composition visual) — no schema
- Custom user-defined metrics — no schema

---

## 12. Cross-phase feature index

Quick lookup: which phase adds which feature, and what data it needs.

| Feature | Phase | New data needed? | Effort |
|---|---|---|---|
| PR banner with rank | 1 | no (sport_activities.distance_km) | 2-3 days |
| Weekly goal ring | 1 | no | 1 day |
| Relative effort card | 1 | no | 1 day |
| Training log bubble | 1 | no | 1-2 days |
| Monthly calendar | 1 | no | 2-3 days |
| Streak counter | 1 | no | 1 day |
| ISO week migration | 1 | no | 0.5 day |
| Sport icon improvements | 1 | no (new lucide imports) | 0.5 day |
| Year-in-motion heatmap | 2 | no | 1-2 days |
| Time-of-day heatmap | 2 | date-only currently, no hour data | needs schema decision |
| Day-of-week histogram | 2 | no | 0.5 day |
| Sport distribution donut | 2 | no | 0.5 day |
| Recovery score composite | 2 | no | 2-3 days |
| Weight velocity chart | 2 | no | 1-2 days |
| WHR + zone | 2 | no | 1 day |
| Auto-insight cards | 2 | no | 3-4 days |
| Cardio fitness age | 2 | no (gated on vo2_max data) | 1 day |
| HRV baseline + deviation | 2 | no | 1 day |
| Estimated 1RM (Epley) | 3 | no | 1-2 days |
| PR per exercise | 3 | no | 1-2 days |
| Volume PR per session | 3 | no | 1 day |
| Plateau detector | 3 | no | 2 days |
| Strength score per muscle | 3 | no | 2-3 days |
| Tonnage weekly trend | 3 | no | 1 day |
| Goals tracker | 4 | no (settings table) | 3-5 days |
| Body battery composite | backlog | no | 2-3 days |
| Sleep onset analysis | backlog | HealthSync has onset time, would need new query | 2-3 days |
| Top protein sources | backlog | no | 0.5 day |
| Macro adherence | backlog | needs actual intake source | blocked |
| Photo timeline | new schema | needs `body_photos` table | large feature |
| Custom user metrics | new schema | needs `user_metrics` table | large feature |
| Garmin/Oura integration | external | not allowed (local-first) | n/a |
