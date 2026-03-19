NAME
sf data360 transform schedule-set

SYNOPSIS
sf data360 transform schedule-set -o <org> --name <name> -f <file>

DESCRIPTION
Schedule set Data 360 transform.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
PUT /ssot/data-transforms/:dataTransformNameOrId/schedule

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
