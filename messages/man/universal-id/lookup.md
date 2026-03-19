NAME
sf data360 universal-id lookup

SYNOPSIS
sf data360 universal-id lookup -o <org> --name <name>

DESCRIPTION
Lookup Data 360 universal id.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/universalIdLookup/:entityName/:dataSourceId/:dataSourceObjectId/:sourceRecordId

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
