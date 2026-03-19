NAME
sf data360 segment publish

SYNOPSIS
sf data360 segment publish -o <org> --name <name>

DESCRIPTION
Publish a Data 360 segment.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

NOTES - Auto-resolves apiName/displayName to marketSegmentId - Triggers segment evaluation

SEE ALSO
sf data360 segment list
sf data360 segment count

TESTING
Unit tested: yes
Live tested: yes (2026-03-18)
Smoke tested: yes
