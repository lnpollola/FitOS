## ADDED Requirements

### Requirement: Design token system for spacing, elevation, and z-index

The system SHALL define a unified set of CSS custom properties for spacing (`--space-1` through `--space-8`), elevation (`--shadow-sm`, `--shadow`, `--shadow-md`, `--shadow-lg`), and z-index layering (`--z-1`, `--z-10`, `--z-100`) in the `:root` selector of `src/renderer/styles/main.css`. All views and components SHALL reference these tokens instead of hardcoded pixel values.

#### Scenario: Spacing scale defined
- **WHEN** a developer opens `src/renderer/styles/main.css`
- **THEN** the `:root` selector SHALL contain `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-6: 24px`, `--space-8: 32px`
- **THEN** existing padding/margin values in the stylesheet SHALL be migrated to use these tokens

#### Scenario: Elevation tokens defined
- **WHEN** a developer opens `src/renderer/styles/main.css`
- **THEN** the `:root` selector SHALL contain `--shadow-lg` in addition to the existing `--shadow-sm`, `--shadow`, `--shadow-md`

#### Scenario: Z-index scale defined
- **WHEN** a developer opens `src/renderer/styles/main.css`
- **THEN** the `:root` selector SHALL contain `--z-1: 1`, `--z-10: 10`, `--z-100: 100`
- **THEN** the sidebar `z-index: 10` SHALL be migrated to `z-index: var(--z-10)`

### Requirement: CSS-to-JS color bridge for Chart.js

The system SHALL provide a `src/renderer/utils/chart-theme.js` module that reads CSS custom properties at render time and exposes a `chartColors` object consumed by all Chart.js instances. This eliminates hardcoded hex color values in view JavaScript files.

#### Scenario: Chart colors read from CSS variables
- **WHEN** a Chart.js instance is created in any view
- **THEN** the chart configuration SHALL reference colors from `chartColors` (imported from `utils/chart-theme.js`) instead of hardcoded hex strings like `'#0D9488'` or `'#64748B'`

#### Scenario: chart-theme.js reads computed styles
- **WHEN** `chart-theme.js` is imported and `chartColors` is accessed
- **THEN** the module SHALL read `getComputedStyle(document.documentElement).getPropertyValue('--accent')` and map it to `chartColors.accent`
- **THEN** the module SHALL map `--text-secondary` to `chartColors.textSecondary`, `--border` to `chartColors.grid`, `--warning` to `chartColors.warning`, `--success` to `chartColors.success`, `--danger` to `chartColors.danger`

#### Scenario: Fallback colors when CSS variables unavailable
- **WHEN** `getComputedStyle` returns an empty string for a CSS variable (e.g., during web mode without Electron or before DOM ready)
- **THEN** `chart-theme.js` SHALL fall back to hardcoded defaults matching the `:root` values (`#0D9488` for accent, `#64748B` for text-secondary, `#E2E8F0` for grid)

#### Scenario: No hardcoded hex in view chart code
- **WHEN** a developer searches `src/renderer/views/*.js` for hex color patterns (`#[0-9A-Fa-f]{6}`)
- **THEN** zero matches SHALL exist in chart configuration objects (borderColor, backgroundColor, grid color, tick color)

### Requirement: Utility class library for text sizing and layout

The system SHALL extend the existing utility classes in `main.css` with text-size utilities (`.text-xs` 12px, `.text-sm` 13px) and flex utilities (`.flex-gap-sm` gap 8px) so views can replace inline `style="font-size:..."` declarations with class references.

#### Scenario: Text size utilities available
- **WHEN** a view needs to render text at 12px or 13px
- **THEN** the view SHALL use `.text-xs` or `.text-sm` class instead of `style="font-size:12px"` or `style="font-size:13px"`

#### Scenario: Flex gap utility available
- **WHEN** a view needs a flex row with 8px gap
- **THEN** the view SHALL use `.flex.flex-gap-sm` classes instead of `style="display:flex;gap:8px"`

### Requirement: Component classes for repeated card patterns

The system SHALL define component CSS classes for card patterns that appear multiple times across views: `.card-accent` (full-width card with accent background), `.compliance-ok` (green compliance badge), `.compliance-warn` (amber compliance badge), `.metric-trend` (inline trend indicator), `.metric-value-sm` (smaller metric value).

#### Scenario: Accent card class replaces inline styles
- **WHEN** a view renders a full-width card with the accent background color
- **THEN** the view SHALL use `<div class="card card-accent">` instead of `style="background:var(--accent);color:#fff;grid-column:1/-1"`

#### Scenario: Compliance badge classes replace inline styles
- **WHEN** a view renders a compliance indicator (checkmark with green or amber color)
- **THEN** the view SHALL use `<span class="compliance-ok">` or `<span class="compliance-warn">` instead of `style="font-size:11px;color:var(--success)"`
