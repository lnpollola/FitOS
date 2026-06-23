## ADDED Requirements

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
