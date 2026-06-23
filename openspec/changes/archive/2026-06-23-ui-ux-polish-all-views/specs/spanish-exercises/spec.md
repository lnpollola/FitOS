# Spanish Exercises

## ADDED Requirements

### Requirement: Exercise library translated to Spanish

The system SHALL store and display all exercise names and muscle group labels in Spanish. The `exercise_library` table SHALL be migrated from English names to Spanish equivalents. Exercises requiring equipment not commonly available in a home gym SHALL be removed.

#### Scenario: Exercise names in Spanish
- **WHEN** the training view renders the exercise library
- **THEN** exercise names SHALL be in Spanish (e.g., "Press de banca" not "Bench Press", "Sentadilla" not "Squat", "Peso muerto" not "Deadlift")
- **THEN** muscle group labels SHALL be in Spanish (e.g., "Pecho" not "Chest", "Pierna" not "Legs", "Espalda" not "Back")

#### Scenario: Home-gym-relevant exercises only
- **WHEN** the exercise library renders
- **THEN** exercises requiring cable machines, Smith machine, leg press machine, or other commercial gym equipment SHALL be excluded
- **THEN** exercises executable with barbell, dumbbell, bodyweight, or resistance bands SHALL remain

#### Scenario: Migration preserves custom data
- **WHEN** the migration updates English exercise names to Spanish
- **THEN** exercise `id` and `practical_examples` columns SHALL be preserved
- **THEN** only `name` and `muscle_group` columns SHALL be updated for matching entries
- **THEN** any exercise not matching the English-to-Spanish mapping SHALL be flagged for manual review

### Requirement: Seed data exercises in Spanish

The system SHALL update `seed-data.js` to seed exercises with Spanish names and muscle groups, removing English entries.

#### Scenario: Seed data seeded in Spanish
- **WHEN** the app initializes with an empty `exercise_library` table
- **THEN** the system SHALL seed ~50 exercises with Spanish names and muscle groups
- **THEN** no English exercise names SHALL be present in the library
