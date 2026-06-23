## Why

La aplicación tiene 16 tablas HTML distribuidas en 7 vistas sin identidad visual orgánica, usando 4 patrones de paginación distintos y 3 wrappers de overflow incompatibles. El sidebar es una lista plana de 9 items sin agrupación lógica. Este cambio unifica el componente de tabla más repetido de la app y reorganiza la navegación en secciones colapsables. Se extrae del cambio original `dashboard-tables-sidebar-redesign` para aplicarlo de forma progresiva, aislando las partes mecánicas (tablas + sidebar) de las creativas (dashboard).

## What Changes

- **`.data-table` estandarizado**: Componente de tabla unificado con tipografía orgánica (Fraunces italic en headers, Source Sans 3 en body), zebra striping (smoke/paper), hover (moss-mist), tfoot para totales, wrapper responsive con overflow-x auto, sticky headers, y barra de paginación unificada `.data-table-pagination`.
- **Migración de 16 tablas**: Reemplazo de todas las tablas en diet (3), activity (2), training (5), measurements (3), analytics (1), adaptive (1) por `.data-table`.
- **Limpieza de CSS**: Eliminación de `.table-responsive` y `.ranking-table-wrap` (reemplazados por `.data-table-wrapper`).
- **Sidebar con secciones colapsables**: 3 grupos clickeables — INICIO (Panel, Tendencias), SALUD (Actividad, Sueño, Balance Energético), ENTRENAMIENTO (Plan de Dieta, Mediciones, Entrenamiento). Perfil separado al fondo sin sección. Estado de colapso persistido en localStorage.

## Capabilities

### New Capabilities
- `data-table-component`: Componente de tabla estandarizado con diseño orgánico que reemplaza las 16 tablas dispersas por un patrón único.
- `sidebar-sections`: Sidebar reorganizado en 3 grupos colapsables con headers Fraunces italic y persistencia en localStorage.

### Modified Capabilities
- `design-system`: Nuevo componente `.data-table` con variantes (`.data-table--sticky-col`, `.data-table-pagination`). Section headers colapsables (`.nav-section`). Deprecación de `.table-responsive` y `.ranking-table-wrap`.
- `organic-aesthetic`: Las tablas reciben tratamiento orgánico completo. Sidebar usa Fraunces italic para headers de sección.

## Impact

- **CSS**: `main.css` — nuevo bloque `.data-table` (~80 líneas), `.data-table-pagination`, `.nav-section`
- **HTML**: `index.html` — sidebar reestructurado con secciones y headers colapsables
- **Vistas**: `diet.js` (3 tablas), `activity.js` (2 tablas), `training.js` (5 tablas), `measurements.js` (3 tablas), `analytics.js` (1 tabla), `adaptive.js` (1 tabla)
- **Locales**: `es.js` — `nav.sections.*`, `general.page`, `general.of`, `general.prevPage`, `general.nextPage`
