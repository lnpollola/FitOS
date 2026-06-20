# FitOS — Acompañante Adaptativo de Nutrición y Entrenamiento

![FitOS](https://img.shields.io/badge/FitOS-v0.1.0-0D9488?style=flat-square)
![Electron](https://img.shields.io/badge/Electron-28.1-47848F?style=flat-square)
![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

App de escritorio local-first (**Electron + SQLite**) para unificar datos de **Apple Watch**, plan de dieta basado en slots, balance energético con GET real, mediciones corporales y entrenamiento de fuerza. Cero dependencias cloud, todo corre localmente.

## Capturas de Pantalla

### Panel (Dashboard)
![Dashboard](screenshots/dashboard.svg)

### Actividad
![Actividad](screenshots/activity.svg)

### Plan de Dieta
![Plan de Dieta](screenshots/diet.svg)

### Balance Energético
![Balance Energético](screenshots/energy-balance.svg)

### Entrenamiento
![Entrenamiento](screenshots/training.svg)

---

## Novedades v0.1.0

| Novedad | Descripción |
|---|---|
| Dashboard renovado | 9 cards métricas (balance semanal, peso, pasos, FC reposo, HRV, SpO2, ejercicio, distancia, presión arterial) + selector 7d/15d/1m + gráfico tendencia + ranking actividad por sesiones |
| Plan de Dieta 5 columnas | Interfaz de 5 comidas (Desayuno, Media Mañana, Comida, Merienda, Cena) con opciones de alimentos clickables, gramos por tipo de día, y totales por columna |
| Generador automático de plan | Genera plan diario de 5 comidas desde el objetivo de déficit calórico, con ratios de macros calculados de la semilla de datos |
| Paginación y búsqueda de alimentos | Tabla paginada (20/página) con filtros por categoría y búsqueda por nombre + auto-completar al escribir |
| Platos elaborados | CRUD de platos con ingredientes, macros totales, y vinculación a comidas |
| Evaluación de adherencia | Gáug visual de progreso, puntuación de consistencia semanal, recomendaciones específicas (aumentar déficit o mantener ritmo) |
| Detección de recomposición | Gráfico peso vs cintura, guía de datos faltantes, detección automática de recomposición corporal |
| Impacto vs Base PDF | Comparación entre ingesta actual y la base del plan de dieta PDF |
| Comparación por períodos | Flechas de tendencia (▲/▼/―) en dashboard y actividad, sparklines por tipo de deporte |
| Importación Apple Health XML | Parseo mediante HealthSync CLI con migración a SQLite |
| Biblioteca de 55 ejercicios | Filtros por grupo muscular y equipo, 6 patrones de movimiento, 5 planes de entrenamiento (2x a 6x semana) |
| +180 alimentos precargados | Base de datos de alimentos con macros por 100g de referencia BEDCA/USDA |

## Stack

| Capa | Tecnología |
|---|---|
| Desktop | Electron 28.1 (contextIsolation: true, nodeIntegration: false) |
| Frontend | Vanilla JS (ES modules), Vite 5, Chart.js 4.4 |
| Base de datos | better-sqlite3 9.6 (SQLite WAL mode, foreign keys ON) |
| Importación salud | HealthSync CLI (Go) para parseo de XML Apple Health |
| Build | Vite + electron-builder (AppImage / NSIS / dmg) |

## Vistas (7)

| Vista | ID | Funcionalidad |
|---|---|---|
| Panel | `dashboard` | 9+ cards métricas (balance, peso, pasos, FC reposo, HRV, SpO2, ejercicio, distancia, PA), gráfico tendencia 7d MA, ranking actividad por sesiones, selector rango 7d/15d/1m, flechas de tendencia |
| Actividad | `activity` | Importación Apple Health XML, resumen semanal con gráfico kcal+duración dual, tabla ranking ordenable con sparklines y comparación por períodos (15d/1m/3m) |
| Plan de Dieta | `diet` | 5 columnas de comidas con opciones clickables, gestor de alimentos con paginación y filtros, platos elaborados, plan diario con auto-generador desde déficit objetivo |
| Balance Energético | `energy` | Planificación adaptativa: ritmo objetivo, desglose GET (TMB+deporte+NEAT), gauge de adherencia, consistencia semanal, detección de recomposición con gráfico peso vs cintura, impacto vs base PDF |
| Mediciones | `measurements` | 10 métricas + peso, método Navy body fat, gráficos históricos, comparativa antes/después |
| Entrenamiento | `training` | 5 planes predefinidos (2x-6x semana), biblioteca de 55 ejercicios con filtros, registro de sesiones con series/reps/RPE, gráficos de progresión |
| Perfil | `profile` | Perfil usuario (edad, sexo, altura, peso), export/import JSON completo, umbrales de cumplimiento |

## Scripts

```bash
npm run dev          # Vite + Electron en concurrently
npm run build        # Build producción + empaquetado
npm run dev:web      # Solo frontend en navegador (sin Electron)
```

## Scripts

```bash
npm run dev          # Vite + Electron en concurrently
npm run build        # Build producción + empaquetado
npm run dev:web      # Solo frontend en navegador (sin Electron)
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
