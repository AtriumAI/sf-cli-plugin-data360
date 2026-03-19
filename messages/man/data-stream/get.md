NAME
sf data360 data-stream get

SYNOPSIS
sf data360 data-stream get -o <org> --name <name>

DESCRIPTION
Get a Data 360 data stream.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-streams/:recordIdOrDeveloperName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
