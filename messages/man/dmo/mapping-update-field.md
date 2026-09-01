NAME
sf data360 dmo mapping-update-field

SYNOPSIS
sf data360 dmo mapping-update-field -o <org> --name <object-mapping-developer-name> -f <file>

DESCRIPTION
Add or update field mappings on an existing DLO→DMO mapping. PATCHes the
field-mappings collection of the object-level mapping named by --name (its
developerName, from mapping-list or mapping-get). The definition file uses the
object-mapping request shape (sourceEntityDeveloperName,
targetEntityDeveloperName, fieldMapping[]); fieldMapping lists only the pairs
being added or changed — the API merges them into the existing set.

FLAGS
--api-version Override API version (default: 64.0)
--definition-file (required) Path to JSON definition file
--name Object-level mapping developer name (ObjectSourceTargetMap)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
PATCH /ssot/data-model-object-mappings/:objectSourceTargetMapDeveloperName/field-mappings

NOTES - Uses API v64.0 by default (v66 returns errors on this resource family) - --name is the ObjectSourceTargetMap developerName, not a field-mapping name - The definition body is merged into the existing field mappings, not replaced

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
