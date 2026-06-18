## 1. Project Scaffolding

- [ ] 1.1 Initialize Electron + Vite project with folder structure (src/main, src/preload, src/renderer)
- [ ] 1.2 Install dependencies: better-sqlite3, Chart.js
- [ ] 1.3 Set up Vite config for Electron renderer process
- [ ] 1.4 Create Electron main process entry with window creation and native menu
- [ ] 1.5 Set up SQLite database initialization and schema creation for all tables (activity_days, sport_activities, food_items, meal_templates, meal_components, meal_options, daily_plans, measurement_sets, weight_entries, training_routines, training_sessions, training_sets, exercise_library, user_profile, settings)
- [ ] 1.6 Create renderer base HTML with sidebar navigation and main content area
- [ ] 1.7 Create preload script with contextBridge API for IPC communication

## 2. User Profile & Settings

- [ ] 2.1 Build user profile form (age, sex, height, weight, activity baseline)
- [ ] 2.2 Persist profile to SQLite and display in a Profile view
- [ ] 2.3 Add settings view with data export/import buttons
- [ ] 2.4 Implement JSON export (all tables as single JSON file via native save dialog)
- [ ] 2.5 Implement JSON import with overwrite confirmation dialog via native open dialog

## 3. Activity Ingestion

- [ ] 3.1 Build CSV file picker and import screen for Apple Watch exports
- [ ] 3.2 Implement CSV parser that maps columns to activity-day fields (date, steps, active_calories, resting_calories, heart_rate_avg, sleep_hours, weight_kg)
- [ ] 3.3 Implement per-sport activity parser that extracts workout rows (sport type: cycling, boxing, HIIT, walking, football, paddle; calories; duration)
- [ ] 3.4 Build manual entry form for single-day metrics and sport activities
- [ ] 3.5 Create activity timeline list view sorted by date descending with per-sport breakdown
- [ ] 3.6 Create weekly sport activity summary chart (bar chart by sport type)
- [ ] 3.7 Implement SQLite CRUD operations for activity_days and sport_activities tables

## 4. Diet Plan Management

- [ ] 4.1 Define diet data models (food_item, meal_template, meal_component, meal_option, daily_plan)
- [ ] 4.2 Pre-populate food database from extracted diet structure (Modelo_DietaRes.md) with kcal/macros per 100g for all food items
- [ ] 4.3 Build meal template view showing 5 meals (breakfast, mid-morning, lunch, snack, dinner) with their slot structure and available options
- [ ] 4.4 Implement the slot-based template engine: compute meal and daily totals from selected options and gram amounts
- [ ] 4.5 Build food item manager view: add new foods with name, kcal, protein, carbs, fat per 100g
- [ ] 4.6 Build "learn new food" flow: user enters food name and macros, system suggests estimated values, user confirms or overrides
- [ ] 4.7 Build "forget/hide food" flow: user marks food options as hidden, view shows only active options
- [ ] 4.8 Build hidden food manager view with reactivate option
- [ ] 4.9 Build manual gram adjustment UI per slot with real-time recalculation of meal and daily totals
- [ ] 4.10 Create daily plan summary view showing total calories, protein, carbs, and fat
- [ ] 4.11 Implement SQLite CRUD for all diet tables

## 5. Energy Balance

- [ ] 5.1 Implement BMR calculator using Mifflin-St Jeor formula
- [ ] 5.2 Implement TDEE computation: BMR + sport activity calories + step-based NEAT estimate
- [ ] 5.3 Build daily balance computation (TDEE vs planned intake) with surplus/maintenance/deficit classification
- [ ] 5.4 Create TDEE breakdown view showing BMR + sport calories + step NEAT components
- [ ] 5.5 Create daily balance card UI showing status badge and kcal gap
- [ ] 5.6 Implement weekly balance aggregation view with net balance and zone counts
- [ ] 5.7 Add incomplete-week warning when fewer than 5 days are logged

## 6. Body Measurements

- [ ] 6.1 Build body measurement entry form (chest, neck, shoulders, biceps L/R, forearms L/R, waist, hips, thighs L/R, calves L/R, weight_kg)
- [ ] 6.2 Build weight-only entry form for quick weigh-ins between full measurement sessions
- [ ] 6.3 Create measurement history table sorted by date descending
- [ ] 6.4 Implement trend charts per metric using Chart.js (individual line charts)
- [ ] 6.5 Implement before/after comparison view showing deltas between two selected dates
- [ ] 6.6 Implement body fat percentage estimator using Navy circumference method (neck, waist, hips)
- [ ] 6.7 Create body fat trend chart alongside weight trend
- [ ] 6.8 Implement weight trend as 7-day moving average
- [ ] 6.9 Implement SQLite CRUD for measurement_sets and weight_entries tables

## 7. Adaptive Fat-Loss Planning

- [ ] 7.1 Build target weight-loss pace selection UI (0.25–1.0 kg/week range with validation)
- [ ] 7.2 Implement initial deficit computation from TDEE and target pace
- [ ] 7.3 Implement trend weight calculation (moving average over last 7–14 days of logged weights)
- [ ] 7.4 Implement weekly adherence evaluation: compare trend loss vs target pace, incorporating measurement trends and body fat estimates
- [ ] 7.5 Build recomposition detection: flag when weight is stable but waist/hip measurements are decreasing over 4+ weeks
- [ ] 7.6 Implement slot-level adjustment engine: given a target deficit change, determine which carb/fat slots to adjust and by how much
- [ ] 7.7 Generate adjustment recommendations as slot-level gram change proposals
- [ ] 7.8 Enforce safe minimum calorie floors (1200 kcal women, 1500 kcal men) and cap adjustments at 20%
- [ ] 7.9 Build recommendation card UI with accept/dismiss/modify controls
- [ ] 7.10 Log all target adjustments in settings table for history

## 8. Strength Training

- [ ] 8.1 Define training data models (routine, routine_day, exercise_library, session, set_entry)
- [ ] 8.2 Pre-populate exercise library from extracted data (Rutinas_Fuerza_GYM.md) with 25+ exercises, muscle groups, equipment, and movement patterns
- [ ] 8.3 Build routine creation screen (name + day-to-exercise mapping using exercise library)
- [ ] 8.4 Build exercise library browser with search by muscle group, equipment, and movement pattern
- [ ] 8.5 Build session logging screen with set-entry form (exercise, load, reps, set number, RPE optional)
- [ ] 8.6 Implement progression chart view showing estimated 1RM or volume load over time using Chart.js
- [ ] 8.7 Add session-to-session delta comparisons (volume and load changes with ▲/▼ indicators)
- [ ] 8.8 Calculate strength maintenance status against active fat-loss phase
- [ ] 8.9 Implement SQLite CRUD for all training tables

## 9. Dashboard & Integration

- [ ] 9.1 Create unified Home dashboard with summary cards (today's planned calories, week balance, latest weight, latest measurement delta, next planned workout)
- [ ] 9.2 Wire up navigation between all views
- [ ] 9.3 Add empty-state placeholders for views with no data yet
- [ ] 9.4 Implement IPC-based data access layer in Electron preload script

## 10. Polish & Validation

- [ ] 10.1 Verify end-to-end flow: set profile → import activity CSV → view diet plan → compute energy balance → log body measurements → set fat-loss target → get slot adjustment → log training session → see dashboard
- [ ] 10.2 Add error handling and inline validation across all forms
- [ ] 10.3 Test data export → delete database → import → verify all data restored
- [ ] 10.4 Test full offline functionality
- [ ] 10.5 Build and package as distributable Electron binary
