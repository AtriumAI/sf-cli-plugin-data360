NAME
sf data360 connection fields

SYNOPSIS
sf data360 connection fields -o <org> --name <connection-id> --object <resource-name>

DESCRIPTION
Fields Data 360 connection.

Lists the source fields a connection exposes for one of its objects. Use it to
confirm a field's exact API-layer spelling before naming it in a data stream.

FLAGS
--all (no effect) The endpoint returns every field in one response, so there are no pages to follow
--api-version Override API version (default: 66.0)
--name (required) Connection ID
--object (required) Source object (resource) name within the connection
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/connections/<connection-id>/objects/<resource-name>/fields

Request body: {"advancedAttributes": {}}
Response: the field list is nested under "fields", alongside a sibling "primaryKeys".

NOTES
Custom fields appear with a COLLAPSED suffix: a CRM field Foo\_\_c is listed as
Foo_c. That collapsed spelling is what the data-stream API expects in
--event-date-field and in a data stream's own field lists. Standard fields
(CreatedDate, SystemModstamp) are unchanged.

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
