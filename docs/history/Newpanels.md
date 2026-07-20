# SPEC: Strava Dashboard — Análisis de Visualizaciones y KPIs
> Documento generado el 27/06/2026 · Fuente: capturas de pantalla de la app Strava (iOS)
> Propósito: Servir como especificación técnica para replicar o proponer mejoras sobre estas visualizaciones en otro software.

---

## ÍNDICE

1. [Arquitectura de Navegación](#1-arquitectura-de-navegación)
2. [Pantalla: Dashboard Progreso — Vista Superior](#2-pantalla-dashboard-progreso--vista-superior)
3. [Pantalla: Dashboard Progreso — Calendario Mensual](#3-pantalla-dashboard-progreso--calendario-mensual)
4. [Pantalla: Resumen Mensual (Mayo 2026)](#4-pantalla-resumen-mensual-mayo-2026)
5. [Pantalla: Detalle de Actividad (Fútbol)](#5-pantalla-detalle-de-actividad-fútbol)
6. [Catálogo Global de KPIs](#6-catálogo-global-de-kpis)
7. [Catálogo de Tipos de Visualización](#7-catálogo-de-tipos-de-visualización)
8. [Sistema de Iconos por Deporte](#8-sistema-de-iconos-por-deporte)
9. [Sistema de Color](#9-sistema-de-color)
10. [Insights Adicionales de Strava (no en capturas)](#10-insights-adicionales-de-strava-no-en-capturas)
11. [Propuesta de Extensión / Mejora](#11-propuesta-de-extensión--mejora)

---

## 1. ARQUITECTURA DE NAVEGACIÓN

### Bottom Navigation Bar (5 ítems)
| Posición | Label | Icono | Estado activo |
|---|---|---|---|
| 1 | Inicio | Casa | naranja |
| 2 | Mapas | Montaña/mapa | gris |
| 3 | Registrar | Círculo con punto (CTA principal) | gris |
| 4 | Grupos | Diamante/red | gris |
| 5 | Tú | Gráfico de barras | **naranja** (activo) |

### Top Tab Bar — Sección "Tú"
| Tab | Estado |
|---|---|
| Progreso | **Activo** (subrayado naranja) |
| Entrenamientos | Inactivo |
| Actividades | Inactivo |

### Header global
- Avatar de usuario (círculo, esquina superior izquierda)
- Título centrado: "Tú"
- Botón `+` (añadir actividad manual)
- Botón `⚙` (ajustes de perfil)

---

## 2. PANTALLA: DASHBOARD PROGRESO — VISTA SUPERIOR

### 2.1 Banner de Logro / Récord Personal

**Tipo de visualización:** Banner horizontal navegable (list item con chevron →)

**Disposición:**
```

[BADGE ICON] [LABEL TEXTO]           [VALOR]  >
[FECHA SUBTEXTO]

```

**Datos mostrados:**
| Campo | Valor de ejemplo | Tipo |
|---|---|---|
| badge_rank | 2 | integer (1=RP dorado, 2=plateado, 3=bronce) |
| badge_label | "2.º tiempo más rápido en 5 km" | string |
| activity_date | "27 de jun de 2025" | date string |
| time_value | "30:12" | string mm:ss |

**KPIs necesarios:**
```json
{
  "best_times": [
    {
      "distance_label": "5 km",
      "rank": 2,
      "time_seconds": 1812,
      "time_display": "30:12",
      "date": "2025-06-27",
      "is_pr": false
    }
  ]
}
```

**Reglas de negocio:**

- Solo se muestra el logro más reciente o el más destacado
- Badge dorado = rank 1 (PR), plateado = rank 2, bronce = rank 3
- Distancias estándar: 400m, 1km, 1mi, 5km, 10km, media maratón, maratón

---

### 2.2 Card "Objetivos Semanales" (columna izquierda)

**Tipo de visualización:** Card cuadrada con Ring Chart (donut parcial) + texto inferior

**Disposición:**

```
┌─────────────────────┐
│  Objetivos          │
│                     │
│    ◯ (ring ~25%)    │
│    [icono deporte]  │
│                     │
│  Logro semanal      │
│  1/4 actividades    │
│                    >│
└─────────────────────┘
```

**Datos mostrados:**


| Campo | Valor | Tipo |
| :-- | :-- | :-- |
| goal_type | "Logro semanal" | string |
| goal_current | 1 | integer |
| goal_target | 4 | integer |
| goal_progress_pct | 25.0 | float 0–100 |
| activity_type_icon | zapatilla (running) | enum sport_type |

**KPIs necesarios:**

```json
{
  "weekly_goal": {
    "type": "activity_count",
    "target": 4,
    "current": 1,
    "progress_pct": 25.0,
    "primary_sport": "run",
    "week_start": "2026-06-22",
    "week_end": "2026-06-28"
  }
}
```

**Especificaciones del Ring Chart:**

- Fondo: anillo gris oscuro completo (360°)
- Fill: verde (\#4CAF50 aprox.) de 0° a (progress_pct * 3.6)°
- Sentido: horario, inicio a las 12h
- Icono central: SVG del tipo de deporte principal
- Grosor del anillo: ~12–16px

---

### 2.3 Card "Esfuerzo Relativo" (columna derecha)

**Tipo de visualización:** Card cuadrada con valores numéricos grandes + rangos de fecha

**Disposición:**

```
┌─────────────────────┐
│  Esfuerzo Relativo  │
│                     │
│  79          ← rojo/magenta
│  jun 23–jun 29, 2026│
│                     │
│  12          ← morado
│  jun 16–jun 22, 2026│
│                    >│
└─────────────────────┘
```

**Datos mostrados:**


| Campo | Valor | Tipo |
| :-- | :-- | :-- |
| relative_effort_current | 79 | integer |
| date_range_current | "jun 23–jun 29, 2026" | string |
| relative_effort_previous | 12 | integer |
| date_range_previous | "jun 16–jun 22, 2026" | string |

**KPIs necesarios:**

```json
{
  "relative_effort": {
    "current_week": {
      "value": 79,
      "start_date": "2026-06-23",
      "end_date": "2026-06-29"
    },
    "previous_week": {
      "value": 12,
      "start_date": "2026-06-16",
      "end_date": "2026-06-22"
    },
    "delta": 67,
    "trend": "up"
  }
}
```

**Sistema de color por nivel de esfuerzo:**


| Rango | Color | Hex aproximado |
| :-- | :-- | :-- |
| Muy alto (>70) | Magenta/Rojo | \#E91E8C |
| Alto (40–70) | Naranja | \#FF6B35 |
| Moderado (20–40) | Morado | \#9C27B0 |
| Bajo (<20) | Morado claro | \#B39DDB |


---

### 2.4 Widget "Registro de Entrenamiento" (Training Log Semanal)

**Tipo de visualización:** Bubble Chart semanal — 7 columnas con círculos de tamaño proporcional

**Disposición:**

```
Registro de entrenamiento
jun 22 – jun 28, 2026                    4h 9m

  L    M    M    J    V    S    D
       ●         ⬤              ⬤⬤
            4h9m           4h9m
                                          >
```

**Datos mostrados:**


| Campo | Valor |
| :-- | :-- |
| semana | jun 22–jun 28, 2026 |
| total_semanal | 4h 9m (249 min) |
| Martes | actividad pequeña (sin label = <30 min aprox) |
| Jueves | 4h 9m (actividad principal) |
| Sábado | 4h 9m (actividad grande) |
| Resto de días | sin actividad |

**KPIs necesarios:**

```json
{
  "training_log_week": {
    "week_start": "2026-06-22",
    "week_end": "2026-06-28",
    "total_duration_minutes": 249,
    "total_display": "4h 9m",
    "days": [
      { "dow": "L", "duration_minutes": 0, "has_activity": false },
      { "dow": "M", "duration_minutes": 25, "has_activity": true, "show_label": false },
      { "dow": "M", "duration_minutes": 0, "has_activity": false },
      { "dow": "J", "duration_minutes": 249, "has_activity": true, "show_label": true },
      { "dow": "V", "duration_minutes": 0, "has_activity": false },
      { "dow": "S", "duration_minutes": 249, "has_activity": true, "show_label": true },
      { "dow": "D", "duration_minutes": 0, "has_activity": false }
    ]
  }
}
```

**Algoritmo de escalado de burbujas:**

- Radio mínimo (actividad existe pero breve): ~8px
- Radio máximo (actividad más larga de la semana): ~28px
- Fórmula: `radius = MIN_RADIUS + (duration / max_duration_week) * (MAX_RADIUS - MIN_RADIUS)`
- Label visible solo si `duration >= umbral` (ej. >60 min)
- Color: verde (\#6DBF6D aprox.)

---

### 2.5 Preview Resumen Mensual (Footer del scroll)

**Tipo de visualización:** Texto grande + Bar Chart mini (sparkline de barras)

**Disposición:**

```
[mayo]           | | | | | |█|
                        ↑ naranja (semana actual)
```

**Datos mostrados:**


| Campo | Valor |
| :-- | :-- |
| month_label | "mayo" |
| year_label | "2026" |
| weekly_bars | array de ~6 barras (una por semana del mes) |
| current_week_highlight | última barra en naranja |

**KPIs necesarios:**

```json
{
  "monthly_preview": {
    "month": "mayo",
    "year": 2026,
    "weekly_volumes": ,
    "current_week_index": 5
  }
}
```


---

## 3. PANTALLA: DASHBOARD PROGRESO — CALENDARIO MENSUAL

### 3.1 Header de Racha (Streak)

**Tipo de visualización:** Texto métrico doble en línea horizontal

**Disposición:**

```
Tu serie              Actividades en serie
61 Semanas            585
                              [Compartir ↑]
```

**Datos mostrados:**


| Campo | Valor | Tipo |
| :-- | :-- | :-- |
| streak_weeks | 61 | integer |
| streak_activities | 585 | integer |
| month_label | "junio 2026" | string |

**KPIs necesarios:**

```json
{
  "streak": {
    "weeks_consecutive": 61,
    "total_activities_in_streak": 585,
    "streak_start_date": "2025-04-XX",
    "is_active": true
  }
}
```


---

### 3.2 Calendario Mensual con Iconos de Actividad

**Tipo de visualización:** Grid calendario 7×5/6 con iconos circulares por día

**Disposición del grid:**

```
  L    M    X    J    V    S    D   | SEMANA
[🚴·][🚴·][🌊·][🚴·][🚴·][👟·][ 7] |  ✓
[🌊·][🚴·][ 10][⏱·][👟·][👟·][ 14] |  ✓
[👟·][👟·][🚴·][ 18][ 19][ 20][ 21]|  ✓
[⏱·][⏱·][ 24][🌊·][⚽·][ 27][ 28]|  🔥61
[ 29][ 30][ 1 ][ 2 ][ 3 ][ 4 ][ 5 ]|  ◯
```

**Estructura de un día activo:**

- Círculo blanco (fondo)
- Icono SVG del deporte en el centro
- Punto blanco pequeño en esquina superior derecha (indica datos adicionales / múltiple actividad)

**Estructura de un día sin actividad:**

- Círculo gris oscuro
- Solo número del día

**Estructura columna derecha (indicador semanal):**


| Estado | Visual |
| :-- | :-- |
| Semana completada | Círculo naranja con ✓ blanco |
| Semana actual activa (racha) | Círculo naranja con llama 🔥 + número de racha |
| Semana sin completar | Círculo gris |

**KPIs necesarios:**

```json
{
  "monthly_calendar": {
    "month": "2026-06",
    "days": [
      {
        "date": "2026-06-01",
        "day_of_week": "L",
        "has_activity": true,
        "sport_type": "ride",
        "sport_icon": "bicycle",
        "has_dot": true,
        "activity_ids": 
      }
    ],
    "weeks": [
      {
        "week_number": 1,
        "start_date": "2026-06-01",
        "end_date": "2026-06-07",
        "completed": true,
        "is_current": false,
        "streak_value": null
      },
      {
        "week_number": 4,
        "completed": false,
        "is_current": true,
        "streak_value": 61
      }
    ]
  }
}