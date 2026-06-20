# Diet Plan Management

## Purpose

Model the diet as a slot-based template (MealTemplate with MealComponent slots and interchangeable FoodItem options), compute meal and daily macros from a food database, and support learn/forget flows.

## Requirements

### Requirement: Model diet as slot-based template

The system SHALL model the diet as a set of MealTemplates (breakfast, mid-morning, lunch, snack, dinner), each composed of MealComponents (slots for carbs, protein, fat, vegetables, fruit, extras), where each slot has a list of interchangeable FoodItem options with specific gram amounts per day type.

#### Scenario: Diet plan created from extracted data
- **WHEN** the user imports their existing diet from the extracted structure (Modelo_DietaRes.md)
- **THEN** the system SHALL create the full diet plan with 5 meals, each with its slots, options, and gram amounts for training and rest days

#### Scenario: View diet plan structure
- **WHEN** a user opens the diet plan view
- **THEN** the system SHALL display the diet as a structured list of meals, each showing its slots, available food options, and gram amounts

### Requirement: Compute meal calories and macros from food database

The system SHALL maintain a food database (FoodItem) with kcal and macros per 100g, and compute the total calories, protein, carbs, and fat for each meal and for the full day.

#### Scenario: Meal calories computed
- **WHEN** a meal is displayed
- **THEN** the system SHALL show the computed total calories and macros for that meal based on the selected options and gram amounts

#### Scenario: Daily totals computed
- **WHEN** a full day plan is displayed
- **THEN** the system SHALL show the sum of all meals' calories and macros, including supplements (creatine 5g, optional protein powder)

### Requirement: Learn new food options

The system SHALL allow the user to add new food items to any meal slot, providing the food name and estimated kcal/macros per 100g, and incorporate them as available options for future planning.

#### Scenario: Add new food to a slot
- **WHEN** a user selects a meal slot and adds a new food option by entering name, kcal, protein, carbs, and fat per 100g
- **THEN** the system SHALL save the new FoodItem, add it to the slot's available options, and make it selectable in future plan views

#### Scenario: System suggests plausible new foods
- **WHEN** a user has logged a custom meal or entered a food name that exists in a common reference
- **THEN** the system SHALL suggest estimated macros for confirmation, which the user can accept or override

### Requirement: Forget/hide unused food options

The system SHALL allow the user to remove food options they no longer cook or eat, hiding them from the active plan to reduce clutter.

#### Scenario: Hide a food option
- **WHEN** a user selects a food option in any slot and marks it as hidden
- **THEN** the system SHALL hide it from the active plan view while retaining it in the database for potential future reactivation

#### Scenario: Reactivate a hidden option
- **WHEN** a user opens the hidden items manager
- **THEN** the system SHALL display all hidden food options with a reactivate button

### Requirement: Adjust gram amounts per slot to change total calories

The system SHALL allow users to manually adjust the gram amount of any meal slot, and automatically recalculate the meal and daily totals.

#### Scenario: Manual gram adjustment
- **WHEN** a user changes the gram amount of a carb slot from 60g to 45g
- **THEN** the system SHALL recalculate the meal's total calories and macros and update the daily totals accordingly

#### Scenario: Adaptive adjustment from fat-loss planning
- **WHEN** the adaptive planning module recommends a deficit change
- **THEN** the system SHALL propose specific slot gram adjustments and allow the user to accept, dismiss, or modify them

### Requirement: Elaborated dishes as meal components

The system SHALL allow elaborated dishes (pre-composed meals from multiple ingredients) to be used as options within meal template slots, alongside individual food items.

#### Scenario: Add elaborated dish to meal slot
- **WHEN** a user opens a meal slot's options
- **THEN** the system SHALL display both individual food items and elaborated dishes as selectable options, with dishes marked with a "🍽 Plato" badge

### Requirement: Dish card UI with ingredient breakdown

The system SHALL display elaborated dishes as cards showing the dish name, total macros, and an expandable ingredient list.

#### Scenario: Expand dish card ingredients
- **WHEN** a user clicks "Ver ingredientes" on a dish card
- **THEN** the system SHALL expand the card to show each ingredient name, grams, and its individual macro contribution

