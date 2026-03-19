NAME
sf data360 data-space members-upsert

SYNOPSIS
sf data360 data-space members-upsert -o <org> --name <name> -f <file>

DESCRIPTION
Members upsert Data 360 data space.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
PUT /ssot/data-spaces/:idOrName/members

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
