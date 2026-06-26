# Apple Health Data Integrity

## Purpose

Garantizar que los datos importados desde Apple Health sean **idempotentes, deduplicados, y recuperables**. Define los invariantes que el importer debe cumplir para que la UI muestre siempre la cantidad correcta de sesiones, entrenamientos, y pesos — y el camino para que el usuario se recupere si los datos quedan en mal estado (p.ej. por un binario corrupto, una migración parcial, o un import que se interrumpió).

## Requirements

### Requirement: HealthSync binary is validated before use

The system SHALL validate that the `healthsync` binary at `~/.healthsync/healthsync` (or `%USERPROFILE%\.healthsync\healthsync.exe` on Windows) is a real executable before invoking it. The validation SHALL check file size (≥ 1 MB) and magic bytes (ELF `7f 45 4c 46`, PE `4d 5a`, Mach-O `ce fa ed fe` / `fe ed fa ce` / `fe ed fa cf` / `ca fe ba be`).

#### Scenario: Valid binary in ~/.healthsync/
- **WHEN** `isValidHealthsyncBinary('~/.healthsync/healthsync')` returns true
- **THEN** the system SHALL use that path as the binary

#### Scenario: Stub file in ~/.healthsync/ (e.g. "Not Found" from failed install)
- **WHEN** the file at `~/.healthsync/healthsync` exists but is not a valid binary (size < 1 MB or wrong magic bytes)
- **THEN** the system SHALL delete the stub file
- **THEN** the system SHALL fall back to `which healthsync` on `$PATH`
- **THEN** if `$PATH` has a valid binary, the system SHALL use it
- **THEN** if neither location has a valid binary, the system SHALL return `null` so the UI can show "Instalar HealthSync"

#### Scenario: Binary only in $PATH
- **WHEN** `~/.healthsync/healthsync` does not exist
- **THEN** the system SHALL fall back to `which healthsync` and use the PATH result

### Requirement: Parse errors are not silently swallowed

The system SHALL reject the `parseHealthsyncXML` promise with the binary's stderr when the child process exits with a non-zero code, regardless of whether `healthsync.db` already exists. The system SHALL also reject when the binary completes successfully but `healthsync.db` is not created.

#### Scenario: healthsync binary fails
- **WHEN** the `healthsync parse` child process exits with a non-zero code
- **THEN** `parseHealthsyncXML` SHALL reject with an error containing the binary's stderr
- **THEN** `syncAppleHealth` SHALL propagate the error to the UI instead of reporting `ok: true`

#### Scenario: Binary exits 0 but DB not created
- **WHEN** the binary completes without error
- **THEN** `parseHealthsyncXML` SHALL verify `~/.healthsync/healthsync.db` exists
- **THEN** if the DB is missing, the promise SHALL reject

### Requirement: Auto re-parse when source XML is newer

The system SHALL detect when `ImportData/exportar.xml` is newer than `~/.healthsync/healthsync.db` and re-parse the XML before migrating. This avoids forcing the user to manually re-run `healthsync parse` after replacing the XML.

#### Scenario: XML mtime > healthsync.db mtime
- **WHEN** the user clicks "Sincronizar Apple Health"
- **AND** the XML file at `ImportData/exportar.xml` has a more recent mtime than `~/.healthsync/healthsync.db`
- **THEN** the system SHALL run `healthsync parse <xmlPath>` first
- **THEN** on successful parse, the system SHALL run the migration
- **THEN** the action reported to the UI SHALL be `parse-and-sync`

#### Scenario: XML mtime ≤ healthsync.db mtime
- **WHEN** the XML mtime is older than or equal to the DB mtime
- **THEN** the system SHALL skip the parse and run only the migration
- **THEN** the action reported to the UI SHALL be `sync-only`

#### Scenario: XML missing but healthsync.db exists
- **WHEN** the XML is not found in any of the standard locations (cwd/ImportData, ~/ImportData, ~/.healthsync/ImportData)
- **AND** `~/.healthsync/healthsync.db` exists
- **THEN** the system SHALL run only the migration (no parse)

#### Scenario: Force re-parse option
- **WHEN** the user enables the "Forzar re-parseo del XML" checkbox
- **THEN** the system SHALL re-run `healthsync parse` even if the XML mtime is older than the DB mtime

### Requirement: Migration is idempotent via source tag

