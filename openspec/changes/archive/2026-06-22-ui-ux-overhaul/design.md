## Context

FitOS is an Electron desktop app (vanilla JS, no framework) with 8 views rendered via a manual router (`app.js`). The renderer layer has accumulated UI debt: blank regions during async loads, emoji icons, ~40 inline styles per view, no keyboard navigation, and silent error swallowing. The ui-ux-pro-max skill diagnosed the app as a **Data-Dense Dashboard** pattern and persisted a design system at `design-system/fitos/MASTER.md`.

Current state constraints:
- **No framework**: vanilla ES modules, DOM manipulation via `innerHTML`. No React/Vue reconciliation to lean on — skeletons and state transitions must be manual.
- **Chart.js**: 8+ chart instances across views, already with destroy-before-recreate. Colors are hardcoded hex in JS.
- **safeCall**: existing error wrapper returns fallback values silently. The tri-state (loading/empty/error) must build on top of this, not replace it.
- **Locale module**: `strings` object in `locales/es.js` is the single source for UI text. New state strings must extend it.
- **22 passing tests** (14 unit + 8 smoke) must remain green. New tests added for UI states.
- **Electron contextIsolation**: no Node APIs in renderer; all data via `window.electronAPI`.

Stakeholders: single user (local-first desktop app), no multi-tenant concerns.

## Goals / Non-Goals

**Goals:**
- Close all 9 gaps from the ui-ux-pro-max diagnosis (loading, icons, inline styles, a11y, errors, colors, spacing, aria-live, responsive)
- Establish a token-based design system that makes future UI work consistent
- Make async loads perceptible (skeletons + streaming render)
- Achieve keyboard navigability and screen-reader announceability
- Eliminate emoji icons and inline styles from view code
- Keep all 22 existing tests passing; add ~15-20 new tests for UI states

**Non-Goals:**
- No dark mode (out of scope — would require full color system overhaul; current light theme is the target)
- No framework migration (staying vanilla JS)
- No backend/IPC/DB changes
- No new views or features (pure UX refinement of existing 8 views)
- No animation library (CSS keyframes + transitions suffice)
- No i18n beyond Spanish (existing single-locale model preserved)
- No design-system-as-code tooling (Style Dictionary, etc.) — CSS custom properties + JS bridge is enough

## Decisions

### D1: Design tokens via CSS custom properties + JS bridge

**Decision:** Define spacing (`--space-1..8`), elevation (`--shadow-lg`), z-index (`--z-1/10/100`) as CSS custom properties in `:root`. For Chart.js color access, create `utils/chart-theme.js` that reads `getComputedStyle(document.documentElement).getPropertyValue('--accent')` at render time and exposes a `chartColors` object.

**Rationale:** CSS custom properties are already the pattern (`main.css:9-28`). A JS bridge avoids duplicating the palette in two places. Reading at render-time (not module-load-time) ensures the values are available after DOM ready.

**Alternatives considered:**
- *Duplicate palette in JS constants*: simpler but two sources of truth → drift risk. Rejected.
- *CSS-in-JS / Tailwind*: introduces build complexity and a dependency the vanilla-JS architecture doesn't need. Rejected.
- *PostCSS custom properties export*: build-time extraction, but Vite config changes are out of scope. Rejected.

### D2: Skeletons via CSS `animate-pulse` + HTML generators

**Decision:** Create `utils/skeleton.js` exporting functions (`skeletonCard()`, `skeletonRow()`, `skeletonChart()`) that return HTML strings with a `.skeleton` class. CSS defines `.skeleton { background: var(--bg-tertiary); animation: pulse 1.5s ease-in-out infinite; }`. Skeletons are injected into the same container before `await`, then replaced by real content per-card as `Promise.allSettled` resolves.

**Rationale:** HTML-string generators match the existing `innerHTML` pattern — no DOM API learning curve. CSS animation is GPU-accelerated and respects `prefers-reduced-motion` (already in `main.css:451`). Per-card replacement via `allSettled` gives streaming perception.

**Alternatives considered:**
- *Single spinner for the whole view*: simpler but poor perception (skill: severidad Alta for blank screens). Rejected.
- *Web Components / custom elements*: overkill for skeletons, adds complexity. Rejected.
- *Opacity-based lazy reveal*: doesn't communicate structure, only presence. Rejected.

### D3: Streaming render via `Promise.allSettled` + per-card `.then()`

**Decision:** Replace `Promise.all([...])` blocks in views with `Promise.allSettled([...])`. Each promise gets a `.then()` that renders its specific card/row immediately when resolved, replacing the skeleton in that slot. Errors become error-state cards (not silent `null`).

