## Why

El dashboard, patrones, tendencias y objetivos tienen problemas de UX que limitan su utilidad: tarjetas que no muestran datos (goals, último peso), cálculos incorrectos (progreso de peso, recovery score), gráficos con ejes que no se entienden, métricas sin contexto (HRB/HRV sin explicación), y elementos con pobre contraste (delta verde sobre verde). Este cambio unifica la mejora visual y corrige bugs en las 4 vistas principales.

## What Changes

### Panel (Dashboard)
- **Fix goals card**: no se actualiza porque `onDataChanged` solo re-monta paneles Strava, no el dashboard completo
- **Rediseño KPI cards**: sparkline pequeña al lado del valor KPI, textos debajo con flechas y comparaciones entre periodos (reemplaza los gráficos de tendencia grandes)
- **Balance semanal mejorado**: agregar calorías quemadas por deporte y calorías basales con representación visual
- **Último peso**: mostrar el último registro de peso (manual o auto) como mini-card dentro del balance semanal
- **Eliminar "Calorías Hoy"**: no aporta información útil
- **Récords personales**: separar por deporte (running → 5km/10km/mejor recorrido; cycling → similar); no mezclar bici con media maratón
- **Esfuerzo relativo**: corregir contraste del delta (números blancos sobre gradiente)
- **Explicación HRV**: agregar tooltip/descripción de qué es y para qué sirve
- **Combinar streak + calendario**: una sola tarjeta con datos de racha a la izquierda y calendario embebido a la derecha, sin botón de compartir
- **Mover auto-insights** desde Patrones al Panel, mostrar 3-4 en lista multi-columna

### Patrones (Insights)
- **Rediseño visual**: mejores colores, alineación con el design system orgánico
- **Título dinámico**: el heatmap ya no se llama "Año en movimiento" sino que refleja el periodo seleccionado (3m/6m/1y)
- **Semana típica**: agregar KPIs más representativos con mejor soporte visual
- **Distribución deportes**: donut más pequeño a la izquierda, métricas (sesiones, minutos, share) a la derecha
- **Recuperación**: corregir bug de doble-inversión en RHR, explicar qué representa cada señal, arreglar gráfico de tendencia cortado
- **Eliminar**: velocidad de peso y ratio cintura-cadera

### Tendencias (Analytics)
- **Flechas junto al número**: las flechitas de tendencia deben estar al lado del valor, no debajo
- **Gráficos reactivos al periodo**: 7d → 7 días, 1m → 4 semanas, 3m → meses; todos ascendentes de izquierda a derecha
- **Energía activa/basal**: agregar KPI intermedio que dé contexto (ratio, promedio, meta)
- **Otras métricas**: mismo tratamiento de periodos ascendentes

### Objetivos (Goals)
- **Fix cálculo de progreso peso**: la fórmula `current/target` asume acumulación; para pérdida de peso debe ser `(start - current) / (start - target)`
- **Rediseño cards**: layout que permita ver múltiples objetivos de forma clara, no apilados sin estructura

## Capabilities

### New Capabilities
- `dashboard-kpi-redesign`: Rediseño de KPI cards del dashboard con sparkline inline + comparaciones de periodo debajo, eliminación de "Calorías Hoy", último peso en balance semanal
- `dashboard-energy-breakdown`: Desglose de calorías quemadas por deporte y basales dentro del balance semanal con representación visual
- `dashboard-combined-streak-calendar`: Combinación de streak tracker y calendario mensual en una sola tarjeta unificada
- `insights-visual-redesign`: Rediseño visual de Patrones: título dinámico, layout sport distribution, mejora semana típica, eliminación de velocity/WHR
- `analytics-period-charts`: Gráficos reactivos al periodo seleccionado con ejes ascendentes L→R y flechas junto a valores
- `auto-insights-dashboard`: Traslado de auto-insights desde Patrones al Panel en formato lista multi-columna

### Modified Capabilities
- `dashboard-health-metrics`: Fix goals card refresh, explicación HRV, eliminación calorías hoy
- `personal-records`: Separación de récords por deporte, sin mezclar running/cycling
- `relative-effort-card`: Fix contraste delta (números blancos sobre gradiente)
- `recovery-score-composite`: Fix bug doble-inversión RHR, explicación de señales, arreglo gráfico tendencia
- `goals-view`: Rediseño de cards de objetivos
- `goal-crud`: Fix cálculo de progreso para metas de peso (direccionalidad start→target)
- `insights-view`: Eliminación de weight velocity y waist-hip ratio, título dinámico del heatmap
- `health-analytics`: Flechas junto a valores, gráficos reactivos al periodo

## Impact

- **Frontend**: `src/renderer/views/dashboard.js`, `panels/strava-panels.js`, `insights.js`, `analytics.js`, `goals.js`
- **Backend**: `src/main/handlers/goals-handlers.js` (fix progress), `strava-panels-handlers.js` (fix PRs por deporte)
- **Utils**: `src/renderer/utils/kpi-derivation.js` (fix recovery score double-inversion)
- **CSS**: `src/renderer/styles/cards.css`, `main.css` (contraste effort, layout redesigns)
- **Locales**: `src/renderer/locales/es.js` (nuevos strings para HRV tooltip, títulos dinámicos, energy breakdown)
- **Tests**: Nuevos tests para goal progress directional, recovery score fix, PR sport separation
- **0 schema changes, 0 new dependencies**
