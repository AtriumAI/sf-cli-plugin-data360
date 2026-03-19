NAME
sf data360 calculated-insight list

SYNOPSIS
sf data360 calculated-insight list -o <org> [--all]

DESCRIPTION
List Data 360 calculated insight.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/calculated-insights

SEE ALSO
sf data360 calculated-insight run
sf data360 calculated-insight create

TESTING
Unit tested: no
Live tested: yes (2026-03-18)
Smoke tested: yes
