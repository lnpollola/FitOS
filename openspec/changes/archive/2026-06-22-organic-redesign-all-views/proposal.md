## Why

The dashboard spike introduced an intentional organic aesthetic ("libreta de campo de un cuerpo vivo": bone/moss/ember palette, Fraunces + Source Sans 3, paper grain, growth ring signature, breath motion) so FitOS stops reading as the default Inter+slate+teal SaaS template. The spike proved the direction in one view, but every other tab (activity, diet, energy, measurements, training, analytics, profile) still renders the old clinical SaaS look, so navigating across the app produces a jarring split personality. Two regressions in the spike itself also need fixing: the growth ring doesn't close into a complete circle at small N, and the hero card leaves a giant empty card slot when steps data is missing — pushing the activity summary and per-sport section off-screen with a blank gap.

## What Changes

- **Fix dashboard hero ring**: make arcs tile into a visually complete ring for any N (close the gap, ensure end-of-last arc meets start-of-first when N ≤ some threshold, or use a continuous spiral with no visible gap for N ≥ 14).
- **Fix dashboard empty spacer**: when ring data is missing, hero card collapses to a compact single-column layout (no empty left-side ring column) so the activity summary and per-sport section shift up with no blank card between them.
- **Promote organic tokens to a scoped system**: extract the spike's `#view-dashboard` token block into a reusable `body.organic` override + per-view scoping helper so all 8 views opt in without rewriting their structure.
- **Add Fraunces + Source Sans 3 imports** globally so all views can reach them via `var(--font-display)` / `var(--font-body)`.
- **Propagate organic styling to 7 remaining views**: activity, diet, energy, measurements, training, analytics, profile each container-scope the organic palette and replace `Plus Jakarta Sans` titles + `Inter` body with Fraunces/Source Sans 3.
- **Replace eyebrow `uppercase + letter-spacing: 0.5px` SaaS pattern** with Fraunces italic 14px across every card h3 in all views.
- **Kill the gradient top-bar template** (`linear-gradient(90deg, accent, success)` 3px bar) on every card style across views where it's replicated.
- **Introduce SVG sparklines** as a reusable renderer (`src/renderer/utils/sparkline.js`) consumed by any view showing time series inline (currently inline in dashboard.js only).
- **Apply organic Chart.js theme**: chart-theme.js exposes organic palette reads; line charts in activity/analytics/training/measurements use moss/ember/ink.
- **Add Spanish strings** for hero copy (`avgDay`, `noBalanceData`, `daysActive`, `daysLow`, `days`) consumed by the dashboard hero; ensure they exist in `locales/es.js` instead of relying on `strings.dashboard.X || 'fallback'` inline.
- Add new spec: **organic-aesthetic** — codifies the aesthetic direction as a first-class requirement (palette, typography pair, signature growth ring, paper grain, organic easing, breath motion).
- Add new spec: **temporal-microcharts** — codifies the SVG sparkline renderer contract (data shape, styling hooks, no Chart.js dep, reduced motion respects).
- No **BREAKING** changes to IPC, schema, or user data; purely renderer-layer.

## Capabilities

### New Capabilities

- `organic-aesthetic`: codifies the "libreta de campo" design direction — named palette (bone, smoke, paper, moss, moss-ink, moss-mist, ember, ink, lichen), typographic pair (Fraunces display + Source Sans 3 body), organic easing, paper grain texture rule, breath motion budget, single-signature-per-view rule.
- `temporal-microcharts`: the SVG sparkline renderer — smooth Catmull-Rom-to-Bezier path, area tint, end-dot, inline CSS `--moss`/`--ember` stroke, no JS chart dep, zero animation, traceable from `utils/sparkline.js`.

### Modified Capabilities

- `design-system`: scope organic tokens at `body.organic` (or per-view `#view-*`) extending `:root` tokens; introduce `--font-display`, `--font-body`, `--ease-organic`; document override strategy so other views opt in without rewriting structure.
- `dashboard-health-metrics`: dashboard gains a hero card (growth ring + weekly balance big number + legend) plus inline sparklines on every health card that has a time series; fixes the empty hero card spacer when data missing and the incomplete ring at low N.
- `ui-polish`: replace `uppercase + letter-spacing: 0.5px` eyebrow with Fraunces italic 14px on every card h3 across views; remove the 3px gradient top-bar template; line chart tooltip/grid colors use organic palette via `chartColors`.
- `accessibility`: extend the reduced-motion guard to cover the hero breath animation and any organic motion introduced in the new spec.
- `spanish-ui`: add hero legend copy and missing fallback strings (`dashboard.avgDay`, `dashboard.noBalanceData`, `dashboard.daysActive`, `dashboard.daysLow`, `dashboard.days`) to `locales/es.js` so the hero renders Spanish without inline fallback strings in `views/*.js`.

## Impact

- **Code**: `src/renderer/styles/main.css` (large additions, scoped overrides for 8 views), `src/renderer/views/dashboard.js` (fixes + extract sparkline/ring helpers), new `src/renderer/utils/sparkline.js`, `src/renderer/utils/chart-theme.js` (organic color read), every `views/*.js` (no structural changes — purely class swaps scoped to `#view-*`).
- **Strings**: `src/renderer/locales/es.js` (add ~5 hero strings, no removals).
- **No backend changes**: zero IPC handlers, zero schema migrations, zero data model changes. All edits are renderer-layer.
- **Tests**: existing 38/38 Vitest suite must stay green. Two new smoke tests added — one for the organic token presence on `#view-dashboard`, one for the sparkline renderer shape.
- **Dependencies**: two more Google Fonts families loaded via the existing `@import` in `main.css` (Fraunces, Source Sans 3). No new npm packages.
- **Performance**: paper grain is a one-time SVG `feTurbulence` baked into `background-image`; bounded by an existing `prefers-reduced-motion` already covers the breath animation.
- **Rollout risk**: high surface area (8 views). Mitigated by per-view scoping (`#view-<name>`) so each view can be reverted independently if it regresses.