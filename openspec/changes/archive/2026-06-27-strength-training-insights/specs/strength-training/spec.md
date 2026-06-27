## MODIFIED Requirements

### Requirement: Track strength progression over time

The system SHALL display historical load, volume, and rep-max data per exercise across all logged sessions. Empty chart sections SHALL render placeholder content explaining what they will show when data becomes available, or SHALL be hidden if no data can ever populate them. The system SHALL also compute estimated 1RM per set using the Epley formula (`load × (1 + reps / 30)`) and display it alongside the existing progression view in the training view. The estimated 1RM and volume SHALL be surfaced in the new strength training insights section within the insights view.

#### Scenario: View exercise progression chart
- **WHEN** a user selects an exercise (e.g., bench press) in the progression view
- **THEN** the system SHALL display a chart of estimated 1RM or top set load over time with session dates on the x-axis

#### Scenario: Compare last session to previous
- **WHEN** a user views a completed session
- **THEN** the system SHALL show delta indicators (▲/▼) next to each exercise comparing load and volume to the most recent previous session for that exercise

#### Scenario: Placeholder states for empty charts
- **WHEN** no training session data exists
- **THEN** the progression chart section SHALL display a placeholder with text "Registra sesiones para ver tu progresión"
- **THEN** the strength maintenance section SHALL display "Registra al menos 2 semanas de entrenamiento para ver el estado de mantenimiento"

#### Scenario: Empty charts hidden when permanently empty
- **WHEN** a chart section has no applicable data source (not just missing data)
- **THEN** the section SHALL be hidden rather than showing a perpetual empty state

#### Scenario: Estimated 1RM shown in training view set list
- **WHEN** a user views the sets of a training session
- **THEN** each set row SHALL display the estimated 1RM (Epley) in a dedicated column after RPE
- **THEN** the 1RM column header SHALL read "1RM est."
