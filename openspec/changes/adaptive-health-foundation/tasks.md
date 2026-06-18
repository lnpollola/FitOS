## 1. Project Scaffolding

- [ ] 1.1 Initialize project with Vite (vanilla JS template) and set up folder structure
- [ ] 1.2 Install dependencies: Dexie.js, PDF.js, Chart.js
- [ ] 1.3 Configure PWA manifest (manifest.json) with app name, icons, theme color
- [ ] 1.4 Implement service worker with cache-first strategy for offline support
- [ ] 1.5 Create responsive CSS layout shell with sidebar (desktop) and bottom tabs (mobile)
- [ ] 1.6 Set up Dexie database with all table schemas (activity_days, nutrition_logs, meals, training_routines, training_sessions, training_sets, user_profile, settings, weight_log)

## 2. User Profile & Settings

- [ ] 2.1 Build user profile form (age, sex, height, weight, activity level)
- [ ] 2.2 Persist profile to Dexie and display in a Profile view
- [ ] 2.3 Add settings view with data export/import buttons
- [ ] 2.4 Implement JSON export (download all tables as single JSON file)
- [ ] 2.5 Implement JSON import with overwrite confirmation dialog

## 3. Activity Ingestion

- [ ] 3.1 Build CSV file picker and import screen
- [ ] 3.2 Implement CSV parser that maps columns to activity-day fields (date, steps, active_calories, resting_calories, heart_rate_avg, sleep_hours, weight_kg)
- [ ] 3.3 Build manual entry form for single-day metrics
- [ ] 3.4 Create activity timeline list view sorted by date descending
- [ ] 3.5 Implement Dexie CRUD operations for activity_days table

## 4. Nutrition Ingestion

- [ ] 4.1 Define nutrition data models (meal, daily_nutrition_log)
- [ ] 4.2 Build PDF upload screen using PDF.js for client-side parsing
- [ ] 4.3 Implement text extraction + heuristic table detection pipeline
- [ ] 4.4 Create parse result preview with confidence indicators per field
- [ ] 4.5 Build manual correction UI for low-confidence or misparsed fields
- [ ] 4.6 Implement confirmation flow that saves parsed meals as daily nutrition log
- [ ] 4.7 Create daily nutrition summary view (total calories + macros + per-meal breakdown)
- [ ] 4.8 Implement Dexie CRUD for nutrition_logs and meals tables

## 5. Energy Balance

- [ ] 5.1 Implement TDEE calculator using Mifflin-St Jeor formula with activity multiplier
- [ ] 5.2 Build daily balance computation (expenditure vs intake) with surplus/maintenance/deficit classification
- [ ] 5.3 Create daily balance card UI showing status badge and kcal gap
- [ ] 5.4 Implement weekly balance aggregation view with net balance and zone counts
- [ ] 5.5 Add incomplete-week warning when fewer than 5 days are logged
- [ ] 5.6 Compute and display balance from Dexie data reactively

## 6. Adaptive Fat-Loss Planning

- [ ] 6.1 Build target weight-loss pace selection UI (0.25–1.0 kg/week range with validation)
- [ ] 6.2 Implement initial deficit computation from TDEE and target pace
- [ ] 6.3 Implement trend weight calculation (moving average over last 7–14 days of logged weights)
- [ ] 6.4 Build weekly adherence evaluation: compare trend loss vs target pace
- [ ] 6.5 Generate target adjustment recommendations (increase deficit / decrease deficit / no change)
- [ ] 6.6 Enforce safe minimum calorie floors (1200 kcal women, 1500 kcal men) and cap adjustments at 20%
- [ ] 6.7 Build recommendation card UI with accept/dismiss controls
- [ ] 6.8 Log all target adjustments in settings table for history

## 7. Strength Training

- [ ] 7.1 Define training data models (routine, routine_day, exercise_library, session, set_entry)
- [ ] 7.2 Build routine creation screen (name + day-to-exercise mapping using exercise library)
- [ ] 7.3 Build exercise library with common exercises and ability to add custom ones
- [ ] 7.4 Build session logging screen with rest timer and set-entry form (exercise, load, reps, set number, RPE optional)
- [ ] 7.5 Implement progression chart view showing estimated 1RM over time using Chart.js
- [ ] 7.6 Add session-to-session delta comparisons (volume and load changes with ▲/▼ indicators)
- [ ] 7.7 Calculate strength maintenance status against active fat-loss phase
- [ ] 7.8 Implement Dexie CRUD for all training tables

## 8. Dashboard & Integration

- [ ] 8.1 Create unified Home dashboard with summary cards (today's calories, week balance, upcoming workout, last weigh-in)
- [ ] 8.2 Build unified timeline showing recent entries across all domains (activity, nutrition, training, weight)
- [ ] 8.3 Wire up navigation between all views using hash-based routing
- [ ] 8.4 Add empty-state placeholders for views with no data yet
- [ ] 8.5 Implement PWA install button (listen for beforeinstallprompt event)
- [ ] 8.6 Test responsive layout on desktop Chrome, mobile Chrome, and mobile Safari

## 9. Polish & Validation

- [ ] 9.1 Verify end-to-end flow: set profile → import activity CSV → upload diet PDF → view energy balance → set fat-loss target → log training session → see dashboard
- [ ] 9.2 Add error handling and inline validation across all forms
- [ ] 9.3 Test data export → clear browser data → import → verify all data restored
- [ ] 9.4 Test full offline functionality (airplane mode)
- [ ] 9.5 Review and fix responsive layout issues on small screens (320px–428px widths)
