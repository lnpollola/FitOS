## MODIFIED Requirements

### Requirement: Goal progress calculation supports directional goals

The system SHALL calculate progress percentage based on the goal type and direction. For `weight` type goals, the system SHALL determine direction by comparing `startWeight` (first weight entry at or before `startDate`) against `target`:
- If `target < startWeight` (weight loss): `progress = (startWeight - current) / (startWeight - target) × 100`
- If `target > startWeight` (weight gain): `progress = (current - startWeight) / (target - startWeight) × 100`

For `distance` and `frequency` types, the existing accumulation formula SHALL remain: `progress = current / target × 100`.

Progress SHALL be clamped to `[0, 100]`. If no `startWeight` can be determined (no weight entries near startDate), the system SHALL return `progress_pct: 0` with a note "Sin datos de peso iniciales".

#### Scenario: Weight loss goal progress
- **WHEN** a weight loss goal has startWeight = 95 kg, target = 90 kg, current = 93 kg
- **THEN** progress SHALL be `(95 - 93) / (95 - 90) × 100 = 40%`

#### Scenario: Weight loss goal completed
- **WHEN** a weight loss goal has startWeight = 95 kg, target = 90 kg, current = 89 kg
- **THEN** progress SHALL be clamped to 100%

#### Scenario: Weight loss goal no progress
- **WHEN** a weight loss goal has startWeight = 95 kg, target = 90 kg, current = 95 kg
- **THEN** progress SHALL be 0%

#### Scenario: Weight gain goal progress
- **WHEN** a weight gain goal has startWeight = 60 kg, target = 65 kg, current = 62 kg
- **THEN** progress SHALL be `(62 - 60) / (65 - 60) × 100 = 40%`

#### Scenario: No starting weight available
- **WHEN** a weight goal has no weight entries at or before startDate
- **THEN** the system SHALL return `{ ok: true, current: 0, target: 90, progress_pct: 0 }`
- **THEN** the UI SHALL display "Sin datos de peso iniciales" as the progress subtitle

#### Scenario: Distance goal unchanged
- **WHEN** a distance goal has target = 100 km and current = 45 km
- **THEN** progress SHALL be `45 / 100 × 100 = 45%`

#### Scenario: Frequency goal unchanged
- **WHEN** a frequency goal has target = 4 sessions/week and current = 3
- **THEN** progress SHALL be `3 / 4 × 100 = 75%`
