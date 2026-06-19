# FitOS — Acompañante Adaptativo de Nutrición y Entrenamiento

![FitOS](https://img.shields.io/badge/FitOS-v0.1.0-0D9488?style=flat-square)
![Electron](https://img.shields.io/badge/Electron-28.1-47848F?style=flat-square)
![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

App de escritorio local-first (**Electron + SQLite**) para unificar datos de **Apple Watch**, plan de dieta basado en slots, balance energético con GET real, mediciones corporales y entrenamiento de fuerza. Cero dependencias cloud, todo corre localmente.

## Novedades v0.1.0

| Novedad | Descripción |
|---|---|
| Importación Apple Health XML | Reemplazó el CSV como fuente principal de datos |
| Timeline con sparklines | Cada métrica diaria muestra tendencia 7d + flecha vs día anterior |
| Dashboard renovado | Selector de rango (7d/15d/1m), cards por actividad con iconos, resumen total |
| KPIs deportivos | Tarjetas con total sesiones, kcal, minutos, tipos + tabla ordenable |
| Biblioteca de ejercicios | Filtros por grupo muscular/equipo, paginación, iconos |
| Tendencias de salud | 6 gráficos, ranking con nombres en español, métricas secundarias (VO2, RHR, etc.) |
| Mediciones corporales | 13 métricas con gráficos individuales, pre-fill último valor, labels en español |
| Perfil con métricas disponibles | Listado de 9 métricas de HealthSync aún no visualizadas |

## Capturas de Pantalla

> Agrega aquí las capturas. Coloca los archivos en `screenshots/`.

### Dashboard
![Dashboard](screenshots/dashboard.png?raw=true)
*Panel principal con resumen de balance, pasos, FC reposo y cards de actividad deportiva por tipo.*

### Actividad
![Actividad - Timeline](screenshots/activity-timeline.png?raw=true)
*Línea de tiempo con sparklines de tendencia 7d, flechas de cambio diario y paginación por mes.*

![Actividad - Deporte KPIs](screenshots/activity-sport-kpis.png?raw=true)
*Resumen deportivo con KPIs (sesiones, kcal, minutos, tipos) y tabla ordenable con iconos.*

### Plan de Dieta
![Dieta](screenshots/diet.png?raw=true)
*Plantillas de comidas por slots, gestor de alimentos y platos elaborados.*

### Balance Energético
![Balance](screenshots/energy.png?raw=true)
*Desglose del GET (TMB + deporte + NEAT), balance diario y semanal.*

### Mediciones Corporales
![Mediciones](screenshots/measurements.png?raw=true)
*Formulario con pre-fill del último valor, historial formateado y 13 gráficos de tendencia.*

### Tendencias de Salud
![Tendencias](screenshots/analytics.png?raw=true)
*6 gráficos (pasos, FC, energía, HRV, sueño, actividades), ranking con iconos y métricas secundarias.*

### Entrenamiento de Fuerza
![Entrenamiento](screenshots/training.png?raw=true)
*Planes de entrenamiento, biblioteca con filtros, registro de sesiones y gráfico de progresión.*

### Perfil
![Perfil](screenshots/profile.png?raw=true)
*Perfil de usuario, export/import JSON y métricas disponibles no visualizadas.*

---

## Stack

| Capa | Tecnología |
|---|---|
| Desktop | Electron 28.1 (contextIsolation: true, nodeIntegration: false) |
| Frontend | Vanilla JS (ES modules), Vite 5, Chart.js 4.4 |
| Base de datos | better-sqlite3 9.6 (SQLite WAL mode, foreign keys ON) |
| Importación salud | HealthSync CLI (Go) para parseo de XML Apple Health |
| Build | Vite + electron-builder (AppImage / NSIS / dmg) |

## Vistas (8)

| Vista | ID | Funcionalidad |
|---|---|---|
| Panel | `dashboard` | Balance semanal, pasos promedio, FC reposo, cards actividad por tipo con resumen total |
| Actividad | `activity` | Importación Apple Health XML, timeline con sparklines + flechas, KPIs deportivos |
| Plan de Dieta | `diet` | Plantillas de comidas por slots, alimentos, platos elaborados, plan diario |
| Balance Energético | `energy` | Desglose GET (TMB + deporte + NEAT), balance diario y semanal |
| Mediciones | `measurements` | 13 métricas + peso, método Navy body fat, 13 gráficos individuales |
| Tendencias | `analytics` | 6 gráficos de salud, ranking actividades, métricas secundarias (VO2, RHR, HRV, etc.) |
| Entrenamiento | `training` | Planes 2-6 días, biblioteca con filtros, sesiones, progresión |
| Perfil | `profile` | Perfil usuario, export/import JSON, métricas disponibles |

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
