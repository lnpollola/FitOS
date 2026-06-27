# Iconography

## Purpose

Replace all emoji-based UI icons with SVG icons from the Lucide library via a centralized icon utility. Provide a sport-specific icon mapper and compliance/status indicator icons.

## ADDED Requirements

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
