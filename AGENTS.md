# FitOS (PersonalPollo) — Project Knowledge

## Descripción General
App de salud y fitness local-first con arquitectura dual: Web (producción, multi-dispositivo) + Electron (desarrollo). Rastrea actividad Apple Watch, dieta por slots, balance energético con TDEE real, mediciones corporales y entrenamiento de fuerza. Todo en español.

## Stack
- **Web (Producción):** Express + SQLite (accesible desde cualquier dispositivo)
- **Desktop (Desarrollo):** Electron ^28.1 (contextIsolation: true, nodeIntegration: false)
- **Frontend:** Vanilla JS (ES modules), sin framework
- **Build:** Vite ^5.0.12 (root: `src/renderer/`, output: `dist/renderer/`)
- **DB:** better-sqlite3 ^9.4.3 (SQLite WAL mode, foreign keys ON, ubicada en `~/.fitos-data/health-data.db`)
- **Gráficos:** Chart.js ^4.4.1
- **Packaging:** electron-builder ^24.9.1 (NSIS/AppImage/dmg)

## Scripts Dev

### Modo Web (PRODUCCIÓN - Multi-dispositivo)
- `npm run switch:web && npm run build:web && npm run start:web` — Iniciar servidor web
- `npm run dev:web:full` — Desarrollo con Vite + Express
- `npm run rebuild:web` — Recompilar better-sqlite3 para Node.js

### Modo Electron (DESARROLLO - Debugging)
- `npm run switch:electron && npm run dev` — Iniciar Electron
- `npm run build` — Vite build + electron-builder
- `npm run rebuild:electron` — Recompilar better-sqlite3 para Electron

### Scripts Comunes
- `npx @electron/rebuild -o better-sqlite3` — Recompilar better-sqlite3 manualmente
- `npm run test` — Ejecutar tests con Vitest

## Arquitectura (Capas)

```
renderer/   →  preload/   →  main/   →  db/
(Vista)        (Puente)      (Ctrl)     (Modelo)
                ↑
           server/ (API REST para modo Web)
```

### `src/renderer/` — Frontend SPA
- **`app.js`**: Router manual, mapea `data-view` → función `init()`, CSS class `active-view`, `aria-current` nav, sidebar collapse on resize
- **`views/*.js`**: Cada view exporta `init()`, importa `strings` de `locales/es.js`
- **`locales/es.js`**: ~650 líneas con todos los strings en español. Objeto `strings` anidado por dominio, incluye `strings.states.*` para estados UI
- **`styles/main.css`**: ~880 líneas, design system con CSS custom properties, espacio/escala z, utilidades (`.text-xs`, `.flex-gap-md`), componentes (`.card-accent`, `.compliance-ok`), skeleton, responsive breakpoints
- **`index.html`**: Shell con sidebar (`<nav>` con `role="navigation"`), `<button class="nav-item" data-view="...">` en cada item, `.nav-icon` + `.nav-text` para colapsado
- **`utils/icons.js`**: SVG icon system via Lucide, exporta `icon(name, size=16)` → SVG string
- **`utils/sport-icons.js`**: Mapea `sport_type` → Lucide icon, exporta `sportIcon(type, size)` → SVG, `sportIconHtml(type, size)` → SVG + nombre
- **`utils/chart-theme.js`**: Lee CSS custom properties via `getComputedStyle`, exporta `chartColors` (accent, warning, danger, success, textSecondary, textPrimary, grid, accentHover) y `chartColorWithAlpha(hex, alpha)`
- **`utils/skeleton.js`**: Exporta `skeletonCard()`, `skeletonRow(count)`, `skeletonChart()` que devuelven HTML con `.skeleton` + `strings.states.loading` sr-only text
- **`utils/state-card.js`**: Exporta `renderStateCard(container, { title, state, valueHtml, subtitle, onRetry })` con estados `loading`/`empty`/`error`/`data`, usa `role="alert"` en error

