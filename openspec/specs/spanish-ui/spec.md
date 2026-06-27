# Spanish UI

## Purpose

Translate all user-facing frontend strings to Spanish while keeping backend/main process code in English. The README.md is also translated to Spanish.
## Requirements
### Requirement: All frontend strings translated to Spanish

The system SHALL display all UI text — navigation labels, view titles, form labels, button text, chart labels, tooltips, error messages, confirmation dialogs, empty-state placeholders, loading-state text, and error-state text — in Spanish.

#### Scenario: Navigation sidebar in Spanish
- **WHEN** a user opens the application
- **THEN** the navigation sidebar SHALL show: Panel de Control, Actividad, Plan de Dieta, Balance Energético, Mediciones Corporales, Entrenamiento de Fuerza, Perfil y Configuración

#### Scenario: View titles in Spanish
- **WHEN** a user navigates to any view
- **THEN** the view title SHALL be in Spanish (e.g., "Plan de Dieta" instead of "Diet Plan")

#### Scenario: Chart labels in Spanish
- **WHEN** a chart is rendered
- **THEN** axis labels, legends, and tooltips SHALL use Spanish terms (e.g., "Fecha" for date, "Calorías" for calories)

#### Scenario: Error messages in Spanish
- **WHEN** the system displays an error or validation message
- **THEN** the message text SHALL be in Spanish
- **THEN** error-state card messages SHALL reference `strings.states.*` locale keys

#### Scenario: Loading and empty states in Spanish
- **WHEN** the system displays a loading skeleton's screen-reader text or an empty-state message
- **THEN** the text SHALL be in Spanish and SHALL reference `strings.states.*` locale keys

#### Scenario: Activity timeline headers use locale keys
- **WHEN** a user views the activity timeline table
- **THEN** the column headers SHALL use locale keys: `strings.activity.date` for date, `strings.activity.steps` for steps, `strings.activity.activeCalories` for active kcal, `strings.activity.restingCalories` for resting kcal, `strings.activity.avgHeartRate` for heart rate, `strings.activity.sleepHours` for sleep

#### Scenario: HealthSync status messages use locale keys
- **WHEN** HealthSync is not installed
- **THEN** the install button label SHALL use a locale key (not hardcoded "HealthSync no instalado")
- **THEN** the status text SHALL use a locale key (not hardcoded "HealthSync disponible")

#### Scenario: Import error message uses locale key
- **WHEN** the Apple Health import fails because HealthSync is missing
- **THEN** the error message SHALL reference a locale key instead of hardcoded "HealthSync no encontrado. Instálalo primero."

#### Scenario: Activity view strings use locale keys
- **WHEN** a user views the activity timeline
- **THEN** month names, navigation buttons, install button text, import progress, and sleep format SHALL use locale keys
- **THEN** the typo `apple-healt-export` SHALL be corrected to `apple-health-export` in both the code and locale key

#### Scenario: Dashboard strings use locale keys
- **WHEN** the dashboard renders metric values
- **THEN** unit suffixes (kg, ms, bpm, h, km, min, %) SHALL reference locale keys

#### Scenario: Diet view strings use locale keys
- **WHEN** a user views the diet plan
- **THEN** table headers (Nombre, Gramos, kcal, P, C, G), form labels (Fecha, Añadir), macro prefixes (P:, C:, G:), empty states, and separators SHALL use locale keys
- **THEN** the redundant fallback `|| 'Todas'` pattern SHALL be removed where keys already exist

#### Scenario: Training view strings use locale keys
- **WHEN** a user views the training view
- **THEN** button texts (Generar Plan, Eliminar), labels (días/semana, Plan activo), confirm dialogs, table headers (Nombre, Creado, Fecha, Rutina, Notas), and progress comparison labels SHALL use locale keys
- **THEN** the redundant `|| '...'` fallback pattern SHALL be removed where keys already exist

#### Scenario: Profile view strings use locale keys
- **WHEN** a user views the profile
- **THEN** the "Available Metrics" section with health metric names and descriptions SHALL use locale keys (not hardcoded Spanish/English strings)

#### Scenario: Adaptive view strings use locale keys
- **WHEN** a user views the adaptive planning view
- **THEN** table headers (Fecha, Ritmo, Déficit Objetivo, Déficit Actual, Brecha) and unit (kg/sem) SHALL use locale keys

