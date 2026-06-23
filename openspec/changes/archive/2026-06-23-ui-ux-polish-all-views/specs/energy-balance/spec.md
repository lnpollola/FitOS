# Energy Balance — Delta

## MODIFIED Requirements

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

### Requirement: Recomp detection visibility

The system SHALL detect body recomposition using the last 4 available measurement sets (not all historical measurements). Recomposition SHALL be identified when weight is stagnant (±0.5 kg) but waist and/or hip measurements improve (decrease by ≥ 1 cm) across the 4 most recent sets.

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

### Requirement: "Aplicar Recomendación" modifies the diet plan

The system SHALL make the "Aplicar Recomendación" button actually modify the user's diet plan when clicked. The current implementation only saves metadata to settings without changing any `daily_plans`, `meal_templates`, or `meal_components`. The fix SHALL apply the recommended carb/fat gram adjustments to the current daily plan or meal templates.

#### Scenario: Apply recommendation modifies plan
- **WHEN** the user clicks "Aplicar Recomendación"
- **THEN** the system SHALL update the relevant `meal_components` gram amounts (carbs/fat reduction or increase)
- **THEN** the daily plan SHALL reflect the adjusted gram amounts on next render
- **THEN** a confirmation SHALL display what was changed (e.g., "Avena: 60g → 45g, Aceite: 15g → 10g")

### Requirement: Adherence shows gain vs loss distinction

The system SHALL distinguish weight gain from weight loss in the adherence display. The current implementation uses `Math.abs(actualRate)` which hides the sign. A user gaining 0.3 kg/week sees "0.30 kg/semana" labeled as loss rate.

#### Scenario: Weight gain displayed as gain
- **WHEN** the user's weight trend is increasing (actualRate is negative)
- **THEN** the display SHALL show "Ganando 0.30 kg/semana" (not "0.30 kg/semana pérdida")
- **THEN** the label SHALL use `strings.adaptive.gainingRate` for gain context

#### Scenario: Weight loss displayed as loss
- **WHEN** the user's weight trend is decreasing (actualRate is positive)
- **THEN** the display SHALL show "Perdiendo 0.30 kg/semana"
- **THEN** the label SHALL use `strings.adaptive.actualLossRate` for loss context

### Requirement: Guard currentDeficit when no daily plan exists

The system SHALL guard `loadAdjustments` against the case where no daily plan exists. When `planned_intake` is 0 or undefined, the system SHALL display a message prompting the user to create a daily plan, not compute an absurd deficit equal to the entire TDEE.

#### Scenario: No plan shows guidance
- **WHEN** no daily plan exists for today (planned_intake is 0 or undefined)
- **THEN** the adjustments card SHALL display "Crea un plan diario para ver recomendaciones de ajuste"
- **THEN** the system SHALL NOT compute or display a deficit value

### Requirement: Recomp chart responsive

The system SHALL make the recomp chart responsive like all other charts in the app. The chart SHALL use `maintainAspectRatio: false` with a CSS-sized `.chart-container`, not a fixed `width="280" height="180"` canvas.

#### Scenario: Recomp chart adapts to container
- **WHEN** the recomp chart renders
- **THEN** it SHALL use `maintainAspectRatio: false`
- **THEN** it SHALL fill its `.chart-container` width
- **THEN** no fixed width/height attributes SHALL be on the canvas

### Requirement: Chart destroy before empty-state in recomp

The system SHALL call `window._recompChart.destroy()` before rendering an empty-state in `loadRecomp`. The destroy guard SHALL be the first statement, before any data-presence check.

#### Scenario: Chart destroyed before empty-state
- **WHEN** `loadRecomp` hits an empty-state branch (fewer than 4 sets or missing metrics)
- **THEN** any existing `window._recompChart` SHALL be destroyed first
- **THEN** the chart instance SHALL be set to null
- **THEN** no chart instance SHALL leak

### Requirement: Guard JSON.parse in adjustment history

The system SHALL wrap `JSON.parse(lastAdj)` in a try/catch within `loadHistory`. If the setting value is malformed, the system SHALL display an empty history (not crash and leave a skeleton forever).

#### Scenario: Malformed JSON does not crash
- **WHEN** `api.getSetting('last_adjustment')` returns a malformed JSON string
- **THEN** the try/catch SHALL catch the parse error
- **THEN** the history card SHALL display an empty state (no adjustments shown)
- **THEN** no skeleton SHALL remain stuck

### Requirement: loadDeficitImpact per-slot deduplication

The system SHALL not sum all meal templates per slot when computing the PDF baseline. If multiple templates exist per meal slot, only the selected (or first/default) template SHALL be summed. The current implementation sums all templates, inflating the baseline.

#### Scenario: Baseline sums selected templates only
- **WHEN** `loadDeficitImpact` computes the PDF baseline
- **THEN** only one template per meal slot SHALL be summed
- **THEN** duplicate templates for the same slot SHALL NOT inflate the baseline kcal
