NAME
sf data360 segment count

SYNOPSIS
sf data360 segment count -o <org> --name <name>

DESCRIPTION
Count Data 360 segment.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/segments/:segmentApiName/actions/count

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
