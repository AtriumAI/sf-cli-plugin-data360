NAME
sf data360 identity-resolution update

SYNOPSIS
sf data360 identity-resolution update -o <org> --name <name> -f <file>

DESCRIPTION
Update Data 360 identity resolution.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
PATCH /ssot/identity-resolutions/:identityResolution

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
