## Context

The dashboard spike (Jun 2026) shipped an organic aesthetic scoped to `#view-dashboard`: a 16-variable token block (`--bone`, `--smoke`, `--paper`, `--moss`, `--moss-ink`, `--moss-mist`, `--ember`, `--ink`, `--lichen`, `--font-display`, `--font-body`, `--ease-organic`, shadow redefs, radius redefs) overriding the global `:root` slate/teal palette. Two view-layer helpers (`sparkline()`, `growthRing()`) live inline in `views/dashboard.js`. The hero card uses `grid-template-columns: minmax(170px, 220px) 1fr` to seat the ring on the left and the title+balance on the right.

Two regressions need fixing before propagation:

1. **Ring doesn't close**: `growthRing()` slots each day into `(360/N)` degrees, then subtracts a `gap` of `0.6–1.4°`. With N ≤ 13, that leaves an obvious wedge missing at the 12 o'clock origin; users read the ring as "broken/incomplete" rather than as a tree-ring spiral.
2. **Empty spacer card**: when `ringValues = []` (no steps data for the selected period, common before any import), `growthRing([])` returns `''`, so the left grid column renders as an empty 220px column. Visually the hero appears as a giant blank card with text only on the right; meanwhile `row-activity` (sessions summary + per-sport) sits below untouched, so the user sees a blank card *between* the hero and the activity data they actually care about.

Constraints:
- Renderer layer only — no IPC, no schema, no backend changes.
- 8 views must adopt the aesthetic without forcing rewrites of their `.innerHTML` templates (high surface area risk).
- Existing 38/38 Vitest suite must stay green.
- `prefers-reduced-motion: reduce` must neutralize the breath animation; typography and grain must remain (they're not motion).
- Chart.js instances and `chart-theme.js` must read organic palette via the same `getComputedStyle` bridge — no hardcoded hex in chart configs.

Stakeholders: single user (obsessive self-tracker, Spanish UI, local-first).

## Goals / Non-Goals

**Goals:**

- Make the growth ring visually complete for any N ≥ 1 (no missing wedge).
- Eliminate the empty hero spacer when ring data is absent (compact fallback layout, no blank card between hero and content).
- Provide a reusable mechanism for the 7 remaining views to opt into the organic look with one line of CSS each (no per-view template rewrites).
- Extract `sparkline()` and `growthRing()` out of `views/dashboard.js` into reusable `utils/` modules so any view can use them.
- Codify the aesthetic as two new specs (`organic-aesthetic`, `temporal-microcharts`) plus deltas to `design-system`, `dashboard-health-metrics`, `ui-polish`, `accessibility`, `spanish-ui`.

**Non-Goals:**

- Refactoring view `.innerHTML` templates — out of scope. Each view keeps its current DOM structure; only CSS and small `h3`/eyebrow swaps.
- Replacing Chart.js with a custom charting library. Charts stay on Chart.js, just themed via `chart-theme.js`.
- Touching the sidebar, the app shell, error/empty states' copy (except the hero's new legend strings), or any main-process code.
- Mobile-first rewrite. The spike's `@media (max-width: 900px)` block stays as-is; we don't optimize below 900px beyond keeping it from breaking.
- Color-blindness simulation tooling. We pick `moss` vs `ember` for perceptual distance but don't add tooling.

## Decisions

### D1: Promote the organic token block to `:root` under a feature flag class, not to `:root` directly

**Choice**: Define the organic palette as traditional `:root` overrides gated by `body.organic` (or `html.organic`). Each view "opts in" by being inside a body that has the class. CSS cascade does the rest; no `#view-*` selector spam.

**Why over alternative**: The spike scoped tokens to `#view-dashboard` to prevent collateral damage. For 8 views, that means 8 copies of the same 16-line block, which is unmaintainable. A single `body.organic` block + one class on `<body>` in `index.html` enables all views at once and keeps the token definitions in one place.

**Alternative rejected**: Per-view opt-in via `#view-<name>` selector block — duplicated, brittle when adding new views.

### D2: Tailwind-style "override variables, not values": every consumption stays `var(--accent)`

**Choice**: Keep using `var(--accent)`, `var(--bg-primary)`, `var(--text-secondary)` *everywhere* in main.css (existing rules and new ones). Override their *values* under `body.organic`: `--accent: var(--moss)`, `--bg-primary: var(--bone)`, etc. Other stylesheets see the new palette automatically.

**Why**: The existing codebase already calls `var(--accent)` ~30 times in main.css and across views. Re-pointing the variable is one-line change per token; rewriting each call-site would be a 200-line diff with high regression risk.

