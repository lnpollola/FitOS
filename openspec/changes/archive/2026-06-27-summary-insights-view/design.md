## Context

FitOS is a local-first Electron + SQLite desktop app that tracks Apple Watch activity, diet, energy balance, body measurements, and strength training. The analytical surface today splits into:

- **`dashboard`** — at-a-glance summary. Recently enhanced (Phase 1, `panel-ux-ui-kpis-summarized`, 126/126 tasks) with 6 Strava-style panels above the hero card: PR banner, weekly goal ring, relative-effort card, training-log bubble chart, streak counter, and monthly activity calendar. Below them: health KPI grid, trend charts, sports section.
- **`analytics`** — power-user trend view. Date-range selector, 6 chart panels (steps, HR, energy, HRV, sleep, activity ranking), KPI rollups, and a secondary metrics section.
- **`activity`**, **`diet`**, **`energy`**, **`sleep`**, **`measurements`**, **`training`**, **`profile`** — domain-specific CRUD/insight views.

The 22-table SQLite database (`src/db/database.js`) and the read-only HealthSync SQLite database (`~/.healthsync/healthsync.db`) together hold enough data to answer "what does my training and recovery look like *over time*?". That question is currently not answered anywhere — the dashboard compresses the answer into "this week", and analytics shows raw trend lines but no synthesis ("HRV 12% above your 30-day baseline", "your best week in 3 months", "WHR moved from 0.91 to 0.87 in 12 weeks"). The data is there; the synthesis is missing.

This change adds a new **`insights` view** positioned in the INICIO sidebar section between `dashboard` (Panel) and `analytics` (Tendencias). The view surfaces **7 derived KPIs** in a vertical-scroll layout: year-in-motion heatmap, day-of-week histogram, sport distribution donut, recovery score composite, weight velocity chart, waist-to-hip ratio card, and auto-generated insight cards. Each KPI is computed from existing tables by a new pure-JS derivation layer (`utils/kpi-derivation.js` extension) and exposed via 7 new IPC handlers (`src/main/handlers/insights-handlers.js`).

The renderer already uses organic-aesthetic tokens (moss/bone/ember palette, Fraunces/Source Sans 3 typography, Lucide icons, Chart.js, growth-ring/sparkline utilities) — the new view reuses these primitives. The `views/panels/strava-panels.js` module from Phase 1 establishes the "small mount function returning destroy()" pattern that the auto-insight cards and year-in-motion heatmap will follow.

The data the insights need is **already in the database**: `sport_activities` (with `distance_km`, `duration_minutes`, `sport_type`, `calories`), `activity_days` (with `sleep_hours`, `sleep_deep/rem/light`, `steps`, `active_calories`, `resting_calories`), `weight_entries`, `measurement_sets` (13 sites including `waist`, `hips`), `user_profile` (sex for WHR zone classification), `settings` (`target_pace` for velocity reference band), and HealthSync tables `hrv` and `resting_heart_rate`. The work is therefore primarily a **renderer-layer visualization feature** plus pure-function KPI derivations, with a thin IPC layer. No schema migrations, no breaking changes.

## Goals / Non-Goals

**Goals:**

- Deliver 7 insight sections (year-in-motion, day-of-week, sport distribution, recovery, weight velocity, WHR, auto-insights) that convert the user's accumulated data into a clear "what does it mean over time" narrative.
- Compute all derived KPIs in pure functions (`utils/kpi-derivation.js`) so they're testable in isolation with no DB fixture.
- Expose 7 IPC handlers (`db:getYearInMotion`, `db:getDayOfWeekStats`, `db:getSportDistribution`, `db:getRecoveryScore`, `db:getWeightVelocity`, `db:getWHR`, `db:getAutoInsights`) — read-only, no schema changes.
- Add a new sidebar nav item (`data-view="insights"`, label "Patrones", icon `sparkles`) in the INICIO section, between dashboard and analytics. Wire it through `app.js` `views` map and `iconMap`.
- Reuse organic-aesthetic tokens, Lucide icons, Chart.js, growth-ring, and sparkline utilities.
- Add a date-range selector (90d / 6m / 1y) that gates the time-dependent sections (heatmap, histograms, velocity chart). Recovery and WHR are point-in-time (current state) and ignore the selector.
- All UI strings in Spanish via new `strings.insights.*` namespace (~80 keys).
- Pass all existing 180 tests + 23 new tests (15 unit + 8 smoke) = 203/203.

