NAME
sf data360 transform schedule-get

SYNOPSIS
sf data360 transform schedule-get -o <org> --name <name>

DESCRIPTION
Schedule get Data 360 transform.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-transforms/:dataTransformNameOrId/schedule

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
