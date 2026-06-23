# Performance Caching

## Purpose

Cache summary tables for fast dashboard queries, reducing response time on high-frequency reads by pre-computing aggregations from activity and health data.

## Requirements

### Requirement: Summary cache tables for fast dashboard queries

The system SHALL maintain a single `activity_summary_cache` table partitioned by `period_days` (replacing the three separate tables `activity_summary_7d`, `activity_summary_15d`, `activity_summary_1m`). The cache SHALL include HealthSync-derived metrics (exercise_minutes, walking_km, cycling_km, hrv_avg, resting_hr_avg) in addition to activity_days and sport_activities data. Cache SHALL be populated on every data write and serve as the primary read source for dashboard IPC handlers.

#### Scenario: Cache table created on schema init

- **WHEN** the database schema initializes
- **THEN** a single table SHALL be created: `activity_summary_cache` with a `period_days` partition column
- **THEN** the table SHALL include columns for: date, steps, active_kcal, resting_kcal, sleep_hours, sleep_deep, sleep_rem, sleep_light, weight_kg, sport_sessions, sport_kcal, sport_minutes, exercise_minutes, walking_km, cycling_km, hrv_avg, resting_hr_avg

#### Scenario: Cache table contains HealthSync metrics
- **WHEN** `populateCache(7)` is called and HealthSync DB is available
- **THEN** the cache rows SHALL include `exercise_minutes`, `walking_km`, `cycling_km` aggregated from HealthSync
- **THEN** the cache rows SHALL include `hrv_avg` and `resting_hr_avg` from HealthSync daily summaries
- **THEN** if HealthSync DB is not available, these columns SHALL default to 0 or NULL

#### Scenario: Cache populated on data write

- **WHEN** any write operation completes (activity day insert, sport activity insert, weight entry insert)
- **THEN** the cache for the affected period_days SHALL be truncated and repopulated for the last N days (7, 15, 30)
- **THEN** cache population SHALL occur within the same transaction as the write

#### Scenario: Cache populated on Apple Health import

- **WHEN** an Apple Health XML import completes
- **THEN** all three cache tables SHALL be repopulated
- **THEN** the import SHALL NOT be considered complete until cache refresh finishes

### Requirement: IPC handlers prefer cache over raw queries

The system SHALL update dashboard and activity IPC handlers to query cache tables first. If cache data is missing (stale or empty), handlers SHALL fall back to raw aggregated queries.

#### Scenario: Dashboard reads from cache

- **WHEN** `db:getDashboardMetrics(from, to)` is called
- **THEN** the handler SHALL first check `activity_summary_cache` for the matching `period_days`
- **THEN** if cache has complete data for the range, return cache rows directly
- **THEN** if cache is empty or incomplete, fall back to raw query against base tables

#### Scenario: Cache miss transparent to UI

- **WHEN** cache data is unavailable for any reason
- **THEN** the UI SHALL receive the same data structure as from cache (no change to response format)
- **THEN** no error SHALL be surfaced to the user for a cache miss

### Requirement: Energy balance and weight trend from cache

The system SHALL serve energy balance weekly summaries and weight trend data from cache tables when available, falling back to direct queries otherwise.

#### Scenario: Weekly balance from cache

- **WHEN** `db:getWeeklyBalance(weekStart)` is called
- **THEN** the handler SHALL query `activity_summary_cache WHERE period_days = 7` where dates fall within the target week
- **THEN** the handler SHALL aggregate cache rows to compute net balance

### Requirement: Cache tables exclude non-HealthSync data

The system SHALL only cache data that originates from activity, health tracking, and HealthSync. Diet, training, and profile data SHALL NOT be cached (queried directly, as these are less frequent and smaller datasets).

#### Scenario: Cache scope limited to health/activity data

- **WHEN** cache tables are populated
- **THEN** only `activity_days`, `sport_activities`, `weight_entries`, and HealthSync-derived data SHALL be included
- **THEN** `meal_templates`, `training_sessions`, `measurement_sets`, and `user_profile` data SHALL be queried directly
