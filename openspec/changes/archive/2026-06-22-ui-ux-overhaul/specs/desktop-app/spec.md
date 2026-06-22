## ADDED Requirements

### Requirement: Responsive layout with breakpoints

The application SHALL support three responsive breakpoints: compact (max-width: 900px), normal (901px–1280px), and wide (min-width: 1281px). Grid layouts, card sizes, and sidebar behavior SHALL adapt at each breakpoint. No horizontal scroll SHALL occur at any width down to 375px.

#### Scenario: Compact mode collapses sidebar to icons
- **WHEN** the window width is 900px or less
- **THEN** the sidebar SHALL collapse to icon-only mode (width ~48px) via a `.sidebar-collapsed` class
- **THEN** nav item text SHALL be hidden (only SVG icons visible)
- **THEN** a tooltip or `aria-label` SHALL provide the full label for each nav button

#### Scenario: Normal mode shows full sidebar
- **WHEN** the window width is between 901px and 1280px
- **THEN** the sidebar SHALL display at full width (220px) with text labels
- **THEN** dashboard grids SHALL use `minmax(200px, 1fr)` for card columns

#### Scenario: Wide mode uses larger grid
- **WHEN** the window width is 1281px or more
- **THEN** the sidebar SHALL display at full width (220px)
- **THEN** dashboard grids SHALL use `minmax(240px, 1fr)` for card columns, allowing more columns per row

#### Scenario: No horizontal scroll at 375px
- **WHEN** the window is resized to 375px width
- **THEN** no horizontal scrollbar SHALL appear in the main content area
- **THEN** all cards and charts SHALL fit within the viewport (charts may reduce height)

### Requirement: Collapsible sidebar with icon-only mode

The sidebar SHALL support a collapsed state where only icons are shown (width ~48px). The collapse SHALL be triggered automatically by window width (below 900px) and optionally by a manual toggle button. The collapsed sidebar SHALL preserve keyboard navigation and aria-labels.

#### Scenario: Sidebar collapses on narrow window
- **WHEN** the user resizes the window below 900px
- **THEN** the sidebar SHALL add `.sidebar-collapsed` class
- **THEN** the sidebar width SHALL transition to ~48px
- **THEN** nav button text SHALL be hidden via CSS (`font-size: 0` or `display: none` on the text span)

#### Scenario: Collapsed sidebar shows icons
- **WHEN** the sidebar is in collapsed mode
- **THEN** each nav button SHALL display its SVG icon (from the iconography system)
- **THEN** each nav button SHALL have an `aria-label` with the full Spanish label for screen readers

#### Scenario: Collapsed sidebar expands on wide window
- **WHEN** the user resizes the window above 900px
- **THEN** the sidebar SHALL remove `.sidebar-collapsed` class
- **THEN** the sidebar SHALL transition back to 220px width with text labels visible

## MODIFIED Requirements

### Requirement: Navigation layout with sidebar

The application SHALL render a single-page layout with a left sidebar navigation and a main content area. The sidebar SHALL be responsive (collapsible to icon-only mode below 900px) and accessible (semantic buttons, aria-current, keyboard navigable).

#### Scenario: Sidebar shows domain navigation
- **WHEN** the application is running
- **THEN** the navigation SHALL appear as a left sidebar with labeled navigation items: Panel, Actividad, Plan de Dieta, Balance Energético, Mediciones Corporales, Entrenamiento de Fuerza, Tendencias, Perfil y Ajustes
- **THEN** each navigation item SHALL be a `<button>` element inside a `<li>` for keyboard accessibility

#### Scenario: Clicking a nav item switches the main view
- **WHEN** a user clicks a navigation item (or activates it via keyboard Enter/Space)
- **THEN** the main content area SHALL display the corresponding domain view without reloading the window
- **THEN** the activated nav item SHALL receive `aria-current="page"` attribute
- **THEN** the previously active nav item SHALL lose `aria-current="page"`
