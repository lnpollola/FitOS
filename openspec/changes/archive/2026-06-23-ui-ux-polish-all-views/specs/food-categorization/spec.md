# Food Categorization

## ADDED Requirements

### Requirement: Food category labels in meal templates

The system SHALL display category labels (Carbohidratos, Proteínas, Grasas saludables, Infusiones, Frutas, Verduras, Extras) as colored pill badges above food option groups within each meal template slot. Categories SHALL be mapped via a JS object keyed by `food_item.id`.

#### Scenario: Category pills above food options
- **WHEN** a meal template (e.g., Desayuno) renders its food option groups
- **THEN** each food option group SHALL have a category pill badge above it
- **THEN** "Pan blanco", "Pan integral", "Harina de avena", "Arroz", "Torta de maíz" SHALL be labeled "Carbohidratos"
- **THEN** "Jamón crudo", "Jamón cocido", "Fiambre de pavo" SHALL be labeled "Proteínas"
- **THEN** "Aceite de oliva", "Aguacate", "Crema de cacahuate" SHALL be labeled "Grasas saludables"
- **THEN** "Té verde", "Café", "Bebida vegetal" SHALL be labeled "Infusiones"

#### Scenario: Category pills use organic palette colors
- **WHEN** category pills render
- **THEN** Carbohidratos SHALL use a warm amber/tan color
- **THEN** Proteínas SHALL use a moss/accent color
- **THEN** Grasas saludables SHALL use an ember/gold color
- **THEN** Infusiones SHALL use a muted lichen/teal color
- **THEN** all pills SHALL use the organic border-radius token

### Requirement: Fixed mid-morning and snack meal structure

The system SHALL clarify that "Media Mañana" and "Merienda" are fixed-recipe meals (not slot-based templates). Both SHALL display as a single recipe description rather than interchangeable slots.

#### Scenario: Mid-morning displays as fixed recipe
- **WHEN** the Media Mañana column renders
- **THEN** the system SHALL display it as a fixed recipe: "Batido: 200–350ml leche vegetal + 150g fruta + 50g avena + 30g proteína + hielo"
- **THEN** the system SHALL NOT display interchangeable food options for this meal
- **THEN** the meal total SHALL be computed from the fixed recipe amounts

#### Scenario: Snack displays as fixed recipe
- **WHEN** the Merienda column renders
- **THEN** the system SHALL display it as the same fixed recipe as Media Mañana
- **THEN** the system SHALL NOT display interchangeable food options

### Requirement: Clarified gram range indicators

The system SHALL display minimum and maximum gram indicators below each food option with descriptive labels ("Mín" and "Máx") and the range shown as "120–150g" instead of standalone numbers.

#### Scenario: Gram range display
- **WHEN** a food option renders with training_day_grams = 120 and rest_day_grams = 100
- **THEN** the system SHALL display "120–150g" (min–max) below the food name
- **THEN** the range SHALL use `strings.diet.gramRange` for the format
