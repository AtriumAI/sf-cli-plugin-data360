NAME
sf data360 transform validate

SYNOPSIS
sf data360 transform validate -o <org> --name <name>

DESCRIPTION
Validate a Data 360 data transform.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-transforms/:dataTransformNameOrId/actions/validate

NOTES - Endpoint: /data-transforms/{name}/actions/validate

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
