## ADDED Requirements

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
