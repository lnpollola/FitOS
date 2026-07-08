## MODIFIED Requirements

### Requirement: Chart destruction on view unmount

All Chart.js chart instances SHALL be properly destroyed when their parent view is unmounted or when charts are recreated. Chart references SHALL be stored on `window` (e.g., `window._stepsChart`) so that the global `destroyAllCharts()` function in `app.js` can find and destroy them. Module-scoped chart variables SHALL NOT be used.

#### Scenario: Tonnage chart destroyed on view unmount
- **WHEN** the user navigates away from the insights view
- **THEN** `window._tonnageChart` SHALL be destroyed (if it exists)
- **THEN** no Chart.js instance SHALL remain in memory after view unmount

#### Scenario: Chart references on window object
- **WHEN** any view creates a Chart.js instance
- **THEN** the reference SHALL be stored on `window` (e.g., `window._tonnageChart`)
- **THEN** the reference SHALL NOT be stored in module scope

#### Scenario: destroyAllCharts catches all charts
- **WHEN** `destroyAllCharts()` is called (e.g., on view switch)
- **THEN** all active Chart.js instances SHALL be destroyed
- **THEN** no orphaned chart instances SHALL remain
