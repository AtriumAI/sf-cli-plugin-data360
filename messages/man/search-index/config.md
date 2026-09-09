NAME
sf data360 search-index config

SYNOPSIS
sf data360 search-index config -o <org>

DESCRIPTION
Get the org-level semantic search configuration: the supported chunking strategies and
the per-file-extension defaults. It is not scoped to one search index, so there is no
--name.

FLAGS
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/search-index/config

NOTES

- Available from API v60.0
- The whole configuration arrives as one JSON string under "config" — read it with --json or --raw
- For a single index definition use: sf data360 search-index get --name <index>

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
