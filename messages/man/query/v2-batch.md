NAME
sf data360 query v2-batch

SYNOPSIS
sf data360 query v2-batch -o <org>

DESCRIPTION
Fetch next batch from a v2 query.

FLAGS
--api-version Override API version (default: 66.0)
--batch-id Next batch ID from v2 query
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

SEE ALSO
sf data360 query sqlv2

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
