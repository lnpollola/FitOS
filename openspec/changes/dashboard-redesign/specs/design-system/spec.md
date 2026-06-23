## MODIFIED Requirements

### Requirement: Component classes for repeated card patterns

The system SHALL define component CSS classes for card patterns that appear multiple times across views: `.card-accent` (full-width card with accent background), `.compliance-ok` (green compliance badge), `.compliance-warn` (amber compliance badge), `.metric-trend` (inline trend indicator), `.metric-value-sm` (smaller metric value). Card subtitles SHALL support `<strong>` elements styled with `font-weight: 600` and `color: var(--moss-ink)` for key numeric values.

#### Scenario: Accent card class replaces inline styles
- **WHEN** a view renders a full-width card with the accent background color
- **THEN** the view SHALL use `<div class="card card-accent">` instead of inline style

#### Scenario: Compliance badge classes replace inline styles
- **WHEN** a view renders a compliance indicator
- **THEN** the view SHALL use `<span class="compliance-ok">` or `<span class="compliance-warn">` instead of inline style

#### Scenario: Strong text in card subtitles
- **WHEN** a card subtitle contains `<strong>` wrapped numbers
- **THEN** the strong text SHALL render in moss-ink with 600 font weight
