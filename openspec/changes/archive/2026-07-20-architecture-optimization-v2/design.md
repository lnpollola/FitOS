# Design: architecture-optimization-v2

## Context

Tras 20+ cambios de features en 5 semanas, la arquitectura acumula deuda verificada por auditoría (20 Jul 2026):

- **Bridge triplicado**: 92 canales IPC (`db:*`/`health:*`) se mantienen a mano en `src/main/handlers/*` + `src/preload/preload.js` (102 métodos) + `src/renderer/utils/web-api.js` (81 métodos). El drift ya ocurrió: 11 handlers registrados en backend sin caller en preload/web-api/vistas (residuo de `codebase-cleanup`, que los preservó deliberadamente: "Backend handlers SHALL remain intact").
- **Charts por convención**: 20 `new Chart()` asignados a globales `window._*Chart`; `app.js:44-49` los destruye escaneando `Object.keys(window)` por prefijo/sufijo. Contrato implícito, frágil ante cualquier nombre que no cumpla el patrón.
- **Router eager**: `app.js:1-11` importa estáticamente las 12 vistas (~7.900 líneas) al arrancar.
- **CSS**: 72 nombres de clase definidos en 2+ archivos; `.card` en 3 (`cards.css`, `forms.css`, `utilities.css`).
- **Scripts rotos**: `scripts/rebuild-for-web.js:7` y `rebuild-for-electron.js:7` resuelven cwd a `~/.projects` (fuera del repo).
- **Tests**: `tests/regression/loading-flags.test.js` fuera del `include` de vitest — nunca corre.

### Blind spots de la auditoría profunda

- **Bug confirmado**: `measurements-handlers.js:3` declara `function(ipcMain, getDb, getHS)` pero usa `notifyDomain` en líneas 26 y 44 sin declararlo → `ReferenceError` en cada save de medida/peso. Probado con Node 20.
- **Iconos rotos**: 8 nombres de icono (`info`, `alert-triangle`, `check-circle`, `badge-check`, `pencil`, `trash-2`, `archive`, `x`) registrados en `icons.js` pero sin import de Lucide → retornan SVG vacío silenciosamente.
- **Dead code**: `cache-store.js` (nadie lee del cache), `validation.js` (0 vistas lo importan), `state-card.js` ramas `loading`/`empty` (solo `error` se usa), evento `domain-changed` (0 emisores).
- **IPC listener leak**: `onDataChanged`/`onNavigate` añaden listener en cada `init()` de vista sin removerlo.
- **Missing data-changed**: el handler IPC de import no emite evento → UI stale post-import.
- **N+1 en dieta**: `getMealTemplates` → ~31 queries (1 plantilla + 5 componentes + 25 opciones).
- **Cero LIMIT**: `activity_days`, `measurement_sets`, `weight_entries` sin límite de filas.

## Goals / Non-Goals

**Goals:**
- Un solo punto de verdad para el catálogo de canales API; drift detectable por test.
- Ciclo de vida de charts explícito y centralizado, sin globales ni convenciones de nombre.
- Arranque sin parsear vistas no visitadas (lazy por vista).
- Cero clases CSS duplicadas entre archivos, con test que lo garantice.
- Scripts de modo web/electron funcionando; repo raíz limpio; suite de tests completa y ejecutada al 100%.

**Non-Goals:**
- Upgrade de Electron 28 → actual (migración separada por riesgo de ABI/packaging).
- Split de vistas grandes (`diet.js` 1260 líneas) o de `locales/es.js` (1186 líneas): se documenta como backlog, no se toca aquí.
- Índices DB, Content-Security-Policy, HealthSync install verification, import version validation: cada uno merece su propio cambio separado.
- Refactor N+1 de dieta (reemplazar JOIN loop por query única): queda como backlog, demasiado riesgo para este cambio.
- Split de kpi-derivation.js (600+ líneas tras formatters extraction): backlog.
- Cambios de comportamiento visibles para el usuario (salvo fixes de bugs): es refactor interno.