#### Scenario: Measurements view strings use locale keys
- **WHEN** a user views measurements
- **THEN** the column header "Fecha" SHALL use `strings.measurements.date`
- **THEN** the deletion confirm dialog SHALL use the correct measurement-specific key (not the import/export key)

### Requirement: Spanish string constants module

The system SHALL export all UI strings from a single ES module at `src/renderer/locales/es.js` that every view imports, instead of hardcoding strings in each view.

#### Scenario: Strings imported from locales module
- **WHEN** a view file renders text
- **THEN** it SHALL reference `strings.viewTitle` or equivalent key from the locales module

#### Scenario: New locale keys added
- **WHEN** a view requires new strings
- **THEN** those strings SHALL be added to the appropriate domain in `strings` (`strings.activity`, `strings.dashboard`, `strings.diet`, `strings.training`, `strings.profile`, `strings.measurements`, `strings.adaptive`, etc.)
- **THEN** no `|| 'fallback'` pattern SHALL exist where the key is defined in the locale

### Requirement: README translated to Spanish

The README.md file SHALL be rewritten in Spanish, covering project description, setup instructions, and architecture overview.

#### Scenario: README in Spanish
- **WHEN** a developer opens README.md
- **THEN** all sections SHALL be written in Spanish

### Requirement: Spanish strings for loading, empty, and error states

The system SHALL provide Spanish locale keys for all loading-state, empty-state, and error-state text displayed by the tri-state card system and skeleton placeholders. These keys SHALL live under a new `strings.states` domain in `src/renderer/locales/es.js`.

#### Scenario: Loading state strings in Spanish
- **WHEN** a card is in loading state (skeleton)
- **THEN** any loading text (e.g., screen-reader-only "Cargando...") SHALL reference `strings.states.loading`

#### Scenario: Empty state strings in Spanish
- **WHEN** a card is in empty state (no data)
- **THEN** the empty message SHALL reference locale keys like `strings.states.noData`, `strings.states.noDataPeriod`
- **THEN** the action button text SHALL reference keys like `strings.states.addMeasurement`, `strings.states.importActivity`

#### Scenario: Error state strings in Spanish
- **WHEN** a card is in error state (IPC failure)
- **THEN** the error message SHALL reference `strings.states.errorLoading`
- **THEN** the retry button text SHALL reference `strings.states.retry`

#### Scenario: State strings centralized in locales module
- **WHEN** a developer opens `src/renderer/locales/es.js`
- **THEN** a `states` domain SHALL exist under `strings` with keys: `loading`, `noData`, `noDataPeriod`, `errorLoading`, `retry`, `addMeasurement`, `importActivity`, `addFood`, `addTrainingSession`
- **THEN** no view SHALL hardcode Spanish text for these states (all via locale keys)

### Requirement: Dashboard hero legend Spanish strings

The system SHALL provide Spanish locale keys for the dashboard hero card's legend and supporting copy in the `strings.dashboard` domain of `src/renderer/locales/es.js`. The keys SHALL be: `dashboard.avgDay` ("Promedio diario"), `dashboard.noBalanceData` ("Sin balance todavía"), `dashboard.daysActive` ("Activo"), `dashboard.daysLow` ("Bajo"), `dashboard.days` ("días"). Views SHALL reference these keys directly without inline `strings.dashboard.X || 'fallback'` defensive `||` operators.

#### Scenario: Hero legend keys present
- **WHEN** a developer opens `src/renderer/locales/es.js`
- **THEN** the `dashboard` object SHALL contain `avgDay`, `noBalanceData`, `daysActive`, `daysLow`, and `days` keys
- **THEN** the values SHALL be Spanish strings

#### Scenario: Hero legend renders Spanish
- **WHEN** the dashboard hero card renders its legend
- **THEN** the moss dot legend entry SHALL read "Activo" via `strings.dashboard.daysActive`
- **THEN** the ember dot legend entry SHALL read "Bajo" via `strings.dashboard.daysLow`
- **THEN** the hero subtitle day count SHALL use `strings.dashboard.days` as the unit suffix

#### Scenario: No fallback strings in dashboard.js
- **WHEN** a developer searches `src/renderer/views/dashboard.js` for `|| 'fallback'` or `|| "fallback"` patterns
- **THEN** zero matches SHALL exist for hero-related strings (`avgDay`, `noBalanceData`, `daysActive`, `daysLow`, `days`)
- **THEN** all such references SHALL be direct `strings.dashboard.X` lookups

