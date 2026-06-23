# Design System

## Purpose

Establish a unified token-based design system with CSS custom properties for spacing, elevation, z-index, and a CSS-to-JS color bridge for Chart.js. Provide utility classes and component classes so views can replace inline styles with semantic references.
## Requirements
### Requirement: Design token system for spacing, elevation, and z-index

The system SHALL define a unified set of CSS custom properties for spacing (`--space-1` through `--space-8`), elevation (`--shadow-sm`, `--shadow`, `--shadow-md`, `--shadow-lg`), and z-index layering (`--z-1`, `--z-10`, `--z-100`) in the `:root` selector of `src/renderer/styles/base.css`. All views and components SHALL reference these tokens instead of hardcoded pixel values. Under `body.organic`, the elevation tokens (`--shadow`, `--shadow-md`, `--shadow-lg`) SHALL be overridden with moss-tinted rgba shadows to read as a "diffused light" rather than a neutral drop. The CSS SHALL be organized by component in separate files (`base.css`, `layout.css`, `cards.css`, `forms.css`, `tables.css`, `utilities.css`) with `main.css` as an import-only entry point.

#### Scenario: Spacing scale defined in base.css
- **WHEN** a developer opens `src/renderer/styles/base.css`
- **THEN** the `:root` selector SHALL contain `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-6: 24px`, `--space-8: 32px`
- **THEN** existing padding/margin values in the stylesheet SHALL be migrated to use these tokens

#### Scenario: CSS organized by component
- **WHEN** a developer navigates `src/renderer/styles/`
- **THEN** separate files SHALL exist for base, layout, cards, forms, tables, and utilities
- **THEN** `main.css` SHALL contain only `@import` directives

#### Scenario: Elevation tokens defined
- **WHEN** a developer opens `src/renderer/styles/main.css`
- **THEN** the `:root` selector SHALL contain `--shadow-lg` in addition to the existing `--shadow-sm`, `--shadow`, `--shadow-md`

#### Scenario: Organic elevation override
- **WHEN** `body.organic` is active
- **THEN** `--shadow` SHALL include at least one rgba color in the green/brown family (e.g. `rgba(78, 93, 63, 0.04)`) instead of pure `rgba(0,0,0,...)`
- **THEN** shadow blur radius SHALL be larger than the `:root` value to reinforce the soft "diffused light" feel

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
- **THEN** the view SHALL use `class="flex-gap-sm"` instead of `style="display:flex;gap:8px"`

### Requirement: Component classes for repeated card patterns

The system SHALL define component CSS classes for card patterns that appear multiple times across views: `.card-accent` (full-width card with accent background), `.compliance-ok` (green compliance badge), `.compliance-warn` (amber compliance badge), `.metric-trend` (inline trend indicator), `.metric-value-sm` (smaller metric value). Card subtitles SHALL support `<strong>` elements styled with `font-weight: 600` and `color: var(--moss-ink)` for key numeric values.

#### Scenario: Accent card class replaces inline styles
- **WHEN** a view renders a full-width card with the accent background color
- **THEN** the view SHALL use `<div class="card card-accent">` instead of `style="background:var(--accent);color:#fff;grid-column:1/-1"`

#### Scenario: Compliance badge classes replace inline styles
- **WHEN** a view renders a compliance indicator (checkmark with green or amber color)
- **THEN** the view SHALL use `<span class="compliance-ok">` or `<span class="compliance-warn">` instead of `style="font-size:11px;color:var(--success)"`

#### Scenario: Strong text in card subtitles
- **WHEN** a card subtitle contains `<strong>` wrapped numbers
- **THEN** the strong text SHALL render in moss-ink with 600 font weight

### Requirement: Organic token override block behind `body.organic`

The system SHALL declare an organic token override block scoped to `body.organic` in `src/renderer/styles/main.css`. The block SHALL re-point existing semantic variables (`--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--text-primary`, `--text-secondary`, `--accent`, `--accent-hover`, `--accent-light`, `--danger`, `--success`, `--border`) to organic values; introduce new named variables (`--bone`, `--smoke`, `--paper`, `--moss`, `--moss-ink`, `--moss-mist`, `--ember`, `--ink`, `--lichen`); introduce `--font-display` (Fraunces) and `--font-body` (Source Sans 3) and `--ease-organic` cubic-bezier; raise `--radius` to 14px and `--radius-sm` to 10px under the override; and re-define elevation shadows with moss-tinted rgba. The `:root` defaults SHALL remain so removing `class="organic"` from `<body>` reverts the cascade.

