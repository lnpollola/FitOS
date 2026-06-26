---
description: Sincroniza todos los datos de Apple Health desde healthsync.db a la app local (migración + cache + timestamp)
---

Sincroniza los datos de Apple Health ya parseados por HealthSync (`~/.healthsync/healthsync.db`) con la base de datos local de FitOS. Equivalente a pulsar el botón **"Sincronizar con HealthSync"** en la vista Actividad.

**Qué hace** (en una sola pasada, vía `fullSync()`):

1. **Verifica** que `~/.healthsync/healthsync.db` existe y reporta su timestamp + conteos por tabla
2. **Migra** los datos al schema local:
   - `activity_days` (pasos, kcal activas/reposo, FC media) — UPSERT idempotente
   - `activity_days` (sueño total + etapas Deep/REM/Light) — UPSERT idempotente con skip cuando no hay cambios
   - `sport_activities` — agregado por (fecha, tipo) y etiquetado con `healthsync:*` para reemplazo limpio
   - `weight_entries` — etiquetado con `healthsync:*` para reemplazo limpio
3. **Refresca el cache** `activity_summary_cache` (7d, 15d, 30d) — popula todas las columnas incluyendo `sleep_deep/rem/light`
4. **Guarda el timestamp** en `settings.health_last_import`

**Uso** (desde la raíz del proyecto):

```bash
/sync-healthsync               # Ejecuta la sincronización completa
/sync-healthsync --dry-run     # Solo muestra el estado actual sin escribir
/sync-healthsync --json        # Salida en JSON (además del log)
```

**Lo que debes saber antes de invocarlo**:

- Requiere que el binario `healthsync` esté instalado y `~/.healthsync/healthsync.db` exista
- Si el DB no existe, el script sale con error claro apuntando a `healthsync parse <export.zip>`
- Si Apple Health tiene datos nuevos sin parsear, primero ejecuta `healthsync parse ImportData/exportar.xml` (toma ~1-2 min para 3 GB)
- La migración es **idempotente** — re-ejecutar no duplica workouts ni pesos (usa `healthsync:*` tag en `created_at`)
- La operación toma ~5-10s con WAL habilitado
- Si quieres re-parsear desde el XML original, usa `/sync-healthsync --reparse <path>`

**Salida esperada**:

```
=== Pre-sync state ===
App DB: /home/lnpollola/.config/personal-pollo/health-data.db
Healthsync DB: /home/lnpollola/.healthsync/healthsync.db (1037 MB, modified ...)
Healthsync table counts:
  steps: 214,739
  active_energy: 678,574
  ...

App tables before:
  activity_days: 3096 (nights with sleep: 1993 | deep: 1190 | REM: 1231 | light: 1255)
  sport_activities: 15545
  ...

=== Sync result ===
ok: true
Migration: created=11248 skipped=1993 errors=0
Cache (activity_summary_cache):
  7d: 2 rows (2026-06-17 → 2026-06-18)
  15d: 10 rows (2026-06-09 → 2026-06-18)
  30d: 25 rows (2026-05-25 → 2026-06-18)
Timestamp saved: true

=== Post-sync state ===
  activity_days: 3096 (...)
  sport_activities: 15545
  ...
```

**Implementación** — usa exactamente la misma ruta que el botón UI:
- `src/main/apple-health-import.js` → `fullSync(mainWindow)`
- Ejecuta vía `npx electron scripts/sync-healthsync.js` (necesario para `better-sqlite3` nativo compilado para Node de Electron)
- Ver también: `npm run sync:healthsync`

**Reporta** al final:
- Conteos antes/después por tabla
- Delta de filas agregadas/modificadas
- Conteos de noches con cada etapa de sueño (Deep/REM/Light)
- Estado del cache por período
- Errores (si los hay)
