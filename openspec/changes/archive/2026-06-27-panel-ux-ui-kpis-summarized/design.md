## Context

FitOS is a local-first Electron + SQLite desktop app that tracks Apple Watch activity, diet, energy balance, body measurements, and strength training. The current dashboard (`src/renderer/views/dashboard.js`) is a 5+ card data-dense grid showing raw numbers (kcal, peso, HRV, RHR, pasos, balance semanal). Although accurate, the dashboard lacks the **achievement-oriented summary layer** that motivates users — the Strava/Apple Fitness "you did X, you have a Y-week streak, your best time is Z" framing. The user has provided a detailed UX spec (`Newpanels.md`) describing 6 Strava-style panels (PR banner, weekly-goal ring, relative-effort comparison, training-log bubbles, monthly calendar, streak) and wants them added to FitOS.

The data to power these panels is **already in the database**: `sport_activities` (with `distance_km`, `duration_min`, `sport_type`), `activity_days` (with `steps`, `active_kcal`), `user_profile` (for streak start reference), and `settings` (for new weekly-target value). The work is therefore primarily a **renderer-layer visualization feature** plus pure-function KPI derivations, with a thin IPC layer to expose the derivations. No schema migrations, no breaking changes.

The renderer already uses organic-aesthetic tokens (moss/bone/ember), Lucide SVG icons, Chart.js, and growth-ring/sparkline utilities. The new panels must reuse these primitives — not introduce a new visual language — while feeling distinct enough to register as a "summary zone" above the existing health-metrics grid.

## Goals / Non-Goals

**Goals:**

- Deliver 6 panels (PR banner, weekly-goal ring, relative-effort, training-log bubbles, monthly calendar, streak) that match the spec in `Newpanels.md` in layout, data, and visual hierarchy.
- Compute all derived KPIs in pure functions (no SQL tricks, no JOINs) so they're testable in isolation.
- Expose 6 IPC handlers (`db:getPersonalRecords`, `db:getWeeklyGoal`, `db:getRelativeEffort`, `db:getTrainingLogWeek`, `db:getMonthlyCalendar`, `db:getStreak`) — read-only, no schema changes.
- Integrate panels into the existing dashboard as a new top block, leaving the existing health-metrics grid and sports section intact.
- Reuse organic-aesthetic tokens and existing utilities (`growthRing`, `sparkline`, `icon`, `sportIcon`, `renderStateCard`).
- All UI strings in Spanish via new `strings.stravaPanels.*` namespace.
- Pass all existing 52 tests + 10 new tests (unit + smoke) = 62/62.

**Non-Goals:**

- No backend / DB schema changes.
- No new npm dependencies.
- No new Chart.js instances — bubble chart and ring are pure SVG/CSS.
- No real-time updates; panels re-render on date-range selector change or view mount only.
- No export/share UI beyond a `mailto:` for the streak.
- No push notifications / badges / dock icons.
- No mobile/responsive optimization beyond the existing 3-breakpoint system; panels render desktop-first.
- No comparison between different sport types in the same panel (PRs and effort are per-sport-type where applicable).

## Decisions

### Decision 1: Derived-KPI layer in `utils/kpi-derivation.js`, not in SQL

**Why:** Pace projection, effort weighting, and streak calculation are all sequential JS logic with no benefit from SQL. Keeping them in pure JS functions:
- Makes them trivially unit-testable (no DB fixture needed for the 10+ derivation edge cases).
- Lets the renderer pre-render skeletons while the derivation runs.
- Aligns with existing patterns (`utils/bmr.js`, `utils/calories.js`).

**Alternatives considered:**
- SQL with CTEs: would force derivations into the IPC handler, harder to test, slower to iterate.
- Hybrid (SQL aggregation + JS post-processing): too complex for the small dataset (≤ 2000 activities over a year).

### Decision 2: Standard-distance PRs via pace projection, not by exact-match only

**Why:** The user almost never runs exactly 5.00 km — they run 5.13 km, 4.97 km, etc. Computing PRs by **pace (min/km) and projecting to the nearest standard distance** lets us surface a 5 km PR even from 4.87 km runs, using Riegel's formula `t2 = t1 × (d2/d1)^1.06`. This matches how Strava presents "5 km PR" when the actual run was 4.97 km.

**Algorithm:**
1. For each running/cycling `sport_activities` row where `distance_km >= 1.0`, compute `pace_min_per_km = duration_min / distance_km`.
2. For each standard distance D ∈ {1, 1.609 (1mi), 5, 10, 21.1, 42.2}, project the activity's time to distance D via Riegel.
3. For each (sport_type, distance) bucket, find the minimum projected time → that's the PR.
4. Sort all PRs by `achieved_at DESC`, return top N (default 5).
5. Rank badge: 1 = gold (PR), 2 = silver (2nd best), 3 = bronze (3rd best) — based on the *historical* best, not just the most recent.

