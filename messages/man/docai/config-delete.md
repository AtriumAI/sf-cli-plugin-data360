NAME
sf data360 docai config-delete

SYNOPSIS
sf data360 docai config-delete -o <org> --name <name>

DESCRIPTION
Config delete Data 360 docai.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
DELETE /ssot/document-processing/configurations/:idOrApiName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
