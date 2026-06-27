## 1. Utility: strength-derivation.js

- [x] 1.1 Create `src/renderer/utils/strength-derivation.js` with `epley1RM(load, reps)` pure function
- [x] 1.2 Implement `computePersonalRecords(allSets, allSessions, exerciseLibrary)` returning best 1RM per exercise with rank and volume PR per session
- [x] 1.3 Implement `detectPlateaus(personalRecords, currentDate)` returning exercises without new PR in ≥4 weeks with severity levels
- [x] 1.4 Implement `strengthScore(exercisePRs, exerciseLibrary, bodyWeight)` returning per-muscle-group scores and composite
- [x] 1.5 Implement `weeklyTonnage(allSets, allSessions)` returning weekly aggregation with 12-week period comparison
- [x] 1.6 Write unit tests for all 5 functions in `tests/unit/strength-derivation.test.js`

## 2. IPC Handlers: strength-insights-handlers.js

- [x] 2.1 Create `src/main/handlers/strength-insights-handlers.js` with `register()` function
- [x] 2.2 Implement `db:getStrengthPersonalRecords` — Epley 1RM per set, best PR per exercise with rank, top 3 volume PRs per session
- [x] 2.3 Implement `db:getStrengthPlateau` — detect exercises with no new 1RM PR in ≥4 weeks, flag active exercises only
- [x] 2.4 Implement `db:getStrengthScore` — per-muscle-group aggregate with bilateral weighting, composite score, bodyweight fallback
- [x] 2.5 Implement `db:getWeeklyTonnage` — weekly tonnage by ISO week, previous 12-week comparison
- [x] 2.6 Register `strength-insights-handlers` in `src/main/ipc-handlers.js` require + register call

## 3. Preload Bridge

- [x] 3.1 Add `getStrengthPersonalRecords` to preload API
- [x] 3.2 Add `getStrengthPlateau` to preload API
- [x] 3.3 Add `getStrengthScore` to preload API
- [x] 3.4 Add `getWeeklyTonnage` to preload API

## 4. Frontend: strength-insights-panels.js

- [x] 4.1 Create `src/renderer/views/panels/strength-insights-panels.js`
- [x] 4.2 Implement `mountStrengthPRs(container)` — render personal records panel with exercise filter by muscle group
- [x] 4.3 Implement `mountStrengthPlateaus(container)` — render plateau alert cards with severity colors
- [x] 4.4 Implement `mountStrengthScore(container)` — render composite score ring and muscle group bars
- [x] 4.5 Implement `mountWeeklyTonnage(container)` — render Chart.js bar chart with period comparison
- [x] 4.6 Write smoke tests in `tests/smoke/strength-insights.test.js`

## 5. Insights View Integration

- [x] 5.1 Add strength section `<section id="section-strength">` to insights.js HTML template between recovery and weight velocity
- [x] 5.2 Import and call 4 mount functions in insights.js with `Promise.allSettled`
- [x] 5.3 Add skeleton loading states for the 4 new strength panels
- [x] 5.4 Add error handling via `safeCall` wrapper for each strength panel
- [x] 5.5 Add empty state handling for each strength panel

## 6. Locale Strings

- [x] 6.1 Add `strings.strengthInsights.*` block to `src/renderer/locales/es.js`
- [x] 6.2 Keys: section title, PR panel labels, plateau labels, score labels, tonnage labels, empty states, error states

## 7. CSS

- [x] 7.1 Add strength insights CSS classes to `src/renderer/styles/cards.css` (`.strength-pr`, `.strength-plateau`, `.strength-score`, `.strength-tonnage`)
- [x] 7.2 Style severity chips (warning/alert/critical), score ring, muscle group bars, PR rank badges

## 8. Training View: 1RM Column in Set List

- [x] 8.1 Add "1RM est." column header to the set list table in `training.js`
- [x] 8.2 Compute and display Epley 1RM per set row in the session expand view

## 9. Verify

- [ ] 9.1 Run `npm run dev:web` and confirm insights view loads all sections
- [ ] 9.2 Verify all 4 strength panels render with mock data
- [ ] 9.3 Verify empty states display correctly when no training data exists
- [x] 9.4 Run unit tests: `npx vitest run tests/unit/strength-derivation.test.js`
- [x] 9.5 Run smoke tests: `npx vitest run tests/smoke/strength-insights.test.js`
- [x] 9.6 Run full test suite: `npx vitest run`
