## Why

La auditoría de feedback-v4 identificó 6 bugs activos, ~80 strings hardcodeadas sin localizar en 6 vistas, y ausencia total de error handling en llamadas IPC en 6 de 8 vistas. Además, los datos de sueño existen en `activity_days.sleep_hours` pero no se muestran en el dashboard. Este cambio limpia deuda técnica crítica y cierra el gap de sueño en la pantalla principal.

## What Changes

- **Fix 6 bugs**: typo en path de import (`apple-healt-export`), typo `duration_min` → `duration_minutes`, memory leak en `adaptive.js` (chart sin cleanup), listener IPC no removido en `activity.js`, llamada duplicada `getWeightStats` en `dashboard.js`, promedios de steps sobre rango incorrecto
- **Reemplazar strings hardcodeadas** en `activity.js` y `dashboard.js` con referencias a locale keys
- **Agregar error handling** (try/catch + UI fallback) en todas las llamadas IPC de `activity.js` y `dashboard.js`
- **Agregar card de sueño al dashboard**: muestra horas de sueño promedio del período, tendencia 7d, y comparativa con objetivo (7-9h)
- **Agregar handler IPC** `db:getSleepData(from, to)` que consulta `activity_days.sleep_hours`

## Capabilities

### New Capabilities
- `sleep-dashboard`: Tarjeta de sueño en el dashboard con promedio, tendencia y cumplimiento de objetivo

### Modified Capabilities
- `spanish-ui`: Reemplazar strings hardcodeadas restantes en activity.js y dashboard.js
- `dashboard-health-metrics`: Agregar sleep como métrica adicional en el dashboard

## Impact

- `src/renderer/views/activity.js`: ~15 líneas modificadas (bugs + locale keys + error handling)
- `src/renderer/views/dashboard.js`: ~40 líneas nuevas (sleep card) + ~15 modificadas (locale keys + error handling + fix bugs)
- `src/renderer/views/adaptive.js`: 1 línea (fix memory leak)
- `src/renderer/locales/es.js`: ~10 nuevas keys para dashboard + activity
- `src/main/ipc-handlers.js`: ~20 líneas nuevas (handler `db:getSleepData`)
- `src/preload/preload.js`: 1 línea (bridge para sleep data)
