## Context

The dashboard (Panel) view has accumulated several visual and functional issues after the organic redesign. The hero card's growth ring encodes step counts but sits beside a kcal-balance headline, creating semantic confusion. The green "Resumen de Actividad" card is positioned at the bottom of the dashboard (Row 4) instead of near the top. Five health-metric cards in an auto-fill grid leave empty grid tracks, producing a large blank space between "Presión Arterial" and the activity summary. The steps-by-period display shows identical values for 7d/15d/1m when the selected range is shorter than 1m, because `dailyData` is bounded by the selected range. The date selector offers `7d/15d/1m` but the user wants `15d/1m/3m`.

Separately, the weekly sport summary chart in the Activity view is silently broken: `ccEl.innerHTML = skeletonCard()` destroys the `<canvas id="weekly-chart">` element at init time, so `loadChart()` early-returns because `document.getElementById('weekly-chart')` is null. The sidebar shows a redundant full title "FitOS - Salud y Rendimiento" instead of just "FitOS", and lacks the user's profile name. The dashboard and activity nav items share the same Lucide `Activity` icon.

All data required for these fixes is already available via existing IPC handlers (`health:getDailySummary`, `db:getSportSummaryByRange`, `db:getActivityComparison`). No backend changes are needed.

## Goals / Non-Goals

**Goals:**
- Make the hero card's ring visual semantically coherent with its headline metric
- Move the green activity summary to the top of the dashboard (after the hero card)
- Eliminate blank grid gaps between dashboard sections
- Change the dashboard date selector to fixed `15d / 1m / 3m` options
- Fix the steps-by-period bug so 7d/15d/1m averages are always computed from their proper windows
- Give the dashboard nav item a distinct icon (not shared with Actividad)
- Fix the broken weekly sport summary chart in the Activity view
- Add a session-count 7d/15d/1m comparison to the weekly sport summary card
- Display "FitOS" as app name and "Leandro Pollola" as profile name in the sidebar header

**Non-Goals:**
- Taking the profile name from the `user_profile` table (hardcoded for now; future enhancement)
- Changing other duplicate nav icons (energy/analytics, diet/profile) — only dashboard is in scope
- Adding new IPC handlers or backend logic — all data already exists
- Changing the chart types on the dashboard (kcal/día trend chart stays as-is)
- Redesigning the sidebar layout beyond the header area

## Decisions

### D1: Hero ring encodes kcal balance instead of steps

**Decision**: Pass daily energy-balance values to `growthRing()` instead of step counts. The ring already sits beside the kcal-balance headline, so encoding the same metric makes the visual semantically coherent. The ring's tree-ring metaphor (radius grows with day index, stroke width scales with value) works equally well for balance values.

**Alternative considered**: Keep the ring as steps but add a "Pasos" label above it. Rejected because the user perceives it as a "kcal circle" — separating the two metrics would still leave the visual association confusing.

**Alternative considered**: Replace the ring with a simpler progress bar. Rejected because the ring is the dashboard's signature organic element and removing it would contradict the `organic-aesthetic` spec.

### D2: Dashboard row restructure — activity summary to top

**Decision**: Reorder the dashboard rows:
1. Row 1: Hero card (full width) — unchanged position
2. Row 2: Green "Resumen de Actividad" (`.card-accent`, full width) + per-sport detail cards (auto-fill)
3. Row 3: Core metric cards (weight, HRV+RHR, sleep, stand, walk, sessions)
4. Row 4: Health metric cards (steps, exercise, RHR, SpO2, BP)
5. Row 5: kcal/día trend chart (full width)

This moves the green summary from the bottom to right after the hero, and moves the trend chart to the very bottom. The blank space between "Presión Arterial" and the activity summary is eliminated because the activity summary is no longer below the health metrics.

**Alternative considered**: Add a 6th card to Row 2 to fill the empty grid track. Rejected because it doesn't address the core issue (wrong ordering) and would require inventing a new metric card.

