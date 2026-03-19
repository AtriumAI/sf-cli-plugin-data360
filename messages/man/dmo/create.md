NAME
sf data360 dmo create

SYNOPSIS
sf data360 dmo create -o <org> -f <file>

DESCRIPTION
Create Data 360 dmo.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-model-objects

SEE ALSO
sf data360 dmo create-from-dlo
sf data360 dmo list

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
