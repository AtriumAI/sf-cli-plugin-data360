NAME
sf data360 data-action-target generate-key

SYNOPSIS
sf data360 data-action-target generate-key -o <org> --name <name> -f <file>

DESCRIPTION
Generate key Data 360 data action target.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-action-targets/:apiName/signing-key

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
