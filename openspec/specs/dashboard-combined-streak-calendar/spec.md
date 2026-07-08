# Dashboard Combined Streak Calendar

## Purpose

Combine the streak tracker and monthly activity calendar into a single unified card with a 2-column layout, removing the share button.

## Requirements

### Requirement: Combined streak and calendar card

The system SHALL render a single unified card that combines streak data (left column) and monthly calendar (right column). The streak section SHALL show: current streak weeks, total activities in streak, and active/inactive status. The calendar section SHALL show the monthly grid with sport icons on active days and week completion indicators. The "Compartir racha" button SHALL be removed.

#### Scenario: Combined card layout
- **WHEN** the dashboard renders
- **THEN** a single card SHALL appear with a 2-column layout: streak data on the left (approximately 30% width) and calendar on the right (approximately 70% width)
- **THEN** the streak section SHALL display weeks count, total activities, and streak status
- **THEN** the calendar section SHALL display the monthly grid with navigation

#### Scenario: No share button
- **WHEN** the combined card renders
- **THEN** no "Compartir racha" button SHALL be present
- **THEN** no share-related IPC or mailto functionality SHALL be triggered

#### Scenario: Combined card data loading
- **WHEN** the dashboard mounts
- **THEN** `db:getStreak` and `db:getMonthlyCalendar` SHALL be called concurrently
- **THEN** both sections SHALL render independently as their data resolves