### Requirement: Friendlier food entry interface

The system SHALL provide a more visually organized interface for browsing and adding food items, with search, category filters, and card layout.

#### Scenario: Food browser with categories
- **WHEN** a user opens the food item browser
- **THEN** the system SHALL display food items as filterable cards grouped by category (protein, carb, fat, vegetable, fruit, other) with a search bar

#### Scenario: Add new food with smart defaults
- **WHEN** a user clicks "Nuevo alimento"
- **THEN** the system SHALL show a form with category selector and macro fields, pre-filling typical values based on the selected category

### Requirement: 5-column meal template display

The system SHALL display the 5 meals (Desayuno, Media Mañana, Comida, Merienda, Cena) as columns showing slot breakdown with food options.

#### Scenario: Meal columns render from seeded data
- **WHEN** meal_components and meal_options are populated
- **THEN** the system SHALL display 5 columns, each showing meal name, slot types, gram amounts, and interchangeable food options
- **THEN** each slot SHALL show training day and rest day gram amounts

#### Scenario: User selects food per slot
- **WHEN** a user clicks a food option in a slot
- **THEN** it SHALL be highlighted as selected
- **THEN** the meal's total kcal/macros SHALL update

#### Scenario: Create daily plan from selections
- **WHEN** the user clicks "Usar estas 5 comidas"
- **THEN** the system SHALL create a daily_plan with the selected foods and grams

### Requirement: Extended food seed data (~150 items)

The system SHALL extend the seed food database from 46 to approximately 150 common Spanish foods, sourced from BEDCA/USDA references.

#### Scenario: Seed data expanded
- **WHEN** the app initializes with an empty food_items table
- **THEN** the system SHALL seed approximately 150 food items with accurate kcal and macros per 100g and category coverage

### Requirement: Auto-fill on name entry

The system SHALL auto-fill macro fields when the user types a food name, by searching the existing food_items SQLite table.

#### Scenario: Auto-fill from food_items table
- **WHEN** a user types in the "Nuevo alimento" name field
- **THEN** the system SHALL query `db:searchFoodItems(query)` returning top-5 matches from food_items
- **WHEN** a match is found
- **THEN** the system SHALL auto-fill kcal, protein, carbs, and fat fields

#### Scenario: No match
- **WHEN** no food item matches the query
- **THEN** the system SHALL show "Sin coincidencias — completa los macros manualmente"

### Requirement: Compact food display with pagination

The system SHALL display food items in a paginated table with category pill filters.

#### Scenario: Paginated food table
- **WHEN** the food browser renders
- **THEN** the system SHALL display 20 food items per page with prev/next buttons and page counter

#### Scenario: Category pill filters
- **WHEN** the food browser renders
- **THEN** the system SHALL display category pills (Pan/Prot/Gras/Frut/Verdu/Bebi) at the top
- **WHEN** a user clicks a pill
- **THEN** the table SHALL filter to show only foods in that category

#### Scenario: Compact row format
- **WHEN** the food table renders
- **THEN** each row SHALL show: name, kcal, P, C, F per 100g in a single compact line

### Requirement: Daily plan auto-generator

The system SHALL auto-generate a 5-meal daily plan based on the energy balance target, using macro ratios computed from seed data.

#### Scenario: Generate plan from deficit target
- **WHEN** the user clicks "Generar Plan Automático"
- **THEN** the system SHALL read the target daily calories from the energy balance view
- **THEN** the system SHALL compute meal ratios from seed data (meal_components.default_grams × food_items.kcal_per_100g aggregated per meal_template)
- **THEN** the system SHALL distribute calories across 5 meals using computed ratios
- **THEN** the system SHALL select food options and compute grams to meet macro targets
- **THEN** the system SHALL create daily_plan_entries and display the result for review

#### Scenario: No energy balance data
- **WHEN** no energy balance target exists
- **THEN** the system SHALL prompt the user to set a deficit target first

#### Scenario: Generated plan editable before save
- **WHEN** the plan is generated
- **THEN** the system SHALL display it for review and manual tweaks before persisting

## TBD

- Custom meal override for unplanned eating
- Daily food logging vs plan-level view
- Barcode scanning integration (future)
