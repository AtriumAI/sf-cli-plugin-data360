NAME
sf data360 query sqlv2

SYNOPSIS
sf data360 query sqlv2 -o <org> --sql <sql>

DESCRIPTION
Execute Data 360 SQL via v2 query endpoint with pagination.

FLAGS
--api-version Override API version (default: 66.0)
--sql SQL statement to execute
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

NOTES - Returns nextBatchId for pagination - Use v2-batch --batch-id to fetch more - Preferred over LIMIT/OFFSET for large results

SEE ALSO
sf data360 query v2-batch
sf data360 query sql

TESTING
Unit tested: yes
Live tested: yes (2026-03-18)
Smoke tested: yes
