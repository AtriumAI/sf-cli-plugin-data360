NAME
sf data360 data-graph get

SYNOPSIS
sf data360 data-graph get -o <org> --name <name>

DESCRIPTION
Get Data 360 data graph.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-graphs/:dataGraphName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
