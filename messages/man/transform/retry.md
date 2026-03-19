NAME
sf data360 transform retry

SYNOPSIS
sf data360 transform retry -o <org> --name <name>

DESCRIPTION
Retry Data 360 transform.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-transforms/:dataTransformNameOrId/actions/retry

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
