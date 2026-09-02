NAME
sf data360 connection run-existing

SYNOPSIS
sf data360 connection run-existing -o <org> --name <connection-id> --command <action>

DESCRIPTION
Run existing Data 360 connection.

FLAGS
--api-version Override API version (default: 66.0)
--command (required) Connection action to run (the :command path segment)
--name (required) Connection ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/connections/<connection-id>/actions/<command>

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
