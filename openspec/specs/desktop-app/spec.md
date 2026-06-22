# Desktop Application

## Purpose

Electron desktop application with a single-window interface, native menus, local SQLite storage, and a sidebar-navigation layout.

## Requirements

### Requirement: Electron desktop application shell

The system SHALL run as an Electron desktop application with a single-window interface, native menus, and system integration.

#### Scenario: Application launches as native window
- **WHEN** the user starts the application
- **THEN** the system SHALL open a native desktop window with a title bar, application menu, and the dashboard view loaded

#### Scenario: Application has a native menu bar
- **WHEN** the user clicks the application menu
- **THEN** the system SHALL show menu items for File (data export/import), View (navigate to domains), and Help (about)

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

### Requirement: All data stored locally in SQLite

The system SHALL store all health data in a local SQLite database using better-sqlite3, with no external database or cloud service.

#### Scenario: Data persisted across app restarts
- **WHEN** a user enters data and restarts the application
- **THEN** the data SHALL still be present and displayed in the relevant views

#### Scenario: App works fully offline
- **WHEN** a user runs the application with no internet connection
- **THEN** all features SHALL function normally — data entry, viewing history, calculations — using only locally stored data

### Requirement: Data export and import for backup

The system SHALL allow users to export all their data as a single JSON file and import it back on the same or a different machine.

#### Scenario: Export all data
- **WHEN** a user selects "Export Data" from the File menu or Settings
- **THEN** the system SHALL generate and save a JSON file containing all stored records via a native save dialog

#### Scenario: Import data from backup
- **WHEN** a user selects "Import Data" and chooses a previously exported JSON file via a native open dialog
- **THEN** the system SHALL restore all records from the file, replacing any existing data after user confirmation

### Requirement: Dashboard as the landing view

The system SHALL display a unified dashboard as the default view, showing summary cards from all domains.

#### Scenario: Dashboard shows key metrics
- **WHEN** a user opens the application
- **THEN** the dashboard SHALL display summary cards: today's planned calories, weekly energy balance status, latest weight, latest measurement delta, and next planned workout
