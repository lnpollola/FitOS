## ADDED Requirements

### Requirement: Collapsible hidden foods manager

The system SHALL wrap the hidden foods section in a `<details>` element, collapsed by default, consistent with the food item manager and elaborated dishes manager. When expanded, hidden food items SHALL display with a "Reactivar" button to restore them to the active food list.

#### Scenario: Hidden foods manager collapsed by default
- **WHEN** the diet view loads
- **THEN** the hidden foods section SHALL be collapsed under a "Gestor de alimentos ocultos" summary with a right-pointing chevron icon
- **THEN** the hidden foods content SHALL NOT be visible until the user expands it

#### Scenario: Expand hidden foods manager
- **WHEN** the user clicks the "Gestor de alimentos ocultos" summary
- **THEN** the hidden foods list SHALL expand showing all hidden food items
- **THEN** the chevron SHALL rotate to point down
- **THEN** each hidden item SHALL display a "Reactivar" button

#### Scenario: Collapse hidden foods manager
- **WHEN** the user clicks the expanded summary
- **THEN** the hidden foods list SHALL collapse
- **THEN** the chevron SHALL rotate back to right-pointing

### Requirement: Fix elaborated dish addition to meal slots

The system SHALL ensure that when a user adds an elaborated dish to a meal slot via the daily plan interface, the dish's ingredients are correctly inserted as `daily_plan_entries` without foreign key violations.

#### Scenario: Add dish to daily plan meal
- **WHEN** the user selects a dish from the "Añadir plato" dropdown for a meal in the daily plan
- **THEN** the dish's ingredients SHALL be inserted into `daily_plan_entries`
- **THEN** the dish's entries SHALL appear in the daily plan render for that meal
- **THEN** no database error or violation SHALL occur

#### Scenario: Dish entries have valid meal context
- **WHEN** dish ingredients are inserted as daily plan entries
- **THEN** each entry SHALL reference the correct `meal_template_id` and `meal_component_id`
- **THEN** the entries SHALL be associated with the correct date and plan

## MODIFIED Requirements

### Requirement: Dish cards in diet view

The system SHALL display elaborated dishes as cards in the diet view, each showing the dish name, total macros, a toggle to expand/collapse ingredient list. The dish manager SHALL be collapsible under a `<details>` element, collapsed by default. The food manager, dish manager, and hidden foods manager SHALL all use the same collapsible pattern.

#### Scenario: Dish card with ingredient expansion
- **WHEN** a user views the diet page
- **THEN** the system SHALL show dish cards with name, kcal badge, and expandable ingredient list showing each ingredient name, grams, and macros

#### Scenario: Manage dish from diet view
- **WHEN** a user opens the dish manager
- **THEN** the system SHALL show all dishes with edit, delete, and link-to-meal actions

#### Scenario: All managers use consistent collapsible pattern
- **WHEN** the diet view loads
- **THEN** the food manager, dish manager, and hidden foods manager SHALL all be collapsed by default under `<details>` elements
- **THEN** each manager's summary SHALL display a consistent chevron icon for expand/collapse state