**Alternative considered:** Exact-match (5.00 km runs only). Rejected: in practice, the user will rarely hit exact distances, so the panel would be empty most of the time.

### Decision 3: Effort formula uses sport-type intensity multipliers

**Why:** A 60-min yoga session is not the same effort as a 60-min run. We assign a multiplier per `sport_type` (running 1.4, cycling 1.2, swimming 1.5, HIIT 1.6, strength 1.3, walking 1.0, other 1.1) and compute `effort = Σ(sport_kcal × multiplier) + steps_kcal`. This produces a single comparable number per week without trying to be physiologically precise (no HR data needed).

**Alternative considered:** HR-based TSS (Training Stress Score). Rejected: requires HR-zone data we don't have consistently; would force sparse data. The simple formula is a "perceived effort" proxy that's good enough for the comparison card.

### Decision 4: Streak counts ISO weeks (Mon–Sun), not calendar weeks

**Why:** ISO weeks are deterministic (year-week 2026-W26 always = Jun 22–28), match Strava's behavior, and avoid edge cases at month boundaries. The "current streak" is the number of consecutive ISO weeks ending at the current week that have ≥ 1 activity.

**Algorithm:**
1. Group all activities by ISO week (year, week_number) → `Set<"YYYY-WW">`.
2. From the current ISO week, walk backwards: count consecutive weeks that are in the set.
3. Stop at the first missing week. The total activities within those weeks = the streak's activity count.
4. If the current week has no activity, the streak is still "alive" if last week had one (grace period = current week). If neither current nor last week has activity, streak is broken.

**Alternative considered:** Calendar weeks (Sun–Sat) or rolling 7-day windows. Rejected: ISO weeks are the standard for fitness tracking and produce consistent UX with the rest of the industry.

### Decision 5: Monthly calendar is pure HTML grid + inline SVG, not a Chart.js instance

**Why:** Chart.js is overkill for a 35-cell grid with simple icons. Pure HTML (`<button>` per day for keyboard a11y) + inline SVG for sport icons keeps the calendar:
- Lightweight (no canvas re-layout per month change).
- Accessible (each day is a focusable button with `aria-label="25 de junio, 1 actividad, carrera"`).
- Themeable via the existing CSS tokens (`.strava-calendar-day`, `.strava-calendar-day--active`).
- Reuses the existing `sportIcon(type, 14)` utility from `utils/sport-icons.js`.

**Alternative considered:** A custom Chart.js bubble/heatmap. Rejected: loses keyboard a11y and theming flexibility.

### Decision 6: Panels block is a separate module, mounted imperatively into the dashboard

**Why:** Following the existing `views/panels/` (none exist yet, but the architecture supports it) and the `init()` pattern in each view, we create `views/panels/strava-panels.js` that exports 5 mount functions + 1 calendar controller. `dashboard.js` calls them in order, passing the parent container and a shared `getKpis()` callback for the date range. This:
- Keeps `dashboard.js` readable.
- Lets each panel be unit-tested in isolation.
- Mirrors the existing `views/activity.js` / `views/measurements.js` pattern.

**Alternative considered:** Embed panel markup directly in `dashboard.js` template strings. Rejected: would push the file past 2000 lines and make panels hard to reorder.

### Decision 7: Personal-record target distance: configurable via settings (default 5 km, 10 km, 21.1 km)

**Why:** Most users care about a few specific distances (5K, 10K, half). We show the 3 most recent/impressive PRs by default, but let advanced users configure the distance list in `settings` (key `pr_distances` = JSON array). For v1 we hard-code `{1, 5, 10, 21.1}` and add settings configurability in a follow-up.

**Alternative considered:** Auto-detect from user's activities. Rejected: noisy; user should choose what they care about.

### Decision 8: Migrate week calculations to ISO weeks (Mon–Sun) across the board

**Why:** The existing `db:getSportLifetimeStats` in `src/main/handlers/activity-handlers.js` uses `strftime('%Y-%W', date)` which is **Sunday–Saturday** week format. The new `streak-tracker` spec uses ISO weeks (Mon–Sun). Having two conflicting week boundaries would surface as the same calendar day counting in different weeks across the app — a confusing inconsistency.

**What changes:**
- `computeWeekStreak()` in `activity-handlers.js` is rewritten to use ISO week boundaries: week starts on Monday 00:00 local, computed via the same algorithm in `kpi-derivation.js → isoWeek()`.
- The "grace period" rule (current week empty = previous week counts) is preserved.
- The 500-iteration `for` loop cap is replaced with a date-range cap (max 10 years back), which is more deterministic and easier to reason about.
- `db:getSportLifetimeStats` continues to exist (no breaking IPC) but now returns ISO-aligned values.
- The `strftime('%Y-%W', date)` calls in `db:getActivityKcalByType` and `db:getSportSummaryByRange` are also updated to ISO week for consistency.

