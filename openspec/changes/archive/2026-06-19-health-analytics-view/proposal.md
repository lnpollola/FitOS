## Why

La app recolecta datos del Apple Watch vía HealthSync (41 tablas, ~1GB), pero actualmente solo 7 tablas se exponen via IPC y solo 1 gráfico (deporte semanal) visualiza datos de salud. Hay datos de pasos, FC, HRV, sueño, energía, VO2 max, RHR, distancia, etc. que se recolectan pero no se visualizan. Se necesita una vista dedicada que muestre tendencias, KPIs y rankings con filtros temporales, tomando como referencia el proyecto apple-health-grafana.

## What Changes

- Nueva vista "Tendencias de Salud" con acceso desde el sidebar
- Filtro de período: últimos 7 días / 1 mes / 3 meses / año actual + selector de rango custom
- 6 charts en grid 2x3: pasos, FC (min/avg/max), energía (stacked), HRV, sueño, actividades (ranking)
- KPIs del período: pasos promedio, energía total, FC media, sueño promedio, HRV promedio
- Tabla de ranking de actividades por tipo (count, horas, kcal)
- Sección colapsable de métricas secundarias: RHR, VO2 max, walking speed, distancia, etc.
- Nuevos IPC handlers en main/ipc-handlers.js para exponer más tablas de HealthSync con soporte de rango de fechas
- Nuevos métodos en preload/preload.js para el bridge
- Strings en español en locales/es.js

## Capabilities

### New Capabilities
- `health-analytics`: Visualización de tendencias y análisis de datos de salud con filtros temporales, gráficos 2x3, KPIs, rankings y métricas secundarias desde HealthSync

### Modified Capabilities
- `apple-health-import`: NO se modifican requirements existentes. Se agregan nuevos IPC handlers read-only que no afectan el flujo de importación existente

## Impact

- `src/renderer/views/analytics.js` — Nueva vista (componente principal)
- `src/renderer/app.js` — Registrar vista + sidebar item
- `src/renderer/locales/es.js` — Strings de la nueva vista
- `src/renderer/styles/main.css` — Estilos para charts grid, KPIs, ranking table
- `src/main/ipc-handlers.js` — ~8-10 nuevos handlers con soporte de rango de fechas
- `src/preload/preload.js` — Exponer nuevos métodos IPC
- `src/renderer/index.html` — Agregar div `#view-analytics`
- Dependencias: Chart.js ya incluido (no requiere nuevas librerías)
