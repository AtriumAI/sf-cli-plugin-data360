NAME
sf data360 data-action list

SYNOPSIS
sf data360 data-action list -o <org> [--all]

DESCRIPTION
List Data 360 data action.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-actions

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
