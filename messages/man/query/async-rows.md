NAME
sf data360 query async-rows

SYNOPSIS
sf data360 query async-rows -o <org>

DESCRIPTION
Fetch results from a completed async Data 360 query.

FLAGS
--api-version Override API version (default: 66.0)
--query-id Async query job ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

SEE ALSO
sf data360 query async-status

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
