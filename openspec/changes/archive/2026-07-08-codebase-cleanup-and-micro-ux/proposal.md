## Why

Aprovechando que `multi-view-ux-polish-v2` toca muchos archivos del frontend, este change complementario limpia código muerto, corrige bugs menores de consistencia, y agrega micro-mejoras de UX de bajo esfuerzo que no justifican un change independiente pero mejoran la calidad general del código y la experiencia.

## What Changes

### Limpieza de código muerto
- **Eliminar cadena `mountWeeklyGoal`**: función mount (288 líneas), preload API (1 línea), handler backend (~25 líneas SQL) — nunca usado
- **Eliminar 25 preload APIs sin usar**: `getSleepData`, `getHealthBodyMass`, `getHealthHRVWeekly`, `getSportActivities`, `saveSportActivity`, etc.
- **Eliminar ~200 líneas de CSS duplicado** entre `cards.css` y `utilities.css`
- **Eliminar clases CSS sin uso**: `.strava-streak-broken`, `.strava-row-2`, `.strava-row-full`, `.metric-value-sm`, `.insights-view`
- **Eliminar `strength-derivation.js`** (263 líneas) + su test — solo el test lo importa, el backend tiene implementaciones duplicadas que son las canónicas

### Fix de bugs menores
- **`dashboard.js:133`**: agregar `.catch(() => null)` a `api.getDashboardData()` para consistencia con los otros 11 promises
- **`goals.js:184`**: envolver `api.archiveGoal(goalId)` con `safeCall()` para evitar unhandled promise rejection
- **`goals.js:62`**: reemplazar try/catch por `safeCall()` en `api.getGoalProgress()` para consistencia
- **`insights.js:142`**: `destroyCharts()` debe destruir también el tonnage chart de strength panels (memory leak)
- **`strength-insights-panels.js:10`**: mover `_tonnageChart` a `window._tonnageChart` para que `destroyAllCharts()` lo encuentre

### Micro-mejoras de UX
- **Tooltips en sparklines del dashboard**: agregar `title` attribute con min/max del periodo en cada sparkline
- **Keyboard navigation en tabs de PRs**: tabs navegables con arrow keys, `role="tablist"` + `aria-selected`
- **Progress bar en recovery empty state**: cuando no hay baseline completo, mostrar barra visual de progreso (X/30 días)
- **Skeleton realista en combined streak+calendar**: skeleton que refleje el layout 30/70 en vez de skeleton genérico
- **Transición suave al cambiar periodo en analytics**: `opacity: 0 → 1` con CSS transition de 200ms al recrear charts

## Capabilities

### New Capabilities
- `codebase-cleanup`: Eliminación de código muerto (funciones, preload APIs, CSS duplicado, archivo huérfano)
- `micro-ux-polish`: Micro-mejoras de UX (tooltips, keyboard nav, progress bar, skeleton, transiciones)

### Modified Capabilities
- `error-handling`: Fix de consistencia en error handling (safeCall, catch handlers)
- `loading-states`: Fix de memory leak en chart destruction, skeleton realista

## Impact

- **Frontend**: `dashboard.js`, `goals.js`, `insights.js`, `strength-insights-panels.js`
- **Panels**: `strava-panels.js` (eliminar `mountWeeklyGoal`)
- **Utils**: eliminar `strength-derivation.js`
- **Styles**: `cards.css` (eliminar duplicados y clases sin uso), `main.css` (eliminar `.insights-view`)
- **Preload**: `preload.js` (eliminar 25 APIs sin usar)
- **Backend**: `strava-panels-handlers.js` (eliminar handler `getWeeklyGoal`)
- **Tests**: eliminar `strength-derivation.test.js`, actualizar smoke tests si es necesario
- **0 schema changes, 0 nuevas dependencias, reducción neta de ~800 líneas de código**
