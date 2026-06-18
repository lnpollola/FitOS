## ADDED Requirements

### Requirement: Set initial fat-loss target

The system SHALL allow the user to set a target weight-loss pace (e.g., 0.5 kg per week) and compute an initial daily calorie deficit from their estimated TDEE.

#### Scenario: Set target pace

- **WHEN** a user selects a target weight-loss pace of 0.5 kg per week
- **THEN** the system SHALL compute a daily deficit of approximately 550 kcal and display the resulting daily calorie target

#### Scenario: Target pace bounds enforced

- **WHEN** a user attempts to set a target pace exceeding 1 kg per week
- **THEN** the system SHALL reject the selection and suggest a range of 0.25–1.0 kg per week with a warning about safe loss rates

### Requirement: Adjust diet plan based on trend weight

The system SHALL evaluate each week whether the user is on track by comparing trend weight loss against the target pace and suggest slot-level gram adjustments to the diet plan.

#### Scenario: On track — no adjustment

- **WHEN** the user's weekly trend weight loss is within 20% of the target pace
- **THEN** the system SHALL keep the current diet plan unchanged and display "on track" status

#### Scenario: Falling behind — increase deficit via slot reduction

- **WHEN** the user's weekly trend weight loss is less than 80% of the target pace
- **THEN** the system SHALL suggest reducing carb or fat gram amounts across specific meal slots to increase the deficit, showing the new recommended gram amounts

#### Scenario: Losing too fast — decrease deficit via slot increase

- **WHEN** the user's weekly trend weight loss exceeds 120% of the target pace
- **THEN** the system SHALL suggest increasing carb gram amounts in specific meal slots to reduce the deficit

#### Scenario: Unsafe deficit prevented

- **WHEN** the adjusted calorie target would fall below the safe minimum (1200 kcal for women, 1500 kcal for men)
- **THEN** the system SHALL cap the target at the safe minimum and display an alert explaining the limit

### Requirement: Incorporate body measurements into adjustment logic

The system SHALL use body measurement trends (waist, hips, chest, etc.) and estimated body fat percentage alongside weight data to evaluate fat-loss progress.

#### Scenario: Weight stagnant but measurements improving

- **WHEN** trend weight has not changed significantly but waist and hip measurements show a decreasing trend over 4+ weeks
- **THEN** the system SHALL display a "body recomposition detected" status and avoid suggesting deficit increases

#### Scenario: Estimated body fat used as secondary metric

- **WHEN** the user has at least 2 sets of body measurements with a calculated body fat % estimate
- **THEN** the system SHALL display estimated body fat trend alongside weight trend and use it to inform adjustment recommendations

### Requirement: User must approve slot-level changes

The system SHALL present adaptive gram adjustments as recommendations that the user must explicitly accept, dismiss, or modify before they take effect.

#### Scenario: Accept recommendation

- **WHEN** the system proposes new gram amounts for specific meal slots and the user taps "Accept"
- **THEN** the system SHALL update the active diet plan with the new gram amounts and log the adjustment

#### Scenario: Dismiss recommendation

- **WHEN** the system proposes new gram amounts and the user taps "Dismiss"
- **THEN** the system SHALL keep the current gram amounts unchanged and log that the recommendation was dismissed

#### Scenario: Modify recommendation

- **WHEN** the system proposes new gram amounts and the user manually adjusts them before confirming
- **THEN** the system SHALL save the user's custom values and log the adjustment as manually modified
