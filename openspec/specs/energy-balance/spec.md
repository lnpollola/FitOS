# Energy Balance

## Purpose

Compute BMR (Mifflin-St Jeor) and TDEE from real per-sport activity calories plus step-based NEAT, compare planned intake vs TDEE, and display daily/weekly energy balance.

## Requirements

### Requirement: Compute BMR from user profile

The system SHALL compute the basal metabolic rate (BMR) using the Mifflin-St Jeor formula based on the user's age, sex, height, and weight.

#### Scenario: BMR computed from profile
- **WHEN** the user has a complete profile with age, sex, height, and weight
- **THEN** the system SHALL compute and display BMR using Mifflin-St Jeor

#### Scenario: BMR unavailable with incomplete profile
- **WHEN** the user has not completed their profile
- **THEN** the system SHALL display BMR as "pending — complete your profile"

### Requirement: Compute TDEE from BMR plus real sport activity

The system SHALL compute total daily energy expenditure (TDEE) as BMR plus calories burned in sport activities plus step-based NEAT. The "estado actual" (current status) and "desglose TDEE" (TDEE breakdown) SHALL be displayed as side-by-side cards for easy comparison.

#### Scenario: TDEE computed from activity data
- **WHEN** the user has BMR and at least one day with activity data including sport workouts
- **THEN** the system SHALL compute TDEE by adding BMR + sport activity calories + step-based NEAT (steps × 0.04 kcal/step)

#### Scenario: Side-by-side card layout
- **WHEN** a user views their energy balance
- **THEN** the system SHALL display "Estado Actual" and "Desglose TDEE" as two adjacent cards
- **THEN** "Estado Actual" SHALL show planned intake, actual expenditure, and net balance
- **THEN** "Desglose TDEE" SHALL show BMR, sport calories, and NEAT components with their kcal values
- **THEN** both cards SHALL have equal height for visual comparison

#### Scenario: TDEE unavailable with insufficient data
- **WHEN** the user has fewer than 1 day of activity data or an incomplete profile
- **THEN** the system SHALL display TDEE as "pending — more data needed"

### Requirement: Define planned daily intake from diet plan

The system SHALL compute the planned daily calorie intake from the active diet plan (sum of all meal slot totals for the selected day type).

#### Scenario: Planned intake shown
- **WHEN** a user has an active diet plan configured
- **THEN** the system SHALL display the planned daily calorie intake based on the diet plan's slot structure and gram amounts

### Requirement: Calculate daily calorie balance

The system SHALL compare TDEE against planned intake for each day and classify the balance as surplus, maintenance, or deficit.

#### Scenario: Deficit classification
- **WHEN** planned intake is less than TDEE by more than 100 kcal
- **THEN** the system SHALL display a deficit badge with the numeric gap in kcal

#### Scenario: Surplus classification
- **WHEN** planned intake exceeds TDEE by more than 100 kcal
- **THEN** the system SHALL display a surplus badge with the numeric excess in kcal

#### Scenario: Maintenance classification
- **WHEN** planned intake is within 100 kcal of TDEE
- **THEN** the system SHALL display a maintenance badge

### Requirement: Display weekly balance summary

The system SHALL aggregate daily balances into a weekly view showing net balance, average deficit/surplus, and number of days in each zone.

#### Scenario: Weekly summary calculated
- **WHEN** a user views the weekly energy balance for a given week with 5+ logged days
- **THEN** the system SHALL show net weekly balance, average daily balance, and a count of deficit/maintenance/surplus days

#### Scenario: Incomplete week warning
- **WHEN** a user views a week with fewer than 5 logged days
- **THEN** the system SHALL display the available data but show a warning that the week is incomplete

### Requirement: Recomp detection visibility

The system SHALL detect body recomposition using the last 4 available measurement sets (not all historical measurements). Recomposition SHALL be identified when weight is stagnant (±0.5 kg) but waist and/or hip measurements improve (decrease by ≥ 1 cm) across the 4 most recent sets. The system SHALL display recomp status clearly, including what data is missing when detection cannot run.

#### Scenario: Recomp detection with last 4 measurements
- **WHEN** ≥ 4 measurement sets exist with waist, neck, and hips data
- **THEN** the system SHALL use only the 4 most recent sets for recomposition analysis
- **THEN** the system SHALL compare first (oldest) to last (newest) of the 4

#### Scenario: Recomp detected
- **WHEN** weight change across last 4 sets is ≤ ±0.5 kg
- **AND** waist or hips decreased by ≥ 1 cm
- **THEN** the system SHALL display "Recomposición detectada"
- **THEN** a chart SHALL show weight vs waist over the 4 measurement dates