**Non-Goals:**

- No backend / DB schema changes.
- No new npm dependencies.
- No new Chart.js plugin beyond what's already loaded.
- No real-time updates; view re-renders on date-range selector change, view mount, or `data-changed` event.
- No export/share UI for the insights (a future "compartir" button is out of scope).
- No push notifications / badges / dock icons.
- No mobile/responsive optimization beyond the existing 3-breakpoint system; view is desktop-first.
- No strength-training insights (Phase 3 — separate change).
- No goals tracking (Phase 4 — separate change).
- No time-of-day heatmap — the data doesn't support it (`sport_activities.date` is a date, not a timestamp). The KPIS.md backlog documents this; the day-of-week histogram is the closest signal we can produce from date-only data.
- No sleep onset time analysis — HealthSync `sleep` table has onset time, but the current handlers don't expose it. Backlog for a future change.
- No overtraining detection, body-battery composite, or stress index — listed in KPIS.md as "Backlog" pending more data signals.

## Decisions

### Decision 1: New top-level view, not another dashboard section

**Why:** The 7 insight sections are fundamentally different from the 6 Strava panels in three ways — time horizon (90d/6m/1y vs current week), heuristic density (composite scores vs raw aggregates), and user mental model ("what does it mean" vs "what just happened"). A separate view with its own URL, loading choreography, and date-range selector is the cleanest way to give these patterns the space they need. The dashboard would otherwise exceed 1500 lines of view code and dilute the at-a-glance intent.

**Alternatives considered:**
- **A modal/overlay accessible from the dashboard.** Rejected: modals are bad for longitudinal data (no scroll history, no URL state, no shareable deep-link).
- **A new tab in the analytics view.** Rejected: analytics is a power-user view with raw trend charts; the insights are a different audience (everyday user) and a different cognitive layer (synthesis vs raw).
- **A collapsible "Insights" section at the bottom of the dashboard.** Rejected: would push existing sports content below the fold and make the dashboard's scroll length unpredictable.

### Decision 2: Hand-rolled SVG heatmap, not Chart.js

**Why:** A 53-week × 7-day grid is 371 cells max. Chart.js's matrix chart plugin would force a new dependency and add a learning-curve dependency for a render that's pure SVG. Hand-rolling the SVG keeps the heatmap:
- Lightweight (no canvas re-layout on hover).
- Accessible (each cell is a `<rect>` with `<title>` for tooltip; can be wrapped in `<a>` for click-to-day).
- Themeable via existing CSS tokens (`.insights-heatmap-cell--moss-1` → `--moss-1`).
- Zero new dependencies.

**Algorithm:**
1. Compute the trailing 365 days from `now`.
2. Group `sport_activities.duration_minutes` by `date` → map of `YYYY-MM-DD → minutes`.
3. Compute the 5-step bucket thresholds: `[0, 1, 15, 30, 60, ∞]` minutes → `moss-0` (no fill), `moss-1` through `moss-5` (faintest to darkest).
4. Render 53 column groups (ISO weeks), each containing 7 day cells. Future days of the current week are rendered with `moss-0` + reduced opacity.

**Alternatives considered:**
- **Chart.js matrix chart.** Rejected: requires `chartjs-chart-matrix` plugin, adds 8 KB gzipped for a 1-screen render.
- **D3.js heatmap.** Rejected: D3 is not currently in the dependency tree; would force ~70 KB of new code for one render.

### Decision 3: Recovery score is a personal-baseline-normalized composite, not absolute thresholds

**Why:** Absolute recovery thresholds (HRV > 50 ms = good) are meaningless across users — a 25-year-old athlete with HRV 80 ms is in worse shape than a 50-year-old with HRV 45 ms, and a user upgrading from HRV 30 to 35 ms has improved significantly even though the absolute number is still "low". Normalizing against the user's 30-day personal baseline (and computing deviation as a z-score) makes the score interpretable as "how am I doing *relative to myself*".

