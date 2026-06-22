# Design System

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Design token system for spacing, elevation, and z-index

The system SHALL define a unified set of CSS custom properties for spacing (`--space-1` through `--space-8`), elevation (`--shadow-sm`, `--shadow`, `--shadow-md`, `--shadow-lg`), and z-index layering (`--z-1`, `--z-10`, `--z-100`) in the `:root` selector of `src/renderer/styles/main.css`. All views and components SHALL reference these tokens instead of hardcoded pixel values. Under `body.organic`, the elevation tokens (`--shadow`, `--shadow-md`, `--shadow-lg`) SHALL be overridden with moss-tinted rgba shadows to read as a "diffused light" rather than a neutral drop.

#### Scenario: Spacing scale defined
- **WHEN** a developer opens `src/renderer/styles/main.css`
- **THEN** the `:root` selector SHALL contain `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-6: 24px`, `--space-8: 32px`
- **THEN** existing padding/margin values in the stylesheet SHALL be migrated to use these tokens

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