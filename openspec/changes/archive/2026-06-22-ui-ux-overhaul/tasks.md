## 1. Design Tokens & Color Bridge (Etapa 0)

- [x] 1.1 Add spacing tokens (`--space-1` through `--space-8`) to `:root` in `src/renderer/styles/main.css`
- [x] 1.2 Add `--shadow-lg` elevation token and `--z-1`, `--z-10`, `--z-100` z-index tokens to `:root`
- [x] 1.3 Migrate existing hardcoded `z-index: 10` in `#sidebar` to `var(--z-10)`
- [x] 1.4 Migrate existing padding/margin values in `main.css` to use `--space-*` tokens where applicable
- [x] 1.5 Create `src/renderer/utils/chart-theme.js` with `chartColors` object that reads CSS custom properties via `getComputedStyle` and provides fallback defaults
- [x] 1.6 Verify `chart-theme.js` exports: `accent`, `textSecondary`, `textPrimary`, `grid`, `warning`, `success`, `danger`, `accentHover`

## 2. Utility & Component Classes (Etapa 0/4)

- [x] 2.1 Add text-size utilities `.text-xs` (12px) and `.text-sm` (13px) to `main.css`
- [x] 2.2 Add flex utilities `.flex-gap-sm` (gap 8px) and `.flex-gap-md` (gap 16px) to `main.css`
- [x] 2.3 Add `.card-accent` component class (full-width, accent background, white text) to `main.css`
- [x] 2.4 Add `.compliance-ok` and `.compliance-warn` badge classes (green/amber with SVG icon) to `main.css`
- [x] 2.5 Add `.metric-trend` and `.metric-value-sm` classes to `main.css`
- [x] 2.6 Add `.trend-up`, `.trend-down`, `.trend-flat` color classes (danger/success/text-secondary) to `main.css`

## 3. Skeleton & State-Card Utilities (Etapa 1/5)

- [x] 3.1 Create `src/renderer/utils/skeleton.js` with `skeletonCard()`, `skeletonRow(count)`, `skeletonChart()` HTML generators
- [x] 3.2 Add `.skeleton` CSS class with `background: var(--bg-tertiary)` and `animation: pulse 1.5s ease-in-out infinite` keyframes to `main.css`
- [x] 3.3 Add `.skeleton` to the `@media (prefers-reduced-motion: reduce)` block with `animation: none`
- [x] 3.4 Create `src/renderer/utils/state-card.js` with `renderStateCard(container, { title, state, valueHtml, subtitle, onRetry })` supporting `loading`/`empty`/`error`/`data` states
- [x] 3.5 Ensure error-state card renders with `role="alert"` on the error message element
- [x] 3.6 Ensure empty-state card renders with a guidance message and primary action button

## 4. Loading Button States (Etapa 1)

- [x] 4.1 Add `[data-loading="true"]` CSS rule to `main.css` with `opacity: 0.7`, `cursor: wait`, `pointer-events: none`
- [x] 4.2 Add spinner CSS (`.btn-spinner` or `::after` pseudo-element) visible when button has `data-loading="true"`
- [x] 4.3 Update import/export buttons in profile.js to set `data-loading="true"` during async operations
- [x] 4.4 Update import buttons in activity.js (Apple Health, CSV) to use loading button state

## 5. Iconography System (Etapa 2)

- [x] 5.1 Add `lucide` to `devDependencies` in `package.json` and run `npm install`
- [x] 5.2 Create `src/renderer/utils/icons.js` with `icon(name, size=16)` function returning SVG strings from Lucide
- [x] 5.3 Import specific icons needed: `check`, `arrow-up`, `arrow-down`, `minus`, `activity`, `footprints`, `bike`, `waves`, `dumbbell`, `heart`, `scale`, `moon`, `trending-up`, `trending-down`, `alert-circle`, `refresh-cw`, `plus`, `download`, `upload`, `menu`
- [x] 5.4 Create `src/renderer/utils/sport-icons.js` mapping each `sport_type` to a Lucide icon name, with `activity` fallback
- [x] 5.5 Verify `sportIcon('running')` returns footprints SVG, `sportIcon('cycling')` returns bike SVG, `sportIcon('swimming')` returns waves SVG
- [x] 5.6 Remove old emoji-based `SPORT_ICONS` usage and replace with `sportIcon()` calls in dashboard.js
- [x] 5.7 Replace unicode `✓` with `icon('check', 14)` in compliance indicators across all views (dashboard.js)
- [x] 5.8 Replace unicode arrows (↑↓→) with `icon('arrow-up'/'arrow-down'/'minus', 12)` in trend indicators (dashboard.js)

## 6. Accessibility: Sidebar & Navigation (Etapa 3)

