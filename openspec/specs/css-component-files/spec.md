# CSS Component Files

## Purpose

Organize CSS by component category into separate files with `main.css` as an import-only entry point, improving maintainability and developer navigation.

## Requirements

### Requirement: CSS organized by component files

The system SHALL split `src/renderer/styles/main.css` into separate files by component category, with `main.css` serving as an import-only entry point. Vite SHALL resolve `@import` directives during build.

#### Scenario: CSS split into component files
- **WHEN** the build completes
- **THEN** `styles/base.css` SHALL contain `:root` custom properties, reset, typography declarations, and scrollbar styles
- **THEN** `styles/layout.css` SHALL contain `.app-layout`, `.sidebar`, `.main-content`, `.view` rules
- **THEN** `styles/cards.css` SHALL contain `.card`, `.card-accent`, `.dashboard-card`, `.card-hero`, `.compliance-*` rules
- **THEN** `styles/forms.css` SHALL contain `.form-group`, `input`, `select`, `textarea`, `.btn`, `.tag`, `.filter-btn` rules
- **THEN** `styles/tables.css` SHALL contain `.data-table`, `.data-table-wrapper`, `.data-table-pagination` rules
- **THEN** `styles/utilities.css` SHALL contain `.text-xs`, `.text-sm`, `.text-muted`, flex helpers, skeleton classes

#### Scenario: main.css is import-only
- **WHEN** a developer opens `src/renderer/styles/main.css`
- **THEN** the file SHALL contain only `@import` directives referencing the component CSS files
- **THEN** no style rules SHALL appear directly in `main.css`

#### Scenario: index.html references only main.css
- **WHEN** the application loads
- **THEN** `index.html` SHALL reference only `styles/main.css` via a single `<link>` tag
- **THEN** no additional `<link>` tags for component CSS files SHALL exist

#### Scenario: Build produces single CSS output
- **WHEN** `npm run build` completes
- **THEN** the dist output SHALL contain a single CSS bundle
- **THEN** no visual regressions SHALL occur compared to pre-split rendering

### Requirement: No duplicate class definitions across CSS files

Each CSS class SHALL be defined in exactly one file under `src/renderer/styles/`, in the file matching its domain (tokens/reset → `base.css`, layout/sidebar → `layout.css`, cards/panels → `cards.css`, forms/buttons → `forms.css`, tables → `tables.css`, helpers → `utilities.css`). Duplicate class definitions SHALL be consolidated to a single definition each, preserving the visually winning rule (by `main.css` import order) when duplicate definitions differ.

#### Scenario: Zero cross-file duplicates
- **WHEN** all files under `src/renderer/styles/` are scanned for top-level class selectors
- **THEN** no class name SHALL appear as a definition in more than one file

#### Scenario: No visual regression
- **GIVEN** a duplicated class whose definitions differ across files
- **WHEN** the duplicate is consolidated
- **THEN** the retained rule SHALL be the one that previously won by import order

### Requirement: CSS uniqueness enforced by test

The system SHALL include an automated test that parses `src/renderer/styles/*.css` and fails if any top-level class selector is defined in more than one file.

#### Scenario: Test fails on new duplication
- **GIVEN** a developer adds `.card { ... }` to `utilities.css`
- **WHEN** `npm test` runs
- **THEN** the CSS uniqueness test SHALL fail, naming the duplicated class and files
