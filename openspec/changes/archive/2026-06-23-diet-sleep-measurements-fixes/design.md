## Context

La aplicación tiene 8 vistas actuales (dashboard, activity, diet, energy, measurements, training, analytics, profile). El router en `app.js` mapea `data-view` strings a funciones `init()`. Cada vista es un módulo ES en `src/renderer/views/`. La navegación es vía sidebar con botones `<button class="nav-item" data-view="...">`.

La vista de dieta (`diet.js`) renderiza plantillas de comidas en un grid de 5 columnas. Las columnas de media mañana y merienda son tratadas como "recetas fijas" (texto estático sin selección de alimentos). Los alimentos se agrupan por categorías keyword-based (7 categorías) con pills de filtro de colores.

La vista de mediciones (`measurements.js`) tiene una tabla de historial con toggle "Ver todo" (5 filas iniciales, sin paginación real). Existe un bug donde `input.value` asigna peso al DOM element incorrecto (último input del loop de métricas en vez de `weightInput`).

Los datos de sueño ya existen en la DB (`sleep_hours`, `sleep_deep`, `sleep_rem`, `sleep_light` en `activity_days`) y hay handlers IPC (`db:getSleepAnalysis`) que computan promedios, consistencia (CV) y tendencia. HealthSync provee datos de fases de sueño vía Apple Health. No existe una vista dedicada de análisis de sueño.

## Goals / Non-Goals

**Goals:**
- Reorganizar las plantillas de comidas con cabeceras de macronutrientes (CARBOHIDRATOS, PROTEÍNAS, GRASAS SALUDABLES) visibles arriba y abajo de cada slot
- Implementar click-to-select por alimento con cálculo automático de calorías del slot
- Definir fórmulas fijas específicas para media mañana (300ml bebida vegetal + 30g avena + 20g proteína + 15g frutos secos) y merienda (350ml bebida vegetal + 50g avena + 30g proteína + 150g fruta) con cálculo calórico automático
- Corregir el linkage de platos elaborados a slots de comida
- Hacer colapsable el gestor de alimentos ocultos (igual que los otros gestores)
- Hacer responsive la tabla de historial de mediciones (sin scrollbars)
- Corregir bug "undefined" en la unidad de peso medio
- Implementar paginación real de 10 registros en historial de mediciones
- Crear nueva vista de Análisis de Sueño con KPIs, gráficos de fases y timeline

**Non-Goals:**
- Cambiar la estructura de la DB (las columnas de fases de sueño ya existen)
- Modificar el sistema de categorías de alimentos (solo cambia cómo se muestran en plantillas)
- Agregar nuevos handlers IPC (se reutilizan los existentes)
- Cambiar la vista de analytics (el sueño en analytics permanece como está)
- Modificar el menú nativo de Electron

## Decisions

### D1: Nueva vista de sueño como `data-view="sleep"`

**Decisión**: Crear `src/renderer/views/sleep.js` como novena vista, registrada en `app.js` con `sleep: initSleep`, y un nuevo nav item en `index.html`.

**Alternativas consideradas**:
- Expandir la card de sueño del dashboard → descartado, el dashboard debe ser resumen, no análisis detallado
- Agregar a analytics → descartado, analytics ya tiene tendencias; una vista dedicada permite gráficos de fases y KPIs que no caben en analytics

**Razón**: Una vista dedicada permite profundidad sin sobrecargar otras vistas. Los handlers IPC ya existen.

### D2: Agrupación de alimentos por macronutriente en plantillas

**Decisión**: En las columnas de plantilla (Desayuno, Comida, Cena), los alimentos se agrupan bajo headers: "CARBOHIDRATOS", "PROTEÍNAS", "GRASAS SALUDABLES". Cada header aparece al inicio y al final del grupo de alimentos correspondiente. El click en un alimento lo selecciona/deselecciona y recalcula el total de calorías del slot.

**Alternativas consideradas**:
- Mantener categorías actuales (panes, proteínas, grasas, frutas, verduras, legumbres, bebidas) → descartado, el usuario quiere agrupación por macronutriente principal
- Usar tabs para cambiar entre grupos → descartado, el usuario quiere headers arriba y abajo visibles simultáneamente

**Razón**: Coincide con la petición explícita del usuario. La agrupación por macronutriente es más relevante para planificación dietética que las categorías granulares.

### D3: Fórmulas fijas de media mañana y merienda

**Decisión**: Las columnas de media mañana y merienda muestran ingredientes fijos (no seleccionables) con cantidades específicas y un total de calorías calculado automáticamente:
- Media mañana: 300ml bebida vegetal, 30g harina de avena, 20g proteína, 15g frutos secos
- Merienda: 350ml bebida vegetal, 50g harina de avena, 30g proteína, 150g fruta

Los ingredientes son inmutables (no se pueden cambiar), pero las calorías se calculan a partir de los valores en `food_items`.

**Alternativas consideradas**:
- Hardcodear las calorías → descartado, frágil si los valores de food_items cambian
- Permitir editar las fórmulas → descartado, el usuario dijo explícitamente "eso no cambia"

**Razón**: Coincide con la petición del usuario. El cálculo desde food_items asegura coherencia con el resto del sistema.

### D4: Paginación real en historial de mediciones

**Decisión**: Reemplazar el toggle "Ver todo" / "Mostrar menos" con paginación real de 10 registros por página, con botones "Anterior" / "Siguiente" y contador de página. Orden descendente por fecha (más reciente primero).

**Alternativas consideradas**:
- Scroll infinito → descartado, complica la responsividad con una tabla ancha
- Mantener show-all toggle con 10 en vez de 5 → descartado, no escala con muchos registros

**Razón**: Paginación tradicional es más predecible y accesible para datos tabulares.

### D5: Tabla de historial responsive

**Decisión**: Usar `overflow-x: auto` en un contenedor wrapper con ancho máximo, sticky first column (fecha), y columnas con `white-space: nowrap` y `min-width`. En viewports pequeños (<900px), la tabla scrollea horizontalmente con la columna de fecha fija.

**Alternativas consideradas**:
- Stacked cards en móvil → descartado, 15 columnas en formato card es ilegible
- Ocultar columnas en móvil → descartado, el usuario necesita ver todos los datos

**Razón**: Patrón estándar para tablas anchas. La columna sticky mantiene el contexto.

### D6: Gestor de alimentos ocultos colapsable

**Decisión**: Envolver la sección de alimentos ocultos en un elemento `<details>` (igual que el gestor de alimentos y el gestor de platos), colapsado por defecto.

**Razón**: Consistencia con los otros gestores. El usuario explícitamente pidió "comprimido como todos los gestores".

## Risks / Trade-offs

- **[Riesgo] La nueva vista de sueño requiere datos de fases que solo están disponibles si el usuario ha importado desde Apple Health vía HealthSync** → Mitigación: mostrar estado empty con instrucciones claras cuando no hay datos de fases
- **[Riesgo] Cambiar la agrupación de alimentos en plantillas puede confundir a usuarios acostumbrados a las categorías anteriores** → Mitigación: los headers de macronutrientes son intuitivos y el cambio es puramente visual
- **[Riesgo] Las fórmulas fijas hardcodean nombres de alimentos que deben existir en food_items** → Mitigación: buscar los alimentos por nombre en la DB; si no existen, mostrar los ingredientes con valores genéricos o un mensaje de que faltan en la base de datos
- **[Trade-off] La paginación de 10 registros requiere mantener estado de página en el objeto de vista** → Aceptable, el estado se resetea al navegar fuera de la vista (patrón existente)
