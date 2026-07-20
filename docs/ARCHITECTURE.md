# Arquitectura FitOS: Evolución y Migración

## Arquitectura Original (Electron-only)

### Cómo Funcionaba

```
┌─────────────────────────────────────────┐
│  Aplicación Electron                    │
│  ┌───────────────────────────────────┐  │
│  │  Proceso Principal (Node.js)      │  │
│  │  ├─ main.js                       │  │
│  │  ├─ IPC Handlers (40+ handlers)   │  │
│  │  └─ SQLite (~/.config/personal-pollo/)│
│  └───────────────────────────────────┘  │
│           ↕ IPC (ipcMain/ipcRenderer)   │
│  ┌───────────────────────────────────┐  │
│  │  Proceso de Renderizado (Chromium)│  │
│  │  ├─ Frontend (Vanilla JS)         │  │
│  │  ├─ window.electronAPI            │  │
│  │  └─ Vite dev server :5173         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Flujo de Datos
1. **Frontend** llama a `window.electronAPI.getProfile()`
2. **Preload** traduce a `ipcRenderer.invoke('db:getProfile')`
3. **IPC** envía mensaje al proceso principal
4. **IPC Handler** ejecuta query SQLite
5. **Resultado** vuelve por IPC al frontend

### Limitaciones
- ❌ **Solo desktop**: Accesible solo desde la máquina donde corre Electron
- ❌ **Sin multi-dispositivo**: No puedes acceder desde móvil, tablet u otra PC
- ❌ **WSL aislado**: Desde Windows host no puedes ver los datos (solo frontend)
- ❌ **Sin acceso remoto**: No puedes acceder desde otra red

### Por Qué Se Diseñó Así
- **Simplicidad**: Electron empaqueta todo (frontend + backend + DB)
- **Seguridad**: Datos locales, sin exposición a red
- **Offline**: Funciona sin conexión a internet
- **Rápido desarrollo**: No necesitas diseñar API REST

---

## Problema que Motivó el Cambio

**Situación**: Usuario trabajando en WSL (Windows Subsystem for Linux)

```
┌─────────────────────┐         ┌─────────────────────┐
│  Windows Host       │         │  WSL (Linux)        │
│  ├─ Navegador       │         │  ├─ FitOS (Electron)│
│  │  localhost:5173   │ ←─X──── │  │  Puerto 5173     │
│  │  (Frontend OK)    │         │  │  Puerto 3000     │
│  └─────────────────┘         │  └───────────────────┘
│                              │
│  Resultado:                  │
│  - Frontend carga ✓          │
│  - window.electronAPI = ❌   │
│  - Datos no disponibles ❌   │
└──────────────────────────────┘
```

**Causa raíz**: 
- `window.electronAPI` solo existe dentro del contexto de Electron
- El navegador en Windows no tiene acceso a IPC de Electron
- Vite dev server sí es accesible, pero solo sirve el frontend

---

## Nueva Arquitectura (Web-First)

### Cómo Funciona Ahora

```
┌──────────────────────────────────────────────────────┐
│  Servidor Express (puerto 3000) - PRODUCCIÓN         │
│  ┌────────────────────────────────────────────────┐  │
│  │  API REST (/api/*)                             │  │
│  │  ├─ Reutiliza IPC handlers existentes          │  │
│  │  ├─ MockIpcMain simula ipcMain                 │  │
│  │  └─ Traduce HTTP ↔ IPC                         │  │
│  ├────────────────────────────────────────────────┤  │
│  │  Archivos Estáticos (dist/renderer/)           │  │
│  │  └─ Frontend compilado por Vite                │  │
│  ├────────────────────────────────────────────────┤  │
│  │  SQLite (~/.fitos-data/health-data.db)         │  │
│  │  └─ Base de datos compartida                   │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
         ↑ HTTP/REST API
         │
    ┌────┴────────────────────────────┐
    │                                 │
┌───▼──────────┐              ┌──────▼──────┐
│  Navegador   │              │  Electron   │
│  (cualquier  │              │  (DEV only) │
│  dispositivo)│              │             │
│              │              │             │
│  webAPI      │              │  electronAPI│
│  (fetch)     │              │  (IPC)      │
└──────────────┘              └─────────────┘
     ↑                              ↑
  PRODUCCIÓN                    DESARROLLO
  (multi-dispositivo)           (debugging)
```

### Flujo de Datos (Modo Web - PRODUCCIÓN)
1. **Frontend** detecta modo web (`!window.electronAPI`)
2. **getAPI()** retorna `webAPI` en lugar de `electronAPI`
3. **webAPI** hace `fetch('/api/db:getProfile', { method: 'POST' })`
4. **Express** recibe request, busca handler en MockIpcMain
5. **Handler** ejecuta query SQLite (mismo código que IPC)
6. **JSON response** vuelve al frontend

### Flujo de Datos (Modo Electron - DESARROLLO)
1. **Frontend** detecta modo Electron (`window.electronAPI` existe)
2. **getAPI()** retorna `window.electronAPI`
3. **electronAPI** usa IPC tradicional
4. **Mismo flujo** que antes

---

## Componentes Nuevos

### Backend (src/server/)

**server.js**
- Servidor Express que escucha en puerto 3000
- Sirve archivos estáticos (frontend compilado)
- Registra rutas API

**api-handlers.js**
- `MockIpcMain`: Simula `ipcMain` para reutilizar handlers existentes
- Registra todos los handlers de `src/main/handlers/`
- Traduce requests HTTP a llamadas de handler

### Frontend (src/renderer/utils/)

**api-detector.js**
```javascript
export function getAPI() {
  if (window.electronAPI) {
    return window.electronAPI;  // Modo Electron (DEV)
  }
  return webAPI;                 // Modo Web (PRODUCCIÓN)
}
```

**web-api.js**
- Implementa la misma interfaz que `window.electronAPI`
- Usa `fetch()` para llamar a la API REST
- Mapea cada método a un endpoint `/api/*`

### Scripts (scripts/)

**switch-mode.js**
- Detecta cambio de modo (Electron ↔ Web)
- Recompila `better-sqlite3` automáticamente
- Guarda estado en `.current-mode`

---

## Base de Datos Unificada

### Antes (Problema)
```
Electron: ~/.config/personal-pollo/health-data.db
Web:      ~/.fitos-data/health-data.db
          ↑ Necesitaban sincronización manual
```

### Ahora (Solución)
```
Ambos modos: ~/.fitos-data/health-data.db
             ↑ Una sola base de datos compartida
```

**Ventajas:**
- ✅ No necesitas sincronizar datos entre modos
- ✅ Los datos persisten al cambiar de modo
- ✅ Una sola fuente de verdad
- ✅ Sin scripts de sincronización

---

## Ventajas de la Nueva Arquitectura

### ✅ Web-First (Producción)
- Multi-dispositivo (móvil, tablet, otra PC)
- Acceso remoto (port forwarding, ngrok)
- Sin instalación requerida
- Despliegue en servidor con PM2

### ✅ Electron para Desarrollo
- Debugging con DevTools nativos
- Testing de funcionalidades desktop-only
- Notificaciones nativas
- Modo offline

### ✅ Reutilización de Código
- **0 cambios** en lógica de negocio
- Handlers IPC se reutilizan tal cual
- Frontend funciona en ambos modos

### ✅ Base de Datos Compartida
- Sin sincronización manual
- Datos consistentes entre modos
- Migración automática de datos existentes

### ✅ Flexibilidad
- Modo Web: Producción, multi-dispositivo
- Modo Electron: Desarrollo, debugging
- Mismo código base, dos modos de ejecución

---

## Desventajas y Consideraciones

### ⚠️ Complejidad de Dos Modos
- Necesidad de recompilar better-sqlite3 al cambiar
- Dos entry points (server.js vs main.js)
- Scripts de switch para automatizar

### ⚠️ Seguridad (Modo Web)
- Servidor web expuesto a la red
- Sin autenticación (cualquiera con acceso puede ver datos)
- Necesita HTTPS para producción en internet

### ⚠️ Limitaciones Web
- Apple Health Sync limitado (requiere Electron para funciones completas)
- Sin notificaciones nativas del sistema
- Sin modo offline (requiere conexión al servidor)

---

## Por Qué No Otras Soluciones

### ❌ Opción: Solo Electron con VNC/RDP
- **Problema**: Experiencia de usuario pobre
- **Problema**: Requiere software adicional
- **Problema**: No es multi-dispositivo real

### ❌ Opción: Backend separado desde cero
- **Problema**: Duplicar 40+ handlers IPC
- **Problema**: Mantener dos codebases
- **Problema**: Alto costo de desarrollo

### ❌ Opción: Migrar a framework web (React/Vue)
- **Problema**: Reescritura completa del frontend
- **Problema**: Perder inversión en código existente
- **Problema**: Curva de aprendizaje

### ❌ Opción: Dos bases de datos separadas
- **Problema**: Necesidad de sincronización manual
- **Problema**: Riesgo de datos inconsistentes
- **Problema**: Scripts adicionales de sync

### ✅ Opción Elegida: Web-First con DB Compartida
- **Ventaja**: Reutiliza 100% del código existente
- **Ventaja**: Cambio incremental, no disruptivo
- **Ventaja**: Mantiene compatibilidad con Electron para DEV
- **Ventaja**: Agrega capacidades web sin perder desktop
- **Ventaja**: Una sola base de datos, sin sincronización

---

## Flujo de Trabajo Recomendado

### Producción (Web - Multi-dispositivo)
```bash
# Iniciar servidor web
npm run switch:web
npm run build:web
npm run start:web

# O con PM2 para producción
pm2 start src/server/start-web.js --name fitos
```

### Desarrollo (Electron - Debugging)
```bash
# Iniciar Electron para debugging
npm run switch:electron
npm run dev
```

### Cambio entre modos
```bash
# De Web a Electron (para debugging)
npm run switch:electron
npm run dev

# De Electron a Web (para producción)
npm run switch:web
npm run build:web
npm run start:web
```

---

## Migración de Datos (Automática)

### Desde versión anterior (Electron-only)
Si tenías datos en `~/.config/personal-pollo/health-data.db`:

```bash
# Copiar datos una sola vez
cp ~/.config/personal-pollo/health-data.db ~/.fitos-data/
cp ~/.config/personal-pollo/health-data.db-wal ~/.fitos-data/ 2>/dev/null || true
cp ~/.config/personal-pollo/health-data.db-shm ~/.fitos-data/ 2>/dev/null || true
```

Después de esto, ambos modos usarán automáticamente `~/.fitos-data/health-data.db`.

---

---

## Optimización Arquitectónica v2 (Jul 2026)

### Bridge Unificado (Single Source of Truth)

Antes de esta optimización, `preload.js` y `web-api.js` se mantenían manualmente, con riesgo de deriva. Ahora:

```
src/shared/api-channels.js   ← Fuente única (170+ canales IPC)
          │
          ├─ scripts/generate-api-bridge.js
          │        ├─ src/preload/preload.js  (Electron: contextBridge)
          │        └─ src/renderer/utils/web-api.js  (Web: fetch)
          │
          └─ tests/unit/api-bridge.test.js  (Drift test)
```

- `api-channels.js` define cada canal con `{channel, method, args}`
- El generador produce ambos bridges automáticamente
- Las secciones manuales (eventos `onNavigate`, `onDataChanged`, `export/import`) se preservan con marcadores `// __MANUAL_START__` / `// __MANUAL_END__`
- El drift test compara generación vs archivos reales

### Handler Architecture (safeHandle)

Los 13 archivos de handlers ahora usan `safeHandle()` en vez de `ipcMain.handle()` raw:

```
src/main/handlers/
├── profile-handlers.js
├── activity-handlers.js
├── dashboard-handlers.js
├── diet-handlers.js
├── energy-handlers.js
├── goals-handlers.js
├── health-handlers.js
├── measurements-handlers.js
├── settings-handlers.js
├── strava-panels-handlers.js
├── training-handlers.js
├── insights-handlers.js
└── strength-insights-handlers.js
```

**Patrón**:
```js
const { safeHandle } = require('../utils/safe-handler');
function register(ipcMain, getDb, getHS, notifyDomain) {
  safeHandle(ipcMain, 'db:getProfile', async () => {
    const db = getDb();
    return db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
  });
}
```

`safeHandle()` envuelve cada handler con try/catch consistente, loggea errores a `console.error`, y devuelve `{ok: false, error: msg}` al frontend.

### Chart Lifecycle Manager

Reemplaza el patrón frágil de `window._*Chart` globales:

```js
// Antes (problemático):
window._weightChart = new Chart(ctx, config);
// ... scan Object.keys(window) para limpiar

// Ahora:
import { createChart, destroyAllCharts } from '../charts/chart-manager.js';
createChart('weight', ctx, config);  // auto-destruye si ya existe
destroyAllCharts();                   // limpia todo
```

Implementado con un `Map<string, Chart>` privado. 20 call sites migrados en 9 archivos.

### Shared Formatters

Centraliza el formateo numérico/de fechas que antes estaba inline en las vistas:

| Función | Uso |
|---|---|
| `formatNumber(n, decimals)` | Números con locale `es-ES` |
| `formatDateShort(str)` | Fecha corta (ej. "15 ene") |
| `formatDateLong(str)` | Fecha larga con día de semana |
| `formatDateRange(a, b)` | Rango de fechas |
| `formatDuration(min)` | Duración legible (ej. "1h 30min") |
| `formatKcal(kcal)` | Kcal formateadas |
| `escapeHtml(str)` | Sanitización de strings |
| `formatValue(val, decimals)` | Valor genérico con decimales |

Reemplaza ~27 inline `toLocaleString`/`toLocaleDateString` esparcidos por activity, dashboard, analytics, measurements, strava-panels, strength-insights-panels y goals.

### Lazy Loading Router

Las 11 vistas se cargan con `import()` dinámico en vez de imports estáticos:

```js
// Antes (app.js, se cargaban todas al inicio):
import { init as initDashboard } from './views/dashboard.js';
import { init as initActivity } from './views/activity.js';
// ...

// Ahora:
const views = {
  dashboard: () => import('./views/dashboard.js'),
  activity: () => import('./views/activity.js'),
  // ... se cargan solo cuando se navega a ellas
};
```

`showView()` es async con guarda de stale-load y try/catch con error state rendering.

### CSS Architecture

```
src/renderer/styles/
├── base.css         ← Reset, variables CSS, tipografía
├── layout.css       ← Sidebar, grid, responsive
├── cards.css        ← Componentes card
├── forms.css        ← Formularios y botones
├── tables.css       ← Tablas
└── utilities.css    ← Utilidades (último en import, mayor especificidad)
```

`main.css` orquesta la importación. Un test de unicidad (`css-uniqueness.test.js`) previene regresión de duplicados.

### Nuevas Utilidades Frontend

```
src/renderer/utils/
├── api-detector.js     ← Detecta Electron vs Web, retorna API correcta
├── web-api.js          ← Bridge web (generado)
├── formatters.js       ← Formateo compartido
├── bmr.js              ← Cálculo de TMB (Mifflin-St Jeor)
├── kpi-derivation.js   ← Cómputos puros de KPIs
├── chart-theme.js      ← Tema de Chart.js desde CSS custom properties
├── chart-manager.js    ← Lifecycle manager de Chart.js
├── sport-icons.js      ← Mapeo sport_type → Lucide icon
├── skeleton.js         ← Componentes de skeleton loading
├── state-card.js       ← Estados loading/empty/error/data
├── safe-call.js        ← Wrapper de llamadas IPC con fallback
├── icons.js            ← SVG icon system (Lucide)
└── locales/es.js       ← Strings en español
```

### Convenciones Nuevas

| Concepto | Convención |
|---|---|
| Handlers IPC | Usar `safeHandle(ipc, channel, handler)` de `src/main/utils/safe-handler.js` |
| Charts | Usar `createChart(id, ctx, config)` de `charts/chart-manager.js` |
| Formateo | Usar `formatNumber`, `formatDateShort` de `utils/formatters.js` |
| Router | Vistas cargadas con `import()` dinámico en `app.js` |
| Canales IPC | `src/shared/api-channels.js` como single source of truth |
| Bridge | `scripts/generate-api-bridge.js` genera preload.js y web-api.js |
| CSS | Cada clase definida una sola vez (test de unicidad) |

---

## Conclusión

La migración de Electron-only a Web-First con DB compartida fue necesaria para:
1. **Resolver el problema de acceso desde Windows host**
2. **Habilitar multi-dispositivo** (móvil, tablet, otra PC)
3. **Mantener la inversión** en código existente
4. **Ofrecer flexibilidad** (Web para producción, Electron para desarrollo)
5. **Simplificar la arquitectura** (una sola base de datos)

La arquitectura Web-First permite:
- ✅ Producción multi-dispositivo con Web
- ✅ Desarrollo y debugging con Electron
- ✅ Reutilización del 100% del código de negocio
- ✅ Base de datos compartida (sin sincronización)
- ✅ Migración incremental sin romper funcionalidad existente

El costo fue:
- ⚠️ Complejidad de mantener dos modos
- ⚠️ Recompilación de módulos nativos al cambiar modo
- ⚠️ Necesidad de scripts de switch

Pero el beneficio supera el costo:
- ✅ Producto más versátil y accesible
- ✅ Mejor experiencia de usuario
- ✅ Preparado para despliegue en servidor
- ✅ Datos compartidos sin sincronización manual
- ✅ Electron disponible para debugging cuando se necesite

La optimización v2 (Jul 2026) añadió:
- ✅ **Mantenibilidad**: Bridge unificado con single source of truth y generación automática
- ✅ **Rendimiento**: Lazy loading reduce JS parseado en startup
- ✅ **Resiliencia**: safeHandle con try/catch automático en todos los handlers IPC
- ✅ **Consistencia**: Formateo centralizado y chart lifecycle manager
- ✅ **Prevención de regresiones**: Tests de deriva, unicidad CSS, y coverage en 40 test files
- ✅ **0 breaking changes**: Sin nuevas dependencias, sin schema changes, sin cambios en lógica de negocio

---

## Resumen Visual

```
ARQUITECTURA COMPLETA (v0.7.0):

src/
├── server/              ← Modo Web (PRODUCCIÓN)
│   ├── server.js        ← Express, puerto 3000
│   ├── api-handlers.js  ← MockIpcMain (reutiliza handlers IPC)
│   ├── start-web.js     ← Entry point producción
│   └── dev-web.js       ← Entry point desarrollo (Vite+Express)
│
├── main/                ← Modo Electron (DESARROLLO) + backend compartido
│   ├── main.js          ← Ventana Electron, menú nativo
│   ├── ipc-handlers.js  ← Deprecado/adelgazado
│   ├── apple-health-import.js  ← Integración HealthSync CLI
│   ├── handlers/        ← 13 archivos, cada uno con register(safeHandle)
│   └── utils/
│       └── safe-handler.js  ← Wrapper try/catch para IPC
│
├── preload/
│   └── preload.js       ← Bridge Electron (generado parcialmente)
│
├── renderer/            ← Frontend SPA
│   ├── app.js           ← Router lazy loading
│   ├── index.html       ← Shell con sidebar
│   ├── views/           ← 11 vistas, cada una exporta init()
│   ├── panels/          ← Sub-vistas Strava/Strength
│   ├── charts/          ← chart-manager.js
│   ├── utils/           ← formatters, icons, api-detector, etc.
│   ├── styles/          ← 6 CSS files + main.css orchestrator
│   └── locales/         ← es.js (todos los strings)
│
├── db/                  ← Capa de datos
│   ├── database.js      ← Schema v5, migraciones
│   ├── seed-data.js     ← 198 foods, 53 exercises, planes, plantillas
│   └── import-export.js ← Backup/restore JSON
│
└── shared/              ← Single source of truth
    └── api-channels.js  ← Manifiesto de 170+ canales IPC

tests/
├── unit/                ← 25+ test files (formatters, chart-manager, kpi-derivation, safe-handler, api-bridge...)
├── smoke/               ← 10+ test files (cada view, strava panels, strength insights)
└── regression/          ← 1 test file (loading flags)

scripts/
├── generate-api-bridge.js  ← Genera preload.js + web-api.js
├── switch-to-web.sh        ← Cambia a modo web
├── switch-to-electron.sh   ← Cambia a modo electron
├── rebuild-for-web.js      ← Recompila better-sqlite3 para Node
├── rebuild-for-electron.js ← Recompila better-sqlite3 para Electron
└── lib/
    └── electron-mock.js    ← Mock compartido para scripts
```

```
ANTES (Electron-only):
┌─────────────────────┐
│  Electron           │
│  ├─ Frontend        │
│  ├─ Backend (IPC)   │
│  └─ DB (aislada)    │
└─────────────────────┘
❌ Solo desktop
❌ Sin acceso remoto
❌ Datos aislados

AHORA (Web-First + Optimizado v2):
┌─────────────────────────────────────────┐
│  Servidor Web (PRODUCCIÓN)              │
│  ├─ Frontend con lazy loading           │
│  ├─ Backend REST con safeHandle         │
│  ├─ Bridge generado desde SSOT          │
│  └─ DB compartida ~/.fitos-data/        │
└─────────────────────────────────────────┘
         ↑
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────────────┐
│Web   │  │Electron       │
│(PROD)│  │(DEV + testing)│
└──────┘  └───────────────┘
✅ Multi-dispositivo
✅ Lazy loading
✅ Formateo consistente
✅ Charts sin memory leak
✅ 0 breaking changes
```
