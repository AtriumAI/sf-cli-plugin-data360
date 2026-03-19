NAME
sf data360 segment update

SYNOPSIS
sf data360 segment update -o <org> --name <name> -f <file>

DESCRIPTION
Update Data 360 segment.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
PATCH /ssot/segments/:segmentApiName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
