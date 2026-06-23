## Context

`ipc-handlers.js` creció orgánicamente a 1372 líneas con 40+ handlers. El registro ocurre en una sola función `registerIpcHandlers(mainWindow)` que contiene todos los handlers inline. Cada nueva feature requiere editar este archivo monolítico, que ya tiene responsabilidades cruzando todos los dominios: perfil, actividad, dieta, entrenamiento, mediciones, energía, health sync, dashboard, settings, export/import.

En el renderer, cada navegación entre vistas descarta todo el estado y refetcha datos. No hay cache entre vistas, resultando en múltiples round-trips IPC para datos que no cambiaron.

`main.css` tiene 2004 líneas y el cambio activo agregará ~110 más. Si bien las custom properties organizan los valores, la hoja mezcla reglas de sidebar, cards, tablas, formularios, utilidades y vistas en un solo archivo.

`activity_summary_cache` no incluye métricas de HealthSync (HRV, RHR, ejercicio, distancia) a pesar de que esos datos se consultan en cada render del dashboard desde HealthSync DB.

## Goals / Non-Goals

**Goals:**
- Split `ipc-handlers.js` en 9 módulos por dominio bajo `src/main/handlers/`
- Módulo de cache cliente (`cache-store.js`) con TTL de 30s y event bus granular por dominio
- Agregar columnas de HealthSync a `activity_summary_cache` y unificar la consulta del dashboard
- Split `main.css` en 6 archivos por componente con `@import` desde `main.css`

**Non-Goals:**
- Cambiar la API del preload bridge (sin cambios en los métodos expuestos)
- Reescribir la lógica de negocio de los handlers (solo reorganizar)
- Implementar un state manager complejo (Redux, MobX, etc.)
- Migrar a TypeScript
- Cambiar el build system (Vite ya soporta CSS `@import`)

## Decisions

### D1: Split de handlers por dominio con contrato `register()`

**Decisión**: Cada módulo en `src/main/handlers/` exporta `register(ipcMain, getDb, getHealthsyncDb)`. `ipc-handlers.js` se reduce a importar y delegar:

```js
const { register: registerProfile } = require('./handlers/profile-handlers');
const { register: registerActivity } = require('./handlers/activity-handlers');
// ...
function registerIpcHandlers(mainWindow) {
  const getDb = () => require('../db/database').getDb();
  registerProfile(ipcMain, getDb);
  registerActivity(ipcMain, getDb);
  // ...
}
```

Dominios:
| Archivo | Handlers |
|---------|----------|
| `profile-handlers.js` | getProfile, saveProfile |
| `activity-handlers.js` | getActivityDays, saveActivityDay, getSportActivities, saveSportActivity, importActivityCSV, getWeeklySportSummary, getActivityKcalByType, getSportSummaryByRange, getActivityComparison, getWeightStats, searchFoodItems |
| `diet-handlers.js` | getFoodItems, saveFoodItem, hideFoodItem, unhideFoodItem, getMealTemplates, getDailyPlan, saveDailyPlanEntry, deleteDailyPlanEntry, deleteDailyPlanEntries, updateDailyPlanEntry, saveDish, getDishes, getDishIngredients, deleteDish, saveDishIngredient, linkDishToMeal, getDishesForMeal, unlinkDish |
| `training-handlers.js` | getExerciseLibrary, saveExercise, deleteExercise, getTrainingSessions, saveTrainingSession, deleteTrainingSession, getTrainingSets, saveTrainingSet, deleteTrainingSet, getTrainingRoutines, saveTrainingRoutine, deleteTrainingRoutine, getWorkoutPlans, getPlanDays, getExercisesByIds |
| `measurements-handlers.js` | getMeasurementSets, getLatestMeasurementSet, saveMeasurementSet, deleteMeasurementSet, getWeightEntries, saveWeightEntry, deleteWeightEntry |
| `energy-handlers.js` | getEnergyBalance, getWeeklyBalance, adjustMealGrams, getTrendWeight |
| `health-handlers.js` | Todos los handlers `health:*` + `db:getSleepData`, `db:getSleepAnalysis`, `db:getCyclingDistance`, `db:getDashboardData` |
| `settings-handlers.js` | getSetting, setSetting, getLastImportTimestamp, setLastImportTimestamp, exportData, importData |
| `dashboard-handlers.js` | getDashboardData (wrapper que orquesta health + activity + diet) |

