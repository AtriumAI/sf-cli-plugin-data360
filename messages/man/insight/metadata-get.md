NAME
sf data360 insight metadata-get

SYNOPSIS
sf data360 insight metadata-get -o <org> --name <name>

DESCRIPTION
Metadata get Data 360 insight.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/insight/metadata/:ciName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
