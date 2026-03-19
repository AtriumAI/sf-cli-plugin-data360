NAME
sf data360 docai config-list

SYNOPSIS
sf data360 docai config-list -o <org> [--all]

DESCRIPTION
Config list Data 360 docai.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/document-processing/configurations

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
