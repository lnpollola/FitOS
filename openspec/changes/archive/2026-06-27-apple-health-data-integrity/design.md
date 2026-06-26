## Context

Hasta hoy, la vista Actividad exponía dos botones ("Importar desde Apple Health" y "Sincronizar con HealthSync") que el usuario percibía como redundantes. La capa de datos creció sin control de duplicados: el importer original insertaba filas sin tag `healthsync:`, así que el dedup posterior solo aplicaba a filas nuevas. Resultado: 15,547 filas en `sport_activities` cuando el XML solo tiene 1,127 workouts.

A esto se le suma que el binario `~/.healthsync/healthsync` se había corrompido en una instalación previa (quedó un archivo ASCII de 9 bytes con "Not Found") y `getHealthsyncPath()` lo aceptaba ciegamente. `parseHealthsyncXML()` además resolvía la promesa con `true` aunque el parse fallara, siempre que `healthsync.db` existiera — los errores quedaban invisibles.

Necesitamos (a) unificar la UI en una sola acción inteligente, (b) blindar el camino del binario para que no fallen los parseos en silencio, y (c) ofrecer un camino de recuperación cuando el usuario detecta que los datos están mal.

## Goals / Non-Goals

**Goals:**
- UI unificada: un solo botón "Sincronizar Apple Health" con detección automática de qué hacer
- Detección inteligente: si el XML es más nuevo que `healthsync.db`, re-parsea; si no, solo migra
- Validación del binario al inicio: detectar stubs corruptos y caer a `$PATH`
- Errores de parse propagados (no swallowed) para que la UI los muestre
- Acción de "Limpiar y re-sincronizar" para usuarios con datos sucios
- Botón "Refrescar" para re-renderizar sin tocar la DB
- CLI scripts robustos con `--dry-run` / `--json` / `--reparse`
- Promover las invariantes de dedup a una spec dedicada para revisarlas
- Prevenir que los duplicados vuelvan: tests que detecten la regresión

**Non-Goals:**
- Cambiar el schema de `activity_days`, `sport_activities`, `weight_entries`
- Eliminar manualmente las filas duplicadas (la app provee la acción, el usuario decide)
- Soporte de sync incremental por timestamp (no es viable sin timestamps confiables en healthsync)
- Reemplazar el binario `healthsync` por una alternativa (el binario es la fuente de verdad)

## Decisions

### D1 — Un solo botón en la UI en vez de dos separados
**Por qué**: La diferencia entre los dos botones no era evidente para el usuario. La decisión parse-vs-migrate la puede hacer el sistema mirando mtimes.
**Alternativas consideradas**: (a) Mantener los dos botones con labels más claros — descartado, sigue siendo confuso; (b) Detección automática sin indicación — descartado, el usuario quiere saber qué va a pasar; (c) **Elegido**: un botón + indicador del modo en el que va a operar.

### D2 — Detección por mtime (XML vs healthsync.db)
**Por qué**: Si el usuario re-exporta el XML pero no re-parsea, queremos detectar que hay datos nuevos sin re-parsear innecesariamente cuando no hace falta.
**Alternativas**: (a) Re-parsear siempre — descartado, 1-2 min de espera innecesaria; (b) Diff por content hash — más robusto pero overkill; (c) **Elegido**: mtime del XML > mtime del healthsync.db → re-parse. Simple y suficiente.

### D3 — Validación por magic bytes + tamaño, no por invocación
**Por qué**: Ejecutar el binario para validar es caro. Magic bytes (ELF/Mach-O/PE) + tamaño mínimo (1 MB) distingue binarios reales de stubs en O(1).
**Alternativas**: (a) `which healthsync` y listo — no detecta stubs en `~/.healthsync/`; (b) Ejecutar `--version` y parsear stdout — fiable pero 50-200 ms por validación; (c) **Elegido**: heurística cheap con fallback a `PATH` si falla.

### D4 — Auto-eliminar el stub corrupto
**Por qué**: Si `~/.healthsync/healthsync` no es un binario válido, está ocupando el slot del nombre canónico. Borrarlo + reintentar con `$PATH` es el camino más limpio.
**Riesgo**: si el usuario tenía un wrapper legítimo ahí, se borra. Mitigación: solo se borra si el archivo falla `isValidHealthsyncBinary()` (no es ELF/Mach-O/PE o pesa <1 MB).

### D5 — Reset & re-sync como acción explícita, no automática
**Por qué**: Borrar datos es destructivo. El usuario debe confirmarlo (`window.confirm()` en la UI, opt-in en CLI).
**Alternativas**: (a) Reset automático al detectar duplicados — descartado, riesgoso; (b) **Elegido**: acción explícita con `confirm()`.

