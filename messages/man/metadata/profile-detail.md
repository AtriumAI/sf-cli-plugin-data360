NAME
sf data360 metadata profile-detail

SYNOPSIS
sf data360 metadata profile-detail -o <org> --name <name>

DESCRIPTION
Profile detail Data 360 metadata.

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
