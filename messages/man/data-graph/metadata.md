NAME
sf data360 data-graph metadata

SYNOPSIS
sf data360 data-graph metadata -o <org>

DESCRIPTION
Metadata Data 360 data graph.

FLAGS
--api-version Override API version (default: 66.0)
--dataspace Data space name (default: default)
--entity-name Restrict the read to one data graph entity
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-graphs/metadata?dataspace=<name>&dataGraphEntityName=<entity>

NOTES - Live-verified 2026-09-11 (andi-dc-sdo, v66.0): omitting --dataspace and passing --dataspace default return identical records, so the default is not a behaviour change

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
