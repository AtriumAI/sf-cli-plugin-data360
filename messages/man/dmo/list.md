NAME
sf data360 dmo list

SYNOPSIS
sf data360 dmo list -o <org> [--all]

DESCRIPTION
List Data 360 Data Model Objects (DMOs).

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-model-objects

NOTES - Without --all, only 50 DMOs returned (API page size is 50) - Unified DMOs from identity resolution are often past position 50 - Use --all when searching by name

SEE ALSO
sf data360 dmo get
sf data360 query describe
sf data360 dmo mapping-list

TESTING
Unit tested: yes
Live tested: yes (2026-03-18)
Smoke tested: yes
