NAME
sf data360 segment deactivate-by-id

SYNOPSIS
sf data360 segment deactivate-by-id -o <org> --name <name>

DESCRIPTION
Deactivate by id Data 360 segment.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/segments/:segmentId/actions/deactivate

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
