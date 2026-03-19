NAME
sf data360 transform cancel

SYNOPSIS
sf data360 transform cancel -o <org> --name <name>

DESCRIPTION
Cancel Data 360 transform.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-transforms/:dataTransformNameOrId/actions/cancel

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
