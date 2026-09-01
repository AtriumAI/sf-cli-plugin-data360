NAME
sf data360 dmo mapping-list

SYNOPSIS
sf data360 dmo mapping-list -o <org>

DESCRIPTION
List field mappings between a DLO and DMO.

FLAGS
--api-version Override API version (default: 64.0)
--source Source DLO developer name
--target Target DMO developer name
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-model-object-mappings

NOTES - Uses API v64.0 by default (v66 returns errors) - Query params: dloDeveloperName + dmoDeveloperName - Response nests fields in objectSourceTargetMaps[0].fieldMappings - Returns the object-level developerName (objectSourceTargetMaps[0].developerName), the value mapping-update-field takes as --name

SEE ALSO
sf data360 dmo map-to-canonical
sf data360 dmo mapping-create

TESTING
Unit tested: yes
Live tested: yes (2026-03-18)
Smoke tested: yes
