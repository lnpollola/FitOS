## Why

The app currently has an English-only UI and README, partial diet template functionality, no Apple Health XML import, and lacks structured workout plans. User feedback highlights the need for a fully Spanish experience, richer meal data, Apple Health integration, and actionable training plans — all critical for daily adoption by Spanish-speaking users.

## What Changes

- **Spanish UI**: All frontend text, labels, messages, and the README translated to Spanish. Backend/main process code stays in English.
- **Apple Health XML Import (HealthSync)**: Integrate the `healthsync` library to parse the existing `apple-healt-export/exportar.xml` and populate activity, workout, measurement, and sleep data.
- **Activities page redesign**: Cards with pre-defined sessions by sport type, multi-select support.
- **Diet page enhancement**: Complete meal templates with elaborated-dish cards showing ingredients. Add `elaborated_dishes` table to DB. Friendlier UI for browsing/adding food items and dishes.
- **Daily Plan redesign**: Pre-loaded cards for each of the 5 daily meals, with swap/option selection and pre-made dish display.
- **Training plans**: Add structured plans for 2/3/4 sessions per week organized by muscle group, with actionable routine selection.
- **Database additions**: `elaborated_dishes` and `dish_ingredients` tables; `workout_plans` table for structured training.

## Capabilities

### New Capabilities
- `spanish-ui`: Translate all frontend strings and README to Spanish without changing backend logic.
- `apple-health-import`: Parse Apple Health XML export via HealthSync library; populate activity, workout, measurement, and sleep records.
- `predefined-workout-plans`: Structured training plans for 2/3/4 sessions/week organized by muscle group.
- `elaborated-dishes`: Database model and UI for pre-made dishes composed of ingredients, shown as cards in diet and daily-plan views.

### Modified Capabilities
- `activity-ingestion`: Extend from CSV-only import to support Apple Health XML import with multi-select session cards.
- `diet-plan-management`: Add elaborated-dish support, complete template card UI, ingredient-level display.
- `strength-training`: Add predefined workout plans (2/3/4 sessions/week with muscle group targeting).

## Impact

- **Frontend**: Every view will be translated; activity, diet, daily-plan, and training views get significant UI redesign.
- **Database**: New tables (`elaborated_dishes`, `dish_ingredients`, `workout_plans`, `workout_plan_days`) added via migration.
- **Dependencies**: New npm dependency `healthsync` for Apple Health XML parsing.
- **Backend**: New IPC handlers for Apple Health import, elaborated dishes CRUD, workout plans CRUD.
- **Assets**: Existing `apple-healt-export/` directory is the data source for import.
