## Context

El dashboard (Panel), Patrones, Tendencias y Objetivos han acumulado problemas de UX y bugs tras las iteraciones anteriores (feedback-v5, organic-redesign, panel-ux-ui-kpis-summarized, goals-tracker). Los problemas se agrupan en: (1) datos que no se muestran o son incorrectos, (2) gráficos que no comunican efectivamente, (3) tarjetas que necesitan rediseño layout, y (4) funcionalidades que deben moverse entre vistas.

Estado actual del código:
- **Dashboard**: `src/renderer/views/dashboard.js` (668 líneas) + `panels/strava-panels.js` (726 líneas)
- **Insights**: `src/renderer/views/insights.js` (648 líneas)
- **Analytics**: `src/renderer/views/analytics.js` (878 líneas)
- **Goals**: `src/renderer/views/goals.js` (397 líneas)
- **CSS**: `src/renderer/styles/cards.css` + `main.css`
- **Backend handlers**: `goals-handlers.js`, `strava-panels-handlers.js`, `insights-handlers.js`
- **Utils**: `kpi-derivation.js` (700+ líneas)

## Goals / Non-Goals

**Goals:**
- Corregir bugs de cálculo: goal progress (peso), recovery score (doble-inversión RHR), PRs mezclados por deporte
- Mejorar legibilidad: contraste en relative effort, flechas junto a valores, ejes de gráficos comprensibles
- Rediseñar layouts: KPI cards inline, sport distribution compacta, streak+calendar unificados, goals cards rediseñadas
- Mover auto-insights de Patrones a Panel
- Hacer gráficos de Tendencias reactivos al periodo seleccionado con orden ascendente L→R
- Agregar desglose de calorías por deporte y basales en balance semanal
- Agregar explicación de HRV al dashboard
- Mostrar último peso registrado (manual o auto)

**Non-Goals:**
- No cambiar el schema de la base de datos
- No agregar nuevas dependencias
- No modificar la vista de Actividad, Dieta, Balance Energético, Mediciones, Entrenamiento, o Perfil
- No crear nuevas vistas ni modificar la navegación sidebar
- No modificar la lógica de importación de Apple Health

## Decisions

### D1: Goal progress para peso usa dirección start→target

**Decisión**: Para metas de tipo `weight`, el progreso se calcula como `(startWeight - current) / (startWeight - target)` cuando `current < startWeight` (bajar de peso), o `(current - startWeight) / (target - startWeight)` cuando `current > startWeight` (subir de peso). El `startWeight` se obtiene del primer `weight_entry` en o antes de `startDate`.

**Alternativa considerada**: Guardar `startWeight` en el goal JSON. Descartada porque requiere migración de datos existentes y el primer weight entry es suficiente proxy.

**Rationale**: La fórmula actual `current/target` solo funciona para metas de acumulación (distancia, frecuencia). Para peso, necesita directionality.

### D2: PRs separados por deporte con tabs

**Decisión**: El panel de PRs mostrará tabs (Running / Ciclismo / Fuerza) en la cabecera del panel. Cada tab filtra los récords al deporte seleccionado. Dentro de cada tab, los récords se muestran por distancia estándar (5km, 10km, media maratón, maratón para running; 10km, 50km, 100km para ciclismo) o por volumen (fuerza). El banner principal muestra el PR más reciente del tab activo.

**Alternativa considerada**: Mostrar PRs solo del deporte más reciente. Descartada porque el usuario quiere ver récords de todos sus deportes.

### D3: KPI cards con sparkline inline + comparaciones debajo

**Decisión**: Cada KPI card del dashboard reorganiza su layout a: (1) fila superior con label + sparkline pequeña (60×20px) a la derecha, (2) valor principal grande, (3) bloque de texto debajo con flechas de comparación y períodos anteriores. Se eliminan los gráficos Chart.js de tendencia del row `#row-trend`.

**Rationale**: Los gráficos Chart.js ocupan demasiado espacio y sus ejes no son legibles en el contexto compacto de una card. El sparkline inline da contexto de tendencia sin ocupar espacio. Las comparaciones textuales debajo dan contexto numérico preciso.

