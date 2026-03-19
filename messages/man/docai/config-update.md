NAME
sf data360 docai config-update

SYNOPSIS
sf data360 docai config-update -o <org> --name <name> -f <file>

DESCRIPTION
Config update Data 360 docai.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
PATCH /ssot/document-processing/configurations/:idOrApiName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
