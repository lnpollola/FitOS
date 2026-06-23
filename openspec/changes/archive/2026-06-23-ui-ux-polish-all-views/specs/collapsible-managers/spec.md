# Collapsible Managers

## ADDED Requirements

### Requirement: Collapsible food manager section

The system SHALL render the food item manager (browser, add/edit, categories) inside a `<details>` element that is collapsed by default. A `<summary>` SHALL display "Gestor de alimentos" with a chevron icon indicating expand/collapse state.

#### Scenario: Food manager collapsed by default
- **WHEN** the diet view loads
- **THEN** the food manager section SHALL be collapsed (hidden content)
- **THEN** the summary SHALL display "Gestor de alimentos" with a right-pointing chevron

#### Scenario: Expand food manager
- **WHEN** user clicks the "Gestor de alimentos" summary
- **THEN** the food manager SHALL expand to show the full food browser, search, and category filters
- **THEN** the chevron SHALL rotate to point down

#### Scenario: Collapse food manager
- **WHEN** user clicks the summary again or clicks outside
- **THEN** the food manager SHALL collapse back
- **THEN** the chevron SHALL rotate back to right-pointing

### Requirement: Collapsible elaborated dishes manager section

The system SHALL render the elaborated dishes manager (create, edit, manage) inside a `<details>` element that is collapsed by default. A `<summary>` SHALL display "Gestor de platos" with a chevron icon.

#### Scenario: Elaborated dishes manager collapsed by default
- **WHEN** the diet view loads
- **THEN** the elaborated dishes section SHALL be collapsed (hidden content)
- **THEN** the summary SHALL display "Gestor de platos" with a right-pointing chevron

#### Scenario: Pre-loaded example dishes visible
- **WHEN** the elaborated dishes manager is expanded
- **THEN** example dishes from seed data SHALL be displayed as dish cards
- **THEN** each example dish SHALL show name, total kcal, and expandable ingredient list

### Requirement: Collapsible sections preserve state during view session

The system SHALL preserve the open/closed state of both collapsible sections for the duration of the view session (until navigation away).

#### Scenario: State preserved while scrolling
- **WHEN** the user expands the food manager, scrolls down, and scrolls back up
- **THEN** the food manager SHALL remain expanded
- **THEN** the browser's native `<details>` open attribute SHALL maintain state
