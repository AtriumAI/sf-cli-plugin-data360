NAME
sf data360 segment create

SYNOPSIS
sf data360 segment create -o <org> -f <file>

DESCRIPTION
Create Data 360 segment.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/segments

NOTES - Often fails on v66 — use --api-version 64.0 - SQL cannot JOIN \_\_cio objects - Use <> not != (strict SQL)

SEE ALSO
sf data360 segment publish
sf data360 segment list

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
