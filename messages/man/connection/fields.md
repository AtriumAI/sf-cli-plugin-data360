NAME
sf data360 connection fields

SYNOPSIS
sf data360 connection fields -o <org> [--all] --name <connection-id> --object <resource-name>

DESCRIPTION
Fields Data 360 connection.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--name (required) Connection ID
--object (required) Source object (resource) name within the connection
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/connections/<connection-id>/objects/<resource-name>/fields

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