### Requirement: App name and user profile name locale strings

The system SHALL provide Spanish locale keys for the app name and the user's profile name in `src/renderer/locales/es.js`. The key `strings.appName` SHALL be "FitOS". The key `strings.profileName` SHALL be "Leandro Pollola". These keys SHALL be used in the sidebar header. The profile name SHALL be hardcoded in the locale for now, structured so it can be replaced by profile-driven data in the future.

#### Scenario: App name key present
- **WHEN** a developer opens `src/renderer/locales/es.js`
- **THEN** the `strings` object SHALL contain `appName` with the value "FitOS"
- **THEN** the value SHALL be a plain string without the suffix " - Salud y Rendimiento"

#### Scenario: Profile name key present
- **WHEN** a developer opens `src/renderer/locales/es.js`
- **THEN** the `strings` object SHALL contain `profileName` with the value "Leandro Pollola"

#### Scenario: Sidebar header uses locale keys
- **WHEN** the sidebar header renders
- **THEN** the `<h1>` text SHALL reference `strings.appName`
- **THEN** the subtitle text SHALL reference `strings.profileName`

### Requirement: Dashboard date range labels in Spanish

The system SHALL provide Spanish locale keys for the three dashboard date range options in the `strings.dashboard` domain: `dateRange15d` ("15d"), `dateRange1m` ("1m"), `dateRange3m` ("3m"). The activity view's weekly sport summary SHALL also use these keys for its 7d/15d/1m range buttons where applicable.

#### Scenario: Date range keys present
- **WHEN** a developer opens `src/renderer/locales/es.js`
- **THEN** the `dashboard` object SHALL contain `dateRange15d`, `dateRange1m`, and `dateRange3m` keys with Spanish string values

#### Scenario: Dashboard filter buttons use locale keys
- **WHEN** the dashboard renders date filter buttons
- **THEN** each button label SHALL reference a `strings.dashboard.dateRange*` key
- **THEN** no button label SHALL be hardcoded outside the locale module


## ADDED Requirements (2026-06-27 — panel-ux-ui-kpis-summarized)


### Requirement: Strava panels locale namespace

The system SHALL define a new locale namespace `strings.stravaPanels` in `src/renderer/locales/es.js` containing all UI strings for the 6 new Strava-style summary panels. The namespace SHALL include: PR banner (label template, rank ordinals, distance labels, empty state, "Ver todos" link), weekly goal (title, progress text, empty state), relative effort (title, current/previous labels, level adjectives, empty state), training log (header template, day labels L-D, duration format, empty state), monthly calendar (month label template, "Hoy" button, navigation tooltips, day aria-label template), and streak (active label, broken label, share subject/body templates).

#### Scenario: PR banner strings present
- **WHEN** a developer reads `src/renderer/locales/es.js`
- **THEN** `strings.stravaPanels.prBanner.title` SHALL exist with a Spanish label (e.g., "Récord personal")
- **THEN** `strings.stravaPanels.prBanner.rankLabels` SHALL exist as a 3-element array with ordinals: "1.º", "2.º", "3.º"
- **THEN** `strings.stravaPanels.prBanner.distanceLabels` SHALL exist as a map: `{ '1': '1 km', '1mi': '1 mi', '5': '5 km', '10': '10 km', '21.1': 'Media maratón', '42.2': 'Maratón' }`
- **THEN** `strings.stravaPanels.prBanner.empty` SHALL exist (e.g., "Registra tu primera carrera o ruta en bicicleta para desbloquear récords")
- **THEN** `strings.stravaPanels.prBanner.viewAll` SHALL exist (e.g., "Ver todos")

#### Scenario: Weekly goal strings present
- **WHEN** a developer reads `src/renderer/locales/es.js`
- **THEN** `strings.stravaPanels.weeklyGoal.title` SHALL be "Objetivo semanal"
- **THEN** `strings.stravaPanels.weeklyGoal.progress` SHALL be a function or template producing "X/N actividades" (e.g., "1/4 actividades")

