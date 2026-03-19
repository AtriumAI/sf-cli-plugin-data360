NAME
sf data360 dmo mapping-create

SYNOPSIS
sf data360 dmo mapping-create -o <org> -f <file>

DESCRIPTION
Mapping create Data 360 dmo.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-model-object-mappings

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