Patrón de view:
```js
import { strings } from '../locales/es.js';
import { getAPI } from '../utils/api-detector.js';
export function init() {
  const container = document.getElementById('view-nombre');
  const api = getAPI();
  container.innerHTML = `...`;
  // event listeners + async render
}
```

### `src/preload/preload.js` — Bridge
- `contextBridge.exposeInMainWorld('electronAPI', ...)` expone métodos IPC
- Navegación: `navigate`, `onNavigate`, `onDataChanged`, `onHealthImportProgress`
- Cada dominio tiene get/save. NO hay lógica de negocio acá.

### `src/main/` — Lógica de negocio + Electron
- **`main.js`**: Crea ventana 1200x800, carga Vite dev o dist/, menú nativo (File, View, Help)
- **`ipc-handlers.js`**: 654 líneas, 40+ handlers `ipcMain.handle('db:*', ...)`. Cada handler es un caso de uso:
  - Profile, ActivityDays, SportActivities, FoodItems, MealTemplates, DailyPlans, MeasurementSets, WeightEntries, ExerciseLibrary, TrainingSessions/Sets, TrainingRoutines, EnergyBalance, Settings, TrendWeight, RecompData, Dashboard, ElaboratedDishes, WorkoutPlans, Export/Import
  - **Energy Balance**: BMR por Mifflin-St Jeor, NEAT = pasos * 0.04, TDEE = BMR + sport + NEAT
  - Usa `db.transaction()` para operaciones multi-tabla (CSV import)
- **`apple-health-import.js`**: Integración con HealthSync CLI (Go), parsea XML Apple Health

### `src/server/` — API REST (Modo Web)
- **`server.js`**: Servidor Express que sirve frontend estático + API REST en puerto 3000
- **`api-handlers.js`**: MockIpcMain que reutiliza los handlers IPC existentes como endpoints REST
- **`start-web.js`**: Entry point para producción web
- **`dev-web.js`**: Entry point para desarrollo web (Vite + Express concurrently)

### `src/renderer/utils/` — Utilidades Frontend
- **`api-detector.js`**: Detecta modo (Electron/Web) y retorna API apropiada
- **`web-api.js`**: Implementa interfaz compatible con electronAPI usando fetch()

### `src/db/` — Datos
- **`database.js`**: 22 tablas, schema v5 con migraciones (sport_types expandido, practical_examples, HealthSync cache, exercise enrichment, food_items fiber/category). Base de datos compartida ubicada en `~/.fitos-data/health-data.db` (usada por ambos modos: Web y Electron)
- **`seed-data.js`**: 198 alimentos, 53 ejercicios enriquecidos, 5 planes de fuerza + 12 planes HIIT/WOD/METCON/HYBRID, plantillas de 5 comidas con opciones por categoría
  - `seedIfEmpty(db)`: solo si las tablas están vacías (instalación limpia)
  - `migrateSeedData(db)`: upsert idempotente de foods/exercises/plans por nombre, bumpea `seed_version`
  - `resetSeedTemplates(db)`: reset completo de meal_components, exercise_library, workout_plans, elaborated_dishes (FK-safe), bumpea `seed_template_version`
- **`import-export.js`**: Backup/restore full JSON
- **Ver `docs/SEED_DATA.md`** para guía completa de cómo actualizar alimentos, ejercicios, planes, plantillas y platos elaborados
- **Ver `docs/KPIS.md`** para inventario vivo de KPIs (qué se computa, qué data hay disponible, qué está en backlog). Útil para descubrir features que se pueden implementar sin nueva data

## Tablas Principales
`user_profile`, `activity_days`, `sport_activities`, `food_items`, `meal_templates`, `meal_components`, `meal_options`, `daily_plans`, `daily_plan_entries`, `measurement_sets`, `weight_entries`, `training_routines`, `training_routine_days`, `exercise_library`, `training_sessions`, `training_sets`, `settings`, `elaborated_dishes`, `dish_ingredients`, `meal_dish_options`, `workout_plans`, `workout_plan_days`

