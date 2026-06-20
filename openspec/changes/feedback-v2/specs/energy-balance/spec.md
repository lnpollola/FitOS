# Energy Balance

## Purpose

Merge orphaned energy.js TDEE breakdown (BMR, sport calories, step NEAT) into the live adaptive.js view. Remove dead code.

## Requirements

### MODIFIED Requirements

### Requirement: Compute TDEE from BMR plus real sport activity

The system SHALL compute total daily energy expenditure (TDEE) as BMR plus calories burned in sport activities plus step-based NEAT. The breakdown SHALL be displayed in the adaptive planning view.

#### Scenario: TDEE breakdown merged into adaptive view
- **WHEN** a user views their energy balance
- **THEN** the system SHALL display TDEE broken into BMR + sport calories + step NEAT components
- **THEN** the breakdown SHALL appear in the "Current Status" card of the adaptive planning view

#### Scenario: Merge from energy.js
- **WHEN** the energy balance view renders
- **THEN** the system SHALL use the TDEE breakdown render logic from energy.js, integrated into adaptive.js's loadStatus()
- **THEN** the standalone energy.js file SHALL be deleted after successful merge

### REMOVED Requirements

### Requirement: Daily balance view (removed from energy.js)

**Reason**: The energy.js file is dead code being deleted. Its daily balance date-picker view is superseded by the adaptive planning view.

**Migration**: All TDEE calculation and display functionality is preserved in adaptive.js.
