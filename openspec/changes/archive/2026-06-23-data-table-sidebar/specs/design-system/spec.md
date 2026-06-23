## MODIFIED Requirements

### Requirement: Design system includes data table component

The system's design system SHALL include the `.data-table` component as a first-class citizen alongside `.card`, `.dashboard-card`, and `.btn`. The component SHALL encompass `.data-table-wrapper`, `.data-table`, `.data-table--sticky-col`, and `.data-table-pagination`.

#### Scenario: Design system documented with data table
- **WHEN** developers reference the design system
- **THEN** `.data-table` SHALL be listed as the standard pattern for tabular data display
- **THEN** deprecated table patterns (`.table-responsive`, `.ranking-table-wrap`, bare `<table>`) SHALL be documented as removed

### Requirement: Design system includes sidebar section component

The system's design system SHALL include the `.nav-section` component for collapsible sidebar section headers with chevron icons and Fraunces italic typography.

#### Scenario: Sidebar section documented
- **WHEN** developers reference the design system
- **THEN** `.nav-section` SHALL be documented as the pattern for grouping nav items in the sidebar