## Convenciones de Código
- **No comentarios** en código salvo que se pida explícitamente
- Backend (main/db): CommonJS (`require`/`module.exports`)
- Frontend (renderer): ES modules (`import`/`export`)
- Handlers IPC: prefijo `db:` para CRUD (`db:getProfile`, `db:saveFoodItem`)
- Strings UI: siempre via `locales/es.js`, nunca hardcodeados
- CSS: custom properties, clase `.card` para paneles, `.form-group` para formularios
- Vistas: usan `getAPI()` de `utils/api-detector.js` (compatible con Electron y Web)
- Sin TypeScript, sin framework de UI, sin librería de componentes

## Notas Importantes
- La app funciona en **modo web** (sin Electron) con `npm run dev:web`, pero `window.electronAPI` será undefined
- Los alimentos se miden en kcal/macros **por 100g**
- Validación de forms en `src/renderer/validation.js`
- Todos los datos son **local-first**: 0 dependencia cloud, 0 APIs externas
- HealthSync es un CLI Go que se descarga e instala bajo demanda
- **Base de datos compartida**: Ambos modos (Web y Electron) usan `~/.fitos-data/health-data.db`
- **Ver `docs/ARCHITECTURE.md`** para explicación detallada de la evolución arquitectónica
- **Ver `docs/DEPLOYMENT.md`** para guía de despliegue en producción

## Sesión — feedback-v5 (20 Jun 2026) [ARCHIVADO]

### Estado: Completo — archivado en `openspec/changes/archive/2026-06-20-feedback-v5/`
- **82/82 tareas** implementadas (feedback original + auditoría + smoke tests)
- 13 bugs corregidos (6 originales + 7 audit-descubiertos)
- safeCall wrapper en todas las vistas (~99 calls IPC)
- Chart.js destroy-before-recreate en activity, dashboard, analytics, adaptive
- Loading flags con try/finally en training, measurements
- sleep card en dashboard con avg + 7d trailing + compliance indicator
- BMR duplicado eliminado: utilidad compartida `src/renderer/utils/bmr.js`
- Localización completa en las 8 vistas
- Delta specs sincronizados a main specs: `automated-testing`, `error-handling` (nuevos), `dashboard-health-metrics`, `spanish-ui` (actualizados)

### Tests (Vitest + jsdom)
- **22/22 tests pasan** (14 unit + 8 smoke)
- Smoke tests habilitados en `vitest.config.js` (include: `tests/unit/**/*.test.js`, `tests/smoke/**/*.test.js`)
- Fix: `adaptive.js` `init()` hecho `async` para compatibilidad con smoke tests

## OpenSpec — Ciclo de Spec-Driven Development

```
openspec/
├── config.yaml          # schema: spec-driven
├── specs/               # 13 specs activas (Gherkin-style scenarios)
│   ├── spec.md          # Root proposal
│   ├── activity-ingestion/spec.md
│   ├── apple-health-import/spec.md
│   ├── automated-testing/spec.md
│   ├── diet-plan-management/spec.md
│   ├── energy-balance/spec.md
│   ├── adaptive-planning/spec.md
│   ├── body-measurements/spec.md
│   ├── dashboard-health-metrics/spec.md
│   ├── error-handling/spec.md
│   ├── spanish-ui/spec.md
│   ├── strength-training/spec.md
│   ├── desktop-app/spec.md
│   ├── elaborated-dishes/spec.md
│   └── predefined-workout-plans/spec.md
└── changes/archive/     # Cambios completados
    ├── 2026-06-18-adaptive-health-foundation/
    ├── 2026-06-18-feedback-v0/
    ├── 2026-06-19-feedback-v1/
    ├── 2026-06-19-health-analytics-view/
    ├── 2026-06-20-feedback-v2/
    ├── 2026-06-20-feedback-v3/
    ├── 2026-06-20-feedback-v4/
    ├── 2026-06-20-feedback-v5/
    └── 2026-06-22-organic-redesign-all-views/
```

Ciclo de vida:
1. **opsx-explore** → Investigar, pensar, aclarar requerimientos
2. **opsx-propose** → Genera proposal.md + design.md + specs/ + tasks.md
3. **opsx-apply** → Implementar tarea por tarea contra las specs
4. **opsx-archive** → Fusiona delta-specs a main specs, archiva el cambio