**Alternative rejected**: Rename `--accent` → `--moss` everywhere and add a back-compat alias. Rejected because the spike already proved the override pattern works and the rest of the views are scoped.

### D3: Fix the ring with two rendering modes — closed disc for low N, spiral for high N

**Choice**: When `N ≤ 14`, render arcs that tile edge-to-edge with `gap = 0` so the ring reads as a complete disc with day boundaries implied only by stroke-width variance. When `N > 14`, allow a small `gap = 0.6°` so individual days are still readable. Both modes keep the "tree ring" metaphor (radius grows with day index) — small N is "a fresh shoot, few rings", large N is "a mature trunk, many rings".

**Why**: The bug report says "el círculo no se termina de ver bien como está completo" — the user wants a closed ring at low N. Setting `gap = 0` for small N closes the wedge; for high N the wedge reads as inter-day spacing and isn't read as "broken".

**Alternative rejected**: Always `gap = 0` for any N. At N=30 the ring becomes indistinguishable from a uniform stroke and the day-boundary information is lost. Discarded.

### D4: Empty data → compact hero (collapse the grid column), not a placeholder ring skeleton

**Choice**: When `ringValues.length === 0`, render the hero with `grid-template-columns: 1fr` (single column, text only, no left ring column) and skip the legend. The `.card-hero` block elastically fills the row.

**Why**: The bug report says "entre un contenido y otro hay una tarjeta enorme que no muestra ningún contenido" — the empty left column reads as a blank card. Collapsing it to a single column reflows the hero into a compact banner and pushes the activity summary + per-sport section immediately below, no blank gap.

**Alternative rejected**: Render a placeholder ring with a faded moss skeleton arc. Adds visual noise; the hero is the *signature* and a broken signature is worse than no signature.

### D5: Extract `sparkline()` and `growthRing()` to `utils/sparkline.js` and `utils/growth-ring.js`

**Choice**: Move both helpers to their own ES modules under `src/renderer/utils/`. `views/dashboard.js` imports from them. Any other view may import them too.

**Why**: `temporal-microcharts` is a new spec — it must be reusable, not embedded in a view. Inline helpers in `dashboard.js` violate that.

**Alternative rejected**: Single `utils/organic-widgets.js` exporting both. Rejected — they have different responsibilities (one is a generic microchart, one is a hero signature element); mixing them complicates the spec contract.

### D6: `chart-theme.js` reads the organic palette via the same `getComputedStyle` bridge

**Choice**: `chartColors.accent` keeps mapping to `--accent`, `chartColors.danger` to `--danger`, etc. Under `body.organic`, those variables now resolve to moss/ember — Chart.js instances inherit the organic palette without code changes in any view's chart config.

**Why**: The existing `chart-theme.js` already reads `--accent` via `getComputedStyle`. By re-pointing the variables (D2), charts get organic for free.

**Alternative rejected**: Add `chartColors.moss`, `chartColors.ember` etc. and rewrite 20+ chart `borderColor:` lines. Worse diff, no benefit.

### D7: Single-signature-per-scope rule — growth ring is hero-only

**Choice**: Codify in the `organic-aesthetic` spec that any "signature" element (growth ring, breath motion, paper grain texture) appears exactly once per view, not on every card.

**Why**: The dashboard spike put the gradient top-bar template on *every* card (`::before` in `.dashboard-card`); we killed that to make the hero *the* signature. Propagating to other views means establishing the rule formally so we don't end up with sparklines on every metric card or growth rings everywhere.

**Alternative rejected**: Allow each view to invent its own signature. Rejected — that's maximalism, the skill explicitly warns against it ("Spend your boldness in one place").

### D8: Strings first — no inline fallbacks like `strings.x || 'default'`

**Choice**: Add `dashboard.avgDay`, `dashboard.noBalanceData`, `dashboard.daysActive`, `dashboard.daysLow`, `dashboard.days` to `locales/es.js`. Remove every `strings.dashboard.X || 'fallback'` defensive `||` from `views/dashboard.js` and from any new view using the legend.

**Why**: Spanish-UI spec mandates no hardcoded strings. The spike shipped 3 inline `||` fallbacks — that's technical debt that gets flagged by `spanish-ui` audit. Fix now, propagate clean.

**Alternative rejected**: String IDs in `en.js` too. Rejected — the app is Spanish-only by spec.

### D9: Paper grain via `feTurbulence` filter as `background-image` on `body.organic::before`, not per-view

**Choice**: The grain texture overlays the entire app once via `body.organic::before`, opacity `0.04`, `mix-blend-mode: multiply`. Each view does NOT add its own `::before`.

