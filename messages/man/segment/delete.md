NAME
sf data360 segment delete

SYNOPSIS
sf data360 segment delete -o <org> --name <name>

DESCRIPTION
Delete Data 360 segment.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
DELETE /ssot/segments/:segmentApiName

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
