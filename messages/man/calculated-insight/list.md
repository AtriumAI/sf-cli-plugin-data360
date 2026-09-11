NAME
sf data360 calculated-insight list

SYNOPSIS
sf data360 calculated-insight list -o <org> [--all]

DESCRIPTION
List Data 360 calculated insight.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--dataspace Data space name (default: default)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/calculated-insights?dataspace=<name>

NOTES - Live-verified 2026-09-11 (andi-dc-sdo, v66.0): omitting --dataspace and passing --dataspace default return identical records, so the default is not a behaviour change

SEE ALSO
sf data360 calculated-insight run
sf data360 calculated-insight create

TESTING
Unit tested: yes
Live tested: yes (2026-03-18)
Smoke tested: yes
