NAME
sf data360 transform create

SYNOPSIS
sf data360 transform create -o <org> -f <file>

DESCRIPTION
Create Data 360 transform.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-transforms

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
