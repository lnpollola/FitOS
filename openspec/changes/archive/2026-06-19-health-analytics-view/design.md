## Context

La app FitOS usa HealthSync CLI para parsear el XML de Apple Health en una DB SQLite (`~/.healthsync/healthsync.db`, ~1GB, 41 tablas, WAL mode). Actualmente el bridge expone solo 8 handlers IPC read-only, de los cuales solo 2 se usan en UI (dashboard steps y resting HR). Los handlers existentes toman `limit` en vez de rangos de fecha.

La vista Activity tiene formularios de importación, entrada manual, timeline y un chart de deportes semanal (bar, hardcoded a 7 días). No hay filters de período, no hay charts de pasos/FC/HRV/sueño, no hay rankings.

## Goals / Non-Goals

**Goals:**
- Nueva vista "Tendencias" con filtros 7d/1m/3m/año
- KPIs del período (5 cards: pasos, energía, FC, sueño, HRV)
- Grid 2x3 de charts: pasos (line+MA7), FC banda min/avg/max, energía stacked, HRV line, sueño mixed, actividades ranking horizontal
- Tabla ranking de actividades por tipo (count, horas, kcal)
- Sección de métricas secundarias colapsable (RHR, VO2 max, walking speed, distancia, etc.)
- Todos los charts usan HealthSync DB directo como data source
- Nuevos IPC handlers con soporte `from`/`to` en vez de `limit`

**Non-Goals:**
- No modificar la vista Activity existente ni sus formularios
- No migrar datos de HealthSync al app DB para estos charts
- No incluir datos de entrada manual (CSV, forms) en los charts
- No agregar nuevas dependencias (Chart.js ya está)
- No charts en tiempo real ni auto-refresh

## Decisions

### 1. Data Source: HealthSync DB directo (read-only)
**Decisión:** Todos los queries van directo al healthsync.db via IPC handlers nuevos o modificados.
**Rationale:** Los datos ya están ahí, los IPC existen parcialmente, y el usuario confirmó que prioriza HealthSync sobre datos manuales.
**Alternativa:** Migrar al app DB — requeriría cambiar schema de activity_days (agregar HRV, min/max FC, etc.) y duplicar datos.

### 2. IPC Handlers: Nuevos *Range vs modificar existentes
**Decisión:** Crear handlers nuevos con sufijo `Range` que tomen `from, to` en vez de modificar los existentes (backward compatibility).
**Rationale:** Los handlers existentes se usan en dashboard y activity. Cambiarlos requeriría actualizar todos los callers. Los nuevos `*Range` coexisten sin riesgo.
**Handlers nuevos:**
- `health:getHeartRateRange(from, to)` → min/avg/max por día
- `health:getHRVRange(from, to)` → HRV diario
- `health:getSleepRange(from, to)` → horas de sueño por noche
- `health:getWorkoutRange(from, to)` → workouts en el rango
- `health:getWorkoutRanking(from, to)` → agregado por tipo (count, horas, kcal)
- `health:getRestingHeartRateRange(from, to)` → RHR diario
- `health:getVO2MaxRange(from, to)` → VO2 max diario
- `health:getDistanceSummary(from, to)` → distancia caminar/correr/bici por día
- `health:getExerciseTimeRange(from, to)` → minutos de ejercicio por día
- `health:getWalkingSpeedRange(from, to)` → walking speed diario

### 3. Date Range Filter
**Decisión:** Botones de acceso rápido (7d, 1m, 3m, año) + date input from/to custom. Estado en variable local, no en URL ni localStorage.
**Cálculo de rangos:**
```
7d   = hoy - 7 → hoy
1m   = hoy - 30 → hoy
3m   = hoy - 90 → hoy
año  = 1/enero → hoy
custom = from input → to input
```

### 4. Chart Layout
**Decisión:** Grid CSS 2 columnas para charts, 5 cards de KPIs en fila arriba, tabla ranking debajo. Sección secundaria colapsable con acordeón.
**Rationale:** 2 columnas da charts legibles sin scroll horizontal. KPIs en fila dan resumen rápido.

### 5. Chart Types por Métrica
| Métrica | Tipo Chart | Detalle Técnico |
|---------|-----------|-----------------|
| Pasos | Line + MA7 | Dataset 1: line diario. Dataset 2: line MA7 con `borderDash`. `tension: 0.3` |
| FC min/avg/max | Band fill | Dataset avg line + fill entre min y max con `fill: '+1'` en dataset oculto base |
| Energía activa+basal | Stacked bar | Dos datasets con `backgroundColor` distinto, `stacked: true` |
| HRV | Line | Single line, puntos individuales si hay pocos datos |
| Sueño | Mixed bar+line | Dataset 1: bar horas. Dataset 2: line MA7. `type: 'bar'` en dataset específico |
| Actividades | Horizontal bar | Labels = tipo deporte, data = kcal total. `indexAxis: 'y'` |

### 6. Manejo de Estado de Charts
**Decisión:** Cada chart se guarda en `window._tendencias_*` para destroy en re-render. Al cambiar filtro, se destruyen todos y se recrean.
**Rationale:** Mismo patrón que views existentes (activity, measurements).

### 7. Chart Colors
**Decisión:** Usar los mismos tokens que el resto de la app (teal `#0D9488`, slate `#64748B`, etc.) más una paleta para actividades:
- Actividades: 10 colores distintos para cada tipo de deporte
- stacked energy: active=teal, basal=slate-light
- FC band: avg=teal, min/max fill=slate con opacidad

## Risks / Trade-offs

- **[Rendimiento]** queries a healthsync.db de ~1GB con BETWEEN sobre fechas indexadas deberían ser rápidos, pero JOINs entre tablas grandes (heart_rate con millones de filas) podrían ser lentos en rangos grandes (año)
  → Mitigación: índices en `start_date` ya existen. Si es lento, agregar índices compuestos o limitar a 500 días máx.

- **[Datos faltantes]** No todos los usuarios tienen todos los tipos de datos (VO2 max requiere Apple Watch Series 3+, RHR requiere sueño registrado, etc.)
  → Mitigación: cada chart detecta data vacía y muestra empty state en lugar de romperse

- **[Backward compatibility]** Los handlers IPC existentes no se modifican, los nuevos se agregan. Pero algunos tienen nombres similares (`getHeartRateDaily` vs `getHeartRateRange`).
  → Mitigación: naming consistente, documentar en código la diferencia

- **[Granularidad]** `healthsync.db` almacena datos en UTC sin timezone. Las queries existentes usan `date(start_date)` que trunca a fecha local de la app (que corre en la máquina del usuario).
  → Mitigación: mismo approach que el código existente (consistente, no necesariamente correcto pero sí consistente)

## Open Questions

- ¿Incluir walking_heart_rate como línea adicional en el chart de FC? (disponible en tabla separada)
- ¿Los KPIs deben ser promedios del período o totales? (ej: pasos = promedio diario o suma total)
- ¿Agregar同比 (comparativa vs período anterior) en los KPIs? (ej: pasos +12% vs semana pasada)
