## 1. Foundation (revert-safe, no visual change)

- [x] 1.1 Add Fraunces + Source Sans 3 to the `@import` statement at the top of `src/renderer/styles/main.css` (keep Inter, Plus Jakarta Sans, JetBrains Mono imports intact for now)
- [x] 1.2 Add `--radius-pill: 100px` to `:root` in `main.css`; migrate the literal `100px` in the `.tag` rule to `var(--radius-pill)`
- [x] 1.3 Insert a single `body.organic { ... }` block in `main.css` containing: the 9 named palette variables (`--bone`, `--smoke`, `--paper`, `--moss`, `--moss-ink`, `--moss-mist`, `--ember`, `--ink`, `--lichen`), redefinitions of `--bg-primary` / `--bg-secondary` / `--bg-tertiary` / `--text-primary` / `--text-secondary` / `--accent` / `--accent-hover` / `--accent-light` / `--danger` / `--success` / `--border` to organic values, `--font-display` ('Fraunces, Georgia, serif'), `--font-body` ('Source Sans 3, Inter, sans-serif'), `--ease-organic` (cubic-bezier(.2,.85,.25,1)), organic overrides for `--radius` (14px), `--radius-sm` (10px), and moss-tinted `--shadow` / `--shadow-md` / `--shadow-lg`
- [x] 1.4 Add `body.organic::before` paper grain overlay (`position:absolute; inset:0; pointer-events:none; background-image:url(data:image/svg+xml...feTurbulence...); opacity:0.04; mix-blend-mode:multiply; z-index:0`) plus `body.organic > * { position:relative; z-index:1 }` so content stacks above the grain
- [x] 1.5 Add a `@media (prefers-contrast: more)` block hiding `body.organic::before` (`display:none`)
- [x] 1.6 Add the `prefers-reduced-motion: reduce` extension to cover breath animation and organic hover transitions (typography + grain remain)
- [x] 1.7 Run `npm run build:renderer` and `npm test` — expectation: 38/38 tests pass, build succeeds. No `class="organic"` on `<body>` yet, so no visual change.

## 2. Extract reusable helpers from dashboard.js

- [x] 2.1 Create `src/renderer/utils/sparkline.js` exporting `sparkline(values, { stroke, width, height })` per the `temporal-microcharts` spec: Catmull-Rom-to-Bezier path, area tint, end-dot, inline `style="stroke:..."` + `style="fill:..."`, default stroke `var(--moss)`, default 120×36 viewBox, `preserveAspectRatio="none"`, null-tolerant, returns `''` for < 2 data points, no `<animate>`/animation styles
- [x] 2.2 Create `src/renderer/utils/growth-ring.js` exporting `growthRing(values)` returning an SVG string per the dashboard-health-metrics spec: arcs tile edge-to-edge for N ≤ 14 (gap = 0), small gap ≤ 0.6° for N > 14, ring radius grows with day index, stroke width scales with day's value normalized across period, single-day still renders a complete circle
- [x] 2.3 Add the `.spark` / `.spark .line` / `.spark .area` / `.spark .dot` CSS rules under `body.organic` in `main.css` (stroke-width 1.6, area opacity 0.14, dot fill `var(--moss-ink)` + stroke `var(--paper)` + 1.4 width)
- [x] 2.4 Update `src/renderer/views/dashboard.js` to import from `../utils/sparkline.js` and `../utils/growth-ring.js` and remove the local `sparkline()` and `growthRing()` function definitions
- [x] 2.5 Run `npm test` — expectation: 38/38 tests pass; dashboard renders identically

## 3. Spanish strings for the hero legend

- [x] 3.1 Add to `strings.dashboard` in `src/renderer/locales/es.js`: `avgDay: 'Promedio diario'`, `noBalanceData: 'Sin balance todavía'`, `daysActive: 'Activo'`, `daysLow: 'Bajo'`, `days: 'días'`
- [x] 3.2 In `views/dashboard.js`, replace the three `strings.dashboard.X || 'fallback'` defensive `||` patterns for `avgDay`, `noBalanceData`, `daysActive`, `daysLow`, `days` with direct `strings.dashboard.X` references
- [x] 3.3 Search all `src/renderer/views/*.js` for `strings.dashboard.days || 'días'` style fallbacks and confirm zero remain
- [x] 3.4 Run `npm test` — Spanish-UI smoke test must still pass

## 4. Dashboard fixes (the bug report)

- [x] 4.1 In `utils/growth-ring.js`, implement the closed-ring mode: when `values.length <= 14` set `gap = 0` (arcs tile complete); when `values.length > 14` set `gap = 0.6`; verify visually for N = 1, 2, 7, 14, 30, 90
- [x] 4.2 In `views/dashboard.js`, when `ringValues.length === 0` skip the `.hero-ring-wrap` element entirely and apply a `.card-hero--compact` class to `.card-hero` that sets `grid-template-columns: 1fr` and hides `.hero-legend`; render only the hero text
- [x] 4.3 Add `.card-hero--compact` CSS to main.css (under `body.organic #view-dashboard`) with `grid-template-columns: 1fr`
- [x] 4.4 Visually verify: load dashboard with no steps data → hero renders compact banner; activity summary + per-sport section sit immediately below hero with no empty card between them
- [x] 4.5 Verify the activity sessions highlighted card (`card-accent`) and the per-sport cards below shift up — there is now no blank card slot between the hero content and the activity section

