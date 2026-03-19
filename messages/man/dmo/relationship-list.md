NAME
sf data360 dmo relationship-list

SYNOPSIS
sf data360 dmo relationship-list -o <org> [--all] --name <name>

DESCRIPTION
Relationship list Data 360 dmo.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-model-objects/:dataModelObjectName/relationships

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
