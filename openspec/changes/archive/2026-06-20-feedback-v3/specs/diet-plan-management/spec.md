# Diet Plan Management (v3)

## Purpose

Add 5-column meal template UI from the PDF, compact food display with pagination, extended food seed data (~150 items from curated sources), auto-fill on name entry from existing food_items table, and daily plan auto-generator based on energy balance target with macro ratios computed from seed data.

## Requirements

### ADDED Requirements

### Requirement: 5-column meal template display

The system SHALL display the 5 meals (Desayuno, Media Mañana, Comida, Merienda, Cena) as columns showing slot breakdown with food options.

#### Scenario: Meal columns render from seeded data
- **WHEN** meal_components and meal_options are populated (seeded in feedback-v2)
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
