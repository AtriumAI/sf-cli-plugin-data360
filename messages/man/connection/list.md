NAME
sf data360 connection list

SYNOPSIS
sf data360 connection list -o <org> [--all]

DESCRIPTION
List Data 360 connections by connector type.

FLAGS
--all Fetch all pages of results
--api-version Override API version (default: 66.0)
--connector-type Connector type (e.g., SalesforceDotCom)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/connections

NOTES - REQUIRES --connector-type flag (API mandates it) - Common types: SalesforceDotCom, REDSHIFT, S3, SFTP - Check data-stream list first to discover types in use

SEE ALSO
sf data360 connection get
sf data360 data-stream list

TESTING
Unit tested: no
Live tested: yes (2026-03-18)
Smoke tested: yes
