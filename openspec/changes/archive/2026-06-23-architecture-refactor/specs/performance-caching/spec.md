## MODIFIED Requirements

### Requirement: Summary cache tables for fast dashboard queries

The system SHALL maintain a single `activity_summary_cache` table partitioned by `period_days` (replacing the three separate tables `activity_summary_7d`, `activity_summary_15d`, `activity_summary_1m`). The cache SHALL include HealthSync-derived metrics (exercise_minutes, walking_km, cycling_km, hrv_avg, resting_hr_avg) in addition to activity_days and sport_activities data. Cache SHALL be populated on every data write and serve as the primary read source for dashboard IPC handlers.

#### Scenario: Cache table contains HealthSync metrics
- **WHEN** `populateCache(7)` is called and HealthSync DB is available
- **THEN** the cache rows SHALL include `exercise_minutes`, `walking_km`, `cycling_km` aggregated from HealthSync
- **THEN** the cache rows SHALL include `hrv_avg` and `resting_hr_avg` from HealthSync daily summaries
- **THEN** if HealthSync DB is not available, these columns SHALL default to 0 or NULL

#### Scenario: Cache populated on data write
- **WHEN** any write operation completes (activity day insert, sport activity insert, weight entry insert)
- **THEN** the cache for the affected period_days SHALL be truncated and repopulated

#### Scenario: Dashboard reads HealthSync data from cache
- **WHEN** `db:getDashboardData()` is called
- **THEN** the handler SHALL query `activity_summary_cache` for exercise, walking, cycling, HRV, and RHR data
- **THEN** separate `health:*` IPC calls from the renderer SHALL NOT be required for dashboard rendering

### Requirement: Cache tables exclude non-HealthSync data

The system SHALL only cache data that originates from activity, health tracking, and HealthSync. Diet, training, and profile data SHALL NOT be cached.

#### Scenario: Cache scope limited to health/activity data
- **WHEN** cache tables are populated
- **THEN** only `activity_days`, `sport_activities`, `weight_entries`, and HealthSync-derived data SHALL be included
- **THEN** `meal_templates`, `training_sessions`, `measurement_sets`, and `user_profile` data SHALL be queried directly
