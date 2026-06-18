# Diet Plan Management (Delta)

## ADDED Requirements

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
