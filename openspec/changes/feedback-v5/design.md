## Context

Estado actual: 6 bugs activos identificados en auditoría de feedback-v4, ~80 strings hardcodeadas sin localizar, 0 error handling en IPC calls en 6/8 vistas. Los datos de sueño existen en `activity_days.sleep_hours` (poblado vía import Apple Health) pero no se muestran en el dashboard.

## Goals / Non-Goals

**Goals:**
- Corregir 6 bugs específicos con consecuencias visibles (valores incorrectos, memory leaks, paths rotos)
- Reemplazar strings hardcodeadas en `activity.js` y `dashboard.js` con locale keys existentes o nuevas
- Agregar error handling consistente en todas las IPC calls de `activity.js` y `dashboard.js`
- Agregar sleep card al dashboard usando datos existentes de `activity_days.sleep_hours`

**Non-Goals:**
- NO incluye reemplazo de strings en `diet.js`, `training.js`, `profile.js` (quedan para feedbacks futuros)
- NO incluye CSV import (pospuesto)
- NO incluye Settings view (requiere diseño separado)
- NO incluye notificaciones del sistema

## Decisions

1. **Nuevo handler IPC separado para sleep** en vez de modificar `db:getDashboardData`: `db:getSleepData(from, to)` mantiene separación de concerns y evita cambiar un handler existente que otros features pueden usar.

2. **Error handling con patrón `{ ok, data, error }`**: Consistente con el patrón existente en `health:getDashboardMetrics`. Cada IPC call envuelta en try/catch en el handler, y el renderer muestra un fallback silencioso (card con "--" o mensaje de error).

3. **Sleep card en el dashboard**: Sigue el mismo patrón que las cards existentes de health metrics (standing hours, exercise time, SpO2). Card pequeña con valor promedio + indicador de cumplimiento (verde si 7-9h, amarillo si <7 o >9).

4. **Corrección de bugs**: Cada bug se arregla con el cambio mínimo necesario, sin refactors mayores:
   - Typo `duration_min`: cambiar a `duration_minutes`
   - Path import: cambiar a `apple-health-export`
   - Memory leak: guardar chart en `window._energyChart`
   - Listener IPC: guardar referencia y remover en cleanup
   - Duplicado `getWeightStats`: eliminar primer call
   - Steps averages: computar sobre sub-rangos correctos

## Risks / Trade-offs

- [Riesgo] Cambiar `duration_min` a `duration_minutes` puede romper si hay otro código que use el typo. → Buscar `duration_min` en todo el código antes de cambiar.
- [Riesgo] El sleep card depende de datos importados; usuarios nuevos sin import verán "--". → Manejar empty state explícitamente.
- [Trade-off] No tocar `diet.js` y `training.js` ahora significa que esas vistas siguen con strings hardcodeadas, pero el cambio se mantiene acotado y entregable.
