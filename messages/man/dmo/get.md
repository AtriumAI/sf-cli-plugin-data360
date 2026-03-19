NAME
sf data360 dmo get

SYNOPSIS
sf data360 dmo get -o <org> --name <name>

DESCRIPTION
Get Data 360 dmo.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-model-objects/:dataModelObjectName

SEE ALSO
sf data360 dmo list
sf data360 query describe

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
