# Diet Plan Management — Delta

## ADDED Requirements

### Requirement: Food category labels in meal templates

The system SHALL display category label pills (Carbohidratos, Proteínas, Grasas saludables, Infusiones, Frutas, Verduras) above food option groups within meal template columns.

#### Scenario: Category pills above food groups
- **WHEN** the 5 meal template columns render
- **THEN** each food option group SHALL have a colored category pill badge above the food list
- **THEN** Carbohidratos SHALL use warm tan, Proteínas SHALL use moss, Grasas SHALL use ember, Infusiones SHALL use lichen

### Requirement: Fixed mid-morning and snack recipes

The system SHALL display "Media Mañana" and "Merienda" as fixed recipe descriptions (not interchangeable slot-based templates), since both follow the same formula: protein smoothie with fruit and oats.

#### Scenario: Media Mañana as fixed recipe
- **WHEN** the Media Mañana column renders
- **THEN** the column SHALL display the fixed recipe description and total macros
- **THEN** the column SHALL NOT display interchangeable food option slots
- **THEN** the recipe SHALL read: "Batido: 200–350ml leche vegetal + 150g fruta + 50g avena + 30g proteína + hielo"

#### Scenario: Merienda as fixed recipe
- **WHEN** the Merienda column renders
- **THEN** the column SHALL display the same fixed recipe as Media Mañana
- **THEN** the recipe SHALL be identical

### Requirement: Clarified gram range display

The system SHALL display minimum and maximum gram ranges with descriptive labels below each food option.

#### Scenario: Gram range with labels
- **WHEN** a food option renders with training_day_grams = 120 and rest_day_grams = 100
- **THEN** the display SHALL show "100–120g" as the gram range
- **THEN** the labels "Mín" and "Máx" SHALL precede or accompany the range

### Requirement: Example elaborated dishes pre-loaded

The system SHALL seed the `elaborated_dishes` table with example dishes that represent common meal combinations from the user's diet plan.

#### Scenario: Example dishes visible
- **WHEN** the elaborated dishes manager is expanded
- **THEN** at least 3 example dishes SHALL be displayed
- **THEN** each dish SHALL show name, total kcal, and expandable ingredient list
- **THEN** example dishes SHALL include combinations already present in the seed meal templates

## MODIFIED Requirements

### Requirement: 5-column meal template display

The system SHALL display the 5 meals (Desayuno, Media Mañana, Comida, Merienda, Cena) as columns showing slot breakdown with food options. Media Mañana and Merienda SHALL be displayed as fixed recipes, not slot-based templates. Food option groups SHALL show category labels above them.

#### Scenario: Meal columns render from seeded data
- **WHEN** meal_components and meal_options are populated
- **THEN** the system SHALL display 5 columns, each showing meal name
- **THEN** Desayuno, Comida, and Cena SHALL show slot types with gram amounts and interchangeable food options with category pills
- **THEN** Media Mañana and Merienda SHALL show the fixed recipe description
- **THEN** each slot SHALL show training day and rest day gram amounts

#### Scenario: User selects food per slot
- **WHEN** a user clicks a food option in a slot (Desayuno, Comida, or Cena only)
- **THEN** it SHALL be highlighted as selected
- **THEN** the meal's total kcal/macros SHALL update

#### Scenario: Create daily plan from selections
- **WHEN** the user clicks "Generar Plan Diario"
- **THEN** the system SHALL create a daily_plan with the selected foods and grams
- **THEN** the plan SHALL render below the meal templates for review

### Requirement: Friendlier food entry interface

The system SHALL provide a collapsible food item management section. The food browser SHALL be hidden inside a `<details>` element collapsed by default.

#### Scenario: Collapsible food manager
- **WHEN** the diet view loads
- **THEN** the food manager SHALL be collapsed under "Gestor de alimentos" summary
- **WHEN** the user clicks the summary
- **THEN** the food browser SHALL expand with search, category pills, and paginated food table

### Requirement: Dish card UI with ingredient breakdown

The system SHALL render the elaborated dishes manager as a collapsible `<details>` section, collapsed by default. When expanded, example dishes from seed data SHALL be visible.

#### Scenario: Collapsible dishes manager with examples
- **WHEN** the diet view loads
- **THEN** the elaborated dishes section SHALL be collapsed under "Gestor de platos" summary
- **WHEN** the user expands it
- **THEN** example dishes and existing user dishes SHALL be displayed as cards

### Requirement: Fix add dish to daily plan (FK violation)

The system SHALL fix the "Añadir plato" functionality so that adding an elaborated dish to the daily plan successfully inserts its ingredients. The current implementation passes `meal_component_id: 0` which violates the foreign key constraint. The fix SHALL either resolve a valid `meal_component_id` for the target meal or insert ingredients without a component reference if the schema allows.

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

### Requirement: Fix dish edit (dead code to functional)

The system SHALL implement full dish editing: render an edit button on each dish card, pre-fill the dish form with existing ingredients, and update the dish via an upsert IPC handler (not INSERT only).

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

### Requirement: Column totals computed on render

The system SHALL call `updateColumnTotals()` once after the meal template HTML is rendered, not only on food option click. Initial render SHALL show non-zero calorie totals based on default food selections.

#### Scenario: Non-zero totals on load
- **WHEN** the diet view renders with meal templates
- **THEN** each meal column SHALL display a non-zero kcal total based on default_grams
- **THEN** the user SHALL NOT see "0 kcal" on initial load

### Requirement: Eliminate duplicate loadFoods/loadHiddenFoods/loadDailyPlan on init

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

### Requirement: Food categories cover legumes and plant proteins

The system SHALL ensure the category mapping covers legumes (lentejas, garbanzos, alubias, habas, soja) and plant proteins (tofu, tempeh, seitán). These items SHALL match the "Proteínas" or a new "Legumbres" category and be visible under their filter.

#### Scenario: Legumes filterable
- **WHEN** the user filters by "Proteínas" or "Legumbres"
- **THEN** lentejas, garbanzos, alubias, habas, soja SHALL appear in the filtered results

#### Scenario: Plant proteins filterable
- **WHEN** the user filters by "Proteínas"
- **THEN** tofu, tempeh, seitán SHALL appear in the filtered results

### Requirement: Auto-fill does not overwrite user-entered macros

The system SHALL not overwrite macro values that the user has already typed when the name-field auto-fill triggers. If the user has entered non-zero values in kcal/protein/carbs/fat, the auto-fill SHALL prompt for confirmation before overwriting, or SHALL skip the overwrite.

#### Scenario: Auto-fill preserves user macros
- **WHEN** the user has typed macro values and then types a food name that matches an existing item
- **THEN** the auto-fill SHALL NOT overwrite the user's macro values without confirmation
- **THEN** the system SHALL either skip the overwrite or show a "¿Sobrescribir valores?" confirmation
