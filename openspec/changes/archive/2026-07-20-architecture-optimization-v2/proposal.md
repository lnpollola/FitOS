# Proposal: architecture-optimization-v2

## Why

Una auditoría completa de arquitectura (Jul 2026) reveló deuda estructural acumulada tras 20+ cambios de features: un workflow de build roto (`rebuild-for-web.js` apunta fuera del repo), 92 handlers IPC mantenidos a mano en 3 lugares (handler + preload + web-api) con drift real (11 handlers huérfanos), 20 Chart.js en globales `window._*Chart`  con destroy por escaneo de nombres, 72 clases CSS duplicadas, vistas cargadas eager al arrancar, y tests de regresión que nunca corren.

Auditoría profunda adicional descubrió más capas:

- **Bug confirmado**: `measurements-handlers.js:3` no declara `notifyDomain` en sus params, cada save de peso/medida tira `ReferenceError` (probado).
- **8 iconos silenciosamente rotos**: `info`, `alert-triangle`, `check-circle`, `pencil`, `trash-2`, `archive`, `badge-check`, `x` registrados en el sistema de iconos pero sin import → retornan SVG vacío en dashboard, goals, strength panels.
- **Dead code**: `cache-store.js` (36 líneas, nadie lee del cache), `validation.js` (52 líneas, 0 vistas lo importan), `state-card.js` (ramas `loading`/`empty` nunca usadas), `domain-changed` (evento sin emisores).
- **IPC listener leak**: `onDataChanged` añade listener en cada init de vista y nunca lo remueve → acumulación de listeners por navegación repetida.
- **Data-changed no emitido tras import**: el handler de import IPC no envía evento al renderer, la UI queda stale.
- **N+1 en dieta**: `getMealTemplates` hace ~31 queries (1 + 5 + 25) para un solo render.
- **No LIMIT en queries unbounded**: `activity_days`, `measurement_sets`, `weight_entries` sin límite de filas.
- **Cero índices en 22 tablas**: ni un solo `CREATE INDEX`. Las 10+ queries por rango de fechas hacen full table scan.

## What Changes

- **Fix scripts de build (bug)**: `path.join(__dirname, '..')` en ambos rebuild scripts.
- **Bridge API unificado**: registry único `src/shared/api-channels.js` → generación estática de `preload.js` + `web-api.js`.
- **Eliminar 11 handlers huérfanos**: canales backend sin caller en preload/web-api/vistas.
- **Chart lifecycle manager**: `chart-manager.js` con registro `Map` reemplazando globales `window._*Chart`.
- **Lazy loading de vistas**: `import()` dinámico por vista en el router.
- **Deduplicación CSS**: 72 clases duplicadas entre 7 archivos → unicidad por dominio.
- **Formatters compartidos**: `formatters.js` canónico + migración de ~27 locale calls inline.
- **Fix measurement save bug**: añadir `notifyDomain` a params de `register()` en measurements-handlers.
- **Fix iconos rotos**: añadir 8 imports faltantes, remover 9 imports muertos en `icons.js`.
- **Remover dead code**: `cache-store.js`, `validation.js`, ramas `loading/empty` de `state-card.js` (o documentar), evento `domain-changed`.
- **Fix IPC listener leak**: limpiar listeners en cada navegación o hacer singleton en `app.js`.
- **Emitir `data-changed` tras import IPC**: 1 línea en settings-handlers.
- **SafeHandle wrapper**: función envolvente para try/catch consistente en los 13 handlers.
- **LIMIT en queries unbounded**: activity_days (365), measurement_sets (365), weight_entries (365).

## Capabilities

### New Capabilities
- `api-bridge-registry`: Registry único de canales con generación estática y test anti-drift.
- `chart-lifecycle`: Gestión centralizada de Chart.js con registro por id.
- `view-lazy-loading`: Carga diferida de vistas bajo demanda.
- `shared-formatters`: Utilidades de formateo únicas para todas las vistas.
- `handler-error-handling`: Wrapper safeHandle para try/catch consistente + fix measurements bug + estandarización de firmas.
- `icon-audit-fix`: Corrección de registros faltantes y imports muertos en el sistema de iconos Lucide.

### Modified Capabilities
- `codebase-cleanup`: handlers huérfanos eliminados (antes preservados); scripts de rebuild arreglados; se añade: remover cache-store.js, validation.js, fix listener leak IPC, emitir data-changed tras import, LIMIT en queries unbounded.
- `css-component-files`: unicidad de clases (72 colisiones resueltas).
- `automated-testing`: regression tests incluidos; sleep smoke test añadido.

## Impact

- **Código**: todos los archivos listados anteriormente + `src/main/handlers/measurements-handlers.js` (fix), `src/renderer/utils/icons.js` (iconos), `src/main/handlers/settings-handlers.js` (data-changed after import).
- **APIs**: sin cambios de contrato en canales vivos.
- **Dependencias**: `lucide` pasa a dependencies.
- **Fuera de scope**: índices DB, CSP, HealthSync install seguridad, import version validation, N+1 refactor completo de dieta, split de kpi-derivation, split de es.js, upgrade Electron.
