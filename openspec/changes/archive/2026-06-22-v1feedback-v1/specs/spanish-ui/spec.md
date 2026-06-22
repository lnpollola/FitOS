## ADDED Requirements

### Requirement: App name and user profile name locale strings

The system SHALL provide Spanish locale keys for the app name and the user's profile name in `src/renderer/locales/es.js`. The key `strings.appName` SHALL be "FitOS". The key `strings.profileName` SHALL be "Leandro Pollola". These keys SHALL be used in the sidebar header. The profile name SHALL be hardcoded in the locale for now, structured so it can be replaced by profile-driven data in the future.

#### Scenario: App name key present
- **WHEN** a developer opens `src/renderer/locales/es.js`
- **THEN** the `strings` object SHALL contain `appName` with the value "FitOS"
- **THEN** the value SHALL be a plain string without the suffix " - Salud y Rendimiento"

#### Scenario: Profile name key present
- **WHEN** a developer opens `src/renderer/locales/es.js`
- **THEN** the `strings` object SHALL contain `profileName` with the value "Leandro Pollola"

#### Scenario: Sidebar header uses locale keys
- **WHEN** the sidebar header renders
- **THEN** the `<h1>` text SHALL reference `strings.appName`
- **THEN** the subtitle text SHALL reference `strings.profileName`

### Requirement: Dashboard date range labels in Spanish

The system SHALL provide Spanish locale keys for the three dashboard date range options in the `strings.dashboard` domain: `dateRange15d` ("15d"), `dateRange1m` ("1m"), `dateRange3m` ("3m"). The activity view's weekly sport summary SHALL also use these keys for its 7d/15d/1m range buttons where applicable.

#### Scenario: Date range keys present
- **WHEN** a developer opens `src/renderer/locales/es.js`
- **THEN** the `dashboard` object SHALL contain `dateRange15d`, `dateRange1m`, and `dateRange3m` keys with Spanish string values

#### Scenario: Dashboard filter buttons use locale keys
- **WHEN** the dashboard renders date filter buttons
- **THEN** each button label SHALL reference a `strings.dashboard.dateRange*` key
- **THEN** no button label SHALL be hardcoded outside the locale module