### D6 — Botón "Refrescar" separado del "Sincronizar"
**Por qué**: A veces el usuario solo quiere ver datos actualizados de la DB (porque cambió algo en otro lado) sin re-sincronizar. Un botón dedicado es más claro que un flag.
**Alternativas**: (a) Auto-refresh en `focus`/`visibilitychange` — útil pero el usuario no lo espera; (b) Un solo botón con menú — más clics; (c) **Elegido**: botón secundario siempre visible.

### D7 — Tag `healthsync:` en `created_at` como invariante
**Por qué**: Es el mecanismo que permite al dedup saber qué filas puede borrar. Promoverlo a spec significa que cualquier cambio futuro tiene que respetarlo.
**Cómo se enforce**: las specs declaran el invariante; el código actual lo cumple; el smoke test verifica que `created_at LIKE 'healthsync:%'` cubre las filas migradas; un test post-migración podría alertar si `COUNT(sport_activities WHERE created_at LIKE 'healthsync:%') > COUNT(DISTINCT date, sport_type WHERE created_at LIKE 'healthsync:%')`.

### D8 — Pre-flight integrity check antes de migrar
**Por qué**: Detectar el estado "sucio" antes de tocar nada, para que el botón reset sea más descubrible.
**Mecanismo**: `getHealthsyncDbInfo()` devuelve `anomalies: { sportDuplicates, weightDuplicates }` y el frontend muestra un banner amarillo cuando hay anomalías (decisión tomada: **banner es la respuesta a Q1**).

### D9 — Parse siempre a staging DB, swap atómico
**Por qué**: Si el binario crashea a mitad del parse, escribir directo a `~/.healthsync/healthsync.db` puede dejarla corrupta. Parsear a `os.tmpdir()/healthsync-staging-<pid>-<ts>.db` y hacer `fs.renameSync()` al final garantiza atomicidad: o la DB real queda intacta (parse falló) o queda completamente nueva (parse OK).
**Alternativas**: (a) Confiar en que el binario sea transaccional — no podemos verificar sin source; (b) Usar SQLite transactions en nuestro código — el binario escribe a SQLite, no nosotros; (c) **Elegido**: staging + atomic rename. Cuesta una copia de archivo extra pero la garantía es total.
**Decisión sobre el FS**: el staging DEBE estar en el mismo filesystem que `~/.healthsync/` (usualmente bajo `$HOME`), sino `rename` no es atómico. `os.tmpdir()` suele cumplir esto en Linux/Mac; en Windows se documenta la limitación.

### D10 — `spawn` en vez de `execFile` para progreso real
**Por qué**: `execFile` solo da acceso a stdout/stderr en el callback (después de que el proceso termina). `spawn` da streams que podemos consumir mientras el binario corre. Eso permite forwardear progreso al renderer en tiempo real.
**Coste**: +5-10 LOC, mismo child_process module. Sin dependencias nuevas.
**Fallback**: si el binario no emite nada parseable con `-v` (o sin flag), el código emite "Parseando XML... (puede tardar 1-2 min)" cada 1s para que el usuario sepa que la app sigue viva.

### D11 — Anomaly detection en `getHealthsyncDbInfo`, banner amarillo
**Por qué**: El usuario tuvo 14k duplicados que contaminaron sus KPIs y no había forma visible de detectarlo. Un check barato (`COUNT(*) > COUNT(DISTINCT ...)`) en cada `getHealthsyncDbInfo` (que ya se llama al cargar la vista) y un banner amarillo descubrible resuelven el problema sin agregar fricción.
**Cuándo desaparece el banner**: cuando `getHealthsyncDbInfo` se vuelve a llamar después de un reset exitoso, devuelve `anomalies: { 0, 0 }` y la UI lo oculta.

## Risks / Trade-offs

- [El usuario tiene duplicados que no se borran al sincronizar] → Banner amarillo aparece apenas abre la vista Actividad. Botón "Limpiar y re-sincronizar" siempre visible como link secundario. Spec `apple-health-data-integrity` lo declara explícitamente.
- [El binario válido se borra por error] → Mitigación: solo se borra si falla magic bytes + tamaño. Binarios reales son siempre > 1 MB.
- [El usuario fuerza re-parse con XML enorme (3 GB) y bloquea la app 1-2 min] → Aceptable y priorizado como **no optimizar** (decisión del usuario: "la velocidad del sync me da igual"). Mitigaciones:
  - Progreso real (D10) — el usuario ve que avanza
  - Mensaje explícito "puede tardar 1-2 min" para setear expectativas
  - Escape hatch: el botón "Limpiar y re-sincronizar" si algo se interrumpe
  - Si en el futuro la espera es inaceptable, queda como tarea deferida: pre-filtrar el XML con SAX
