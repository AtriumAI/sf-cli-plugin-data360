NAME
sf data360 docai config-create

SYNOPSIS
sf data360 docai config-create -o <org> -f <file>

DESCRIPTION
Config create Data 360 docai.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/document-processing/configurations

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
