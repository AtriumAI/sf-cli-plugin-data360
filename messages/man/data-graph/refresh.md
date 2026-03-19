NAME
sf data360 data-graph refresh

SYNOPSIS
sf data360 data-graph refresh -o <org> --name <name>

DESCRIPTION
Refresh Data 360 data graph.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-graphs/:dataGraphName/actions/refresh

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