- [Reset borra datos del usuario que no son de healthsync] → Mitigación: el `DELETE` solo afecta las 4 tablas. Los datos manuales en `weight_entries` (con `created_at` que NO empieza con `healthsync:`) también se borrarían — esto es un trade-off explícito. El `confirm()` en la UI y el flag `--no-sync` en CLI lo aclaran.
- [El mtime del XML puede no reflejar cambios reales (touch)] → Aceptable: es la misma heurística que usa `make` y la mayoría de build tools. Si el usuario quiere forzar, tiene el checkbox "Forzar re-parseo del XML".
- [El cache `activity_summary_cache` se borra en reset y queda vacío hasta el sync siguiente] → Mitigación: el `confirm()` avisa; el reset SIEMPRE re-sincroniza después (excepto si pasa `--no-sync`).
- [El rename atómico falla si staging y `~/.healthsync/` están en filesystems distintos] → En Linux/Mac `os.tmpdir()` está en el mismo FS que `$HOME` (típicamente `/tmp` vs `/home/user`). En Windows puede haber casos edge; documentar y caer a `fs.copyFileSync` + `fs.unlinkSync` (no atómico pero funcional).
- [El binario `-v` no emite porcentajes parseables] → Fallback: emisión periódica de "Parseando XML... (puede tardar 1-2 min)" cada 1s. El usuario sabe que la app está viva.
- [El binario crea el archivo de output aún si falla] → El código verifica que la staging DB existe Y está no-vacía antes de hacer el rename. Si está vacía o no existe, se trata como failure y no se toca la DB real.

## Migration Plan

No requiere migración de schema ni deploy. Los pasos son:

1. **Deploy** (push al branch): el nuevo `syncAppleHealth` reemplaza los 2 paths anteriores, el botón unificado reemplaza los 2 botones, el staging atómico protege la DB, el progreso real informa al usuario, el banner hace descubrible el reset.
2. **Validación en producción**: el primer sync del usuario pasa por el código nuevo. Si tiene duplicados históricos, ve el banner apenas abra la vista Actividad.
3. **Rollback**: revert el commit. La spec `apple-health-import` queda en el estado pre-cambio (los 2 botones) — no hay schema change que revertir. La DB `~/.healthsync/healthsync.db` queda como esté (no la tocamos).

**Para los datos**: el usuario que vea el banner amarillo (o cualquier anomalía) hace click en "Limpiar y re-sincronizar". El botón corre reset + sync completo. Si algo se rompe a la mitad del parse, la DB real queda intacta (atomic staging) y puede reintentar.

## Resolved Questions

Las preguntas abiertas del round anterior se resolvieron con las decisiones D8-D11:

- **Q1** (auto-detect de duplicados + banner) → **Resuelto**: D8 + D11 — `getHealthsyncDbInfo` chequea y devuelve `anomalies`; UI muestra banner amarillo con conteo y atajo al reset.
- **Q2** (UNIQUE partial index) → **Resuelto**: deferido. El usuario priorizó confiabilidad + simplicidad sobre defensa-en-profundidad. La spec actual cubre el dedup por tag `healthsync:` (D7) + el reset como recovery. Si en el futuro alguien ve duplicados nuevos a pesar de esto, agregar el partial index.
- **Q3** (mover `healthsync:` tag a columna `source`) → **Resuelto**: deferido. El tag en `created_at` funciona y es simple. Un schema change requiere migración de los 14k+ datos existentes.
- **Q4** (backfill de las 14k filas históricas) → **Resuelto**: el botón "Limpiar y re-sincronizar" ya lo cubre (las 14k filas se borran y se re-migran con el tag correcto).

## Deferred (future work, not in this change)

- **Incremental XML parsing** con SAX pre-filter: si la espera de 1-2 min se vuelve inaceptable, pre-filtrar el XML por rango de fechas reduce el tiempo de parse a ~5-10s. El usuario priorizó simplicidad, así que queda deferido. Tareas:
  1. Watermark en `settings.healthsync_watermark`
  2. Lookback configurable (default 7, max 14 días)
  3. SAX filter simple en Node.js (~50-100 LOC)
  4. Tests de correctness del filtro
- **Partial UNIQUE index** en `sport_activities(date, sport_type) WHERE created_at LIKE 'healthsync:%'` — defensa-en-profundidad contra duplicados a nivel DB.
- **Schema change**: mover el tag `healthsync:` de `created_at` a una columna `source` dedicada.
