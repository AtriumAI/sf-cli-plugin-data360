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
GET /ssot/data-model-objects/:dataModelObjectName/relationships

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
