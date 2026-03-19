NAME
sf data360 dmo relationship-create

SYNOPSIS
sf data360 dmo relationship-create -o <org> --name <name> -f <file>

DESCRIPTION
Relationship create Data 360 dmo.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-model-objects/:dataModelObjectName/relationships

NOTES - Use sourceObjectName/targetObjectName (not sourceEntity) - Field: relationshipOwner (singular) - Cardinality from source perspective: ManyToOne = many source per target

SEE ALSO
sf data360 dmo relationship-list

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
