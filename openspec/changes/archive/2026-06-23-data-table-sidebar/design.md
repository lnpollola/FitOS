## Context

La aplicación tiene 16 tablas HTML distribuidas en 7 vistas. Solo 4 tienen manejo de overflow responsive, y usan 3 patrones distintos (`.table-responsive`, `.ranking-table-wrap`, inline `overflow-x:auto`). Ninguna tabla tiene estilado orgánico (Fraunces/Source Sans 3), heredando el estilo global pre-orgánico con Inter, headers en mayúsculas, y sin zebra striping. Hay 4 estilos de paginación distintos.

El sidebar es una lista plana de 9 items sin agrupación. Los usuarios deben escanear visualmente toda la lista para encontrar la vista deseada.

Este cambio es la primera mitad del cambio original `dashboard-tables-sidebar-redesign`, aislando las partes mecánicas (tablas + sidebar) de las creativas (dashboard).

## Goals / Non-Goals

**Goals:**
- Crear `.data-table` como componente único para las 16 tablas de la app, con estilado orgánico completo
- Estandarizar la paginación en todas las tablas con `.data-table-pagination`
- Reorganizar sidebar en 3 secciones colapsables + Perfil al fondo
- Eliminar wrappers obsoletos (`.table-responsive`, `.ranking-table-wrap`)

**Non-Goals:**
- Cambiar la funcionalidad de las tablas (solo el markup y CSS)
- Modificar la lógica de datos de los handlers IPC
- Tocar el dashboard (eso está en el cambio `dashboard-redesign`)
- Agregar nuevas vistas
- Cambiar el sistema de diseño orgánico base

## Decisions

### D1: `.data-table` como reemplazo directo

**Decisión**: Crear una clase CSS `.data-table` que envuelva el `<table>` y un wrapper `.data-table-wrapper` para overflow. Reemplazar todas las instancias de `<table>` pelado, `.table-responsive`, `.ranking-table-wrap`, y wrappers inline.

**Alternativas consideradas**:
- Usar un Web Component → descartado, el stack es vanilla JS sin shadow DOM
- Crear una función JS `renderDataTable(data, columns)` → útil como helper, pero la clase CSS es el contrato visual; la función puede ser un helper opcional

**Razón**: CSS puro mantiene consistencia con el resto del design system. Las tablas se generan dinámicamente en JS, así que el cambio es solo de markup.

### D2: Zebra striping con smoke/paper

**Decisión**: Filas pares con `background: var(--smoke)`, impares con `background: var(--paper)`. Hover con `background: var(--moss-mist)` y `transition: background 0.15s`.

**Razón**: El contraste smoke/paper es sutil pero suficiente para guiar la lectura horizontal. El hover en moss-mist conecta visualmente con el resto de la UI orgánica.

### D3: Headers de tabla en Fraunces italic

**Decisión**: `thead th` usa `font-family: var(--font-display)`, `font-style: italic`, `font-weight: 500`, `font-size: 12px`, `color: var(--moss-ink)`, `background: var(--moss-mist)`. Sin uppercase ni letter-spacing.

**Razón**: Consistente con los headers de card (`h3` en `.dashboard-card` y `.card`). La italic de Fraunces es la firma tipográfica del diseño orgánico.

### D4: Paginación unificada

**Decisión**: `.data-table-pagination` con botones "Anterior"/"Siguiente" en estilo moss outline, contador "Página X de Y" en lichen, botones disabled con `opacity: 0.35`. Hidden cuando `totalPages <= 1`.

**Alternativas consideradas**:
- Paginación numérica (1 2 3 ... 10) → descartado, demasiado complejo para datasets de <200 filas
- Infinite scroll → descartado, no apropiado para tablas

**Razón**: Simple, predecible, accesible. El patrón más común en apps desktop.

### D5: Sidebar con secciones colapsables

**Decisión**: Tres `<li class="nav-section">` con `cursor: pointer` que togglean `display: none/block` en los `<li>` hijos del grupo. El estado de colapso se persiste en `localStorage`. Perfil queda suelto al fondo (fuera de secciones).

Estructura del DOM:
```html
<li class="nav-section" data-section="inicio">
  <span class="nav-section-label">INICIO</span>
  <span class="nav-section-chevron">▾</span>
</li>
<li data-section="inicio"><button class="nav-item" data-view="dashboard">...</button></li>
<li data-section="inicio"><button class="nav-item" data-view="analytics">...</button></li>
```

**Razón**: Colapsable da control al usuario. localStorage persiste la preferencia entre sesiones.

### D6: Activity timeline — tabla o cards

**Decisión**: Mantener la tabla de timeline de actividad como `.data-table` (no convertir a cards). Las celdas con sparklines embebidos (canvas 60×18px) funcionan bien en tabla. Agregar `.data-table-wrapper` para overflow horizontal.

**Razón**: La tabla permite escanear fechas secuencialmente. Convertir a cards perdería la densidad de información.

## Risks / Trade-offs

- **[Riesgo] Reemplazar 16 tablas puede introducir regresiones visuales** → Mitigación: cambio solo de clases CSS y wrappers, sin tocar lógica de renderizado. Test visual por vista.
- **[Riesgo] La paginación unificada rompe las personalizadas existentes** → Mitigación: la paginación de timeline por mes es conceptualmente distinta (navegación temporal, no por página). Se mantiene como caso especial documentado.
- **[Riesgo] El sidebar colapsable puede confundir si un grupo está colapsado y el usuario no encuentra la vista** → Mitigación: el grupo activo (donde está la vista current) nunca se colapsa automáticamente. El estado inicial es todos expandidos.
