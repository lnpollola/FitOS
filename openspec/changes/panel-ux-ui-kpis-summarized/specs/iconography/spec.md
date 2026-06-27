# Iconography

## Purpose

Replace all emoji-based UI icons with SVG icons from the Lucide library via a centralized icon utility. Provide a sport-specific icon mapper and compliance/status indicator icons.

## ADDED Requirements

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
