## MODIFIED Requirements

### Requirement: Electron desktop application shell

The system SHALL run as an Electron desktop application with a single-window interface, native menus, and system integration. IPC handlers SHALL be organized in domain-specific modules under `src/main/handlers/` with a single registry in `ipc-handlers.js`.

#### Scenario: Application launches as native window
- **WHEN** the user starts the application
- **THEN** the system SHALL open a native desktop window with a title bar, application menu, and the dashboard view loaded

#### Scenario: Application has a native menu bar
- **WHEN** the user clicks the application menu
- **THEN** the system SHALL show menu items for File (data export/import), View (navigate to domains), and Help (about)

#### Scenario: IPC handlers load from domain modules
- **WHEN** the application starts
- **THEN** `registerIpcHandlers(mainWindow)` in `ipc-handlers.js` SHALL import and delegate to domain handler modules
- **THEN** all IPC channels SHALL function identically to before the split