**Rationale:** `Promise.all` blocks until all resolve (or first rejects) — the blank-region problem. `allSettled` never rejects; per-card `.then()` streams content. This is the single highest-impact change for perceived performance.

**Alternatives considered:**
- *Keep `Promise.all`, add one skeleton for the whole block*: loses streaming benefit. Rejected.
- *Observables / RxJS*: dependency + paradigm shift too large. Rejected.

### D4: Lucide icons via static SVG string imports

**Decision:** Add `lucide` as a devDependency. Create `utils/icons.js` that imports specific icons (activity, check, arrow-up, arrow-down, minus, dumbbell, etc.) and exports a function `icon(name, size=16)` returning an SVG string. Create `utils/sport-icons.js` mapping each `sport_type` to a Lucide icon name, with a fallback to `activity`.

**Rationale:** Lucide is tree-shakeable, ~50KB for the icons we need, stroke-based (matches the clean aesthetic), and provides SVG strings without a React dependency. Importing specific icons keeps the bundle small.

**Alternatives considered:**
- *Heroicons*: fewer icons (~300), less coverage for sports. Rejected.
- *Custom SVG per sport*: maximum control but high effort for ~20 sport types. Rejected as non-goal (scope).
- *Icon font (Font Awesome)*: non-SVG, accessibility issues, larger payload. Rejected (skill: "use SVG").

### D5: Tri-state card via `state-card.js` renderer

**Decision:** Create `utils/state-card.js` exporting `renderStateCard(container, { title, state, valueHtml, subtitle, onRetry })` where `state` is `'loading' | 'empty' | 'error' | 'data'`. The function renders the appropriate HTML (skeleton / empty message + action / error + retry button / actual data). Views call this instead of building card HTML directly for async data.

**Rationale:** Centralizes the loading/empty/error/data logic so all 8 views behave consistently. The `onRetry` callback re-triggers the fetch. This builds on `safeCall` (which still catches errors) but surfaces them instead of silencing.

**Alternatives considered:**
- *Per-view inline state handling*: duplicates logic 8 times. Rejected.
- *Global error banner*: intrusive, doesn't guide per-card. Rejected.
- *Toast notifications*: ephemeral, user can't retry. Rejected for errors (kept as option for success).

### D6: Accessibility via `<button>` nav items + `:focus-visible`

**Decision:** Refactor sidebar `<li data-view>` to `<li><button data-view>`. Buttons natively handle Enter/Space and focus. Add `:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }` globally for keyboard users. Update `showView` to set `aria-current="page"` on the active button. Add `role="navigation"` + `aria-label="Navegación principal"` on `<nav>`.

**Rationale:** Semantic HTML beats ARIA attributes (skill: "use button/a/label elements, don't div with role"). Buttons solve keyboard + focus in one move. `aria-current="page"` is the correct semantic for nav state.

**Alternatives considered:**
- *Keep `<li>`, add `tabindex="0"` + `keydown` listener*: more code, less semantic. Rejected.
- *Convert to `<a href="#view">`*: would require hash routing changes, out of scope. Rejected.

### D7: Responsive via CSS breakpoints + collapsible sidebar

**Decision:** Three breakpoints in `main.css`: `@media (max-width: 900px)` (compact), `(min-width: 901px) and (max-width: 1280px)` (normal), `(min-width: 1281px)` (wide). In compact mode, sidebar collapses to icon-only (48px wide) via a `.sidebar-collapsed` class toggled by JS on resize. Grid `minmax` values adjust per breakpoint.

**Rationale:** Electron windows are resizable; the current single-breakpoint design breaks below 900px. Icon-only sidebar is the standard desktop pattern (VS Code, Slack). CSS media queries + one JS toggle class is minimal complexity.

**Alternatives considered:**
- *Drawer/hamburger sidebar*: mobile pattern, feels wrong on desktop. Rejected.
- *Fixed sidebar, horizontal scroll content*: poor UX. Rejected.
- *Density toggle in settings*: kept as a separate enhancement (card padding), not the primary responsive mechanism.

### D8: Inline styles → utility + component classes

**Decision:** Extend the existing utility class system (`.mt-1`, `.text-muted`) with text-size utilities (`.text-xs` 12px, `.text-sm` 13px), flex utilities (`.flex-gap-sm` 8px), and component classes (`.card-accent`, `.compliance-ok`, `.compliance-warn`, `.metric-trend`, `.metric-value-sm`). Migrate inline styles in all views to these classes.

