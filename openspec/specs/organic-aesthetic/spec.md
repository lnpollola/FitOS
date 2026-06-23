# Organic Aesthetic

## Purpose

Codify the "libreta de campo de un cuerpo vivo" design direction for FitOS so it stops reading as the default Inter+slate+teal SaaS template. Define the named palette, typographic pair, texture, motion budget, and the one-signature-per-scope rule. This spec is the source of truth that design-system, dashboard-health-metrics, ui-polish, and per-view styling defer to.

## Requirements

### Requirement: Named organic palette

The system SHALL define a 9-color named palette that reads as natural-history field-notebook material, not clinical SaaS, in a single `body.organic` (or equivalent feature-flagged) selector in `src/renderer/styles/main.css`. The palette SHALL be: `--bone: #F4EFE6` (page background), `--smoke: #E6E0D2` (secondary surface), `--paper: #FBF7EE` (card surface), `--moss: #4E5D3F` (primary accent), `--moss-ink: #2F3D26` (accent hover / heavy weight), `--moss-mist: #D7DAC7` (accent tint), `--ember: #C75B3B` (danger / deficit), `--ink: #1F1B17` (primary text), `--lichen: #8A8870` (secondary text). The palette SHALL NOT use cream (#F4F1EA) or terracotta accents (the explicit "cluster AI #1" defaults).

#### Scenario: Palette declared once
- **WHEN** a developer opens `src/renderer/styles/main.css`
- **THEN** the `body.organic` selector block SHALL declare all 9 named variables with the exact hex values above
- **THEN** no other selector in `main.css` SHALL redefine those named variables

#### Scenario: Semantic tokens re-pointed to organic palette
- **WHEN** `body.organic` is active on `<body>`
- **THEN** `--accent` SHALL resolve to `var(--moss)`, `--accent-hover` to `var(--moss-ink)`, `--accent-light` to `var(--moss-mist)`, `--danger` to `var(--ember)`, `--bg-primary` to `var(--bone)`, `--bg-secondary` to `var(--paper)`, `--bg-tertiary` to `var(--smoke)`, `--text-primary` to `var(--ink)`, `--text-secondary` to `var(--lichen)`, `--border` to `#D8D2C4`, `--success` to `var(--moss)`

#### Scenario: No cream, no terracotta
- **WHEN** a developer searches `main.css` for the cluster-AI defaults
- **THEN** `--bg-primary` SHALL NOT resolve to `#F4F1EA` or any cream near it
- **THEN** `--accent` SHALL NOT resolve to any terracotta / `#C75B3B` (ember is for danger only, never accent)

### Requirement: Organic typographic pair

The system SHALL use Fraunces (variable, with `opsz` and `ital` axes) as the display face for view titles, large metric values, hero numbers, and card eyebrows, and Source Sans 3 as the humanist body face. JetBrains Mono SHALL remain the instrument face for tabular numeric data only. Inter and Plus Jakarta Sans imports SHALL be removed from `main.css` once migration completes.

#### Scenario: Display face is Fraunces
- **WHEN** any view renders a `.view-title`, hero value, or card eyebrow `h3`
- **THEN** the `font-family` SHALL resolve to `var(--font-display)` → `Fraunces, Georgia, serif`
- **THEN** the eyebrow SHALL use `font-style: italic; font-weight: 500; font-size: 14px` with `text-transform: none; letter-spacing: 0`

#### Scenario: Body face is Source Sans 3
- **WHEN** any view renders body copy, labels, subtitles, legends, or form text
- **THEN** the `font-family` SHALL resolve to `var(--font-body)` → `Source Sans 3, sans-serif`

#### Scenario: Mono face reserved for tabular data
- **WHEN** a view renders tabular numbers inside `<td>` or inside a chart axis
- **THEN** the `font-family` SHALL be `JetBrains Mono`
- **THEN** card `.value` (Fraunces display) SHALL NOT use the mono face

### Requirement: One signature element per scope

The system SHALL enforce a single-signature-per-scope rule: each view MAY carry exactly one memorable signature element (e.g. dashboard's growth ring) and SHALL NOT stack multiple signature-class ornaments (e.g. ring + breath + grain + color-shifting gradient) in the same view. The signature element SHALL embody the brief; everything around it SHALL stay quiet and disciplined.

#### Scenario: Single signature per view
- **WHEN** a developer audits a view for "signature" elements
- **THEN** the view SHALL contain at most one of: an SVG growth ring, a per-view ambient animation, a region-unique hero gradient
- **THEN** the view SHALL NOT combine a hero ring + paper grain + per-card breath + color-shifting card top-bar

#### Scenario: No per-card replication of signature
- **WHEN** a view renders more than one card
- **THEN** the signature decorative element (e.g. ring) SHALL appear on at most one card
- **THEN** other cards SHALL NOT carry a degraded variant of the signature (e.g. faded ring, dot ring, mini-ring)

### Requirement: Paper grain texture

The system SHALL apply a single SVG `feTurbulence`-based grain as a `body.organic::before` overlay over the entire app, with `opacity` ≤ 0.05 and `mix-blend-mode: multiply`. The grain SHALL NOT be replicated per-view.

#### Scenario: Single grain overlay
- **WHEN** the renderer mounts
- **THEN** exactly one `body.organic::before` pseudo-element SHALL render the grain
- **THEN** no `#view-<name>::before` selector SHALL also render a turbulence grain

#### Scenario: Grain disabled at high contrast
- **WHEN** `prefers-contrast: more` is active
- **THEN** the grain overlay SHALL be hidden (`display: none` or `opacity: 0`) so it does not interfere with high-contrast readability

### Requirement: Organic easing curve

The system SHALL define `--ease-organic: cubic-bezier(.2, .85, .25, 1)` as the default easing for organic transitions (card hovers, panel reveals). Linear `ease`/`ease-in-out` SHALL NOT be used for organic interactions.

#### Scenario: Card hover uses organic easing
- **WHEN** a `.dashboard-card` or `.card` declares a `transition`
- **THEN** the `transition-timing-function` SHALL be `var(--ease-organic)`
- **THEN** the duration SHALL be between 200ms and 350ms

### Requirement: Breath motion budget

The system SHALL allow at most one ambient "breath" animation per view (e.g. the hero ring's `scale(1 ↔ 1.012)` loop), with a period ≥ 5 seconds and amplitude ≤ 2% scale. All other ambient motion SHALL be disabled under `prefers-reduced-motion: reduce`.

#### Scenario: Breath bounded
- **WHEN** a view includes a breath animation
- **THEN** the animation duration SHALL be ≥ 5s and ≤ 8s
- **THEN** the scale amplitude SHALL be ≤ 1.02 (2%)
- **THEN** exactly one element per view SHALL carry the breath

#### Scenario: Breath killed under reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** the breath animation SHALL be disabled (`animation: none`)
- **THEN** typography and grain (non-motion) SHALL remain unchanged

### Requirement: Tables use organic typography and palette

The system SHALL apply the organic design tokens (Fraunces for headers, Source Sans 3 for body, moss/bone/ember palette, moss-mist accents) to all data tables via the `.data-table` component. Tables SHALL NOT use the pre-organic default styling (Inter, uppercase headers, solid border-bottom).

#### Scenario: Organic table headers
- **WHEN** a `.data-table` renders
- **THEN** headers SHALL use Fraunces italic 500 at 12px in moss-ink
- **THEN** header background SHALL be moss-mist
- **THEN** no uppercase text-transform SHALL be applied

#### Scenario: Organic table body
- **WHEN** a `.data-table` body renders
- **THEN** cells SHALL use Source Sans 3 at 13px in moss-ink
- **THEN** even rows SHALL use smoke background
- **THEN** odd rows SHALL use paper background

### Requirement: Sidebar sections use organic typography

The system SHALL style sidebar section headers (`.nav-section`) with Fraunces italic at 10px in lichen color, uppercase with `letter-spacing: 0.08em`, consistent with the organic aesthetic's treatment of label text.

#### Scenario: Section header typography
- **WHEN** the sidebar renders with sections
- **THEN** section headers SHALL use Fraunces italic 500
- **THEN** section headers SHALL be uppercase
- **THEN** section headers SHALL use lichen color

### Requirement: Bold subtitle text uses organic hierarchy

The system SHALL style `<strong>` elements within `.dashboard-card .subtitle` with `font-weight: 600` and `color: var(--moss-ink)`, providing a clear visual distinction between key numeric values and descriptive labels within card subtitles.

#### Scenario: Strong emphasis in organic style
- **WHEN** a card subtitle contains `<strong>` text
- **THEN** the strong text SHALL render in moss-ink at 600 weight
- **THEN** surrounding text SHALL remain in lichen at normal weight

