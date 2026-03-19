NAME
sf data360 data-kit undeploy

SYNOPSIS
sf data360 data-kit undeploy -o <org> --name <name>

DESCRIPTION
Undeploy Data 360 data kit.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-kits/:dataKitName/undeploy

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
