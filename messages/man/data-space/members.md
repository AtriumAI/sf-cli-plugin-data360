NAME
sf data360 data-space members

SYNOPSIS
sf data360 data-space members -o <org> [--all] --name <name>

DESCRIPTION
List members of a Data 360 data space.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-spaces/:idOrName/members

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
