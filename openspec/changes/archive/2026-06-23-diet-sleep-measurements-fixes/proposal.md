## Why

La vista de Plan de Dieta tiene una UX confusa: las plantillas de comidas no agrupan visualmente los alimentos por macronutriente, las fórmulas fijas de media mañana/merienda son incorrectas y no calculan calorías, y los platos elaborados no se vinculan correctamente a los slots. En Mediciones Corporales, la tabla de historial tiene problemas de responsividad, la métrica "Peso medio" muestra "undefined" como unidad, y no existe paginación real. Además, no hay una vista dedicada al análisis de sueño a pesar de que los datos de fases (REM, ligero, profundo) ya están disponibles vía HealthSync.

## What Changes

- **Plantillas de comidas**: Reorganización completa de la UI con cabeceras de grupo de alimentos (CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES) visibles arriba y abajo de cada slot. Click-to-select en cada alimento con cálculo automático de calorías por slot.
- **Fórmulas fijas**: Media mañana (300ml bebida vegetal + 30g avena + 20g proteína + 15g frutos secos) y merienda (350ml bebida vegetal + 50g avena + 30g proteína + 150g fruta) con ingredientes fijos y cálculo automático de calorías totales.
- **Platos elaborados**: Corrección del linkage plato→slot de comida. Gestores de alimentos (incluyendo ocultos) colapsables como el resto de gestores.
- **Historial de mediciones**: Tabla responsive sin barras de desplazamiento. Corrección del bug "undefined" en unidad de peso medio. Orden descendente por fecha (más reciente primero). Paginación real de 10 registros por página.
- **Vista de Análisis de Sueño**: Nueva pestaña con KPIs de sueño (promedio, consistencia, tendencia), gráficos de fases (REM, ligero, profundo), timeline de duración, y breakdown por fases usando datos de HealthSync.

## Capabilities

### New Capabilities
- `sleep-analysis-view`: Nueva vista dedicada al análisis de sueño con KPIs (promedio, consistencia, tendencia), gráficos de fases del sueño (REM, ligero, profundo), timeline de horas dormidas, y métricas de calidad usando datos existentes de `sleep_hours`, `sleep_deep`, `sleep_rem`, `sleep_light` en `activity_days`.
- `meal-template-reorganization`: Reorganización de la UI de plantillas de comidas con cabeceras de grupo de alimentos (carbohidratos, proteínas, grasas) visibles arriba y abajo de cada slot, click-to-select por alimento con cálculo automático de calorías, y fórmulas fijas específicas para media mañana y merienda con ingredientes inmutables pero calorías calculadas.

### Modified Capabilities
- `diet-plan-management`: Cambios en la estructura de plantillas — los alimentos se agrupan por macronutriente principal en lugar de categorías genéricas. Las fórmulas fijas de media mañana y merienda pasan de ser texto estático a ingredientes fijos con cálculo calórico. Nueva lógica de click-to-select con totales de calorías por slot.
- `elaborated-dishes`: Corrección de bug en linkage plato→slot de comida. El gestor de alimentos ocultos pasa a ser colapsable (comportamiento consistente con otros gestores).
- `body-measurements`: Corrección del bug "undefined" en la métrica de peso medio (asignación a DOM element incorrecto). Paginación real de 10 registros. Tabla de historial responsive.

## Impact

- **Vistas**: `diet.js` (reestructuración mayor de plantillas), `measurements.js` (tabla responsive + paginación + fix undefined), nuevo `sleep.js` (vista dedicada)
- **Locales**: `es.js` — nuevos strings para grupos de alimentos, fórmulas fijas, vista de sueño, paginación
- **CSS**: `main.css` — nuevos estilos para cabeceras de grupo, sleep view, tabla responsive, paginación
- **Router**: `app.js` — registro de nueva vista `sleep`, nuevo item en sidebar
- **HTML**: `index.html` — nuevo nav item para sueño
- **IPC handlers**: Reutiliza `db:getSleepAnalysis` existente. Posible nuevo handler para datos de fases por noche.
- **DB**: Sin cambios — los datos de fases de sueño ya existen en `activity_days`
