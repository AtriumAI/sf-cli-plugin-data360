NAME
sf data360 identity-resolution delete

SYNOPSIS
sf data360 identity-resolution delete -o <org> --name <name>

DESCRIPTION
Delete Data 360 identity resolution.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
DELETE /ssot/identity-resolutions/:identityResolution

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
