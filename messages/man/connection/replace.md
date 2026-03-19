NAME
sf data360 connection replace

SYNOPSIS
sf data360 connection replace -o <org> --name <name> -f <file>

DESCRIPTION
Replace Data 360 connection.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
PUT /ssot/connections/:connectionId

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
