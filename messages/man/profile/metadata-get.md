NAME
sf data360 profile metadata-get

SYNOPSIS
sf data360 profile metadata-get -o <org> --name <name>

DESCRIPTION
Metadata get Data 360 profile.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/profile/metadata/:dataModelName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
