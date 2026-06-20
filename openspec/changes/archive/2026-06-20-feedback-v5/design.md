## Context

v5 es el último cambio antes de que el usuario pase a testear la app por su cuenta. La auditoría reveló que el scope original (solo activity.js + dashboard.js) deja 6 vistas con ~112 IPC calls sin protección, ~129 strings hardcodeadas, y ~18 bugs. El objetivo es que la app esté **estable, localizada y testeable** para uso real.

## Goals / Non-Goals

**Goals:**
- Corregir TODOS los bugs conocidos (originales + descubiertos en auditoría)
- Agregar error handling consistente en TODAS las IPC calls de TODAS las 8 vistas
- Reemplazar TODAS las strings hardcodeadas con locale keys
- Agregar sleep card al dashboard
- Setup de tests automatizados con Vitest

**Non-Goals:**
- NO incluye nuevas features (solo bugs + localización + tests)
- NO incluye CSV import (pospuesto)
- NO incluye Settings view (requiere diseño separado)
- NO incluye notificaciones del sistema
- NO incluye refactors mayores (cada cambio es mínimo y focalizado)

## Decisions

### 1. Patrón de error handling IPC: `safeCall()` wrapper

En vez de agregar try/catch manual en cada IPC call (que suma ~99 cambios idénticos), se crea una función utilitaria `safeCall()` en `src/renderer/validation.js` (o un nuevo `src/renderer/utils/ipc.js`):

```js
export async function safeCall(promise, fallback = null) {
  try { return await promise; }
  catch (e) { console.error('IPC error:', e); return fallback; }
}
```

Cada vista importa `safeCall` y envuelve sus IPC calls. Esto es consistente, testeable y minimiza el diff.

**Razonamiento**: El patrón `{ ok, data, error }` que se menciona en el diseño original está en el backend (handlers IPC). El frontend necesita un wrapper que atrape errores de red/comunicación (no de lógica). `safeCall()` es más limpio que 99 try/catch individuales.

### 2. Chart.js cleanup: destroy antes de recrear

Para evitar memory leaks, toda creación de chart debe:
1. Verificar si existe una instancia previa en `window._*Chart`
2. Hacer `.destroy()` si existe
3. Asignar la nueva instancia

Esto aplica a:
- `analytics.js`: 8 charts (steps, HR, energy, HRV, sleep, activity ranking, mini charts)
- `adaptive.js`: 1 chart (recomp)
- `activity.js`: 1 chart (weekly summary) — ya usa `window._weeklyChart` pero no hace destroy previo
- `dashboard.js`: 1 chart (trend) — ya usa `window._dashTrendChart` pero no hace destroy previo

Se crea una función utilitaria opcional `safeCreateChart(canvasId, config)` que encapsula el patrón.

### 3. Patrón de cleanup de vistas

Cada vista que registre IPC listeners (`onHealthImportProgress`) debe:
1. Guardar la referencia del callback
2. Exportar una función `cleanup()` que remueva el listener
3. `app.js` debe llamar `cleanup()` en cada navegación (antes de destroyAllCharts)

Esto resuelve el listener leak en activity.js y sienta base para futuras vistas.

### 4. Localización: no usar fallback `|| 'string'`

El patrón actual en muchas vistas es:
```js
strings.training.frequency || 'Frecuencia'
```

Esto es ruido muerto — si la key existe en `es.js`, el fallback nunca se ejecuta. Si no existe, el fallback oculta el error. Se eliminarán todos los `|| '...'` donde la key ya existe en el locale, y se agregarán las keys faltantes.

### 5. Loading flags con try/finally

Vistas que usan `window._loadingXxx` para evitar doble inicialización (training.js, measurements.js) deben envolver el cuerpo de `init()` en try/finally para garantizar que la flag siempre se libere:

```js
export async function init() {
  if (window._loadingXxx) return;
  window._loadingXxx = true;
  try {
    // ... todo el código de inicialización ...
  } finally {
    window._loadingXxx = false;
  }
}
```

### 6. Test framework: Vitest

**Razonamiento**: Vitest es compatible con Vite (ya en uso), soporta ES modules (frontend) y CommonJS (backend) en la misma suite, y no requiere configuración adicional de transpilación. jsdom para tests de DOM.

- Tests de humo: cada vista importa su `init()`, se mockea `window.electronAPI`, se verifica que no crashe
- Tests de regresión: para cada bug fixeado, un test que verifica el comportamiento correcto
- Los tests se ejecutan con `npx vitest run` (CI mode) o `npx vitest` (watch mode)

### 7. Corrección de bugs específicos

| Bug | Solución | Archivo |
|---|---|---|
| `apple-healt-export` typo | `healt` → `health` | activity.js:132, es.js:100 |
| `duration_min` typo | `duration_min` → `duration_minutes` | activity.js:252 |
| Chart leak adaptive.js | Guardar en `window._energyChart` | adaptive.js:261 |
| Listener IPC leak | Guardar callback + `removeHealthImportProgressListener` | activity.js:117-122, preload.js |
| `getWeightStats` duplicado | Eliminar primer call | dashboard.js:57 |
| Steps avg wrong range | `dailyData.slice(-7)`, `-15`, `-actual` | dashboard.js:162-164 |
| Plan duplicado diet.js | Implementar delete antes de recrear | diet.js:427-431 |
| Grams no persisten | Agregar `api.saveDailyPlanEntry()` en change handler | diet.js:629-634 |
| Session equivocada training.js | Usar `session` en vez de `sessions[0]` | training.js:218 |
| Loading flags trabadas | try/finally en init() | training.js, measurements.js |
| Promises colgadas profile.js | Agregar `.catch()` | profile.js:106-107 |
| `confirm()` mensaje equivocado | Usar key correcta de locale | measurements.js:220 |
| Rate de pérdida incorrecto | Usar ventana de 14 días | adaptive.js:137 |
| BMR duplicado | Usar IPC call o shared util | adaptive.js:73-77 |
| Charts sin destroy analytics.js | destroy() previo en cada render | analytics.js:241-691 |
| `||` vs `??` en TDEE | Reemplazar `||` con `??` | adaptive.js:81 |

## Risks / Trade-offs

- [Riesgo] Cambiar ~112 IPC calls puede introducir bugs si el `safeCall` wrapper no se prueba bien. → Test de humo para cada vista.
- [Riesgo] Eliminar fallbacks `|| 'string'` puede exponer keys faltantes. → Auditoría completa de locale keys antes de eliminar.
- [Riesgo] El sleep card depende de datos importados; usuarios nuevos verán "--". → Empty state explícito con diseño neutral.
- [Trade-off] Vitest + jsdom agrega ~5MB a node_modules pero es la herramienta más compatible con el stack existente.
- [Trade-off] No refactorizar views significa que el código sigue siendo complejo (diet.js 849 líneas) pero el cambio se mantiene entregable.