**Algorithm (per signal):**
1. Compute the 30-day baseline: `mean(signal over days [-30, -1])` and `stdDev(signal over same window)`.
2. Compute the 7-day current window: `mean(signal over days [-7, 0])`.
3. Compute the z-score: `z = (current - baseline) / baseline_stdDev` (clamped to [-3, +3]).
4. Convert to 0–100 sub-score: `sub = 50 + 15 × z` for HRV and sleep (higher = better recovery), `sub = 50 - 15 × z` for RHR (lower = better recovery).
5. Composite: `0.4 × hrv_sub + 0.3 × (100 - rhr_sub) + 0.3 × sleep_sub`, clamped to [0, 100].
6. Color zone: `low` < 40, `moderate` 40–70, `high` > 70.

**Fallback:** If a 30-day baseline doesn't exist yet (e.g., new HealthSync import with < 30 days of data), the view renders a one-line note ("Necesitas al menos 30 días de datos de HRV/RHR/sueño para calcular tu línea base personal") and hides the sub-meters and composite. The empty state is informative, not just blank.

**Alternatives considered:**
- **Absolute thresholds (WHO sleep recommendations, age-band HRV percentiles).** Rejected: not actionable; users would see "low recovery" for 6 months while their actual fitness improves.
- **Garmin Body Battery-style time-decay model.** Rejected: requires per-hour HR samples; the data we have is daily aggregates.

### Decision 4: Weight velocity uses 28-day rolling delta, not point-to-point

**Why:** Daily weight fluctuates ±1 kg from water, food volume, and timing. A 28-day rolling delta (latest - 28d_ago) / 4 weeks smooths out the noise and produces a single "kg per week" rate that's directly comparable to the user's `target_pace` setting. This is the same window the energy balance view uses for its deficit projection, keeping the two views consistent.

**Algorithm:**
1. Read the last 180 days of `weight_entries`.
2. For each day D in the trailing 90 days, compute the velocity: `velocity(D) = (weight(D) - weight(D-28)) / 4`. Skip days where D-28 has no entry.
3. Plot the velocity line with a horizontal reference line at `target_pace_reference_velocity = -target_pace` (where `target_pace` is read from `settings` as a positive magnitude, matching the convention in `diet.js:704` and `adaptive.js`). Default magnitude is 0.5 (loss phase), so default reference line is at y = -0.5.
4. Annotate the global minimum (PR weight) with a marker and date.

**Scope boundary with Phase 4 (`goals-tracker`):** Phase 2 reads the existing `settings.target_pace` (a rate of weight change, in kg/week, stored as a positive magnitude). Phase 4 will introduce `settings.target_weight_kg` (a target weight to reach, in kg) and a countdown UI. The two settings are independent and coexist: `target_pace` answers "how fast am I trying to change weight?" while `target_weight_kg` answers "what weight am I trying to reach?". Phase 2 SHALL NOT introduce `target_weight_kg` or any goal-progress UI; that is the responsibility of the Phase 4 `goals-tracker` change. The weight velocity chart and the weight direction match auto-insight in Phase 2 reference `target_pace` only.

**Alternatives considered:**
- **Exponential moving average.** Rejected: harder to interpret; a 28-day rolling window is the standard fitness-tracking convention.
- **Linear regression over the full window.** Rejected: doesn't show week-to-week variability, which is the signal the user wants to see.

### Decision 5: WHR zones follow WHO/OMS, not WHO/NIH

**Why:** The KPIS.md doc already specifies the WHO/OMS zones (Hombres: <0.90 / 0.90-0.99 / ≥1.00; Mujeres: <0.80 / 0.80-0.84 / ≥0.85). These are the WHO 2008 cutoff points and the de facto industry standard. The data we have is `user_profile.sex` (which the handler already uses to compute Navy body-fat %), so the zone classification is trivially parameterizable by sex.

**Algorithm:**
1. Read the latest `measurement_sets` row where both `waist` and `hips` are non-null.
2. Compute `whr = waist / hips`.
3. Classify by `user_profile.sex` (`'M'` → men's zones, `'F'` → women's zones, anything else → no classification, just display the number).
4. Render the number with a color-coded chip and the zone label.

**Alternatives considered:**
- **NIH 1998 cutoffs** (which differ slightly for some demographics). Rejected: OMS is the international standard and is already in the KPIS.md doc.
- **User-configurable thresholds.** Rejected: out of scope; users shouldn't need to configure public-health reference values.

