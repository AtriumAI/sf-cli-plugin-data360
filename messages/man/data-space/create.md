NAME
sf data360 data-space create

SYNOPSIS
sf data360 data-space create -o <org> -f <file>

DESCRIPTION
Create Data 360 data space.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-spaces

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
