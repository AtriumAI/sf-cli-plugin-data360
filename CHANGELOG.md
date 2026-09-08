# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- **`dmo create-from-dlo` on a DLO with a `DATE` column** — `TYPE_MAP` widened a DLO `DATE` to a DMO `DateTime`, so the DMO POST succeeded and the mapping POST then failed its type-parity check ("`Start_Date_c__c` 's type Date is different from `Start_Date_c_c__c` 's type DateTime"). Because the two POSTs are not atomic and the DMO is not rolled back, every attempt left an unmapped orphan `<name>__dlm` behind, and re-running failed at the DMO step on the now-existing name. `DATE` now maps to `Date`. A mapping failure from any other cause raises `DATA360_ORPHAN_DMO` naming the orphan and offering both exits — `dmo delete` it and retry, or keep it and run `dmo mapping-create` for the mapping half alone — instead of surfacing only the wrapped `DATA360_API_ERROR`.
- **`connection fields`** — the command could never run: it extended the GET-based list path, but the endpoint is POST-only ("HTTP Method 'GET' not allowed. Allowed are POST"). `CrudListCommand` gains an opt-in `httpMethod`/`buildBody()` branch, placed before the pagination branches, so the 22 other list commands follow unchanged code. The command POSTs Postman's minimal `{"advancedAttributes": {}}` body and reads the field list from the response's `fields` key, which sits alongside a sibling `primaryKeys` array. Its output columns were also wrong — `status` is not a key of the response — and are now `name`/`type`/`isRequired`. **`--all` is inert** on a POST-read endpoint, which answers in one body; passing it now warns rather than silently doing nothing. An explicit `arrayKey` is also strict now: previously it was only a preference, and a response missing the key fell through to "first array found", which would have rendered `primaryKeys` as the field list with blank columns and no indication anything was wrong.
- **`data-stream create-from-object --event-date-field`** — the flag summary and examples now record that a custom source field is named with a COLLAPSED suffix at the data-stream API layer: `Foo__c` is passed as `Foo_c` (it materializes on the DLO as `Foo_c__c`), while standard fields stay bare. Documentation only — the flag remains a transparent pass-through, since rewriting a trailing `__c` would hide the convention and would corrupt a legitimately `__c`-suffixed name from a non-CRM source. Every prior example, upstream and in Salesforce's own d360-mcp-server, used `CreatedDate`, so no existing source covered a custom event field.
- **Install from a git slug** — `sf plugins install AtriumAI/sf-cli-plugin-data360#<sha>` could not produce a working plugin. `files` ships `/lib` and `/oclif.manifest.json`, both of which only exist after a build, and there was no `prepare` script — the lifecycle hook npm runs for git dependencies precisely so they can compile from source. `postinstall` also ran `yarn husky install` unconditionally, which aborts a consumer install outright on any machine without yarn. A `prepare` script now runs `tsc -p . && oclif manifest`, and `postinstall` invokes `husky install` through `node` — gated on a `.git` checkout, so a consumer install skips it, and cross-platform, since the previous POSIX `[ -d .git ]` test is not a `cmd.exe` builtin and silently cost Windows developers their hooks. `prepare` also runs on a developer `yarn install`, which leaves an `oclif.manifest.json` in the checkout that the oclif loader prefers over the files on disk, so the `compile` target now regenerates it and declares it as output — a command added after the last manifest write is no longer invisible to `sf plugins link .` and `bin/dev.js`. `postinstall` also applies the node compat patch into whichever `node_modules` tree the plugin landed in, so a slug install no longer depends on the agent image to do it: `scripts/apply-node-compat-patches.sh` is now a strict wrapper around `scripts/apply-node-compat-patches.mjs`, which is idempotent, needs neither `git` nor `bash`, finds hoisted and nested copies alike, and is a no-op on a tree that has none. `scripts/verify-install.sh <ref>` checks the whole path end to end, in a throwaway `SF_DATA_DIR` so an existing link survives.
- **Unresolved path params** — `injectResourceId` substituted only the _first_ `:param`, so nine commands whose endpoint carries more than one shipped URLs containing a literal `:token` and 404'd opaquely. `injectResourceId` and `buildPath` now throw `DATA360_UNRESOLVED_PATH_PARAM` naming the params still needing values. The assertion runs before the query string is appended, so a query value containing a colon is unaffected.
- **`connection fields`, `connection run-existing`, `data-kit dependencies`, `data-kit status`** — each endpoint carries two `:params` but each command declared only `--name`. They now declare a **required** flag for the second param (`--object`, `--command`, `--component`, `--component` respectively) and fill both via a new `pathParams()` hook on `CrudListCommand`, `CrudGetCommand` and `CrudActionCommand`. **Breaking:** the previous `--name`-only invocation of these four commands is rejected by oclif at parse time. The remaining multi-param commands (`connection preview`, `data-graph data-by-id`, `profile calculated-insight`, `profile child`, `universal-id lookup`) now fail loudly with `DATA360_UNRESOLVED_PATH_PARAM` instead of silently issuing a malformed request.
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
