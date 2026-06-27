# Sidebar Sections

## Purpose

Reorganize the sidebar navigation from a flat list of 9 items into three collapsible section groups for logical navigation.

## ADDED Requirements

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
