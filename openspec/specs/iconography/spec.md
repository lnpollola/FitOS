# Iconography

## Purpose

Replace all emoji-based UI icons with SVG icons from the Lucide library via a centralized icon utility. Provide a sport-specific icon mapper and compliance/status indicator icons.

## Requirements

### Requirement: SVG icon system via Lucide

The system SHALL use SVG icons from the Lucide icon library for all UI icons. No emoji characters SHALL be used as UI icons in any rendered HTML. The system SHALL provide `src/renderer/utils/icons.js` exporting an `icon(name, size)` function that returns an SVG string for a named Lucide icon.

#### Scenario: Icon utility returns SVG strings
- **WHEN** a view calls `icon('check', 16)`
- **THEN** the function SHALL return an SVG string with `viewBox="0 0 24 24"`, `width="16"`, `height="16"`, and the Lucide check icon path
- **THEN** the SVG SHALL inherit color via `currentColor` (no hardcoded fill)

#### Scenario: No emojis in rendered HTML
- **WHEN** a developer searches the rendered DOM of any view for emoji characters used as icons (sport icons, checkmarks, arrows, status indicators)
- **THEN** zero emoji characters SHALL be present in icon positions
- **THEN** all icons SHALL be SVG elements or SVG strings

#### Scenario: Lucide dependency added
- **WHEN** a developer checks `package.json`
- **THEN** `lucide` SHALL be listed in `devDependencies`
- **THEN** only specific icons SHALL be imported (tree-shaken), not the entire library

### Requirement: Sport-specific icon mapper

The system SHALL provide `src/renderer/utils/sport-icons.js` that maps each `sport_type` value to a Lucide icon name. The mapper SHALL return an SVG string for a given sport type, with a fallback to the `activity` icon for unmapped types.

#### Scenario: Known sport types have distinct icons
- **WHEN** `sportIcon('running')` is called
- **THEN** the function SHALL return an SVG of the Lucide `footprints` icon
- **WHEN** `sportIcon('cycling')` is called
- **THEN** the function SHALL return an SVG of the Lucide `bike` icon
- **WHEN** `sportIcon('swimming')` is called
- **THEN** the function SHALL return an SVG of the Lucide `waves` icon

#### Scenario: Unknown sport types fall back to generic icon
- **WHEN** `sportIcon('unknown_sport')` is called
- **THEN** the function SHALL return an SVG of the Lucide `activity` icon as fallback
- **THEN** no error SHALL be thrown

#### Scenario: Dashboard activity cards use SVG sport icons
- **WHEN** the dashboard renders the per-sport activity cards (`dashboard.js` activity row)
- **THEN** each card SHALL display the SVG sport icon from `sportIcon(a.sport_type)` instead of the emoji from `SPORT_ICONS[a.sport_type]`

### Requirement: Compliance and status indicator icons

Compliance indicators (checkmarks for meeting goals, warnings for below-target) and trend arrows SHALL use SVG icons instead of unicode characters (✓, ↑, ↓, →).

#### Scenario: Compliance check uses SVG
- **WHEN** a view renders a compliance indicator showing a goal was met
- **THEN** the indicator SHALL use `icon('check', 14)` wrapped in a `.compliance-ok` span instead of the unicode `✓` character

#### Scenario: Trend arrows use SVG
- **WHEN** a view renders a weight trend indicator (up, down, flat)
- **THEN** the indicator SHALL use `icon('arrow-up', 12)`, `icon('arrow-down', 12)`, or `icon('minus', 12)` instead of unicode arrow characters
- **THEN** the arrow color SHALL be set via CSS class (`.trend-up` → `var(--danger)`, `.trend-down` → `var(--success)`, `.trend-flat` → `var(--text-secondary)`)

### Requirement: Distinct dashboard navigation icon

The system SHALL use a distinct Lucide icon for the dashboard (Panel) navigation item, different from the activity (Actividad) navigation item's `Activity` icon. The dashboard nav item SHALL use the `LayoutDashboard` icon. No two navigation items SHALL share the same icon. The icon SHALL be registered in `src/renderer/utils/icons.js` and mapped in the `iconMap` in `src/renderer/app.js`.

#### Scenario: Dashboard nav icon is LayoutDashboard
- **WHEN** the sidebar renders nav icons
- **THEN** the dashboard nav item (`data-view="dashboard"`) SHALL display the Lucide `LayoutDashboard` icon
- **THEN** the dashboard nav icon SHALL be visually distinct from the activity nav icon

#### Scenario: Dashboard and activity icons differ
- **WHEN** both the dashboard and activity nav items are rendered
- **THEN** the dashboard nav item SHALL display `LayoutDashboard`
- **THEN** the activity nav item SHALL display `Activity`
- **THEN** the two icons SHALL not be the same SVG

