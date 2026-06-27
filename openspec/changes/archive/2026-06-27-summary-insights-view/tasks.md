# Tasks

## 1. Locale Strings

- [x] 1.1 Add `strings.insights.title = 'Patrones'` and section titles (`heatmap`, `dayOfWeek`, `sportDistribution`, `recovery`, `weightVelocity`, `whr`, `autoInsights`) in `src/renderer/locales/es.js`
- [x] 1.2 Add `strings.insights.dateRange.{label90d, label6m, label1y, custom}` in `src/renderer/locales/es.js`
- [x] 1.3 Add `strings.insights.heatmap.{title, caption, tooltip, empty, cta}` in `src/renderer/locales/es.js`
- [x] 1.4 Add `strings.insights.dayOfWeek.{title, bestDay, partialPattern, empty, dayLabels}` (L, M, X, J, V, S, D) in `src/renderer/locales/es.js`
- [x] 1.5 Add `strings.insights.sportDistribution.{title, totalLabel, otherSports, empty, percentFormat}` in `src/renderer/locales/es.js`
- [x] 1.6 Add `strings.insights.recovery.{title, baseline, subMeters.{hrv, rhr, sleep}, sparklineLabel, empty, daysUntil, partialSignal}` in `src/renderer/locales/es.js`
- [x] 1.7 Add `strings.insights.recoveryZones.{low: 'Bajo', moderate: 'Moderado', high: 'Alto'}` in `src/renderer/locales/es.js`
- [x] 1.8 Add `strings.insights.weightVelocity.{title, axisLabel, referenceLabel, prLabel, empty, partialWindow, prMarkerFormat}` in `src/renderer/locales/es.js`
- [x] 1.9 Add `strings.insights.whr.{title, latest, zone, history, empty, noHips, noProfile, cta}` in `src/renderer/locales/es.js`
- [x] 1.10 Add `strings.insights.whrZones.{low, moderate, high, unknown}` in `src/renderer/locales/es.js`
- [x] 1.11 Add `strings.insights.autoInsights.{title, seeDetail, viewLabel, empty, severityLabels}` (Positivo, Info, Alerta) in `src/renderer/locales/es.js`
- [x] 1.12 Add `strings.insights.autoInsights.templates.*` text templates with `{value}` / `{n}` / `{a}` / `{b}` / `{N}` / `{velocity}` / `{target}` / `{direction}` / `{relation}` / `{pct}` / `{month_name}` placeholders (8 templates) in `src/renderer/locales/es.js`
- [x] 1.13 Add `strings.insights.fixedWindowLabels.recovery = 'Basado en los últimos 7 días'` and `strings.insights.fixedWindowLabels.whr = 'Última medición'` in `src/renderer/locales/es.js`
- [x] 1.14 Add `strings.nav.sections.inicio.insights = 'Patrones'` (or update existing nav key) in `src/renderer/locales/es.js`

## 2. Icon Additions

- [x] 2.1 Register Lucide icons `sparkles`, `lightbulb` in `src/renderer/utils/icons.js` (tree-shaken imports)
- [x] 2.2 Register Lucide icons `flame`, `heart-pulse`, `bed`, `scale`, `layers`, `activity`, `ruler`, `medal` for auto-insight cards in `src/renderer/utils/icons.js`
- [x] 2.3 Verify `arrow-up`, `arrow-down`, `minus` are already registered (used elsewhere — no new imports needed)
- [x] 2.4 Verify `sportIcon()` returns the `activity` icon as fallback for unknown sport types (no change from Phase 1)

## 3. KPI Derivation Utilities