Los comandos están en `.opencode/commands/opsx-*.md`. Skills en `.opencode/skills/openspec-*/SKILL.md`.

## Vistas Implementadas (10)
| View | ID | Funcionalidad |
|---|---|---|
| Dashboard | `dashboard` | Hero con anillo de crecimiento, Strava panels, 9+ KPIs con sparklines, selector de rango, sección de deportes |
| Patrones | `insights` | Heatmap anual, histograma DOW, donut de distribución deportiva, score de recuperación compuesto, velocidad de peso, ratio cintura-cadera, auto-insights |
| Tendencias | `analytics` | Visión global de salud: pasos, FC, energía, HRV, sueño, ranking de actividades, VO₂ max |
| Actividad | `activity` | Import Apple Health XML + CSV, resumen semanal, ranking ordenable con sparklines, comparación 15d/1m/3m |
| Sueño | `sleep` | Duración, fases (profundo/REM/ligero), consistencia, cumplimiento vs objetivo |
| Plan de Dieta | `diet` | 5 columnas de comidas, gestor de alimentos, platos elaborados, auto-generador desde déficit |
| Balance Energético | `energy` | Desglose GET (TMB + deporte + NEAT), gauge de adherencia, balance semanal |
| Mediciones | `measurements` | 10 métricas + peso, Navy body fat, charts históricos, before/after |
| Entrenamiento | `training` | 5 planes predefinidos, 55 ejercicios, registro sesiones RPE, gráficos progresión |
| Objetivos | `goals` | Metas configurables con anillos de progreso, cuenta regresiva, celebración con confeti, resumen en Panel |
| Perfil | `profile` | Perfil usuario, export/import JSON, umbrales de cumplimiento |

## Cambios Planificados (multiphase)

Roadmap incremental sobre el dashboard, definido durante explore-mode el 27 Jun 2026:

- **Phase 1 — `panel-ux-ui-kpis-summarized`** (en curso): Paneles Strava-style sobre el dashboard actual (PR banner, weekly goal ring, relative effort, training log bubble, streak, monthly calendar). Ajustes: migración a semanas ISO en `getSportLifetimeStats`, mejora de sport icons (paddle/football/boxing/yoga), utility `kpi-derivation.js`.
- **Phase 2 — `summary-insights-view`** (implementado): Nueva vista `insights` entre Panel y Tendencias. Year-in-motion heatmap, day-of-week histogram, sport distribution donut, recovery score composite (HRV+RHR+sleep), weight velocity chart, waist-to-hip ratio card, auto-insight cards. Code name en inglés, UI en español.
- **Phase 3 — `strength-training-insights`** (próximo): 1RM Epley, PR por ejercicio, plateau detector, volume PR, strength score.
- **Phase 4 — `goals-tracker`** (implementado): Goals configurables con progress rings y countdown, persistidos en `settings`.

## Notas Importantes
- La app funciona en **modo web** (sin Electron) con `npm run dev:web`, pero `window.electronAPI` será undefined
- Los alimentos se miden en kcal/macros **por 100g**
- Validación de forms en `src/renderer/validation.js`
- Todos los datos son **local-first**: 0 dependencia cloud, 0 APIs externas
- HealthSync es un CLI Go que se descarga e instala bajo demanda

## Sesión — panel-ux-ui-kpis-summarized (27 Jun 2026) [IMPLEMENTADO]

