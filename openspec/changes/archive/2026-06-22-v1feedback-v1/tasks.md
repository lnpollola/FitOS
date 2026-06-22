## 1. Locale Strings

- [x] 1.1 Add `strings.appName` = "FitOS" and `strings.profileName` = "Leandro Pollola" to `src/renderer/locales/es.js`
- [x] 1.2 Add `strings.dashboard.dateRange15d` ("15d"), `strings.dashboard.dateRange3m` ("3m") to the `strings.dashboard` domain (verify `dateRange1m` already exists)
- [x] 1.3 Update hero legend strings: add `strings.dashboard.surplus` ("Excedente") and `strings.dashboard.deficit` ("Déficit") to replace `daysActive`/`daysLow` in the hero legend context
- [x] 1.4 Reuse existing `activitySummary` for the repositioned green card (key already exists) or reuse existing `activitySummary` for the repositioned green card

## 2. Date Range Utility

- [x] 2.1 Add `'3m'` mapping (90 days back) to `getRangeDates()` in `src/renderer/utils/date-range.js`
- [x] 2.2 Verify `'1m'` maps to 30 days (already exists) and `'15d'` maps to 15 days (already exists)

## 3. Dashboard Nav Icon

- [x] 3.1 Import `LayoutDashboard` from `lucide` and register it as `'layout-dashboard'` in `src/renderer/utils/icons.js`
- [x] 3.2 Update `iconMap` in `src/renderer/app.js` to map `dashboard` to `'layout-dashboard'` instead of `'activity'`

## 4. Sidebar Header — App Name + User Name

- [x] 4.1 Update the inline `<head>` script in `src/renderer/index.html` to set `.sidebar-header h1` text from `strings.appName` (not `strings.appTitle`)
- [x] 4.2 Update the inline script to set `.sidebar-subtitle` text from `strings.profileName` (not the tagline "Salud y rendimiento")
- [x] 4.3 Update the default HTML in `.sidebar-header` to show "FitOS" as `<h1>` and "Leandro Pollola" as `.sidebar-subtitle` (for pre-JS render)

## 5. Dashboard Hero Ring — Encode Kcal Balance

- [x] 5.1 In `src/renderer/views/dashboard.js`, change `ringValues` to use daily energy balance values instead of step counts (pass `dailyData.map(d => d.balance)` or equivalent to `growthRing()`)
- [x] 5.2 Update the hero legend to use `strings.dashboard.surplus` / `strings.dashboard.deficit` instead of `daysActive` / `daysLow`
- [x] 5.3 Update the growth-ring color thresholds in `growthRing.js` or the call site to use balance-appropriate colors (moss for surplus, ember for deficit, moss-mist for neutral)
- [x] 5.4 Handle edge case: when all balance values are zero or equal, the ring should render a neutral appearance (not all-red)

## 6. Dashboard Layout Restructure

- [x] 6.1 Move the green \"Resumen de Actividad\" `.card-accent` block from Row 4 to Row 2 (immediately after the hero card) in `dashboard.js` render function
- [x] 6.2 Move per-sport detail cards to follow the green summary in the same grid row
- [x] 6.3 Move the kcal/día trend Chart.js chart to the last row of the dashboard (Row 5), full width
- [x] 6.4 Reorder the row container divs in the `init()` shell HTML to match the new row order: hero → activity summary + per-sport → core metrics → health metrics → trend chart
- [x] 6.5 Verify no blank grid tracks appear between the health metric cards (Row 4) and the trend chart (Row 5)

## 7. Dashboard Date Selector — 15d / 1m / 3m

- [x] 7.1 Change the dashboard filter buttons from `7d / 15d / 1m` to `15d / 1m / 3m` in the `init()` shell HTML
- [x] 7.2 Change the default `_range` from `'7d'` to `'15d'` in `dashboard.js`
- [x] 7.3 Update filter button event listeners to use the new range values
- [x] 7.4 Use `strings.dashboard.dateRange*` locale keys for button labels instead of hardcoded strings

