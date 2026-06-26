## Why

La sincronización de Apple Health acumulaba datos duplicados en `sport_activities` (14,651 filas obsoletas sobre 15,547 totales) porque las primeras versiones del importer no etiquetaban las filas con `healthsync:` en `created_at`, así que el mecanismo de dedup posterior no podía reemplazarlas. El conteo inflado de sesiones contaminaba el panel y los KPIs. A eso se sumaban dos problemas operativos: (1) el binario `healthsync` se silenciaba cuando fallaba si el DB ya existía, y (2) había dos botones en la UI ("Importar" vs "Sincronizar") cuya diferencia no era evidente.

## What Changes

- **Un solo botón "Sincronizar Apple Health"** que reemplaza los dos anteriores. Detecta automáticamente si `ImportData/exportar.xml` es más nuevo que `~/.healthsync/healthsync.db` y re-parsea solo cuando hace falta.
- **`syncAppleHealth()`** en `src/main/apple-health-import.js` centraliza la decisión parse-vs-migrate en una sola función.
- **Validación del binario `healthsync`**: `isValidHealthsyncBinary()` chequea magic bytes (ELF/Mach-O/PE) y tamaño mínimo (1 MB). Auto-elimina stubs corruptos (p.ej. el archivo "Not Found" de 9 bytes que dejó una instalación fallida) y cae a `$PATH` cuando `~/.healthsync/healthsync` no es ejecutable real.
- **Errores de parse ya no se silencian**: `parseHealthsyncXML()` rechaza con el stderr real en vez de resolver `true` cuando la DB existe.
- **Parseo atómico contra corrupción**: el XML se parsea siempre a una DB de staging en `os.tmpdir()` con `--db`, y solo cuando el parse termina OK se hace un `rename` atómico sobre `~/.healthsync/healthsync.db`. Si el parse crashea o se mata el proceso, la DB real queda intacta.
- **Progreso en tiempo real durante el parse**: el código usa `child_process.spawn` en vez de `execFile` para recibir stdout/stderr del binario y forwardearlos al renderer vía `health-import-progress`. Mínimo 1 mensaje/seg, con fallback a "Parseando XML... (puede tardar 1-2 min)" si el binario no emite nada parseable.
- **Detección de anomalías + banner descubrible**: `getHealthsyncDbInfo` ahora detecta duplicados en `sport_activities` y `weight_entries` (`COUNT(*) > COUNT(DISTINCT ...)`) y devuelve `anomalies`. La UI muestra un banner amarillo arriba del card de sync con conteo y un atajo al "Limpiar y re-sincronizar". El banner desaparece cuando el reset termina.
- **Reset & re-sincronizar** (`resetHealthsyncData()` + `resetAndSyncHealthsync()` + IPC `db:resetAndSyncHealthsync` + CLI `npm run reset:healthsync` + botón con `confirm()` en la UI). Borra `activity_days`, `sport_activities`, `weight_entries`, `activity_summary_cache` en una transacción y re-sincroniza desde cero.
- **Botón "Refrescar"** en la vista Actividad que recarga timeline + chart + last import sin re-sincronizar.
- **CLI robusta**: `scripts/sync-healthsync.js` y `scripts/reset-healthsync.js` con flags `--dry-run`, `--json`, `--no-sync`, `--reparse <path>`. Auto-detectan el XML en `cwd/ImportData`, `~/ImportData`, `~/.healthsync/ImportData`.
- **Slash command** `/sync-healthsync` invoca el CLI sin abrir la app.
- **Tag consistente `healthsync:` en `created_at`** para todas las filas migradas (deportes, pesos) — invariante promovido a spec.
- **Cache incluye `sleep_deep/rem/light`** vía migración idempotente en `database.js:417-429`.

## Capabilities

### New Capabilities
- `apple-health-data-integrity`: invariantes de dedup, validación de binario, reset & re-sync, detección de XML desactualizado,Refresh sin resync, y los controles que previenen la reaparición de duplicados (UNIQUE constraints, pre-flight integrity check, y un check post-migración que alerta si se insertaron más filas de las esperadas).

### Modified Capabilities
- `apple-health-import`: unifica los dos flujos ("Importar XML" + "Sincronizar DB") en una sola acción "Sincronizar Apple Health" con detección automática. Agrega escenarios para el flag `forceReparse` y el botón Reset. La distinción entre "parse + migrate" y "sync only" pasa a ser interna, no de UI.

## Impact

- **Código**: `src/main/apple-health-import.js` (syncAppleHealth + resetHealthsyncData + isValidHealthsyncBinary + parseHealthsyncXML con spawn + atomic staging + anomaly detection), `src/main/handlers/activity-handlers.js` (1 IPC unificado + 1 nuevo de reset), `src/preload/preload.js` (syncAppleHealth + resetAndSyncHealthsync), `src/renderer/views/activity.js` (1 botón sync + 1 refresh + 1 link reset + banner de anomalías), `src/renderer/locales/es.js` (~7 strings nuevas), `src/db/database.js` (migración idempotente sleep stages en cache), `package.json` (scripts sync:healthsync + reset:healthsync).
- **Nuevos scripts**: `scripts/sync-healthsync.js` (con `--dry-run/--json/--reparse`), `scripts/reset-healthsync.js` (con `--no-sync/--json`).
- **Nuevo comando**: `.opencode/commands/sync-healthsync.md`.
- **Cambio en `getHealthsyncDbInfo`**: ahora también devuelve `xmlPath`, `xmlMtime`, `dbMtime`, y `anomalies: { sportDuplicates, weightDuplicates }`. Consumers existentes (UI) deben ignorar campos desconocidos, así que es compatible.
- **Tests**: `tests/smoke/activity.test.js` actualizado al nuevo mock + tests nuevos. 107+ tests pasan; se añaden unit tests para `isValidHealthsyncBinary`, anomaly detection, y atomic staging.
- **No breaking**: los usuarios existentes siguen sincronizando igual. Lo visible:
  - 2 botones → 1 botón sync + 1 botón refresh + 1 link "Limpiar y re-sincronizar"
  - Banner amarillo aparece solo si hay duplicados detectados
  - Progreso más visible durante el parse (antes: silencio; después: mensajes cada 1s)
- **Migración de datos**: usuarios con duplicados históricos ven el banner apenas abren la vista Actividad. La aplicación NO borra nada automáticamente.
