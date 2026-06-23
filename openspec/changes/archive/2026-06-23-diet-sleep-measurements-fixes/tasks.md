## 1. Router y navegación — nueva vista de Sueño

- [x] 1.1 Registrar nueva vista `sleep` en `app.js` (mapeo `sleep: initSleep` en el objeto `views`)
- [x] 1.2 Agregar nav item "Sueño" en `index.html` con `<button class="nav-item" data-view="sleep">` e ícono `moon`
- [x] 1.3 Agregar label de navegación en `locales/es.js` bajo `strings.nav.sleep`
- [x] 1.4 Crear archivo `src/renderer/views/sleep.js` con estructura base (import strings, export `init()`, guard `!api`)

## 2. Vista de Análisis de Sueño

- [x] 2.1 Implementar `init()` en `sleep.js`: renderizar contenedor con skeleton loading, llamar `api.getSleepAnalysis()`
- [x] 2.2 Renderizar KPIs: promedio 7d, consistencia (CV con label), tendencia (mejorando/empeorando/estable con flecha)
- [x] 2.3 Renderizar gráfico de timeline de horas de sueño (línea + media móvil 7d) con Chart.js, destroy-before-recreate
- [x] 2.4 Renderizar gráfico de fases de sueño (stacked bar: REM, ligero, profundo) con colores orgánicos
- [x] 2.5 Manejar estado empty cuando no hay datos de sueño (instrucciones de importación)
- [x] 2.6 Manejar estado empty de fases cuando hay horas pero no datos de fases (mensaje específico)
- [x] 2.7 Aplicar tokens orgánicos (Fraunces/Source Sans 3, paleta moss/bone/ember, `.card` styling)

## 3. Reorganización de plantillas de comidas

- [x] 3.1 Definir mapping de alimentos a macronutrientes (CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES) en `diet.js`
- [x] 3.2 Modificar `loadMealTemplates()`: agrupar food options por macronutriente en lugar de categorías keyword
- [x] 3.3 Renderizar headers de macronutriente arriba y abajo de cada grupo dentro del slot
- [x] 3.4 Implementar click-to-select: toggle selección con highlight (accent border), recalcular calorías del slot
- [x] 3.5 Implementar `updateColumnTotals()` que se llame en cada click de alimento (no solo en render inicial)
- [x] 3.6 Asegurar que `updateColumnTotals()` también se llame en el render inicial para mostrar kcal no-cero

## 4. Fórmulas fijas de Media Mañana y Merienda

- [x] 4.1 Reemplazar texto estático de recetas fijas en `loadMealTemplates()` con ingredientes específicos
- [x] 4.2 Media Mañana: renderizar "300ml bebida vegetal", "30g harina de avena", "20g proteína", "15g frutos secos"
- [x] 4.3 Merienda: renderizar "350ml bebida vegetal", "50g harina de avena", "30g proteína", "150g fruta"
- [x] 4.4 Buscar cada ingrediente fijo en `food_items` por nombre para obtener `kcal_per_100g`
- [x] 4.5 Calcular kcal total de cada fórmula fija: sum(grams × kcal_per_100g / 100) y mostrar en la columna
- [x] 4.6 Manejar caso donde un ingrediente fijo no existe en food_items (mostrar warning, usar 0 kcal)
- [x] 4.7 Mantener exclusión de media mañana/merienda en "Generar Plan Diario" y "Generar Plan Automático"

## 5. Platos elaborados y gestores colapsables

- [x] 5.1 Envolver sección de alimentos ocultos en `<details>` colapsable con summary "Gestor de alimentos ocultos"
- [x] 5.2 Verificar consistencia de estilos chevron entre los 3 gestores (alimentos, platos, ocultos)
- [x] 5.3 Depurar y corregir el linkage plato→slot: asegurar que `linkDishToMeal` + inserción de ingredientes funciona sin FK violations
- [x] 5.4 Verificar que los ingredientes del plato aparecen correctamente en el daily plan render

## 6. Mediciones — tabla responsive y paginación

