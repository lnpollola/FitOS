## Why

El dashboard mezcla KPIs de salud con tarjetas de deporte en un orden no intuitivo, los sparklines no comunican tendencia (color fijo moss sin importar dirección), no hay card de Peso independiente, las cards de walking/cycling son redundantes, y falta contexto period-over-period en las tarjetas de deporte. Este cambio reordena el dashboard con una jerarquía clara (salud arriba, deportes al fondo) y agrega inteligencia visual a los indicadores. Se extrae del cambio original `dashboard-tables-sidebar-redesign` como la parte creativa/de diseño, aplicable después de tener las tablas y sidebar unificados.

## What Changes

- **Dashboard reordenado**: Hero card arriba, KPIs de salud en 2 filas simétricas (5 + 4 cards), gráficos de tendencia al medio, sección de deportes al fondo con separador visual.
- **Nueva card de Peso**: KPI independiente con sparkline de tendencia usando `weightStats` ya fetcheado.
- **Card de Distancia unificada**: Walking + ciclismo fusionados en una sola card (son redundantes con pasos).
- **Sparklines dinámicos**: Color del trazo según tendencia — moss para mejora, ember para deterioro, lichen para estable. Línea de referencia punteada de la media. Punto final destacado.
- **Period-over-period en cards de deporte**: Comparación contra el período anterior equivalente (ej. "8 sesiones ▲ +2 vs anterior").
- **Jerarquía textual**: Números clave en subtitles con `<strong>` (moss-ink, font-weight 600) distinguibles del texto descriptivo (lichen).

## Capabilities

### New Capabilities
<!-- Ninguna — todas son modificaciones de specs existentes -->

### Modified Capabilities
- `dashboard-health-metrics`: Reordenamiento de layout (sports al fondo, KPIs arriba). Nueva card de Peso con sparkline. Card de Distancia unificada. Sparklines con color dinámico por tendencia. Period-over-period en cards de deporte. Jerarquía textual con bold en números de subtitles.
- `design-system`: Texto fuerte en subtitles (`.subtitle strong`).
- `organic-aesthetic`: Sparklines dinámicos según tendencia (moss/ember/lichen).

## Impact

- **Vista**: `dashboard.js` — reordenamiento mayor, nuevas cards, sparklines dinámicos, PoP
- **Utils**: `sparkline.js` — nuevo parámetro `stroke` + línea de referencia + dot final
- **CSS**: `main.css` — overrides de sparklines dinámicos, `.subtitle strong`, separator para sports section
- **Locales**: `es.js` — `dashboard.weight*`, `dashboard.distance*`, `dashboard.sportsSection`, `dashboard.vsPrevious`
- **IPC**: Nuevo fetch para período anterior en sport summary
