# View Lazy Loading

## Purpose

Cargar las vistas bajo demanda mediante `import()` dinámico en vez de imports estáticos en `app.js`, reduciendo el JS parseado en startup y produciendo chunks separados por vista en el build de producción.

## Requirements

### Requirement: Views load on demand

The router in `src/renderer/app.js` SHALL load view modules via dynamic `import()` when the view is first navigated to, instead of static imports at startup. The view registry SHALL map view names to loader functions returning the module.

#### Scenario: Only the active view is loaded
- **WHEN** the application starts on the dashboard
- **THEN** only the dashboard view module SHALL be requested
- **THEN** modules for other views SHALL NOT be loaded until their first navigation

#### Scenario: Navigation loads target view
- **GIVEN** the user is on the dashboard
- **WHEN** the user clicks the `training` nav item
- **THEN** the training module SHALL be dynamically imported
- **THEN** its `init()` function SHALL be called exactly once for that navigation

#### Scenario: Build produces per-view chunks
- **WHEN** `npm run build:web` completes
- **THEN** the Vite output SHALL contain separate chunks for view modules

### Requirement: Navigation during loading is safe

The router SHALL handle rapid navigation while a view module is loading without throwing and without initializing the wrong view.

#### Scenario: Stale load discarded
- **GIVEN** the user clicks view A and immediately clicks view B
- **WHEN** both imports resolve
- **THEN** only view B's `init()` SHALL take effect on the visible container

### Requirement: Load failure shows recoverable error

If a view module fails to load, the router SHALL render the shared error state card with a retry action instead of leaving a blank view.

#### Scenario: Import failure renders error card
- **GIVEN** the dynamic import for a view rejects
- **WHEN** the router handles the rejection
- **THEN** the view container SHALL show the shared error state (`renderStateCard` with `state: 'error'`)
- **THEN** clicking retry SHALL attempt the import again
