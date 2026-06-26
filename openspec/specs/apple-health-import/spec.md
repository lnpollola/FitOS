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

The system SHALL support importing activity data from a fresh Apple Health export file (`exportar.xml` or `.zip`) using the HealthSync CLI's `parse` subcommand, then migrate the parsed data into the app's local database. The full import flow is exposed as a single "Sincronizar Apple Health" action that auto-detects whether the XML needs re-parsing (see the new `apple-health-data-integrity` capability for the detection rules).

#### Scenario: Unified sync action auto-detects parse vs migrate
- **WHEN** the user clicks "Sincronizar Apple Health"
- **THEN** the system SHALL run `syncAppleHealth()` which:
  - resolves the XML path (cwd/ImportData, ~/ImportData, ~/.healthsync/ImportData)
  - compares the XML mtime to `~/.healthsync/healthsync.db` mtime
  - if XML is newer OR `forceReparse` is set, runs `healthsync parse <xmlPath>` first
  - then runs the migration to copy data from `healthsync.db` into `activity_days`, `sport_activities`, and `weight_entries`
  - refreshes the `activity_summary_cache` for 7d/15d/30d
  - records the sync timestamp in `settings.health_last_import`
- **THEN** the result SHALL include the action taken (`parse-and-sync` or `sync-only`) plus migration counts, cache state, and any errors

#### Scenario: Progress displayed during parse and migration
- **WHEN** the user clicks "Sincronizar Apple Health"
- **THEN** the system SHALL emit progress messages during the parse step (real-time, at least once per second) via the `health-import-progress` IPC channel
- **THEN** the system SHALL emit progress messages during the migration step ("Importando pasos...", "Importando calorías activas...", etc.)
- **THEN** the renderer SHALL show these in the existing progress bar
- **THEN** the sync button SHALL be disabled until the operation completes (success or failure)

#### Scenario: Parse is atomic against healthsync.db corruption
- **WHEN** the parse step runs
- **THEN** the system SHALL parse the XML to a staging DB at a temp path
- **THEN** on successful parse, the system SHALL atomically rename the staging DB to `~/.healthsync/healthsync.db`
- **THEN** if the parse fails, `~/.healthsync/healthsync.db` SHALL be left untouched

#### Scenario: Duplicate records handled via source-tagged UPSERT
- **WHEN** a migrated record matches an existing record by date and type
- **THEN** the system SHALL upsert (overwrite with the new value) since aggregation is deterministic
- **THEN** the system SHALL report the count of inserted/updated records as `created`
- **THEN** the dedup SHALL only touch rows with `created_at LIKE 'healthsync:%'`, leaving manual entries untouched

### Requirement: Incremental sync from existing HealthSync DB

The system SHALL support syncing from an already-parsed `~/.healthsync/healthsync.db` produced by a previous `healthsync parse` run. This is now the `sync-only` branch of the unified "Sincronizar Apple Health" action (not a separate button).

#### Scenario: Sync from existing DB
- **WHEN** the XML mtime is older than or equal to the `healthsync.db` mtime (and `forceReparse` is not set)
- **THEN** the system SHALL skip the parse and run only the migration
- **THEN** the system SHALL report `action: "sync-only"` in the result
- **THEN** the dashboard views SHALL reflect the new data on next load

#### Scenario: Sync disabled when healthsync.db missing
- **WHEN** `~/.healthsync/healthsync.db` does not exist
- **AND** no XML is found in the standard locations
- **THEN** the "Sincronizar Apple Health" button SHALL be disabled
- **THEN** a message SHALL indicate the user must run `healthsync parse <export.zip>` first

#### Scenario: Source info displayed in activity view
- **WHEN** the Activity view loads
- **THEN** the system SHALL show the `healthsync.db` last-modified timestamp AND the XML last-modified timestamp
- **THEN** the system SHALL indicate which action the next sync will take (parse-and-sync or sync-only)
- **THEN** the user SHALL see how fresh the source data is before syncing

#### Scenario: Cache refresh populates sleep stage columns
- **WHEN** the cache is refreshed after migration
- **THEN** the `activity_summary_cache` table SHALL have `sleep_deep`, `sleep_rem`, and `sleep_light` columns populated for each day
- **THEN** the cache SHALL be repopulated for 7d, 15d, and 30d periods
