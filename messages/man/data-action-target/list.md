NAME
sf data360 data-action-target list

SYNOPSIS
sf data360 data-action-target list -o <org> [--all]

DESCRIPTION
List Data 360 data action target.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-action-targets

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