#### Scenario: No recomp
- **WHEN** weight and measurements are both decreasing (standard fat loss)
- **THEN** the system SHALL display "Pérdida de peso estándar — sin recomposición"

#### Scenario: Missing data guidance
- **WHEN** fewer than 4 measurement sets exist
- **THEN** the system SHALL display "Se necesitan 4 mediciones con cintura, cuello y cadera"
- **WHEN** waist, neck, or hips data is missing from existing sets
- **THEN** the system SHALL display which metrics are missing

#### Scenario: Recomp chart responsive
- **WHEN** the recomp chart renders
- **THEN** it SHALL use `maintainAspectRatio: false`
- **THEN** it SHALL fill its `.chart-container` width
- **THEN** no fixed width/height attributes SHALL be on the canvas

#### Scenario: Chart destroyed before empty-state
- **WHEN** `loadRecomp` hits an empty-state branch (fewer than 4 sets or missing metrics)
- **THEN** any existing `window._recompChart` SHALL be destroyed first
- **THEN** the chart instance SHALL be set to null
- **THEN** no chart instance SHALL leak

### Requirement: Adherence evaluation with recommendations

The system SHALL display adherence as a visual gauge with specific recommendations. Weight gain SHALL be distinguished from weight loss with sign-aware labels.

#### Scenario: Adherence gauge renders
- **WHEN** weight data exists
- **THEN** the system SHALL display a progress bar or gauge showing current loss rate vs target
- **THEN** the system SHALL display consistency score (weeks within 0.2 kg of target)

#### Scenario: Weight gain displayed as gain
- **WHEN** the user's weight trend is increasing (actualRate is negative)
- **THEN** the display SHALL show "Ganando 0.30 kg/semana"
- **THEN** the label SHALL use `strings.adaptive.gainingRate` for gain context

#### Scenario: Weight loss displayed as loss
- **WHEN** the user's weight trend is decreasing (actualRate is positive)
- **THEN** the display SHALL show "Perdiendo 0.30 kg/semana"
- **THEN** the label SHALL use `strings.adaptive.actualLossRate` for loss context

#### Scenario: Specific recommendations
- **WHEN** actual rate is below target by >0.2 kg/week
- **THEN** the system SHALL suggest "Aumentar déficit en X kcal/día"
- **WHEN** actual rate is on track
- **THEN** the system SHALL display "Mantener ritmo actual"

### Requirement: "Aplicar Recomendación" modifies the diet plan

The system SHALL make the "Aplicar Recomendación" button modify the user's diet plan by applying recommended carb/fat gram adjustments to the current daily plan or meal templates.

#### Scenario: Apply recommendation modifies plan
- **WHEN** the user clicks "Aplicar Recomendación"
- **THEN** the system SHALL update the relevant `meal_components` gram amounts (carbs/fat reduction or increase)
- **THEN** the daily plan SHALL reflect the adjusted gram amounts on next render
- **THEN** a confirmation SHALL display what was changed (e.g., "Avena: 60g → 45g, Aceite: 15g → 10g")

### Requirement: Deficit impact vs PDF baseline

The system SHALL compare current intake against the PDF baseline diet.

#### Scenario: PDF baseline comparison
- **WHEN** meal_components are seeded and daily_plan_entries exist
- **THEN** the system SHALL show "Tu dieta actual: X kcal vs PDF base: Y kcal — Diferencia: Z kcal"
- **WHEN** no daily plan data exists
- **THEN** the system SHALL show the PDF baseline as reference only

#### Scenario: No plan shows guidance
- **WHEN** no daily plan exists for today (planned_intake is 0 or undefined)
- **THEN** the adjustments card SHALL display "Crea un plan diario para ver recomendaciones de ajuste"
- **THEN** the system SHALL NOT compute or display a deficit value

#### Scenario: Baseline sums selected templates only
- **WHEN** `loadDeficitImpact` computes the PDF baseline
- **THEN** only one template per meal slot SHALL be summed
- **THEN** duplicate templates for the same slot SHALL NOT inflate the baseline kcal

#### Scenario: Malformed JSON does not crash history
- **WHEN** `api.getSetting('last_adjustment')` returns a malformed JSON string
- **THEN** the try/catch SHALL catch the parse error
- **THEN** the history card SHALL display an empty state (no adjustments shown)
- **THEN** no skeleton SHALL remain stuck