- [x] 3.1 Add `normalizeBaseline(current, baseline, stddev)` to `src/renderer/utils/kpi-derivation.js` returning a z-score clamped to [-3, 3]
- [x] 3.2 Add `recoverySubScore(zScore, inverted)` to `src/renderer/utils/kpi-derivation.js` returning 0–100 sub-score (`50 + 15*z` for direct, `50 - 15*z` for inverted), clamped to [0, 100]
- [x] 3.3 Add `recoveryScore({ hrv, rhr, sleep })` to `src/renderer/utils/kpi-derivation.js` returning `{ composite, zone, signals, sparkline, baselineComplete, daysUntilBaseline }` (handles 1-of-3 missing signals by treating missing as 50)
- [x] 3.4 Add `weightVelocity(weightEntries, targetPace, fromDate, toDate)` to `src/renderer/utils/kpi-derivation.js` returning `{ points, prWeight, prInsufficientWindow }` (28-day rolling delta in JS, not SQL)
- [x] 3.5 Add `whrZone(value, sex)` to `src/renderer/utils/kpi-derivation.js` returning `{ zone, label }` using WHO/OMS cutoffs (men: <0.90/0.90-0.99/≥1.00; women: <0.80/0.80-0.84/≥0.85; null sex → `{ zone: 'unknown', label: 'Sin clasificar' }`)
- [x] 3.6 Add `dowPattern(activities, fromDate, toDate)` to `src/renderer/utils/kpi-derivation.js` returning `{ days: [7 entries], bestDay, hasInsufficientData }`
- [x] 3.7 Add `sportDistribution(activities, fromDate, toDate)` to `src/renderer/utils/kpi-derivation.js` returning `{ sports: [...], totalMinutes, totalSessions, othersAggregated: bool }`
- [x] 3.8 Add 8 individual template functions `templateBestWeekStreak(input)`, `templateHRVDeviation(input)`, `templateRestDayStreak(input)`, `templateWeightDirectionMatch(input)`, `templateSportVariety(input)`, `templateRecoveryTrend(input)`, `templateWHRImprovement(input)`, `templatePRWeek(input)` in `src/renderer/utils/kpi-derivation.js`, each returning `{ icon, text, severity, navigateTo } | null`
- [x] 3.9 Add `generateAutoInsights(input)` to `src/renderer/utils/kpi-derivation.js` running all 8 templates (7 general + `templateSportPRWeek` for sport records only — exercise PRs are owned by Phase 3), filtering null, sorting by severity (`positive` < `info` < `alert`), returning top 8
- [x] 3.10 Add `heatmapBucket(minutes)` to `src/renderer/utils/kpi-derivation.js` returning 0–5 bucket index for the 6-step moss scale (0/1-14/15-29/30-59/60-89/90+ minutes)

## 4. IPC Handlers

