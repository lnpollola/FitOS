<div align="center">

<img src="https://img.shields.io/badge/FitOS-v0.4.0-5B7B5A?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMSAxNHYtNEg3bDUtOHY0aDRsLTUgOHoiLz48L3N2Zz4=" alt="FitOS v0.4.0"/>
<img src="https://img.shields.io/badge/Electron-28.1-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron 28.1"/>
<img src="https://img.shields.io/badge/SQLite-WAL_Mode-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite WAL"/>
<img src="https://img.shields.io/badge/Vitest-104_passing-5B7B5A?style=for-the-badge&logo=vitest&logoColor=white" alt="104 Tests"/>
<img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="MIT License"/>

<br/>

# 🌿 FitOS

### Acompañante Adaptativo de Nutrición y Entrenamiento

**App de escritorio local-first** — Electron + SQLite — para unificar datos de **Apple Watch**, plan de dieta basado en slots, balance energético con GET real, mediciones corporales y entrenamiento de fuerza.

**Cero dependencias cloud. Todo corre localmente. Tus datos, siempre tuyos.**

[Comenzar →](#-instalación) · [Ver arquitectura →](#-arquitectura) · [Changelog →](#-changelog)

</div>

***

## ✨ ¿Qué hace FitOS?

FitOS convierte datos reales de actividad y mediciones en decisiones semanales del plan de dieta. Conecta Apple Health con tu progreso físico y responde preguntas concretas:

| Pregunta | Dónde se responde |
|---|---|
| ¿Estoy realmente en déficit calórico? | Balance Energético → gauge de adherencia |
| ¿Mi entrenamiento está alineado con mi recuperación? | Entrenamiento + Tendencias → HRV y FC reposo |
| ¿Debería reducir carbohidratos o grasas? | Dieta → plan adaptativo desde déficit objetivo |
| ¿Estoy perdiendo grasa o músculo? | Mediciones → método Navy body fat + histórico |

***

## 🖥️ Vistas (8)

| Vista | ID | Qué verás |
|---|---|---|
| **Panel** | `dashboard` | 9+ cards métricas (balance, peso, pasos, FC reposo, HRV, SpO2, ejercicio), sparklines dinámicos moss/ember/lichen, anillo de crecimiento, selector rango 7d/15d/1m, hero colapsable |
| **Actividad** | `activity` | Importación Apple Health XML + CSV, resumen semanal con gráfico dual kcal/duración, ranking ordenable con sparklines y comparación 15d/1m/3m |
| **Plan de Dieta** | `diet` | 5 columnas de comidas con opciones clickables, gestor de alimentos con paginación y filtros, platos elaborados, auto-generador de plan desde déficit objetivo |
| **Balance Energético** | `energy` | Planificación adaptativa: ritmo objetivo, desglose GET (TMB + deporte + NEAT), gauge de adherencia, consistencia semanal, detección de recomposición |
| **Mediciones** | `measurements` | 10 métricas + peso, método Navy body fat, gráficos históricos, comparativa antes/después |
| **Entrenamiento** | `training` | 5 planes predefinidos (2x–6x semana), biblioteca de 55 ejercicios con filtros, registro de sesiones con series/reps/RPE, gráficos de progresión |
| **Tendencias** | `analytics` | Visión general de salud: pasos, FC, energía, HRV, sueño, ranking de actividades, VO2 max, FC reposo, minutos de ejercicio |
| **Perfil** | `profile` | Perfil usuario (edad, sexo, altura, peso), export/import JSON completo, umbrales de cumplimiento |

***

## 🛠️ Stack Técnico

| Capa | Tecnología | Detalle |
|---|---|---|
| **Desktop** | Electron 28.1 | `contextIsolation: true`, `nodeIntegration: false` |
| **Frontend** | Vanilla JS (ES modules) + Vite 5 | Sin frameworks, router manual de 30 líneas |
| **UI** | Chart.js 4.4 + Lucide SVG | 20 íconos tree-shakeados, microcharts reutilizables |
| **Base de datos** | better-sqlite3 9.6 | SQLite WAL mode, foreign keys ON, schema v4 |
| **Tests** | Vitest + jsdom | 104 tests: 12 unitarios + 8 smoke (20 archivos) |
| **Salud** | HealthSync CLI (Go) | Parseo de XML Apple Health |
| **Build** | Vite + electron-builder | AppImage / NSIS / dmg |

***

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/fitos.git
cd fitos

# Instalar dependencias
npm install

# Modo desarrollo (Electron + Vite concurrente)
npm run dev
```

> **Nota:** Las capturas de pantalla se encuentran en `screenshots/` (SVG generados por la app). Ejecutá `npm run dev:web` para ver la interfaz en un navegador sin Electron.

***

## 📋 Scripts

```bash
npm run dev          # Vite + Electron en modo desarrollo (concurrently)
npm run build        # Build producción + empaquetado con electron-builder
npm run dev:web      # Solo frontend en navegador (sin Electron)
npm test             # Vitest — 104 tests (unit + smoke)
npm run test:watch   # Vitest en modo watch interactivo
```

***

## 🏗️ Arquitectura

FitOS está construido en **4 capas estrictamente separadas**. Cada capa tiene una responsabilidad única y se comunica con la siguiente solo a través de canales definidos.

```
┌───────────────────────────────────────────────────────────┐
│                     renderer/  (Vista)                     │
│  app.js · views/ · utils/ · locales/ · styles/            │
│  SPA vanilla JS · router manual · caché cliente 30s TTL   │
├───────────────────────────────────────────────────────────┤
│                     preload/  (Puente)                     │
│  preload.js · contextBridge · IPC calls · domain events   │
├───────────────────────────────────────────────────────────┤
│                     main/  (Lógica)                        │
│  handlers/     · ipc-handlers.js · apple-health-import.js │
│  9 módulos por dominio — patrón register(ipcMain, ...)    │
├───────────────────────────────────────────────────────────┤
│                     db/  (Datos)                          │
│  database.js · seed-data.js · import-export.js            │
│  SQLite WAL · schema v4 · migraciones · populateCache()   │
└───────────────────────────────────────────────────────────┘
```

### Por qué 4 capas

Electron tiene un modelo de seguridad particular: el **renderer** (lo que ve el usuario) corre en un contexto aislado sin acceso directo al sistema ni a Node.js. Toda comunicación con el SO o la base de datos pasa por el **main process** mediante IPC. Esto obliga a separar vista de lógica, y esa separación se extiende a toda la arquitectura:

| Capa | Rol | Decisión de diseño |
|---|---|---|
| `renderer/` | Interfaz de usuario | Vanilla JS sin framework — sin migraciones futuras, cada vista exporta `init()` |
| `preload/` | Puente de seguridad | `contextBridge` expone solo funciones necesarias. Cero lógica de negocio |
| `main/` | Lógica de negocio | 9 módulos por dominio — `ipc-handlers.js` pasó de 1.372 a 30 líneas |
| `db/` | Persistencia y modelo | SQLite con migraciones versionadas, foreign keys, WAL mode y caches agregados |

### Flujo de datos — ejemplo concreto

Cuando un usuario guarda un alimento en la vista Dieta:

```
1. renderer/views/diet.js
   → api.saveFoodItem({ name: "Pollo", kcal: 165 })
   ↓ (IPC message)

2. preload/preload.js
   → ipcRenderer.invoke('db:saveFoodItem', data)
   ↓ (IPC invoke)

3. main/handlers/diet-handlers.js
   → db.saveFoodItem(data)
   → notifyDomain('diet')       // avisa al cliente que los datos cambiaron
   → refreshCaches(7, 15, 30)   // actualiza caches agregados
   ↓ (better-sqlite3)

4. db/database.js
   → INSERT INTO food_items ... RETURNING id
   → populateCache(7) INSERT OR REPLACE INTO activity_summary_cache ...
   ↓ (IPC reply)

5. renderer
   → cacheStore.invalidate('diet')   // invalida caché local del dominio
   → Repinta solo la sección afectada
```

### Sistema de caché en dos niveles

| Caché | Ubicación | TTL | Propósito |
|---|---|---|---|
| **Cliente** | `renderer/utils/cache-store.js` (Map en memoria) | 30s + invalidación por evento | Evita llamadas IPC innecesarias al navegar entre vistas |
| **Servidor** | `activity_summary_cache` en SQLite | Persistente | Agregaciones precomputadas (7/15/30 días) para el dashboard; incluye 5 métricas HealthSync |

La caché de servidor acelera consultas pesadas (dashboard con múltiples agregaciones). La de cliente evita viajes IPC redundantes cuando los datos no cambiaron. Ambas se invalidan coordinadamente vía `notifyDomain` + `EventTarget`.

### CSS modular — mismo bundle, mejor DX

`main.css` original tenía 2.025 líneas. Ahora son 6 archivos con el **mismo hash de bundle** que el monolítico:

| Archivo | Contenido |
|---|---|
| `base.css` | CSS reset, custom properties, tipografía Fraunces + Source Sans 3, diseño orgánico |
| `layout.css` | Sidebar, grid principal, responsive breakpoints (375px / 900px / 1280px) |
| `cards.css` | `.card`, `.card-accent`, hero colapsable, skeletons animados, contenedores sparkline |
| `forms.css` | `.form-group`, inputs, botones, checkboxes, spinners |
| `tables.css` | `.data-table`, sticky headers, alineación de celdas |
| `utilities.css` | `.text-xs`, `.flex-gap-sm`, `.sr-only`, colores de estado |

***

## 📂 Estructura del Proyecto

```
src/
├── renderer/                  # Frontend SPA
│   ├── index.html             # Shell HTML con sidebar navegable
│   ├── app.js                 # Router manual, init global, eventos
│   ├── views/                 # 8 vistas — cada una exporta init()
│   │   ├── dashboard.js
│   │   ├── activity.js
│   │   ├── diet.js
│   │   ├── energy.js
│   │   ├── measurements.js
│   │   ├── training.js
│   │   ├── analytics.js
│   │   └── profile.js
│   ├── locales/
│   │   └── es.js              # ~650 strings organizados por dominio
│   ├── utils/                 # Utilidades reutilizables
│   │   ├── cache-store.js     # Map + TTL 30s + invalidación por dominio
│   │   ├── sparkline.js       # Microchart sparkline independiente
│   │   ├── growth-ring.js     # Anillo de crecimiento con gap dinámico
│   │   ├── icons.js           # 20 íconos Lucide tree-shakeados
│   │   ├── sport-icons.js     # Mapeo deporte → Lucide
│   │   ├── chart-theme.js     # Tema compartido para Chart.js
│   │   ├── bmr.js             # Cálculo TMB Mifflin-St Jeor
│   │   ├── skeleton.js        # Skeletons animados por tipo
│   │   ├── state-card.js      # Sistema tri-estado loading/empty/error
│   │   └── validation.js      # Validación de formularios
│   └── styles/                # CSS modular (6 archivos + main)
│       ├── main.css           # Solo @imports en orden de cascada
│       ├── base.css
│       ├── layout.css
│       ├── cards.css
│       ├── forms.css
│       ├── tables.css
│       └── utilities.css
│
├── preload/
│   └── preload.js             # contextBridge, exposición IPC
│
├── main/
│   ├── main.js                # Ventana Electron, menú nativo
│   ├── ipc-handlers.js        # Registro de 9 módulos (30 líneas)
│   ├── apple-health-import.js
│   └── handlers/              # Handlers IPC por dominio
│       ├── activity-handlers.js
│       ├── diet-handlers.js
│       ├── energy-handlers.js
│       ├── measurements-handlers.js
│       ├── training-handlers.js
│       ├── profile-handlers.js
│       ├── dashboard-handlers.js
│       ├── health-handlers.js
│       └── settings-handlers.js
│
├── db/
│   ├── database.js            # Schema v4, migraciones, populateCache
│   ├── seed-data.js           # 46 alimentos, 56 ejercicios, 5 planes
│   └── import-export.js       # Backup/restore JSON completo
│
└── tests/
    ├── unit/                  # 12 archivos de tests unitarios
    └── smoke/                 # 8 tests de integración de vistas
```

***

## 💡 Principios del Producto

- **GET basado en actividades reales** — deportivas + NEAT, no multiplicadores genéricos
- **Modelo de dieta estructurado** — basado en planes probados con slots de comidas
- **Revisión semanal, no diaria** — decisiones sobre promedios, no sobre ruido diario
- **Las mediciones cuentan la historia completa** — no solo la báscula
- **Déficit y progresión seguros por defecto** — valores conservadores out-of-the-box
- **Cero cloud** — datos locales siempre, exportables en JSON en cualquier momento

***

## 📦 Changelog

### v0.4.0 — Arquitectura Modular *(23 Jun 2026)*

- **Handlers IPC modulares** — 9 módulos por dominio en `src/main/handlers/` con patrón `register(ipcMain, getDb, getHS, notifyDomain)`. `ipc-handlers.js` pasó de 1.372 a 30 líneas
- **Caché cliente** — `cache-store.js` con Map + TTL 30s + invalidación por dominio vía `EventTarget`. Las vistas reciben eventos `domain-changed` para refrescar sin recargar la app
- **Caché HealthSync** — `activity_summary_cache` con partición `period_days` (7/15/30) y 5 métricas nuevas: `exercise_minutes`, `walking_km`, `cycling_km`, `hrv_avg`, `resting_hr_avg`
- **CSS modular** — `main.css` reducido a imports; 6 archivos por componente con el mismo hash de bundle que el monolítico
- **104 tests** (20 archivos: 12 unit + 8 smoke)

### v0.3.0 — Diseño Orgánico "Libreta de Campo" *(22 Jun 2026)*

- **Identidad visual** — tipografía Fraunces (títulos) + Source Sans 3 (cuerpo). Paleta moss `#5B7B5A` / bone `#E8E0D4` / ember `#C25A3C`
- **Microcharts reutilizables** — `sparkline()` y `growthRing()` como módulos independientes en `utils/`. Anillo de crecimiento con gap dinámico (0° para N≤14, 0.6° para N>14)
- **Tokens globales** — variables CSS promovidas de `#view-dashboard` a `body.organic`
- **52 tests**

### v0.2.0 — UI/UX Overhaul *(20 Jun 2026)*

- **Sistema de diseño** — tokens de espaciado (`--space-1..8`), elevación (`--shadow-lg`), z-index; clases utilitarias y de componente
- **Íconos SVG (Lucide)** — todos los emojis reemplazados por SVGs; 20 iconos tree-shakeados con mapeo deporte → Lucide
- **Skeletons y streaming** — esqueletos animados en las 8 vistas; `Promise.allSettled` para mostrar cards ni bien resuelven
- **Responsive** — 3 breakpoints (<900px colapsa sidebar a iconos, 901–1280px normal, >1280px expandido)
- **Estados loading/empty/error** — sistema tri-estado con `state-card.js`, `role="alert"` en errores y botón "Reintentar"
- **Accesibilidad** — sidebar con `<button>` nativos, `aria-current="page"`, `:focus-visible`, `role="navigation"`
- **38 tests**, 13 bugs corregidos, `safeCall` wrapper en vistas

### v0.1.0 — Fundación *(18 Jun 2026)*

- 8 vistas funcionales: Dashboard, Actividad, Dieta, Balance Energético, Mediciones, Entrenamiento, Tendencias, Perfil
- Integración Apple Health XML via HealthSync CLI
- Plan de dieta con slots, alimentos, platos elaborados, auto-generador desde déficit
- Balance energético con GET real (TMB Mifflin-St Jeor + NEAT + deporte)
- 5 planes de entrenamiento predefinidos (2x–6x semana), 55 ejercicios, registro RPE
- Mediciones corporales con 10 métricas + método Navy body fat
- Export/import JSON completo
- 22 tests

***

## 📄 Licencia

MIT © Leandro Pollola — Ver [`LICENSE`](LICENSE) para más detalles.

***

<div align="center">
<sub>Construido con 🌿 en Valencia · Local-first, sin cloud, sin dependencias externas</sub>
</div>