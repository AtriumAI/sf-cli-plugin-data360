NAME
sf data360 dmo mapping-delete-fields

SYNOPSIS
sf data360 dmo mapping-delete-fields -o <org> --name <name>

DESCRIPTION
Mapping delete fields Data 360 dmo.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
DELETE /ssot/data-model-object-mappings/:objectSourceTargetMapDeveloperName/field-mappings

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
