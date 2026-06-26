# Apple Health Import

## Purpose

Import Apple Health XML/ZIP export data into the local FitOS database using the HealthSync CLI (BRO3886/healthsync) to populate activity, workout, weight, and sleep records. The system supports two flows: (1) full re-import from a fresh Apple Health export, and (2) incremental sync from an already-parsed `~/.healthsync/healthsync.db` produced by a previous `healthsync parse` run.

## Requirements

### Requirement: Install HealthSync CLI

The system SHALL install the HealthSync Go CLI binary from the official `BRO3886/healthsync` GitHub releases. The install path SHALL default to `~/.healthsync/healthsync` (or `%USERPROFILE%\.healthsync\healthsync.exe` on Windows). The system SHALL provide a one-click "Instalar HealthSync" action in the Activity view that runs the official install script (`curl -fsSL https://healthsync.sidv.dev/install | bash`) when the binary is not detected.

#### Scenario: Binary detection on startup
- **WHEN** the Activity view loads
- **THEN** the system SHALL check for the HealthSync binary in `~/.healthsync/` and on `$PATH`
- **THEN** the "Instalar HealthSync" button SHALL be visible only when the binary is not found

#### Scenario: One-click install
- **WHEN** the user clicks "Instalar HealthSync"
- **THEN** the system SHALL execute the official install script
- **THEN** on success, the "Sincronizar con HealthSync" button SHALL become enabled
- **THEN** on failure, the system SHALL show an error message

### Requirement: HealthSync to app schema mapping

The system SHALL map HealthSync tables to the application's existing schema via an idempotent UPSERT migration:

| HealthSync table | App table / columns | Aggregation |
|---|---|---|
| `steps` | `activity_days.steps` | SUM(value) by date |
| `active_energy` | `activity_days.active_calories` | SUM(value) by date |
| `basal_energy` | `activity_days.resting_calories` | SUM(value) by date |
| `heart_rate` | `activity_days.heart_rate_avg` | AVG(value) by date |
| `sleep` (total) | `activity_days.sleep_hours` | SUM(duration) where value LIKE '%Asleep%' by night (date shifted -6h) |
| `sleep` (stages) | `activity_days.sleep_deep / sleep_rem / sleep_light` | SUM(duration) for `AsleepDeep` / `AsleepREM` / `AsleepCore` by night |
| `body_mass` | `weight_entries.weight_kg` | individual records (unit='kg' only) |
| `workouts` | `sport_activities` | aggregated by (date, sport_type) — idem, not per-workout |

#### Scenario: Sleep stages enriched from healthsync
- **WHEN** a night has healthsync `sleep` records with `AsleepDeep`, `AsleepREM`, and `AsleepCore` values
- **THEN** the system SHALL aggregate each stage duration and write to `activity_days.sleep_deep`, `activity_days.sleep_rem`, and `activity_days.sleep_light`
- **THEN** `sleep_hours` SHALL equal the sum of all four Asleep* stages (Deep + REM + Core + Unspecified)
- **THEN** the night date SHALL be computed as `date(start_date, '-6 hours')` so a sleep starting at 23:00 on day N is attributed to night N

#### Scenario: Sleep stage categories not used as sleep
- **WHEN** healthsync reports `InBed` or `Awake` values
- **THEN** the system SHALL NOT count those durations in `sleep_hours` or any stage column

#### Scenario: Sleep sync is idempotent per night
- **WHEN** the same healthsync night is re-imported
- **THEN** the system SHALL skip the UPSERT if all four sleep values are identical to the existing row
- **THEN** the `skipped` counter SHALL increment

#### Scenario: Workout activity_type mapped to sport_type
- **WHEN** a Workout record has `activity_type = "HKWorkoutActivityTypeCycling"`
- **THEN** the system SHALL map it to sport type "cycling" and aggregate it (with other workouts of the same day+sport) into a single `sport_activities` row

#### Scenario: Unknown activity_type fallback
- **WHEN** a Workout record has an `activity_type` not in the mapping table
- **THEN** the system SHALL insert it with sport_type "other" and log the original type for review

#### Scenario: Workouts are aggregated by (date, sport_type)
- **WHEN** healthsync has multiple Workout records for the same date and `activity_type` (e.g., two cycling sessions in one day)
- **THEN** the system SHALL aggregate them into a single `sport_activities` row with `calories = SUM(kcal)` and `duration_minutes = SUM(duration)`
- **THEN** the `created_at` column SHALL be tagged with `healthsync:<activity_type>:<session_count>s` to allow re-sync to replace cleanly

