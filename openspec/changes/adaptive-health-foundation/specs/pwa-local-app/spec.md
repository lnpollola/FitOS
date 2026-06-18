## ADDED Requirements

### Requirement: Responsive layout for desktop and mobile

The application SHALL render a single-page layout that adapts to screen width, with a navigation sidebar on desktop (>= 768px) that collapses to a bottom tab bar on mobile.

#### Scenario: Desktop layout renders sidebar

- **WHEN** the app is viewed on a screen wider than 768px
- **THEN** the navigation SHALL appear as a left sidebar with icon-and-label menu items

#### Scenario: Mobile layout renders bottom tabs

- **WHEN** the app is viewed on a screen narrower than 768px
- **THEN** the navigation SHALL appear as a bottom tab bar with icon-only or icon-and-label tabs

### Requirement: All data stored locally in IndexedDB

The system SHALL store all health data (activity days, nutrition logs, training sessions, user profile, settings) in IndexedDB using Dexie.js with no external database or cloud service.

#### Scenario: Data persisted across page reloads

- **WHEN** a user enters activity data and reloads the page
- **THEN** the data SHALL still be present and displayed in the timeline

#### Scenario: App works fully offline

- **WHEN** a user opens the app with no internet connection after the initial load
- **THEN** all features SHALL function normally — data entry, viewing history, calculations — using only locally stored data

### Requirement: Installable as PWA on mobile home screen

The system SHALL provide a web app manifest and service worker so that users can install the app on their mobile device home screen.

#### Scenario: Install prompt appears on supported browsers

- **WHEN** a user visits the app on a supported mobile browser
- **THEN** the browser SHALL show the "Add to Home Screen" prompt (or the app SHALL listen for the beforeinstallprompt event and show a custom install button)

#### Scenario: App launches in standalone mode

- **WHEN** a user opens the installed app from the home screen
- **THEN** the app SHALL launch in full-screen standalone mode without browser chrome

### Requirement: Data export and import for backup

The system SHALL allow users to export all their data as a single JSON file and import it back on the same or a different device/browser.

#### Scenario: Export all data

- **WHEN** a user taps "Export Data" in settings
- **THEN** the system SHALL generate and download a JSON file containing all stored records

#### Scenario: Import data from backup

- **WHEN** a user taps "Import Data" and selects a previously exported JSON file
- **THEN** the system SHALL restore all records from the file, replacing any existing data after user confirmation
