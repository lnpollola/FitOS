## Context

Greenfield local-first health app. No existing code or infrastructure. The system must unify wearable activity data, diet PDFs, calorie balance, adaptive fat-loss targets, and strength training history into a single app that works on desktop and mobile browsers without any server or cloud dependency.

## Goals / Non-Goals

**Goals:**
- Build a single-page web app (PWA) that runs entirely in the browser
- All data stored locally in IndexedDB — zero cloud, zero backend
- Responsive UI that works on desktop (keyboard + mouse) and mobile (touch)
- Installable on mobile home screen via PWA manifest and service worker
- Modular domain architecture where each health capability is independently developable
- Keep the MVP buildable by a single developer in weeks, not months

**Non-Goals:**
- Cloud sync or multi-device data sharing
- User authentication or multi-user support
- Native Apple Health / Google Fit integration
- Server-side PDF parsing (all parsing happens client-side via PDF.js)
- Push notifications or background sync
- Food database, barcode scanning, or meal logging UI
- AI / ML coaching, meal recommendations, or image-based calorie estimation
- Social features, leaderboards, or sharing

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| App model | PWA (single-page web app) | Runs in any browser, no install friction, works on desktop and mobile, installable on home screen. Single codebase. |
| UI framework | Vanilla JS + Vite | Zero framework overhead for MVP; Vite for fast dev server and build; easy to add a framework later if needed. |
| Local database | IndexedDB via Dexie.js | Purpose-built for offline web apps; supports complex queries, indexes, and transactions needed for time-series health data |
| PDF parsing | PDF.js (client-side) | Mature library that runs entirely in the browser; no server needed; extraction results presented for user confirmation |
| Charts | Chart.js | Lightweight, works on Canvas, responsive, touch-friendly |
| Architecture pattern | Domain modules + data access layer | Each domain (activity, nutrition, energy, planning, training) is a self-contained module with its own Dexie table schema and UI views |
| PWA offline | Service worker with cache-first strategy | Core app shell and data cached locally; app works fully offline once loaded |
| Calorie adaptation logic | Client-side module | No server needed; algorithm runs in-browser and can be updated with app releases |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| PDF.js parsing is less accurate than server-side OCR — different diet plans have different layouts | Use two-stage extraction (text layer + heuristic table detection); always show preview for user confirmation; flag low-confidence fields |
| Wearable data sources vary in export format | Define a canonical daily-aggregate schema; write normalizer adapters per source; start with CSV upload before automating |
| IndexedDB storage limited on some mobile browsers (~50–100 MB typically available) | Monitor usage; provide data export/backup option; warn when approaching limits |
| No cloud backup — data loss if device is lost or browser storage cleared | Provide JSON export/import for manual backup; document this limitation clearly |
| Single developer building full-stack UI + data + PDF pipeline | Prioritize capabilities as independent work streams; invest in shared data access layer early |

## Open Questions

- Should weight entries be manual or auto-imported from wearable CSVs? Manual entry for MVP.
- What wearable CSV format(s) to support first? Start with a single canonical format; add normalizers as needed.
- Which progression model for strength training? Design schema to support multiple models; implement linear progression in MVP.
