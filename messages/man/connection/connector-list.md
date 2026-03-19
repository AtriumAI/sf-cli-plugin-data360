NAME
sf data360 connection connector-list

SYNOPSIS
sf data360 connection connector-list -o <org> [--all]

DESCRIPTION
Connector list Data 360 connection.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/connectors

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