## Decisions

### D1 — Bridge API: codegen desde manifiesto (no runtime require)

Nuevo manifiesto `src/shared/api-channels.js` (CJS) exporta el catálogo: `[{ channel, method, args }]`. Un generador `scripts/generate-api-bridge.js` produce **ambos** archivos estáticos:
- `src/preload/preload.js` — objeto `electronAPI` con `invoke(channel, ...)` por entrada + bloque manual preservado (eventos `onNavigate`, `onDataChanged`...) vía markers `// __MANUAL_START__/__MANUAL_END__`.
- `src/renderer/utils/web-api.js` — mismo catálogo con `apiCall(channel, ...)` + bloque manual (exportData/importData con file-picker, no-ops de eventos).

**Alternativas consideradas:**
- *Runtime require del manifiesto desde preload*: descartado — preload corre con `contextIsolation: true` y sandbox; `require` de archivos propios es frágil según configuración. Codegen produce preload 100% estático, igual que hoy.
- *Codegen solo de web-api*: insuficiente — preload también drifta.

**Anti-drift**: test unitario `tests/unit/api-bridge.test.js` ejecuta el generador en memoria y compara con los archivos commiteados; falla si alguien edita uno sin el otro. Header `// GENERATED FILE — edit src/shared/api-channels.js` en ambos outputs.

### D2 — Chart manager con Map por id

Nuevo `src/renderer/charts/chart-manager.js` (ESM):
```js
const registry = new Map();
export function createChart(id, ctx, config) // destroy previo con mismo id, registra, devuelve Chart
export function getChart(id)
export function destroyChart(id)
export function destroyAllCharts()               // llamado por app.js en navegación
```
- `app.js` reemplaza el escaneo de `window._*Chart` por `destroyAllCharts()` importado.
- Las 20 llamadas en 9 archivos migran de `window._xChart = new Chart(...)` a `createChart('x', ctx, ...)`.
- Acceso posterior (updates de data) vía `getChart('x')` en vez de globales.

**Alternativa**: registry por vista con auto-namespacing — innecesario; ids ya son únicos por convención actual.

### D3 — Lazy loading de vistas en router

`app.js`: el mapa `views` pasa a loaders `() => import('./views/x.js')`. `showView` se vuelve async: destruye charts → activa clases → `const { init } = await loader()` → `init()`. Guardas:
- flag `_loadingView` para ignorar navegaciones concurrentes a la misma vista (reusa patrón `_navigateTimeout`).
- try/catch con `renderStateCard(container, { state: 'error', onRetry })` ante fallo de chunk.
- Vite genera chunks por vista en build; en dev es transparente.

**Alternativa**: eager solo del dashboard — rechazada: uniformidad y simplicidad; el dashboard lazy añade <50 ms en local.

### D4 — Deduplicación CSS con test de unicidad

Regla de dominio único por clase: tokens/reset→`base.css`, layout/sidebar→`layout.css`, cards/paneles→`cards.css`, forms/botones→`forms.css`, tablas→`tables.css`, helpers→`utilities.css`. Proceso por cada una de las 72 colisiones:
1. Comparar cuerpos de regla: si son idénticos → conservar en archivo de dominio, borrar el resto.
2. Si difieren → conservar la que hoy "gana" por orden de `@import` en `main.css` (cero cambio visual), moverla al archivo de dominio, borrar la otra.

**Garantía**: `tests/unit/css-uniqueness.test.js` parsea `styles/*.css` y falla si alguna clase raíz aparece en 2+ archivos.

### D5 — Formatters canónicos

