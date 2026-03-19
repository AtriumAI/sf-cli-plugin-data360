NAME
sf data360 query sql

SYNOPSIS
sf data360 query sql -o <org> --sql <sql>

DESCRIPTION
Execute Data 360 SQL.

FLAGS
--api-version Override API version (default: 66.0)
--sql SQL statement to execute
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

NOTES - Table names must be double-quoted: "ssot**Individual**dlm" - Use <> not != (strict SQL) - OFFSET requires ORDER BY

SEE ALSO
sf data360 query sqlv2
sf data360 query describe
sf data360 query async-create

TESTING
Unit tested: no
Live tested: yes (2026-03-18)
Smoke tested: yes
