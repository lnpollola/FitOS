## 1. CSS — Componente `.data-table`

- [x] 1.1 Crear `.data-table-wrapper` con `overflow-x: auto`, `border-radius: var(--radius)`, `border: 1px solid var(--border)`
- [x] 1.2 Crear `.data-table` con `border-collapse: collapse`, `font-family: var(--font-body)`, `font-size: 13px`
- [x] 1.3 Estilar `.data-table thead th`: Fraunces italic 500 12px moss-ink, bg moss-mist, sticky top
- [x] 1.4 Estilar `.data-table tbody td`: Source Sans 3 13px moss-ink, padding 10px 14px
- [x] 1.5 Implementar zebra striping: `tr:nth-child(even) td` con `var(--smoke)`, odd con `var(--paper)`
- [x] 1.6 Implementar hover: `tr:hover td` con `var(--moss-mist)` + `transition: background 0.15s var(--ease-organic)`
- [x] 1.7 Estilar `.data-table tfoot td`: Fraunces italic 600 13px moss, `border-top: 2px solid var(--moss)`
- [x] 1.8 Crear variante `.data-table--sticky-col` con `th:first-child, td:first-child { position: sticky; left: 0 }`
- [x] 1.9 Crear `.data-table-pagination` con botones moss outline, contador "Página X de Y", disabled state

## 2. Migración de tablas — Dieta

- [x] 2.1 Migrar tabla de ingredientes de platos: `#dish-ingredients-list` → `.data-table-wrapper > .data-table` con `<tfoot>`
- [x] 2.2 Migrar tabla de alimentos: `#food-list` tabla pelada → `.data-table-wrapper > .data-table` + `.data-table-pagination`
- [x] 2.3 Migrar tabla de alimentos ocultos: `#hidden-foods` tabla pelada → `.data-table-wrapper > .data-table`

## 3. Migración de tablas — Actividad

- [x] 3.1 Migrar tabla de timeline: `#activity-timeline` tabla pelada → `.data-table-wrapper > .data-table` (mantener sparklines en celdas)
- [x] 3.2 Migrar tabla de ranking deportivo: wrapper inline `overflow-x:auto` → `.data-table-wrapper > .data-table`

## 4. Migración de tablas — Entrenamiento

- [x] 4.1 Migrar tabla de ejercicios: tabla pelada + paginación inline → `.data-table-wrapper > .data-table` + `.data-table-pagination`
- [x] 4.2 Migrar tabla de rutinas: tabla pelada → `.data-table-wrapper > .data-table`
- [x] 4.3 Migrar tabla de sesiones: tabla pelada con sub-rows expandibles → `.data-table-wrapper > .data-table`
- [x] 4.4 Migrar tabla de sets (anidada): tabla con style inline → `.data-table` (sin wrapper propio, dentro del colspan)
- [x] 4.5 Migrar tabla de deltas de sesión: tabla pelada → `.data-table-wrapper > .data-table`

## 5. Migración de tablas — Mediciones

- [x] 5.1 Migrar tabla de historial: `.table-responsive > table` → `.data-table-wrapper > .data-table--sticky-col` + `.data-table-pagination`
- [x] 5.2 Migrar tabla de resumen mensual de peso: tabla con style inline → `.data-table-wrapper > .data-table`
- [x] 5.3 Migrar tabla de comparación before/after: container `.table-responsive` → `.data-table-wrapper > .data-table--sticky-col`

## 6. Migración de tablas — Analytics y Adaptive

- [x] 6.1 Migrar tabla de ranking en analytics: `.ranking-table-wrap > table` → `.data-table-wrapper > .data-table`
- [x] 6.2 Migrar tabla de historial de ajustes en adaptive: tabla pelada → `.data-table-wrapper > .data-table`

## 7. Limpieza de CSS obsoleto

- [x] 7.1 Eliminar `.table-responsive` y sus reglas asociadas de `main.css`
- [x] 7.2 Eliminar `.ranking-table-wrap` de `main.css`
- [x] 7.3 Eliminar estilos base `table, th, td` globales que ya cubre `.data-table`
- [x] 7.4 Verificar que no quedan referencias a `.table-responsive` o `.ranking-table-wrap` en ningún JS

## 8. Sidebar — Secciones colapsables

- [x] 8.1 Reestructurar `<ul class="nav-list">` en `index.html` con 3 secciones (INICIO, SALUD, ENTRENAMIENTO) usando `<li class="nav-section">`
- [x] 8.2 Agregar `data-section` attribute a los `<li>` hijos para vincularlos con su header de sección
- [x] 8.3 Agregar `nav.sections.inicio`, `nav.sections.salud`, `nav.sections.entrenamiento` en `locales/es.js`
- [x] 8.4 Crear CSS `.nav-section` con Fraunces italic 10px uppercase lichen, padding, cursor pointer, chevron
- [x] 8.5 Implementar lógica JS de toggle: click en `.nav-section` → toggle `display` de hijos `[data-section]`
- [x] 8.6 Implementar persistencia en `localStorage` del estado colapsado/expandido por sección
- [x] 8.7 Asegurar que la sección activa (donde está la vista current) no se puede colapsar
- [x] 8.8 Agregar nav item "Sueño" bajo la sección SALUD
- [x] 8.9 Posicionar "Perfil y Ajustes" al fondo del sidebar, fuera de secciones, con separador visual

## 9. Locales — Nuevos strings

- [x] 9.1 `nav.sections.inicio`, `nav.sections.salud`, `nav.sections.entrenamiento`
- [x] 9.2 `nav.sleep`
- [x] 9.3 `general.page`, `general.of`, `general.prevPage`, `general.nextPage`

## 10. Tests

- [x] 10.1 Test unitario: `.data-table` aplica zebra striping correctamente
- [x] 10.2 Test unitario: `.data-table-pagination` muestra/oculta según totalPages
- [x] 10.3 Test unitario: sidebar section toggle expande/colapsa hijos
- [x] 10.4 Smoke test: sidebar sections persisten en localStorage
- [x] 10.5 Ejecutar `npx vitest run` y verificar que todos los tests pasan

## 11. Verificación final

- [x] 11.1 Ejecutar `npm run build` para verificar build sin errores
- [x] 11.2 Verificar en `npm run dev:web` que las 16 tablas usan `.data-table` y se ven consistentes
- [x] 11.3 Verificar sidebar: colapsar/expandir secciones, persistencia en recarga, navegación
- [x] 11.4 Verificar que no hay regresiones visuales en ninguna vista
- [x] 11.5 Verificar que las clases `.table-responsive` y `.ranking-table-wrap` no existen en CSS ni JS
