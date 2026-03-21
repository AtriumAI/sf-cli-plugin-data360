# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
