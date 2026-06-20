# FitOS (PersonalPollo) — Project Knowledge

## Descripción General
App desktop de salud y fitness local-first construida con Electron + SQLite. Rastrea actividad Apple Watch, dieta por slots, balance energético con TDEE real, mediciones corporales y entrenamiento de fuerza. Todo en español.

## Stack
- **Desktop:** Electron ^28.1 (contextIsolation: true, nodeIntegration: false)
- **Frontend:** Vanilla JS (ES modules), sin framework
- **Build:** Vite ^5.0.12 (root: `src/renderer/`, output: `dist/renderer/`)
- **DB:** better-sqlite3 ^9.4.3 (SQLite WAL mode, foreign keys ON)
- **Gráficos:** Chart.js ^4.4.1
- **Packaging:** electron-builder ^24.9.1 (NSIS/AppImage/dmg)

## Scripts Dev
- `npm run dev` — Vite + Electron concurrently
- `npm run build` — Vite build + electron-builder
- `npm run dev:web` — Solo frontend en navegador (sin Electron)
- `npx @electron/rebuild -o better-sqlite3` — Recompilar better-sqlite3 para la versión de Node de Electron (necesario si el módulo nativo da error de NODE_MODULE_VERSION)

## Arquitectura (Capas)

```
renderer/   →  preload/   →  main/   →  db/
(Vista)        (Puente)      (Ctrl)     (Modelo)
```

### `src/renderer/` — Frontend SPA
- **`app.js`**: Router manual, mapea `data-view` → función `init()`, CSS class `active-view`
- **`views/*.js`**: Cada view exporta `init()`, importa `strings` de `locales/es.js`
- **`locales/es.js`**: 355 líneas con todos los strings en español. Objeto `strings` anidado por dominio
- **`styles/main.css`**: 545 líneas, design system con CSS custom properties (variables `--bg-primary`, `--accent`, etc.)
- **`index.html`**: Shell con sidebar + 7 divs `.view` como `#view-dashboard`

Patrón de view:
```js
import { strings } from '../locales/es.js';
export function init() {
  const container = document.getElementById('view-nombre');
  const api = window.electronAPI;
  if (!api) return; // modo web sin Electron
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

### `src/db/` — Datos
- **`database.js`**: 22 tablas, schema v1 con migraciones (sport_types expandido, practical_examples)
- **`seed-data.js`**: 46 alimentos, 56 ejercicios, 5 workout plans (2x-6x semana)
- **`import-export.js`**: Backup/restore full JSON

## Tablas Principales
`user_profile`, `activity_days`, `sport_activities`, `food_items`, `meal_templates`, `meal_components`, `meal_options`, `daily_plans`, `daily_plan_entries`, `measurement_sets`, `weight_entries`, `training_routines`, `training_routine_days`, `exercise_library`, `training_sessions`, `training_sets`, `settings`, `elaborated_dishes`, `dish_ingredients`, `meal_dish_options`, `workout_plans`, `workout_plan_days`

## Convenciones de Código
- **No comentarios** en código salvo que se pida explícitamente
- Backend (main/db): CommonJS (`require`/`module.exports`)
- Frontend (renderer): ES modules (`import`/`export`)
- Handlers IPC: prefijo `db:` para CRUD (`db:getProfile`, `db:saveFoodItem`)
- Strings UI: siempre via `locales/es.js`, nunca hardcodeados
- CSS: custom properties, clase `.card` para paneles, `.form-group` para formularios
- Vistas: importan `strings` y usan `window.electronAPI` (no destructurar `api` si puede ser null)
- Sin TypeScript, sin framework de UI, sin librería de componentes

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
    └── 2026-06-20-feedback-v5/
```

Ciclo de vida:
1. **opsx-explore** → Investigar, pensar, aclarar requerimientos
2. **opsx-propose** → Genera proposal.md + design.md + specs/ + tasks.md
3. **opsx-apply** → Implementar tarea por tarea contra las specs
4. **opsx-archive** → Fusiona delta-specs a main specs, archiva el cambio

Los comandos están en `.opencode/commands/opsx-*.md`. Skills en `.opencode/skills/openspec-*/SKILL.md`.

## Vistas Implementadas (7)
| View | ID | Funcionalidad |
|---|---|---|
| Dashboard | `dashboard` | 5 cards resumen: calorías hoy, balance semanal, último peso, delta mediciones, próx. entrenamiento |
| Actividad | `activity` | Import CSV, import XML Apple Health, entrada manual, actividades deportivas con tipos, timeline, resumen semanal Chart.js |
| Plan de Dieta | `diet` | Templates de comidas, CRUD alimentos, learn/new food, platos elaborados, plan diario con auto-create |
| Balance Energético | `energy` | Breakdown TDEE (BMR + sport + NEAT), balance diario, balance semanal con warning <5 días |
| Mediciones | `measurements` | 10 métricas + peso, método Navy body fat, charts históricos, before/after |
| Entrenamiento | `training` | Planes 2-6 días, librería de ejercicios, sesiones con series/reps/RPE, charts progresión |
| Perfil | `profile` | Formulario perfil (edad, sexo, altura, peso, baseline), export/import JSON |

## Notas Importantes
- La app funciona en **modo web** (sin Electron) con `npm run dev:web`, pero `window.electronAPI` será undefined
- Los alimentos se miden en kcal/macros **por 100g**
- Validación de forms en `src/renderer/validation.js`
- Todos los datos son **local-first**: 0 dependencia cloud, 0 APIs externas
- HealthSync es un CLI Go que se descarga e instala bajo demanda
