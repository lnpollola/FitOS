# Spanish UI

## Purpose

Translate all user-facing frontend strings to Spanish while keeping backend/main process code in English. The README.md is also translated to Spanish.

## ADDED Requirements

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