Nuevo `src/renderer/utils/formatters.js` (ESM) como hogar único: `formatNumber`, `formatDateShort/Long/Range`, `formatDuration`, `formatKcal`, `escapeHtml`. `kpi-derivation.js` re-exporta los 4 que ya define (compat con sus tests e importadores). Migración de: ~27 `toLocaleDateString/toLocaleString` inline (activity×8, dashboard×10, strength-insights-panels×5, strava-panels×1, measurements×1, analytics×2) y helpers locales duplicados (`escapeHtml` en goals.js, `formatDelta`, `formatPrValue`).

### D6 — Eliminación de handlers huérfanos

Borrar registro + función de los 11 handlers sin caller: `activity-handlers` (getSportActivities, saveSportActivity, saveActivityDay, importActivityCSV, getWeeklySportSummary), `health-handlers` (getSleepData), `settings-handlers` (getTrendWeight), `diet-handlers` (getDishesForMeal, unlinkDish), `training-handlers` (getExercisesByIds) + imports/helpers que queden sin uso. Actualizar `AGENTS.md` (lista de dominios menciona TrendWeight).

### D7 — Fix iconos rotos + cleanup de imports

Nuevo `src/renderer/utils/icons.js`: añadir los 8 import faltantes (`Info`, `AlertTriangle`, `CheckCircle`, `BadgeCheck`, `Pencil`, `Trash2`, `Archive`, `X`) a la lista de named imports de Lucide y a `iconRegistry`. Remover los 9 imports no usados (`Download`, `Upload`, `Menu`, `Zap`, `Lightbulb`, `ScanLine`, `ArrowUpRightFromSquare`, `CircleUser`, `AlertCircle`). Los SVG de estos iconos actualmente se excluyen del bundle; los rotos ahora se incluirán y renderizarán correctamente.

**Alternativa**: export helpers individuales (`iconCheck = (s) => icon('check', s)`) para tree-shaking óptimo — descartado por ahora para mantener cambio mínimo; queda como backlog.

### D8 — safeHandle wrapper para error handling consistente

Nuevo `src/main/utils/safe-handler.js` (CJS):
```js
function safeHandle(ipc, channel, handler) {
  ipc.handle(channel, async (_event, ...args) => {
    try {
      return { ok: true, data: await handler(...args) };
    } catch (e) {
      console.error(`[${channel}]`, e);
      return { ok: false, error: e.message };
    }
  });
}
```
Todos los handlers existentes migran a `safeHandle`. Esto:
- Elimina la inconsistencia actual: 7 handlers sin try/catch, 1 con 26.
- Da formato de respuesta uniforme `{ok, data/error}` — las vistas parsean `ok` para decidir.
- Los handlers existentes con try/catch propio (`health-handlers.js` 26 wraps) se simplifican a `safeHandle`.
- El orden de parámetros se estandariza a `(ipc, getDb, getHS, notifyDomain)` en todas las firmas.

**Bug fix añadido**: `measurements-handlers.js` al migrar a `safeHandle` recibe `notifyDomain` correctamente como 4º param.

### D9 — Remover dead code

- `cache-store.js`: eliminar archivo, eliminar su import y `onDomainChanged` handler en `app.js`. El evento `domain-changed` no tiene emisores — eliminarlo de preload.js también.
- `validation.js` (52 líneas): eliminar archivo. Ninguna vista lo usa. Cada vista hace su validación inline.
- `state-card.js`: mantener pero documentar que ramas `loading` y `empty` no se usan. No se eliminan porque se espera usarlas en futuros refactors.

### D10 — Fix IPC listener leak + data-changed after import

- `app.js`: cambiar `api.onDataChanged(cb)` de `ipcRenderer.on('data-changed', cb)` a `removeAllListeners('data-changed')` + `on('data-changed', cb)` para evitar acumulación.
- Misma corrección para `onNavigate`.
- `settings-handlers.js:64-71`: tras completar el import, emitir `if (notifyDomain) notifyDomain("settings")` para refrescar la UI.

### D11 — LIMIT en queries unbounded

