# Diet Plan Management

## Purpose

Model the diet as a slot-based template (MealTemplate with MealComponent slots and interchangeable FoodItem options), compute meal and daily macros from a food database, and support learn/forget flows.

## Requirements

### Requirement: Model diet as slot-based template

The system SHALL model the diet as a set of MealTemplates (breakfast, mid-morning, lunch, snack, dinner), each composed of MealComponents (slots for carbs, protein, fat, vegetables, fruit, extras) organized under macronutrient group headers (CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES), where each slot has a list of interchangeable FoodItem options with specific gram amounts per day type. Media Mañana and Merienda SHALL be fixed recipes with specific ingredient amounts that cannot be changed.

#### Scenario: Diet plan created from extracted data
- **WHEN** the user imports their existing diet from the extracted structure (Modelo_DietaRes.md)
- **THEN** the system SHALL create the full diet plan with 5 meals, each with its slots, options, and gram amounts for training and rest days

#### Scenario: View diet plan structure
- **WHEN** a user opens the diet plan view
- **THEN** the system SHALL display the diet as a structured list of meals, with food options grouped under macronutrient headers (CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES) for Desayuno, Comida, Cena, and as fixed recipes for Media Mañana and Merienda

### Requirement: Compute meal calories and macros from food database

The system SHALL maintain a food database (FoodItem) with kcal and macros per 100g, and compute the total calories, protein, carbs, and fat for each meal and for the full day. Media Mañana and Merienda SHALL have their calories computed from their fixed ingredient formulas.

#### Scenario: Meal calories computed
- **WHEN** a meal is displayed
- **THEN** the system SHALL show the computed total calories and macros for that meal based on the selected options and gram amounts

#### Scenario: Daily totals computed
- **WHEN** a full day plan is displayed
- **THEN** the system SHALL show the sum of all meals' calories and macros, including supplements (creatine 5g, optional protein powder)

#### Scenario: Fixed recipe calories computed
- **WHEN** the Media Mañana column renders
- **THEN** the system SHALL compute total kcal from: (300 × bebida_vegetal_kcal_per_100g / 100) + (30 × avena_kcal_per_100g / 100) + (20 × proteina_kcal_per_100g / 100) + (15 × frutos_secos_kcal_per_100g / 100)
- **WHEN** the Merienda column renders
- **THEN** the system SHALL compute total kcal from: (350 × bebida_vegetal_kcal_per_100g / 100) + (50 × avena_kcal_per_100g / 100) + (30 × proteina_kcal_per_100g / 100) + (150 × fruta_kcal_per_100g / 100)

#### Scenario: Running totals per meal and daily aggregate
- **WHEN** the daily plan renders
- **THEN** each of the 5 meals SHALL show subtotal kcal, protein, carbs, and fat
- **THEN** subtotals SHALL update when any gram value in that meal changes
- **WHEN** the daily plan renders with all entries
- **THEN** a daily aggregate row SHALL show total kcal, protein, carbs, and fat
- **THEN** totals SHALL match the sum of all 5 meal subtotals

#### Scenario: Compliance indicator
- **WHEN** the daily aggregate is computed
- **THEN** a compliance indicator SHALL compare daily total kcal against the TDEE deficit target
- **THEN** within 100 kcal of target SHALL show green check
- **THEN** off by >100 kcal SHALL show yellow warning with the gap amount

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

#### Scenario: Reliable gram editing with debounced input
- **WHEN** user types a new gram value in a daily plan entry input
- **THEN** the system SHALL use `input` event with 500ms debounce
- **THEN** the system SHALL NOT trigger save on every keystroke
- **WHEN** user finishes typing and the input loses focus
- **THEN** the system SHALL persist the new gram value via IPC after 500ms debounce
- **THEN** a subtle saving indicator SHALL appear during debounce
- **WHEN** user enters a value below the food item's minimum grams
- **THEN** the value SHALL be clamped to the minimum on blur
- **WHEN** user enters a value above the maximum grams
- **THEN** the value SHALL be clamped to the maximum on blur
- **WHEN** user rapidly clicks increment/decrement buttons
- **THEN** each click SHALL produce exactly one increment/decrement

