## Why

The dashboard (Panel) has several visual and functional issues that make it hard to read and understand: the hero ring conflates steps with kcal balance, the green activity summary is buried at the bottom instead of near the top, cards leave large empty gaps, the steps-by-period display shows identical values, and the date selector doesn't offer a 3-month option. Separately, the weekly sport summary chart in the Activity view is silently broken (skeleton injection destroys the canvas element), and the sidebar lacks proper app/user identity. This change fixes all of these in one pass.

## What Changes

- **Hero ring redesign**: The growth ring currently encodes steps data but sits beside a kcal-balance headline, causing semantic confusion. Redesign the hero card so the ring and headline are semantically coherent — the ring should visualize what the headline describes, or be replaced with a clearer visual that communicates kcal balance directly.
- **Green activity summary moved to top**: The "Resumen de Actividad" card (currently `.card-accent` with moss-green background, positioned at the bottom in Row 4) moves to the top of the dashboard, immediately after the hero card. Per-sport detail cards follow it, sized to their content.
- **Card layout fixes**: Cards should adjust naturally to their content without leaving large empty grid cells. Eliminate the blank space between "Presión Arterial" and "Resumen de Actividad" by restructuring the grid rows — the 5-card Row 2 leaves empty tracks, and the trend chart row creates a visual gap.
- **Date selector changed to 15d / 1m / 3m**: Replace the current `7d / 15d / 1m` filter with a fixed `15d / 1m / 3m` selector. Charts remain the same; only the range options change. `1m` = 30 days, `3m` = 90 days.
- **Steps-by-period bug fix**: The step averages for 7d/15d/1m currently show identical values when the selected range is shorter than 1m, because `dailyData` is bounded by the selected range and `slice(-15)` returns the same rows as the full array. Fix by fetching the daily summary for the maximum needed window (1m/30d) independently of the selected chart range, so the three step averages are always computed from their proper windows.
- **Distinct dashboard nav icon**: "Panel" and "Actividad" both render the Lucide `Activity` icon. Change the dashboard icon to a distinct one (e.g., `LayoutDashboard`) so the two nav items are visually distinguishable, especially in collapsed sidebar mode.
- **Weekly sport summary chart fix (Activity view)**: The `loadChart()` function silently fails because `ccEl.innerHTML = skeletonCard()` destroys the `<canvas id="weekly-chart">` element at init time and after Apple Health imports. Fix by preserving or re-creating the canvas before chart instantiation.
- **Session count 7d/15d/1m comparison**: Add a session-count comparison (7d vs 15d vs 1m) to the weekly sport summary card in the Activity view, using the existing `getSportSummaryByRange` data and the `getActivityComparison` IPC handler for period-over-period deltas.
- **Sidebar app name + user identity**: Display "FitOS" as the app name in the sidebar header (instead of the full redundant title "FitOS - Salud y Rendimiento") and add the user's name ("Leandro Pollola") below it. Hardcoded for now; structured so the name can come from the user profile in the future.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `dashboard-health-metrics`: Hero card visual redesign for semantic clarity; green activity summary repositioned to top of dashboard; card layout restructured to eliminate blank grid gaps; date selector options changed to 15d/1m/3m; steps-by-period averaging bug fixed
- `iconography`: Add distinct Lucide icon for dashboard nav item (replaces duplicate `Activity` icon)
- `desktop-app`: Sidebar header shows app name + user profile name; placeholder for future profile-driven name
- `spanish-ui`: New locale strings for app name, user profile name, and updated date-range labels (15d/1m/3m)
- `activity-ingestion`: Fix broken weekly sport summary chart (canvas destruction by skeleton injection); add session-count 7d/15d/1m comparison KPI strip
- `design-system`: Card sizing and grid layout adjustments for content-fit; sidebar header typography/styling for app name + user identity

## Impact

- **`src/renderer/views/dashboard.js`**: Hero card redesign, row restructuring (activity summary to top), date selector options, steps-period data fetching
- **`src/renderer/views/activity.js`**: Fix skeleton/canvas destruction in `loadChart()`, add session-count comparison KPI strip
- **`src/renderer/app.js`**: Update `iconMap` to use distinct dashboard icon
- **`src/renderer/utils/icons.js`**: Register new Lucide icon (e.g., `LayoutDashboard`)
- **`src/renderer/index.html`**: Sidebar header markup for app name + user name
- **`src/renderer/locales/es.js`**: New strings for app name, user name, date range labels
- **`src/renderer/styles/main.css`**: Card layout/grid adjustments, sidebar header styling, hero card redesign
- **`src/renderer/utils/growth-ring.js`**: Possible redesign or replacement of the ring visual
- **`src/renderer/utils/date-range.js`**: Add `3m` range mapping (90 days)
- No backend/IPC handler changes required — all data is already available via existing handlers
