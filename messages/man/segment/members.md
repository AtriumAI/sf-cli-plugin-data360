NAME
sf data360 segment members

SYNOPSIS
sf data360 segment members -o <org> --name <name>

DESCRIPTION
Members Data 360 segment.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/segments/:segmentApiName/members

NOTES - Returns only opaque IDs — not useful for names - Instead: JOIN membership table to unified DMO via SQL - Join key: sm.Id**c = ui.ssot**Id\_\_c

SEE ALSO
sf data360 segment list
sf data360 query sql

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
