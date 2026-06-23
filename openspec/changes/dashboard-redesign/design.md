## Context

El dashboard actual mezcla KPIs de salud con tarjetas de deporte en un orden no intuitivo. Los sparklines usan color fijo `var(--moss)` sin indicar dirección de tendencia. No hay card de Peso independiente. Las cards de walking/cycling son redundantes. Falta contexto period-over-period en las tarjetas de deporte.

Este cambio es la segunda mitad del cambio original `dashboard-tables-sidebar-redesign`, aplicable después de `data-table-sidebar`. Se enfoca en la parte creativa/de diseño del dashboard.

## Goals / Non-Goals

**Goals:**
- Reordenar el dashboard: KPIs de salud arriba, gráficos al medio, deportes al fondo
- Agregar card de Peso independiente y card de Distancia fusionada (walking + cycling)
- Hacer dinámicos los sparklines: color según tendencia (moss/ember/lichen)
- Agregar period-over-period en cards de deporte
- Mejorar jerarquía textual en subtitles de cards con `<strong>`

**Non-Goals:**
- Cambiar la funcionalidad de las tablas (ya cubierto en `data-table-sidebar`)
- Modificar la lógica de datos de los handlers IPC
- Reorganizar el sidebar (ya cubierto en `data-table-sidebar`)
- Agregar nuevas vistas

## Decisions

### D1: Sparklines dinámicos por tendencia

**Decisión**: Calcular la pendiente de regresión lineal simple sobre los datos del sparkline. Si pendiente > umbral → moss. Si < -umbral → ember. Si no → lichen. El umbral se calibra por tipo de métrica (horas, ms, bpm, kg, pasos, kcal, km).

Umbrales por métrica:
| Métrica | Unidad | Umbral (por día) |
|---------|--------|-------------------|
| Sueño | horas | 0.02 |
| HRV | ms | 0.1 |
| RHR | bpm | -0.05 (bajar es bueno) |
| Peso | kg | -0.01 (bajar es típicamente la meta) |
| Pasos | steps | 50 |
| Calorías | kcal | 10 |
| Distancia | km | 0.05 |

Cuando la métrica es "inversa" (RHR, Peso: bajar es bueno), la pendiente se invierte para la asignación de color.

**Razón**: El color fijo actual no comunica si la métrica va bien o mal. La pendiente es un indicador simple y computable sin depender del backend.

### D2: Period-over-period en sports

**Decisión**: Comparar el período actual (ej. 15d) contra el período anterior equivalente (los 15d previos). Mostrar delta como "+2 sesiones ▲" o "-3 sesiones ▼" en el subtitle de cada card de deporte.

Se usa el mismo handler `db:getSportSummaryByRange` con dos rangos de fechas consecutivos.

**Razón**: Da contexto temporal que hoy falta. El usuario ve no solo cuántas sesiones, sino si va a más o a menos.

### D3: Card de Distancia unificada

**Decisión**: Fusionar walking distance y cycling distance en una sola card "Distancia". El valor principal es el total combinado. El breakdown muestra "🚶 X.X km/día · 🚴 Y.Y km/día".

**Razón**: Ambas son "distancia recorrida" y walking ya está cubierto por pasos. Unificar evita redundancia y libera un slot en la grilla.

### D4: Jerarquía textual con `<strong>`

**Decisión**: CSS `.dashboard-card .subtitle strong { font-weight: 600; color: var(--moss-ink); }`. Los números clave en subtitles se envuelven en `<strong>` para distinguirlos del texto descriptivo (lichen).

**Razón**: Sin jerarquía, los subtitles son una masa de texto lichen donde el ojo no encuentra rápido los números importantes.

## Risks / Trade-offs

- **[Riesgo] La pendiente de regresión es ruidosa con pocos puntos (<5)** → Mitigación: si hay <5 puntos, usar solo el color lichen (estable) sin intentar determinar tendencia.
- **[Riesgo] El PoP requiere duplicar el rango de fetch** → Mitigación: son queries ligeras (agregaciones sobre sport_activities con índice por fecha). No debería impactar la performance del dashboard.
- **[Trade-off] La card de Distancia fusiona walking + cycling que antes eran independientes** → Aceptable. Ambas son "distancia recorrida" y walking ya está cubierto por pasos.
