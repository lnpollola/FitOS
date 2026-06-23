# Elaborated Dishes

## Purpose

Add a database model and UI for pre-made dishes (platos elaborados) composed of raw ingredient food items. Display dish cards with ingredient breakdown in the diet and daily-plan views.

## Requirements

### Requirement: Elaborated dishes database model

The system SHALL store elaborated dishes in a dedicated `elaborated_dishes` table, with each dish linked to its ingredients via `dish_ingredients` referencing `food_items`, and linked to meal templates via `meal_dish_options`.

#### Scenario: Create an elaborated dish
- **WHEN** a user creates a new elaborated dish named "Arroz con pollo" with 100g arroz, 150g pechuga de pollo, 20g aceite de oliva
- **THEN** the system SHALL save the dish record with computed total macros and create three ingredient links

#### Scenario: Dish macros computed from ingredients
- **WHEN** a dish is saved or displayed
- **THEN** the system SHALL compute `total_kcal`, `total_protein`, `total_carbs`, `total_fat` as the sum of each ingredient's macro contribution based on grams × (macro_per_100g / 100)

#### Scenario: Delete dish cascades ingredients
- **WHEN** a user deletes an elaborated dish
- **THEN** the system SHALL cascade-delete its `dish_ingredients` rows and `meal_dish_options` links

### Requirement: Dish linked at meal level (franja), not slot level

A dish spans multiple meal components (e.g., carb + protein together). The system SHALL link dishes to `meal_templates` via `meal_dish_options`. When a dish is selected for a meal, it replaces all individual component selections for that meal franja.

#### Scenario: Link dish to breakfast
- **WHEN** a user links dish "Tostadas con jamón" to the Desayuno meal template
- **THEN** the system SHALL insert a row in `meal_dish_options` linking the dish to that meal template

#### Scenario: Select dish replaces components
- **WHEN** a user selects "Tostadas con jamón" for Desayuno in the daily plan
- **THEN** the system SHALL use the dish's total macros for the meal and hide individual component slots

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

### Requirement: Dish cards in daily plan view

The system SHALL show available elaborated dishes as options within each of the 5 meal franjas in the daily plan.

#### Scenario: Pre-loaded dish options per meal
- **WHEN** a user opens the daily plan for a date
- **THEN** each of the 5 meal franjas SHALL display pre-loaded card options including any elaborated dishes linked to that meal template

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