The system SHALL tag every row inserted from a healthsync source with a `healthsync:` prefix in `created_at`. This invariant allows the dedup logic to identify and replace only the rows it owns, leaving manual entries untouched.

#### Scenario: sport_activities dedup
- **WHEN** the migration re-runs for the same date and `sport_type`
- **THEN** the system SHALL DELETE existing rows WHERE `created_at LIKE 'healthsync:%'`
- **THEN** the system SHALL INSERT exactly one new row with `created_at = 'healthsync:<activity_type>:<session_count>s'`
- **THEN** the total count of `sport_activities` rows for that (date, sport_type) SHALL be exactly 1 after migration

#### Scenario: weight_entries dedup
- **WHEN** the migration processes a `body_mass` record for date D
- **THEN** the system SHALL DELETE existing `weight_entries` rows for D WHERE `created_at LIKE 'healthsync:%'`
- **THEN** the system SHALL INSERT one new row with `created_at = 'healthsync:<source>'`

#### Scenario: Manual entries are preserved
- **WHEN** a `weight_entries` row exists with `created_at` that does NOT start with `healthsync:`
- **THEN** the migration SHALL NOT delete or modify that row
- **THEN** the migration SHALL only touch rows with `created_at LIKE 'healthsync:%'`

### Requirement: Pre-flight duplicate detection

The system SHALL expose a way to detect duplicate rows in `sport_activities` (rows beyond the expected 1 per date+sport_type) so the UI can warn the user and offer a cleanup action.

#### Scenario: Duplicates detected
- **WHEN** the activity view loads
- **AND** `COUNT(*) FROM sport_activities` is greater than `COUNT(DISTINCT date || sport_type) FROM sport_activities`
- **THEN** the system SHALL surface this state to the UI
- **THEN** the UI SHALL make the "Limpiar y re-sincronizar" action more discoverable

### Requirement: Reset & re-sync cleans all healthsync-populated tables

The system SHALL provide a single action that deletes data from `activity_days`, `sport_activities`, `weight_entries`, and `activity_summary_cache` in one transaction, then runs the full sync. This is the recovery path for users with duplicate or corrupted data.

#### Scenario: Reset deletes in a transaction
- **WHEN** the user triggers "Limpiar y re-sincronizar" (UI confirm or `--reset` CLI flag)
- **THEN** the system SHALL `DELETE FROM` all four tables inside a single `db.transaction()`
- **THEN** if the transaction fails, NONE of the deletes SHALL persist

#### Scenario: Reset reports before/after counts
- **WHEN** the reset completes
- **THEN** the result SHALL include `before`, `after`, and `deleted` counts for each table

#### Scenario: Reset triggers full sync
- **WHEN** the reset completes successfully
- **THEN** the system SHALL immediately run `syncAppleHealth()` to repopulate from `healthsync.db`
- **THEN** the combined result (reset + sync) SHALL be returned to the caller

#### Scenario: CLI --no-sync skips the repopulate
- **WHEN** the user runs `npm run reset:healthsync -- --no-sync`
- **THEN** the reset SHALL execute
- **THEN** the sync SHALL NOT run
- **THEN** the user SHALL see a message instructing them to run `npm run sync:healthsync` next

### Requirement: Refresh reloads UI without touching the database

The system SHALL provide a "Refrescar" action that re-runs the activity timeline and chart loaders, and re-fetches `getHealthsyncDbInfo` and `getLastImportTimestamp`, without calling `syncAppleHealth` or `migrateHealthData`. This is useful when the user knows the DB changed externally (e.g., a manual CLI run).

#### Scenario: Refresh button on activity view
- **WHEN** the user clicks "Refrescar"
- **THEN** the system SHALL set the button to disabled and show "Actualizando..."
- **THEN** the system SHALL re-run `loadSourceInfo()`, `loadLastImport()`, `loadTimeline()`, `loadChart()` in parallel
- **THEN** on completion, the button SHALL be re-enabled and the label SHALL reset

#### Scenario: Refresh does not migrate
- **WHEN** the user clicks "Refrescar"
- **THEN** the system SHALL NOT call `syncAppleHealth` or any migration routine
- **THEN** the database SHALL NOT be modified

### Requirement: Parse is atomic against healthsync.db corruption

The system SHALL parse the Apple Health export to a **staging database** at a temporary path, then atomically swap it with `~/.healthsync/healthsync.db` only after a successful parse. This ensures that a parse crash, OOM kill, or process abort cannot leave the real `healthsync.db` in a partial or corrupted state.