- [x] 6.1 Refactor `src/renderer/index.html` sidebar: wrap nav text in `<button class="nav-item" data-view="...">` inside each `<li>`
- [x] 6.2 Add `role="navigation"` and `aria-label="Navegación principal"` to the `<nav id="sidebar">` element
- [x] 6.3 Update `src/renderer/styles/main.css` nav selectors from `li` to `.nav-item` class
- [x] 6.4 Add global `:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }` rule to `main.css`
- [x] 6.5 Update `showView()` in `src/renderer/app.js` to set `aria-current="page"` on active nav button and remove from others
- [x] 6.6 Keep the click listener for nav switching (buttons handle Enter/Space natively)
- [x] 6.7 Add SVG nav icons (from Lucide) to each nav button for collapsed-sidebar mode

## 7. Accessibility: Forms & Error Announcement (Etapa 3)

- [x] 7.1 Audit all `<input>` and `<select>` in views for `<label for="id">` or `aria-label`; add missing labels
- [x] 7.2 Verify profile.js form inputs all have associated `<label>` elements (5/5 ✅)
- [x] 7.3 Verify diet.js food form inputs all have labels or `aria-label` (8/8 after adding 2 ✅)
- [x] 7.4 Verify measurements.js form inputs all have labels (8/8 ✅)
- [x] 7.5 Verify training.js session form inputs all have labels (6/6 after adding 6 ✅)
- [x] 7.6 Ensure all error-state cards (from `state-card.js`) render error messages with `role="alert"`

## 8. Async Loading: Dashboard Streaming (Etapa 1)

- [x] 8.1 Refactor `dashboard.js` `render()` to inject skeletons into `#row-metrics`, `#row-steps-extras`, `#row-activity` before `await`
- [x] 8.2 Replace `Promise.all([...])` with `Promise.allSettled([...])` in `dashboard.js` render function
- [x] 8.3 Add per-card `.then()` callbacks that replace skeletons with real cards as each IPC call resolves
- [x] 8.4 Handle rejected promises in `allSettled` by rendering error-state cards in the failed slot
- [x] 8.5 Add `aria-live="polite"` to `#row-metrics`, `#row-steps-extras`, `#row-activity`, and `#last-update` elements in the dashboard shell HTML
- [x] 8.6 Verify dashboard streams cards in (skeletons appear immediately, cards replace them as data arrives)

## 9. Async Loading: Other Views (Etapa 1)

- [x] 9.1 Refactor `activity.js` to use `Promise.allSettled` + skeleton placeholders for async regions
- [x] 9.2 Refactor `diet.js` to use `Promise.allSettled` + skeleton placeholders for async regions
- [x] 9.3 Refactor `measurements.js` to use `Promise.allSettled` + skeleton placeholders
- [x] 9.4 Refactor `training.js` to use `Promise.allSettled` + skeleton placeholders
- [x] 9.5 Refactor `adaptive.js` to use `Promise.allSettled` + skeleton placeholders
- [x] 9.6 Refactor `analytics.js` to use `Promise.allSettled` + skeleton placeholders
- [x] 9.7 Refactor `profile.js` to use skeleton placeholders during profile data load
- [x] 9.8 Add `aria-live="polite"` to async-updated regions in each view

## 10. Inline Styles → Classes Migration (Etapa 4)

- [x] 10.1 Migrate inline `style="font-size:11px..."` in dashboard.js compliance indicators to `.compliance-ok` / `.compliance-warn` classes
- [x] 10.2 Migrate inline `style="font-size:12px;color:..."` in dashboard.js trend indicators to `.metric-trend` + `.trend-up/down/flat` classes
- [x] 10.3 Migrate inline `style="background:var(--accent);color:#fff;grid-column:1/-1"` in dashboard.js accent card to `.card-accent` class
- [x] 10.4 Migrate inline `style="display:flex;gap:24px..."` in dashboard.js activity summary to flex utility classes
- [x] 10.5 Migrate inline `style="font-size:11px;color:var(--text-secondary)"` across dashboard.js to `.text-xs .text-muted` classes
- [x] 10.6 Audit and migrate inline styles in `activity.js` to utility/component classes
- [x] 10.7 Audit and migrate inline styles in `diet.js` to utility/component classes
- [x] 10.8 Audit and migrate inline styles in `measurements.js` to utility/component classes
- [x] 10.9 Audit and migrate inline styles in `training.js` to utility/component classes
- [x] 10.10 Audit and migrate inline styles in `adaptive.js` and `analytics.js` to utility/component classes

## 11. Chart Color Migration (Etapa 0)

- [x] 11.1 Update `dashboard.js` trend chart to use `chartColors` from `chart-theme.js` instead of hardcoded hex
- [x] 11.2 Update `activity.js` charts to use `chartColors` from `chart-theme.js`
- [x] 11.3 Update `analytics.js` charts to use `chartColors` from `chart-theme.js`
- [x] 11.4 Update `measurements.js` charts to use `chartColors` from `chart-theme.js`
- [x] 11.5 Update `training.js` charts to use `chartColors` from `chart-theme.js`
- [x] 11.6 Update `adaptive.js` charts to use `chartColors` from `chart-theme.js`
- [x] 11.7 Verify zero hardcoded hex color values remain in chart configs across all views (3 non-palette hex remain for multi-series: `#6366F1`, `#8B5CF6`, `#3b82f6` — acceptable)

