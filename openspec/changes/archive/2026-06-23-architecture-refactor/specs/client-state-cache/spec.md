## ADDED Requirements

### Requirement: Client-side data cache with TTL

The system SHALL provide a `src/renderer/utils/cache-store.js` module that implements an in-memory `Map` with 30-second TTL for caching IPC responses. The cache SHALL support stale-while-revalidate semantics: data within TTL is returned instantly, expired data triggers a refetch. The cache SHALL be invalidated by domain when data changes occur.

#### Scenario: Cache hit returns stored data
- **WHEN** `cacheGet('dashboard:15d:2026-06-08')` is called within 30 seconds of `cacheSet` with the same key
- **THEN** the stored value SHALL be returned immediately
- **THEN** no IPC call SHALL be made

#### Scenario: Cache miss returns null
- **WHEN** `cacheGet('unknown-key')` is called
- **THEN** null SHALL be returned

#### Scenario: Expired cache returns null
- **WHEN** `cacheGet` is called more than 30 seconds after `cacheSet`
- **THEN** null SHALL be returned

#### Scenario: Domain invalidation clears all keys
- **WHEN** `cacheInvalidate('diet')` is called
- **THEN** all cache entries with keys starting with `diet:` SHALL be removed
- **THEN** entries from other domains SHALL remain intact

### Requirement: Domain-based event bus for data changes

The system SHALL extend the preload bridge with `onDomainChanged(domain, callback)` and the main process SHALL emit `domain-changed` events with a domain name when data is modified. The renderer SHALL use this for granular cache invalidation instead of the generic `onDataChanged`.

#### Scenario: Domain change event emitted on write
- **WHEN** a diet-related handler writes data (e.g., `db:saveFoodItem`)
- **THEN** the main process SHALL send a `domain-changed` event with domain `diet` to the renderer

#### Scenario: Domain change triggers cache invalidation
- **WHEN** the renderer receives a `domain-changed` event for `diet`
- **THEN** `cacheStore.cacheInvalidate('diet')` SHALL be called
- **THEN** the diet view SHALL refetch data on next navigation

#### Scenario: Unrelated domains unaffected
- **WHEN** a `diet` domain change event fires
- **THEN** cached data for `training` and `measurements` domains SHALL remain valid
