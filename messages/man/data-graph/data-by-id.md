NAME
sf data360 data-graph data-by-id

SYNOPSIS
sf data360 data-graph data-by-id -o <org> --name <name>

DESCRIPTION
Data by id Data 360 data graph.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-graphs/data/:dataGraphEntityName/:id

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
