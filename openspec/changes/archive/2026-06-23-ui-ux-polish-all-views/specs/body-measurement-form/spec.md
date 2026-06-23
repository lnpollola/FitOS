# Body Measurement Form

## ADDED Requirements

### Requirement: Body-part-grouped measurement input form

The system SHALL organize the measurement input form into 4 fieldsets grouped by body part, each with a representative Lucide icon in the legend. All fields SHALL be visible simultaneously (not stepped wizard). Fields SHALL pre-fill with last known values.

#### Scenario: Fieldsets grouped by body part
- **WHEN** the measurement form renders
- **THEN** 4 fieldsets SHALL be displayed:
  - "Cuello y Hombros" (icon: `ruler`) — cuello, hombros
  - "Torso" (icon: `scan-line`) — pecho, cintura, cadera
  - "Brazos" (icon: `armchair` or `dumbbell`) — bíceps izq, bíceps der, antebrazo izq, antebrazo der
  - "Piernas" (icon: `footprints`) — muslo izq, muslo der, pantorrilla izq, pantorrilla der
- **THEN** each fieldset SHALL display its icon in the `<legend>`

#### Scenario: Fields pre-fill with last values
- **WHEN** previous measurement data exists
- **THEN** all input fields SHALL be pre-filled with the most recent value for each metric
- **THEN** placeholder text SHALL show the metric name and unit (e.g., "Pecho (cm)")

#### Scenario: No previous data
- **WHEN** no measurement data exists
- **THEN** all inputs SHALL be empty with placeholder showing metric name and unit

### Requirement: All measurement metrics accessible

The system SHALL ensure all measurement metric types defined in the schema are present in the form. Any missing metrics SHALL be added to both the form and the database schema.

#### Scenario: Complete metric coverage
- **WHEN** the measurement form renders
- **THEN** the following metrics SHALL have input fields: chest, neck, shoulders, biceps_left, biceps_right, forearm_left, forearm_right, waist, hips, thigh_left, thigh_right, calf_left, calf_right, weight_kg
- **THEN** all 13 metrics SHALL be grouped into the 4 fieldsets

### Requirement: Form submission saves all fields

The system SHALL save all measurement fields in a single transaction on form submission. Validation SHALL ensure at least one metric has a non-empty value.

#### Scenario: Submit complete measurement set
- **WHEN** user fills all fields and clicks "Guardar"
- **THEN** all 13 metrics plus date SHALL be saved as a single measurement_set row
- **THEN** a success notification SHALL appear

#### Scenario: Partial submission allowed
- **WHEN** user fills only some fields (at least one non-empty) and clicks "Guardar"
- **THEN** the system SHALL save the partial set with empty fields stored as NULL
- **THEN** no validation error SHALL block partial saves

#### Scenario: Empty submission rejected
- **WHEN** user clicks "Guardar" with all fields empty
- **THEN** the system SHALL display "Completa al menos una medida"
- **THEN** no empty row SHALL be inserted
