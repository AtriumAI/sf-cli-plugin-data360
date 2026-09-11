NAME
sf data360 dmo mapping-list

SYNOPSIS
sf data360 dmo mapping-list -o <org>

DESCRIPTION
List field mappings between a DLO and DMO.

FLAGS
--api-version Override API version (default: 66.0)
--dataspace Data space name (default: default)
--source Source DLO developer name
--target Target DMO developer name
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-model-object-mappings?dloDeveloperName=<dlo>&dmoDeveloperName=<dmo>&dataspace=<name>

NOTES

- Documented from API v61.0; a v66 failure was once observed on this request shape — if it returns errors, try --api-version 64.0
- Query params: dloDeveloperName + dmoDeveloperName
- Response nests fields in objectSourceTargetMaps[0].fieldMappings
- Returns the object-level developerName (objectSourceTargetMaps[0].developerName), the value mapping-update-field takes as --name

SEE ALSO
sf data360 dmo map-to-canonical
sf data360 dmo mapping-create

TESTING
Unit tested: yes
Live tested: yes (2026-03-18)
Smoke tested: yes