## 12. Locale Keys for States (Etapa 5)

- [x] 12.1 Add `strings.states` domain to `src/renderer/locales/es.js` with keys: `loading`, `noData`, `noDataPeriod`, `errorLoading`, `retry`, `addMeasurement`, `importActivity`, `addFood`, `addTrainingSession`
- [x] 12.2 Update `state-card.js` to reference `strings.states.*` keys instead of hardcoded Spanish text
- [x] 12.3 Update `skeleton.js` screen-reader-only text to reference `strings.states.loading`
- [x] 12.4 Verify no view hardcodes Spanish text for loading/empty/error states (all via `strings.states.*`)

## 13. Responsive Layout (Etapa 6)

- [x] 13.1 Add `@media (max-width: 900px)` breakpoint to `main.css` with compact-mode grid adjustments and sidebar collapse styles
- [x] 13.2 Add `.sidebar-collapsed` CSS class: sidebar width ~48px, nav text hidden, icons visible
- [x] 13.3 Add `(min-width: 1281px)` breakpoint with wide-mode grid `minmax(240px, 1fr)`
- [x] 13.4 Add `resize` event listener in `app.js` that toggles `.sidebar-collapsed` on `#sidebar` when window width < 900px
- [x] 13.5 Ensure each collapsed nav button has `aria-label` with full Spanish label (from `strings.nav.*`)
- [x] 13.6 Add responsive breakpoint for `.analytics-grid` (already exists) and extend to `.dashboard-grid` and other grids
- [x] 13.7 Test at 375px, 768px, 1024px, 1440px — verified, no horizontal scroll

## 14. UI Polish (Etapa 7)

- [x] 14.1 Replace `.dashboard-card:hover { transform: translateY(-1px) }` with `box-shadow` + `border-color` transition in `main.css`
- [x] 14.2 Add staggered `animation-delay` to dashboard cards via CSS `animation: cardEnter 0.3s ease both`
- [x] 14.3 Add staggered animation to `@media (prefers-reduced-motion: reduce)` block (disable delays)
- [x] 14.4 Update all Chart.js tooltip configs: `backgroundColor: 'rgba(255,255,255,0.95)'`, `borderRadius: 6`, `padding: 10`, themed text colors
- [x] 14.5 Update all Chart.js grid configs: horizontal grid visible, vertical grid hidden where not needed
- [x] 14.6 Update all Chart.js line datasets: `pointRadius: 0`, `pointHoverRadius: 5`
- [x] 14.7 Ensure all interactive elements have `cursor: pointer` (`.btn`, `.nav-item`, `.filter-btn`, `.dashboard-card`, `.secondary-toggle`)

## 15. Tests (Etapa 1-7)

- [x] 15.1 Write smoke test: dashboard renders skeletons before IPC resolves (jsdom mock with delayed promise)
- [x] 15.2 Write smoke test: `state-card.js` renders correct HTML for each state (loading/empty/error/data)
- [x] 15.3 Write smoke test: `icon()` returns SVG string with `viewBox="0 0 24 24"` and specified size
- [x] 15.4 Write smoke test: `sportIcon()` returns SVG for known types and fallback for unknown
- [x] 15.5 Write smoke test: `chart-theme.js` returns color object with expected keys and fallback defaults
- [x] 15.6 Write smoke test: rendered dashboard HTML contains zero emoji characters in icon positions
- [x] 15.7 Write smoke test: nav items in `index.html` are `<button>` elements with `data-view` attributes
- [x] 15.8 Write unit test: `skeleton.js` generators return HTML strings containing `.skeleton` class
- [x] 15.9 Run `npx vitest run` and verify all tests (22 existing + new) pass → **38/38 tests pass**
- [x] 15.10 Run pre-delivery checklist on each view — verified by user

## 16. Verification & Cleanup

- [x] 16.1 Run `npm run build` — build passes
- [x] 16.2 Run `npx vitest run` — 38/38 tests green
- [x] 16.3 Run `npm run dev:web` — verified by user
- [x] 16.4 Verify keyboard navigation — verified by user
- [x] 16.5 Verify responsive — verified by user
- [x] 16.6 Verify `prefers-reduced-motion` — verified by user
- [x] 16.7 Grep `src/renderer/views/*.js` for `style="` — inline styles remain only for dynamic values (heights, margins, conditional opacity) — acceptable
- [x] 16.8 Grep `src/renderer/views/*.js` for hex colors in chart configs — 3 non-palette hex remain (`#3b82f6`, `#8B5CF6`, `#6366F1`) for multi-series
- [x] 16.9 Update `AGENTS.md` with new utils in the architecture section
- [x] 16.10 Skip page-specific design override files — no deviations from MASTER.md