### D4: Recovery score fix — eliminar doble-inversión RHR

**Decisión**: Cambiar la fórmula de `0.4 × hrvSub + 0.3 × (100 - rhrSub) + 0.3 × sleepSub` a `0.4 × hrvSub + 0.3 × rhrSub + 0.3 × sleepSub`. El `rhrSub` ya está invertido internamente (`50 - 15*z`), por lo que aplicar `100 -` otra vez lo doubly-invierte.

**Rationale**: Bug matemático confirmado. Cuando RHR es alto (mala recuperación, z>0), rhrSub es bajo (correcto), pero `100 - rhrSub` lo convierte en alto (incorrecto).

### D5: Relative effort delta — forzar color blanco

**Decisión**: Agregar regla CSS `.strava-relative-effort .strava-relative-effort-delta { color: #fff !important; }` para garantizar que el delta sea blanco sobre el gradiente del card. Alternativamente, aumentar la especificidad sin `!important` usando `.strava-relative-effort .trend-up, .strava-relative-effort .trend-down`.

**Rationale**: El problema es un conflicto de especificidad CSS donde `.trend-up`/`.trend-down` de `utilities.css` sobreescriben el color blanco intencional de `cards.css`.

### D6: Streak + Calendar combinados en una sola card

**Decisión**: Fusionar `mountStreak` y `mountMonthlyCalendar` en una sola función `mountStreakCalendar` que renderice un layout de 2 columnas: izquierda con datos de racha (semanas, actividades, estado), derecha con el calendario mensual. Se elimina el botón "Compartir racha".

### D7: Auto-insights movidos al Panel

**Decisión**: Los auto-insights se renderizarán en el Panel como una sección de 3-4 cards compactas en formato lista multi-columna (grid 2×2 o similar). Se eliminan de la vista Patrones.

### D8: Analytics charts reactivos al periodo

**Decisión**: Todos los gráficos de Tendencias (main + secondary) usarán el periodo seleccionado (7d/1m/3m) para generar labels ascendentes L→R: 7 días individuales, 4 semanas ISO, o 3 meses. Los ejes X mostrarán labels legibles. Las flechas de tendencia se moverán junto al valor numérico en las KPI cards.

### D9: Energy breakdown en balance semanal

**Decisión**: La card hero del balance semanal agregará una sección de desglose con: kcal activas por deporte (barra horizontal con iconos por deporte), kcal basales promedio, y un mini indicador de ratio deporte/basal. Todo dentro de la misma card hero.

### D10: Último peso como sub-elemento del balance semanal

**Decisión**: El último peso registrado (de `weight_entries`) se mostrará como un badge o sub-card dentro de la card hero del balance semanal, en lugar de una card independiente. Si no hay datos, se muestra "Sin registros".

## Risks / Trade-offs

- **[Risk] Goal startWeight proxy impreciso] → Mitigation: Si no hay weight_entry cerca de startDate, mostrar "Progreso no disponible" en lugar de calcular con datos incorrectos.
- **[Risk] PR tabs agregan complejidad al panel] → Mitigation: Tabs simples (botones pill), sin animaciones. Default al deporte con PR más reciente.
- **[Risk] Combinar streak+calendar puede saturar la card] → Mitigation: Layout compacto: streak solo muestra 2 números (semanas + actividades) y el calendario usa celdas pequeñas (24×24px).
- **[Risk] Mover auto-insights al Panel sobrecarga el dashboard] → Mitigation: Limitar a 3-4 insights en formato compacto multi-columna, no cards completas.
- **[Trade-off] Eliminar gráficos Chart.js del dashboard reduce información visual] → Aceptado: el sparkline inline + comparaciones textuales comunican la misma información de forma más compacta y legible.
- **[Trade-off] Eliminar weight velocity y WHR de Patrones reduce métricas disponibles] → Aceptado: el usuario no las encuentra útiles. Los datos siguen disponibles en Mediciones.
