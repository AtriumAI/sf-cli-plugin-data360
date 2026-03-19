NAME
sf data360 data-stream create

SYNOPSIS
sf data360 data-stream create -o <org> -f <file>

DESCRIPTION
Create Data 360 data stream.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-streams

SEE ALSO
sf data360 data-stream create-from-object
sf data360 data-stream list

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
