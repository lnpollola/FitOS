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

The system SHALL compute total daily energy expenditure (TDEE) as BMR plus calories burned in sport activities plus step-based NEAT. The breakdown SHALL be displayed in the adaptive planning view.

#### Scenario: TDEE computed from activity data
- **WHEN** the user has BMR and at least one day with activity data including sport workouts
- **THEN** the system SHALL compute TDEE by adding BMR + sport activity calories + step-based NEAT (steps × 0.04 kcal/step)

#### Scenario: TDEE breakdown merged into adaptive view
- **WHEN** a user views their energy balance
- **THEN** the system SHALL display TDEE broken into BMR + sport calories + step NEAT components
- **THEN** the breakdown SHALL appear in the "Current Status" card of the adaptive planning view

#### Scenario: Merge from energy.js
- **WHEN** the energy balance view renders
- **THEN** the system SHALL use the TDEE breakdown render logic from energy.js, integrated into adaptive.js's loadStatus()
- **THEN** the standalone energy.js file SHALL be deleted after successful merge

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

The system SHALL display recomp status clearly, including what data is missing when detection cannot run.

#### Scenario: Recomp card shows status
- **WHEN** 4+ measurement sets exist with waist, neck, hips data
- **THEN** the system SHALL display a chart showing weight vs waist over time
- **THEN** the system SHALL display recomp status: detected or not detected

#### Scenario: Missing data guidance
- **WHEN** fewer than 4 measurement sets exist
- **THEN** the system SHALL display "Se necesitan 4+ mediciones con cintura, cuello y cadera"
- **WHEN** waist, neck, or hips data is missing from existing sets
- **THEN** the system SHALL display which metrics are missing

### Requirement: Adherence evaluation with recommendations

The system SHALL display adherence as a visual gauge with specific recommendations.

#### Scenario: Adherence gauge renders
- **WHEN** weight data exists
- **THEN** the system SHALL display a progress bar or gauge showing current loss rate vs target
- **THEN** the system SHALL display consistency score (weeks within 0.2 kg of target)

#### Scenario: Specific recommendations
- **WHEN** actual rate is below target by >0.2 kg/week
- **THEN** the system SHALL suggest "Aumentar déficit en X kcal/día"
- **WHEN** actual rate is on track
- **THEN** the system SHALL display "Mantener ritmo actual"

### Requirement: Deficit impact vs PDF baseline

The system SHALL compare current intake against the PDF baseline diet.

#### Scenario: PDF baseline comparison
- **WHEN** meal_components are seeded and daily_plan_entries exist
- **THEN** the system SHALL show "Tu dieta actual: X kcal vs PDF base: Y kcal — Diferencia: Z kcal"
- **WHEN** no daily plan data exists
- **THEN** the system SHALL show the PDF baseline as reference only
