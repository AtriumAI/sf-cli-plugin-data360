NAME
sf data360 data-space member-get

SYNOPSIS
sf data360 data-space member-get -o <org> --name <name>

DESCRIPTION
Get a member of a Data 360 data space.

FLAGS
--api-version Override API version (default: 66.0)
--member Member object name
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-spaces/:idOrName/members/:dataSpaceMemberObjectName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