Añadir `LIMIT 365` a:
- `activity-handlers.js:69`: `SELECT * FROM activity_days ORDER BY date DESC LIMIT 365`
- `measurements-handlers.js:6`: `SELECT * FROM measurement_sets ORDER BY date DESC LIMIT 365`
- `measurements-handlers.js:38`: `SELECT * FROM weight_entries ORDER BY date DESC LIMIT 365`

La UI nunca muestra más de un año de datos a la vez. El límite evita degradación progresiva.

### D7 — Higiene y scripts (original)

- Fix `path.join(__dirname, '..')` en ambos rebuild scripts; extraer bootstrap Electron-mock compartido de `sync/reset-healthsync.js` a `scripts/lib/electron-mock.js`.
- Raíz: `Modelo_DietaRes.md`, `Rutinas_Fuerza_GYM.md`, `PersonalPollo.md`, `Newpanels.md` → `docs/history/`; borrar `design-system/` (vacío, sin referencias).
- `.current-mode`: `git rm --cached` + `.gitignore`.
- `package.json`: versión `0.7.0` (alinear con README); `lucide` a `dependencies`.
- `vitest.config.js`: añadir `tests/regression/**/*.test.js` al include; nuevo smoke test `tests/smoke/sleep.test.js`.

## Risks / Trade-offs

- [Codegen desactualizado si alguien edita output a mano] → Test anti-drift en suite; header "GENERATED" + convención documentada en AGENTS.md.
- [CSS con mismo nombre y reglas distintas: quitar el "perdedor" cambia rendering] → Caso a caso preservando el ganador actual por orden de import; verificación visual de vistas + smoke tests.
- [Chart manager pierde un destroy → leak de canvas] → `destroyAllCharts()` central en navegación (mismo punto que hoy) + test unitario de create/destroy/idempotencia.
- [Lazy loading rompe smoke tests] → No los toca (importan vistas directo); se añade test del mapa de loaders del router.
- [Borrar handler "huérfano" que un flujo externo usa] → Verificado por grep en todo `src/renderer`, `preload`, `web-api`: 0 referencias. Los canales tampoco existen en el bridge, imposible invocarlos desde UI.
- [Muchos archivos tocados (60+)] → Workstreams independientes y mergeables por separado; `npm test` verde tras cada uno.
- [safeHandle cambia formato de respuesta: views deben parsear `ok` vs `data`] → Migración progresiva: views existentes no tocan su lógica (safeHandle mantiene interfaz plano), nuevas vistas usan `{ok, data}`. Se puede añadir un flag `raw:true` para retrocompat si es necesario.
- [LIMIT 365 en activity_days puede esconder datos si usuario quiere ver años anteriores] → El view ya limita a 1 año por defecto; si necesita más, debe especificar rango de fechas explícito. LIMIT es piso de seguridad, no reemplaza el filtro.

## Migration Plan

Orden de ejecución (riesgo ascendente, cada paso deja tests verdes):
1. **WS1** Higiene repo + fix scripts + vitest include regression
2. **WS2** Dead handlers + AGENTS.md
3. **WS3** Icon audit: imports faltantes + remover imports muertos
4. **WS4** Remover dead code: cache-store.js, validation.js, onDomainChanged
5. **WS5** Fix IPC listener leak + emitir data-changed tras import
6. **WS6** LIMIT 365 en queries unbounded (activity_days, measurement_sets, weight_entries)
7. **WS7** Bridge registry codegen + test anti-drift
8. **WS8** Chart manager + migración de 20 call sites
9. **WS9** Formatters + migración inline
10. **WS10** CSS dedup + test unicidad
11. **WS11** Lazy loading router + smoke sleep
12. **WS12** safeHandle wrapper + migración de 13 handlers + fix measurements bug + estandarizar firmas

Rollback: `git revert` por workstream (commits separados). Sin cambios de datos → sin migración de DB.

## Open Questions

- Ninguna bloqueante. (Backlog documentado fuera de scope: split de vistas grandes, split de `es.js`, upgrade Electron, tests de handlers.)
