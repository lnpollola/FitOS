## ADDED Requirements

### Requirement: Set initial fat-loss target

The system SHALL allow the user to set a target weight-loss pace (e.g., 0.5 kg or 1 lb per week) and compute an initial daily calorie deficit from their estimated TDEE.

#### Scenario: Set target pace

- **WHEN** a user selects a target weight-loss pace of 0.5 kg per week
- **THEN** the system SHALL compute a daily deficit of approximately 550 kcal and display the resulting daily calorie target

#### Scenario: Target pace bounds enforced

- **WHEN** a user attempts to set a target pace exceeding 1 kg per week
- **THEN** the system SHALL reject the selection and suggest a range of 0.25–1.0 kg per week with a warning about safe loss rates

### Requirement: Adjust calorie target based on trend weight and adherence

The system SHALL evaluate each week whether the user is on track by comparing trend weight loss against the target pace and adjust the calorie target accordingly.

#### Scenario: On track — no adjustment

- **WHEN** the user's weekly trend weight loss is within 20% of the target pace
- **THEN** the system SHALL keep the current calorie target unchanged and display "on track" status

#### Scenario: Falling behind — deficit increase

- **WHEN** the user's weekly trend weight loss is less than 80% of the target pace
- **THEN** the system SHALL suggest a deficit increase of up to 100 kcal and display the new recommended target alongside the current target

#### Scenario: Losing too fast — deficit decrease

- **WHEN** the user's weekly trend weight loss exceeds 120% of the target pace
- **THEN** the system SHALL suggest a deficit reduction of 100–150 kcal to slow the pace

#### Scenario: Unsafe deficit prevented

- **WHEN** the adjusted calorie target would fall below the safe minimum (1200 kcal for women, 1500 kcal for men)
- **THEN** the system SHALL cap the target at the safe minimum and display an alert explaining the limit

### Requirement: User must approve target changes

The system SHALL present adaptive target adjustments as recommendations that the user must explicitly accept or dismiss before they take effect.

#### Scenario: Accept recommendation

- **WHEN** the system proposes a new calorie target and the user taps "Accept"
- **THEN** the system SHALL update the active daily calorie target and log the adjustment

#### Scenario: Dismiss recommendation

- **WHEN** the system proposes a new calorie target and the user taps "Dismiss"
- **THEN** the system SHALL keep the current target unchanged and log that the recommendation was dismissed
