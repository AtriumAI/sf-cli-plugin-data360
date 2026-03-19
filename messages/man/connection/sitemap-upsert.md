NAME
sf data360 connection sitemap-upsert

SYNOPSIS
sf data360 connection sitemap-upsert -o <org> --name <name> -f <file>

DESCRIPTION
Sitemap upsert Data 360 connection.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
PUT /ssot/connections/:connectionId/sitemap

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