#### Scenario: Relative effort strings present
- **WHEN** a developer reads `src/renderer/locales/es.js`
- **THEN** `strings.stravaPanels.relativeEffort.title` SHALL be "Esfuerzo relativo"
- **THEN** `strings.stravaPanels.relativeEffort.currentWeek` SHALL be "Esta semana"
- **THEN** `strings.stravaPanels.relativeEffort.previousWeek` SHALL be "Semana pasada"
- **THEN** `strings.stravaPanels.relativeEffort.empty` SHALL be "Sin actividad esta semana"

#### Scenario: Training log strings present
- **WHEN** a developer reads `src/renderer/locales/es.js`
- **THEN** `strings.stravaPanels.trainingLog.title` SHALL be "Registro de entrenamiento"
- **THEN** `strings.stravaPanels.trainingLog.days` SHALL be an array `['L', 'M', 'X', 'J', 'V', 'S', 'D']`
- **THEN** `strings.stravaPanels.trainingLog.durationFormat` SHALL be a function producing "Xh Ym" from minutes (e.g., `formatDuration(249) === '4h 9m'`)
- **THEN** `strings.stravaPanels.trainingLog.empty` SHALL be "Sin entrenamientos esta semana"

#### Scenario: Monthly calendar strings present
- **WHEN** a developer reads `src/renderer/locales/es.js`
- **THEN** `strings.stravaPanels.calendar.months` SHALL be a 12-element array with Spanish month names: ["enero", "febrero", ..., "diciembre"]
- **THEN** `strings.stravaPanels.calendar.today` SHALL be "Hoy"
- **THEN** `strings.stravaPanels.calendar.dayAriaLabel` SHALL be a function producing "DD de MMMM, N actividades, [sport]" or "DD de MMMM, sin actividad"
- **THEN** `strings.stravaPanels.calendar.navPrev` SHALL be "Mes anterior" (for `aria-label`)
- **THEN** `strings.stravaPanels.calendar.navNext` SHALL be "Mes siguiente"

#### Scenario: Streak strings present
- **WHEN** a developer reads `src/renderer/locales/es.js`
- **THEN** `strings.stravaPanels.streak.weeks` SHALL be "Semanas" (label for the weeks metric)
- **THEN** `strings.stravaPanels.streak.activities` SHALL be "Actividades"
- **THEN** `strings.stravaPanels.streak.active` SHALL be "Tu serie"
- **THEN** `strings.stravaPanels.streak.broken` SHALL be "Sin racha activa"
- **THEN** `strings.stravaPanels.streak.shareSubject` SHALL be "Mi racha de actividad en FitOS"
- **THEN** `strings.stravaPanels.streak.shareBody` SHALL be a template "Llevo {N} semanas consecutivas de actividad en FitOS, con {M} entrenamientos en total. ¡Vamos!"
- **THEN** `strings.stravaPanels.streak.startPrompt` SHALL be "Inicia tu primera semana de actividad"

### Requirement: Time and date formatting in Spanish

All time/date strings in the Strava panels SHALL be formatted using Spanish conventions: "DD de MMMM de YYYY" for full dates (e.g., "15 de junio de 2026"), "DD MMM" for short dates (e.g., "15 jun"), Spanish month abbreviations (ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic), and 24-hour time format with "h" separator (e.g., "1h 30m", not "1:30").

#### Scenario: Date format with full month
- **WHEN** the PR banner shows a date
- **THEN** the format SHALL be "15 de junio de 2026" (lowercase month, "de" connectors)
- **THEN** the format SHALL NOT be "June 15, 2026" or "15/06/2026"

#### Scenario: Duration format with "h" separator
- **WHEN** the training-log chart shows a 90 min duration
- **THEN** the format SHALL be "1h 30m"
- **THEN** the format SHALL NOT be "1:30" or "1h30m" (the space after "h" is required)

## ADDED Requirements (2026-06-27 — summary-insights-view)


### Requirement: Insights view locale namespace

The system SHALL define a new `strings.insights` namespace in `src/renderer/locales/es.js` with all UI strings for the new `insights` view. The namespace SHALL include: section titles, date-range selector labels, empty-state messages per section, recovery zone labels (Bajo/Moderado/Alto), WHR zone labels (Bajo/Moderado/Alto), sport variety labels, weight velocity direction labels, auto-insight text templates with `{value}` placeholders, "Actualizar" button label, "Ver detalle" link label, and severity chip labels (Positivo/Info/Alerta).

