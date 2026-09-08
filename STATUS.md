# Plugin Status

> Last updated: 2026-09-08

## Testing Summary

| Level                              | Commands  | What it proves                               |
| ---------------------------------- | --------- | -------------------------------------------- |
| Smoke tested                       | 163 / 163 | Imports, flags, metadata valid               |
| Inventory snapshot                 | 163 / 163 | No unintentional changes                     |
| Unit tested (mocked API)           | 33        | Correct requests, responses, name resolution |
| Live tested (real org)             | 17        | End-to-end verified, 2026-03-18              |
| Smoke only (untested individually) | 130       | Covered by CRUD base class tests             |

## Unit Tested Commands (33)

These have dedicated test files with mocked API responses:

| Command                       | Test File                             | What's Verified                                                       |
| ----------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| `connection database-schemas` | `connection-database-schemas.test.ts` | POST verb + body, `schemas` arrayKey, bare-string rows, inert `--all` |
| `connection fields`           | `multi-path-param.test.ts`            | Both :params resolved; POST body, `fields` arrayKey                   |
| `connection get`              | `connection-get.test.ts`              | Name→ID resolution with connectorType                                 |
| `connection run-existing`     | `multi-path-param.test.ts`            | Both :params resolved (connectionId, command)                         |
| `connection schema-get`       | `connection-schema-get.test.ts`       | Parses schemas[].fields[]; per-object field counts                    |
| `connection test`             | `connection-test.test.ts`             | Name→ID resolution, then POST to the test action                      |
| `connection test-definition`  | `connection-test-definition.test.ts`  | POSTs the connector definition; test-existing left on its own path    |
| `data-kit dependencies`       | `multi-path-param.test.ts`            | Both :params resolved (dataKitName, componentName)                    |
| `data-kit status`             | `multi-path-param.test.ts`            | Both :params resolved (dataKitName, componentName)                    |
| `data-stream delete`          | `crudDelete.test.ts`                  | DELETE + shouldDeleteDataLakeObject param                             |
| `dmo create-from-dlo`         | `dmo-create-from-dlo.test.ts`         | DLO SQL type → DMO type parity; orphan DMO error                      |
| `dmo get`                     | `crudGet.test.ts`                     | GET path injection, response mapping                                  |
| `dmo list`                    | `crudList.test.ts`                    | Pagination, batchSize=50, mapRecord                                   |
| `dmo mapping-list`            | `dmo-mapping-list.test.ts`            | dloDeveloperName/dmoDeveloperName params, nested response             |
| `dmo mapping-update-field`    | `crudUpdate.test.ts`                  | PATCH to field-mappings collection, definition-file body              |
| `docai detect-schema`         | `docai-detect-schema.test.ts`         | Definition body, threshold query param, v67.0 default                 |
| `docai generate-schema`       | `docai-generate-schema.test.ts`       | Org-level action, definition body, no path param                      |
| `identity-resolution list`    | `crudList.test.ts`                    | Column mappings (label, rulesetStatus)                                |
| `identity-resolution run`     | `identity-resolution-run.test.ts`     | Name→ID resolution, ID passthrough, error handling                    |
| `query async-create`          | `query-async.test.ts`                 | POST /query-sql with SQL body                                         |
| `query async-status`          | `query-async.test.ts`                 | GET /query-sql/{id}                                                   |
| `query async-rows`            | `query-async.test.ts`                 | GET /query-sql/{id}/rows, result formatting                           |
| `query async-cancel`          | `query-async.test.ts`                 | DELETE /query-sql/{id}                                                |
| `query sqlv2`                 | `query-sqlv2.test.ts`                 | POST body, nextBatchId, empty results                                 |
| `search-index config`         | `search-index-config.test.ts`         | Org-level GET, no `--name`; config field surfaced                     |
| `segment create`              | `crudCreate.test.ts`                  | POST body, ID extraction                                              |
| `segment delete`              | `crudDelete.test.ts`                  | DELETE path                                                           |
| `segment list`                | `crudList.test.ts`                    | arrayKey='segments', column mapping                                   |
| `segment publish`             | `segment-publish.test.ts`             | Name→marketSegmentId resolution                                       |
| `transform get`               | `crudGet.test.ts`                     | Response field mapping (createdBy object)                             |
| `transform run`               | `crudAction.test.ts`                  | POST path injection                                                   |
| `transform validate`          | `crudAction.test.ts`                  | Pre-create validation endpoint, full definition body                  |
| `universal-id lookup`         | `multi-path-param.test.ts`            | Deny-listed: throws on its three unresolved :params                   |

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

## Smoke-Only Commands (130)

These 130 commands pass smoke tests (import, flags, metadata) and are covered by their CRUD base class tests, but have no individual unit or live tests. They extend standard base classes:

- **CrudListCommand** (18): activation list, activation-target list, connection connector-list, etc.
- **CrudGetCommand** (33): activation data, activation get, activation platforms, etc.
- **CrudCreateCommand** (19): activation create, activation-target create, calculated-insight create, etc.
- **CrudUpdateCommand** (18): activation update, activation-target update, calculated-insight update, etc.
- **CrudDeleteCommand** (13): activation delete, calculated-insight delete, connection delete, etc.
- **CrudActionCommand** (16): calculated-insight run, connection run, connection test-existing, etc.
- **Data360Command** (12): data-stream create-from-object, dmo map-to-canonical, doctor, etc.
- **SfCommand** (1): man

