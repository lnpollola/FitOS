## Why

Health data lives in silos — wearable dashboards, custom PDF diet plans, notes apps for gym routines. The user has been following a structured diet (Juanma Quiñones plan) for over 2 years with proven results (108→94 kg), and trains across 7 disciplines: gym, cycling, boxing, HIIT, walking, football, and paddle. But there is no unified system that:

- Models the diet's slot-based structure so adjustments are principled, not manual
- Computes real TDEE from actual activities (not a generic multiplier)
- Tracks body measurements (10 metrics) alongside weight for fat-loss vs muscle-retention visibility
- Integrates strength training progression with fat-loss phase awareness
- Aims to automate diet plan adjustments to increase or decrease deficit safely

This change establishes the MVP foundation: a desktop application that unifies these domains into a single adaptive system.

## What Changes

This is the first foundation — nothing exists yet. The change introduces seven new capabilities:

- **Activity ingestion**: import Apple Watch CSV exports with daily metrics and specific sport calories (cycling, boxing, HIIT, walking, football, paddle)
- **Diet plan management**: model the diet as a slot-based template (meal slots with multiple interchangeable food options), learn new dishes, forget unused options
- **Energy balance**: compute TDEE from real activity data and compare against planned intake at daily and weekly granularity
- **Adaptive fat-loss planning**: recommend and adjust calorie deficit targets using trend weight, body measurements, estimated body fat, and activity trends
- **Body measurements**: track 10 metrics (chest, neck, shoulders, biceps, forearms, waist, hips, thighs, calves) plus weight, with trend charts and body-fat estimation
- **Strength training**: store routines, machines, exercises, loads, sets, reps, and progression history
- **Desktop application**: Electron-based desktop app with SQLite local storage, no cloud dependency, single binary distribution

## Capabilities

### New Capabilities
- `activity-ingestion`: import Apple Watch CSV exports, normalize daily metrics (steps, active calories, resting calories, heart rate, sleep, weight), parse per-sport activity calories (cycling, boxing, HIIT, walking, football, paddle)
- `diet-plan-management`: model diet as slot-based template (MealTemplate → MealComponent → FoodItem), define interchangeable options per slot, support learn-new-food and forget-unused flows, compute meal kcal/macros from food database
- `energy-balance`: compute estimated TDEE using Mifflin-St Jeor + real activity calories per sport, compare against planned intake, show daily/weekly burned vs ingested balance with surplus/maintenance/deficit classification
- `adaptive-planning`: define target weight-loss pace, recommend initial deficit, adjust weekly using trend weight, body measurements, estimated body fat, and activity trends, prevent unsafe reductions
- `body-measurements`: track 10 metrics (chest, neck, shoulders, biceps left/right, forearms left/right, waist, hips, thighs left/right, calves left/right), weight, compute estimated body fat percentage, display trend charts per metric
- `strength-training`: store routines by day, track machines/exercises/sets/reps/load, support progression, associate with fat-loss-with-strength-retention objective
- `desktop-app`: Electron application with SQLite local storage, single-window dashboard, responsive layout for desktop use, no cloud dependencies

### Modified Capabilities
- *(none — first foundation, no existing specs)*

## Impact

- **New code**: Electron desktop app (new), CSV import with sport-specific parsing (new), diet slot-model engine (new), body measurement tracking (new), SQLite schema + data access layer (new)
- **Dependencies added**: Electron, better-sqlite3, Chart.js, Vite
- **No existing code modified**: this is a greenfield foundation within the project
