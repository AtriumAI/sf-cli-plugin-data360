NAME
sf data360 identity-resolution list

SYNOPSIS
sf data360 identity-resolution list -o <org> [--all]

DESCRIPTION
List Data 360 identity resolution.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/identity-resolutions

NOTES - Shows totalUnifiedProfiles — fastest way to get unified profile counts - Columns: label, rulesetStatus, lastJobStatus, totalUnifiedProfiles, consolidationRate

SEE ALSO
sf data360 identity-resolution run
sf data360 identity-resolution create

TESTING
Unit tested: yes
Live tested: yes (2026-03-18)
Smoke tested: yes