### Requirement: Elaborated dishes as meal components

The system SHALL allow elaborated dishes (pre-composed meals from multiple ingredients) to be used as options within meal template slots, alongside individual food items.

#### Scenario: Add elaborated dish to meal slot
- **WHEN** a user opens a meal slot's options
- **THEN** the system SHALL display both individual food items and elaborated dishes as selectable options, with dishes marked with a "🍽 Plato" badge

#### Scenario: Example elaborated dishes pre-loaded
- **WHEN** the elaborated dishes manager is expanded
- **THEN** at least 3 example dishes SHALL be displayed
- **THEN** each dish SHALL show name, total kcal, and expandable ingredient list
- **THEN** example dishes SHALL include combinations already present in the seed meal templates

### Requirement: Dish card UI with ingredient breakdown

The system SHALL render the elaborated dishes manager as a collapsible `<details>` section, collapsed by default. When expanded, dish cards SHALL show the dish name, total macros, and an expandable ingredient list. Each dish card SHALL have edit and delete buttons. The `db:saveDish` handler SHALL upsert by id so edits update existing dishes rather than inserting duplicates.

#### Scenario: Collapsible dishes manager with examples
- **WHEN** the diet view loads
- **THEN** the elaborated dishes section SHALL be collapsed under "Gestor de platos" summary with a chevron icon
- **WHEN** the user expands it
- **THEN** example dishes and existing user dishes SHALL be displayed as cards
- **THEN** the open/closed state SHALL be preserved until the user navigates away

#### Scenario: Expand dish card ingredients
- **WHEN** a user clicks "Ver ingredientes" on a dish card
- **THEN** the system SHALL expand the card to show each ingredient name, grams, and its individual macro contribution

#### Scenario: Edit button on dish card
- **WHEN** the dishes list renders
- **THEN** each dish card SHALL have an "Editar" button alongside the delete button

#### Scenario: Edit pre-fills ingredients
- **WHEN** the user clicks "Editar" on a dish
- **THEN** the dish form SHALL pre-fill with the dish's name and existing ingredients
- **THEN** ingredients SHALL not reset to empty

#### Scenario: Save updates existing dish
- **WHEN** the user saves an edited dish
- **THEN** `db:saveDish` SHALL update the existing dish (upsert by id), not insert a new one

### Requirement: Friendlier food entry interface

The system SHALL provide a collapsible food item management section. The food browser SHALL be hidden inside a `<details>` element collapsed by default, with search, category filters, paginated food table, and smart defaults for new food entries.

#### Scenario: Collapsible food manager
- **WHEN** the diet view loads
- **THEN** the food manager SHALL be collapsed under "Gestor de alimentos" summary with a right-pointing chevron
- **WHEN** the user clicks the summary
- **THEN** the food manager SHALL expand with search, category pills, and paginated food table
- **THEN** the chevron SHALL rotate to point down
- **WHEN** the user clicks the summary again
- **THEN** the food manager SHALL collapse
- **THEN** the chevron SHALL rotate back to right-pointing

#### Scenario: State preserved during session
- **WHEN** the user expands the food manager, scrolls down, and scrolls back up
- **THEN** the food manager SHALL remain expanded
- **THEN** the browser's native `<details>` open attribute SHALL maintain state

#### Scenario: Food browser with categories
- **WHEN** a user opens the food item browser
- **THEN** the system SHALL display food items as filterable cards grouped by category (protein, carb, fat, vegetable, fruit, other) with a search bar

#### Scenario: Add new food with smart defaults
- **WHEN** a user clicks "Nuevo alimento"
- **THEN** the system SHALL show a form with category selector and macro fields, pre-filling typical values based on the selected category

### Requirement: 5-column meal template display

The system SHALL display the 5 meals (Desayuno, Media Mañana, Comida, Merienda, Cena) as columns showing slot breakdown with food options organized by macronutrient groups. Media Mañana and Merienda SHALL be displayed as fixed recipes with specific calculated ingredients and calorie totals, not as slot-based templates. Food options within slots SHALL be grouped under macronutrient headers (CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES) that appear above their respective food group. Training and rest day gram amounts SHALL both be visible. The daily plan SHALL appear directly below the meal templates.

