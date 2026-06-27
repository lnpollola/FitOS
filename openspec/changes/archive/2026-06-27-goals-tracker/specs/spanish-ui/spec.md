## ADDED Requirements

### Requirement: Goals domain UI strings

The system SHALL define all goals-related UI strings in the `strings` object under `strings.goals.*` in `src/renderer/locales/es.js`.

#### Scenario: Navigation label in Spanish
- **WHEN** the sidebar renders
- **THEN** the goals nav item SHALL show "Objetivos"

#### Scenario: Goal type labels in Spanish
- **WHEN** the goal creation form renders
- **THEN** the type dropdown options SHALL be: "Peso corporal", "Distancia", "Frecuencia semanal", "Personalizado"

#### Scenario: UI action strings in Spanish
- **WHEN** goal cards render
- **THEN** action buttons SHALL show: "Nuevo objetivo", "Editar", "Archivar", "Eliminar", "Cancelar", "Guardar"
- **THEN** the goal form SHALL have labels: "Tipo", "Nombre del objetivo", "Valor objetivo", "Unidad", "Fecha de inicio", "Fecha límite"

#### Scenario: Countdown strings in Spanish
- **WHEN** a countdown renders
- **THEN** "N días restantes" SHALL be displayed with proper singular/plural
- **THEN** "1 día restante" SHALL be used when daysRemaining is 1
- **THEN** "0 días restantes" SHALL not be used; instead "¡Último día!" or "En curso"

#### Scenario: Celebration strings in Spanish
- **WHEN** the celebration overlay renders
- **THEN** the title SHALL be "¡Objetivo conseguido!"
- **THEN** the close button SHALL be "Cerrar"

#### Scenario: Section headers in Spanish
- **WHEN** the goals view renders sections
- **THEN** section headers SHALL be: "Completados", "Objetivos archivados"
- **THEN** the archived toggle SHALL show "Ver archivados" / "Ocultar archivados"

#### Scenario: Empty states in Spanish
- **WHEN** the goals view has no goals
- **THEN** the empty text SHALL be "Aún no tienes objetivos"
- **THEN** the empty action button SHALL be "Crear objetivo"
- **WHEN** the dashboard goals card has no goals
- **THEN** the empty text SHALL be "Define tu primer objetivo"

#### Scenario: Delete confirmation in Spanish
- **WHEN** the user clicks delete on a goal
- **THEN** the confirmation dialog SHALL show "¿Eliminar objetivo? Esta acción no se puede deshacer."
- **THEN** the buttons SHALL be "Cancelar" and "Eliminar"
