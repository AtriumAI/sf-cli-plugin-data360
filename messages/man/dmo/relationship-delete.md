NAME
sf data360 dmo relationship-delete

SYNOPSIS
sf data360 dmo relationship-delete -o <org> --name <name>

DESCRIPTION
Relationship delete Data 360 dmo.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
DELETE /ssot/data-model-objects/relationships/:name

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
