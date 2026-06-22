## MODIFIED Requirements

### Requirement: Navigation layout with sidebar

The application SHALL render a single-page layout with a left sidebar navigation and a main content area. The sidebar SHALL be responsive (collapsible to icon-only mode below 900px) and accessible (semantic buttons, aria-current, keyboard navigable). The sidebar header SHALL display the app name "FitOS" as the `<h1>` and the user's profile name as a subtitle below it. The app name SHALL be hardcoded for now, structured so it can be replaced by profile-driven data in the future.

#### Scenario: Sidebar shows domain navigation
- **WHEN** the application is running
- **THEN** the navigation SHALL appear as a left sidebar with labeled navigation items: Panel, Actividad, Plan de Dieta, Balance Energético, Mediciones Corporales, Entrenamiento de Fuerza, Tendencias, Perfil y Ajustes
- **THEN** each navigation item SHALL be a `<button>` element inside a `<li>` for keyboard accessibility

#### Scenario: Sidebar header shows app name and user name
- **WHEN** the application is running
- **THEN** the sidebar header SHALL display "FitOS" as the `<h1>` text
- **THEN** the sidebar header SHALL display "Leandro Pollola" as a subtitle below the app name
- **THEN** the app name SHALL NOT include the redundant suffix " - Salud y Rendimiento"
- **THEN** the subtitle SHALL be the user's profile name, not the tagline "Salud y rendimiento"

#### Scenario: Clicking a nav item switches the main view
- **WHEN** a user clicks a navigation item (or activates it via keyboard Enter/Space)
- **THEN** the main content area SHALL display the corresponding domain view without reloading the window
- **THEN** the activated nav item SHALL receive `aria-current="page"` attribute
- **THEN** the previously active nav item SHALL lose `aria-current="page"`
