# Plugin Status

> Last updated: 2026-03-19

## Testing Summary

| Level                              | Commands  | What it proves                               |
| ---------------------------------- | --------- | -------------------------------------------- |
| Smoke tested                       | 160 / 160 | Imports, flags, metadata valid               |
| Inventory snapshot                 | 160 / 160 | No unintentional changes                     |
| Unit tested (mocked API)           | 19        | Correct requests, responses, name resolution |
| Live tested (real org)             | 17        | End-to-end verified, 2026-03-18              |
| Smoke only (untested individually) | 132       | Covered by CRUD base class tests             |

## Unit Tested Commands (19)

These have dedicated test files with mocked API responses:

| Command                    | Test File                         | What's Verified                                           |
| -------------------------- | --------------------------------- | --------------------------------------------------------- |
| `connection get`           | `connection-get.test.ts`          | Name→ID resolution with connectorType                     |
| `data-stream delete`       | `crudDelete.test.ts`              | DELETE + shouldDeleteDataLakeObject param                 |
| `dmo get`                  | `crudGet.test.ts`                 | GET path injection, response mapping                      |
| `dmo list`                 | `crudList.test.ts`                | Pagination, batchSize=50, mapRecord                       |
| `dmo mapping-list`         | `dmo-mapping-list.test.ts`        | dloDeveloperName/dmoDeveloperName params, nested response |
| `identity-resolution list` | `crudList.test.ts`                | Column mappings (label, rulesetStatus)                    |
| `identity-resolution run`  | `identity-resolution-run.test.ts` | Name→ID resolution, ID passthrough, error handling        |
| `query async-create`       | `query-async.test.ts`             | POST /query-sql with SQL body                             |
| `query async-status`       | `query-async.test.ts`             | GET /query-sql/{id}                                       |
| `query async-rows`         | `query-async.test.ts`             | GET /query-sql/{id}/rows, result formatting               |
| `query async-cancel`       | `query-async.test.ts`             | DELETE /query-sql/{id}                                    |
| `query sqlv2`              | `query-sqlv2.test.ts`             | POST body, nextBatchId, empty results                     |
| `segment create`           | `crudCreate.test.ts`              | POST body, ID extraction                                  |
| `segment delete`           | `crudDelete.test.ts`              | DELETE path                                               |
| `segment list`             | `crudList.test.ts`                | arrayKey='segments', column mapping                       |
| `segment publish`          | `segment-publish.test.ts`         | Name→marketSegmentId resolution                           |
| `transform get`            | `crudGet.test.ts`                 | Response field mapping (createdBy object)                 |
| `transform run`            | `crudAction.test.ts`              | POST path injection                                       |
| `transform validate`       | `crudAction.test.ts`              | Endpoint fix verification (B21)                           |

## Live Tested Commands (17)

Verified against a real Data Cloud org on 2026-03-18:

| Command                    | Result                                       |
| -------------------------- | -------------------------------------------- |
| `calculated-insight list`  | Listed CIs                                   |
| `connection connector-get` | Returned SalesforceCRM details               |
| `connection get`           | Resolved name→ID, returned connection detail |
| `connection list`          | Listed connections with --connector-type     |
| `data-stream list`         | Listed 4 streams with connector types        |
| `dmo list`                 | 1078 DMOs with --all (pagination verified)   |
| `dmo mapping-list`         | 19 field mappings (Contact→Individual)       |
| `identity-resolution list` | 2 rulesets with unified profile counts       |
| `identity-resolution run`  | Job started (name→ID resolved)               |
| `query describe`           | 146 columns for Individual DMO               |
| `query sql`                | COUNT(\*) = 1697                             |
| `query sql-v1`             | COUNT(\*) = 1697                             |
| `query sqlv2`              | 5 rows with pagination support               |
| `query vector`             | Semantic search results                      |
| `search-index list`        | Listed indexes                               |
| `segment list`             | 2 segments with member counts                |
| `segment publish`          | Publish started (name→ID resolved)           |

## Smoke-Only Commands (132)

These 132 commands pass smoke tests (import, flags, metadata) and are covered by their CRUD base class tests, but have no individual unit or live tests. They extend standard base classes:

- **CrudListCommand** (23): activation list, activation-target list, calculated-insight list, etc.
- **CrudGetCommand** (40): activation get, connection connector-get, data-graph get, etc.
- **CrudCreateCommand** (20): activation create, connection create, data-graph create, etc.
- **CrudUpdateCommand** (18): activation update, connection update, dmo update, etc.
- **CrudDeleteCommand** (15): activation delete, connection delete, dmo delete, etc.
- **CrudActionCommand** (12): calculated-insight run, data-graph refresh, etc.
- **Data360Command** (4): doctor, query sql, query vector, query describe

## Known Issues

See `sf data360 man <topic> <command>` for per-command NOTES sections.

Key issues:

- `data-space members` — "Request failed" (needs API investigation)
- `segment members` — returns opaque IDs only (use SQL JOIN instead)
- `data-stream run` — CRM connector cannot be run manually (platform schedule)
- `connection list` — requires `--connector-type` (no "list all" option)

## Bug Fixes Applied

| Bug | Command                               | Fix                                           |
| --- | ------------------------------------- | --------------------------------------------- |
| B1  | `dmo map-to-canonical`                | --map supports duplicate source keys          |
| B2  | `data-stream delete`                  | Added --keep-dlo + shouldDeleteDataLakeObject |
| B4  | `calculated-insight list`             | Dotted arrayKey support (collection.items)    |
| B5  | `search-index get/delete`             | Name→ID resolution                            |
| B6  | `identity-resolution list`            | Fixed column mappings                         |
| B7  | `identity-resolution run`             | Name→ID resolution                            |
| B9  | `dmo list`                            | Pagination fix (batchSize=50)                 |
| B11 | `segment publish`                     | Name→marketSegmentId resolution               |
| B12 | `segment list`                        | Fixed columns + arrayKey                      |
| B13 | `connection connector-get`            | Simplified (no resolution needed)             |
| B15 | `connection get`                      | Name→ID resolution with connectorType         |
| B16 | `connection objects/databases`        | GET→POST + name resolution                    |
| B17 | `query sql-v1/sqlv2/v2-batch/async-*` | 7 stubs rewritten as functional commands      |
| B21 | `transform validate`                  | Fixed endpoint + added --name                 |
| B22 | `docai generate-schema`               | Fixed endpoint + added --name                 |
| E5  | `connection list`                     | Added --connector-type flag                   |
| E10 | Multiple                              | Shared nameResolver.ts utility                |
