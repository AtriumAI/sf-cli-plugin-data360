NAME
sf data360 dlo get

SYNOPSIS
sf data360 dlo get -o <org> --name <name>

DESCRIPTION
Get a Data 360 Data Lake Object (DLO).

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-lake-objects/:recordIdOrDeveloperName

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
