## MODIFIED Requirements

### Requirement: Goals view layout

The goals view SHALL display in three sections:
1. **Active goals**: grid of goal cards with progress rings, countdowns, and action buttons, arranged in a responsive grid (2-3 columns on desktop, 1 column on mobile)
2. **Completed goals**: goals at ≥ 100% progress, with achievement badges, separated by a subtle header
3. **Archived goals**: collapsed section at the bottom, expandable via a "Ver archivados" toggle

Each active goal card SHALL display: progress ring (72 px) on the left, goal details on the right (label, progress value with unit, countdown, percentage bar). Cards SHALL have consistent height and use a horizontal layout (ring left, content right) instead of a vertical stack.

#### Scenario: Active goals grid renders
- **WHEN** the goals view loads with active goals
- **THEN** each active goal SHALL render as a horizontal card: progress ring on the left, details on the right
- **THEN** cards SHALL be arranged in a responsive grid (2-3 columns)
- **THEN** goals SHALL be ordered by `targetDate` ascending

#### Scenario: Goal card horizontal layout
- **WHEN** a goal card renders
- **THEN** the progress ring (72 px) SHALL appear on the left side
- **THEN** the right side SHALL show: label (top), progress value "93.0 → 90.0 kg" (middle), countdown "68 días restantes" (bottom), and percentage bar

#### Scenario: Completed goals section
- **WHEN** any goal has `progress_pct >= 100`
- **THEN** those goals SHALL appear in a separate "Completados" section below active goals

#### Scenario: Empty state
- **WHEN** the user has no goals
- **THEN** the view SHALL display an empty state with "Aún no tienes objetivos" and a "Crear objetivo" button