## 5. Activate organic on the app shell

- [x] 5.1 Add `class="organic"` to `<body>` in `src/renderer/index.html`
- [x] 5.2 Optionally scope the organic treatment on `#sidebar` so the navigation reads organic too (treat as the 9th view): re-point `--bg-secondary` (paper), `--text-secondary` (lichen), re-style `.nav-item.active` to moss accent + moss-mist background, keep the 3px accent border-left as is (already uses `var(--accent)`)
- [x] 5.3 Run `npm test` and `npm run build:renderer` — must stay green
- [x] 5.4 Visually smoke test all 8 views: confirm no horizontal scroll at 1024px / 1440px widths

## 6. Per-view organic rollout (one task per view)

- [x] 6.1 Activity view: ensure `#view-activity` uses Fraunces for `.view-title` and italic 14px for card `h3`; remove any `text-transform: uppercase` + `letter-spacing: 0.5px` on eyebrow h3 / `.kpi-label` inside this view; confirm chart configs use `chartColors.accent` (no hardcoded hex)
- [x] 6.2 Diet view: same as activity — Fraunces view-title, italic h3 eyebrows, kill uppercase-letter-spacing; verify `.tag` use reads `var(--radius-pill)` via the inherited `.tag` rule
- [x] 6.3 Energy view: Fraunces view-title and italic h3 eyebrows; ensure the warning banner (week balance < 5 days) reads with `var(--ember)` for the warning state; chart configs use `chartColors`
- [x] 6.4 Measurements view: Fraunces view-title (uses large metric values — confirm `.data-value-lg` switches to Fraunces under `body.organic`); italic h3 eyebrows; remove gradient top-bar if any exists; chart configs use `chartColors`
- [x] 6.5 Training view: Fraunces view-title (session headings); italic h3 eyebrows; remove gradient top-bar from any card `.dashboard-card::before` inside this view; chart configs use `chartColors`
- [x] 6.6 Analytics view: Fraunces for `.view-title` and `.kpi-value`s (large numbers — confirm Fraunces applies); italic `.kpi-label` eyebrows; verify `analytics-kpi-card .kpi-label` no longer `uppercase + letter-spacing`; chart configs use `chartColors`
- [x] 6.7 Profile view: Fraunces view-title; italic h3 eyebrows; form labels use `var(--font-body)` (Source Sans 3 — already inherited via body)
- [x] 6.8 Adaptive view (if present): Fraunces view-title, italic h3 eyebrows, kill uppercase; chart/trend visualization uses `chartColors`
- [x] 6.9 Global sweep: search `main.css` for any remaining `text-transform: uppercase` outside of `th` table headers; wrap them so they are NOT active under `body.organic`
- [x] 6.10 Global sweep: search `src/renderer/views/*.js` for hex color literals (`#[0-9A-Fa-f]{6}`) inside chart config objects (`borderColor`, `backgroundColor`, `grid.color`, tick colors); replace with `chartColors` references
- [x] 6.11 After each view's edit, run `npm test` (must stay 38/38 or grow with new smoke tests)

## 7. Tests

- [x] 7.1 Add `tests/unit/sparkline.test.js` covering: empty input returns `''`, single value returns `''`, 3 values produce 1 `<path class="line">` with a `C` command, area + line + dot all present, custom stroke override applied to inline `style`, custom dimensions reflected in `viewBox`, null values tolerated
- [x] 7.2 Add `tests/unit/growth-ring.test.js` covering: empty input returns `''`, N = 1 yields a complete circle (one arc with sweep 360°), N = 7 produces 7 arcs whose sweeps sum to 360° (no gap for low N), N = 30 produces 30 arcs with sum(sweeps) + sum(gaps) = 360°
- [x] 7.3 Add `tests/smoke/organic-tokens.test.js` asserting `getComputedStyle(document.body).getPropertyValue('--accent')` resolves to the moss hex (#4E5D3F or `var(--moss)` chain) when `document.body.classList.contains('organic')`
- [x] 7.4 Add a smoke test asserting `body.organic::before` (paper grain) is `display: none` under `@media (prefers-contrast: more)` (mock via matchMedia)
- [x] 7.5 Update `tests/smoke/dashboard.test.js` to assert the hero renders compact (no `.hero-ring-wrap`) when steps data is absent; asserts the hero ring wraps `growthRing()` output when steps data exists
- [x] 7.6 Run `npm test` — expectation: all tests pass (38 existing + ~12 new = ~50)

## 8. Spec sync and archive

- [x] 8.1 Run `openspec sync --change "organic-redesign-all-views"` to merge delta specs (`design-system` modified, `dashboard-health-metrics` modified + added, `ui-polish` modified + added, `accessibility` modified, `spanish-ui` added, `organic-aesthetic` new, `temporal-microcharts` new) into the main specs under `openspec/specs/`
- [x] 8.2 Run `openspec archive --change "organic-redesign-all-views"` once implementation is complete and all tests pass
- [x] 8.3 Update `AGENTS.md` session block with the new change entry under `openspec/changes/archive/` referencing the date and scope