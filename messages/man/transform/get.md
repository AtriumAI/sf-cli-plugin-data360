NAME
sf data360 transform get

SYNOPSIS
sf data360 transform get -o <org> --name <name>

DESCRIPTION
Get a Data 360 data transform.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-transforms/:dataTransformNameOrId

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