### Decision 6: Auto-insights are deterministic heuristics, not LLM-generated

**Why:** This is a local-first app. Calling an LLM API would (1) require an external dependency that doesn't fit the architecture, (2) introduce non-determinism (a unit test for "HRV is 12% above your average" must produce the same text every run), and (3) require user data to leave the device. Deterministic heuristic templates with `{value}` interpolation produce stable, testable, offline-friendly insights.

**Algorithm:**
1. Each insight template is a function `template(data) → string | null`. The function returns `null` if the precondition isn't met, hiding that insight.
2. Templates are pure functions in `utils/kpi-derivation.js` (`generateAutoInsights(weekStreak, recoveryScore, weightVelocity, sportVariety, ...)`). They run on already-computed KPIs in the renderer — no separate IPC.
3. The function returns an array of 5–8 insight cards, each with `{ icon, text, severity, navigateTo }`.
4. The card text is a template literal: `\`HRV ${pct.toFixed(0)}% ${direction} de tu promedio de 30 días\``.

**Example templates:**
- `bestWeekStreak(weeks)` → "Llevas ${weeks} semanas consecutivas con actividad — tu mejor racha desde ${month}." (only if weeks ≥ 4)
- `hrvDeviation(current, baseline)` → "HRV ${pct}% ${direction} tu promedio." (only if |pct| ≥ 10)
- `restDayStreak(restDays)` → "Llevas ${n} días sin actividad — ¿descanso planificado o rutina perdida?" (only if restDays ≥ 5)
- `weightDirectionMatch(velocity, targetPace)` → "Tu ritmo actual (${velocity.toFixed(2)} kg/sem) está ${relation} tu objetivo (${targetPace} kg/sem)." (only if both are defined)
- `sportVarietyScore(distribution)` → "Has entrenado ${n} deportes distintos esta semana. Diversidad alta." (only if variety ≥ 4)
- `recoveryTrend(scores7d)` → "Tu recuperación ha mejorado ${n}% en los últimos 7 días." (only if |delta| ≥ 10)
- `whrImprovement(current, baseline)` → "Tu ratio cintura-cadera ha mejorado de ${a} a ${b} en 12 semanas." (only if WHR data spans 12+ weeks)
- `prWeek(prsThisWeek)` → "Has establecido ${n} récords personales esta semana." (only if n ≥ 1)

The 5–8 cap is achieved by computing all templates, sorting by severity (`positive` < `info` < `alert`), and taking the top 5–8 that have non-null outputs.

**Alternatives considered:**
- **LLM-generated insights.** Rejected: external dependency, non-determinism, privacy concern, no offline support.
- **Predefined static list.** Rejected: doesn't personalize; one-size-fits-all text doesn't motivate.

### Decision 7: All 7 IPC handlers in a new `insights-handlers.js`, mirroring the modular-handlers pattern

**Why:** Phase 1 already extracted `strava-panels-handlers.js` from the monolithic `ipc-handlers.js` (a `modular-ipc-handlers` spec exists). The new domain follows the same pattern: one file per domain, registered in `ipc-handlers.js` via a single `registerInsightsHandlers(db, mainWindow)` call. This keeps `ipc-handlers.js` from growing beyond ~700 lines.

**File structure:**
```js
// src/main/handlers/insights-handlers.js
function registerInsightsHandlers(db, mainWindow) {
  ipcMain.handle('db:getYearInMotion', (_event, fromIso, toIso) => {
    // SELECT date, SUM(duration_minutes) FROM sport_activities
    // WHERE date BETWEEN ? AND ? GROUP BY date
  });
  // ... 6 more handlers
}
module.exports = { registerInsightsHandlers };
```

**Alternatives considered:**
- **Inline in `ipc-handlers.js`.** Rejected: would push the file past 700 lines and dilute the domain boundaries established by the modular-handlers refactor.
- **One file per handler.** Rejected: 7 files for 7 small handlers is over-engineered; the file is 300 lines, well within maintainable bounds.

### Decision 8: Date-range selector gates only time-dependent sections

**Why:** Some sections (recovery, WHR) are point-in-time "where am I right now" — varying the date range produces a moving window that doesn't add information. Other sections (heatmap, day-of-week, sport distribution, weight velocity) are explicitly about patterns *over time* — varying the date range *is* the user control. The selector is therefore applied to the time-dependent sections only, with recovery and WHR always showing "current" state.

