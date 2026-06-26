## 1. Apple Health binary validation

- [x] 1.1 Implement `isValidHealthsyncBinary(filePath)` in `src/main/apple-health-import.js` (magic bytes + ≥1 MB)
- [x] 1.2 Update `getHealthsyncPath()` to use the validator, auto-delete stubs, fall back to `$PATH`
- [x] 1.3 Add a unit test for `isValidHealthsyncBinary` covering: valid ELF, valid Mach-O, valid PE, stub "Not Found" (9 bytes), missing file, zero-byte file
- [x] 1.4 Verify on real machine: stub at `~/.healthsync/healthsync` is auto-removed and real binary at `/usr/local/bin/healthsync` is used

## 2. Parse error propagation

- [x] 2.1 Rewrite `parseHealthsyncXML` to reject with binary stderr on non-zero exit (not silently resolve)
- [x] 2.2 Add a check that rejects if the process exits 0 but `healthsync.db` is not created
- [x] 2.3 Verify the error message surfaces in the UI when `syncAppleHealth` is called with a missing/broken binary

## 3. Unified `syncAppleHealth` orchestration

- [x] 3.1 Add `syncAppleHealth(mainWindow, options)` in `src/main/apple-health-import.js` with smart parse-vs-migrate decision
- [x] 3.2 Add `resolveAppleHealthXml(customPath)` that tries cwd/ImportData, ~/ImportData, ~/.healthsync/ImportData
- [x] 3.3 Return shape: `{ ok, action, parsed, xmlPath, xmlMtime, healthsyncDbMtime, migration, cache, timestampSaved, errors }`
- [x] 3.4 Add the `forceReparse` option that bypasses the mtime check
- [x] 3.5 Add the IPC handler `db:syncAppleHealth` in `src/main/handlers/activity-handlers.js` replacing `db:importAppleHealthXML` and `db:syncFromHealthsync`
- [x] 3.6 Expose `syncAppleHealth(options)` in `src/preload/preload.js`
- [x] 3.7 Remove the old `db:importAppleHealthXML` and `db:syncFromHealthsync` handlers (legacy)

## 4. Activity view: one unified button + refresh

- [x] 4.1 Replace the two old buttons with a single `btn-sync-apple-health` in `src/renderer/views/activity.js`
- [x] 4.2 Add `btn-refresh-apple-health` next to it with the refresh-cw icon
- [x] 4.3 Add the "Forzar re-parseo del XML" checkbox (`force-reparse-checkbox`)
- [x] 4.4 Replace `loadHealthsyncDbInfo` with `loadSourceInfo` that shows both XML mtime + DB mtime and the action that will be taken
- [x] 4.5 Add the new strings to `src/renderer/locales/es.js`: `syncAppleHealth`, `syncAppleHealthHint`, `refresh`, `refreshing`, `refreshTitle`, `forceReparseXml`, `actionParseAndSync`, `actionSyncOnly`, `actionWillReparse`, `actionWillSyncOnly`, `xmlLabel`, `lastImportNever`
- [x] 4.6 Remove unused strings: `importAppleHealth`, `reImportCheckbox`, `importingData`, `healthsyncSync`, `healthsyncSyncHint`, `healthsyncImportError`

## 5. Reset & re-sync capability

- [x] 5.1 Add `resetHealthsyncData()` in `src/main/apple-health-import.js` (transactional DELETE of the 4 tables)
- [x] 5.2 Add `resetAndSyncHealthsync(mainWindow)` that composes reset + `syncAppleHealth`
- [x] 5.3 Add the IPC handler `db:resetAndSyncHealthsync` in `src/main/handlers/activity-handlers.js`
- [x] 5.4 Expose `resetAndSyncHealthsync` in `src/preload/preload.js`
- [x] 5.5 Add the "Limpiar y re-sincronizar" button (`btn-reset-sync-healthsync`) in the activity view with `window.confirm()` guard
- [x] 5.6 Add the strings: `resetAndSync`, `resetAndSyncConfirm`, `resetComplete`

## 6. CLI scripts

- [x] 6.1 Create `scripts/sync-healthsync.js` with `--dry-run`, `--json`, `--reparse <path>` flags
- [x] 6.2 Create `scripts/reset-healthsync.js` with `--no-sync`, `--json` flags
- [x] 6.3 Add `sync:healthsync` and `reset:healthsync` scripts in `package.json`
- [x] 6.4 Create `.opencode/commands/sync-healthsync.md` slash command

## 7. Cache migration

- [x] 7.1 Add idempotent migration in `src/db/database.js:createTables` for `activity_summary_cache.sleep_deep/rem/light` columns (already done in current session, verify)
- [x] 7.2 Update `populateCache(periodDays)` to insert all 18 columns including sleep stages (already done, verify)

## 8. Atomic parse via staging DB (D9)

- [x] 8.1 Refactor `parseHealthsyncXML(xmlPath)` to accept an optional `dbPath` parameter and pass `--db <path>` to the binary
- [x] 8.2 Add `parseHealthsyncXMLToStaging(xmlPath)` in `src/main/apple-health-import.js` that:
  - builds staging path as `os.tmpdir()/healthsync-staging-<pid>-<ts>.db`
  - calls `parseHealthsyncXML` with the staging path
  - returns the staging path on success
  - on failure, cleans up the staging file and rejects
- [x] 8.3 Update `syncAppleHealth` to: parse to staging → on success `fs.renameSync(stagingPath, HEALTHSYNC_DB)` → on failure, leave real DB untouched
- [x] 8.4 Handle cross-filesystem rename (Windows edge case): fall back to `fs.copyFileSync` + `fs.unlinkSync` with a comment about the lack of atomicity
- [x] 8.5 Add a unit test: simulated parse failure leaves `healthsync.db` byte-identical to the pre-parse state
- [x] 8.6 Add a unit test: successful parse leaves `healthsync.db` with new content and the staging file is gone

