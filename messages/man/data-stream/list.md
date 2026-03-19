NAME
sf data360 data-stream list

SYNOPSIS
sf data360 data-stream list -o <org> [--all]

DESCRIPTION
List Data 360 data streams.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-streams

NOTES - Does NOT include record counts - Use SQL COUNT per DLO for record counts - External/NONE = BYOL never accelerated

SEE ALSO
sf data360 data-stream get
sf data360 connection list

TESTING
Unit tested: no
Live tested: yes (2026-03-18)
Smoke tested: yes