**Implementation:** The `loadAll()` function in `views/insights.js` reads the active range (90d / 6m / 1y) and passes it to 4 of the 7 IPC handlers. The 3 point-in-time handlers (`db:getRecoveryScore`, `db:getWHR`) ignore the range parameter and always return the current state. The auto-insights handler receives all KPIs as a single payload (no separate IPC) and runs the templates client-side.

**Alternatives considered:**
- **Selector gates everything.** Rejected: would make the recovery score and WHR "frozen" at a specific date, which is the opposite of what those metrics mean.
- **No date-range selector.** Rejected: a 1-year heatmap by default would be too dense for new users; the selector lets them expand once they have data.

### Decision 9: Heatmap color scale uses 5-step `moss-1` → `moss-5` tokens, not a continuous gradient

**Why:** A 5-step discrete scale (0 min, 1-14 min, 15-29 min, 30-59 min, 60+ min) is more readable than a continuous gradient — the eye can count buckets at a glance. The thresholds match common training-volume milestones (15 min = "moved", 30 min = "worked out", 60 min = "serious session"). 5 buckets also map cleanly to 5 CSS classes (`.insights-heatmap-cell--moss-1` through `--moss-5`).

**Alternatives considered:**
- **Continuous gradient (linear interpolation between moss-mist and moss-ink).** Rejected: produces an indistinct mass of green at the cell level; harder to spot "rest day" gaps.
- **Logarithmic scale.** Rejected: harder to interpret; users don't think in log minutes.

### Decision 10: Empty state per section, not per view

**Why:** The 7 sections have very different data requirements. A user with 3 weeks of Apple Watch data has a populated heatmap but no WHR (no measurements yet) and no recovery score (no 30-day baseline). Showing one global "no data" state would be confusing. Each section renders its own empty state with the specific data requirement and a CTA ("Importa datos de Apple Health" or "Registra medidas corporales").

**Implementation:** Each section's `renderSection(data)` checks for the section's data requirements and either renders the data or the section-specific empty state via `renderStateCard(container, { state: 'empty', ... })`.

**Alternatives considered:**
- **One global empty state.** Rejected: hides the sections that *do* have data.
- **Section-level "loading" + section-level "empty".** Adopted: this is the pattern Strava panels already use.

## Risks / Trade-offs

- **[Risk] The year-in-motion heatmap can be expensive for users with multi-year data.** 365 days × 1 SQL query is fine, but the SVG render of 371 cells on a slow machine could take 200+ ms. → **Mitigation:** Use a `<svg>` element with `<rect>` children (not foreignObject), set `shape-rendering="crispEdges"` to avoid subpixel anti-aliasing, and apply a single CSS class per cell so the browser can batch paint. If the date range is > 1 year, the handler returns the trailing 365 days only (the default range cap is 1 year; the 6m and 1y selector options map to 180d and 365d respectively).

- **[Risk] Recovery score with < 30 days of HRV/RHR/sleep data falls back to empty state.** A user who just imported Apple Health won't see the recovery score for 30 days, which is a long time. → **Mitigation:** Show a progress bar "Faltan X días para tu primera puntuación de recuperación" with the count of days remaining. Once the baseline is established, the empty state is gone.

- **[Risk] Auto-insight heuristics may produce nonsensical text if a single KPI has a data anomaly (e.g., a 1-day water-weight spike in `weight_entries`).** → **Mitigation:** Each template's data is filtered for outliers (e.g., weight velocity uses 28-day rolling, immune to single-day spikes) and templates have minimum thresholds (|pct| ≥ 10, n ≥ 4) to suppress marginal signals.

- **[Risk] Adding a new nav item between `dashboard` and `analytics` could break existing user muscle memory.** → **Mitigation:** The new item sits in the same INICIO section, between the two existing items. The sidebar's expand/collapse, active-view pinning, and localStorage persistence behavior is unchanged. The item follows the existing pattern (icon, label, aria-label, data-section) — no new CSS or interaction model is introduced.

