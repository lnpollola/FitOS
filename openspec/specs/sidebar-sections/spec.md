# Sidebar Sections

## Purpose

Reorganize the sidebar navigation from a flat list of 9 items into three collapsible section groups for logical navigation.

## Requirements

### Requirement: Sidebar organized into collapsible sections

The system SHALL reorganize the sidebar navigation into three collapsible section groups — INICIO (Panel, Tendencias), SALUD (Actividad, Sueño, Balance Energético), ENTRENAMIENTO (Plan de Dieta, Mediciones, Entrenamiento) — with clickable section headers that toggle visibility of their child items. Perfil y Ajustes SHALL remain at the bottom outside any section.

#### Scenario: Sidebar renders with sections
- **WHEN** the application loads
- **THEN** the sidebar SHALL display three section headers: "INICIO", "SALUD", "ENTRENAMIENTO"
- **THEN** each section header SHALL show its items below it when expanded
- **THEN** "Perfil y Ajustes" SHALL appear below all sections, separated by a border

#### Scenario: Section headers use organic typography
- **WHEN** the sidebar renders
- **THEN** section headers SHALL use Fraunces italic 500 at 10px in lichen color
- **THEN** section headers SHALL be uppercase with `letter-spacing: 0.08em`
- **THEN** each header SHALL have a chevron icon indicating expand/collapse state

#### Scenario: Click section header to collapse
- **WHEN** the user clicks an expanded section header
- **THEN** its child nav items SHALL collapse (hide)
- **THEN** the chevron SHALL rotate to point right
- **THEN** other sections SHALL remain in their current state

#### Scenario: Click section header to expand
- **WHEN** the user clicks a collapsed section header
- **THEN** its child nav items SHALL expand (show)
- **THEN** the chevron SHALL rotate to point down

#### Scenario: Active view prevents section collapse
- **WHEN** the active view belongs to a section (e.g., "Panel" is in INICIO)
- **THEN** that section SHALL remain expanded and SHALL NOT be collapsible while active

#### Scenario: Collapse state persisted
- **WHEN** the user collapses or expands a section
- **THEN** the state SHALL be saved to `localStorage`
- **WHEN** the app reloads
- **THEN** sections SHALL restore their previous collapsed/expanded state
- **THEN** the section containing the active view SHALL always be expanded regardless of stored state

#### Scenario: Initial state
- **WHEN** the app loads for the first time (no localStorage state)
- **THEN** all sections SHALL be expanded

### Requirement: Sleep nav item added to SALUD section

The system SHALL include the Sueño nav item within the SALUD section group.

#### Scenario: Sleep in sidebar
- **WHEN** the sidebar renders
- **THEN** "Sueño" SHALL appear as a nav item under the SALUD section header
- **THEN** clicking "Sueño" SHALL navigate to the sleep analysis view

## ADDED Requirements (2026-06-27 — summary-insights-view)


### Requirement: Insights nav item added to INICIO section

The system SHALL include a new "Patrones" nav item in the INICIO section group, positioned between `dashboard` (Panel) and `analytics` (Tendencias). The nav item SHALL use the Lucide `sparkles` icon, SHALL navigate to the `insights` view, and SHALL follow the same pattern as existing nav items: `data-section="inicio"`, `data-view="insights"`, `<span class="nav-icon" data-icon="insights">`, and a `<span class="nav-text">` with the Spanish label "Patrones".

#### Scenario: Patrones nav item appears in INICIO
- **WHEN** the sidebar renders
- **THEN** the INICIO section SHALL contain three nav items: Panel, Patrones, Tendencias
- **THEN** the order SHALL be: Panel → Patrones → Tendencias (top to bottom within the section)
- **THEN** the "Patrones" item SHALL have `aria-label="Patrones"`

#### Scenario: Click Patrones navigates to insights view
- **WHEN** the user clicks the "Patrones" nav item
- **THEN** the `insights` view SHALL activate
- **THEN** the `insights` nav item SHALL receive `aria-current="page"`
- **THEN** the INICIO section SHALL remain expanded

#### Scenario: Active insights view keeps INICIO section pinned
- **WHEN** the active view is `insights`
- **THEN** the INICIO section SHALL remain expanded
- **THEN** the section SHALL NOT be collapsible while `insights` is active

#### Scenario: Sidebar icons include insights icon
- **WHEN** the sidebar renders
- **THEN** the `app.js` `iconMap` SHALL include `'insights': 'sparkles'`
- **THEN** the nav icon for the insights item SHALL be the Lucide `sparkles` icon
