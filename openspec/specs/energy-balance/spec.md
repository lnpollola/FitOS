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

The system SHALL compute total daily energy expenditure (TDEE) as BMR plus calories burned in sport activities (imported from Apple Watch) plus a small NEAT estimate from daily steps.

#### Scenario: TDEE computed from activity data
- **WHEN** the user has BMR and at least one day with activity data including sport workouts
- **THEN** the system SHALL compute TDEE by adding BMR + sport activity calories + step-based NEAT (steps × 0.04 kcal/step)

#### Scenario: TDEE breakdown view
- **WHEN** a user views their daily energy balance
- **THEN** the system SHALL display TDEE broken into BMR + sport calories + step NEAT components

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
