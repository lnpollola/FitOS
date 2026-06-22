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
