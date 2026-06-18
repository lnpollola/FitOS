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

The system SHALL display elaborated dishes as cards in the diet view, each showing the dish name, total macros, a toggle to expand/collapse ingredient list.

#### Scenario: Dish card with ingredient expansion
- **WHEN** a user views the diet page
- **THEN** the system SHALL show dish cards with name, kcal badge, and expandable ingredient list showing each ingredient name, grams, and macros

#### Scenario: Manage dish from diet view
- **WHEN** a user opens the dish manager
- **THEN** the system SHALL show all dishes with edit, delete, and link-to-meal actions

### Requirement: Dish cards in daily plan view

The system SHALL show available elaborated dishes as options within each of the 5 meal franjas in the daily plan.

#### Scenario: Pre-loaded dish options per meal
- **WHEN** a user opens the daily plan for a date
- **THEN** each of the 5 meal franjas SHALL display pre-loaded card options including any elaborated dishes linked to that meal template