**Migration cost:** Low. One file edit in `activity-handlers.js`, no DB schema change, no preload change. Existing users may see their streak count shift by ±1 week on first launch after the upgrade (acceptable, not breaking — documented in a release note).

**Alternative considered:** Document the two definitions and add a "tipo de semana" selector in settings. Rejected: the inconsistency would surface in the same screen (dashboard relative-effort uses ISO, lifetime stats uses calendar) which is worse than a ±1 week shift.

### Decision 9: Share effort query with `db:getActivityComparison`

**Why:** The new `db:getRelativeEffort` handler and the existing `db:getActivityComparison` handler both need to compute sport + NEAT data per period. Duplicating the SQL would create two sources of truth for the same data — a calorie mismatch between the relative-effort card and the activity comparison card would confuse the user.

**What changes:**
- A private helper `getWeekSportData(from, to)` is extracted in `activity-handlers.js`. It returns `{ currentWeek, previousWeek, perSport, totals }`.
- `db:getRelativeEffort` calls `getWeekSportData()` and applies the intensity-multiplier weighting on top (`Σ (sport_kcal × multiplier) + NEAT`).
- `db:getActivityComparison` is refactored to use the same helper for its per-sport rollups. The IPC contract (`{ current, previous, currentActiveDays, ... }`) is preserved byte-for-byte — no breaking change for existing callers.
- The effort formula lives in `utils/kpi-derivation.js` (pure function) so it's unit-testable without a DB.

**Migration cost:** Low. Internal refactor, IPC contract unchanged. Both handlers stay; only the SQL plumbing is shared.

**Alternative considered:** Keep them separate and add a "consistency check" between the two. Rejected: that's defensive programming for a problem that doesn't exist if we share the query.

### Decision 10: Sport icon improvements

**Why:** The current `SPORT_ICON_MAP` in `src/renderer/utils/sport-icons.js` has weak fallbacks for `paddle`, `football`, `boxing`, and `yoga` — three of them collapse to the generic `activity` icon, which is the same as `walking` and `other`. In the monthly calendar grid (Phase 1) this would make padel, fútbol, y caminata indistinguishable.

**What changes (in `src/renderer/utils/sport-icons.js`):**

| sport_type | current icon | new icon | rationale |
|---|---|---|---|
| `paddle` | `activity` (generic) | `circle-dot` | suggests a ball on a racket face |
| `football` | `activity` (generic) | `circle` | a ball |
| `boxing` | `dumbbell` (collides with `strength`) | `swords` | combat sport iconography |
| `yoga` | `heart` (reads as cardio) | `flower-2` | peaceful, contemplative |

`running` (`footprints`), `cycling` (`bike`), `swimming` (`waves`), `HIIT` (`trending-up`), `strength` (`dumbbell`), `walking` (`activity`), `other` (`activity`) remain unchanged — they already have good mappings.

The new icons (`circle-dot`, `circle`, `swords`, `flower-2`) are tree-shaken imports added to `src/renderer/utils/icons.js` in the same change as the Strava panel icons (`medal`, `flame`, `target`, `share-2`, `chevron-left`, `chevron-right`).

**Migration cost:** Trivial. Icon name change in one map, 4 new lucide imports. No component changes — `sportIcon(type, size)` is the only API surface.

**Alternative considered:** Use `lucide-react`-style composed icons (e.g., a circle inside a racket frame). Rejected: the lucide library is icon-by-icon, not composed. We can revisit if a custom SVG is needed.

### Decision 11: Visual signature — "faint moss margin" on the Strava block

**Why:** The 6 panels must read as a coherent "athlete's training log" zone, distinct from the existing health-metrics grid below. The signature element is a **faint vertical moss-colored margin line** on the left edge of the Strava block container (3 px wide, `var(--moss)` at 40% opacity), evoking a notebook's binding margin. The block's section header (an italic Fraunces eyebrow reading "Resumen") sits inside that margin.

This follows the **one-signature-per-scope rule** from `organic-aesthetic`: the block as a whole has one signature (the moss margin), each panel inside has its own micro-signature (ring, bubbles, calendar grid, medal badge). The PR medal badge is the boldest element — gold/silver/bronze against the muted palette is the single point of visual boldness, everything else stays disciplined.

**Color additions** (only when the existing tokens are insufficient):
- Medal: `#D4A437` (gold), `#A8A8A8` (silver), `#A47148` (bronze) — contextual "achievement" hues, not part of the core palette.
- Effort levels: `#E91E8C` (very high), `#FF6B35` (high), `#9C27B0` (moderate), `#B39DDB` (low) — borrowed from the user's reference (Strava), used only inside `.effort-level--*` spans.

