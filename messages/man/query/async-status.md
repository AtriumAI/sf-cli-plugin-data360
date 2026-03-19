NAME
sf data360 query async-status

SYNOPSIS
sf data360 query async-status -o <org>

DESCRIPTION
Check status of an async Data 360 query job.

FLAGS
--api-version Override API version (default: 66.0)
--query-id Async query job ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

SEE ALSO
sf data360 query async-rows
sf data360 query async-cancel

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