#### Scenario: LayoutDashboard registered in icon utility
- **WHEN** a developer checks `src/renderer/utils/icons.js`
- **THEN** `LayoutDashboard` SHALL be imported from `lucide`
- **THEN** it SHALL be registered under the key `'layout-dashboard'`

#### Scenario: Collapsed sidebar distinguishes dashboard from activity
- **WHEN** the sidebar is in collapsed mode (icon-only, below 900px)
- **THEN** the dashboard and activity nav items SHALL display different icons
- **THEN** a user SHALL be able to visually distinguish between the two items

## ADDED Requirements (2026-06-27 — panel-ux-ui-kpis-summarized)


### Requirement: New Lucide icons for Strava panels

The system SHALL register the following additional Lucide icons in `src/renderer/utils/icons.js` for use by the Strava-style summary panels: `medal` (PR banner badge), `flame` (streak indicator), `target` (weekly goal empty state), `share-2` (streak share button), `chevron-left` (calendar previous month), `chevron-right` (calendar next month), and `arrow-up` / `arrow-down` / `minus` (effort trend indicators — already covered but explicitly re-listed for the effort card). All icons SHALL be tree-shaken imports (only specific icons, not the whole library).

#### Scenario: New icons registered
- **WHEN** a developer reads `src/renderer/utils/icons.js`
- **THEN** `medal`, `flame`, `target`, `share-2`, `chevron-left`, `chevron-right` SHALL be imported from `lucide`
- **THEN** they SHALL be registered under the keys `'medal'`, `'flame'`, `'target'`, `'share-2'`, `'chevron-left'`, `'chevron-right'`

#### Scenario: PR badge icon recolored by rank
- **WHEN** the PR banner renders
- **THEN** `icon('medal', 18)` SHALL be called
- **THEN** the SVG SHALL be wrapped in a span with class `.strava-pr-badge--gold` / `--silver` / `--bronze`
- **THEN** the span's `color` CSS property SHALL be `#D4A437` / `#A8A8A8` / `#A47148` respectively
- **THEN** the SVG SHALL inherit color via `currentColor` (no hardcoded fill)

#### Scenario: Streak flame icon
- **WHEN** the streak header renders with an active streak
- **THEN** `icon('flame', 12)` SHALL be used inside the week status cell
- **THEN** the icon SHALL be inside a span with `color: var(--ember)` (orange)

#### Scenario: Share button icon
- **WHEN** the streak share button renders
- **THEN** `icon('share-2', 14)` SHALL be used as the button's leading icon
- **THEN** the button SHALL have `aria-label="Compartir racha"`

#### Scenario: Calendar navigation icons
- **WHEN** the monthly calendar header renders
- **THEN** `icon('chevron-left', 16)` SHALL be the previous-month button
- **THEN** `icon('chevron-right', 16)` SHALL be the next-month button
- **THEN** both buttons SHALL have `aria-label` set from `strings.stravaPanels.calendar.navPrev` / `navNext`

### Requirement: Trend arrow icons in effort card

The system SHALL use the Lucide `arrow-up`, `arrow-down`, and `minus` icons (already registered for the weight-trend use case) for the relative-effort card's trend indicator. The icon color SHALL be set via the existing `.trend-up` / `.trend-down` / `.trend-flat` classes.

#### Scenario: Effort trend up
- **WHEN** the current-week effort is greater than the previous-week effort
- **THEN** the trend indicator SHALL use `icon('arrow-up', 12)` with class `.trend-up` (red/ember)
- **THEN** the delta number SHALL be positive (e.g., "+67")

#### Scenario: Effort trend down
- **WHEN** the current-week effort is less than the previous-week effort
- **THEN** the trend indicator SHALL use `icon('arrow-down', 12)` with class `.trend-down` (green/success)

#### Scenario: Effort trend flat
- **WHEN** the current and previous week efforts are equal
- **THEN** the trend indicator SHALL use `icon('minus', 12)` with class `.trend-flat` (gray/text-secondary)

### Requirement: Distinct icons for every sport type

The system SHALL map every `sport_type` value in the database to a distinct Lucide icon. The current `SPORT_ICON_MAP` in `src/renderer/utils/sport-icons.js` collapses `paddle`, `football`, `walking`, and `other` to the generic `activity` icon, and maps `boxing` to the same `dumbbell` icon as `strength`. In the monthly calendar grid (introduced in the Strava panels) this collision would make padel indistinguishable from walking, and boxing indistinguishable from strength training. The system SHALL use a unique Lucide icon per sport type, with `circle-dot`, `circle`, `swords`, and `flower-2` as the contextual choices for `paddle`, `football`, `boxing`, and `yoga` respectively.