#### Scenario: Meal columns render from seeded data
- **WHEN** meal_components and meal_options are populated
- **THEN** the system SHALL display 5 columns, each showing meal name
- **THEN** Desayuno, Comida, and Cena SHALL show food options grouped under macronutrient headers: CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES
- **THEN** each macronutrient header SHALL appear above its food group
- **THEN** Media Mañana SHALL display fixed ingredients: "300ml bebida vegetal", "30g harina de avena", "20g proteína", "15g frutos secos" with total kcal calculated from food_items
- **THEN** Merienda SHALL display fixed ingredients: "350ml bebida vegetal", "50g harina de avena", "30g proteína", "150g fruta" with total kcal calculated from food_items
- **THEN** Media Mañana and Merienda SHALL NOT display interchangeable food option slots
- **THEN** each macronutrient group header SHALL use organic palette colors: Carbohidratos warm tan, Proteínas moss, Grasas saludables ember

#### Scenario: User selects food per slot
- **WHEN** a user clicks a food option in a slot (Desayuno, Comida, or Cena only)
- **THEN** it SHALL toggle between selected (highlighted with accent border) and deselected
- **THEN** the slot's kcal total SHALL recalculate immediately on each click

#### Scenario: Create daily plan from selections
- **WHEN** the user clicks "Generar Plan Diario"
- **THEN** the system SHALL create a daily_plan with the selected foods and grams
- **THEN** the plan SHALL render directly below the meal templates for review
- **THEN** a visible section header "Plan Diario" SHALL separate meal templates from daily plan
- **THEN** the food manager and elaborated dishes sections SHALL appear below the daily plan

### Requirement: Clarified gram range display

The system SHALL display minimum and maximum gram ranges with descriptive labels ("Mín" and "Máx") below each food option in the meal template columns.

#### Scenario: Gram range with labels
- **WHEN** a food option renders with training_day_grams = 120 and rest_day_grams = 100
- **THEN** the display SHALL show "100–120g" as the gram range
- **THEN** the labels "Mín" and "Máx" SHALL precede or accompany the range
- **THEN** the range SHALL use `strings.diet.gramRange` for the format string

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

#### Scenario: Auto-fill preserves user-entered macros
- **WHEN** the user has typed macro values and then types a food name that matches an existing item
- **THEN** the auto-fill SHALL NOT overwrite the user's macro values without confirmation
- **THEN** the system SHALL either skip the overwrite or show a "¿Sobrescribir valores?" confirmation dialog

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

The system SHALL auto-generate a 5-meal daily plan based on the energy balance target, using macro ratios computed from seed data. The daily plan section SHALL include a training/rest day toggle that controls which gram amounts are used.

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

#### Scenario: Training/rest day toggle
- **WHEN** the daily plan section renders
- **THEN** a toggle control SHALL appear in the plan header with two options: "Entrenamiento" and "Descanso"
- **THEN** the default selection SHALL be "Entrenamiento"
- **THEN** the toggle SHALL persist for the duration of the view session
- **WHEN** the user selects "Descanso" then generates or renders a daily plan
- **THEN** the system SHALL use `restday_grams` from `meal_components` for each food option
- **THEN** the daily totals SHALL reflect the lower gram amounts
- **THEN** a visual indicator SHALL mark the plan as "Día de descanso"
- **WHEN** the user selects "Entrenamiento" and generates a daily plan
- **THEN** the system SHALL use `default_grams` from `meal_components`
- **THEN** a visual indicator SHALL mark the plan as "Día de entrenamiento"

#### Scenario: Generated plan editable before save
- **WHEN** the plan is generated
- **THEN** it SHALL display in the daily plan section for review with adjustable gram amounts
- **THEN** the user SHALL be able to modify grams, swap foods, and adjust before persisting
- **THEN** a "Guardar Plan" button SHALL persist the reviewed plan

### Requirement: Food categories cover legumes and plant proteins

The system SHALL ensure the category mapping covers legumes (lentejas, garbanzos, alubias, habas, soja) and plant proteins (tofu, tempeh, seitán). These items SHALL match the "Proteínas" or a "Legumbres" category and be visible under their filter.

