# Energy Balance (v3)

## Purpose

Improve the adaptive planning view with clear recomp detection visibility, adherence evaluation with recommendations, and deficit impact display compared to the PDF diet baseline.

## Requirements

### ADDED Requirements

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
