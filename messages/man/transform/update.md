NAME
sf data360 transform update

SYNOPSIS
sf data360 transform update -o <org> --name <name> -f <file>

DESCRIPTION
Update Data 360 transform.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
PUT /ssot/data-transforms/:dataTransformNameOrId

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
