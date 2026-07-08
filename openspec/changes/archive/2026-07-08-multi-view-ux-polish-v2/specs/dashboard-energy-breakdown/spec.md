## ADDED Requirements

### Requirement: Weekly energy breakdown with sport calories and basal calories

The hero balance card SHALL display a breakdown section showing: (1) total active calories burned through sports in the period, (2) average daily basal calories, and (3) a horizontal bar or visual indicator showing the ratio of sport calories to basal calories. Each component SHALL use a distinct color from the design token palette.

#### Scenario: Energy breakdown renders with data
- **WHEN** the dashboard renders with sport activities and health daily summary data
- **THEN** the hero card SHALL display total sport kcal (sum of `calories` from `sport_activities` in the period)
- **THEN** the hero card SHALL display average daily basal kcal (from `kcal_basales` in `health_daily_summary`)
- **THEN** a visual indicator (horizontal stacked bar or dual progress bars) SHALL show the proportion of each component

#### Scenario: Energy breakdown with no sport data
- **WHEN** no sport activities exist in the period
- **THEN** the sport kcal SHALL display "0 kcal" and the visual indicator SHALL show only basal

#### Scenario: Energy breakdown labels
- **WHEN** the breakdown renders
- **THEN** labels SHALL use Spanish: "Calorías deporte", "Calorías basales"
- **THEN** values SHALL be formatted as integers with "kcal" suffix
