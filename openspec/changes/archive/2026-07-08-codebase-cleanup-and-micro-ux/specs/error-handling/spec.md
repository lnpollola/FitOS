## MODIFIED Requirements

### Requirement: safeCall wrapper for all IPC calls

All IPC calls in renderer views SHALL use the `safeCall()` wrapper or have explicit `.catch()` handlers. No IPC call SHALL be made without error handling. This ensures consistent error behavior across all views.

#### Scenario: Dashboard IPC calls have error handling
- **WHEN** `dashboard.js` makes IPC calls
- **THEN** every promise SHALL have `.catch(() => null)` or be wrapped in `safeCall()`
- **THEN** `api.getDashboardData()` SHALL have `.catch(() => null)` (currently missing)

#### Scenario: Goals IPC calls use safeCall
- **WHEN** `goals.js` makes IPC calls
- **THEN** `api.getGoalProgress()` SHALL use `safeCall()` instead of try/catch
- **THEN** `api.archiveGoal()` SHALL use `safeCall()` or have try/catch (currently has none)

#### Scenario: Consistent error handling pattern
- **WHEN** any renderer view makes an IPC call
- **THEN** the call SHALL either use `safeCall(promise, defaultValue)` or have `.catch(() => defaultValue)`
- **THEN** no unhandled promise rejection SHALL occur from IPC calls
