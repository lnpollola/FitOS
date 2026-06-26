## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Future data entry via frontend
**Reason**: This requirement belonged to an earlier spec iteration when the historical import was a one-time flow. The current model treats healthsync as a recurring sync source, and manual data entry is out of scope for the apple-health-import spec. Manual entry remains available in the diet, training, and measurements views; the Activity view intentionally only consumes healthsync-sourced data.
**Migration**: No migration needed. Manual data entry for daily metrics, sport activities, and weight entries is unaffected by this spec change.

### Requirement: Read-only access to HealthSync DB
**Reason**: This requirement is enforced in code (`{ readonly: true }` on direct queries) but is an implementation detail rather than a user-facing requirement. It does not need to live in the spec.
**Migration**: The implementation in `src/db/database.js:initHealthsyncDb` continues to use `{ readonly: true }`. No user-facing change.