These additions are **localized** to the Strava panels — they do not redefine `--accent` or any other semantic token in `main.css`.

**Typography** (no additions — uses existing tokens):
- Display numbers (PR time, streak weeks/activities): `var(--font-display)` (Fraunces) at 28–36 px.
- Panel titles and eyebrows: `var(--font-body)` (Source Sans 3) italic at 12 px, per the existing eyebrow pattern.
- Tabular data (time, distance, dates): `var(--font-mono)` (JetBrains Mono) at 11–14 px.

**Restraint:**
- No new animations beyond the existing staggered fade-in (defined in `organic-aesthetic`).
- No box-shadows on the panels — use the existing card border (`var(--border)`).
- The PR medal badge is the **only** high-saturation element. Every other panel stays within the moss/bone/ember palette at desaturated levels.

## Risks / Trade-offs

- **[Risk] Pace projection may produce unrealistic times for very short or very long source activities.** A 0.5 km run projected to 42.2 km gives a wildly optimistic marathon time. → **Mitigation:** Only project from source activities where `distance_km >= 0.8 × target_distance` and `distance_km <= 1.5 × target_distance`. Outside that range, skip the projection for that target.

- **[Risk] Streak calculation is sensitive to clock/timezone.** A user logging an activity at 23:30 local on Sunday and another at 00:30 on Monday could split a "streak week" unintentionally. → **Mitigation:** Use UTC for the ISO week computation; the granularity is one week, so ±1 hour at the boundary is acceptable. Document the choice in a code comment.

- **[Risk] Calendar render at month boundaries (e.g., Feb in non-leap year = 28 days, 4 weeks vs 5).** → **Mitigation:** Always render a 6-row grid (42 cells max); days outside the current month are rendered as disabled cells with reduced opacity.

- **[Risk] 6 panels × 1 IPC call each = 6 sequential round-trips on dashboard mount.** → **Mitigation:** Wrap all 6 calls in a single `Promise.allSettled` so they run concurrently. Use `state-card.js` `loading` skeletons in parallel with each `await` so the streaming UX is preserved.

- **[Risk] Effort formula may give unexpectedly large numbers for high-volume users.** → **Mitigation:** Clamp displayed value to `[0, 999]` and format with locale-aware thousand separators. Add a `>` prefix if clamped.

- **[Risk] Personal-record banner is empty if the user has no running/cycling activities.** → **Mitigation:** Render the banner with `state-card` `empty` variant + a "Registra tu primera carrera o ruta en bicicleta para desbloquear récords" CTA, mirroring existing empty-state patterns.

- **[Risk] Date-range selector on dashboard doesn't affect the Strava panels (which always show current week/month).** → **Mitigation:** Document this clearly in the UI (subtle "Esta semana" / "Este mes" label on each panel) and the spec. The selector continues to gate the existing health-metrics grid only.

- **[Risk] Adding ~400 lines of new view code + 150 lines of CSS + 30 locale keys risks regressions in the existing dashboard.** → **Mitigation:** Wrap all new panel mounts in `safeCall` (existing pattern), add a smoke test that renders dashboard with seed data and verifies panel presence + key text, and run the full Vitest suite before merge.

## Migration Plan

This change is **purely additive** — no DB migration, no IPC contract change, no breaking UI. Deployment steps:

1. Merge the change into the working branch.
2. Run `npm run dev` and visually verify all 6 panels render with sample data.
3. Run `npm test` — expect 62/62 passing.
4. Build a packaged version with `npm run build` and confirm `app.asar` size delta is < 100 KB (no new deps).
5. Rollback: `git revert` the merge commit. No data to roll back (no schema change). No user action required.

## Open Questions

- **Q1: Should the personal-record banner auto-rotate through multiple PRs (carousel), or always show the most recent?** Spec implies single-record, but showing 3 in rotation would showcase more progress. **Default for v1:** show the most recent, with a small "Ver todos (N)" link that opens a modal.
- **Q2: Should the relative-effort comparison be a single value or per-sport-type bars?** Spec shows a single number. **Default for v1:** single number, but expose per-sport data in the IPC payload so a follow-up can add a "ver por deporte" drilldown.
- **Q3: Should the streak counter reset if the user takes a rest week?** **Default for v1:** yes — any week with 0 activities breaks the streak. A "rest weeks allowed" config is out of scope.
- **Q4: Should the monthly calendar show future days as ghosted or hidden?** **Default for v1:** show future days of the current month as ghosted (50% opacity, no hover, no click). Days outside the current month (prev/next month overflow) hidden.
