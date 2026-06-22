# Spanish UI

## ADDED Requirements

### Requirement: Dashboard hero legend Spanish strings

The system SHALL provide Spanish locale keys for the dashboard hero card's legend and supporting copy in the `strings.dashboard` domain of `src/renderer/locales/es.js`. The keys SHALL be: `dashboard.avgDay` ("Promedio diario"), `dashboard.noBalanceData` ("Sin balance todavía"), `dashboard.daysActive` ("Activo"), `dashboard.daysLow` ("Bajo"), `dashboard.days` ("días"). Views SHALL reference these keys directly without inline `strings.dashboard.X || 'fallback'` defensive `||` operators.

#### Scenario: Hero legend keys present
- **WHEN** a developer opens `src/renderer/locales/es.js`
- **THEN** the `dashboard` object SHALL contain `avgDay`, `noBalanceData`, `daysActive`, `daysLow`, and `days` keys
- **THEN** the values SHALL be Spanish strings

#### Scenario: Hero legend renders Spanish
- **WHEN** the dashboard hero card renders its legend
- **THEN** the moss dot legend entry SHALL read "Activo" via `strings.dashboard.daysActive`
- **THEN** the ember dot legend entry SHALL read "Bajo" via `strings.dashboard.daysLow`
- **THEN** the hero subtitle day count SHALL use `strings.dashboard.days` as the unit suffix

#### Scenario: No fallback strings in dashboard.js
- **WHEN** a developer searches `src/renderer/views/dashboard.js` for `|| 'fallback'` or `|| "fallback"` patterns
- **THEN** zero matches SHALL exist for hero-related strings (`avgDay`, `noBalanceData`, `daysActive`, `daysLow`, `days`)
- **THEN** all such references SHALL be direct `strings.dashboard.X` lookups