#### Scenario: All insights strings live in the namespace
- **WHEN** a developer reads `src/renderer/views/insights.js`
- **THEN** all user-facing strings SHALL be imported from `strings.insights.*`
- **THEN** no hardcoded Spanish strings SHALL appear in template literals
- **THEN** no English strings SHALL appear in user-facing positions

#### Scenario: Auto-insight templates use placeholders
- **WHEN** an auto-insight card is generated
- **THEN** the template SHALL contain `{value}` or `{n}` placeholders
- **THEN** the placeholder SHALL be replaced with the computed value at render time
- **THEN** the resulting text SHALL be in Spanish with correct grammar (e.g., "Llevas 5 semanas" not "Llevas 5 semana")

#### Scenario: Recovery zone labels in Spanish
- **WHEN** the recovery score is rendered
- **THEN** the zone label SHALL be one of "Bajo" (low), "Moderado" (moderate), "Alto" (high)
- **THEN** the labels SHALL be sourced from `strings.insights.recoveryZones`

#### Scenario: WHR zone labels in Spanish
- **WHEN** the WHR card is rendered
- **THEN** the zone label SHALL be one of "Bajo", "Moderado", "Alto" (per WHO/OMS classification)
- **THEN** the labels SHALL be sourced from `strings.insights.whrZones`

#### Scenario: Severity chip labels in Spanish
- **WHEN** an auto-insight card has severity `positive`
- **THEN** the chip SHALL display "Positivo"
- **WHEN** severity `info`
- **THEN** the chip SHALL display "Info"
- **WHEN** severity `alert`
- **THEN** the chip SHALL display "Alerta"
- **THEN** the labels SHALL be sourced from `strings.insights.severityLabels`

### Requirement: Sidebar label for insights nav item

The system SHALL use the Spanish label "Patrones" for the `insights` nav item, sourced from `strings.nav.sections.inicio.insights` (or directly from `strings.nav` if the section-level keys are flattened). The label SHALL be visible when the sidebar is expanded and SHALL appear as a tooltip when the sidebar is collapsed.

#### Scenario: Nav label is "Patrones"
- **WHEN** the sidebar renders
- **THEN** the insights nav item SHALL display "Patrones" as its label
- **THEN** the `aria-label` attribute SHALL also be "Patrones"

## ADDED Requirements (2026-06-27 — goals-tracker)

### Requirement: Goals view locale namespace

The system SHALL define a new `strings.goals` namespace in `src/renderer/locales/es.js` with all UI strings for the goals view, goal cards, celebration overlay, confetti, empty states, and form labels. The namespace SHALL include: view title, section headers (Activos, Completados, Archivados), form labels and placeholders (type options, label, target value, unit, start date, target date), action buttons (Nuevo objetivo, Guardar, Cancelar, Editar, Archivar, Eliminar, Cerrar), empty state messages, celebration text, countdown labels with singular/plural forms, confirmation dialogs (delete, archive), type option labels, and status labels.

#### Scenario: All goals strings in the namespace
- **WHEN** a developer reads `src/renderer/views/goals.js`
- **THEN** all user-facing strings SHALL be imported from `strings.goals.*`
- **THEN** no hardcoded Spanish strings SHALL appear in template literals

#### Scenario: Goals type options in Spanish
- **WHEN** the goal creation form renders type options
- **THEN** the four options SHALL be "Peso corporal", "Distancia", "Frecuencia semanal", "Personalizado"
- **THEN** these labels SHALL be sourced from `strings.goals.form.typeOptions`

#### Scenario: Goals empty state in Spanish
- **WHEN** the goals view renders with no goals
- **THEN** the empty state SHALL display "Aún no tienes objetivos" sourced from `strings.goals.empty`
- **THEN** the action button SHALL display "Crear objetivo" sourced from `strings.goals.createFirst`

#### Scenario: Goals countdown in Spanish
- **WHEN** a goal has days remaining
- **THEN** the countdown SHALL display "N días restantes" using key `strings.goals.countdown.remaining`
- **WHEN** a goal is overdue
- **THEN** the countdown SHALL display "En curso" using `strings.goals.countdown.overdue`
- **WHEN** a goal is due today
- **THEN** the countdown SHALL display "¡Último día!" using `strings.goals.countdown.lastDay`
