## Why

El archivo `ipc-handlers.js` creció a 1372 líneas con 40+ handlers mezclados sin agrupación por dominio. Cada nueva feature fuerza a editar un monolito. El cliente no tiene cache entre vistas (refetch en cada navegación), el cache de actividad no incluye métricas de HealthSync siendo que los datos de Apple Watch son la base de la app, y `main.css` con 2000+ líneas empieza a dificultar la navegación. Es momento de organizar la deuda técnica antes de que limite la velocidad de desarrollo.

## What Changes

- **Split de `ipc-handlers.js` por dominio**: Crear `src/main/handlers/` con un archivo por dominio (`profile-handlers.js`, `activity-handlers.js`, `diet-handlers.js`, `training-handlers.js`, `measurements-handlers.js`, `energy-handlers.js`, `health-handlers.js`, `settings-handlers.js`, `dashboard-handlers.js`). Cada módulo exporta `register(ipcMain, getDb)`.
- **HealthSync en cache de actividad**: Agregar columnas `hrv_avg`, `resting_hr_avg`, `exercise_minutes`, `walking_km`, `cycling_km` al `activity_summary_cache`. `populateCache()` consulta HealthSync DB y la app DB en una sola pasada. Dashboard consulta una sola fuente.
- **Cache cliente con stale-while-revalidate**: `Map` simple con TTL de 30 segundos por clave de consulta. EventTarget con tópicos por dominio para invalidación granular (ej. `diet:changed` en vez de `data-changed` genérico). Previene refetch en navegación rápida entre vistas.
- **CSS split por componente**: Extraer de `main.css` a `styles/base.css` (custom properties, reset, tipografía), `styles/cards.css`, `styles/tables.css`, `styles/forms.css`, `styles/sidebar.css`, `styles/utilities.css`. `main.css` pasa a ser un archivo de imports.

## Capabilities

### New Capabilities
- `modular-ipc-handlers`: Handlers IPC organizados por dominio en archivos separados, con `register()` como contrato de módulo.
- `client-state-cache`: Cache en renderer con TTL y event bus por dominio, evitando refetches innecesarios entre navegaciones.
- `css-component-files`: CSS organizado por componente en archivos separados, con `main.css` como punto de entrada de imports.

### Modified Capabilities
- `performance-caching`: `activity_summary_cache` ahora incluye métricas de HealthSync (HRV, RHR, ejercicio, distancia). `populateCache` escribe columnas que antes solo se consultaban en vivo desde HealthSync DB.
- `desktop-app`: `registerIpcHandlers` delega a módulos por dominio en vez de contener todos los handlers inline.
- `design-system`: CSS ahora reside en archivos por componente (cards, tables, forms, sidebar) en vez de un solo archivo.

## Impact

- **Main**: `ipc-handlers.js` se reduce a un registry que importa y delega en módulos de dominio. Nuevo directorio `src/main/handlers/` con 9 archivos.
- **DB**: `database.js` — `activity_summary_cache` gana columnas de HealthSync. `populateCache` consulta ambas DBs.
- **Preload**: Sin cambios estructurales, pero el event bus requiere nuevos métodos `onDomainChanged(domain, callback)` expuestos al renderer.
- **Renderer**: Nuevo módulo `utils/cache-store.js` con `Map` + TTL + `EventTarget`. `app.js` usa `onDomainChanged` para invalidación granular en vez de `onDataChanged` genérico.
- **CSS**: 6 archivos nuevos en `styles/`, `main.css` reducido a imports.
- **Build**: `index.html` debe referenciar `main.css` (Vite lo resuelve con @import). Sin cambios en `vite.config.js`.
- **Tests**: Nuevos tests para cache store, verify que handlers funcionan tras split, verify que CSS imports no rompen build.
