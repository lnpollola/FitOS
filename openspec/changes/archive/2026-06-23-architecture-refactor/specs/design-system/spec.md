## MODIFIED Requirements

### Requirement: Design token system for spacing, elevation, and z-index

The system SHALL define a unified set of CSS custom properties for spacing, elevation, and z-index in `src/renderer/styles/base.css` (extracted from `main.css`). All views and components SHALL reference these tokens instead of hardcoded pixel values. The CSS SHALL be organized by component in separate files (`base.css`, `layout.css`, `cards.css`, `forms.css`, `tables.css`, `utilities.css`) with `main.css` as an import-only entry point.

#### Scenario: Spacing scale defined in base.css
- **WHEN** a developer opens `src/renderer/styles/base.css`
- **THEN** the `:root` selector SHALL contain `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-6: 24px`, `--space-8: 32px`

#### Scenario: CSS organized by component
- **WHEN** a developer navigates `src/renderer/styles/`
- **THEN** separate files SHALL exist for base, layout, cards, forms, tables, and utilities
- **THEN** `main.css` SHALL contain only `@import` directives
