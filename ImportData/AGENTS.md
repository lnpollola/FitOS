# Apple Health Local Pipeline — AGENTS.md

> **Propósito:** Pipeline local que consume `exportar.xml`/`exportar.zip` de Apple Health, lo carga en SQLite via healthsync y expone una API HTTP consultable desde dashboard o agentes AI.
>
> **Lee este archivo completo antes de ejecutar cualquier tarea.**
> **Usa Plan mode (Tab) para revisar antes de aplicar cambios destructivos.**
> **Actualiza el Worklog al finalizar cada fase.**

---

## Contexto del proyecto

- **Archivo fuente:** `exportar.xml` o `exportar.zip` (export español de Apple Health desde iPhone)
- **Herramienta principal:** [`healthsync`](https://github.com/BRO3886/healthsync) — CLI en Go con streaming XML parser (~10MB RAM para archivos de 950MB+), SQLite con dedup automático (`INSERT OR IGNORE`) y servidor HTTP local.
- **Base de datos:** SQLite en `~/.healthsync/healthsync.db`
- **Stack del proyecto:** Node.js / JavaScript, carpeta `src/db/` ya existente con `database.js`, `import-export.js`, `seed-data.js`
- **Objetivo:** Carga inicial + actualizaciones incrementales + API HTTP + integración con código existente en `src/db/`

---

## Arquitectura objetivo

```
exportar.xml / exportar.zip
        │
        ▼
  healthsync parse        ← carga inicial o incremental (idempotente)
        │
        ▼
~/.healthsync/healthsync.db   ← SQLite local, WAL mode, creado automáticamente
        │
   ┌────┴────┐
   │         │
CLI query   HTTP API       ← healthsync server --port 8080
   │         │
   └────┬────┘
        ▼
  src/db/database.js  →  src/db/import-export.js  →  Dashboard / Agente
```

---

## Reglas de ejecución para el agente

- Siempre verificar que el archivo de exportación existe antes de ejecutar parse.
- No crear `healthsync.db` manualmente — healthsync lo crea solo al ejecutar `parse`.
- No modificar `~/.healthsync/healthsync.db` directamente; solo lectura desde el código.
- Al integrar con `src/db/database.js`, usar modo `readonly: true` en better-sqlite3.
- Si un test falla, diagnosticar antes de continuar a la siguiente fase.
- Usar **Plan mode** antes de editar `src/db/database.js`, `import-export.js` o `seed-data.js`.

---

## Fase 0 — Verificación del entorno

**Objetivo:** Confirmar que el entorno tiene las dependencias necesarias.

```bash
# 1. Verificar sistema y arquitectura
uname -sm

# 2. Verificar Go (requerido solo si se compila desde fuente)
go version   # mínimo: go 1.24

# 3. Verificar que el archivo de exportación existe
ls -lh exportar.xml 2>/dev/null || ls -lh exportar.zip 2>/dev/null || echo "ARCHIVO NO ENCONTRADO"

# 4. Verificar si healthsync ya está instalado
healthsync version 2>/dev/null || echo "healthsync no instalado"

# 5. Verificar carpeta del proyecto
ls src/db/
```

**Criterio de éxito:** El archivo de exportación existe y el entorno tiene Go o Homebrew disponible.

---

## Fase 1 — Instalación de healthsync

**Objetivo:** Instalar el binario `healthsync` disponible en PATH.

### Opción A — Script automático (recomendado Linux/WSL2)

```bash
curl -fsSL https://healthsync.sidv.dev/install | bash
healthsync version
```

### Opción B — Homebrew

```bash
brew tap BRO3886/tap && brew install healthsync
healthsync version
```

### Opción C — Go install

```bash
go install github.com/BRO3886/healthsync@latest
export PATH="$PATH:$(go env GOPATH)/bin"
healthsync version
```

### Opción D — Compilar desde fuente

```bash
git clone https://github.com/BRO3886/healthsync.git
cd healthsync && make build
sudo mv bin/healthsync /usr/local/bin/healthsync
healthsync version
```

**Criterio de éxito:** `healthsync version` devuelve versión >= `v0.5.0`.

---

## Fase 2 — Carga inicial del export

**Objetivo:** Parsear `exportar.xml`/`exportar.zip` y crear `~/.healthsync/healthsync.db` con todos los datos.

> ⚠️ El archivo `.db` NO debe crearse manualmente. healthsync lo crea automáticamente en el primer parse.

```bash
# Con .zip (recomendado):
healthsync parse exportar.zip -v

# Con .xml directo:
healthsync parse exportar.xml -v

# Verificar que la DB fue creada:
ls -lh ~/.healthsync/healthsync.db

# Verificar tablas y datos:
healthsync db info
healthsync query steps --limit 10
healthsync query heart-rate --limit 10
healthsync query body-mass --limit 30
healthsync query workouts --limit 5
healthsync query sleep --limit 10
```

**Criterio de éxito:** `~/.healthsync/healthsync.db` existe con tamaño > 0 y al menos 3 queries devuelven datos.

---

## Fase 3 — Integración con src/db/

**Objetivo:** Conectar la DB de healthsync con el código existente en `src/db/`.

### Instalar dependencia

```bash
npm install better-sqlite3
```

### Editar src/db/database.js

```js
import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

const DB_PATH = path.join(os.homedir(), '.healthsync', 'healthsync.db');
export const db = new Database(DB_PATH, { readonly: true });

// Verificar conexión
export function testConnection() {
  const row = db.prepare("SELECT COUNT(*) as total FROM sqlite_master WHERE type='table'").get();
  console.log(`healthsync DB conectada: ${row.total} tablas`);
  return row.total;
}
```

### Editar src/db/import-export.js

Funciones de consulta para las métricas principales:

```js
import { db } from './database.js';

// Peso corporal — últimos N días
export function getBodyMass(limit = 90) {
  return db.prepare(`
    SELECT date(start_date) as date, value, unit
    FROM body_mass ORDER BY start_date DESC LIMIT ?
  `).all(limit);
}

// Pasos diarios
export function getDailySteps(from = '2026-01-01') {
  return db.prepare(`
    SELECT date(start_date) as date, SUM(value) as steps
    FROM steps WHERE start_date >= ?
    GROUP BY date(start_date) ORDER BY date DESC
  `).all(from);
}

// Frecuencia cardíaca media por día
export function getDailyHeartRate(limit = 30) {
  return db.prepare(`
    SELECT date(start_date) as date, ROUND(AVG(value), 1) as avg_bpm
    FROM heart_rate GROUP BY date(start_date)
    ORDER BY date DESC LIMIT ?
  `).all(limit);
}

// Entrenamientos recientes
export function getWorkouts(limit = 20) {
  return db.prepare(`
    SELECT date(start_date) as date, workout_activity_type,
           ROUND(duration/60.0, 1) as minutes,
           ROUND(total_energy_burned, 0) as kcal,
           ROUND(total_distance, 2) as km
    FROM workouts ORDER BY start_date DESC LIMIT ?
  `).all(limit);
}

// Sueño por noche
export function getSleep(limit = 30) {
  return db.prepare(`
    SELECT date(start_date, '-6 hours') as night,
           ROUND(SUM((julianday(end_date) - julianday(start_date)) * 24), 2) as hours
    FROM sleep WHERE value LIKE '%Asleep%'
    GROUP BY night ORDER BY night DESC LIMIT ?
  `).all(limit);
}

// HRV semanal
export function getWeeklyHRV(limit = 12) {
  return db.prepare(`
    SELECT strftime('%Y-W%W', start_date) as week,
           ROUND(AVG(value), 1) as hrv_ms
    FROM hrv GROUP BY week ORDER BY week DESC LIMIT ?
  `).all(limit);
}
```

### Editar src/db/seed-data.js

```js
import { db } from './database.js';

export function seedStats() {
  const tables = ['heart_rate','steps','body_mass','workouts','sleep','hrv'];
  const stats = {};
  for (const table of tables) {
    try {
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      stats[table] = row.count;
    } catch {
      stats[table] = 0;
    }
  }
  console.table(stats);
  return stats;
}
```

**Criterio de éxito:** `testConnection()` devuelve número de tablas > 5; `getBodyMass()` retorna array con objetos.

---

## Fase 4 — Actualización incremental

**Objetivo:** Añadir nuevas mediciones del reloj sin duplicar datos.

### Método A — Re-parse manual (más simple)

```bash
# Exportar desde iPhone: Health app → perfil → Exportar datos de salud
# Copiar el nuevo exportar.zip al servidor local y re-parsear:
healthsync parse exportar_nuevo.zip -v
# healthsync inserta solo los registros nuevos (dedup automático)
```

### Método B — HTTP server + iOS Shortcuts (automatizado)

```bash
# Iniciar servidor de uploads:
healthsync server --port 8080 --host 0.0.0.0
```

Endpoints:
- `POST /api/upload` — sube `.zip`/`.xml` (multipart, campo `file`). Devuelve `202 Accepted`.
- `GET /api/upload/status` — estado del parseo (`pending` / `processing` / `done`).
- `GET /api/health/{table}?from=&to=&limit=` — query JSON de cualquier tabla.

```bash
# Test de upload:
curl -F "file=@exportar.zip" http://localhost:8080/api/upload
curl http://localhost:8080/api/upload/status
curl "http://localhost:8080/api/health/body-mass?limit=5"
```

### Atajo de iOS para sync automático

1. Abrir app **Atajos** en iPhone.
2. Nuevo atajo → Acción **Exportar datos de salud** → guardar como archivo.
3. Acción **Obtener contenido de URL**:
   - URL: `http://<IP_LOCAL>:8080/api/upload` (o dirección Tailscale)
   - Método: POST, cuerpo Multipart → campo `file` = archivo del paso anterior.
4. Añadir el atajo a la pantalla de inicio para ejecutarlo tras cada sesión de entrenamiento.

---

## Fase 5 — Servidor persistente con PM2

**Objetivo:** Mantener el HTTP server de healthsync siempre activo.

```bash
# Registrar en PM2:
pm2 start "healthsync server --port 8080 --host 0.0.0.0" --name healthsync-server
pm2 save
pm2 startup

# Verificar:
pm2 status healthsync-server
curl http://localhost:8080/api/health/steps?limit=1
```

**Criterio de éxito:** Tras reiniciar el sistema, `curl http://localhost:8080/api/health/steps?limit=1` devuelve JSON válido.

---

## Fase 6 — Pruebas completas

**Objetivo:** Validar pipeline de extremo a extremo.

### Test 1 — Integridad de tablas

```bash
healthsync query steps --limit 5
healthsync query heart-rate --limit 5
healthsync query body-mass --limit 5
healthsync query sleep --limit 5
healthsync query workouts --limit 5
healthsync query hrv --limit 5
```

**Criterio:** Cada query devuelve al menos 1 fila.

### Test 2 — Idempotencia (sin duplicados)

```bash
# Contar antes:
sqlite3 ~/.healthsync/healthsync.db "SELECT COUNT(*) FROM steps;"
# Re-parsear el mismo archivo:
healthsync parse exportar.zip
# Contar después (debe ser idéntico):
sqlite3 ~/.healthsync/healthsync.db "SELECT COUNT(*) FROM steps;"
```

### Test 3 — Funciones src/db/

```bash
node -e "
import('./src/db/database.js').then(({ testConnection }) => testConnection());
"

node -e "
import('./src/db/import-export.js').then(({ getBodyMass }) => {
  const data = getBodyMass(5);
  console.log('body_mass OK:', data.length, 'registros');
  console.table(data);
});
"
```

### Test 4 — API HTTP

```bash
curl -s "http://localhost:8080/api/health/body-mass?limit=3" | python3 -m json.tool
curl -s "http://localhost:8080/api/health/steps?from=2026-01-01" | python3 -m json.tool
```

### Test 5 — SQL directa

```bash
sqlite3 ~/.healthsync/healthsync.db ".tables"
sqlite3 ~/.healthsync/healthsync.db "SELECT date(start_date), value FROM body_mass ORDER BY start_date DESC LIMIT 10;"
```

---

## Tablas SQLite disponibles

| Tabla | Métrica | Notas |
|---|---|---|
| `heart_rate` | Frecuencia cardíaca | BPM |
| `resting_heart_rate` | FC en reposo diaria | BPM |
| `hrv` | Variabilidad cardíaca | ms (SDNN) |
| `spo2` | Saturación de oxígeno | fracción 0-1 |
| `vo2_max` | VO2 máximo | mL/min·kg |
| `steps` | Pasos | `--total` soportado |
| `active_energy` | Calorías activas | kcal |
| `basal_energy` | Calorías basales | kcal |
| `workouts` | Entrenamientos | duración, distancia, energía |
| `body_mass` | Peso corporal | kg/lb |
| `body_mass_index` | IMC | — |
| `sleep` | Análisis de sueño | fases de sueño |
| `distance_walking_running` | Distancia caminada/corrida | km |
| `distance_cycling` | Distancia en bici | km |
| `exercise_time` | Tiempo de ejercicio | minutos |
| `blood_pressure` | Tensión arterial | sistólica/diastólica mmHg |
| `wrist_temperature` | Temperatura de muñeca (sueño) | desviación °C |

---

## Troubleshooting

| Problema | Causa probable | Solución |
|---|---|---|
| `ARCHIVO NO ENCONTRADO` | El export no está en el directorio actual | Mover `exportar.xml`/`.zip` al directorio de trabajo |
| `.db` no creado tras parse | Error durante el parse | Revisar output del parse; asegurarse de que el XML es válido |
| Tablas vacías tras parse | El XML no contiene ese tipo de métrica | Ejecutar con `-v` para ver qué tipos encontró |
| Pasos duplicados / valores irreales | Datos de varias fuentes sin dedup | Usar `--total` que aplica dedup por prioridad Watch > iPhone |
| `Cannot find module 'better-sqlite3'` | Dependencia no instalada | `npm install better-sqlite3` |
| `SQLITE_READONLY` en queries de escritura | `readonly: true` en database.js | Correcto por diseño; no escribir en la DB de healthsync |
| Puerto 8080 ocupado | Otro proceso usa el puerto | `healthsync server --port 9090` |
| `409 Conflict` en `/api/upload` | Parse ya en curso | Esperar y consultar `/api/upload/status` |

---

## Worklog

```
FASE 0 — Verificación del entorno
  Estado: [x] COMPLETADO
  Archivo encontrado: exportar.zip (185MB) y exportar.xml (2.8GB) en apple-healt-export/
  healthsync instalado: v0.5.2 (preinstalado)

FASE 1 — Instalación de healthsync
  Estado: [x] COMPLETADO (ya instalado)
  Opción usada: N/A — ya presente v0.5.2
  Versión instalada: v0.5.2

FASE 2 — Carga inicial
  Estado: [x] COMPLETADO
  Archivo parseado: apple-healt-export/exportar.zip (185MB, 3m30s)
  Tablas con datos: 38 tablas, ~5M registros
  Tamaño DB: 1.1 GB

FASE 3 — Integración src/db/
  Estado: [x] COMPLETADO
  database.js:       [x] OK — initHealthsyncDb(), getHealthsyncDb(), testHealthsyncConnection()
  import-export.js:  [x] OK — getBodyMass, getDailySteps, getDailyHeartRate, getWorkouts, getSleep, getWeeklyHRV
  seed-data.js:      [x] OK — seedStats()

FASE 4 — Actualización incremental
  Estado: [x] COMPLETADO
  Método elegido: [x] HTTP server (healthsync server con PM2)
  Upload endpoint: POST http://localhost:8080/api/upload (multipart field "file")

FASE 5 — PM2 persistente
  Estado: [x] COMPLETADO (sin startup automático)
  Servicio: healthsync-server (PM2, fork mode)
  Control: pm2 start/stop/restart/status healthsync-server

FASE 6 — Pruebas completas
  Test 1 (integridad tablas): [x] OK
  Test 2 (idempotencia):      [x] OK
  Test 3 (funciones src/db):  [x] OK
  Test 4 (API HTTP):          [x] OK
  Test 5 (SQL directa):       [x] OK
```

---

## Referencias

- Repositorio healthsync: https://github.com/BRO3886/healthsync
- CLAUDE.md del repo (schema técnico): https://github.com/BRO3886/healthsync/blob/main/CLAUDE.md
- OpenCode docs: https://opencode.ai/docs
- better-sqlite3: https://github.com/WiseLibs/better-sqlite3
