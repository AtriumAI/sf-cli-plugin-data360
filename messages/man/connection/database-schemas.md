NAME
sf data360 connection database-schemas

SYNOPSIS
sf data360 connection database-schemas -o <org> [--all] --name <name>

DESCRIPTION
Database schemas Data 360 connection.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/connections/:connectionId/database-schemas

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
