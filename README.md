# FitOS: adaptive nutrition and training companion

## Intent

Build a desktop application that unifies Apple Watch activity data, a slot-based diet plan model, energy balance tracking with real TDEE from actual sports, body measurements with estimated body fat, and strength training plans into a single adaptive system for fat-loss and body recomposition.

The product should help a user understand:

- how much energy they expend each day (BMR + real sport activity + step NEAT)
- how much energy their diet plan provides (slot-based meal model with interchangeable options)
- whether they are maintaining a calorie deficit, using weight + body measurements
- how to adjust the diet plan at the slot/gram level to increase or decrease the deficit safely
- how their training load, recovery, and nutrition interact over time

The application is not just a calorie tracker. It acts as a guided decision layer that converts real activity and measurement data into weekly diet plan adjustments.

## Problem

Users typically have fragmented health data:

- wearable data lives in Apple Watch / Health app
- custom diet plans live in PDFs or chats (already extracted into structured data)
- gym routines live in notes, spreadsheets, or coaches' messages
- weight-loss decisions are made manually without a reliable energy balance model
- body measurements are tracked in notes or not tracked at all

This fragmentation makes it hard to answer simple questions:

- Am I really in a deficit?
- Am I eating according to my plan?
- Is my training aligned with my recovery and goal?
- Should I adjust calories by reducing carb portions or fat portions?
- Am I losing fat or muscle based on measurements?

## Vision

Create a local-first desktop application (Electron + SQLite) that:

1. imports Apple Watch CSV exports with daily metrics and per-sport activity breakdown
2. models the diet as a slot-based template with interchangeable food options
3. computes TDEE from real sport activity calories (cycling, boxing, HIIT, walking, football, paddle) plus BMR
4. compares planned intake vs TDEE over time
5. adapts the diet plan at the slot/gram level toward sustainable weight loss
6. tracks 10 body measurements plus weight with trend charts and estimated body fat
7. stores strength plans, machines, loads, routines, and progression history
8. learns new food options and forgets unused ones to keep the plan relevant

## MVP scope

### 1. Activity ingestion
- Import Apple Watch CSV exports with daily metrics
- Normalize steps, heart rate, active calories, resting calories, training sessions, sleep, and weight
- Parse per-sport workout data (cycling, boxing, HIIT, walking, football, paddle)
- Store historical daily aggregates with sport-specific breakdown

### 2. Diet plan management
- Model diet as meal templates with slots (carbs, protein, fat, vegetables, fruit, extras)
- Each slot has interchangeable food options with known kcal/macros per 100g
- Compute meal and daily totals from selected options and gram amounts
- Add new food options with manual macro entry
- Hide/forget unused food options to reduce clutter
- Manually adjust gram amounts per slot with real-time recalculation

### 3. Energy balance
- Compute BMR using Mifflin-St Jeor formula
- Compute TDEE as BMR + sport activity calories + step-based NEAT
- Compare planned intake vs TDEE for daily and weekly balance
- Show surplus, maintenance, or deficit classification
- Display TDEE breakdown (BMR + sport + NEAT components)

### 4. Adaptive fat-loss planning
- Define target weight-loss pace (0.25–1.0 kg/week)
- Recommend initial calorie deficit
- Adjust diet plan at slot/gram level weekly using trend weight, body measurements, activity, and estimated body fat
- Detect body recomposition (weight stable, measurements improving)
- Prevent unsafe reductions with minimum calorie floors
- Present adjustments as accept/dismiss/modify recommendations

### 5. Body measurements
- Track 10 metrics: chest, neck, shoulders, biceps (L/R), forearms (L/R), waist, hips, thighs (L/R), calves (L/R)
- Log weight independently between full measurement sessions
- Display individual trend charts per metric
- Compute estimated body fat % using Navy circumference method
- Show before/after comparison with deltas
- Weight trend as 7-day moving average

### 6. Strength training
- Store routines by day with exercise-to-day mapping
- Track machines, exercises, sets, reps, load, and progression
- Exercise library with 25+ exercises categorized by muscle group and equipment
- Session logging with set-entry form
- Progression charts (estimated 1RM or volume load over time)
- Session-to-session delta comparisons

### 7. Desktop application
- Electron desktop app with SQLite local storage
- Single-window dashboard with sidebar navigation
- Data export/import as JSON for backup
- Native menus and system integration
- Zero cloud dependencies

## Non-goals for v1
- Full medical diagnosis
- Real-time coaching chatbot as the main interface
- Computer vision meal recognition
- Advanced hormone or blood-marker interpretation
- Full marketplace for coaches
- Mobile app or PWA
- Cloud sync or multi-device data sharing
- Native HealthKit integration (CSV import only)
- Barcode scanning or public food database API

## Product principles
- Behavior-first recommendations, not just dashboards
- Diet model based on proven real-world plan structure
- Explainable calorie and adaptation logic
- TDEE based on real activities, not generic multipliers
- Weekly plan review over noisy day-to-day fluctuations
- Safe defaults for deficit and load progression
- Measurements tell the full story, not just the scale

## Key risks to explore
- Apple Watch CSV export format stability across watchOS versions
- Accuracy of food database kcal/macros
- Navy body-fat formula approximations vs individual variation
- Adherence vs prescribed diet plan (no daily food logging)
- Slot-based model coverage of unplanned eating
- Single developer building full-stack UI + data + engine
