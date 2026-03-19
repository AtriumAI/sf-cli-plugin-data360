NAME
sf data360 calculated-insight run

SYNOPSIS
sf data360 calculated-insight run -o <org> --name <name>

DESCRIPTION
Run Data 360 calculated insight.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/calculated-insights/:apiName/actions/run

NOTES - CI object name needs \_\_cio suffix

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
