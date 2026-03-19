NAME
sf data360 connection schema-get

SYNOPSIS
sf data360 connection schema-get -o <org> --name <name>

DESCRIPTION
Schema get Data 360 connection.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/connections/:connectionId/schema

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