**Rationale:** The app already has utility classes (`main.css:543-551`). Extending them is consistent with the existing pattern. Component classes capture repeated card patterns (accent card, compliance badge) that appear 5+ times in dashboard.js alone.

**Alternatives considered:**
- *Tailwind utility classes*: new dependency, build config change. Rejected.
- *CSS Modules*: vanilla JS has no module boundary for CSS. Rejected.
- *Only component classes, no utilities*: too granular for spacing/text. Rejected.

## Risks / Trade-offs

- **[Risk] `getComputedStyle` in chart-theme.js reads stale values if called before DOM ready** → Mitigation: chart-theme.js reads values lazily (on first chart render), and charts are only created after `await` resolves (post-DOM-ready). Add a guard: if `--accent` is empty string, fall back to hardcoded defaults matching the CSS.

- **[Risk] `Promise.allSettled` + per-card streaming causes layout thrash** (cards popping in sequentially) → Mitigation: skeletons occupy the same dimensions as final cards (same padding, min-height), so replacement is a content swap, not a layout shift. Stagger fade-in via `animation-delay` smooths the pop.

- **[Risk] Lucide dependency adds to bundle size** (~50KB for ~30 icons) → Mitigation: tree-shaking via specific imports keeps it minimal. Electron app is local (no network transfer cost), so 50KB is negligible vs. Chart.js (~200KB already present).

- **[Risk] Tri-state card refactor touches all 8 views — high churn, regression risk** → Mitigation: implement per-view incrementally (dashboard first, then others). Smoke tests verify each view renders without throwing. The `safeCall` wrapper remains as the error-catching layer underneath.

- **[Risk] Sidebar `<li>` → `<li><button>` change may break existing CSS selectors** (`main.css:83-120` targets `li` directly) → Mitigation: update CSS selectors to `li button` or `.nav-item` class. Test sidebar styles explicitly.

- **[Trade-off] Skeletons add HTML complexity to views** → Accepted: the `utils/skeleton.js` generators centralize this. Views call `skeletonCard()` instead of writing skeleton HTML inline.

- **[Trade-off] No dark mode in this change** → Accepted: dark mode requires a full color-system overhaul (all `--*` variables need dark equivalents + a toggle mechanism). Out of scope; the light theme will be polished to professional quality.

- **[Trade-off] Responsive sidebar collapse is JS-driven, not pure CSS** → Accepted: CSS can't toggle a class on resize without `ResizeObserver`, which is still JS. A single resize listener toggling one class is the minimal JS footprint.

## Migration Plan

This is a renderer-only refactor with no backend changes. No data migration. Deployment is a standard app update.

**Rollout order (matches Etapas 0→7):**
1. Etapa 0 (tokens + chart-theme.js) — no visual change, foundation
2. Etapa 1 (skeletons + streaming) — dashboard first, then other views
3. Etapa 3 (a11y: nav buttons + focus) — sidebar refactor
4. Etapa 4 (inline styles → classes) — per-view migration
5. Etapa 2 (icons) — emoji replacement
6. Etapa 5 (empty/error states) — tri-state cards
7. Etapa 6 (responsive) — breakpoints + sidebar collapse
8. Etapa 7 (polish) — microinteractions, chart theming

**Rollback strategy:** Each etapa is a discrete commit. If a etapa introduces a regression, revert that commit — no cross-etapa dependencies require cascading rollback. The `safeCall` layer and IPC contracts are untouched, so backend stability is guaranteed.

**Verification at each etapa:**
- Run `npx vitest run` (all 22 tests + new tests must pass)
- Run `npm run dev:web` and manually verify each view renders
- Apply the pre-delivery checklist from `design-system/fitos/MASTER.md` before marking a etapa done

## Open Questions

- **OQ1:** Should the density toggle (comfortable/compact card padding) be a settings preference or automatic based on window width? *Tentative: automatic via media query; settings toggle is a future enhancement.*

- **OQ2:** For sport icons, should we use a single generic "activity" icon with the sport name as text label, or invest in distinct icons per sport type (running, cycling, swimming, etc.)? *Tentative: distinct icons for the top 10 sport types, generic fallback for the rest. Lucide has `bike`, `footprints` (run), `waves` (swim), `dumbbell`, etc.*

- **OQ3:** Should the skeleton animation duration be 1.5s (standard) or faster (1s) for a desktop app where loads are typically <500ms? *Tentative: 1.5s — skeletons appear briefly; a fast pulse feels frantic.*

- **OQ4:** Error retry button — should it retry just the failed card's fetch, or re-trigger the whole view's `render()`? *Tentative: per-card retry via a closure that re-calls the specific IPC method, not a full re-render.*
