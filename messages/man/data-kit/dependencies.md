NAME
sf data360 data-kit dependencies

SYNOPSIS
sf data360 data-kit dependencies -o <org> --name <data-kit-name> --component <component-name>

DESCRIPTION
Dependencies Data 360 data kit.

FLAGS
--api-version Override API version (default: 66.0)
--component (required) Data kit component name
--name (required) Data kit name
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-kits/<data-kit-name>/components/<component-name>/dependencies

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
