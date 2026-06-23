## MODIFIED Requirements

### Requirement: Bold subtitle text uses organic hierarchy

The system SHALL style `<strong>` elements within `.dashboard-card .subtitle` with `font-weight: 600` and `color: var(--moss-ink)`, providing a clear visual distinction between key numeric values and descriptive labels within card subtitles.

#### Scenario: Strong emphasis in organic style
- **WHEN** a card subtitle contains `<strong>` text
- **THEN** the strong text SHALL render in moss-ink at 600 weight
- **THEN** surrounding text SHALL remain in lichen at normal weight