### D3: Date selector — 15d / 1m / 3m

**Decision**: Change the filter buttons from `7d / 15d / 1m` to `15d / 1m / 3m`. Default range changes from `7d` to `15d`. Add `3m` (90 days) mapping to `date-range.js`. Remove `7d` from the dashboard filter.

**Alternative considered**: Keep 7d and add 3m as a fourth option. Rejected because the user explicitly asked for "ultimos 15dias / ultimo mes / ultimos 3meses" as the three fixed options.

### D4: Steps-by-period fix — independent 30d fetch

**Decision**: Always fetch 30 days of daily summary data for the step-period averages, regardless of the selected chart range. The step card's 7d/15d/1m averages are computed from this independent 30d dataset by slicing the last 7, last 15, and full 30 days. The chart and other cards continue to use the selected range's data.

**Alternative considered**: Issue three separate `getHealthDailySummary` calls for 7d/15d/1m. Rejected as wasteful — a single 30d fetch contains all three windows.

### D5: Dashboard nav icon — LayoutDashboard

**Decision**: Import `LayoutDashboard` from Lucide in `icons.js`, register it as `'layout-dashboard'`. Update `iconMap` in `app.js` to map `dashboard` to `'layout-dashboard'` instead of `'activity'`.

**Alternative considered**: Use `Gauge` or `Home` icon. Rejected — `LayoutDashboard` is the conventional icon for a dashboard/overview panel and is visually distinct from `Activity` (pulse line).

### D6: Weekly chart fix — preserve canvas during skeleton

**Decision**: In `activity.js`, stop overwriting `.chart-container` innerHTML with `skeletonCard()`. Instead, inject the skeleton into a dedicated wrapper element (or toggle a loading class). In `loadChart()`, ensure the `<canvas id="weekly-chart">` exists before instantiation — create it if missing.

**Alternative considered**: Re-create the canvas at the start of `loadChart()` with `ccEl.innerHTML = '<canvas id="weekly-chart"></canvas>'`. This is simpler but still loses any existing chart state. The chosen approach (preserve canvas, skeleton in separate wrapper) is cleaner.

### D7: Session-count comparison strip

**Decision**: Add a KPI strip above the weekly sport summary chart showing total sessions for the selected range (7d/15d/1m) with a period-over-period comparison arrow. Use `getSportSummaryByRange(from, to)` for the current total (sum of `count` across sport types) and `getActivityComparison(from, to)` for the previous-period total. Display as "N sesiones · ▲/▼ vs período anterior".

### D8: Sidebar header — app name + user name

**Decision**: Change the sidebar header to show "FitOS" as the `<h1>` (instead of the full `strings.appTitle`). Replace the `.sidebar-subtitle` content with the user's profile name "Leandro Pollola". Add locale keys `strings.appName` = "FitOS" and `strings.profileName` = "Leandro Pollola". Update the inline `<head>` script to use `strings.appName` for the h1 instead of `strings.appTitle`. Structure the code so `strings.profileName` can later be replaced by a profile-driven value.

## Risks / Trade-offs

- **[Visual hierarchy shift]** Moving the green summary to the top changes the dashboard's information hierarchy significantly. → Mitigation: the green card's visual weight (moss background, full width) makes it a natural secondary focal point after the hero, which is the intended hierarchy.

- **[Hardcoded user name]** The profile name "Leandro Pollola" is hardcoded in locale strings. → Mitigation: isolate it in a single locale key (`strings.profileName`) so the future migration to profile-driven data is a one-line change.

- **[7d option removed]** Users who relied on the 7d dashboard filter will no longer find it. → Mitigation: 15d as the new default provides a similar short-term view; the 7d data is still visible in the steps card's 7d average.

- **[Ring semantic change]** Switching the ring from steps to kcal balance means the legend ("Activo"/"Bajo") must be updated to reflect balance semantics (e.g., "Superávit"/"Déficit" or "Excedente"/"Déficit"). → Mitigation: update legend strings in the same change.
