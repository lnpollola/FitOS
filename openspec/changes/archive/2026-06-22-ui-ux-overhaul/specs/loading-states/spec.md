## ADDED Requirements

### Requirement: Skeleton placeholders during async data loads

The system SHALL display animated skeleton placeholders (grey blocks with pulse animation) in all card/chart regions while async IPC data is being fetched. Skeletons SHALL match the dimensions and structure of the final content so replacement does not cause layout shift.

#### Scenario: Dashboard shows skeletons during load
- **WHEN** the dashboard view initializes and `await Promise.allSettled([...])` has not yet resolved
- **THEN** the `#row-metrics`, `#row-steps-extras`, and `#row-activity` regions SHALL display skeleton cards with `.skeleton` class and pulse animation
- **THEN** the skeletons SHALL occupy the same grid cells and min-height as the final cards

#### Scenario: Skeleton animation respects reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce` enabled in their OS
- **THEN** skeleton elements SHALL NOT animate (static grey background, no pulse)
- **THEN** the existing `@media (prefers-reduced-motion: reduce)` block SHALL include `.skeleton { animation: none; }`

#### Scenario: Skeleton generators available
- **WHEN** a view needs to render a loading placeholder
- **THEN** the view SHALL import from `src/renderer/utils/skeleton.js` which SHALL export `skeletonCard()`, `skeletonRow(count)`, and `skeletonChart()` functions returning HTML strings

### Requirement: Streaming render via Promise.allSettled

Views SHALL replace `Promise.all([...])` with `Promise.allSettled([...])` for parallel IPC calls. Each promise SHALL render its specific card or row immediately upon resolution, replacing the skeleton in that slot. A rejected promise SHALL render an error-state card in its slot instead of blocking other renders.

#### Scenario: Dashboard streams cards as data arrives
- **WHEN** the dashboard fetches 5 parallel IPC calls via `Promise.allSettled`
- **THEN** each call that resolves SHALL immediately render its card(s), replacing the skeleton
- **THEN** calls that are still pending SHALL leave their skeleton in place
- **THEN** the dashboard SHALL NOT wait for all 5 calls to resolve before showing any content

#### Scenario: One rejected call does not block others
- **WHEN** one of the parallel IPC calls in a view rejects (e.g., `api.getSleepData` throws)
- **THEN** the rejected call's slot SHALL render an error-state card with a retry button
- **THEN** the other calls SHALL still render their data normally
- **THEN** the view SHALL NOT show a blank region for the failed call

### Requirement: Loading button states for async actions

Buttons that trigger async operations (imports, saves, exports) SHALL enter a loading state during the operation: disabled, reduced opacity, and a spinner indicator. The button SHALL not accept additional clicks while loading.

#### Scenario: Import button shows loading state
- **WHEN** a user clicks the Apple Health import button and the import begins
- **THEN** the button SHALL set `data-loading="true"` attribute, become `disabled`, and show a spinner icon
- **THEN** the button text SHALL remain visible but dimmed
- **WHEN** the import completes or fails
- **THEN** the button SHALL remove `data-loading`, re-enable, and remove the spinner

#### Scenario: CSS styles for loading buttons
- **WHEN** a button has `data-loading="true"`
- **THEN** the CSS SHALL apply `opacity: 0.7`, `cursor: wait`, `pointer-events: none`
- **THEN** a spinner element inside the button SHALL be visible (via `::after` pseudo-element or child element)

### Requirement: aria-live regions for async content updates

Regions of the DOM that are populated by async IPC calls SHALL declare `aria-live="polite"` so screen readers announce content updates after the data arrives.

#### Scenario: Dashboard metric regions announce updates
- **WHEN** the dashboard renders metric cards after an async load
- **THEN** the `#row-metrics`, `#row-steps-extras`, `#row-activity`, and `#last-update` elements SHALL have `aria-live="polite"` attribute
- **THEN** the screen reader SHALL announce the new content without interrupting the user

#### Scenario: Chart regions not announced
- **WHEN** a Chart.js canvas is populated
- **THEN** the canvas container SHALL NOT have `aria-live` (charts are not announceable; a text summary `aria-label` on the container is sufficient)
