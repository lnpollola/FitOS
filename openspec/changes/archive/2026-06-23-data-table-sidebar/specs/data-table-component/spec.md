## ADDED Requirements

### Requirement: Standardized data table with organic styling

The system SHALL provide a `.data-table` CSS component that replaces all bare `<table>` elements across the application with a unified organic visual identity. The component SHALL include a responsive wrapper (`.data-table-wrapper`), styled headers in Fraunces italic, zebra-striped body rows (smoke/paper), hover state (moss-mist), and optional sticky first column (`.data-table--sticky-col`).

#### Scenario: Table renders with organic typography
- **WHEN** any view renders a `.data-table`
- **THEN** header cells (`thead th`) SHALL use Fraunces italic 500 at 12px in moss-ink on moss-mist background
- **THEN** body cells (`tbody td`) SHALL use Source Sans 3 at 13px in moss-ink
- **THEN** no uppercase transform or letter-spacing SHALL be applied to headers

#### Scenario: Zebra striping applied
- **WHEN** a `.data-table` tbody has multiple rows
- **THEN** even rows SHALL have `var(--smoke)` background
- **THEN** odd rows SHALL have `var(--paper)` background
- **THEN** hovered rows SHALL transition to `var(--moss-mist)` background over 150ms

#### Scenario: Responsive overflow
- **WHEN** a `.data-table` has more columns than the viewport width
- **THEN** the `.data-table-wrapper` SHALL enable horizontal scroll via `overflow-x: auto`
- **THEN** the table SHALL NOT overflow its parent container

#### Scenario: Sticky headers
- **WHEN** a `.data-table` is scrolled vertically within a fixed-height container
- **THEN** the header row SHALL remain visible at the top via `position: sticky; top: 0`

#### Scenario: Sticky first column (--sticky-col variant)
- **WHEN** a `.data-table--sticky-col` is scrolled horizontally
- **THEN** the first column (date or primary key) SHALL remain fixed at the left edge
- **THEN** the first column header SHALL have `z-index: 3` to stay above body cells

#### Scenario: tfoot totals row
- **WHEN** a `.data-table` includes a `<tfoot>` element
- **THEN** the footer cells SHALL use Fraunces italic 600 at 13px in moss color
- **THEN** a 2px solid moss border SHALL separate tfoot from tbody

### Requirement: Unified pagination bar

The system SHALL provide a `.data-table-pagination` component with Previous/Next buttons in moss outline style and a page counter "Página X de Y". The pagination bar SHALL be hidden when there is only 1 page.

#### Scenario: Pagination with multiple pages
- **WHEN** a data table has more than the page size rows and pagination is enabled
- **THEN** a pagination bar SHALL appear below the table with "Anterior", "Siguiente", and "Página X de Y"

#### Scenario: Previous button disabled on first page
- **WHEN** the user is on page 1
- **THEN** the "Anterior" button SHALL be disabled with `opacity: 0.35` and `cursor: not-allowed`

#### Scenario: Next button disabled on last page
- **WHEN** the user is on the last page
- **THEN** the "Siguiente" button SHALL be disabled with `opacity: 0.35` and `cursor: not-allowed`

#### Scenario: Pagination hidden with single page
- **WHEN** total rows ≤ page size
- **THEN** the `.data-table-pagination` SHALL NOT be rendered

### Requirement: All existing tables migrated to .data-table

The system SHALL replace all 16 bare `<table>` instances across views with the `.data-table` component, removing deprecated wrappers (`.table-responsive`, `.ranking-table-wrap`, inline overflow styles).

#### Scenario: Diet tables migrated
- **WHEN** the diet view renders dish ingredients, food items, or hidden foods tables
- **THEN** each table SHALL use `.data-table-wrapper > .data-table` structure

#### Scenario: Activity tables migrated
- **WHEN** the activity view renders the timeline or sport ranking tables
- **THEN** each table SHALL use `.data-table-wrapper > .data-table` structure

#### Scenario: Training tables migrated
- **WHEN** the training view renders exercise library, routines, sessions, sets, or deltas tables
- **THEN** each table SHALL use `.data-table-wrapper > .data-table` structure

#### Scenario: Measurements tables migrated
- **WHEN** the measurements view renders history, monthly summary, or comparison tables
- **THEN** the history table SHALL use `.data-table-wrapper > .data-table--sticky-col` for the sticky date column
- **THEN** other tables SHALL use `.data-table-wrapper > .data-table`

#### Scenario: Analytics table migrated
- **WHEN** the analytics view renders the ranking table
- **THEN** the table SHALL use `.data-table-wrapper > .data-table`, replacing `.ranking-table-wrap`

#### Scenario: Adaptive table migrated
- **WHEN** the adaptive view renders the adjustment history table
- **THEN** the table SHALL use `.data-table-wrapper > .data-table`

### Requirement: Deprecated wrappers removed

The system SHALL remove the CSS classes `.table-responsive` and `.ranking-table-wrap` from `main.css` after all tables are migrated to `.data-table-wrapper`.

#### Scenario: Old wrappers no longer in CSS
- **WHEN** the migration is complete
- **THEN** `.table-responsive` and `.ranking-table-wrap` SHALL NOT exist in `main.css`
- **THEN** no view SHALL reference these deprecated classes
