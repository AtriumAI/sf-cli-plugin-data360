NAME
sf data360 segment list

SYNOPSIS
sf data360 segment list -o <org> [--all]

DESCRIPTION
List Data 360 segment.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/segments

NOTES - Shows lastSegmentMemberCount for each segment - Columns: apiName, displayName, segmentStatus, segmentType, publishStatus, members

SEE ALSO
sf data360 segment publish
sf data360 segment create
sf data360 segment members

TESTING
Unit tested: yes
Live tested: yes (2026-03-18)
Smoke tested: yes