## 9. Real-time progress during parse (D10)

- [x] 9.1 Replace `execFile` with `spawn` in the parse call
- [x] 9.2 Wire `proc.stdout.on('data', ...)` to forward lines via `mainWindow.webContents.send('health-import-progress', ...)`
- [x] 9.3 Wire `proc.stderr.on('data', ...)` similarly
- [x] 9.4 Parse the binary's output for progress indicators (look for `NN%` or byte counts); if found, send "Parseando XML: NN%"
- [x] 9.5 If no parseable progress in 1s, send a fallback "Parseando XML... (puede tardar 1-2 min)"
- [x] 9.6 Stop emitting parse-progress when the parse completes; let the migration step take over
- [ ] 9.7 Test manually with a real XML export: confirm messages arrive at the UI during the 1-2 min wait
- [ ] 9.8 Test: if the binary emits no progress info (e.g., without `-v`), the fallback "Parseando..." message still appears

## 10. Anomaly detection + discoverable reset banner (D11)

- [x] 10.1 Add `getHealthsyncDataAnomalies()` in `src/main/apple-health-import.js` that returns `{ sportDuplicates, weightDuplicates, hasAnomaly }`
- [x] 10.2 Compute `sportDuplicates = COUNT(*) - COUNT(DISTINCT date || '|' || sport_type)` from `sport_activities`
- [x] 10.3 Compute `weightDuplicates = COUNT(*) - COUNT(DISTINCT date)` from `weight_entries`
- [x] 10.4 Update `getHealthsyncDbInfo()` to include `anomalies: { sportDuplicates, weightDuplicates }` in its return value
- [x] 10.5 Add the banner element (`#anomaly-banner`) to the activity view HTML, hidden by default
- [x] 10.6 In `loadSourceInfo`, show/hide the banner based on `anomalies`; populate text with counts
- [x] 10.7 Banner text: "Tus datos tienen N sesiones duplicadas en `sport_activities` [y M pesos duplicados]. [Limpiar y re-sincronizar]"
- [x] 10.8 Banner "Limpiar y re-sincronizar" link triggers the same flow as `btn-reset-sync-healthsync`
- [x] 10.9 Add the strings: `anomalyBanner`, `anomalyBannerSport`, `anomalyBannerWeight`, `anomalyBannerBoth`
- [x] 10.10 Add a smoke test: when `anomalies.sportDuplicates > 0`, the banner is rendered
- [x] 10.11 Add a smoke test: when `anomalies.sportDuplicates === 0`, the banner is hidden

## 11. Tests

- [x] 11.1 Update `tests/smoke/activity.test.js` mock: replace `importAppleHealthXML` + `syncFromHealthsync` with `syncAppleHealth`; add `resetAndSyncHealthsync`
- [x] 11.2 Add test: single unified sync button + refresh button render correctly
- [x] 11.3 Add test: refresh button re-runs loaders and shows updating label
- [x] 11.4 Add test: reset-and-sync button is rendered
- [x] 11.5 Add test: anomaly banner renders when `anomalies.sportDuplicates > 0`
- [x] 11.6 Add test: anomaly banner hidden when `anomalies = { 0, 0 }`
- [x] 11.7 Add unit test for the dedup invariant: after a fake migration, `COUNT(*) FROM sport_activities` equals `COUNT(DISTINCT date || sport_type)` for `created_at LIKE 'healthsync:%'`
- [x] 11.8 Add unit test for `isValidHealthsyncBinary` (also covers `buildStagingPath` + `atomicSwap`)
- [x] 11.9 Add unit test for atomic staging: simulated parse failure leaves real DB untouched
- [x] 11.10 Verify `npm test` reports 110+ tests passing (actual: 121/121)

## 12. Manual verification

- [ ] 12.1 On a clean install: click "Sincronizar Apple Health" → should re-parse XML + migrate, all data up to XML's max date
- [ ] 12.2 With a stale `healthsync.db`: click sync → should re-parse automatically (detected via mtime)
- [ ] 12.3 With a corrupt stub at `~/.healthsync/healthsync`: click sync → stub is removed, real binary at `$PATH` is used
- [ ] 12.4 With pre-existing duplicates: open activity view → yellow banner appears with counts; click it → confirm dialog → reset+sync
- [ ] 12.5 Click "Refrescar" → timeline + chart reload, DB not touched
- [ ] 12.6 During a long parse, the progress bar shows real messages (not silent)
- [ ] 12.7 Kill the Electron process during a parse: `healthsync.db` is intact (atomic staging)
- [ ] 12.8 CLI: `npm run reset:healthsync -- --dry-run` shows state without writing
- [ ] 12.9 CLI: `npm run reset:healthsync` runs end-to-end in one shot
- [ ] 12.10 CLI: `npm run sync:healthsync -- --reparse <path>` auto-parses when healthsync.db is missing

## 13. Deferred (future work, NOT in this change)

These were discussed and explicitly deferred per the user's priorities (reliability + simplicity over speed):

- [ ] 13.1 **Incremental XML parsing** (SAX pre-filter): if the 1-2 min parse becomes unacceptable
- [ ] 13.2 **Watermark** in `settings.healthsync_watermark`
- [ ] 13.3 **Lookback window** (default 7, max 14 days) for backfill safety
- [ ] 13.4 **UNIQUE partial index** on `sport_activities(date, sport_type) WHERE created_at LIKE 'healthsync:%'`
- [ ] 13.5 **Schema change**: dedicated `source` column instead of `healthsync:` tag in `created_at`