- **[Risk] Day-of-week histogram can be misleading with very few weeks of data (e.g., 1 week of activity shows "you only train on Mondays" with n=1).** → **Mitigation:** If the date range covers < 4 weeks, render the histogram with a caveat: "Patrón parcial (X semanas)". If < 2 weeks, hide the histogram entirely and show "Necesitas al menos 2 semanas de datos para identificar tu día favorito".

- **[Risk] WHR zone classification depends on `user_profile.sex` being set.** If the user has no profile or didn't fill in sex, the zone is unknown. → **Mitigation:** Show the raw WHR number with a "Zona no clasificada — completa tu perfil" CTA, mirroring the existing profile-empty patterns. Do not guess the sex from the WHR value itself (that would be circular and risk misclassification).

- **[Risk] 7 new IPC calls on view mount = 7 sequential round-trips.** → **Mitigation:** Wrap all 7 in `Promise.allSettled` so they run concurrently. Each section renders its own skeleton during its own IPC, so the streaming UX is preserved. The auto-insights handler isn't a separate IPC — it runs client-side from already-fetched data, so it's effectively free.

- **[Risk] Sport distribution donut with 11 sport types is hard to read.** → **Mitigation:** If the user has > 6 distinct sport types in the 90-day window, aggregate the smallest 3 into "Otros" (with the breakdown available in a tooltip). This keeps the donut visually clean while preserving the information.

- **[Risk] Auto-insight text could feel repetitive if the same template fires every time the view is opened.** → **Mitigation:** Each template has a `lastShownDate` check; a template that fired in the last 24h is suppressed unless its severity is `alert`. This produces variety over consecutive view openings without losing the "you have a 6-week streak" message that should stay visible.

- **[Risk] Adding ~600 lines of new view code + 200 lines of CSS + 80 locale keys + 300 lines of IPC + 120 lines of derivation utilities risks regressions in the existing views.** → **Mitigation:** Wrap all new IPC calls in `safeCall` (existing pattern), add a smoke test that renders the view with seed data and verifies section presence + key text, and run the full Vitest suite (180 existing + 23 new) before merge.

## Migration Plan

This change is **purely additive** — no DB migration, no IPC contract change, no breaking UI. Deployment steps:

1. Merge the change into the working branch.
2. Run `npm run dev` and visually verify all 7 sections render with sample data, with empty states, and with error states.
3. Run `npm test` — expect 203/203 passing (180 existing + 15 new unit + 8 new smoke).
4. Build a packaged version with `npm run build` and confirm `app.asar` size delta is < 50 KB (no new deps).
5. Rollback: `git revert` the merge commit. No data to roll back (no schema change). No user action required. The sidebar nav item is removed with the revert; the dashboard and analytics views continue to function identically.

## Open Questions

- **Q1: Should the auto-insights cards have a "dismiss" button that hides that specific card?** Spec implies no — the cards are deterministic and re-generate on every mount. **Default for v1:** no dismiss. A future "personalize insights" feature (Phase 4+ goals) might add suppression.
- **Q2: Should the recovery score show a 7-day sparkline below the composite number?** The sparkline is data we have (the 7 daily sub-scores) and would help the user see "trending up" vs "stable". **Default for v1:** yes, add a 60×20 px sparkline below the composite showing the last 7 days. Uses the existing `sparkline()` utility from `utils/sparkline.js`.
- **Q3: Should the year-in-motion heatmap be clickable to drill into a specific week?** Spec implies no — the heatmap is a visual summary, not a navigation surface. **Default for v1:** no click, but a hover tooltip shows the date and total minutes. Future enhancement could navigate to `analytics` with a date range filter.
- **Q4: Should the WHR sparkline show 90 days or all-time?** 90 days is a good default (long enough to see a trend, short enough to fit in a card). **Default for v1:** 90 days, with a "ver todo" link in a future iteration.
- **Q5: Should the date-range selector default to 90d or 1y?** 90d is friendlier for new users (less intimidating, more visible week-to-week); 1y is the most informative for established users. **Default for v1:** 90d, matching the analytics view's default. The selector is always visible so the user can switch to 1y in one click.
- **Q6: Should the insights view be gated by data volume (e.g., require ≥ 30 days of activities to show the heatmap)?** **Default for v1:** no gate — the empty state is the gate. If the user has 5 days of data, the heatmap shows 5 cells of color and the rest are blank, which is informative ("you've barely started") and motivating.
