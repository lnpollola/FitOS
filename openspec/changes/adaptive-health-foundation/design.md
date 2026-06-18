## Context

Greenfield local-first desktop health application. The system must model a structured slot-based diet (already extracted from PDF), import Apple Watch activity CSVs with per-sport calorie data, compute real TDEE, track body measurements and strength training, and provide adaptive deficit adjustments — all in a single desktop dashboard.

## Goals / Non-Goals

**Goals:**
- Build an Electron desktop application with Vanilla JS frontend
- All data stored locally in SQLite — zero cloud, zero backend
- Single-window dashboard with domain-specific views
- Modular domain architecture where each health capability is independently developable
- Diet modeled as slots with interchangeable food options, supporting learn/forget flows
- TDEE computed from real per-sport activity data, not a generic multiplier
- Track 10 body measurements + weight with trend charts and body-fat estimation
- Keep the MVP buildable by a single developer in weeks, not months

**Non-Goals:**
- Cloud sync or multi-device data sharing
- User authentication or multi-user support
- Native Apple Health / HealthKit integration (CSV export is the data path)
- Mobile app or PWA (mobile is a future phase)
- Push notifications or background sync
- Food database with barcode scanning or public API integration
- AI/ML coaching, meal recommendations from images
- Social features, leaderboards, or sharing
- Server-side processing of any kind

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| App model | Electron + Vanilla JS + Vite | Desktop app with web frontend; Vite for fast dev/build; single developer can move fast; easy to migrate to Tauri later if bundle size matters |
| UI framework | Vanilla JS + Vite | Zero framework overhead for MVP; Vite for fast dev server and build; easy to add a framework later if needed |
| Local database | SQLite via better-sqlite3 | Purpose-built for local desktop apps; synchronous API from Electron main process; relational model suits slot-based diet, measurement time series, and training data |
| Charts | Chart.js | Lightweight, works on Canvas, responsive |
| Architecture pattern | Domain modules + data access layer | Each domain (activity, diet, energy, planning, measurements, training) is a self-contained module with its own SQLite table schema and UI views |
| Diet model | Slot-based template engine | Diet defined as MealTemplate → MealComponent → FoodItem; each slot has interchangeable options; system computes kcal/macros from food DB; users can add new options or hide unused ones |
| TDEE computation | Mifflin-St Jeor BMR + real activity calories | BMR from profile; activity calories per sport from Apple Watch CSV; no generic multiplier — uses actual burned calories per sport session |
| Body fat estimation | Navy circumference method | Uses neck, waist, and hip measurements for estimated body fat %; simple, well-documented, requires only existing metrics |
| Calorie adaptation logic | Client-side module | Algorithm runs in-app and can be updated with app releases |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Apple Watch CSV export format may change with watchOS updates | Defines a canonical schema; write a parser adapter; version the import |
| FoodItem database needs accurate kcal/macros per 100g | Pre-populate from the diet extraction; allow manual edits; use verified reference data |
| Navy body-fat formula is approximate — individual variation exists | Show as estimate with known margin; emphasize trend over absolute value |
| Single developer building full-stack UI + data + engine | Prioritize capabilities as independent work streams; invest in shared data access layer early |
| Slot-based diet model may not cover all real-world eating patterns | Design model with optional "custom meal" override for unplanned eating |
| SQLite better-sqlite3 is synchronous in main process — potential UI blocking | Move DB queries to a worker thread or use ipcRenderer.invoke with async main-process handlers |

## Open Questions

- Should the food database be editable inline or managed through a separate view? Separate food manager view for MVP.
- What is the best UI pattern for the daily food log vs the plan-level view? Plan-level view first; daily override as a future enhancement.
- How to display body measurements trends — individual charts per metric or a composite dashboard? Individual charts with an optional composite body-fat trend overlay.
- Should strength progression use estimated 1RM or volume load as the primary metric? Design to support both; use volume load for MVP simplicity.
