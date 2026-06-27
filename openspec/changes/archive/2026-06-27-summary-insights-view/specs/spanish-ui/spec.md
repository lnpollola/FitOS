# Spanish UI

## Purpose

Ensure all user-facing strings in FitOS are in Spanish, sourced exclusively from `src/renderer/locales/es.js`, and follow Spanish grammar conventions (accents, formal address, ordinals, date formats).

## ADDED Requirements

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