#### Scenario: Paddle has a distinct icon
- **WHEN** `sportIcon('paddle')` is called
- **THEN** the function SHALL return the Lucide `circle-dot` icon
- **THEN** the icon SHALL NOT equal the icon for `walking`, `other`, or any other sport type
- **THEN** the `circle-dot` icon SHALL be registered as a tree-shaken import in `src/renderer/utils/icons.js`

#### Scenario: Football has a distinct icon
- **WHEN** `sportIcon('football')` is called
- **THEN** the function SHALL return the Lucide `circle` icon
- **THEN** the icon SHALL be visually distinct from `running` (footprints), `cycling` (bike), and `swimming` (waves)

#### Scenario: Boxing icon is distinct from strength
- **WHEN** `sportIcon('boxing')` is called
- **THEN** the function SHALL return the Lucide `swords` icon
- **THEN** the icon SHALL NOT equal the icon for `strength` (dumbbell)
- **THEN** the `swords` icon SHALL be registered as a tree-shaken import in `src/renderer/utils/icons.js`

#### Scenario: Yoga icon is peaceful
- **WHEN** `sportIcon('yoga')` is called
- **THEN** the function SHALL return the Lucide `flower-2` icon
- **THEN** the icon SHALL NOT be a cardio-themed glyph (heart, activity, footprints)
- **THEN** the `flower-2` icon SHALL be registered as a tree-shaken import in `src/renderer/utils/icons.js`

#### Scenario: All sport icons are pairwise distinct
- **WHEN** a developer iterates the 11 known sport types (`running`, `cycling`, `walking`, `swimming`, `yoga`, `HIIT`, `strength`, `football`, `paddle`, `boxing`, `other`) and calls `sportIcon(type)` for each
- **THEN** every returned SVG SHALL have a unique path signature (no two sport types share the same icon)
- **THEN** the only acceptable collision is `walking` and `other`, both falling back to `activity` (documented in the map as an explicit "best-effort" assignment)

## ADDED Requirements (2026-06-27 — summary-insights-view)


### Requirement: New Lucide icons for insights view

The system SHALL register two additional Lucide icons in `src/renderer/utils/icons.js` for use by the new insights view: `sparkles` (sidebar nav item icon) and `lightbulb` (auto-insight card generic icon). Both icons SHALL be tree-shaken imports (only specific icons, not the whole library).

#### Scenario: New icons registered
- **WHEN** a developer reads `src/renderer/utils/icons.js`
- **THEN** `sparkles` and `lightbulb` SHALL be imported from `lucide`
- **THEN** they SHALL be registered under the keys `'sparkles'` and `'lightbulb'`
- **THEN** `icon('sparkles', 18)` SHALL return an SVG string
- **THEN** `icon('lightbulb', 18)` SHALL return an SVG string

#### Scenario: Sidebar insights nav icon
- **WHEN** the sidebar renders
- **THEN** the `app.js` `iconMap` SHALL map `'insights'` to `'sparkles'`
- **THEN** the nav item icon SHALL be the Lucide `sparkles` icon at 18px

#### Scenario: Auto-insight card icons
- **WHEN** an auto-insight card renders with a generic icon
- **THEN** `icon('lightbulb', 18)` SHALL be used
- **THEN** the icon SHALL be positioned to the left of the card text
- **THEN** the icon color SHALL be set via the card's severity class (positive=moss, info=lichen, alert=ember)

### Requirement: Auto-insight card icons use semantic Lucide icons

The system SHALL map each auto-insight template to a specific Lucide icon: best-week-streak → `flame`, HRV deviation → `heart-pulse`, rest-day streak → `bed`, weight direction match → `scale`, sport variety → `layers`, recovery trend → `activity`, WHR improvement → `ruler`, PR week → `medal`. Each icon SHALL be a tree-shaken import in `src/renderer/utils/icons.js`.

#### Scenario: Insight icons are registered
- **WHEN** a developer reads `src/renderer/utils/icons.js`
- **THEN** the following icons SHALL be imported from `lucide`: `flame`, `heart-pulse`, `bed`, `scale`, `layers`, `activity`, `ruler`, `medal`
- **THEN** each SHALL be registered under its kebab-case name
- **THEN** `icon('heart-pulse', 18)` SHALL return an SVG of the heart-pulse icon

#### Scenario: Insight card icon color matches severity
- **WHEN** an insight card has severity `positive`
- **THEN** the icon SHALL be wrapped in a span with `color: var(--moss)`
- **WHEN** severity `info`
- **THEN** the icon SHALL be wrapped in a span with `color: var(--lichen)`
- **WHEN** severity `alert`
- **THEN** the icon SHALL be wrapped in a span with `color: var(--ember)`
