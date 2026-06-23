## MODIFIED Requirements

### Requirement: 5-column meal template display

The system SHALL display the 5 meals (Desayuno, Media Mañana, Comida, Merienda, Cena) as columns showing slot breakdown with food options organized by macronutrient groups. Media Mañana and Merienda SHALL be displayed as fixed recipes with specific calculated ingredients and calorie totals, not as static text. Food options within slots SHALL be grouped under macronutrient headers (CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES) that appear both above and below their respective food group. Training and rest day gram amounts SHALL both be visible. The daily plan SHALL appear directly below the meal templates.

#### Scenario: Meal columns render from seeded data
- **WHEN** meal_components and meal_options are populated
- **THEN** the system SHALL display 5 columns, each showing meal name
- **THEN** Desayuno, Comida, and Cena SHALL show food options grouped under macronutrient headers: CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES
- **THEN** each macronutrient header SHALL appear both above the first food and below the last food in its group
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

### Requirement: Compute meal calories and macros from food database

The system SHALL maintain a food database (FoodItem) with kcal and macros per 100g, and compute the total calories, protein, carbs, and fat for each meal slot based on selected foods or fixed recipes, and for the full day. Media Mañana and Merienda SHALL have their calories computed from their fixed ingredient formulas.

#### Scenario: Meal calories computed
- **WHEN** a meal slot is displayed
- **THEN** the system SHALL show the computed total calories and macros for that slot based on selected food items or fixed recipe ingredients and their gram amounts

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
- **THEN** subtotals SHALL update when any food selection changes in that meal
- **WHEN** the daily plan renders with all entries
- **THEN** a daily aggregate row SHALL show total kcal, protein, carbs, and fat
- **THEN** totals SHALL match the sum of all 5 meal subtotals

#### Scenario: Compliance indicator
- **WHEN** the daily aggregate is computed
- **THEN** a compliance indicator SHALL compare daily total kcal against the TDEE deficit target
- **THEN** within 100 kcal of target SHALL show green check
- **THEN** off by >100 kcal SHALL show yellow warning with the gap amount

### Requirement: Model diet as slot-based template

The system SHALL model the diet as a set of MealTemplates (breakfast, mid-morning, lunch, snack, dinner), each composed of MealComponents (slots for carbs, protein, fat, vegetables, fruit, extras) organized under macronutrient group headers (CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES), where each slot has a list of interchangeable FoodItem options with specific gram amounts per day type. Media Mañana and Merienda SHALL be fixed recipes with specific ingredient amounts that cannot be changed.

#### Scenario: Diet plan created from extracted data
- **WHEN** the user imports their existing diet from the extracted structure (Modelo_DietaRes.md)
- **THEN** the system SHALL create the full diet plan with 5 meals, each with its slots, options, and gram amounts for training and rest days

#### Scenario: View diet plan structure
- **WHEN** a user opens the diet plan view
- **THEN** the system SHALL display the diet as a structured list of meals, with food options grouped under macronutrient headers (CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES) for Desayuno, Comida, Cena, and as fixed recipes for Media Mañana and Merienda

## ADDED Requirements

### Requirement: Column totals computed on food selection toggle

The system SHALL call `updateColumnTotals()` after every food item click (select or deselect) in a meal template slot, not just on initial render. Column kcal totals SHALL reflect the sum of all currently selected food items in that slot.

#### Scenario: Column total updates on selection
- **WHEN** the user clicks a food item in a meal template column
- **THEN** the column's kcal total SHALL update immediately
- **THEN** no page reload or manual refresh SHALL be required

#### Scenario: Column total reflects multiple selections
- **WHEN** three food items are selected in the Desayuno column
- **THEN** the column total SHALL equal the sum of all three items' kcal contributions
