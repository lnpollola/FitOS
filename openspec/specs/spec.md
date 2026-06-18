# Proposal: Adaptive health tracking foundation

## Intent

Create the initial foundation for a desktop health application that combines Apple Watch activity data (with per-sport calorie breakdown), a slot-based diet plan model (already extracted from a custom PDF), energy balance tracking with real TDEE from actual activities, body measurement tracking with estimated body fat, and strength-training routines — all in a single local-first application supporting sustainable fat loss and body recomposition.

## Scope

In scope:
- import Apple Watch CSV exports with daily metrics and per-sport workout data (cycling, boxing, HIIT, walking, football, paddle)
- model the diet as slots with interchangeable food options, compute meal macros from a food database
- learn new food options and forget/hide unused ones
- compute BMR (Mifflin-St Jeor) and TDEE from real per-sport activity calories plus step-based NEAT
- compare planned intake vs TDEE as daily/weekly energy balance
- define a safe calorie-deficit plan for weight loss
- adjust the diet plan at the slot/gram level based on trend weight, body measurements, and estimated body fat
- track 10 body measurements + weight with trend charts and body-fat estimation
- support strength routines with exercises, machines, loads, progression, and exercise library

Out of scope:
- PDF parsing and OCR (diet data already extracted)
- mobile app or PWA (mobile is a future phase)
- native HealthKit / Apple Health API integration (CSV export is the data path)
- cloud sync or multi-device data sharing
- user authentication or multi-user support
- food database with barcode scanning or public API integration
- AI/ML coaching, meal recommendations from images
- direct medical diagnosis
- social features, leaderboards, or sharing

## Approach

Start with a domain-first architecture and behavior-first specs, implemented as an Electron desktop application with SQLite local storage.

Define system behavior across seven domains:
- activity ingestion (Apple Watch CSV)
- diet plan management (slot-based model)
- energy balance (real TDEE from activity)
- adaptive planning (slot-level adjustment using weight + measurements)
- body measurements (10 metrics + body fat estimation)
- strength training (exercises, routines, progression)
- desktop app (Electron, SQLite, dashboard)

## Success criteria

The system should allow a user to:
- import Apple Watch CSV and see daily metrics with per-sport activity breakdown
- view their diet plan as structured meal slots with interchangeable options
- compute BMR, TDEE from real activities, and daily/weekly energy balance
- log body measurements and see trend charts with estimated body fat
- receive recommended slot-level gram adjustments for calorie deficit changes
- add new food options to the diet and hide unused ones
- track gym routines and strength progression
- review all history from a single desktop dashboard

## Risks

- Apple Watch CSV export format changes across watchOS versions
- Food database accuracy — kcal/macros per 100g must be reliable
- Navy body-fat formula is approximate; individual variation exists
- Mismatch between planned diet and real adherence (no daily food logging)
- Slot-based model may not cover all real-world eating patterns
- Insufficient explainability of automatic plan adjustments
- Single developer building full-stack UI + data + engine
