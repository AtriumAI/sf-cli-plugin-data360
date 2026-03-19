NAME
sf data360 dmo mapping-get

SYNOPSIS
sf data360 dmo mapping-get -o <org> --name <name>

DESCRIPTION
Mapping get Data 360 dmo.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-model-object-mappings/:objectSourceTargetMapDeveloperName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
