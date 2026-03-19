NAME
sf data360 connection fields

SYNOPSIS
sf data360 connection fields -o <org> [--all] --name <name>

DESCRIPTION
Fields Data 360 connection.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/connections/:connectionId/objects/:resourceName/fields

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
