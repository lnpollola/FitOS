# CSS Component Files (delta)

## ADDED Requirements

### Requirement: No duplicate class definitions across CSS files

Each CSS class SHALL be defined in exactly one file under `src/renderer/styles/`, in the file matching its domain (tokens/reset → `base.css`, layout/sidebar → `layout.css`, cards/panels → `cards.css`, forms/buttons → `forms.css`, tables → `tables.css`, helpers → `utilities.css`). The current 72 duplicated class names (e.g., `.card` defined in three files, `.btn`, `.form-group`, `.empty-state`) SHALL be consolidated to a single definition each, preserving the visually winning rule (by `main.css` import order) when duplicate definitions differ.

#### Scenario: Zero cross-file duplicates
- **WHEN** all files under `src/renderer/styles/` are scanned for top-level class selectors
- **THEN** no class name SHALL appear as a definition in more than one file

#### Scenario: No visual regression
- **GIVEN** a duplicated class whose definitions differ across files
- **WHEN** the duplicate is consolidated
- **THEN** the retained rule SHALL be the one that previously won by import order
- **THEN** rendered views SHALL remain visually unchanged

### Requirement: CSS uniqueness enforced by test

The system SHALL include an automated test that parses `src/renderer/styles/*.css` and fails if any top-level class selector is defined in more than one file.

#### Scenario: Test fails on new duplication
- **GIVEN** a developer adds `.card { ... }` to `utilities.css`
- **WHEN** `npm test` runs
- **THEN** the CSS uniqueness test SHALL fail, naming the duplicated class and files