## 8. Dashboard Steps-by-Period Bug Fix

- [x] 8.1 Add an independent 30-day `getHealthDailySummary` fetch in `dashboard.js` for step-period averages (separate from the selected-range data fetch)
- [x] 8.2 Compute `steps7d`, `steps15d`, `steps1m` from the independent 30-day dataset by slicing the last 7, last 15, and full 30 days
- [x] 8.3 Verify the three averages show different values when the selected range is 15d or 1m
- [x] 8.4 Verify the three averages show different values when the selected range is 3m (30-day fetch still provides independent windows)

## 9. Activity View — Weekly Sport Summary Chart Fix

- [x] 9.1 In `src/renderer/views/activity.js` `init()`, stop overwriting `.chart-container` innerHTML with `skeletonCard()` — inject skeleton into a separate wrapper or toggle a loading class instead
- [x] 9.2 In the Apple Health import success handler, apply the same fix (don't destroy `.chart-container` canvas)
- [x] 9.3 In `loadChart()`, ensure `<canvas id="weekly-chart">` exists before chart instantiation — create it if missing
- [x] 9.4 Verify the chart renders on initial load and after re-import

## 10. Activity View — Session Count Comparison Strip

- [x] 10.1 Add a KPI strip element to the weekly sport summary card HTML (above the chart canvas) in `activity.js` `init()`
- [x] 10.2 In `loadChart()`, fetch `getActivityComparison(from, to)` alongside `getSportSummaryByRange(from, to)`
- [x] 10.3 Compute total sessions for the current range (`summary.reduce((s,x) => s + x.count, 0)`) and previous range (`comparison.previous.reduce((s,x) => s + x.count, 0)`)
- [x] 10.4 Render the session count with a trend arrow (up/down/flat) and `strings.activity.periodComparison` label
- [x] 10.5 Handle edge cases: no previous period data (show current count without arrow), no current data (hide strip)

## 11. CSS Adjustments

- [x] 11.1 Add sidebar header styling for app name + user name hierarchy under `body.organic` (Fraunces for h1, Source Sans 3 for subtitle) in `src/renderer/styles/main.css`
- [x] 11.2 Ensure collapsed sidebar hides the user name subtitle (already handled by existing `.sidebar-subtitle { display: none }` — verify)
- [x] 11.3 Adjust dashboard grid to eliminate blank tracks — consider `grid-auto-rows: auto` or `align-items: start` to prevent cards from stretching to fill empty tracks
- [x] 11.4 Verify the trend chart full-width card style works at the bottom of the dashboard
- [x] 11.5 Update any organic CSS overrides for the repositioned `.card-accent` (it's now in Row 2, not Row 4 — verify styling still applies)

## 12. Tests

- [x] 12.1 Add unit test for `getRangeDates('3m')` returning 90 days back in `tests/unit/`
- [x] 12.2 Add unit test for `growthRing()` with balance values (surplus/deficit color thresholds)
- [x] 12.3 Add smoke test verifying dashboard `init()` runs without errors with the new date selector and row structure
- [x] 12.4 Add smoke test verifying activity view `init()` runs without errors and canvas is preserved
- [x] 12.5 Run `npx vitest run` and verify all tests pass (61/61 tests passing)

## 13. Verification

- [x] 13.1 Run `npm run dev:web` and verify dashboard renders with: hero ring showing balance data, green summary at top, no blank spaces, trend chart at bottom
- [x] 13.2 Verify dashboard date selector shows 15d / 1m / 3m and default is 15d
- [x] 13.3 Verify steps card shows three different averages for 7d/15d/1m
- [x] 13.4 Verify sidebar shows "FitOS" as h1 and "Leandro Pollola" as subtitle
- [x] 13.5 Verify dashboard nav icon is distinct from activity nav icon
- [x] 13.6 Verify activity view weekly sport summary chart renders on load
- [x] 13.7 Verify activity view session count comparison strip shows with trend arrow
- [x] 13.8 Verify all changes via test suite (61/61 tests pass)
