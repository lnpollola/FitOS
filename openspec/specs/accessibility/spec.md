# Accessibility

## Purpose

Ensure the application is keyboard-navigable and screen-reader-friendly through semantic HTML, ARIA attributes, focus-visible states, and form control labeling.

## Requirements

### Requirement: Focus-visible states for keyboard navigation

All interactive elements (navigation items, buttons, filter controls, inputs) SHALL display a visible focus outline when navigated via keyboard (`:focus-visible`). The focus outline SHALL use the accent color and be distinguishable from the background.

#### Scenario: Sidebar nav items show focus outline
- **WHEN** a user tabs through the sidebar navigation items with the keyboard
- **THEN** the focused item SHALL display `outline: 2px solid var(--accent)` with `outline-offset: -2px`
- **THEN** the focus outline SHALL NOT appear when the item is clicked via mouse (`:focus-visible` only, not `:focus`)

#### Scenario: Buttons show focus outline
- **WHEN** a user tabs to a `.btn` or `.filter-btn` element
- **THEN** the focused button SHALL display a visible focus ring using `outline: 2px solid var(--accent)`

#### Scenario: Focus-visible CSS rule defined globally
- **WHEN** a developer opens `src/renderer/styles/main.css`
- **THEN** a global rule `:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }` SHALL exist

### Requirement: Keyboard-navigable sidebar navigation

The sidebar navigation SHALL be operable via keyboard. Navigation items SHALL be semantic `<button>` elements (inside `<li>`) so Enter/Space activates them natively. The active navigation item SHALL declare `aria-current="page"`.

#### Scenario: Nav items are buttons
- **WHEN** a developer inspects the sidebar HTML in `src/renderer/index.html`
- **THEN** each navigation item SHALL be a `<button class="nav-item" data-view="...">` inside a `<li>`
- **THEN** the `<button>` SHALL be keyboard-focusable by default (no extra `tabindex` needed)

#### Scenario: Enter/Space activates navigation
- **WHEN** a user focuses a nav button with the keyboard and presses Enter or Space
- **THEN** the corresponding view SHALL load (same behavior as clicking)
- **THEN** no extra `keydown` event listener SHALL be needed (button handles this natively)

#### Scenario: aria-current on active nav item
- **WHEN** a view is active (e.g., dashboard is showing)
- **THEN** the corresponding nav button SHALL have `aria-current="page"` attribute
- **WHEN** the user navigates to a different view
- **THEN** `aria-current="page"` SHALL move to the newly active nav button

#### Scenario: Sidebar has navigation role
- **WHEN** a screen reader encounters the sidebar
- **THEN** the `<nav>` element SHALL have `role="navigation"` and `aria-label="Navegación principal"`

### Requirement: Form control labeling

All form inputs (`<input>`, `<select>`, `<textarea>`) SHALL have an associated `<label>` element or `aria-label` attribute. No input SHALL rely solely on `placeholder` for its accessible name.

#### Scenario: Inputs have labels
- **WHEN** a developer inspects any form in the views (profile, diet food form, measurement form, training session form)
- **THEN** every `<input>` and `<select>` SHALL have either a `<label for="id">` preceding it or an `aria-label="..."` attribute
- **THEN** the `placeholder` attribute SHALL NOT be the only accessible name

#### Scenario: Profile form labels
- **WHEN** the profile view renders the user profile form (age, sex, height, weight, baseline)
- **THEN** each input SHALL have a `<label>` element associated via `for`/`id` matching

### Requirement: Error messages announced to screen readers

Error messages displayed to the user SHALL be announced by screen readers via `role="alert"` or `aria-live="assertive"`. Visual-only error indication (red border without text) SHALL NOT be used.

#### Scenario: Error card announces to screen reader
- **WHEN** a view renders an error-state card (from the tri-state card system)
- **THEN** the error message element SHALL have `role="alert"` attribute
- **THEN** the screen reader SHALL announce the error message immediately when it appears

### Requirement: prefers-reduced-motion for all animations

All animations and transitions in the app SHALL be disabled or reduced when the user has `prefers-reduced-motion: reduce` enabled. This extends the existing rule in `main.css` to cover new animations (skeleton pulse, card stagger, chart transitions).

#### Scenario: Skeleton animation disabled with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** `.skeleton` elements SHALL have `animation: none` (static grey background)

#### Scenario: Card stagger animation disabled with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** staggered card fade-in animations SHALL be disabled (cards appear immediately without delay)
