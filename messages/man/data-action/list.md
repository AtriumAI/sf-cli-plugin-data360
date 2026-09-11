NAME
sf data360 data-action list

SYNOPSIS
sf data360 data-action list -o <org> [--all]

DESCRIPTION
List Data 360 data action.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--dataspace Data space name (default: default)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-actions?dataspace=<name>

NOTES - Live-verified 2026-09-11 (andi-dc-sdo, v66.0): omitting --dataspace and passing --dataspace default return identical records, so the default is not a behaviour change

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
