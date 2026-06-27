# Organic Aesthetic

## Purpose

Codify the "libreta de campo de un cuerpo vivo" design direction for FitOS so it stops reading as the default Inter+slate+teal SaaS template. Define the named palette, typographic pair, texture, motion budget, and the one-signature-per-scope rule. This spec is the source of truth that design-system, dashboard-health-metrics, ui-polish, and per-view styling defer to.

## ADDED Requirements

### Requirement: Strava panel classes

The system SHALL provide CSS classes for the new Strava-style summary panels, all using the existing organic palette tokens (moss/bone/ember/ink/lichen) and the existing typographic pair (Fraunces for display, Source Sans 3 for body, JetBrains Mono for tabular). The classes SHALL be defined in `src/renderer/styles/main.css` under the `body.organic` selector. No new CSS custom properties SHALL be introduced.

#### Scenario: Personal-record banner classes
- **WHEN** the PR banner renders
- **THEN** the container SHALL use `.strava-panel.strava-pr-banner`
- **THEN** the badge icon SHALL use `.strava-pr-badge--gold` / `.strava-pr-badge--silver` / `.strava-pr-badge--bronze` with the exact hex values `#D4A437` / `#A8A8A8` / `#A47148` respectively
- **THEN** the label text SHALL use `font-family: var(--font-body)` (Source Sans 3) at 14 px
- **THEN** the time value SHALL use `font-family: var(--font-mono)` (JetBrains Mono) at 18 px

#### Scenario: Weekly goal ring classes
- **WHEN** the weekly-goal ring card renders
- **THEN** the container SHALL use `.strava-panel.strava-weekly-goal`
- **THEN** the ring track SHALL use `stroke: var(--text-secondary); stroke-opacity: 0.2`
- **THEN** the ring fill SHALL use `stroke: var(--success)` (green)
- **THEN** the center icon SHALL be rendered at 32 px via `sportIcon(primarySport, 32)`

#### Scenario: Relative-effort card classes
- **WHEN** the relative-effort card renders
- **THEN** the container SHALL use `.strava-panel.strava-relative-effort`
- **THEN** the current-week value SHALL use one of: `.effort-level--very-high` (#E91E8C), `.effort-level--high` (#FF6B35), `.effort-level--moderate` (#9C27B0), `.effort-level--low` (#B39DDB)
- **THEN** the previous-week value SHALL use `color: var(--text-secondary)`
- **THEN** the trend indicator SHALL use `.effort-trend--up` / `--down` / `--flat` with the Lucide arrow/minus icons at 12 px

#### Scenario: Training-log bubble chart classes
- **WHEN** the training-log chart renders
- **THEN** the container SHALL use `.strava-panel.strava-training-log`
- **THEN** the bubbles SHALL use `.strava-bubble` with `fill: var(--success); fill-opacity: 0.8`
- **THEN** the day-of-week labels SHALL use `font-family: var(--font-body)` at 12 px with `color: var(--text-secondary)`
- **THEN** the duration labels under long sessions SHALL use `font-family: var(--font-mono)` at 11 px

#### Scenario: Monthly calendar classes
- **WHEN** the monthly calendar renders
- **THEN** the container SHALL use `.strava-panel.strava-calendar`
- **THEN** active day cells SHALL use `.strava-calendar-day--active` with `background: var(--paper)` (white) and a sport icon inside
- **THEN** inactive day cells SHALL use `.strava-calendar-day--inactive` with `background: transparent` and the day number
- **THEN** future day cells SHALL use `.strava-calendar-day--future` with `opacity: 0.5` and `pointer-events: none`
- **THEN** the week status column SHALL use `.strava-calendar-week-status--completed` (orange check) / `--active` (orange flame) / `--incomplete` (gray)

#### Scenario: Streak header classes
- **WHEN** the streak header renders
- **THEN** the container SHALL use `.strava-panel.strava-streak`
- **THEN** the big numbers (61, 585) SHALL use `font-family: var(--font-display)` (Fraunces) at 36 px with `font-weight: 500`
- **THEN** the labels ("Semanas", "Actividades") SHALL use `font-family: var(--font-body)` at 12 px italic eyebrow style
- **THEN** the share button SHALL use `.strava-streak-share` with the Lucide `share-2` icon

### Requirement: One-signature-per-scope for Strava panels

The Strava panels SHALL follow the existing one-signature-per-scope rule: each panel has at most one distinctive visual signature (PR banner = badge icon; weekly goal = ring; relative effort = colored number; training log = bubbles; calendar = day cells with icons; streak = large numbers). The panels SHALL NOT introduce a new visual language or a competing signature.

#### Scenario: Distinct signatures per panel
- **WHEN** all 5 Strava panels render side-by-side
- **THEN** each panel SHALL be visually identifiable at a glance (by its signature)
- **THEN** the panel signatures SHALL NOT compete with the existing dashboard signatures (hero growth ring, trend line chart, etc.)
- **THEN** the total visual noise SHALL remain within the "field notebook" aesthetic