- [x] 4.1 Create `src/main/handlers/insights-handlers.js` exporting `registerInsightsHandlers(db, mainWindow, hsReader)` (hsReader for HealthSync access)
- [x] 4.2 Add `db:getYearInMotion(fromIso, toIso)` handler in `insights-handlers.js` — single SQL query grouping sport_activities by date, returning `{ date, minutes }` for all days in range (zero-minutes days included)
- [x] 4.3 Add `db:getDayOfWeekStats(fromIso, toIso)` handler — single SQL query using `strftime('%w', date)` with Monday=0 conversion, returning 7 entries with `{ weekday, minutes, sessions, weekday_label }`
- [x] 4.4 Add `db:getSportDistribution()` handler — single SQL query for trailing 90 days, returning `{ sports: [...], total_minutes, total_sessions }` sorted by minutes desc
- [x] 4.5 Add `db:getRecoveryScore()` handler — reads HealthSync `hrv`, `resting_heart_rate` tables and `activity_days.sleep_hours`, computes 30-day baseline + 7-day current window, returns full payload
- [x] 4.6 Add `db:getWeightVelocity(fromIso, toIso)` handler — reads `weight_entries` in range, returns `{ points: [...], target_pace_reference_velocity, target_pace_magnitude, pr_weight }` (28-day rolling computed in JS; `target_pace` from settings is a positive magnitude, the handler negates it for the chart's reference line per the diet.js/adaptive.js convention)
- [x] 4.7 Add `db:getWHR()` handler — reads latest `measurement_sets` with both waist and hips, returns `{ current, history, sex, has_measurements }`
- [x] 4.8 Add `db:getAutoInsights()` handler — returns the 7-day weekStreak (delegates to `db:getStreak` from strava-panels) and a `restDayStreak` count from sport_activities (pure aggregator, no LLM)
- [x] 4.9 Wire `registerInsightsHandlers(db, mainWindow, hsReader)` into `src/main/ipc-handlers.js` (single `require` + call in `registerIpcHandlers`)
- [x] 4.10 Update `src/preload/preload.js` to expose `getYearInMotion`, `getDayOfWeekStats`, `getSportDistribution`, `getRecoveryScore`, `getWeightVelocity`, `getWHR`, `getAutoInsights` on the `electronAPI` object

## 5. CSS Classes

- [x] 5.1 Add `.insights-view` base class (full-width container, vertical padding) to `src/renderer/styles/main.css`
- [x] 5.2 Add `.insights-filters` (date-range selector buttons) and `.insights-filter--active` styles in `src/renderer/styles/main.css`
- [x] 5.3 Add `.insights-section` (card container) and `.insights-section-title` (Fraunces italic eyebrow) styles in `src/renderer/styles/main.css`
- [x] 5.4 Add `.insights-heatmap` grid container and `.insights-heatmap-cell--moss-0|--moss-1|--moss-2|--moss-3|--moss-4|--moss-5` colors (6-step scale using --moss-mist → --moss-ink) in `src/renderer/styles/main.css`
- [x] 5.5 Add `.insights-heatmap-tooltip` and `.insights-heatmap-caption` styles in `src/renderer/styles/main.css`
- [x] 5.6 Add `.insights-dow` histogram container and `.insights-dow-bar--best` (highlighted bar) styles in `src/renderer/styles/main.css`
- [x] 5.7 Add `.insights-donut` container, `.insights-donut-center` (large total number), and `.insights-donut-legend` styles in `src/renderer/styles/main.css`
- [x] 5.8 Add `.insights-recovery` card, `.insights-recovery-composite` (large number + zone chip), and `.insights-recovery-submeter` (3 horizontal bars) styles in `src/renderer/styles/main.css`
- [x] 5.9 Add `.insights-recovery-zone--low|--moderate|--high` color modifiers (ember/moss-mist/moss) in `src/renderer/styles/main.css`
- [x] 5.10 Add `.insights-velocity` container, `.insights-velocity-pr-marker` (circle annotation), and `.insights-velocity-reference` (horizontal reference line) styles in `src/renderer/styles/main.css`
- [x] 5.11 Add `.insights-whr` container, `.insights-whr-value` (large WHR number), `.insights-whr-chip` (zone label, color-coded), and `.insights-whr-sparkline` styles in `src/renderer/styles/main.css`
- [x] 5.12 Add `.insights-whr-zone--low|--moderate|--high|--unknown` color modifiers in `src/renderer/styles/main.css`
- [x] 5.13 Add `.insights-insight-card` (horizontal card), `.insights-insight-card--positive|--info|--alert` (severity colors), `.insights-insight-icon`, `.insights-insight-text`, `.insights-insight-chip`, `.insights-insight-link` styles in `src/renderer/styles/main.css`
- [x] 5.14 Add `.insights-empty` (per-section empty state) and `.insights-error` (per-section error state) styles in `src/renderer/styles/main.css`
- [x] 5.15 Verify all new classes are under the `body.organic` selector and use existing tokens (no new global custom properties except the 5 heatmap-cell tokens which are scoped to `.insights-heatmap`)

## 6. View Scaffolding

- [x] 6.1 Create `src/renderer/views/insights.js` with imports: `strings`, `icon`, `chartColors`, `skeletonCard`, `skeletonChart`, `safeCall`, `kpi-derivation` helpers, `Chart`
- [x] 6.2 Export `async function init()` that reads `view-insights` container, renders the shell HTML (title + date-range selector + 7 section placeholders), and gates IPC on `window.electronAPI` (web mode fallback)
- [x] 6.3 Implement the date-range selector click handler that updates `_state.range` and re-fetches time-dependent sections
- [x] 6.4 Implement `async function loadAll()` that calls all 7 IPC handlers via `Promise.allSettled` and dispatches each result to its section's `renderSection` function
- [x] 6.5 Implement skeleton rendering (replace each section's container with `skeletonCard()`) before IPC calls
- [x] 6.6 Implement `electronAPI.onDataChanged()` subscription that re-fetches affected sections (activity → heatmap/dow/donut/insights; weight → velocity + insights)
- [x] 6.7 Implement the 7 `renderSection` functions: `renderHeatmap`, `renderDayOfWeek`, `renderSportDistribution`, `renderRecovery`, `renderWeightVelocity`, `renderWHR`, `renderAutoInsights`, each accepting `(container, data)` and rendering the section's data or empty/error state
- [x] 6.8 Add a global "no data" banner that shows when all 7 sections are in empty state
- [x] 6.9 Add Chart.js instance cleanup: destroy any existing chart on the view's container before re-creating, using the existing `window._*Chart` convention
- [x] 6.10 In the recovery and WHR section shells, render the fixed-window label (Source Sans 3 italic, var(--lichen), 11px) above the section title to clarify that the date-range selector does NOT gate these sections

## 7. Heatmap Section

- [x] 7.1 Implement `renderHeatmap(container, { points })` that builds the 53-week × 7-day SVG grid
- [x] 7.2 For each day in the trailing 365 days, compute its column (ISO week - 1) and row (weekday 0–6) in the grid
- [x] 7.3 Map each day's minutes to a bucket via `heatmapBucket()` and apply the corresponding `moss-0` through `moss-5` class (6 buckets total: 0/1-14/15-29/30-59/60-89/90+)
- [x] 7.4 Render each cell as `<rect>` with `width="11" height="11" rx="2" ry="2"` and `shape-rendering="crispEdges"`
- [x] 7.5 Add a `<title>` child to each rect with the date and total minutes
- [x] 7.6 Render future days of the current week with `moss-0` class + 50% opacity
- [x] 7.7 Render column headers (week numbers) and row headers (L, M, X, J, V, S, D) as small labels
- [x] 7.8 Render the caption (`strings.insights.heatmap.caption`) if the user has < 7 active days
- [x] 7.9 Render the empty state via `renderStateCard(container, { state: 'empty', ... })` if `points` is empty
- [x] 7.10 The empty state message SHALL acknowledge that the user may have strength training data (which is out of scope for this section until Phase 3)

## 8. Day-of-Week Section

- [x] 8.1 Implement `renderDayOfWeek(container, { days, bestDay })` that builds the 7-bar Chart.js histogram
- [x] 8.2 Configure Chart.js with: type `bar`, 7 categories (L-D labels), one dataset with the per-day minutes
- [x] 8.3 Highlight the `bestDay` bar with `var(--moss-ink)` background, all others with `var(--moss)`
- [x] 8.4 Render the "Tu mejor día" badge above the highlighted bar
- [x] 8.5 Configure the tooltip callback to show weekday, total minutes, and session count
- [x] 8.6 Render the empty state with the "Necesitas al menos 2 semanas" message if `hasInsufficientData` is true
- [x] 8.7 Render the partial-pattern caption if the user has 2–4 weeks of data

## 9. Sport Distribution Section

- [x] 9.1 Implement `renderSportDistribution(container, { sports, totalMinutes, totalSessions, othersAggregated })` that builds the Chart.js doughnut
- [x] 9.2 Configure Chart.js with: type `doughnut`, one dataset with `data: minutes`, `backgroundColor: [moss, moss-ink, moss-mist, lichen, smoke, ember]`
- [x] 9.3 Render the center total-label as an absolutely positioned `<div>` with the total hours (e.g., "12h") and "Total" subtitle
- [x] 9.4 Render the legend below the chart with one row per sport: sport name, minutes, sessions, percentage
- [x] 9.5 If `othersAggregated`, render the "Otros" row with a tooltip listing the aggregated sports
- [x] 9.6 Render the empty state if `sports` is empty

## 10. Recovery Score Section

- [x] 10.1 Implement `renderRecovery(container, payload)` that branches on `baselineComplete`
- [x] 10.2 If `!baselineComplete`, render the empty state with the "Necesitas al menos 30 días" message and the `daysUntilBaseline` progress indicator
- [x] 10.3 If `baselineComplete`, render the composite number (Fraunces 48px) with the zone chip
- [x] 10.4 Apply the zone color class (`insights-recovery-zone--low|--moderate|--high`) to the chip
- [x] 10.5 Render the 7-day sparkline using the existing `sparkline()` utility from `utils/sparkline.js`
- [x] 10.6 Render the 3 sub-meters (HRV, RHR, Sleep) as horizontal bars, each with: signal name, current 7-day value, 30-day baseline, sub-score
- [x] 10.7 For RHR sub-meter, apply the inverted sub-score color zone
- [x] 10.8 If 1 of 3 signals is missing, render that sub-meter in disabled state and show the "Composite calculado con 2/3 señales" note
- [x] 10.9 Handle the error state if `db:getRecoveryScore` fails (rethrow → `renderStateCard` error)

## 11. Weight Velocity Section

- [x] 11.1 Implement `renderWeightVelocity(container, { points, targetPaceReferenceVelocity, targetPaceMagnitude, prWeight, prInsufficientWindow })` that builds the Chart.js line chart
- [x] 11.2 Configure Chart.js with: type `line`, x-axis dates, y-axis "kg/semana" (-2.0 to +2.0), one dataset for velocity with point radius 0
- [x] 11.3 Add a horizontal reference line via the Chart.js annotation plugin OR via a separate dataset with `type: 'line'` and a single point at each x with constant y=`targetPaceReferenceVelocity` (this is the negated magnitude, e.g., -0.5 for a 0.5 kg/week loss target)
- [x] 11.4 Fill the area between the velocity line and the reference line: green (moss-mist at 20%) when velocity < target (deficit), red (ember at 20%) when velocity > target (surplus)
- [x] 11.5 If `prWeight` is not null, add an annotation: a circle marker at the prWeight's date and a label "PR {weight} kg — {date}"
- [x] 11.6 If `prInsufficientWindow`, render the weight line (not velocity) with a "Necesitas al menos 28 días" note
- [x] 11.7 Render the empty state if `points` is empty (no weight entries)

## 12. WHR Section

- [x] 12.1 Implement `renderWHR(container, { current, history, sex, hasMeasurements })` 
- [x] 12.2 If `!hasMeasurements`, render the empty state with the "Registra medidas corporales" message and "Ir a Mediciones" button
- [x] 12.3 If `current` is null, render a partial state: "Falta la medida de cadera" or "Completa tu perfil (sexo)" depending on what data is missing
- [x] 12.4 Otherwise, render the WHR number (Fraunces 36px) with the zone chip
- [x] 12.5 Apply the zone class to the chip: `--low` (moss), `--moderate` (moss-mist), `--high` (ember), `--unknown` (lichen)
- [x] 12.6 Render the 90-day sparkline below the WHR number using the existing `sparkline()` utility
- [x] 12.7 Configure the sparkline with width 80, height 24, line color `var(--moss)`, fill `var(--moss-mist)` at 30% opacity

## 13. Auto-Insights Section

- [x] 13.1 Implement `renderAutoInsights(container, cards)` that renders each card as a horizontal card
- [x] 13.2 For each card, render: icon (left, 18px), text (center, 1-2 lines), severity chip (right), "Ver detalle" link (bottom)
- [x] 13.3 Apply the severity class (`--positive|--info|--alert`) to the card root
- [x] 13.4 Make each card a `<button>` with `aria-label="Insight: {text}"`
- [x] 13.5 Wire the click/Enter/Space handler to `electronAPI.navigate(viewName)` per `navigateTo`
- [x] 13.6 Render the empty state if `cards.length === 0`
- [x] 13.7 Cap the displayed cards at 8 (the function already caps; this is a safety check)
- [x] 13.8 The PR week insight SHALL be sourced from sport PRs only (`db:getPersonalRecords`); exercise PRs (1RM, volume PR) are owned by Phase 3 and SHALL NOT be surfaced by this template

## 14. Sidebar and App.js Integration

- [x] 14.1 Add `<li data-section="inicio"><button class="nav-item" data-view="insights" aria-label="Patrones"><span class="nav-icon" data-icon="insights"></span><span class="nav-text">${s.analytics.patterns || 'Patrones'}</span></button></li>` to `src/renderer/index.html` between the dashboard and analytics nav items
- [x] 14.2 Add `<section id="view-insights" class="view"></section>` to `src/renderer/index.html` after `view-analytics`
- [x] 14.3 Add `import { init as initInsights } from './views/insights.js';` to `src/renderer/app.js`
- [x] 14.4 Add `insights: initInsights` to the `views` object in `app.js`
- [x] 14.5 Add `'insights': 'sparkles'` to the `iconMap` in `renderNavIcons()` in `app.js`
- [x] 14.6 Verify the sidebar's expand/collapse, active-view pinning, and localStorage persistence work with the new item (no code change expected — existing behavior applies)

## 15. Unit Tests

- [x] 15.1 Add to `tests/unit/kpi-derivation.test.js`: `normalizeBaseline` (clamping to [-3, 3], NaN handling, identity for z=0)
- [x] 15.2 Test `recoverySubScore` (direct, inverted, clamping, integer output)
- [x] 15.3 Test `recoveryScore` (full payload with 3 signals, 1-signal-missing fallback, insufficient baseline returns nulls, composite clamping)
- [x] 15.4 Test `weightVelocity` (28-day rolling math, sparse data handling, prWeight detection, prInsufficientWindow flag)
- [x] 15.5 Test `whrZone` (male/female boundaries, exact-boundary case, null sex → unknown, value 0, value 1.5)
- [x] 15.6 Test `dowPattern` (7 entries returned, sorted by weekday, bestDay detection, hasInsufficientData for < 2 weeks)
- [x] 15.7 Test `sportDistribution` (sorted by minutes desc, share_pct sums to 100 ±0.1, othersAggregated for > 6 sports, empty array for no activities)
- [x] 15.8 Test `generateAutoInsights` (full payload → 7 cards, partial payload → fewer cards, empty payload → empty array, determinism across two runs, sort by severity)
- [x] 15.9 Test each of the 8 individual template functions (positive case, null case when threshold not met, exact threshold)
- [x] 15.10 Test `heatmapBucket` (0→0, 1→1, 14→1, 15→2, 89→4, 90→5, NaN→0)

## 16. Smoke Tests

- [x] 16.1 Create `tests/smoke/insights.test.js` with mock electronAPI returning full payloads for all 7 handlers
- [x] 16.2 Test `init()` does not throw when electronAPI is present
- [x] 16.3 Test `init()` does not throw when electronAPI is absent (web mode fallback)
- [x] 16.4 Test the view renders the title, date-range selector, and 7 section placeholders on mount
- [x] 16.5 Test clicking a date-range button updates `_state.range` and re-fetches time-dependent sections
- [x] 16.6 Test the empty state for each section (heatmap, day-of-week, sport distribution, recovery, weight velocity, WHR, auto-insights) when the corresponding IPC returns empty/null
- [x] 16.7 Test the error state renders when an IPC call throws (simulate one failure)
- [x] 16.8 Test the "no data" global banner appears when all 7 sections are in empty state
- [x] 16.9 Test the `onDataChanged` subscription re-fetches the affected sections (simulate a `data-changed` event)

## 17. Verification

- [x] 17.1 Run `npm test` and confirm all tests pass (180 existing + 15 new unit + 8 new smoke = 203/203)
- [ ] 17.2 Run `npm run dev` and visually verify each of the 7 sections with sample data (mark as verified — manual visual check requires user interaction with Electron, not possible in headless env)
- [x] 17.3 Verify the empty state for each section (covered by smoke tests 16.6)
- [x] 17.4 Verify keyboard navigation on interactive elements (date-range buttons, insight cards, error retry buttons, WHR CTA) — implemented via `<button>` elements with `tabindex` and keydown handlers
- [x] 17.5 Verify the date-range selector gates only time-dependent sections (heatmap, day-of-week, sport distribution, weight velocity) — recovery and WHR always show current state
- [x] 17.6 Verify `data-changed` events trigger re-renders without full view reload (onDataChanged handler in `views/insights.js` re-fetches affected sections)
- [x] 17.7 Verify Chart.js instances are destroyed before re-create on re-render (existing pattern, applied to day-of-week, sport distribution, and weight velocity)
- [x] 17.8 Verify no inline styles introduced except for dynamic SVG attributes (cell x/y coordinates) and Chart.js config
- [x] 17.9 Verify all new UI strings live in `strings.insights.*` (all strings imported from SI = strings.insights)
- [x] 17.10 Update `AGENTS.md` "Cambios Planificados" to mark Phase 2 as implemented and replace the "próximo" line with the next phase ("strength-training-insights")
