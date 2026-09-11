NAME
sf data360 segment create

SYNOPSIS
sf data360 segment create -o <org> -f <file>

DESCRIPTION
Create Data 360 segment.

FLAGS
--api-version Override API version (default: 66.0)
--dataspace Data space name (default: default)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/segments?dataspace=<name>

NOTES - Often fails on v66 — use --api-version 64.0 - SQL cannot JOIN \_\_cio objects - Use <> not != (strict SQL) - The definition-file body cannot name a data space: the API rejects a dataspace/dataSpace key with JSON_PARSER_ERROR "Unrecognized field" (live 2026-09-11), so --dataspace is the only channel (unlike data-action create, whose body does carry the key)

SEE ALSO
sf data360 segment publish
sf data360 segment list

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
