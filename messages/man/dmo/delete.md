NAME
sf data360 dmo delete

SYNOPSIS
sf data360 dmo delete -o <org> --name <name>

DESCRIPTION
Delete Data 360 dmo.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
DELETE /ssot/data-model-objects/:dataModelObjectName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
