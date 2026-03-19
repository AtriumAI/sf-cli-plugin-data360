NAME
sf data360 query sql-v1

SYNOPSIS
sf data360 query sql-v1 -o <org> --sql <sql>

DESCRIPTION
Execute Data 360 SQL via v1 query endpoint.

FLAGS
--api-version Override API version (default: 66.0)
--sql SQL statement to execute
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

TESTING
Unit tested: no
Live tested: yes (2026-03-18)
Smoke tested: yes
