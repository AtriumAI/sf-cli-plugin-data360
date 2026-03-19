NAME
sf data360 docai config-run

SYNOPSIS
sf data360 docai config-run -o <org> --name <name>

DESCRIPTION
Config run Data 360 docai.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/document-processing/configurations/:idOrApiName/actions/run

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
