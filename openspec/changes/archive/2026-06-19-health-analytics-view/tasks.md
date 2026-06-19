## 1. IPC Handlers — Backend

- [x] 1.1 Add `health:getHeartRateRange(from, to)` handler — returns date, avg_bpm, min_bpm, max_bpm
- [x] 1.2 Add `health:getHRVRange(from, to)` handler — returns date, hrv_ms
- [x] 1.3 Add `health:getSleepRange(from, to)` handler — returns night, hours
- [x] 1.4 Add `health:getWorkoutRange(from, to)` handler — returns date, activity_type, minutes, kcal, km
- [x] 1.5 Add `health:getWorkoutRanking(from, to)` handler — returns aggregated by type: count, total_hours, total_kcal, total_km
- [x] 1.6 Add `health:getRestingHeartRateRange(from, to)` handler — returns date, rhr_bpm
- [x] 1.7 Add `health:getVO2MaxRange(from, to)` handler — returns date, vo2_max
- [x] 1.8 Add `health:getExerciseTimeRange(from, to)` handler — returns date, minutes
- [x] 1.9 Add `health:getDistanceSummary(from, to)` handler — returns date, walking_km, running_km, cycling_km
- [x] 1.10 Add `health:getWalkingSpeedRange(from, to)` handler — returns date, speed_kmh
- [x] 1.11 Add `health:getFlightsClimbedRange(from, to)` handler — returns date, count

## 2. Preload Bridge

- [x] 2.1 Expose all new `health:*Range` handlers in `contextBridge.exposeInMainWorld`
- [x] 2.2 Expose `health:getWorkoutRanking` method

## 3. View Registration & Navigation

- [x] 3.1 Add `#view-analytics` div to `index.html`
- [x] 3.2 Register `analytics` route in `app.js` with sidebar nav item "Tendencias"
- [x] 3.3 Add `analytics` namespace strings to `locales/es.js` (all labels, titles, empty states)
- [x] 3.4 Add CSS styles for grid charts, KPI cards, ranking table, collapsible section

## 4. Analytics View — HTML Structure & Filters

- [x] 4.1 Create `src/renderer/views/analytics.js` with full layout: KPIs, date range filter, chart grid, ranking table, secondary metrics
- [x] 4.2 Implement date range filter with quick buttons (7d, 1m, 3m, año) and custom date inputs
- [x] 4.3 Implement active button visual state and range calculation logic

## 5. Analytics View — Charts

- [x] 5.1 Implement steps trend chart (line + MA7 overlay)
- [x] 5.2 Implement heart rate range chart (min/avg/max band fill)
- [x] 5.3 Implement energy stacked bar chart (active + basal)
- [x] 5.4 Implement HRV trend line chart
- [x] 5.5 Implement sleep mixed chart (bar + MA7 line)
- [x] 5.6 Implement activity ranking horizontal bar chart

## 6. Analytics View — KPIs, Ranking Table & Secondary Metrics

- [x] 6.1 Implement 5 KPI summary cards (pasos, energía, FC, sueño, HRV)
- [x] 6.2 Implement activity detail table (Tipo, Count, Horas, kcal, Distancia)
- [x] 6.3 Implement collapsible secondary metrics section with mini charts (RHR, VO2 Max, Walking Speed, Distance, Exercise Time, Flights Climbed)
- [x] 6.4 Implement empty states for all charts and KPIs

## 7. Data Fetching & Rendering Cycle

- [x] 7.1 Implement `fetchData(range)` that calls all IPC handlers in parallel
- [x] 7.2 Implement `renderAll(data)` that destroys old charts and recreates all charts/KPIs
- [x] 7.3 Wire filter changes to re-fetch and re-render

## 8. Polish

- [x] 8.1 Verify all strings in Spanish via es.js
- [x] 8.2 Test with empty healthsync.db (no data)
- [x] 8.3 Test with partial data (only some metrics available)
- [x] 8.4 Run build and verify no errors
