# Daily Plan Redesign

## ADDED Requirements

### Requirement: Daily plan positioned below meal templates

The system SHALL position the daily plan section directly below the 5-column meal template display, not at the bottom of the diet view. The daily plan SHALL be visually connected to the meal templates with a section header "Plan Diario".

#### Scenario: Daily plan after meal templates
- **WHEN** the diet view renders
- **THEN** the daily plan section SHALL appear immediately after the 5 meal template columns
- **THEN** the food manager and elaborated dishes sections SHALL appear below the daily plan
- **THEN** a visible section divider SHALL separate meal templates from daily plan

### Requirement: Reliable gram editing with debounced input

The system SHALL use `input` event with 500ms debounce (not `change` event) for gram amount editing in the daily plan. Values SHALL be clamped to each food item's defined min/max range. Auto-save SHALL trigger on input blur after debounce.

#### Scenario: Gram input responds to typing
- **WHEN** user types a new gram value in a daily plan entry input
- **THEN** the system SHALL update the displayed value on each keystroke (input event)
- **THEN** the system SHALL NOT trigger save on every keystroke

#### Scenario: Auto-save on blur after debounce
- **WHEN** user finishes typing and the input loses focus
- **THEN** the system SHALL wait 500ms debounce
- **THEN** the system SHALL persist the new gram value via IPC
- **THEN** a subtle saving indicator (opacity change) SHALL appear during debounce

#### Scenario: Value clamped to valid range
- **WHEN** user enters a value below the food item's minimum grams
- **THEN** the value SHALL be clamped to the minimum on blur
- **WHEN** user enters a value above the maximum grams
- **THEN** the value SHALL be clamped to the maximum on blur

#### Scenario: Runaway increment bug fixed
- **WHEN** user rapidly clicks increment/decrement buttons
- **THEN** each click SHALL produce exactly one increment/decrement
- **THEN** the value SHALL NOT accumulate incorrectly from overlapping event handlers

### Requirement: Running totals per meal and daily aggregate

The system SHALL compute and display running calorie and macro totals per meal and a daily aggregate row. Totals SHALL update in real-time as gram values change.

#### Scenario: Per-meal totals
- **WHEN** the daily plan renders
- **THEN** each of the 5 meals SHALL show subtotal kcal, protein, carbs, and fat
- **THEN** subtotals SHALL update when any gram value in that meal changes

#### Scenario: Daily aggregate
- **WHEN** the daily plan renders with all entries
- **THEN** a daily aggregate row SHALL show total kcal, protein, carbs, and fat
- **THEN** totals SHALL match the sum of all 5 meal subtotals

#### Scenario: Compliance indicator
- **WHEN** the daily aggregate is computed
- **THEN** a compliance indicator SHALL compare daily total kcal against the TDEE deficit target
- **THEN** within 100 kcal of target SHALL show green check
- **THEN** off by >100 kcal SHALL show yellow warning with the gap amount

### Requirement: Plan generation button with review step

The system SHALL provide a "Generar Plan Diario" button that auto-creates a daily plan from current meal template selections. The generated plan SHALL be displayed for review before persisting.

#### Scenario: Generate plan and review
- **WHEN** user clicks "Generar Plan Diario" with meal templates configured
- **THEN** the system SHALL create daily_plan_entries with default gram amounts
- **THEN** the plan SHALL render in the daily plan section for review
- **THEN** user SHALL be able to modify grams before confirming
- **THEN** a "Guardar Plan" button SHALL persist the reviewed plan
