# FitOS — Acompañante Adaptativo de Nutrición y Entrenamiento

![FitOS](https://img.shields.io/badge/FitOS-v0.3.0-0D9488?style=flat-square)
![Electron](https://img.shields.io/badge/Electron-28.1-47848F?style=flat-square)
![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Tests](https://img.shields.io/badge/tests-38%20passing-10B981?style=flat-square)

App de escritorio local-first (**Electron + SQLite**) para unificar datos de **Apple Watch**, plan de dieta basado en slots, balance energético con GET real, mediciones corporales y entrenamiento de fuerza. Cero dependencias cloud, todo corre localmente.

> **Nota:** Las capturas de pantalla se encuentran en `screenshots/` (SVG generados por la app). Ejecutá `npm run dev:web` para ver la interfaz en vivo.

## Novedades v0.3.0 — UI/UX Overhaul

| Novedad | Descripción |
|---|---|
| Sistema de diseño unificado | Tokens de espaciado (`--space-1..8`), elevación (`--shadow-lg`), z-index. Clases utilitarias (`.text-xs`, `.flex-gap-sm`) y de componente (`.card-accent`, `.compliance-ok`). |
| Íconos SVG (Lucide) | Todos los emojis reemplazados por SVGs vía Lucide: iconos deportivos, checks de cumplimiento, flechas de tendencia. 20 iconos tree-shakeados. |
| Esqueletos de carga | Skeletons animados en las 8 vistas mientras se cargan datos. Streaming con `Promise.allSettled`: cada card aparece ni bien resuelve. |
| Botones con spinner | Los botones de importar/exportar muestran spinner + estado deshabilitado durante operaciones async. |
| Accesibilidad | Sidebar con `<button>` nativos, `aria-current="page"`, `:focus-visible`, `role="navigation"`, labels faltantes agregados. |
| Diseño responsive | 3 breakpoints (<900px colapsa sidebar a iconos, 901-1280 normal, >1280 expandido). Sin scroll horizontal hasta 375px. |
| Estados loading/empty/error | Sistema tri-estado (`state-card.js`): esqueletos mientras carga, mensaje + botón si vacío, error con `role="alert"` y "Reintentar". |
| Puente de colores Chart.js | `chart-theme.js` lee variables CSS en runtime; todos los charts usan colores del tema. Sin hex hardcodeados. |
| Animaciones pulidas | Hover con sombra (sin layout shift), entrada escalonada de cards, tooltips consistentes, grillas sutiles, `prefers-reduced-motion`. |
| 38 tests automatizados | 22 existentes + 16 nuevos (iconos, skeletons, state-card, nav-a11y, chart-theme, emoji check en dashboard). |

## Stack

| Capa | Tecnología |
|---|---|
| Desktop | Electron 28.1 (contextIsolation: true, nodeIntegration: false) |
| Frontend | Vanilla JS (ES modules), Vite 5, Chart.js 4.4, Lucide (SVG icons) |
| Base de datos | better-sqlite3 9.6 (SQLite WAL mode, foreign keys ON) |
| Tests | Vitest + jsdom (38 tests: unit + smoke) |
| Importación salud | HealthSync CLI (Go) para parseo de XML Apple Health |
| Build | Vite + electron-builder (AppImage / NSIS / dmg) |

## Vistas (8)

| Vista | ID | Funcionalidad |
|---|---|---|
| Panel | `dashboard` | 9+ cards métricas (balance, peso, pasos, FC reposo, HRV, SpO2, ejercicio, distancia, PA), gráfico tendencia 7d MA, ranking actividad por sesiones, selector rango 7d/15d/1m, streaming con skeletons |
| Actividad | `activity` | Importación Apple Health XML, resumen semanal con gráfico kcal+duración dual, tabla ranking ordenable con sparklines y comparación por períodos (15d/1m/3m) |
| Plan de Dieta | `diet` | 5 columnas de comidas con opciones clickables, gestor de alimentos con paginación y filtros, platos elaborados, plan diario con auto-generador desde déficit objetivo |
| Balance Energético | `energy` | Planificación adaptativa: ritmo objetivo, desglose GET (TMB+deporte+NEAT), gauge de adherencia, consistencia semanal, detección de recomposición con gráfico peso vs cintura, impacto vs base PDF |
| Mediciones | `measurements` | 10 métricas + peso, método Navy body fat, gráficos históricos, comparativa antes/después |
| Entrenamiento | `training` | 5 planes predefinidos (2x-6x semana), biblioteca de 55 ejercicios con filtros, registro de sesiones con series/reps/RPE, gráficos de progresión |
| Tendencias | `analytics` | Visión general de salud: pasos, FC, energía, HRV, sueño, ranking de actividades, métricas secundarias (VO2 max, FC reposo, minutos de ejercicio) |
| Perfil | `profile` | Perfil usuario (edad, sexo, altura, peso), export/import JSON completo, umbrales de cumplimiento |

## Scripts

```bash
npm run dev          # Vite + Electron en concurrently
npm run build        # Build producción + empaquetado
npm run dev:web      # Solo frontend en navegador (sin Electron)
npm test             # Vitest (38 tests: unit + smoke)
npm run test:watch   # Vitest en modo watch
```

## Propósito

FitOS convierte datos reales de actividad y mediciones en decisiones semanales del plan de dieta, ayudando a responder:

- ¿Estoy realmente en déficit?
- ¿Mi entrenamiento está alineado con mi recuperación y objetivo?
- ¿Debería ajustar calorías reduciendo carbohidratos o grasas?
- ¿Estoy perdiendo grasa o músculo según las mediciones?

## Principios del producto

- GET basado en actividades reales (deportivas + NEAT), no multiplicadores genéricos
- Modelo de dieta basado en estructura de planes real probada
- Revisión semanal del plan sobre fluctuaciones diarias ruidosas
- Las mediciones cuentan la historia completa, no solo la báscula
- Valores predeterminados seguros para déficit y progresión de carga
- Cero dependencias cloud, datos locales siempre