### Estado: Completo — listo para archivar vía `/opsx-archive`
- **126/126 tareas** implementadas (PR banner, weekly-goal ring, relative-effort, training-log bubble, monthly calendar, streak)
- 6 specs nuevas: `personal-records`, `weekly-goal-ring`, `relative-effort-card`, `training-log-bubble`, `monthly-activity-calendar`, `streak-tracker`
- 4 specs modificadas: `dashboard-health-metrics`, `organic-aesthetic`, `spanish-ui`, `iconography`
- Nuevos IPC handlers (`db:getPersonalRecords`, `db:getWeeklyGoal`, `db:getRelativeEffort`, `db:getTrainingLogWeek`, `db:getMonthlyCalendar`, `db:getStreak`) en `src/main/handlers/strava-panels-handlers.js`
- Migración a semanas ISO en `db:getSportLifetimeStats` y `computeWeekStreak()` (antes Sunday-Saturday)
- Sport icon improvements: `paddle`→`circle-dot`, `football`→`circle`, `boxing`→`swords`, `yoga`→`flower-2`
- Nuevo utility `src/renderer/utils/kpi-derivation.js` (322 líneas, 11 funciones puras, testables)
- Nuevo módulo `src/renderer/views/panels/strava-panels.js` (654 líneas, 6 mount functions)
- CSS `src/renderer/styles/cards.css` extendido con bloque Strava (~270 líneas de clases, todas token-based)
- Strings `strings.stravaPanels.*` (~30 keys) en `src/renderer/locales/es.js`
- **180/180 tests pasan** (45 unit nuevos en `kpi-derivation.test.js` + 8 smoke en `strava-panels.test.js` + 127 existentes)
- 0 breaking changes, 0 nuevas dependencias, 0 schema changes

## Sesión — organic-redesign-all-views (22 Jun 2026)

### Estado: Archivo — `openspec/changes/archive/2026-06-22-organic-redesign-all-views/`
- **45/45 tareas** implementadas (aplicación de diseño orgánico "libreta de campo" a las 8 vistas)
- 7 specs nuevas/actualizadas: `organic-aesthetic` (nueva), `temporal-microcharts` (nueva), `design-system`, `dashboard-health-metrics`, `ui-polish`, `accessibility`, `spanish-ui`
- Tokens orgánicos promovidos de `#view-dashboard` a `body.organic` global
- `sparkline()` y `growthRing()` extraídos a `utils/` como módulos reutilizables
- Anillo de crecimiento corregido: gap=0 para N≤14, gap=0.6° para N>14
- Hero card colapsa a compacto cuando faltan datos de pasos
- 6 vistas (activity, diet, energy, measurements, training, profile) y 2 vistas especiales (analytics, adaptive) ahora usan Fraunces/Source Sans 3 con paleta moss/bone/ember
- Gradiente top-bar eliminado globalmente bajo `body.organic`
- 14 tests nuevos (7 sparkline, 4 growth-ring, 2 smoke organic-tokens, 1 dashboard compact hero)
- **52/52 tests pasan**

## Sesión — goals-tracker (27 Jun 2026) [IMPLEMENTADO]

### Estado: Completo — listo para archivar vía `/opsx-archive`
- **51/51 tareas** implementadas (CRUD goals, progress rings, countdown, celebration confetti, dashboard summary card)
- 9 specs nuevas: `goal-crud`, `goal-progress-rings`, `goal-countdown`, `goal-celebration`, `goal-dashboard-card`, `goals-view`
- 3 specs modificadas: `dashboard-health-metrics`, `spanish-ui`, `design-system`
- Nuevo handler module `src/main/handlers/goals-handlers.js` con 6 IPC handlers: `db:getGoals`, `db:saveGoal`, `db:deleteGoal`, `db:archiveGoal`, `db:getGoalProgress`, `validateGoal`
- Nuevas utilidades: `goal-progress-ring.js` (SVG donut), `goals.js` (helpers puros), `confetti.js` (canvas particle animation)
- Nueva vista `src/renderer/views/goals.js` con CRUD completo (crear/editar/archivar/eliminar), secciones activos/completados/archivados, skeleton loading, overlay de celebración
- Goals sin schema changes: persistidos como JSON en `settings` tabla (clave `goals`)
- Card resumen en dashboard con hasta 3 anillos clickables (56×56 px), overflow "+N más", empty state "Define tu primer objetivo"
- **299/299 tests pasan** (7 unit goal-progress-ring + 11 unit goals-utils + 3 unit confetti + 5 smoke goals + 273 existentes)
- 0 breaking changes, 0 nuevas dependencias, 0 schema changes
