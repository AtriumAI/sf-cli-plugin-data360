NAME
sf data360 dmo mapping-update-field

SYNOPSIS
sf data360 dmo mapping-update-field -o <org> --name <name>

DESCRIPTION
Mapping update field Data 360 dmo.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
PATCH /ssot/data-model-object-mappings/:objectSourceTargetMapDeveloperName/field-mappings/:fieldSourceTargetMapDeveloperName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
