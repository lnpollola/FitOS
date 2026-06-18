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

## TBD

- Custom meal override for unplanned eating
- Daily food logging vs plan-level view
- Barcode scanning integration (future)
