# Goals View

## Purpose

Provide a dedicated full-page view for managing goals: create, edit, archive, and delete goals with progress rings, countdowns, and achievement celebrations. The view organizes goals into three sections: active, completed, and archived.

## Requirements

### Requirement: Goals view exists in navigation

The system SHALL provide a new view with `data-view="goals"`. The sidebar SHALL contain a nav item between "Tendencias" and "Perfil" with the Lucide `target` icon and the label "Objetivos". The view SHALL follow the same conventions as other views: exports `init()`, uses `window.electronAPI`, renders into `#view-goals`.

#### Scenario: Goals nav item renders
- **WHEN** the sidebar renders
- **THEN** a nav item with `data-view="goals"` SHALL appear between the "Tendencias" and "Perfil" items
- **THEN** the nav item icon SHALL be the Lucide `target` icon
- **THEN** the nav item text SHALL be "Objetivos"

#### Scenario: Goals view mounts
- **WHEN** the user clicks "Objetivos" in the sidebar
- **THEN** the goals view SHALL activate
- **THEN** `#view-goals` SHALL have the `active-view` class
- **THEN** other views SHALL be deactivated

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

### Requirement: Goal creation form

The system SHALL display a modal form when the user clicks "Nuevo objetivo" or "Crear objetivo". The form SHALL include:
- **Type**: dropdown with "Peso corporal", "Distancia", "Frecuencia semanal", "Personalizado"
- **Label**: text input (required, max 100 chars)
- **Target value**: number input (required, positive)
- **Unit**: text input (auto-filled based on type: "kg", "km", "sesiones/sem", empty for custom)
- **Start date**: date input (default: today)
- **Target date**: date input (required, must be ≥ start date)
- **Cancel** / **Guardar** buttons

#### Scenario: Form opens on "Nuevo objetivo"
- **WHEN** the user clicks "Nuevo objetivo"
- **THEN** a modal overlay SHALL open with the goal creation form
- **THEN** the form SHALL be keyboard-focusable

#### Scenario: Type changes auto-fill unit
- **WHEN** the user selects "Peso corporal" from the type dropdown
- **THEN** the unit field SHALL auto-fill to "kg"
- **WHEN** the user selects "Distancia"
- **THEN** the unit field SHALL auto-fill to "km"
- **WHEN** the user selects "Frecuencia semanal"
- **THEN** the unit field SHALL auto-fill to "sesiones/sem"
- **WHEN** the user selects "Personalizado"
- **THEN** the unit field SHALL become editable (empty)

#### Scenario: Form validation
- **WHEN** the user submits the form with invalid data
- **THEN** the form SHALL display inline validation errors
- **THEN** the goal SHALL NOT be saved

#### Scenario: Successful creation
- **WHEN** the user submits a valid form
- **THEN** the goal SHALL be saved via `db:saveGoal`
- **THEN** the form SHALL close
- **THEN** the active goals list SHALL re-render with the new goal

### Requirement: Goal edit form

The system SHALL display the same form, pre-filled with the goal's current values, when the user clicks "Editar" on a goal card. Saving SHALL update the existing goal via `db:saveGoal` with the same `id`.

#### Scenario: Edit form pre-filled
- **WHEN** the user clicks "Editar" on a weight goal set to 75 kg
- **THEN** the form SHALL open with type = "Peso corporal", label, target = 75, unit = "kg"
- **THEN** changes SHALL update the goal via save

### Requirement: Delete with confirmation

The system SHALL display a confirmation dialog before deleting a goal. "¿Eliminar objetivo? Esta acción no se puede deshacer." with "Cancelar" / "Eliminar" buttons.

#### Scenario: Delete confirmation shown
- **WHEN** the user clicks "Eliminar" on a goal card
- **THEN** a confirmation dialog SHALL appear
- **THEN** "Cancelar" SHALL dismiss the dialog without deleting
- **THEN** "Eliminar" SHALL call `db:deleteGoal` and remove the card

### Requirement: Goal cards show current progress value

Each goal card SHALL display the progress ring, the numeric progress value (e.g., "67.3 / 100 km"), the days remaining countdown, and action buttons (Editar, Archivar, Eliminar). The card SHALL use the organic card design pattern with Fraunces for the value and Source Sans 3 for labels.

#### Scenario: Weight goal card rendering
- **WHEN** a weight goal shows 78.5 / 75 kg
- **THEN** the card SHALL display "78.5 kg" as the value, "75 kg" as the target
- **THEN** the progress ring SHALL show current/target ratio
- **THEN** the countdown SHALL show "27 días restantes" in appropriate color

#### Scenario: Distance goal card rendering
- **WHEN** a distance goal shows 67.3 / 100 km
- **THEN** the card SHALL display "67.3 km" as the value, "100 km" as the target
- **THEN** the progress ring SHALL show 67.3%

### Requirement: Goals view data-changed reactivity

When a `data-changed` event fires (because the user added a `sport_activities` record or a `weight_entries` record), the goals view SHALL re-compute progress for all goals.

#### Scenario: Progress updates on data change
- **WHEN** the user logs a new run and `data-changed` fires
- **THEN** the goals view SHALL re-call `db:getGoalProgress` for each active goal
- **THEN** progress rings SHALL update to reflect new data
