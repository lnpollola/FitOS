## 1. Split de IPC handlers — Setup

- [x] 1.1 Crear directorio `src/main/handlers/`
- [x] 1.2 Extraer `refreshCaches` a un helper compartido en `database.js` (exportar como `getRefreshCaches(getDb)` para evitar dependencia circular)

## 2. Split de IPC handlers — Módulos por dominio

- [x] 2.1 Crear `src/main/handlers/profile-handlers.js` con `register()` para getProfile, saveProfile
- [x] 2.2 Crear `src/main/handlers/activity-handlers.js` con handlers de activity_days + sport_activities + import CSV + summaries
- [x] 2.3 Crear `src/main/handlers/diet-handlers.js` con handlers de food_items, meal_templates, daily_plans, dishes
- [x] 2.4 Crear `src/main/handlers/training-handlers.js` con handlers de exercise_library, training_sessions/sets, routines, workout_plans
- [x] 2.5 Crear `src/main/handlers/measurements-handlers.js` con handlers de measurement_sets, weight_entries
- [x] 2.6 Crear `src/main/handlers/energy-handlers.js` con handlers de energy balance, trend weight
- [x] 2.7 Crear `src/main/handlers/health-handlers.js` con handlers `health:*` + `db:getSleepData`, `db:getSleepAnalysis`, `db:getCyclingDistance`, `db:getDashboardData`
- [x] 2.8 Crear `src/main/handlers/settings-handlers.js` con handlers de settings, export, import
- [x] 2.9 Crear `src/main/handlers/dashboard-handlers.js` con `db:getDashboardData` (orquesta health + activity + diet)

## 3. Split de IPC handlers — Refactor del registry

- [x] 3.1 Reescribir `ipc-handlers.js` para importar y delegar a los 9 módulos de dominio
- [x] 3.2 Pasar `getDb` como callback a cada `register()` para evitar dependencia circular
- [x] 3.3 Mover `getHS()` helper a `health-handlers.js`
- [x] 3.4 Verificar que `registerIpcHandlers(mainWindow)` en `main.js` no requiere cambios

## 4. HealthSync en activity_summary_cache

- [x] 4.1 Agregar columnas `exercise_minutes`, `walking_km`, `cycling_km`, `hrv_avg`, `resting_hr_avg` al schema de `activity_summary_cache`
- [x] 4.2 Actualizar `populateCache(periodDays)` para consultar HealthSync DB (si está disponible) y llenar las nuevas columnas
- [x] 4.3 Si HealthSync DB no existe, las columnas quedan con DEFAULT 0 o NULL
- [x] 4.4 Bump schema_version a '4' con migración (ALTER TABLE ADD COLUMN)

## 5. Cache cliente — Implementación

- [x] 5.1 Crear `src/renderer/utils/cache-store.js` con `Map` + TTL 30s
- [x] 5.2 Implementar `cacheGet(key)`, `cacheSet(key, value)`, `cacheInvalidate(domain)`
- [x] 5.3 Implementar `EventTarget` con `on(domain, callback)` y `emit(domain)`
- [x] 5.4 Agregar `onDomainChanged(domain, callback)` en `preload.js`
- [x] 5.5 Agregar `domain-changed` IPC event en cada handler que escribe datos (enviar al renderer con el dominio)
- [x] 5.6 Integrar cache-store en `app.js`: escuchar `onDomainChanged` → `cacheInvalidate(domain)`
- [x] 5.7 Usar cache-store en vistas: `cacheGet` antes de fetch IPC, `cacheSet` después

## 6. CSS split por componente

- [x] 6.1 Extraer custom properties, reset, tipografía, scrollbar a `styles/base.css`
- [x] 6.2 Extraer `.app-layout`, `.sidebar`, `.main-content`, `.view` a `styles/layout.css`
- [x] 6.3 Extraer `.card`, `.card-accent`, `.dashboard-card`, `.card-hero`, compliance badges a `styles/cards.css`
- [x] 6.4 Extraer `.form-group`, inputs, selects, textareas, `.btn`, `.tag`, `.filter-btn` a `styles/forms.css`
- [x] 6.5 Extraer `.data-table`, `.data-table-wrapper`, `.data-table-pagination` a `styles/tables.css`
- [x] 6.6 Extraer `.text-xs`, `.text-sm`, `.text-muted`, flex helpers, skeletons a `styles/utilities.css`
- [x] 6.7 Reescribir `main.css` como imports-only: `@import './base.css'; @import './layout.css'; ...`
- [x] 6.8 Verificar `index.html` referencia solo `styles/main.css`

## 7. Tests

- [x] 7.1 Test unitario: cache-store cachea y expira correctamente
- [x] 7.2 Test unitario: cache-store invalida por dominio sin afectar otros
- [x] 7.3 Test unitario: handlers funcionan tras split (mock getDb, verify channel registration)
- [x] 7.4 Test unitario: populateCache escribe columnas de HealthSync cuando DB está disponible
- [x] 7.5 Smoke test: build CSS produce single bundle sin errores
- [x] 7.6 Smoke test: todas las vistas renderizan sin errores post-split
- [x] 7.7 Ejecutar `npx vitest run` y verificar que todos los tests pasan

## 8. Verificación final

- [x] 8.1 Ejecutar `npm run build` para verificar build sin errores
- [x] 8.2 Verificar en `npm run dev:web` que todas las vistas renderizan correctamente
- [x] 8.3 Verificar que los handlers IPC funcionan en Electron (`npm run dev`)
- [x] 8.4 Verificar cache: navegar entre vistas rápido y confirmar que no hay refetch innecesario
- [x] 8.5 Verificar CSS: inspeccionar que los estilos se cargan desde el bundle único
- [x] 8.6 Verificar cache HealthSync: confirmar que las métricas de HRV/RHR aparecen en el dashboard vía cache
- [x] 8.7 Verificar que no hay regresiones funcionales en ninguna vista
