NAME
sf data360 query vector

SYNOPSIS
sf data360 query vector -o <org>

DESCRIPTION
Run vector search on a Data 360 search index.

FLAGS
--api-version Override API version (default: 66.0)
--index Search index name
--limit Maximum results to return
--query Natural language query text
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

SEE ALSO
sf data360 search-index list
sf data360 query sql

TESTING
Unit tested: no
Live tested: yes (2026-03-18)
Smoke tested: yes
