## 1. Dead Code — mountWeeklyGoal Chain

- [x] 1.1 Remove `mountWeeklyGoal` function (lines 190-288) from `src/renderer/views/panels/strava-panels.js`
- [x] 1.2 Remove `getWeeklyGoal` preload API from `src/preload/preload.js`
- [x] 1.3 Remove `db:getWeeklyGoal` IPC handler from `src/main/handlers/strava-panels-handlers.js`
- [x] 1.4 Remove associated CSS classes (`.strava-weekly-goal`, `.strava-ring-wrap`, `.strava-ring-track`, `.strava-ring-fill`, `.strava-ring-center`, `.strava-weekly-progress`, `.strava-weekly-meta`) from `src/renderer/styles/cards.css`
- [x] 1.5 Remove `mountWeeklyGoal` reference from smoke tests if present

## 2. Dead Code — Unused Preload APIs

- [x] 2.1 Remove 25 unused preload API methods from `src/preload/preload.js`: `getSleepData`, `getHealthSleep`, `getHealthHRV`, `getHealthBodyMass`, `getHealthHRVWeekly`, `getHealthHeartRateDaily`, `getHealthStats`, `syncHealthToApp`, `getHealthBloodPressure`, `getHealthStandingHours`, `getHealthExerciseTime`, `getHealthWalkingDistance`, `getHealthSpO2Range`, `getExercisesByIds`, `unlinkDish`, `getDishesForMeal`, `setLastImportTimestamp`, `getTrendWeight`, `getSportActivities`, `saveSportActivity`, `saveActivityDay`, `getWeeklySportSummary`, `importActivityCSV`

## 3. Dead Code — CSS Cleanup

- [x] 3.1 Remove ~200 lines of duplicated CSS blocks from `src/renderer/styles/utilities.css` (keeping `cards.css` versions): `.card-accent`, `.compliance-ok`, `.compliance-warn`, `.metric-trend`, `.metric-value-sm`, `.trend-up`, `.trend-down`, `.trend-flat`, `.chart-container`, `.analytics-filters`, `.filter-btn` + variants, `.filter-divider`, `.filter-date-input`, `.analytics-kpis`, `.analytics-kpi-card`, `.analytics-grid`, `.chart-card` + children, `.secondary-section` + children
- [x] 3.2 Remove unused CSS classes: `.strava-streak-broken`, `.strava-row-2`, `.strava-row-full` from `cards.css`; `.insights-view` from `main.css`

## 4. Dead Code — strength-derivation.js

- [x] 4.1 Delete `src/renderer/utils/strength-derivation.js` (263 lines)
- [x] 4.2 Delete `tests/unit/strength-derivation.test.js`
- [x] 4.3 Verify no other file imports from `strength-derivation.js` (search for import statements)

## 5. Bug Fixes — Error Handling Consistency

- [x] 5.1 Add `.catch(() => null)` to `api.getDashboardData()` in `src/renderer/views/dashboard.js:133` for consistency with other promises
- [x] 5.2 Replace try/catch with `safeCall()` for `api.getGoalProgress()` in `src/renderer/views/goals.js:62`
- [x] 5.3 Wrap `api.archiveGoal(goalId)` with `safeCall()` in `src/renderer/views/goals.js:184` to prevent unhandled promise rejection

## 6. Bug Fixes — Chart Memory Leak

- [x] 6.1 Move `_tonnageChart` from module scope to `window._tonnageChart` in `src/renderer/views/panels/strength-insights-panels.js`
- [x] 6.2 Update all references to `_tonnageChart` in the file to use `window._tonnageChart`
- [x] 6.3 Verify `destroyAllCharts()` in `app.js` now catches and destroys the tonnage chart

## 7. Micro-UX — Sparkline Tooltips

- [x] 7.1 Add `title` attribute to sparkline SVG in `src/renderer/utils/sparkline.js` showing "Min: X | Max: Y" formatted with appropriate units
- [x] 7.2 Update `sparkline()` function signature to accept `min` and `max` values (or compute them from the data array)

## 8. Micro-UX — Keyboard Navigation on PR Tabs

- [x] 8.1 Add `role="tablist"` to PR tab container and `role="tab"` + `aria-selected` to each tab in `src/renderer/views/panels/strava-panels.js`
- [x] 8.2 Add keydown event listener for ArrowLeft/ArrowRight navigation between tabs with wrapping
- [x] 8.3 Add Enter/Space key handler to activate focused tab

## 9. Micro-UX — Recovery Progress Bar

- [x] 9.1 Add progress bar HTML to recovery empty state in `src/renderer/views/insights.js`: horizontal bar with `width: (daysAvailable / 30 * 100)%` and text "X de 30 días de datos"
- [x] 9.2 Add CSS for recovery progress bar in `src/renderer/styles/main.css` or `cards.css`

## 10. Micro-UX — Combined Streak+Calendar Skeleton

- [x] 10.1 Update skeleton in `mountStreakCalendar()` to reflect 30/70 two-column layout: narrow left block (~30%) for streak, wide right block (~70%) with grid pattern for calendar
- [x] 10.2 Add CSS for realistic skeleton layout in `cards.css`

## 11. Micro-UX — Analytics Period Transition

- [x] 11.1 Add CSS transition to `.chart-container` in `cards.css`: `transition: opacity 200ms ease`
- [x] 11.2 In `src/renderer/views/analytics.js`, add `.chart-transitioning` class (opacity: 0) before chart recreation, remove after 200ms delay
- [x] 11.3 Apply transition to all chart containers when period filter changes

## 12. Verification

- [x] 12.1 Run `npm run dev` and verify no console errors after all cleanup
- [x] 12.2 Verify PR tabs work with keyboard navigation (ArrowLeft/Right, Enter/Space)
- [x] 12.3 Verify sparkline tooltips show min/max on hover
- [x] 12.4 Verify recovery progress bar shows when baseline incomplete
- [x] 12.5 Verify analytics charts fade smoothly when changing period
- [x] 12.6 Run full test suite and verify all tests pass (after removing strength-derivation.test.js)
- [x] 12.7 Run lint/typecheck if available