#### Scenario: Legumes filterable
- **WHEN** the user filters by "Proteínas" or "Legumbres"
- **THEN** lentejas, garbanzos, alubias, habas, soja SHALL appear in the filtered results

#### Scenario: Plant proteins filterable
- **WHEN** the user filters by "Proteínas"
- **THEN** tofu, tempeh, seitán SHALL appear in the filtered results

### Requirement: Fix add dish to daily plan (FK violation)

The system SHALL fix the "Añadir plato" functionality so that adding an elaborated dish to the daily plan successfully inserts its ingredients. The current implementation passes `meal_component_id: 0` which violates the foreign key constraint. The fix SHALL either resolve a valid `meal_component_id` for the target meal or set it to NULL if the schema allows.

#### Scenario: Add dish inserts ingredients
- **WHEN** the user selects a dish from "Añadir plato" dropdown for a meal
- **THEN** the dish's ingredients SHALL be inserted into `daily_plan_entries` with a valid `meal_component_id` (or NULL if schema is relaxed)
- **THEN** the dish SHALL appear in the daily plan render for that meal
- **THEN** no FK violation SHALL occur

### Requirement: Fix swap food duplicates entries

The system SHALL fix the "Cambiar alimento" functionality to delete old entries before inserting new ones. The current implementation inserts new food rows without removing the old ones, causing macro duplication.

#### Scenario: Swap replaces old entries
- **WHEN** the user swaps a food option in the daily plan
- **THEN** the system SHALL first delete the old `daily_plan_entries` for that meal and date
- **THEN** the system SHALL insert the new food entries
- **THEN** the meal's total kcal/macros SHALL reflect only the new food, not doubled

### Requirement: Column totals computed on food selection toggle

The system SHALL call `updateColumnTotals()` after every food item click (select or deselect) in a meal template slot. Column kcal totals SHALL start at 0 and reflect only the sum of all currently selected food items in that slot. No fallback to default gram amounts SHALL occur when no foods are selected.

#### Scenario: Column total updates on selection
- **WHEN** the user clicks a food item in a meal template column
- **THEN** the column's kcal total SHALL update immediately
- **THEN** no page reload or manual refresh SHALL be required

#### Scenario: Column total reflects multiple selections
- **WHEN** three food items are selected in the Desayuno column
- **THEN** the column total SHALL equal the sum of all three items' kcal contributions

#### Scenario: Column starts at 0 with no selection
- **WHEN** a meal template column renders with no food items selected
- **THEN** the column total SHALL display "0 kcal"
- **THEN** the total SHALL only increase when the user actively selects a food option

### Requirement: Column totals computed on render

The system SHALL call `updateColumnTotals()` once after the meal template HTML is rendered, not only on food option click. Initial render SHALL show "0 kcal" for all columns, reflecting that no foods are selected by default and the user must click to add selections.

#### Scenario: Zero totals on initial load
- **WHEN** the diet view renders with meal templates
- **THEN** each meal column SHALL display "0 kcal" initially
- **THEN** totals SHALL update to non-zero only after the user selects food options

### Requirement: Eliminate duplicate loads on init

The system SHALL call `loadFoods()`, `loadHiddenFoods()`, and `loadDailyPlan()` exactly once on view init. The current implementation calls them twice (once in `Promise.allSettled` and once after).

#### Scenario: Single load on init
- **WHEN** the diet view initializes
- **THEN** each load function SHALL be called exactly once
- **THEN** no second skeleton flash SHALL occur

### Requirement: Daily plan entries sorted by component sort order

The system SHALL sort daily plan entries by their meal component's `sort_order` before rendering, so foods appear in the logical slot order (carbs, protein, fat) not in DB insertion order.

#### Scenario: Entries sorted by sort_order
- **WHEN** the daily plan renders for a meal
- **THEN** entries SHALL be ordered by their component's `sort_order` field
- **THEN** "Aceite de Oliva" SHALL NOT appear before "Pechuga de Pollo" if protein has a lower sort_order

## TBD

- Custom meal override for unplanned eating
- Daily food logging vs plan-level view
- Barcode scanning integration (future)