These are smoke-only counts, not per-base-class totals: the 33 unit-tested commands are
already subtracted, so the eight figures partition the 130 and no command is counted twice.

## Help Wanted — Testing on Your Org

We need live testing on diverse orgs. If you have Data Cloud provisioned, try the commands below and report results (success, error message, org type).

### Quick Wins (read-only, safe to run)

```bash
# Data spaces — does this work on your org?
sf data360 data-space list -o <org> 2>/dev/null
sf data360 data-space members -o <org> --name default 2>/dev/null

# Activations — do you see configured activations?
sf data360 activation list -o <org> 2>/dev/null
sf data360 activation-target list -o <org> 2>/dev/null

# Data kits — deployment status of one component in a bundle
sf data360 data-kit status -o <org> --name Sales --component <component> 2>/dev/null

# Transforms — any data transforms configured?
sf data360 transform list -o <org> 2>/dev/null

# Doctor — health check
sf data360 doctor -o <org> 2>/dev/null
```

### Needs Specific Setup

| Command                      | What You Need                     | How to Test                                                                                                                  |
| ---------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `data-graph create`          | A data graph definition JSON      | `sf data360 data-graph create -o <org> -f graph.json`                                                                        |
| `search-index create`        | Unstructured data DMO             | `sf data360 search-index create -o <org> -f index.json`                                                                      |
| `docai generate-schema`      | A sample document, base64-encoded | `sf data360 docai generate-schema -o <org> -f sample.json`                                                                   |
| `docai detect-schema`        | Sample document + named schemas   | `sf data360 docai detect-schema -o <org> -f sample.json`                                                                     |
| `transform validate`         | A transform definition JSON       | `sf data360 transform validate -o <org> -f transform.json`                                                                   |
| `connection test-definition` | A connector definition JSON       | `sf data360 connection test-definition -o <org> -f conn.json`                                                                |
| `query async-*` lifecycle    | Any large DMO (1000+ rows)        | `sf data360 query async-create -o <org> --sql 'SELECT * FROM "ssot__Individual__dlm"'` then `async-status` then `async-rows` |

### How to Report

1. Run the command with `--json` flag for structured output
2. Note your org type: sandbox, Developer Edition, production, scratch org
3. Note the API version: `sf data360 man <topic> <command>` shows the default
4. Share the result (success or error message) via the repo issues

Even a "it worked" confirmation is valuable — it means we can mark that command as live-tested on another org type.

---

## Known Issues

See `sf data360 man <topic> <command>` for per-command NOTES sections.

Key issues:

- `data-space members` — "Request failed" (needs API investigation)
- `segment members` — returns opaque IDs only (use SQL JOIN instead)
- `data-stream run` — CRM connector cannot be run manually (platform schedule)
- `connection list` — requires `--connector-type` (no "list all" option)
- Action commands ignore `--raw` and always log "Action completed successfully.", so `transform validate` reports success even when the response lists validation errors — read the result with `--json`

## Bug Fixes Applied

| Bug | Command                               | Fix                                                        |
| --- | ------------------------------------- | ---------------------------------------------------------- |
| B1  | `dmo map-to-canonical`                | --map supports duplicate source keys                       |
| B2  | `data-stream delete`                  | Added --keep-dlo + shouldDeleteDataLakeObject              |
| B4  | `calculated-insight list`             | Dotted arrayKey support (collection.items)                 |
| B5  | `search-index get/delete`             | Name→ID resolution                                         |
| B6  | `identity-resolution list`            | Fixed column mappings                                      |
| B7  | `identity-resolution run`             | Name→ID resolution                                         |
| B9  | `dmo list`                            | Pagination fix (batchSize=50)                              |
| B11 | `segment publish`                     | Name→marketSegmentId resolution                            |
| B12 | `segment list`                        | Fixed columns + arrayKey                                   |
| B13 | `connection connector-get`            | Simplified (no resolution needed)                          |
| B15 | `connection get`                      | Name→ID resolution with connectorType                      |
| B16 | `connection objects/databases`        | GET→POST + name resolution                                 |
| B17 | `query sql-v1/sqlv2/v2-batch/async-*` | 7 stubs rewritten as functional commands                   |
| B21 | `transform validate`                  | Fixed endpoint + added --name                              |
| B22 | `docai generate-schema`               | Fixed endpoint + added --name                              |
| E5  | `connection list`                     | Added --connector-type flag                                |
| E10 | Multiple                              | Shared nameResolver.ts utility                             |
| B27 | `dmo mapping-update-field`            | CrudUpdateCommand + --definition-file, collapsed endpoint  |
| B28 | `dmo mapping-list`                    | Surface object-level developerName                         |
| B29 | Multi-param endpoints                 | Throw on unresolved :param; flags for the 4 reachable cmds |
| B30 | `docai generate-schema`               | Org-level endpoint + --definition-file; dropped --name     |
| B31 | `search-index config`                 | Org-level endpoint; dropped --name; corrected columns      |
| B32 | `transform validate`                  | Pre-create validation endpoint + --definition-file         |
| B33 | `dmo mapping-list`                    | Dropped the v64.0 pin; inherits the default                |
| B34 | Pagination                            | Follow nextPageToken and continuationToken cursors         |
