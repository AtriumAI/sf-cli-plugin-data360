NAME
sf data360 profile calculated-insight

SYNOPSIS
sf data360 profile calculated-insight -o <org> --name <name>

DESCRIPTION
Calculated insight Data 360 profile.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/profile/:dataModelName/:id/calculated-insights/:ciName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
