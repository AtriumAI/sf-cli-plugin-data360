NAME
sf data360 search-index list

SYNOPSIS
sf data360 search-index list -o <org> [--all]

DESCRIPTION
List Data 360 search indexes.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/search-index

SEE ALSO
sf data360 search-index get
sf data360 query vector

TESTING
Unit tested: no
Live tested: yes (2026-03-18)
Smoke tested: yes