#### Scenario: Successful parse swaps the DB
- **WHEN** `healthsync parse <xml> --db <stagingPath>` exits with code 0
- **AND** the staging DB exists and is non-empty
- **THEN** the system SHALL atomically rename `<stagingPath>` to `~/.healthsync/healthsync.db`
- **THEN** the old `healthsync.db` SHALL be replaced as a single filesystem operation

#### Scenario: Parse failure preserves the old DB
- **WHEN** `healthsync parse` exits with non-zero code
- **OR** the staging DB is missing or empty after the parse
- **THEN** the system SHALL NOT modify `~/.healthsync/healthsync.db`
- **THEN** the system SHALL reject the promise with the error
- **THEN** the system SHALL delete the staging DB (if it exists)
- **THEN** `syncAppleHealth` SHALL return `ok: false` with the error in the `errors` array

#### Scenario: Staging DB is in OS temp dir
- **WHEN** the system creates the staging path
- **THEN** the path SHALL be under `os.tmpdir()`
- **THEN** the filename SHALL include `process.pid` and a timestamp to avoid collisions across concurrent parses
- **THEN** the path SHALL be on the same filesystem as `~/.healthsync/` so the rename is atomic

### Requirement: Real-time progress during the parse

The system SHALL forward progress information from the `healthsync parse` process to the renderer in real time, so the user sees that the operation is advancing during the 1-2 minute wait. The implementation SHALL use `child_process.spawn` (not `execFile`) to get streaming stdout/stderr.

#### Scenario: Progress messages during parse
- **WHEN** `syncAppleHealth` runs the parse step
- **THEN** the system SHALL emit at least one progress message per second via the `health-import-progress` IPC channel
- **THEN** the messages SHALL be human-readable Spanish strings ("Parseando XML...", "Parseando XML: paso X", etc.)
- **THEN** the renderer SHALL show these in the existing progress bar

#### Scenario: Progress falls back to indeterminate if binary emits nothing
- **WHEN** the binary does not emit parseable progress information (e.g., no `-v` flag, no percentage output)
- **THEN** the system SHALL still emit periodic progress messages (e.g., every 1s) so the user sees the operation is alive
- **THEN** the message SHALL indicate the wait may take 1-2 minutes

#### Scenario: No progress after parse finishes
- **WHEN** the parse completes (success or failure)
- **THEN** the system SHALL stop emitting parse-progress messages
- **THEN** the next progress message SHALL be the migration step ("Migrando datos a la app...") or the error display

### Requirement: Anomaly detection makes Reset discoverable

The system SHALL detect known data anomalies (duplicates in `sport_activities` or `weight_entries`) and surface them in the UI as a discoverable banner that links directly to the "Limpiar y re-sincronizar" action. This replaces the need for the user to discover the reset button by accident.

#### Scenario: Duplicate detection in sport_activities
- **WHEN** the Activity view loads
- **AND** `COUNT(*) FROM sport_activities` is greater than `COUNT(DISTINCT date || '|' || sport_type) FROM sport_activities`
- **THEN** `getHealthsyncDbInfo` SHALL return `anomalies: { sportDuplicates: N }` with `N > 0`
- **THEN** the UI SHALL show a yellow banner above the sync card: "Tus datos tienen N sesiones duplicadas. [Limpiar y re-sincronizar]"
- **THEN** clicking the banner SHALL trigger the same flow as the "Limpiar y re-sincronizar" button

#### Scenario: Weight duplicate detection
- **WHEN** `COUNT(*) FROM weight_entries` is greater than `COUNT(DISTINCT date) FROM weight_entries`
- **THEN** `getHealthsyncDbInfo` SHALL return `anomalies: { weightDuplicates: M }` with `M > 0`
- **THEN** the UI SHALL include `M` in the same banner (or a separate one)

#### Scenario: No anomaly
- **WHEN** no duplicates exist in either table
- **THEN** the banner SHALL NOT be shown
- **THEN** the "Limpiar y re-sincronizar" link SHALL still be available below the checkbox, but less prominently

#### Scenario: Anomaly count updates after reset
- **WHEN** the user clicks "Limpiar y re-sincronizar" and the reset + sync completes
- **THEN** the next `getHealthsyncDbInfo` call SHALL return `anomalies: { sportDuplicates: 0, weightDuplicates: 0 }`
- **THEN** the banner SHALL disappear
