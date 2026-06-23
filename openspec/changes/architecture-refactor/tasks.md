## 1. Split de IPC handlers — Setup

- [ ] 1.1 Crear directorio `src/main/handlers/`
- [ ] 1.2 Extraer `refreshCaches` a un helper compartido en `database.js` (exportar como `getRefreshCaches(getDb)` para evitar dependencia circular)

## 2. Split de IPC handlers — Módulos por dominio

- [ ] 2.1 Crear `src/main/handlers/profile-handlers.js` con `register()` para getProfile, saveProfile
- [ ] 2.2 Crear `src/main/handlers/activity-handlers.js` con handlers de activity_days + sport_activities + import CSV + summaries
- [ ] 2.3 Crear `src/main/handlers/diet-handlers.js` con handlers de food_items, meal_templates, daily_plans, dishes
- [ ] 2.4 Crear `src/main/handlers/training-handlers.js` con handlers de exercise_library, training_sessions/sets, routines, workout_plans
- [ ] 2.5 Crear `src/main/handlers/measurements-handlers.js` con handlers de measurement_sets, weight_entries
- [ ] 2.6 Crear `src/main/handlers/energy-handlers.js` con handlers de energy balance, trend weight
- [ ] 2.7 Crear `src/main/handlers/health-handlers.js` con handlers `health:*` + `db:getSleepData`, `db:getSleepAnalysis`, `db:getCyclingDistance`, `db:getDashboardData`
- [ ] 2.8 Crear `src/main/handlers/settings-handlers.js` con handlers de settings, export, import
- [ ] 2.9 Crear `src/main/handlers/dashboard-handlers.js` con `db:getDashboardData` (orquesta health + activity + diet)

## 3. Split de IPC handlers — Refactor del registry

- [ ] 3.1 Reescribir `ipc-handlers.js` para importar y delegar a los 9 módulos de dominio
- [ ] 3.2 Pasar `getDb` como callback a cada `register()` para evitar dependencia circular
- [ ] 3.3 Mover `getHS()` helper a `health-handlers.js`
- [ ] 3.4 Verificar que `registerIpcHandlers(mainWindow)` en `main.js` no requiere cambios

## 4. HealthSync en activity_summary_cache

- [ ] 4.1 Agregar columnas `exercise_minutes`, `walking_km`, `cycling_km`, `hrv_avg`, `resting_hr_avg` al schema de `activity_summary_cache`
- [ ] 4.2 Actualizar `populateCache(periodDays)` para consultar HealthSync DB (si está disponible) y llenar las nuevas columnas
- [ ] 4.3 Si HealthSync DB no existe, las columnas quedan con DEFAULT 0 o NULL
- [ ] 4.4 Bump schema_version a '4' con migración (ALTER TABLE ADD COLUMN)

## 5. Cache cliente — Implementación

- [ ] 5.1 Crear `src/renderer/utils/cache-store.js` con `Map` + TTL 30s
- [ ] 5.2 Implementar `cacheGet(key)`, `cacheSet(key, value)`, `cacheInvalidate(domain)`
- [ ] 5.3 Implementar `EventTarget` con `on(domain, callback)` y `emit(domain)`
- [ ] 5.4 Agregar `onDomainChanged(domain, callback)` en `preload.js`
- [ ] 5.5 Agregar `domain-changed` IPC event en cada handler que escribe datos (enviar al renderer con el dominio)
- [ ] 5.6 Integrar cache-store en `app.js`: escuchar `onDomainChanged` → `cacheInvalidate(domain)`
- [ ] 5.7 Usar cache-store en vistas: `cacheGet` antes de fetch IPC, `cacheSet` después

## 6. CSS split por componente

- [ ] 6.1 Extraer custom properties, reset, tipografía, scrollbar a `styles/base.css`
- [ ] 6.2 Extraer `.app-layout`, `.sidebar`, `.main-content`, `.view` a `styles/layout.css`
- [ ] 6.3 Extraer `.card`, `.card-accent`, `.dashboard-card`, `.card-hero`, compliance badges a `styles/cards.css`
- [ ] 6.4 Extraer `.form-group`, inputs, selects, textareas, `.btn`, `.tag`, `.filter-btn` a `styles/forms.css`
- [ ] 6.5 Extraer `.data-table`, `.data-table-wrapper`, `.data-table-pagination` a `styles/tables.css`
- [ ] 6.6 Extraer `.text-xs`, `.text-sm`, `.text-muted`, flex helpers, skeletons a `styles/utilities.css`
- [ ] 6.7 Reescribir `main.css` como imports-only: `@import './base.css'; @import './layout.css'; ...`
- [ ] 6.8 Verificar `index.html` referencia solo `styles/main.css`

## 7. Tests

- [ ] 7.1 Test unitario: cache-store cachea y expira correctamente
- [ ] 7.2 Test unitario: cache-store invalida por dominio sin afectar otros
- [ ] 7.3 Test unitario: handlers funcionan tras split (mock getDb, verify channel registration)
- [ ] 7.4 Test unitario: populateCache escribe columnas de HealthSync cuando DB está disponible
- [ ] 7.5 Smoke test: build CSS produce single bundle sin errores
- [ ] 7.6 Smoke test: todas las vistas renderizan sin errores post-split
- [ ] 7.7 Ejecutar `npx vitest run` y verificar que todos los tests pasan

## 8. Verificación final

- [ ] 8.1 Ejecutar `npm run build` para verificar build sin errores
- [ ] 8.2 Verificar en `npm run dev:web` que todas las vistas renderizan correctamente
- [ ] 8.3 Verificar que los handlers IPC funcionan en Electron (`npm run dev`)
- [ ] 8.4 Verificar cache: navegar entre vistas rápido y confirmar que no hay refetch innecesario
- [ ] 8.5 Verificar CSS: inspeccionar que los estilos se cargan desde el bundle único
- [ ] 8.6 Verificar cache HealthSync: confirmar que las métricas de HRV/RHR aparecen en el dashboard vía cache
- [ ] 8.7 Verificar que no hay regresiones funcionales en ninguna vista
