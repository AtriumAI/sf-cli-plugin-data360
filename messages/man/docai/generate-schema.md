NAME
sf data360 docai generate-schema

SYNOPSIS
sf data360 docai generate-schema -o <org> --name <name>

DESCRIPTION
Generate schema for a Document AI configuration.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/document-processing/configurations/:idOrApiName/actions/generate-schema

NOTES - Endpoint: /document-processing/configurations/{name}/actions/generate-schema

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