**Why**: One texture overlay is the aesthetic; per-view overlays would compound opacity and could look noisy. The skill warns: one accessory.

**Alternative rejected**: Apply grain inside `#view-*` only. Denied — would cause a visible color pop when navigating between views (organic vs clinical) during the migration; once it's full-app, it's full-app.

## Risks / Trade-offs

- **8 views × CSS changes simultaneously = high regression surface** → Mitigation: scoped per-view `#view-<name>` blocks since the spike proved the pattern. Each view commits independently; if any regresses, revert just that scoping block (CSS is additive, non-destructive). Add a smoke test per view asserting the organic token resolves on `#view-<name>`.
- **Font payload grows** (Fraunces + Source Sans 3 added to the existing Inter + Plus Jakarta Sans + JetBrains Mono `@import`) → Mitigation: Fraunces loaded with `wght@400;500;600` and `ital,opsz` axes; Source Sans 3 with `400;500;600`; caps at ~60 KB gzipped total; the `@import` is cached. Trade-off accepted.
- **`chartColors` callers may have hardcoded `accent: '#0D9488'` fallback that shadows the override** → Mitigation: audit `chart-theme.js` fallback defaults to moss (#4E5D3F) under `body.organic`; the existing fallback only triggers when `getComputedStyle` returns empty (Electron not ready).
- **Aesthetic risk: too many "natural” palettes can read as cluster AI #1 (cream + serif + terracotta)** → Mitigation: use `bone` (#F4EFE6), not cream (#F4F1EA); accent is `moss`, not terracotta; the explicit directive in the spec is "moss, not sage; bone, not cream".
- **Reduced-motion users still see typographic changes** (the breath is killed, grain stays; italic eyebrows stay) → Trade-off: typography isn't motion and shouldn't be disabled; grain opacity is below perception threshold (~0.04 mixed); explicit decision in `accessibility` delta.
- **Rollback explosion** → Mitigation: revert is `git revert` of the CSS commit plus removing `class="organic"` from `<body>` in index.html. Views keep their existing `var(--accent)` references which resolve to the original slate/teal automatically.

## Migration Plan

1. **Foundation (revert-safe)**: Add organic tokens to `main.css` under `body.organic`. Leave `class="organic"` OFF `<body>` initially. Zero visual change. Verify build + 38 tests pass.
2. **Helpers extracted**: Move `sparkline()` → `utils/sparkline.js`, `growthRing()` → `utils/growth-ring.js`. Update `views/dashboard.js` imports. Verify build + tests pass.
3. **Dashboard fixes**: Fix `growthRing()` per D3 (closed disc for N ≤ 14, small gap for N > 14); collapse hero column per D4; remove `|| 'fallback'` per D8 after strings added to `locales/es.js`. Add `class="organic"` to `<body>` so `#view-dashboard` resolves styles. Verify dashboard renders with correction.
4. **Per-view rollout (one commit per view)**: For each of activity / diet / energy / measurements / training / analytics / profile, ensure `#view-<name>` consumes the now-active `body.organic` tokens. Re-skin: card `h3` switches to Fraunces italic 14px (kill `uppercase + letter-spacing: 0.5px`); remove any replicated `.dashboard-card::before` gradient top-bar; verify no inline hex in chart configs. Run `npm test` after each.
5. **Smoke tests added**: For each view, add an assertion that `getComputedStyle($('#view-<name>')).getPropertyValue('--accent')` resolves to the moss hex. Add a `sparkline` shape test (3 points → 1 cubic path).
6. **Sync specs**: After all 8 views pass, sync delta specs to main specs (`openspec sync`) and archive the change.

**Rollback**: `git revert <foundation-commit>` + remove `class="organic"` from `index.html`. The organic tokens vanish from cascade; `:root` slate/teal returns; views still work; smoke tests for organic tokens (added in step 5) need to be skipped or removed.

## Open Questions

- Should the sidebar (global `<nav>`) also adopt organic, or stay clinical to anchor the user? *Leaning: in scope, but deferred to step 4's per-view commit as a single extra edit on `#sidebar` scoping. Decision: include sidebar in this change as a separate per-view-style commit; treat as the 9th "view" for rollout purposes.*
- The hero legend reads "Activo" / "Bajo" — should the dot colors carry tooltips? *Decision: no tooltips in this change; the legend text is sufficient. Revisit in a future "tooltips" change if user requests.*
- Whether to add a `--radius-pill: 100px` token, given `tag` already uses `100px` literally. *Decision: add it, since other views with tags will reference the token; sweep those in step 4.*