## Why

The FitOS UI has a solid foundation (design tokens, safeCall wrappers, Chart.js cleanup) but suffers from 9 detectable gaps that prevent it from feeling like a professional desktop product: blank regions during async loads (High severity per ui-ux-pro-max skill), emojis used as sport icons, ~40 inline styles per view, no keyboard/focus navigation, silent error swallowing via `safeCall → null → '--'`, hardcoded chart colors, and no responsive behavior outside the analytics grid. The ui-ux-pro-max skill diagnosed the app as a **Data-Dense Dashboard** pattern and generated a design system persisted at `design-system/fitos/MASTER.md`. This change implements the resulting 7-stage improvement plan to close those gaps systematically.

## What Changes

- **Design tokens unified**: spacing scale (--space-1..--space-8), z-index scale, elevation tokens, and a CSS→JS color bridge (`utils/chart-theme.js`) so Chart.js reads the same `--accent`/`--text-secondary` variables as the rest of the app. Eliminates hardcoded hex in chart JS.
- **Async loading states**: skeleton placeholders (animated pulse) per card during `await`, replacing the current blank-region pattern. `Promise.all` → `Promise.allSettled` with incremental card rendering so the dashboard streams in instead of blocking. Loading buttons (`data-loading="true"`) on imports/saves with disabled + spinner. `aria-live="polite"` on async regions for screen readers.
- **SVG iconography**: replace all emoji icons (`SPORT_ICONS…🏅`, `✓` unicode) with Lucide SVG icons. New `utils/sport-icons.js` returns SVG strings per sport type. Compliance indicators (✓/arrows) become SVG with semantic colors.
- **Accessibility (a11y)**: `:focus-visible` outlines on nav items and interactive elements, keyboard handlers (Enter/Space) on sidebar navigation, `aria-current="page"` on active nav, `role="navigation"` + `aria-label` on sidebar, `<label>`/`aria-label` on all form inputs.
- **Inline styles → classes**: migrate ~40 inline `style="..."` in dashboard.js (and similar in other views) to utility classes (`.text-xs`, `.text-sm`, `.flex-gap-sm`) and component classes (`.card-accent`, `.compliance-ok`, `.compliance-warn`, `.metric-trend`). Eliminates inline styling; enables theming.
- **Explicit empty/error states**: three-state card model (loading / empty / error) replacing silent `'--'` fallbacks. Error cards show message + "Reintentar" button with `role="alert"`. Empty cards show guidance + primary action.
- **Responsive density**: 3 breakpoints (compact <900px, normal 900-1280, wide >1280), collapsible sidebar in compact mode, density toggle (comfortable/compact) in settings affecting card padding.
- **UI polish**: remove `transform: translateY(-1px)` hover (causes layout shift) → box-shadow + border-color transitions; chart tooltip theming with card background; subtle grid lines (`#F1F5F9`); staggered card fade-in via `animation-delay`; `pointRadius: 0` with `pointHoverRadius: 5`.
- **BREAKING**: none. All changes are additive or refactoring of existing rendering paths. No IPC contract changes, no DB schema changes, no locale key removals.

## Capabilities

### New Capabilities
- `design-system`: Tokens (spacing, elevation, z-index), CSS→JS color bridge for Chart.js, utility and component class library. Foundation for all other stages.
- `loading-states`: Skeleton placeholders per card, streaming render via `Promise.allSettled`, loading button states, `aria-live` regions for async updates.
- `iconography`: SVG icon system (Lucide-based), sport-specific icon mapper, compliance/status indicator icons replacing emojis.
- `accessibility`: Focus-visible states, keyboard navigation, ARIA roles/labels, form control labeling, `prefers-reduced-motion` extensions.
- `ui-polish`: Microinteraction refinements (stable hovers, staggered animations), chart visual polish (tooltips, grid, points), pre-delivery checklist enforcement.

### Modified Capabilities
- `error-handling`: Add explicit empty-state and error-state rendering requirements (loading/empty/error tri-state) on top of existing `safeCall` wrapper. Errors must surface to the user with retry, not be silenced as `'--'`.
- `desktop-app`: Add responsive layout requirements (3 breakpoints, collapsible sidebar) and accessibility requirements for the navigation sidebar (focus, keyboard, `aria-current`).
- `spanish-ui`: Add locale key requirements for loading, empty-state, and error-state strings (skeletons, "Sin datos", "Reintentar", "Error al cargar").

## Impact

- **Frontend renderer** (`src/renderer/`): all 8 views (`dashboard.js`, `activity.js`, `diet.js`, `measurements.js`, `training.js`, `adaptive.js`, `analytics.js`, `profile.js`) — skeleton injection, class migration, icon replacement, aria attributes.
- **Styles** (`src/renderer/styles/main.css`): new tokens, utility classes, component classes, focus-visible rules, responsive breakpoints, skeleton keyframes. ~200-300 lines added.
- **Utils** (`src/renderer/utils/`): new `chart-theme.js`, `sport-icons.js`, `skeleton.js` (skeleton HTML generators), `state-card.js` (tri-state card renderer). Existing `safe-call.js` unchanged.
- **Locales** (`src/renderer/locales/es.js`): new string keys for loading/empty/error states (~30-40 keys added under `strings.states.*`).
- **Router** (`src/renderer/app.js`): keyboard handlers on nav, `aria-current` update in `showView`.
- **HTML** (`src/renderer/index.html`): `role="navigation"`, `aria-label` on sidebar, semantic `<button>` wrappers for nav items.
- **No backend changes**: zero IPC handler changes, zero DB schema changes, zero preload changes. Pure renderer-layer refactor.
- **Dependencies**: adds `lucide` (SVG icon library, ~50KB tree-shaken) as a devDependency. No other new deps.
- **Tests** (`tests/`): new smoke tests for skeleton rendering, icon presence (no emojis in rendered HTML), focus-visible class application, tri-state card rendering. Existing 22 tests must still pass.
- **Design system artifact**: `design-system/fitos/MASTER.md` already persisted by ui-ux-pro-max skill — serves as visual source of truth. Page overrides created in `design-system/fitos/pages/` per view during implementation.
