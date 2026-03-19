NAME
sf data360 connection get

SYNOPSIS
sf data360 connection get -o <org> --name <name>

DESCRIPTION
Get a Data 360 connection by name or ID.

FLAGS
--api-version Override API version (default: 66.0)
--connector-type Connector type (e.g., SalesforceDotCom)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

NOTES - Auto-resolves connection name to record ID - Requires --connector-type for name resolution

SEE ALSO
sf data360 connection list
sf data360 connection objects

TESTING
Unit tested: yes
Live tested: yes (2026-03-18)
Smoke tested: yes
