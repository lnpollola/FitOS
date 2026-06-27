# Waist Hip Ratio Card

## Purpose

Show the latest waist-to-hip ratio from measurements with WHO/OMS zone classification, a color-coded chip, and a 90-day sparkline of WHR values.

## Requirements

### Requirement: WHR card shows latest ratio with WHO/OMS zone classification

The system SHALL compute the latest waist-to-hip ratio (WHR) from `measurement_sets` using the most recent row where both `waist` and `hips` are non-null, and SHALL classify the ratio into a WHO/OMS zone based on the user's `sex` from `user_profile`. The card SHALL display the WHR value as a large number, the zone label, a color-coded chip, and a 90-day sparkline of WHR values.

#### Scenario: Male user with WHR in moderate zone
- **WHEN** the user has `user_profile.sex = 'M'` and the latest measurement_sets row has `waist = 88, hips = 100`
- **THEN** the WHR SHALL be `88 / 100 = 0.88`
- **THEN** the zone SHALL be "moderado" (men: 0.90–0.99)
- **THEN** the chip SHALL be color-coded with the moderate zone color (`var(--moss-mist)` background, `var(--moss-ink)` text)

#### Scenario: Female user with WHR in low zone
- **WHEN** the user has `user_profile.sex = 'F'` and the latest measurement_sets row has `waist = 70, hips = 100`
- **THEN** the WHR SHALL be `0.70`
- **THEN** the zone SHALL be "bajo" (women: < 0.80)
- **THEN** the chip SHALL be color-coded green (`var(--moss)` background, white text)

#### Scenario: WHR zone boundaries
- **WHEN** the user is male and WHR is exactly 0.90
- **THEN** the zone SHALL be "moderado" (boundary belongs to the higher zone)
- **WHEN** the user is female and WHR is exactly 0.85
- **THEN** the zone SHALL be "alto" (boundary belongs to the higher zone)

#### Scenario: WHR with no profile sex
- **WHEN** the user has not set `user_profile.sex`
- **THEN** the WHR value SHALL be displayed without a zone classification
- **THEN** a CTA SHALL appear: "Completa tu perfil (sexo) para clasificar tu WHR"

#### Scenario: WHR with no measurements
- **WHEN** the user has zero `measurement_sets` rows
- **THEN** the WHR card SHALL render in the empty state with: "Registra medidas corporales (cintura y cadera) para ver tu WHR"
- **THEN** a CTA button SHALL navigate to the `measurements` view

#### Scenario: WHR with no hips measurement
- **WHEN** the user has measurement_sets rows with `waist` but never with `hips`
- **THEN** the WHR card SHALL render in the empty state with: "Falta la medida de cadera. Registra cadera y cintura en la misma fecha"

### Requirement: 90-day WHR sparkline shows trend

The system SHALL render a 90-day sparkline of WHR values below the main number, showing WHR computed from each `measurement_sets` row in the trailing 90 days. The sparkline SHALL use `var(--moss)` for the line and `var(--moss-mist)` for the area fill.

#### Scenario: Sparkline with multiple measurements
- **WHEN** the user has 3+ `measurement_sets` rows in the trailing 90 days
- **THEN** the sparkline SHALL show 3+ data points connected by a line
- **THEN** the sparkline SHALL be 80×24 px
- **THEN** the x-axis SHALL span the 90-day window

#### Scenario: Sparkline with single measurement
- **WHEN** the user has exactly 1 `measurement_sets` row in the trailing 90 days
- **THEN** the sparkline SHALL show a single dot with no connecting line
- **THEN** the WHR card SHALL still display the current value

### Requirement: IPC handler returns WHR data

The system SHALL provide `db:getWHR()` in `src/main/handlers/insights-handlers.js` that returns `{ current: { value, date, zone, zone_label } | null, history: [{ date, value }], sex: string | null, has_measurements: bool }`. The handler SHALL read the latest measurement_sets row, all rows in the trailing 90 days, and the user_profile sex.

#### Scenario: Handler returns complete WHR data
- **WHEN** the user has measurement_sets rows with both waist and hips, and user_profile.sex is set
- **THEN** `current.value` SHALL be a number rounded to 2 decimal places
- **THEN** `current.zone` SHALL be one of `low`, `moderate`, `high`
- **THEN** `current.zone_label` SHALL be the Spanish label (e.g., "Bajo", "Moderado", "Alto")
- **THEN** `history` SHALL contain one entry per measurement_sets row in the trailing 90 days where both waist and hips are non-null

#### Scenario: Handler returns no WHR data
- **WHEN** the user has no measurement_sets rows with both waist and hips
- **THEN** `current` SHALL be null
- **THEN** `has_measurements` SHALL be false
- **THEN** `history` SHALL be an empty array
