NAME
sf data360 data-stream run

SYNOPSIS
sf data360 data-stream run -o <org> --name <name>

DESCRIPTION
Run Data 360 data stream.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-streams/:recordIdOrDeveloperName/actions/run

NOTES - CRM connector (SalesforceDotCom) cannot be run manually - CRM streams sync on platform schedule (~10-15 min)

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
