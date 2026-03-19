NAME
sf data360 connection objects

SYNOPSIS
sf data360 connection objects -o <org> [--all] --name <name>

DESCRIPTION
List objects for a Data 360 connection.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--connector-type Connector type (e.g., SalesforceDotCom)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/connections/:connectionId/objects

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
