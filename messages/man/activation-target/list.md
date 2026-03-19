NAME
sf data360 activation-target list

SYNOPSIS
sf data360 activation-target list -o <org> [--all]

DESCRIPTION
List Data 360 activation target.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/activation-targets

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
