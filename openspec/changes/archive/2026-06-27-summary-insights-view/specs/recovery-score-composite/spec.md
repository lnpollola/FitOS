## ADDED Requirements

### Requirement: Recovery score is a personal-baseline-normalized composite

The system SHALL compute a 0–100 recovery score from three signals over a 7-day rolling window, normalized against each signal's 30-day personal baseline. The composite SHALL be `0.4 × hrv_sub + 0.3 × (100 - rhr_sub) + 0.3 × sleep_sub`, clamped to `[0, 100]`, where each sub-score is a baseline-normalized 0–100 value. The composite SHALL be color-coded by zone: `low` < 40, `moderate` 40–70, `high` > 70. A 7-day sparkline of the composite SHALL render below the main number.

#### Scenario: Composite score is computed correctly
- **WHEN** the 7-day mean HRV is 50 ms, the 30-day baseline mean is 45 ms with stdDev 5 ms
- **THEN** the HRV z-score SHALL be `(50 - 45) / 5 = 1.0`
- **THEN** the HRV sub-score SHALL be `50 + 15 × 1.0 = 65`
- **WHEN** the 7-day mean RHR is 60 bpm, the 30-day baseline mean is 65 bpm with stdDev 3 bpm
- **THEN** the RHR z-score SHALL be `(60 - 65) / 3 = -1.67` (RHR is good when below baseline, so we invert)
- **THEN** the RHR sub-score SHALL be `50 - 15 × -1.67 = 75` (clamped from 75.05)
- **WHEN** the 7-day mean sleep is 7.5 hours, the 30-day baseline mean is 7.0 hours with stdDev 0.5 hours
- **THEN** the sleep z-score SHALL be `(7.5 - 7.0) / 0.5 = 1.0`
- **THEN** the sleep sub-score SHALL be `50 + 15 × 1.0 = 65`
- **THEN** the composite SHALL be `0.4 × 65 + 0.3 × (100 - 75) + 0.3 × 65 = 26 + 7.5 + 19.5 = 53`

#### Scenario: Composite clamped to [0, 100]
- **WHEN** the 7-day z-scores produce sub-scores that sum to > 100
- **THEN** the composite SHALL be clamped to 100
- **WHEN** the 7-day z-scores produce sub-scores that sum to < 0
- **THEN** the composite SHALL be clamped to 0

#### Scenario: Recovery score empty state (insufficient baseline)
- **WHEN** the user has fewer than 30 days of HRV data, OR fewer than 30 days of RHR data, OR fewer than 30 days of sleep data
- **THEN** the recovery score card SHALL render in the empty state with the message: "Necesitas al menos 30 días de datos de HRV, RHR y sueño para calcular tu línea base personal"
- **THEN** the card SHALL show a progress indicator: "Faltan X días para tu primera puntuación de recuperación"
- **THEN** no sub-meters or composite number SHALL be rendered

#### Scenario: Recovery score with one signal missing
- **WHEN** the user has 30+ days of HRV and RHR data, but < 30 days of sleep data
- **THEN** the system SHALL compute the composite with HRV and RHR only, scaling their weights to 0.4 and 0.3 (total 0.7) and treating sleep as 50 (neutral)
- **THEN** the sleep sub-meter SHALL render in a disabled state with a "Datos insuficientes" label
- **THEN** a note SHALL appear: "Composite calculado con 2/3 señales"

### Requirement: Sub-meters show individual signal contribution

The system SHALL render three sub-meters below the composite number, one per signal (HRV, RHR, Sleep), each showing: the signal name, the current 7-day value, the 30-day baseline value, and a horizontal bar showing the sub-score (0–100). Sub-meters SHALL be color-coded by their own sub-score zone (`low` / `moderate` / `high`).

#### Scenario: HRV sub-meter
- **WHEN** the recovery score renders
- **THEN** the HRV sub-meter SHALL show: "HRV", current 7-day mean (e.g., "50 ms"), 30-day baseline (e.g., "45 ms"), and a horizontal bar at the sub-score value
- **THEN** the bar SHALL be filled with the zone color (`low` = ember, `moderate` = moss-mist, `high` = moss)

#### Scenario: RHR sub-meter (inverted)
- **WHEN** the recovery score renders
- **THEN** the RHR sub-meter SHALL show: "RHR", current 7-day mean, 30-day baseline, and a bar
- **THEN** the sub-score SHALL be inverted (lower RHR = higher sub-score)
- **THEN** the bar color SHALL match the inverted sub-score zone

#### Scenario: Sleep sub-meter
- **WHEN** the recovery score renders
- **THEN** the sleep sub-meter SHALL show: "Sueño", current 7-day mean (hours), 30-day baseline, and a bar
- **THEN** the sub-score SHALL be directly proportional to sleep duration relative to baseline

### Requirement: IPC handler returns composite and per-day sub-scores

The system SHALL provide `db:getRecoveryScore()` in `src/main/handlers/insights-handlers.js` that returns `{ composite, zone, signals: { hrv: {...}, rhr: {...}, sleep: {...} }, sparkline: [...], baseline_complete: bool, days_until_baseline: int }`. The handler SHALL query HealthSync `hrv` and `resting_heart_rate` tables for daily aggregates, and `activity_days.sleep_hours` for sleep.

#### Scenario: Handler returns full payload with baseline
- **WHEN** the user has 30+ days of HRV, RHR, and sleep data
- **THEN** the handler SHALL return `baseline_complete: true`, `days_until_baseline: 0`
- **THEN** `composite` SHALL be a number in [0, 100]
- **THEN** `zone` SHALL be one of `low`, `moderate`, `high`
- **THEN** `signals.hrv`, `signals.rhr`, `signals.sleep` SHALL each contain `{ current_7d, baseline_30d, stddev_30d, sub_score, zone }`
- **THEN** `sparkline` SHALL be an array of 7 daily composite values (most recent first)

#### Scenario: Handler returns incomplete baseline
- **WHEN** the user has 15 days of HRV, RHR, and sleep data
- **THEN** the handler SHALL return `baseline_complete: false`, `days_until_baseline: 15`
- **THEN** `composite`, `zone`, and `signals` SHALL be null
- **THEN** the renderer SHALL display the empty state
