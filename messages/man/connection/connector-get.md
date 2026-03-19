NAME
sf data360 connection connector-get

SYNOPSIS
sf data360 connection connector-get -o <org> --name <name>

DESCRIPTION
Get details of a Data 360 connector type.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/connectors/:connectorType

NOTES - Connector type names differ: SalesforceCRM (catalog) vs SalesforceDotCom (connection)

TESTING
Unit tested: no
Live tested: yes (2026-03-18)
Smoke tested: yes
