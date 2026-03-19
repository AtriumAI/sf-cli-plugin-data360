NAME
sf data360 segment get

SYNOPSIS
sf data360 segment get -o <org> --name <name>

DESCRIPTION
Get Data 360 segment.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/segments/:segmentApiNameOrId

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
