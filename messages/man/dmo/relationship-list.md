NAME
sf data360 dmo relationship-list

SYNOPSIS
sf data360 dmo relationship-list -o <org> [--all] --name <name>

DESCRIPTION
Relationship list Data 360 dmo.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--creation-type Filter by creation type, e.g. Standard or Custom
--dataspace Data space name (default: default)
--name Resource name or ID
--order-by Sort direction, asc or desc
--sort-by Sort field: DeveloperName, CreatedDate, LastModifiedDate or CreationType
--status Filter by status, e.g. Active or Inactive
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-model-objects/:dataModelObjectName/relationships?dataspace=<name>&creationType=<type>&status=<status>&sortBy=<field>&orderBy=<asc|desc>

NOTES - Unlike segment list, --order-by here takes a DIRECTION (asc or desc), not an order expression - --sort-by and --order-by are closed value sets; oclif rejects anything else before the request is sent - Live-verified 2026-09-11 (andi-dc-sdo, v66.0): omitting --dataspace and passing --dataspace default return identical records, so the default is not a behaviour change

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
