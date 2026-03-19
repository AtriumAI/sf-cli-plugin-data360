NAME
sf data360 query async-cancel

SYNOPSIS
sf data360 query async-cancel -o <org>

DESCRIPTION
Cancel an async Data 360 query job.

FLAGS
--api-version Override API version (default: 66.0)
--query-id Async query job ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
