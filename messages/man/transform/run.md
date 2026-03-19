NAME
sf data360 transform run

SYNOPSIS
sf data360 transform run -o <org> --name <name>

DESCRIPTION
Run Data 360 transform.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-transforms/:dataTransformNameOrId/actions/run

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
