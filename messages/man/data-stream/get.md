NAME
sf data360 data-stream get

SYNOPSIS
sf data360 data-stream get -o <org> --name <name>

DESCRIPTION
Get a Data 360 data stream.

FLAGS
--api-version Override API version (default: 66.0)
--include-mappings Include the stream's source-to-DLO field mappings (default: off)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/data-streams/:recordIdOrDeveloperName?includeMappings=true

NOTES - mappings comes back as [] unless --include-mappings is passed; the flag alone is enough, --raw is not required

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
