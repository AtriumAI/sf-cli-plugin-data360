NAME
sf data360 activation list

SYNOPSIS
sf data360 activation list -o <org> [--all]

DESCRIPTION
List Data 360 activation.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/activations

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
