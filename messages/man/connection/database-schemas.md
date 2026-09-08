NAME
sf data360 connection database-schemas

SYNOPSIS
sf data360 connection database-schemas -o <org> --name <connection-id>

DESCRIPTION
Database schemas Data 360 connection.

Lists the database schema names a database connection exposes. Use it to find
the schema that holds a source table before pointing a data stream at it.

FLAGS
--all (no effect) The endpoint returns every schema in one response, so there are no pages to follow
--api-version Override API version (default: 66.0)
--name (required) Connection ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/connections/<connection-id>/database-schemas

Request body: {"advancedAttributes": {}}
Response: the schema names are nested under "schemas", as bare strings rather
than objects; each is reported in a "name" column.

NOTES
--name takes a connection ID, not a connection name. This endpoint performs no
name-to-ID resolution, unlike "connection databases" and "connection objects".

The endpoint also accepts "advancedAttributes.databaseName" to scope the answer
to one database. No flag exposes it, so this command always sends an empty
"advancedAttributes". Whether the API accepts that is UNVERIFIED: the only
request body documented for this endpoint supplies "databaseName", and 400 is
among its documented responses. If a live call rejects the empty form, this
command needs a flag for that field before it can run at all.

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
