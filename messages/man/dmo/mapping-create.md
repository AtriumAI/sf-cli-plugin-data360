NAME
sf data360 dmo mapping-create

SYNOPSIS
sf data360 dmo mapping-create -o <org> -f <file>

DESCRIPTION
Mapping create Data 360 dmo.

FLAGS
--api-version Override API version (default: 66.0)
--dataspace Data space name (default: default)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-model-object-mappings?dataspace=<name>

NOTES - The definition-file body cannot name a data space: the API rejects a dataspace/dataSpace key with JSON_PARSER_ERROR "Unrecognized field" (live 2026-09-11), so --dataspace is the only channel (unlike data-action create, whose body does carry the key)

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
