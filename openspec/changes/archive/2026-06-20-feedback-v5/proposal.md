## Why

v5 es la última intervención del agente antes de que el usuario tome la app para testearla por su cuenta y decidir el rumbo de v2. El scope original (6 bugs + strings en 2 vistas + sleep card) es insuficiente para que la app quede **realmente usable** — deja 6 vistas con ~112 IPC calls sin error handling, ~129 strings hardcodeadas sin localizar, y ~18 bugs activos.

Este cambio expande el scope para que la app esté pulida, estable y testeable.

## What Changes

### Bloque A — Esencial (estabilidad)
- **Fix 6 bugs originales**: typo `apple-healt-export`, typo `duration_min`, chart leak en adaptive.js, IPC listener leak en activity.js, `getWeightStats` duplicado, steps average sobre rango incorrecto
- **Error handling en TODAS las IPC calls**: ~99 calls sin protección reciben try/catch con patrón consistente `{ ok, data, error }` y fallback visual silencioso
- **Fix bugs descubiertos en auditoría**: plan duplicado en diet.js (empty if block), grams no persisten en diet.js, session equivocada en training.js, `_loading*` flags que nunca se liberan, promises colgadas en profile.js, `confirm()` con mensaje equivocado en measurements.js, BMR duplicado en adaptive.js, rate de pérdida usa rango incorrecto, charts sin destroy en analytics.js
- **Fix loading flags**: training.js y measurements.js usan `window._loading*` que nunca se resetea si hay error, bloqueando la vista permanentemente

### Bloque B — Localización completa
- Reemplazar strings hardcodeadas en activity.js y dashboard.js (ya en scope original)
- Reemplazar ~47 strings en diet.js, ~35 en training.js, ~20 en profile.js, 6 en adaptive.js, 2 en measurements.js
- Agregar ~50 nuevas keys a `locales/es.js` distribuidas en los dominios existentes

### Bloque C — Sleep card
- Handler IPC `db:getSleepData(from, to)` que consulta `activity_days.sleep_hours`
- Bridge en preload.js
- Tarjeta en dashboard con promedio, tendencia 7d, flecha de tendencia, indicador de cumplimiento (verde 7-9h, amarillo fuera de rango)

### Bloque D — Tests automatizados
- Setup de Vitest como test runner (compatible con Vite existente)
- Tests de humo: cada view carga sin crash con IPC mockeadas
- Tests de regresión para bugs fixeados
- Script `npm test` para ejecutar post-sesión

## Capabilities

### New Capabilities
- `sleep-dashboard`: Tarjeta de sueño en el dashboard
- `error-handling`: Manejo de errores IPC consistente en todas las vistas
- `automated-testing`: Suite de tests automatizados para validación post-sesión

### Modified Capabilities
- `spanish-ui`: Localización completa en las 8 vistas (antes solo 2)
- `dashboard-health-metrics`: Sleep como métrica adicional

## Impact

- `src/renderer/views/activity.js`: ~30 líneas (bugs + locale + error handling)
- `src/renderer/views/dashboard.js`: ~60 líneas (sleep card + bugs + locale + error handling)
- `src/renderer/views/diet.js`: ~60 líneas (locale + error handling + bug fixes)
- `src/renderer/views/training.js`: ~40 líneas (locale + error handling + bug fixes)
- `src/renderer/views/profile.js`: ~30 líneas (locale + error handling + dangling promises)
- `src/renderer/views/measurements.js`: ~30 líneas (locale + error handling + bug fixes)
- `src/renderer/views/adaptive.js`: ~20 líneas (chart leak + error handling + locale + bug fix)
- `src/renderer/views/analytics.js`: ~15 líneas (chart destroy en cada render)
- `src/renderer/locales/es.js`: ~80 nuevas keys
- `src/main/ipc-handlers.js`: ~25 líneas (handler db:getSleepData)
- `src/preload/preload.js`: ~3 líneas (bridge getSleepData + removeHealthImportProgressListener)
- `src/renderer/app.js`: ~2 líneas (si se necesita algún ajuste en destroyAllCharts)
- `package.json`: ~2 líneas (devDependency vitest + script test)
- `vitest.config.js`: ~10 líneas (nuevo archivo)
- `tests/`: ~10 archivos nuevos (smoke tests, regression tests)
