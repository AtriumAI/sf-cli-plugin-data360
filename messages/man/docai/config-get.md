NAME
sf data360 docai config-get

SYNOPSIS
sf data360 docai config-get -o <org> --name <name>

DESCRIPTION
Config get Data 360 docai.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/document-processing/configurations/:idOrApiName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
