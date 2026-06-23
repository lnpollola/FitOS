## 1. Dashboard — Reordenamiento de layout

- [x] 1.1 Reorganizar `dashboard.js`: sports section (accent card + per-sport cards) al fondo, después de charts
- [x] 1.2 Mover `#row-activity` (sports cards) debajo de `#row-trend` (charts)
- [x] 1.3 Agregar separador visual o section label "DEPORTES" antes de la sección de deportes
- [x] 1.4 Eliminar sports-related items de `coreCards` (sessionCount ya no va entre health KPIs)
- [x] 1.5 Distribuir health KPIs en 2 filas simétricas: fila 1 (5 cards: sueño, HRV, RHR, peso, pasos), fila 2 (4 cards: ejercicio, distancia, calorías hoy, próx. entrenamiento)

## 2. Dashboard — Nueva card de Peso

- [x] 2.1 Agregar card de Peso en fila 1 de health KPIs usando `weightStats` ya fetcheado
- [x] 2.2 Mostrar `weightStats.last` como valor principal con unidad kg
- [x] 2.3 Mostrar delta vs primer valor del período como "Δ: -X.X kg" o "Δ: +X.X kg"
- [x] 2.4 Renderizar sparkline con la serie de pesos si hay ≥2 puntos
- [x] 2.5 Agregar `strings.dashboard.weight`, `strings.dashboard.weightNoData`, `strings.dashboard.weightDelta` en `locales/es.js`

## 3. Dashboard — Card de Distancia unificada

- [x] 3.1 Fusionar walking distance y cycling distance en una sola card "Distancia"
- [x] 3.2 Mostrar total combinado como valor principal (walking + cycling total)
- [x] 3.3 Mostrar breakdown en subtitle con walking y cycling
- [x] 3.4 Agregar `strings.dashboard.distance`, `strings.dashboard.distanceWalking`, `strings.dashboard.distanceCycling` en `locales/es.js`
- [x] 3.5 Eliminar cards individuales de walking distance y cycling distance

## 4. Dashboard — Sparklines dinámicos

- [x] 4.1 Implementar función `computeTrendDirection(series, metricType)` que calcula pendiente de regresión lineal simple
- [x] 4.2 Definir umbrales por tipo de métrica (horas, ms, bpm, kg, pasos, kcal, km)
- [x] 4.3 Invertir pendiente para métricas inversas (RHR, peso: bajar es bueno)
- [x] 4.4 Default a lichen cuando hay <5 puntos
- [x] 4.5 Modificar `sparkline()` en `utils/sparkline.js` para aceptar `stroke` dinámico basado en tendencia
- [x] 4.6 Pasar color dinámico (moss/ember/lichen) a cada sparkline según su tendencia
- [x] 4.7 Agregar línea de referencia punteada en la media de la serie
- [x] 4.8 Agregar dot destacado en el último punto

## 5. Dashboard — Period-over-period en sports

- [x] 5.1 Fetch datos del período anterior equivalente (misma duración, offset hacia atrás) en `render()`
- [x] 5.2 Calcular delta de sesiones por tipo de deporte: actual vs anterior
- [x] 5.3 Mostrar en subtitle de cada sport card: "X ses. ▲/▼/― ±Y vs anterior"
- [x] 5.4 Agregar `strings.dashboard.vsPrevious` en `locales/es.js`
- [x] 5.5 Omitir indicador PoP cuando no hay datos del período anterior

## 6. Dashboard — Jerarquía textual en subtitles

- [x] 6.1 Agregar CSS: `.dashboard-card .subtitle strong { font-weight: 600; color: var(--moss-ink); }`
- [x] 6.2 Envolver números clave en `<strong>` en todos los subtitles de dashboard (sueño, HRV, RHR, pasos, peso, ejercicio, distancia, sports)

## 7. Locales — Nuevos strings

- [x] 7.1 `dashboard.weight`, `dashboard.weightNoData`, `dashboard.weightDelta`
- [x] 7.2 `dashboard.distance`, `dashboard.distanceWalking`, `dashboard.distanceCycling`
- [x] 7.3 `dashboard.sportsSection`
- [x] 7.4 `dashboard.vsPrevious`

## 8. Tests

- [x] 8.1 Test unitario: sparkline color dinámico — moss para pendiente positiva
- [x] 8.2 Test unitario: sparkline color dinámico — ember para pendiente negativa
- [x] 8.3 Test unitario: sparkline default lichen con <5 puntos
- [x] 8.4 Test unitario: card de Peso muestra last, delta, y sparkline
- [x] 8.5 Test unitario: card de Distancia fusiona walking + cycling
- [x] 8.6 Smoke test: dashboard renderiza sports al fondo (debajo de charts)
- [x] 8.7 Ejecutar `npx vitest run` y verificar que todos los tests pasan

## 9. Verificación final

- [x] 9.1 Ejecutar `npm run build` para verificar build sin errores
- [x] 9.2 Verificar en `npm run dev:web` el orden: hero → KPIs → charts → sports
- [x] 9.3 Verificar sparklines dinámicos en todas las métricas
- [x] 9.4 Verificar PoP en cards de deporte con datos reales
- [x] 9.5 Verificar jerarquía textual con `<strong>` en subtitles
- [x] 9.6 Verificar que no hay regresiones visuales en el dashboard