#### Scenario: Override block present once
- **WHEN** a developer searches `src/renderer/styles/main.css` for `body.organic`
- **THEN** exactly one selector block SHALL match
- **THEN** that block SHALL contain all semantic variable redefinitions plus the 9 named palette variables plus `--font-display`, `--font-body`, `--ease-organic`

#### Scenario: Override is invertible
- **WHEN** `<body>` has `class="organic"` removed
- **THEN** all `var(--accent)` references SHALL resolve to the `:root` value (slate/teal)
- **THEN** all `.dashboard-card` h3 text SHALL render in Inter, not Fraunces

#### Scenario: Typography tokens declared
- **WHEN** `body.organic` is active
- **THEN** `--font-display` SHALL resolve to `'Fraunces', Georgia, serif`
- **THEN** `--font-body` SHALL resolve to `'Source Sans 3', 'Inter', sans-serif`
- **THEN** `--ease-organic` SHALL resolve to `cubic-bezier(.2, .85, .25, 1)`

### Requirement: Pill radius token

The system SHALL introduce `--radius-pill: 100px` in `:root` so existing `.tag` rules (and future pill-styled elements) reference a token instead of a literal `100px`.

#### Scenario: Tag uses pill token
- **WHEN** `.tag` declares its `border-radius`
- **THEN** the value SHALL be `var(--radius-pill)`
- **THEN** no literal `100px` SHALL remain in the `.tag` rule

### Requirement: Dashboard cards adjust to content without blank gaps

The system SHALL style dashboard grid rows so that cards size to their content without leaving large empty grid tracks. The `.dashboard-grid` SHALL use `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` but rows SHALL be structured so that the last row fills completely or the remaining tracks are eliminated. Cards SHALL NOT stretch to fill empty tracks when their content is shorter. The kcal/día trend chart SHALL be the last full-width element on the dashboard.

#### Scenario: No empty grid tracks between sections
- **WHEN** the dashboard renders with a mix of full-width and auto-fill cards
- **THEN** no visible blank space SHALL appear between the last auto-fill card in a row and the next section
- **THEN** the grid SHALL not leave empty tracks wider than 0px beside the last card in a partial row

#### Scenario: Cards size to content
- **WHEN** a dashboard card has less content than its row siblings
- **THEN** the card height SHALL be determined by its own content
- **THEN** the card SHALL NOT stretch to match the tallest sibling unless they share the same grid row

### Requirement: Sidebar header typography for app name and user name

The system SHALL style the sidebar header to display the app name and user profile name with appropriate visual hierarchy. The app name (`<h1>`) SHALL be the primary typographic element, and the user name subtitle SHALL be secondary. Under `body.organic`, the sidebar header SHALL use the organic font pair (Fraunces for the app name, Source Sans 3 for the user name) to match the rest of the organic design system.

#### Scenario: App name is visually primary
- **WHEN** the sidebar header renders
- **THEN** the `<h1>` app name SHALL have a larger font size and heavier weight than the subtitle
- **THEN** the app name SHALL use the display font under `body.organic`

#### Scenario: User name is visually secondary
- **WHEN** the sidebar header renders
- **THEN** the user name subtitle SHALL have a smaller font size and lighter weight than the `<h1>`
- **THEN** the user name SHALL use the body font under `body.organic`

#### Scenario: Collapsed sidebar hides user name
- **WHEN** the sidebar is in collapsed mode (below 900px)
- **THEN** the user name subtitle SHALL be hidden (`display: none`)
- **THEN** the app name `<h1>` SHALL remain visible at a reduced size

### Requirement: Design system includes data table component

The system's design system SHALL include the `.data-table` component as a first-class citizen alongside `.card`, `.dashboard-card`, and `.btn`. The component SHALL encompass `.data-table-wrapper`, `.data-table`, `.data-table--sticky-col`, and `.data-table-pagination`.

#### Scenario: Design system documented with data table
- **WHEN** developers reference the design system
- **THEN** `.data-table` SHALL be listed as the standard pattern for tabular data display
- **THEN** deprecated table patterns (`.table-responsive`, `.ranking-table-wrap`, bare `<table>`) SHALL be documented as removed

### Requirement: Design system includes sidebar section component

The system's design system SHALL include the `.nav-section` component for collapsible sidebar section headers with chevron icons and Fraunces italic typography.

#### Scenario: Sidebar section documented
- **WHEN** developers reference the design system
- **THEN** `.nav-section` SHALL be documented as the pattern for grouping nav items in the sidebar