#### Scenario: Weight entries from healthsync are replaceable
- **WHEN** a `body_mass` record is migrated
- **THEN** the system SHALL DELETE any existing `weight_entries` row for the same date with `created_at LIKE 'healthsync:%'` first
- **THEN** the system SHALL INSERT the new weight with `created_at = 'healthsync:<source>'`
- **THEN** manual weight entries (without the `healthsync:` prefix) SHALL be preserved

### Requirement: Full import flow from XML/ZIP

The system SHALL support importing activity data from a fresh Apple Health export file (`exportar.xml` or `.zip`) using the HealthSync CLI's `parse` subcommand, then migrate the parsed data into the app's local database.

#### Scenario: XML import triggers parse + migrate
- **WHEN** a user clicks "Importar desde Apple Health"
- **THEN** the system SHALL execute `healthsync parse <xmlPath>` via child_process
- **THEN** on successful parse, the system SHALL run the migration to copy data from `~/.healthsync/healthsync.db` into `activity_days`, `sport_activities`, and `weight_entries`
- **THEN** the system SHALL record the import timestamp in `settings` (`health_last_import`)

#### Scenario: Progress displayed during migration
- **WHEN** the migration runs
- **THEN** the system SHALL display progress messages ("Importando pasos...", "Importando calorías activas...", etc.) via the `health-import-progress` IPC channel

#### Scenario: Duplicate records handled via UPSERT
- **WHEN** a migrated record matches an existing record by date and type
- **THEN** the system SHALL upsert (overwrite with the new value) since aggregation is deterministic
- **THEN** the system SHALL report the count of inserted/updated records as `created`

### Requirement: Incremental sync from existing HealthSync DB

The system SHALL support a "Sincronizar con HealthSync" action that runs the **full sync pipeline** (`fullSync()`):

1. Verify `~/.healthsync/healthsync.db` exists
2. Run the migration routine (UPSERT into `activity_days`, `sport_activities`, `weight_entries`)
3. Refresh derived caches (`activity_summary_cache` for 7d/15d/30d periods)
4. Save the sync timestamp in `settings` (`health_last_import`)

This allows users to run `healthsync parse` externally (e.g., via a script or scheduled task) and then sync the latest parsed data into the app with one click. The full pipeline runs in a single Electron process invocation, atomic per row group via `db.transaction()`.

#### Scenario: Sync from existing DB
- **WHEN** a user clicks "Sincronizar con HealthSync"
- **THEN** the system SHALL run `fullSync()` which performs migration + cache refresh + timestamp save
- **THEN** the system SHALL report the result (`created`, `skipped`, `errors`, `cache` state) to the UI
- **THEN** the dashboard views SHALL reflect the new data on next load

#### Scenario: Sync disabled when healthsync.db missing
- **WHEN** `~/.healthsync/healthsync.db` does not exist
- **THEN** the "Sincronizar con HealthSync" button SHALL be disabled
- **THEN** a message SHALL indicate the user must run `healthsync parse <export.zip>` first

#### Scenario: HealthSync DB info displayed
- **WHEN** the Activity view loads
- **THEN** the system SHALL show the healthsync.db last-modified timestamp and per-table record counts
- **THEN** the user SHALL see how fresh the source data is before syncing

#### Scenario: Cache refresh populates sleep stage columns
- **WHEN** the cache is refreshed after migration
- **THEN** the `activity_summary_cache` table SHALL have `sleep_deep`, `sleep_rem`, and `sleep_light` columns populated for each day
- **THEN** the cache SHALL be repopulated for 7d, 15d, and 30d periods

### Requirement: Future data entry via frontend

After the one-time historical import, the system SHALL provide a frontend form for manually adding new daily metrics, sport activities, and weight entries.

#### Scenario: Manual entry for new data
- **WHEN** a user has new health data after the historical import
- **THEN** the system SHALL allow adding individual records via the existing manual entry forms

### Requirement: Read-only access to HealthSync DB

The system SHALL open `~/.healthsync/healthsync.db` in read-only mode when querying it directly (for live analytics in the dashboard, health view, etc.), and SHALL only open it in read-write mode in the `migrateHealthData` flow (which writes to the app's local DB, not to healthsync.db). The system SHALL never INSERT, UPDATE, DELETE, DROP, or ALTER the healthsync.db — it is owned and managed by the HealthSync CLI.

#### Scenario: Direct healthsync.db queries are read-only
- **WHEN** the app queries `~/.healthsync/healthsync.db` for analytics
- **THEN** the connection SHALL be opened with `{ readonly: true }`
- **THEN** no write operations SHALL be issued against the healthsync DB
