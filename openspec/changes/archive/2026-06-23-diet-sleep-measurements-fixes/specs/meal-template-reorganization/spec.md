## ADDED Requirements

### Requirement: Food groups organized by macronutrient with headers

The system SHALL display food options within meal template columns (Desayuno, Comida, Cena) grouped by macronutrient category (CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES) rather than the previous fine-grained categories. Each macronutrient group header SHALL appear both above and below its food items within the slot.

#### Scenario: Macronutrient headers above and below
- **WHEN** a meal template column renders for Desayuno, Comida, or Cena
- **THEN** "CARBOHIDRATOS" header SHALL appear above carb-type foods and below the last carb-type food in the slot
- **THEN** "PROTEÍNAS" header SHALL appear above protein-type foods and below the last protein-type food in the slot
- **THEN** "GRASAS SALUDABLES" header SHALL appear above fat-type foods and below the last fat-type food in the slot
- **THEN** headers SHALL use the organic palette: Carbohidratos in warm tan, Proteínas in moss, Grasas in ember

#### Scenario: Headers visible simultaneously
- **WHEN** a meal slot contains foods from multiple macronutrient groups
- **THEN** all group headers SHALL be visible at once without requiring tab switching or scrolling within the slot

### Requirement: Click-to-select with automatic calorie calculation

The system SHALL allow the user to click a food item in a meal slot to select or deselect it. Upon selection or deselection, the slot's total calories and macros SHALL recalculate immediately and display the updated total.

#### Scenario: Select a food item
- **WHEN** the user clicks a food item in a Desayuno, Comida, or Cena slot
- **THEN** the food item SHALL highlight with an accent border to indicate selection
- **THEN** the slot's kcal total SHALL update to include the selected food's contribution
- **THEN** the protein, carbs, and fat subtotals SHALL update accordingly

#### Scenario: Deselect a food item
- **WHEN** the user clicks an already-selected food item in a slot
- **THEN** the food item SHALL lose its highlight
- **THEN** the slot's kcal total SHALL decrease by the deselected food's contribution
- **THEN** the protein, carbs, and fat subtotals SHALL update accordingly

#### Scenario: Multiple selections per slot
- **WHEN** the user selects multiple food items within the same slot
- **THEN** the slot total SHALL reflect the sum of all selected items' calorie and macro contributions
- **THEN** all selected items SHALL remain highlighted simultaneously

### Requirement: Fixed recipes for media mañana and merienda with calorie calculation

The system SHALL display fixed, non-editable ingredient lists for the Media Mañana and Merienda slots with specific gram amounts, and SHALL compute and display the total calories for each fixed recipe based on the food_items database values.

#### Scenario: Media mañana fixed recipe
- **WHEN** the Media Mañana column renders
- **THEN** the system SHALL display the fixed ingredients: "300ml bebida vegetal", "30g harina de avena", "20g proteína", "15g frutos secos"
- **THEN** the ingredients SHALL NOT be selectable, removable, or editable
- **THEN** the system SHALL compute total kcal by summing each ingredient's (grams × kcal_per_100g / 100) from the food_items table
- **THEN** the computed kcal total SHALL be displayed at the bottom of the column

#### Scenario: Merienda fixed recipe
- **WHEN** the Merienda column renders
- **THEN** the system SHALL display the fixed ingredients: "350ml bebida vegetal", "50g harina de avena", "30g proteína", "150g fruta"
- **THEN** the ingredients SHALL NOT be selectable, removable, or editable
- **THEN** the system SHALL compute total kcal by summing each ingredient's (grams × kcal_per_100g / 100) from the food_items table
- **THEN** the computed kcal total SHALL be displayed at the bottom of the column

#### Scenario: Fixed recipe ingredient not found in database
- **WHEN** a fixed recipe ingredient name does not match any food_item in the database
- **THEN** the system SHALL display the ingredient name with a warning indicator
- **THEN** the system SHALL use 0 kcal for that ingredient in the total

#### Scenario: Fixed recipe not included in auto-plan generation
- **WHEN** the user generates a daily plan via "Generar Plan Diario" or "Generar Plan Automático"
- **THEN** the Media Mañana and Merienda slots SHALL be excluded from the generated entries
- **THEN** the fixed recipes SHALL remain displayed in the template columns for reference only
