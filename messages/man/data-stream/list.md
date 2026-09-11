NAME
sf data360 data-stream list

SYNOPSIS
sf data360 data-stream list -o <org> [--all]

DESCRIPTION
List Data 360 data streams.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--connection-name Restrict the list to one connection
--include-mappings Include each stream's source-to-DLO field mappings (default: off)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-streams?connectionName=<name>&includeMappings=true

NOTES - Does NOT include record counts - Use SQL COUNT per DLO for record counts - External/NONE = BYOL never accelerated - mappings comes back as [] unless --include-mappings is passed; the flag alone is enough, --raw is not required

SEE ALSO
sf data360 data-stream get
sf data360 connection list

TESTING
Unit tested: yes
Live tested: yes (2026-03-18)
Smoke tested: yes
