## ADDED Requirements

### Requirement: Dashboard cards adjust to content without blank gaps

The system SHALL style dashboard grid rows so that cards size to their content without leaving large empty grid tracks. The `.dashboard-grid` SHALL use `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` but rows SHALL be structured so that the last row fills completely or the remaining tracks are eliminated. Cards SHALL NOT stretch to fill empty tracks when their content is shorter. The kcal/día trend chart SHALL be the last full-width element on the dashboard.

#### Scenario: No empty grid tracks between sections
- **WHEN** the dashboard renders with a mix of full-width and auto-fill cards
- **THEN** no visible blank space SHALL appear between the last auto-fill card in a row and the next section
- **THEN** the grid SHALL not leave empty tracks wider than 0px beside the last card in a partial row

#### Scenario: Cards size to content
- **WHEN** a dashboard card has less content than its row siblings
- **THEN** the card height SHALL be determined by its own content
- **THEN** the card SHALL NOT stretch to match the tallest sibling unless they share the same grid row

### Requirement: Sidebar header typography for app name and user name

The system SHALL style the sidebar header to display the app name and user profile name with appropriate visual hierarchy. The app name (`<h1>`) SHALL be the primary typographic element, and the user name subtitle SHALL be secondary. Under `body.organic`, the sidebar header SHALL use the organic font pair (Fraunces for the app name, Source Sans 3 for the user name) to match the rest of the organic design system.

#### Scenario: App name is visually primary
- **WHEN** the sidebar header renders
- **THEN** the `<h1>` app name SHALL have a larger font size and heavier weight than the subtitle
- **THEN** the app name SHALL use the display font under `body.organic`

#### Scenario: User name is visually secondary
- **WHEN** the sidebar header renders
- **THEN** the user name subtitle SHALL have a smaller font size and lighter weight than the `<h1>`
- **THEN** the user name SHALL use the body font under `body.organic`

#### Scenario: Collapsed sidebar hides user name
- **WHEN** the sidebar is in collapsed mode (below 900px)
- **THEN** the user name subtitle SHALL be hidden (`display: none`)
- **THEN** the app name `<h1>` SHALL remain visible at a reduced size
