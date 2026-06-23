# Diet Day Type Toggle

## ADDED Requirements

### Requirement: Training/rest day toggle in daily plan

The system SHALL provide a toggle in the daily plan section to switch between "Día de Entrenamiento" and "Día de Descanso". The toggle SHALL control which gram amounts are used when generating or displaying the plan: `default_grams` for training days, `restday_grams` for rest days.

#### Scenario: Toggle renders in daily plan header
- **WHEN** the daily plan section renders
- **THEN** a toggle control SHALL appear in the plan header with two options: "Entrenamiento" and "Descanso"
- **THEN** the default selection SHALL be "Entrenamiento"

#### Scenario: Rest day plan uses restday_grams
- **WHEN** the user selects "Descanso" and generates a daily plan
- **THEN** the system SHALL use `restday_grams` from `meal_components` for each food option
- **THEN** the daily totals SHALL reflect the lower gram amounts
- **THEN** a visual indicator SHALL mark the plan as "Día de descanso"

#### Scenario: Training day plan uses default_grams
- **WHEN** the user selects "Entrenamiento" and generates a daily plan
- **THEN** the system SHALL use `default_grams` from `meal_components` for each food option
- **THEN** a visual indicator SHALL mark the plan as "Día de entrenamiento"

#### Scenario: Toggle persists for the session
- **WHEN** the user switches the toggle and regenerates the plan
- **THEN** the selected day type SHALL persist until the user changes it or navigates away

### Requirement: Rest day grams visible in meal templates

The system SHALL display both training and rest day gram amounts in the meal template columns. Rest day grams SHALL be shown in a muted/secondary style to indicate they are the lower-activity option.

#### Scenario: Both gram amounts shown
- **WHEN** a meal template column renders a food option
- **THEN** the training day grams SHALL be shown as the primary value (e.g., "120g")
- **THEN** the rest day grams SHALL be shown as a secondary value (e.g., "100g descanso")
- **THEN** rest day values SHALL use a muted color or smaller font to de-emphasize

#### Scenario: Zero rest grams for infusions
- **WHEN** a food option (e.g., infusiones) has `restday_grams = 0`
- **THEN** the rest day display SHALL show "—" instead of "0g"
