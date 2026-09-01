# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- **Unresolved path params** — `injectResourceId` substituted only the *first* `:param`, so nine commands whose endpoint carries more than one shipped URLs containing a literal `:token` and 404'd opaquely. `injectResourceId` and `buildPath` now throw `DATA360_UNRESOLVED_PATH_PARAM` naming the params still needing values. The assertion runs before the query string is appended, so a query value containing a colon is unaffected.
- **`connection fields`, `connection run-existing`, `data-kit dependencies`, `data-kit status`** — each endpoint carries two `:params` but each command declared only `--name`. They now declare a flag for the second param (`--object`, `--command`, `--component`, `--component` respectively) and fill both via a new `pathParams()` hook on `CrudListCommand`, `CrudGetCommand` and `CrudActionCommand`. The remaining multi-param commands (`connection preview`, `data-graph data-by-id`, `profile calculated-insight`, `profile child`, `universal-id lookup`) now fail loudly instead of silently issuing a malformed request.
- **`dmo mapping-update-field`** — the command could never run. It extended `CrudActionCommand` and spread `data360Flags`, so it had no `--definition-file` flag (oclif rejected the call with "Nonexistent flag" before any HTTP request), its `buildBody()` returned `undefined`, and its endpoint carried two `:params` while `injectResourceId` fills only the first. Now extends `CrudUpdateCommand` with `mutationFlags`, and PATCHes the collection resource `/data-model-object-mappings/:objectSourceTargetMapDeveloperName/field-mappings` with the definition file as the body. `--name` is the OBJECT-level mapping developer name; the API merges the listed `fieldMapping` pairs into the existing set. `--definition-file` is now required for this command (an omitted body previously PATCHed `{}` and still reported success).
- **`dmo mapping-list`** — the result now carries the object-level `developerName` (the `ObjectSourceTargetMap` name). Previously `developerName` appeared only on each `fields[]` entry, so there was no way to obtain the `--name` value `mapping-update-field` requires. An absent `developerName` is reported as `undefined` rather than `''`.
- **CRUD base classes** — an empty resource id now raises a clear error instead of building a `//` path that 404s opaquely (oclif's `required: true` accepts an empty string). The guard covers `CrudGetCommand`, `CrudUpdateCommand`, `CrudDeleteCommand`, and `CrudActionCommand`; `--name ""` previously sent `DELETE /connections//`. Endpoints with no `:param` are unaffected, and `CrudListCommand` still treats the id as optional.
- **`--definition-file -` (stdin)** — reading a definition from stdin crashed the process with an uncaught `ERR_INVALID_ARG_TYPE`: `readStdin` set the stream encoding, so `Buffer.concat` received strings. It now collects real buffers.

## [0.0.6] - 2026-03-21

### Added

- **Hybrid search command** (`sf data360 query hybrid`) — combines vector similarity with keyword matching. Supports `--prefilter` to narrow results by field values before ranking. Contributed by [@johnny2678](https://github.com/johnny2678) ([#7](https://github.com/gthoppae/sf-cli-plugin-data360/pull/7)).
- **Connection create examples** — man page (`sf data360 man connection create`) now includes full JSON payloads for HerokuPostgres and Redshift connectors.

### Fixed

- **Pagination** — `data-stream list --all` now returns all pages. Previously only returned the first 10 streams on orgs with >10 data streams. Root cause: the data-streams API uses `limit`/`nextPageUrl` pagination, not `batchSize`. The paginator now supports three styles: `nextPageUrl`, `nextBatchId`, and offset-based.
- **Hybrid search score columns** — `hybrid_search()` returns `hybrid_score__c`, `keyword_score__c`, `vector_score__c` (not `score__c`). Table output now shows all three scores.
- **Redshift connection definition** — fixed from legacy `connectionProperties` format to correct `credentials`/`parameters` array format.
- **TypeScript compilation** — added `skipLibCheck: true` to resolve `@types/cacheable-request` errors when sibling projects share a parent directory.

## [0.0.5] - 2026-03-19

### Added

- Initial pre-release: 159 commands covering all 27 Data 360 API groups.
- Man pages for all commands (`sf data360 man <topic> <command>`).
- INSTALL.md, TESTING.md, STATUS.md, CONTRIBUTING.md, RELEASE.md.
- MIT license.

### Contributors

- [@gthoppae](https://github.com/gthoppae)
- [@johnny2678](https://github.com/johnny2678) — hybrid search command