- [x] 6.1 Envolver tabla de historial en contenedor con `overflow-x: auto` y `max-width: 100%`
- [x] 6.2 Hacer sticky la primera columna (fecha) con `position: sticky; left: 0`
- [x] 6.3 Eliminar scrollbars permanentes (usar `overflow: auto` en vez de `overflow: scroll`)
- [x] 6.4 Reemplazar toggle "Ver todo"/"Mostrar menos" por paginación real de 10 registros por página
- [x] 6.5 Implementar estado de página (`_historyPage`), botones "Anterior"/"Siguiente" y contador "Página X de Y"
- [x] 6.6 Deshabilitar botón "Anterior" en página 1 y "Siguiente" en última página
- [x] 6.7 Ocultar controles de paginación cuando hay ≤10 registros
- [x] 6.8 Asegurar orden descendente por fecha en `db:getMeasurementSets` (más reciente primero)

## 7. Mediciones — fix bug "undefined" en peso medio

- [x] 7.1 Corregir asignación de `latest.weight_kg` al DOM element correcto (`weightInput` en vez de `input` del loop)
- [x] 7.2 Verificar que la tabla de resumen mensual muestra "kg" correctamente (usando `strings.general.unitKg`)

## 8. Locales — nuevos strings

- [x] 8.1 Agregar `strings.nav.sleep` = `'Sueño'`
- [x] 8.2 Agregar strings para grupos de macronutrientes: `strings.diet.macroCarbs`, `macroProteins`, `macroFats`
- [x] 8.3 Agregar strings para fórmulas fijas: `strings.diet.fixedMidMorningTitle`, `fixedSnackTitle`, `fixedKcal`
- [x] 8.4 Agregar strings para vista de sueño: `strings.sleep.title`, `sleep.avg`, `sleep.deep`, `sleep.rem`, `sleep.light`, `sleep.timeline`, `sleep.phases`, `sleep.phasesUnavailableDetail`, `sleep.noData`, `sleep.noDataDetail`, `sleep.trend`, `sleep.consistency`
- [x] 8.5 Agregar strings para paginación de mediciones: `strings.measurements.page`, `measurements.prevPage`, `measurements.nextPage`
- [x] 8.6 Agregar strings para gestor de ocultos: `strings.diet.hiddenFoodManager`

## 9. CSS

- [x] 9.1 Estilos para headers de macronutrientes en columnas de plantilla (`.macro-header`, colores orgánicos)
- [x] 9.2 Estilos para alimentos seleccionados (`.food-option.selected` con accent border)
- [x] 9.3 Estilos para vista de sueño (`.sleep-kpi`, `.sleep-chart-container`, layout de grid para KPIs)
- [x] 9.4 Estilos para tabla de historial responsive (`overflow-x: auto`, sticky date column, `max-width`)
- [x] 9.5 Estilos para paginación (`.pagination-controls`, botones disabled state)
- [x] 9.6 Estilos para gestor de ocultos colapsable (consistente con otros `<details>`)

## 10. Tests

- [x] 10.1 Test unitario: `sleep.js` renderiza KPIs correctamente con datos mock
- [x] 10.2 Test unitario: `sleep.js` muestra estado empty sin datos
- [x] 10.3 Test unitario: `diet.js` agrupa alimentos por macronutriente correctamente
- [x] 10.4 Test unitario: fórmulas fijas calculan calorías correctamente con valores mock de food_items
- [x] 10.5 Test unitario: click-to-select toggle cambia estado y recalcula totales
- [x] 10.6 Test unitario: paginación de historial muestra 10 registros y navega entre páginas
- [x] 10.7 Smoke test: navegación a vista de sueño funciona
- [x] 10.8 Smoke test: gestor de ocultos colapsable funciona
- [x] 10.9 Ejecutar `npx vitest run` y verificar que todos los tests pasan — **104 tests, 20 files, all passed**

## 11. Verificación final

- [x] 11.1 Ejecutar `npm run build` para verificar que no hay errores de build — **passed**
- [x] 11.2 Verificar en modo `npm run dev:web` que la navegación entre las 9 vistas funciona — **verified**
- [x] 11.3 Verificar que la tabla de historial de mediciones es responsive sin scrollbars permanentes — **verified**
- [x] 11.4 Verificar que "undefined" no aparece en peso medio — **verified**
- [x] 11.5 Verificar que los platos elaborados se agregan correctamente a los slots de comida — **verified**
