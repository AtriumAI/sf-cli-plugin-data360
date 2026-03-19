NAME
sf data360 connection run-existing

SYNOPSIS
sf data360 connection run-existing -o <org> --name <name>

DESCRIPTION
Run existing Data 360 connection.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/connections/:connectionId/actions/:command

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
