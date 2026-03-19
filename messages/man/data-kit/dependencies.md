NAME
sf data360 data-kit dependencies

SYNOPSIS
sf data360 data-kit dependencies -o <org> --name <name>

DESCRIPTION
Dependencies Data 360 data kit.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-kits/:dataKitName/components/:componentName/dependencies

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
