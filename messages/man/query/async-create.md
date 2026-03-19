NAME
sf data360 query async-create

SYNOPSIS
sf data360 query async-create -o <org> --sql <sql> -f <file>

DESCRIPTION
Create an async Data 360 SQL query job.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--sql SQL statement to execute
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

SEE ALSO
sf data360 query async-status
sf data360 query async-rows

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
