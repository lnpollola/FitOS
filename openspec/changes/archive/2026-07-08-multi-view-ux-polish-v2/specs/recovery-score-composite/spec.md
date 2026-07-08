## MODIFIED Requirements

### Requirement: Recovery score is a personal-baseline-normalized composite

The system SHALL compute a 0–100 recovery score from three signals over a 7-day rolling window, normalized against each signal's 30-day personal baseline. The composite SHALL be `0.4 × hrv_sub + 0.3 × rhr_sub + 0.3 × sleep_sub`, clamped to `[0, 100]`, where each sub-score is a baseline-normalized 0–100 value. The `rhr_sub` is already computed with inversion (higher RHR = lower sub-score), so NO additional `100 -` inversion SHALL be applied. The composite SHALL be color-coded by zone: `low` < 40, `moderate` 40–70, `high` > 70. A 7-day sparkline of the composite SHALL render below the main number in chronological order (oldest left, newest right).

#### Scenario: Composite score is computed correctly
- **WHEN** the 7-day mean HRV is 50 ms, the 30-day baseline mean is 45 ms with stdDev 5 ms
- **THEN** the HRV z-score SHALL be `(50 - 45) / 5 = 1.0`
- **THEN** the HRV sub-score SHALL be `50 + 15 × 1.0 = 65`
- **WHEN** the 7-day mean RHR is 60 bpm, the 30-day baseline mean is 65 bpm with stdDev 3 bpm
- **THEN** the RHR z-score SHALL be `(60 - 65) / 3 = -1.67`
- **THEN** the RHR sub-score SHALL be `50 - 15 × -1.67 = 75` (inverted: lower RHR = higher score)
- **WHEN** the 7-day mean sleep is 7.5 hours, the 30-day baseline mean is 7.0 hours with stdDev 0.5 hours
- **THEN** the sleep z-score SHALL be `(7.5 - 7.0) / 0.5 = 1.0`
- **THEN** the sleep sub-score SHALL be `50 + 15 × 1.0 = 65`
- **THEN** the composite SHALL be `0.4 × 65 + 0.3 × 75 + 0.3 × 65 = 26 + 22.5 + 19.5 = 68`

#### Scenario: Recovery score empty state (insufficient baseline)
- **WHEN** the user has fewer than 30 days of HRV data, OR fewer than 30 days of RHR data
- **THEN** the recovery score card SHALL render in the empty state
- **THEN** the card SHALL show a progress indicator: "Faltan X días para tu primera puntuación de recuperación"

#### Scenario: Recovery score with one signal missing
- **WHEN** the user has 30+ days of HRV and RHR data, but < 30 days of sleep data
- **THEN** the system SHALL compute the composite with HRV and RHR only
- **THEN** the sleep sub-meter SHALL render in a disabled state with "Datos insuficientes"

### Requirement: Sub-meters show individual signal contribution with explanations

The system SHALL render three sub-meters below the composite number, one per signal (HRV, RHR, Sleep), each showing: the signal name with an explanation tooltip, the current 7-day value, the 30-day baseline value, and a horizontal bar showing the sub-score (0–100). Tooltips SHALL explain in Spanish:
- HRV: "Variabilidad del ritmo cardíaco — indica recuperación del sistema nervioso"
- RHR: "Frecuencia cardíaca en reposo — indica fatiga general"
- Sleep: "Duración y calidad del sueño — indica recuperación física"

#### Scenario: HRV sub-meter with tooltip
- **WHEN** the recovery score renders
- **THEN** the HRV sub-meter SHALL show "HRV" with an info icon
- **WHEN** the user hovers over the info icon
- **THEN** a tooltip SHALL display "Variabilidad del ritmo cardíaco — indica recuperación del sistema nervioso"

#### Scenario: RHR sub-meter with tooltip
- **WHEN** the recovery score renders
- **THEN** the RHR sub-meter SHALL show "RHR" with an info icon
- **WHEN** the user hovers over the info icon
- **THEN** a tooltip SHALL display "Frecuencia cardíaca en reposo — indica fatiga general"

#### Scenario: Sleep sub-meter with tooltip
- **WHEN** the recovery score renders
- **THEN** the Sleep sub-meter SHALL show "Sueño" with an info icon
- **WHEN** the user hovers over the info icon
- **THEN** a tooltip SHALL display "Duración y calidad del sueño — indica recuperación física"

#### Scenario: Recovery trend sparkline renders correctly
- **WHEN** the recovery score has 7 days of sparkline data
- **THEN** the sparkline SHALL render with oldest data on the left and newest on the right
- **THEN** the sparkline SHALL NOT be truncated or show empty segments