**Alternativas**: Un solo registry con `require` dinámico por convención de nombre → más frágil, menos explícito.

**Razón**: Cada módulo es autocontenido, testeable por separado, y claro en su responsabilidad.

### D2: Cache cliente con stale-while-revalidate

**Decisión**: `src/renderer/utils/cache-store.js` exporta:
- `cacheGet(key)`: retorna dato cacheado si TTL < 30s, sino null
- `cacheSet(key, value)`: guarda con timestamp
- `cacheInvalidate(domain)`: limpia todas las keys de un dominio
- `on(domain, callback)`: suscribe a eventos de invalidación
- `emit(domain)`: emite evento de invalidación (llamado desde preload cuando hay `data-changed`)

El preload expone `onDomainChanged(domain, callback)` que el renderer usa para invalidar granularmente.

**Alternativas**: 
- IndexedDB → overkill, latencia de I/O innecesaria para datos que están en SQLite
- Solo invalidación genérica `onDataChanged` → actual, pero provoca refetch de TODO

**Razón**: Map en memoria es instantáneo. 30s TTL previene stale data sin refetchear en navegación rápida.

### D3: HealthSync en activity_summary_cache

**Decisión**: Agregar columnas al `activity_summary_cache`:
- `exercise_minutes REAL DEFAULT 0`
- `walking_km REAL DEFAULT 0`
- `cycling_km REAL DEFAULT 0`
- `hrv_avg REAL`
- `resting_hr_avg REAL`

`populateCache(periodDays)` ahora hace dos pasadas:
1. `activity_days` + `sport_activities` (como hoy)
2. HealthSync DB para HRV, RHR, exercise_time, distance (si está disponible)

Si HealthSync DB no existe (no hay Apple Watch), las columnas quedan en NULL/0.

**Razón**: Dashboard hoy consulta HealthSync DB por separado (5+ handlers `health:*`). Con el cache unificado, el dashboard consulta una sola fuente. Reduce IPC calls y tiempo de render.

### D4: CSS split por componente

**Decisión**: Extraer de `main.css`:

| Archivo | Contenido |
|---------|-----------|
| `styles/base.css` | `:root` custom properties, reset, tipografía base, scrollbar |
| `styles/layout.css` | `.app-layout`, `.sidebar`, `.main-content`, `.view` |
| `styles/cards.css` | `.card`, `.card-accent`, `.dashboard-card`, `.card-hero`, `.compliance-*` |
| `styles/forms.css` | `.form-group`, `input`, `select`, `textarea`, `.btn`, `.tag`, `.filter-btn` |
| `styles/tables.css` | `.data-table`, `.data-table-wrapper`, `.data-table-pagination` |
| `styles/utilities.css` | `.text-xs`, `.text-sm`, `.text-muted`, `.flex-gap-sm`, `.flex-gap-md`, skeletons |

`main.css` queda como:
```css
@import './base.css';
@import './layout.css';
@import './cards.css';
@import './forms.css';
@import './tables.css';
@import './utilities.css';
```

`index.html` solo referencia `main.css`. Vite resuelve `@import` en build.

**Alternativas**: Un solo archivo con secciones comentadas → ya lo tenemos. El problema es navegación y merge conflicts.

**Razón**: Cada archivo tiene ~200-400 líneas, fácil de ubicar. Sin cambios en el build.

## Risks / Trade-offs

- **[Riesgo] El split de handlers puede romper referencias a `refreshCaches`** → Mitigación: `refreshCaches` se exporta desde `database.js` y cada handler que escribe datos la importa.
- **[Riesgo] El cache cliente puede servir datos stale si el TTL es muy largo** → Mitigación: 30s es conservador. La invalidación por evento limpia inmediatamente en writes.
- **[Riesgo] El CSS split puede romper el orden de cascada** → Mitigación: el orden de `@import` en `main.css` preserva la cascada original. Test visual en todas las vistas.
- **[Riesgo] Agregar columnas al cache requiere migración de schema** → Mitigación: `ALTER TABLE ADD COLUMN` con `DEFAULT 0` / `DEFAULT NULL`. Sin data migration necesaria (el cache se repopula).
- **[Trade-off] La función `register()` recibe `getDb` como callback en vez de import directo** → Necesario porque `database.js` y los handlers tienen dependencia circular potencial. El callback rompe el ciclo.
