## Why

Health data lives in silos — wearable dashboards, PDF diet plans, notes apps for gym routines. Users cannot answer basic fat-loss questions (am I in a deficit? should I adjust calories or training this week?) without manual spreadsheet work. This change establishes the MVP foundation that unifies those silos into a single adaptive system.

## What Changes

This is the first foundation — nothing exists yet. The change introduces six new capabilities:

- **Activity ingestion**: import and normalize wearable/dashboard daily metrics
- **Nutrition ingestion**: upload and parse diet PDFs into structured meal data
- **Energy balance**: compare estimated expenditure vs intake at daily and weekly granularity
- **Adaptive fat-loss planning**: recommend and adjust calorie deficit targets using trend weight and adherence
- **Strength training**: store routines, machines, exercises, loads, sets, reps, and progression history
- **PWA local-first app**: single-page web app that runs in the browser on any device, stores all data locally in IndexedDB, works offline with no cloud dependency

## Capabilities

### New Capabilities
- `activity-ingestion`: import and normalize daily metrics from wearable sources (steps, heart rate, active calories, training sessions, sleep, weight)
- `nutrition-ingestion`: upload PDF diet plans, extract meal structure and nutrition fields, flag low-confidence parsing, allow manual correction
- `energy-balance`: compute estimated total expenditure, compute intake from logged data, show daily/weekly burned vs ingested balance with surplus/maintenance/deficit classification
- `adaptive-planning`: define target weight-loss pace, recommend initial deficit, adjust weekly using trend weight, adherence, and activity, prevent unsafe reductions
- `strength-training`: store routines by day, track machines/exercises/sets/reps/load, support progression, associate with fat-loss-with-strength-retention objective
- `pwa-local-app`: PWA (Progressive Web App) with IndexedDB local storage, responsive UI for desktop and mobile browsers, zero cloud dependencies, installable on phone home screen

### Modified Capabilities
- *(none — first foundation, no existing specs)*

## Impact

- **New code**: single-page web app (new), PDF parsing client-side (new), CSV import (new), no backend or cloud services required
- **Dependencies added**: none external — pure client-side JS, IndexedDB via a lightweight wrapper, PDF.js for client-side PDF parsing
- **No existing code modified**: this is a greenfield foundation within the project
