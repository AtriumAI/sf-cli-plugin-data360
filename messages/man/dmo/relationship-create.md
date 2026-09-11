NAME
sf data360 dmo relationship-create

SYNOPSIS
sf data360 dmo relationship-create -o <org> --name <name> -f <file>

DESCRIPTION
Relationship create Data 360 dmo.

FLAGS
--api-version Override API version (default: 66.0)
--dataspace Data space name (default: default)
--definition-file Path to JSON definition file
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-model-objects/:dataModelObjectName/relationships?dataspace=<name>

NOTES - Use sourceObjectName/targetObjectName (not sourceEntity) - Field: relationshipOwner (singular) - Cardinality from source perspective: ManyToOne = many source per target - The definition-file body cannot name a data space: the API rejects a dataspace/dataSpace key with JSON_PARSER_ERROR "Unrecognized field" (live 2026-09-11), so --dataspace is the only channel (unlike data-action create, whose body does carry the key)

SEE ALSO
sf data360 dmo relationship-list

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
