NAME
sf data360 query describe

SYNOPSIS
sf data360 query describe -o <org>

DESCRIPTION
Describe Data 360 table columns.

FLAGS
--api-version Override API version (default: 66.0)
--table DMO or DLO table name
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

NOTES - Shows column names + types for any DMO/DLO - There is NO dmo describe command — use this instead

SEE ALSO
sf data360 dmo get
sf data360 query sql

TESTING
Unit tested: no
Live tested: yes (2026-03-18)
Smoke tested: yes
