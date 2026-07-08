## Context

El codebase tiene acumulación de código muerto tras múltiples iteraciones: funciones montadas pero nunca llamadas, preload APIs que ningún frontend consume, CSS duplicado entre archivos, y un módulo de utilidades (`strength-derivation.js`) que solo su test importa. Adicionalmente, hay bugs menores de consistencia (error handling) y oportunidades de micro-mejoras de UX que no justifican un change propio pero mejoran la experiencia.

Este change se ejecuta en paralelo o justo después de `multi-view-ux-polish-v2`, compartiendo algunos archivos objetivo.

## Goals / Non-Goals

**Goals:**
- Eliminar todo código muerto identificable (funciones, APIs, CSS, módulos)
- Corregir bugs menores de consistencia en error handling
- Agregar micro-mejoras de UX de bajo esfuerzo (< 15 min cada una)
- Reducir la superficie de mantenimiento del codebase

**Non-Goals:**
- No refactorizar arquitectura (mover lógica backend→frontend o viceversa)
- No eliminar preload APIs que puedan usarse en el futuro (solo las confirmadas como sin uso)
- No reescribir tests existentes (solo eliminar los que correspondan a código eliminado)
- No agregar nuevas features de peso

## Decisions

### D1: Eliminación de `mountWeeklyGoal` y cadena completa

**Decisión**: Eliminar los 3 eslabones: `mountWeeklyGoal()` en `strava-panels.js`, `getWeeklyGoal` en `preload.js`, y handler `db:getWeeklyGoal` en `strava-panels-handlers.js`. También eliminar CSS asociado (`.strava-weekly-goal`, `.strava-ring-wrap`, etc.).

**Rationale**: Nunca importado por `dashboard.js`. Si en el futuro se necesita, se puede reimplementar desde cero con mejor diseño.

### D2: Eliminación de 25 preload APIs sin usar

**Decisión**: Eliminar de `preload.js` las 25 APIs confirmadas como sin uso desde el renderer. Los handlers backend correspondientes se mantienen (no se elimina backend, solo el bridge).

**Alternativa considerada**: Eliminar también los handlers backend. Descartada porque algunos podrían usarse internamente o ser útiles para futuras features. El bridge es la capa innecesaria.

### D3: CSS duplicado — mantener `cards.css`, eliminar de `utilities.css`

**Decisión**: Las versiones en `utilities.css` son las más antiguas. Las de `cards.css` son las actuales. Eliminar los bloques duplicados de `utilities.css`.

**Rationale**: `cards.css` fue creado como parte del rediseño orgánico y contiene las versiones actualizadas con tokens del design system.

### D4: `strength-derivation.js` — eliminar archivo y test

**Decisión**: Eliminar `src/renderer/utils/strength-derivation.js` (263 líneas) y `tests/unit/strength-derivation.test.js`. El backend tiene implementaciones canónicas en `strength-training-handlers.js`.

**Alternativa considerada**: Migrar `strength-insights-panels.js` para usar las funciones client-side. Descartada porque los handlers backend ya hacen las queries a DB, y mover la lógica al frontend requeriría traer datos crudos que hoy se agregan en el backend.

### D5: Error handling — `safeCall()` como estándar

**Decisión**: Todos los IPC calls en el renderer deben usar `safeCall()`. Los casos restantes que usan try/catch o ningún manejo se corrigen.

### D6: Chart memory leak — unificar en `window.*Chart`

**Decisión**: Mover `_tonnageChart` de module scope a `window._tonnageChart` para que el cleanup global de `app.js:destroyAllCharts()` lo destruya.

### D7: Sparkline tooltips — `title` attribute

**Decisión**: Agregar `title="Min: X | Max: Y"` como atributo HTML en el SVG del sparkline. Sin nueva lógica de tooltip, solo el atributo nativo del browser.

### D8: Keyboard nav en tabs — patrón ARIA tablist

**Decisión**: Implementar navegación con arrow keys usando `role="tablist"`, `role="tab"`, `aria-selected`, y event listener para KeyDown (ArrowLeft/ArrowRight).

### D9: Recovery progress bar — div con width percentage

**Decisión**: Cuando `baselineComplete = false`, mostrar una barra de progreso simple: `<div>` con `width: (daysAvailable / 30 * 100)%` y texto "X de 30 días".

### D10: Analytics period transition — CSS opacity transition

**Decisión**: Agregar `transition: opacity 200ms ease` a `.chart-container`. Al cambiar periodo, agregar clase `.chart-transitioning` con `opacity: 0`, esperar 200ms, recrear chart, quitar clase.

## Risks / Trade-offs

- **[Risk] Eliminar preload APIs que alguien quiera usar en el futuro] → Mitigation: Los handlers backend se mantienen. Re-agregar la línea de preload es trivial.
- **[Risk] Eliminar `strength-derivation.js` pierde la versión client-side] → Aceptado: la versión backend es la canónica y funciona. Si se necesita client-side en el futuro, se puede reimplementar.
- **[Risk] CSS transition en analytics puede sentirse lento] → Mitigation: 200ms es suficientemente rápido para no bloquear la interacción. Si el usuario lo reporta, se puede reducir a 100ms o eliminar.
- **[Trade-off] Eliminar código muerto reduce la "historia" del codebase] → Aceptado: git history preserva el contexto. El codebase activo debe ser limpio.
