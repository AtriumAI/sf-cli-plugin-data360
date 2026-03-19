NAME
sf data360 data-graph create

SYNOPSIS
sf data360 data-graph create -o <org> -f <file>

DESCRIPTION
Create Data 360 data graph.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-graphs

NOTES - Every node must have type: derived, bridge, standard, custom, calculated - All KQ and FK fields must be explicitly included - Without type, create succeeds but build silently fails

SEE ALSO
sf data360 data-graph get
sf data360 data-graph refresh

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
