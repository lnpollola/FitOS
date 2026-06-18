## ADDED Requirements

### Requirement: Compute estimated total daily expenditure

The system SHALL compute an estimated total daily energy expenditure (TDEE) using the Mifflin-St Jeor formula with an activity multiplier derived from the user's imported activity data.

#### Scenario: TDEE computed from profile and activity

- **WHEN** the user has a profile with age, sex, height, weight and at least 7 days of activity data
- **THEN** the system SHALL compute and display the estimated TDEE for each day

#### Scenario: TDEE unavailable with insufficient data

- **WHEN** the user has fewer than 7 days of activity data or an incomplete profile
- **THEN** the system SHALL display TDEE as "pending — more data needed" rather than showing an inaccurate estimate

### Requirement: Calculate daily calorie balance

The system SHALL compare estimated expenditure against logged intake for each day and classify the balance as surplus, maintenance, or deficit.

#### Scenario: Deficit classification

- **WHEN** daily intake is less than daily expenditure by more than 100 kcal
- **THEN** the system SHALL display a deficit badge with the numeric gap in kcal

#### Scenario: Surplus classification

- **WHEN** daily intake exceeds daily expenditure by more than 100 kcal
- **THEN** the system SHALL display a surplus badge with the numeric excess in kcal

#### Scenario: Maintenance classification

- **WHEN** daily intake is within 100 kcal of daily expenditure
- **THEN** the system SHALL display a maintenance badge

### Requirement: Display weekly balance summary

The system SHALL aggregate daily balances into a weekly view showing net balance, average deficit/surplus, and number of days in each zone.

#### Scenario: Weekly summary calculated

- **WHEN** a user views the weekly energy balance for a given week with 5+ logged days
- **THEN** the system SHALL show net weekly balance, average daily balance, and a count of deficit/maintenance/surplus days

#### Scenario: Incomplete week warning

- **WHEN** a user views a week with fewer than 5 logged days
- **THEN** the system SHALL display the available data but show a warning that the week is incomplete
