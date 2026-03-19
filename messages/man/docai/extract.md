NAME
sf data360 docai extract

SYNOPSIS
sf data360 docai extract -o <org> -f <file>

DESCRIPTION
Extract Data 360 docai.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/document-processing/actions/extract-data

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
