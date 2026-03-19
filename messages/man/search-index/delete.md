NAME
sf data360 search-index delete

SYNOPSIS
sf data360 search-index delete -o <org> --name <name>

DESCRIPTION
Delete a Data 360 search index by name or ID.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

NOTES - Auto-resolves developer name to record ID

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
