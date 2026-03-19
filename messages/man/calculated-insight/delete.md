NAME
sf data360 calculated-insight delete

SYNOPSIS
sf data360 calculated-insight delete -o <org> --name <name>

DESCRIPTION
Delete Data 360 calculated insight.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
DELETE /ssot/calculated-insights/:apiName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
